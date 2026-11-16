import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";

export const app = express();
export const server = http.createServer(app);

const getAllowedOrigins = () => {
  const raw = process.env.CLIENT_URL || "http://localhost:5173";
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
};

export const io = new Server(server, {
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
});

// Track multiple active sockets per user (supports multiple tabs/devices cleanly)
const userSocketsMap = new Map(); // Map<userId, Set<socketId>>

export function getReceiverSocketId(userId) {
  const set = userSocketsMap.get(String(userId));
  if (!set || set.size === 0) return undefined;
  return set.values().next().value;
}

export function emitToUser(userId, event, payload) {
  io.to(String(userId)).emit(event, payload);
}

function parseCookies(cookieHeader = "") {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    cookies[key] = val;
  });
  return cookies;
}

io.use((socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers?.cookie);
    const token = cookies.jwt;
    if (!token) {
      return next(new Error("Unauthorized - Missing session cookie"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return next(new Error("Unauthorized - Invalid session token"));
    }
    socket.userId = String(decoded.userId);
    return next();
  } catch {
    return next(new Error("Unauthorized - Invalid session token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;

  if (userId) {
    socket.join(userId);
    let set = userSocketsMap.get(userId);
    if (!set) {
      set = new Set();
      userSocketsMap.set(userId, set);
    }
    set.add(socket.id);
  }

  io.emit("getOnlineUsers", Array.from(userSocketsMap.keys()));

  socket.on("typing", ({ receiverId } = {}) => {
    if (!userId || !receiverId) return;
    emitToUser(receiverId, "userTyping", { senderId: userId });
  });

  socket.on("stopTyping", ({ receiverId } = {}) => {
    if (!userId || !receiverId) return;
    emitToUser(receiverId, "userStopTyping", { senderId: userId });
  });

  socket.on("disconnect", () => {
    if (userId) {
      const set = userSocketsMap.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          userSocketsMap.delete(userId);
        }
      }
    }
    io.emit("getOnlineUsers", Array.from(userSocketsMap.keys()));
  });
});
