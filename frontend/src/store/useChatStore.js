import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import { usePreferencesStore } from "./usePreferencesStore.js";
import { getErrorMessage } from "../lib/utils.js";

const MAX_SEEN_IDS = 300;
const seenMessageIds = new Set();

const recordMessageId = (id) => {
  if (!id) return false;
  if (seenMessageIds.has(id)) return true;
  seenMessageIds.add(id);
  if (seenMessageIds.size > MAX_SEEN_IDS) {
    const oldest = seenMessageIds.values().next().value;
    seenMessageIds.delete(oldest);
  }
  return false;
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isLoadingMoreMessages: false,
  hasMoreMessages: false,
  isSendingMessage: false,
  usersError: null,
  messagesError: null,
  sessionUnreadByUser: {},
  sessionLastMessageByUser: {},

  getUsers: async () => {
    set({ isUsersLoading: true, usersError: null });
    try {
      const res = await axiosInstance.get("/message/users");
      const users = res.data || [];

      const unreadMap = { ...get().sessionUnreadByUser };
      const lastMsgMap = { ...get().sessionLastMessageByUser };

      for (const u of users) {
        if (typeof u.unreadCount === "number") {
          unreadMap[u._id] = u.unreadCount;
        }
        if (u.lastMessage) {
          lastMsgMap[u._id] = u.lastMessage;
        }
      }

      set({
        users,
        sessionUnreadByUser: unreadMap,
        sessionLastMessageByUser: lastMsgMap,
      });
    } catch (error) {
      const msg = getErrorMessage(error, "Unable to load conversations");
      set({ usersError: msg });
      toast.error(msg);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({
      isMessagesLoading: true,
      messagesError: null,
      hasMoreMessages: false,
    });
    try {
      const sendReadReceipts = usePreferencesStore.getState().sendReadReceipts;
      const res = await axiosInstance.get(
        `/message/${userId}?paginated=1&limit=40${
          sendReadReceipts ? "" : "&markRead=0"
        }`
      );
      const fetched = Array.isArray(res.data)
        ? res.data
        : res.data?.messages || [];
      const hasMore = Array.isArray(res.data)
        ? false
        : Boolean(res.data?.hasMore);

      for (const m of fetched) {
        recordMessageId(m._id);
      }
      const lastMsg = fetched[fetched.length - 1];

      set((state) => ({
        messages: fetched,
        hasMoreMessages: hasMore,
        sessionUnreadByUser: { ...state.sessionUnreadByUser, [userId]: 0 },
        sessionLastMessageByUser: lastMsg
          ? { ...state.sessionLastMessageByUser, [userId]: lastMsg }
          : state.sessionLastMessageByUser,
      }));
    } catch (error) {
      const msg = getErrorMessage(error, "Unable to load messages");
      set({ messagesError: msg });
      toast.error(msg);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  loadOlderMessages: async () => {
    const { selectedUser, messages, hasMoreMessages, isLoadingMoreMessages } =
      get();
    if (
      !selectedUser ||
      !hasMoreMessages ||
      isLoadingMoreMessages ||
      messages.length === 0
    ) {
      return 0;
    }

    const oldestTimestamp = messages[0].createdAt;
    set({ isLoadingMoreMessages: true });

    try {
      const res = await axiosInstance.get(
        `/message/${selectedUser._id}?paginated=1&limit=40&before=${encodeURIComponent(
          oldestTimestamp
        )}`
      );
      const older = res.data?.messages || [];
      const hasMore = Boolean(res.data?.hasMore);

      for (const m of older) {
        recordMessageId(m._id);
      }

      set((state) => {
        const existingIds = new Set(state.messages.map((m) => m._id));
        const uniqueOlder = older.filter((m) => !existingIds.has(m._id));
        return {
          messages: [...uniqueOlder, ...state.messages],
          hasMoreMessages: hasMore,
        };
      });

      return older.length;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load older messages"));
      return 0;
    } finally {
      set({ isLoadingMoreMessages: false });
    }
  },

  searchConversationMessages: async (userId, query) => {
    const res = await axiosInstance.get(
      `/message/${userId}?q=${encodeURIComponent(query)}`
    );
    return res.data || [];
  },

  markConversationRead: async (userId) => {
    if (!userId) return;
    if (!usePreferencesStore.getState().sendReadReceipts) {
      set((state) => ({
        sessionUnreadByUser: { ...state.sessionUnreadByUser, [userId]: 0 },
      }));
      return;
    }
    try {
      await axiosInstance.patch(`/message/read/${userId}`);
      set((state) => ({
        sessionUnreadByUser: { ...state.sessionUnreadByUser, [userId]: 0 },
      }));
    } catch {
      // Non-critical background sync
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser || get().isSendingMessage) return false;

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      recordMessageId(res.data._id);
      set((state) => ({
        messages: state.messages.some((m) => m._id === res.data._id)
          ? state.messages
          : [...state.messages, res.data],
        sessionLastMessageByUser: {
          ...state.sessionLastMessageByUser,
          [selectedUser._id]: res.data,
        },
      }));
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send message"));
      return false;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  editMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.patch(`/message/${messageId}`, { text });
      get().applyMessageUpdated(res.data);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to edit message"));
      return false;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/message/${messageId}`);
      get().applyMessageDeleted(res.data);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete message"));
      return false;
    }
  },

  toggleReaction: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(`/message/${messageId}/react`, {
        emoji,
      });
      get().applyMessageUpdated(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update reaction"));
    }
  },

  applyMessageUpdated: (updatedMessage) => {
    if (!updatedMessage?._id) return;
    const authUser = useAuthStore.getState().authUser;
    const partnerId =
      updatedMessage.senderId === authUser?._id
        ? updatedMessage.receiverId
        : updatedMessage.senderId;

    set((state) => {
      const nextMessages = state.messages.map((m) =>
        m._id === updatedMessage._id ? updatedMessage : m
      );
      const currentLast = state.sessionLastMessageByUser[partnerId];
      const nextLast =
        currentLast?._id === updatedMessage._id
          ? updatedMessage
          : currentLast;
      return {
        messages: nextMessages,
        sessionLastMessageByUser: nextLast
          ? { ...state.sessionLastMessageByUser, [partnerId]: nextLast }
          : state.sessionLastMessageByUser,
      };
    });
  },

  applyMessageDeleted: ({ messageId, senderId, receiverId }) => {
    if (!messageId) return;
    const authUser = useAuthStore.getState().authUser;
    const partnerId = senderId === authUser?._id ? receiverId : senderId;

    set((state) => {
      const nextMessages = state.messages.filter((m) => m._id !== messageId);
      const nextLastMap = { ...state.sessionLastMessageByUser };
      if (nextLastMap[partnerId]?._id === messageId) {
        if (state.selectedUser?._id === partnerId) {
          nextLastMap[partnerId] = nextMessages[nextMessages.length - 1] || null;
        } else {
          delete nextLastMap[partnerId];
        }
      }
      return {
        messages: nextMessages,
        sessionLastMessageByUser: nextLastMap,
      };
    });
  },

  applyMessagesRead: ({ readerId, readAt }) => {
    if (!readerId) return;
    set((state) => ({
      messages: state.messages.map((m) =>
        m.receiverId === readerId && !m.isRead
          ? { ...m, isRead: true, readAt }
          : m
      ),
    }));
  },

  processIncomingSocketMessage: (newMessage, { isChatActiveAndVisible }) => {
    if (!newMessage?._id) return { isDuplicate: false };
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) return { isDuplicate: false };

    const alreadySeen = recordMessageId(newMessage._id);
    if (alreadySeen) return { isDuplicate: true };

    const isOwnMessage = newMessage.senderId === authUser._id;
    const {
      selectedUser,
      messages,
      sessionUnreadByUser,
      sessionLastMessageByUser,
    } = get();

    // Sync own messages sent from another open tab/device
    if (isOwnMessage) {
      const partnerId = newMessage.receiverId;
      const isViewingPartner = selectedUser?._id === partnerId;
      set({
        messages:
          isViewingPartner && !messages.some((m) => m._id === newMessage._id)
            ? [...messages, newMessage]
            : messages,
        sessionLastMessageByUser: {
          ...sessionLastMessageByUser,
          [partnerId]: newMessage,
        },
      });
      return { isDuplicate: false, isOwnMessage: true };
    }

    const isFromSelectedUser = selectedUser?._id === newMessage.senderId;
    const nextMessages = isFromSelectedUser
      ? messages.some((m) => m._id === newMessage._id)
        ? messages
        : [...messages, newMessage]
      : messages;

    const shouldIncrementUnread = !(isFromSelectedUser && isChatActiveAndVisible);
    const currentUnread = sessionUnreadByUser[newMessage.senderId] || 0;

    set({
      messages: nextMessages,
      sessionLastMessageByUser: {
        ...sessionLastMessageByUser,
        [newMessage.senderId]: newMessage,
      },
      sessionUnreadByUser: shouldIncrementUnread
        ? {
            ...sessionUnreadByUser,
            [newMessage.senderId]: currentUnread + 1,
          }
        : {
            ...sessionUnreadByUser,
            [newMessage.senderId]: 0,
          },
    });

    return {
      isDuplicate: false,
      isOwnMessage: false,
      isFromSelectedUser,
    };
  },

  clearUnreadForUser: (userId) => {
    if (!userId) return;
    set((state) => {
      if (!state.sessionUnreadByUser[userId]) return state;
      return {
        sessionUnreadByUser: { ...state.sessionUnreadByUser, [userId]: 0 },
      };
    });
  },

  subscribeToMessages: () => {},
  unsubscribeFromMessages: () => {},

  setSelectedUser: (selectedUser) =>
    set((state) => {
      if (!selectedUser) return { selectedUser: null };
      return {
        selectedUser,
        sessionUnreadByUser: {
          ...state.sessionUnreadByUser,
          [selectedUser._id]: 0,
        },
      };
    }),

  resetChatState: () => {
    seenMessageIds.clear();
    set({
      messages: [],
      users: [],
      selectedUser: null,
      hasMoreMessages: false,
      isLoadingMoreMessages: false,
      usersError: null,
      messagesError: null,
      sessionUnreadByUser: {},
      sessionLastMessageByUser: {},
    });
  },
}));
