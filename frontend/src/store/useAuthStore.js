import { create } from "zustand";
import {
  axiosInstance,
  getStoredAuthToken,
  setStoredAuthToken,
} from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { getErrorMessage } from "../lib/utils.js";
import { BRAND } from "../config/brand.js";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

const BASE_URL =
  API_ORIGIN ||
  (import.meta.env.MODE === "development" ? "http://localhost:5001" : "/");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isChangingPassword: false,
  isCheckingAuth: true,
  onlineUsers: [],
  typingUsers: {},
  socket: null,
  socketStatus: "disconnected", // 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      setStoredAuthToken(null);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const { token, ...user } = res.data || {};
      if (token) setStoredAuthToken(token);
      set({ authUser: user });
      toast.success("Account created successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create account"));
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const { token, ...user } = res.data || {};
      if (token) setStoredAuthToken(token);
      set({ authUser: user });
      toast.success(`Signed in to ${BRAND.name}`);
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid credentials"));
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setStoredAuthToken(null);
      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [], typingUsers: {} });
      toast.success("Signed out");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign out"));
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update profile"));
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  changePassword: async (data) => {
    set({ isChangingPassword: true });
    try {
      const res = await axiosInstance.put("/auth/change-password", data);
      toast.success(res.data?.message || "Password updated");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to change password"));
      return false;
    } finally {
      set({ isChangingPassword: false });
    }
  },

  setUserTyping: (senderId, isTyping) => {
    if (!senderId) return;
    set((state) => {
      if (Boolean(state.typingUsers[senderId]) === isTyping) return state;
      return {
        typingUsers: { ...state.typingUsers, [senderId]: isTyping },
      };
    });
  },

  connectSocket: () => {
    const { authUser, socket: existingSocket } = get();
    if (!authUser) return;
    if (existingSocket && existingSocket.connected) return;

    if (existingSocket) {
      existingSocket.removeAllListeners();
      existingSocket.disconnect();
    }

    set({ socketStatus: "connecting" });

    const token = getStoredAuthToken();
    const socket = io(BASE_URL, {
      withCredentials: true,
      auth: token ? { token } : undefined,
      query: {
        userId: authUser._id,
      },
      path: "/socket.io",
    });

    socket.on("connect", () => {
      set({ socketStatus: "connected" });
    });

    socket.on("disconnect", () => {
      set({ socketStatus: "reconnecting", typingUsers: {} });
    });

    socket.on("connect_error", () => {
      set({ socketStatus: "reconnecting" });
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.removeAllListeners();
      if (socket.connected) {
        socket.disconnect();
      }
    }
    set({
      socket: null,
      onlineUsers: [],
      typingUsers: {},
      socketStatus: "disconnected",
    });
  },
}));
