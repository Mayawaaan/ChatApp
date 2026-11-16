import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary, { isCloudinaryConfigured } from "../lib/cloudinary.js";
import { emitToUser } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const [filteredUsers, lastMessagesAgg, unreadAgg] = await Promise.all([
      User.find({ _id: { $ne: loggedInUserId } })
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .lean(),
      Message.aggregate([
        {
          $match: {
            $or: [
              { senderId: loggedInUserId },
              { receiverId: loggedInUserId },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            partnerId: {
              $cond: [
                { $eq: ["$senderId", loggedInUserId] },
                "$receiverId",
                "$senderId",
              ],
            },
            doc: "$$ROOT",
          },
        },
        {
          $group: {
            _id: "$partnerId",
            lastMessage: { $first: "$doc" },
          },
        },
      ]),
      Message.aggregate([
        {
          $match: {
            receiverId: loggedInUserId,
            isRead: false,
          },
        },
        {
          $group: {
            _id: "$senderId",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const lastMessageByPartner = new Map(
      lastMessagesAgg.map((entry) => [String(entry._id), entry.lastMessage])
    );
    const unreadBySender = new Map(
      unreadAgg.map((entry) => [String(entry._id), entry.count])
    );

    const enrichedUsers = filteredUsers.map((u) => {
      const id = String(u._id);
      return {
        ...u,
        lastMessage: lastMessageByPartner.get(id) || null,
        unreadCount: unreadBySender.get(id) || 0,
      };
    });

    res.status(200).json(enrichedUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      return res.status(400).json({ error: "Invalid conversation user ID" });
    }

    const searchQuery =
      typeof req.query.q === "string" ? req.query.q.trim() : "";
    const isPaginated = req.query.paginated === "1";

    // Mark incoming unread messages as read when opening the conversation unless disabled by user preference
    if (!req.query.before && !searchQuery && req.query.markRead !== "0") {
      const readAt = new Date();
      const readResult = await Message.updateMany(
        { senderId: userToChatId, receiverId: myId, isRead: false },
        { $set: { isRead: true, readAt } }
      );
      if (readResult.modifiedCount > 0) {
        emitToUser(userToChatId, "messagesRead", {
          readerId: String(myId),
          readAt,
        });
      }
    }

    const baseFilter = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    };

    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = await Message.find({
        ...baseFilter,
        text: { $regex: new RegExp(escaped, "i") },
      })
        .sort({ createdAt: 1 })
        .limit(100);
      return res.status(200).json(matches);
    }

    if (isPaginated) {
      const limit = Math.min(Math.max(Number(req.query.limit) || 40, 1), 100);
      const filter = { ...baseFilter };
      if (req.query.before) {
        const beforeDate = new Date(req.query.before);
        if (!Number.isNaN(beforeDate.getTime())) {
          filter.createdAt = { $lt: beforeDate };
        }
      }

      const docs = await Message.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit + 1);

      const hasMore = docs.length > limit;
      const sliced = hasMore ? docs.slice(0, limit) : docs;
      sliced.reverse();

      return res.status(200).json({ messages: sliced, hasMore });
    }

    const messages = await Message.find(baseFilter).sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const readAt = new Date();
    const result = await Message.updateMany(
      { senderId, receiverId: myId, isRead: false },
      { $set: { isRead: true, readAt } }
    );

    if (result.modifiedCount > 0) {
      emitToUser(senderId, "messagesRead", {
        readerId: String(myId),
        readAt,
      });
    }

    return res.status(200).json({ updatedCount: result.modifiedCount, readAt });
  } catch (error) {
    console.log("Error in markMessagesAsRead controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "Invalid recipient ID" });
    }

    const cleanText = typeof text === "string" ? text.trim() : "";
    if (!cleanText && !image) {
      return res
        .status(400)
        .json({ error: "Message text or image is required" });
    }

    let imageUrl;
    if (image) {
      if (!isCloudinaryConfigured()) {
        return res.status(503).json({
          error:
            "Image attachments require valid Cloudinary credentials in backend/.env.",
        });
      }
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: cleanText,
      image: imageUrl,
      isRead: false,
    });

    await newMessage.save();

    emitToUser(receiverId, "newMessage", newMessage);
    emitToUser(senderId, "newMessage", newMessage);

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }
    if (!text) {
      return res.status(400).json({ error: "Message text cannot be empty" });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (String(message.senderId) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ error: "You can only edit your own messages" });
    }

    message.text = text;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    emitToUser(message.receiverId, "messageUpdated", message);
    emitToUser(message.senderId, "messageUpdated", message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("Error in editMessage controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (String(message.senderId) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ error: "You can only delete your own messages" });
    }

    const payload = {
      messageId: String(message._id),
      senderId: String(message.senderId),
      receiverId: String(message.receiverId),
    };

    await message.deleteOne();

    emitToUser(payload.receiverId, "messageDeleted", payload);
    emitToUser(payload.senderId, "messageDeleted", payload);

    return res.status(200).json(payload);
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const emoji =
      typeof req.body?.emoji === "string" ? req.body.emoji.trim() : "";
    const userId = String(req.user._id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }
    if (!emoji || emoji.length > 16) {
      return res.status(400).json({ error: "Valid reaction emoji is required" });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const isParticipant =
      String(message.senderId) === userId ||
      String(message.receiverId) === userId;
    if (!isParticipant) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const existingIdx = message.reactions.findIndex(
      (r) => String(r.userId) === userId && r.emoji === emoji
    );

    if (existingIdx !== -1) {
      message.reactions.splice(existingIdx, 1);
    } else {
      message.reactions.push({ userId: req.user._id, emoji });
    }

    await message.save();

    emitToUser(message.receiverId, "messageUpdated", message);
    emitToUser(message.senderId, "messageUpdated", message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("Error in toggleReaction controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
