import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import {
  isBrowserNotificationSupported,
  playSubtleNotificationTone,
  useNotificationStore,
} from "../store/useNotificationStore";
import Avatar from "./Avatar";

const getPreviewText = (message) => {
  if (message.text && message.text.trim()) {
    const trimmed = message.text.trim();
    return trimmed.length > 78 ? `${trimmed.slice(0, 75)}…` : trimmed;
  }
  if (message.image) return "Sent an image";
  return "New message";
};

const MessageNotificationListener = () => {
  const { authUser, socket, setUserTyping } = useAuthStore();
  const {
    getUsers,
    setSelectedUser,
    resetChatState,
    markConversationRead,
    applyMessageUpdated,
    applyMessageDeleted,
    applyMessagesRead,
  } = useChatStore();
  const location = useLocation();
  const navigate = useNavigate();

  const pathnameRef = useRef(location.pathname);
  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!authUser) {
      resetChatState();
      return;
    }
    if (useChatStore.getState().users.length === 0) {
      getUsers();
    }
  }, [authUser, getUsers, resetChatState]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && pathnameRef.current === "/") {
        const activeUser = useChatStore.getState().selectedUser;
        if (activeUser?._id) {
          const unread =
            useChatStore.getState().sessionUnreadByUser[activeUser._id] || 0;
          if (unread > 0) {
            markConversationRead(activeUser._id);
          }
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [markConversationRead]);

  useEffect(() => {
    if (!socket || !authUser) return;

    const typingTimeouts = new Map();

    const handleNewMessage = (newMessage) => {
      const isPageVisible = document.visibilityState === "visible";
      const activeUser = useChatStore.getState().selectedUser;
      const isChatActiveAndVisible =
        pathnameRef.current === "/" &&
        isPageVisible &&
        activeUser?._id === newMessage.senderId;

      setUserTyping(newMessage.senderId, false);

      const result = useChatStore
        .getState()
        .processIncomingSocketMessage(newMessage, { isChatActiveAndVisible });

      if (result.isDuplicate || result.isOwnMessage) return;

      if (isChatActiveAndVisible) {
        markConversationRead(newMessage.senderId);
        return;
      }

      const users = useChatStore.getState().users;
      const sender = users.find((u) => u._id === newMessage.senderId) || {
        _id: newMessage.senderId,
        fullName: "New message",
        profilePic: "",
      };

      const {
        inAppToasts,
        showMessagePreview,
        browserNotifications,
        soundEnabled,
      } = useNotificationStore.getState();

      const preview = showMessagePreview
        ? getPreviewText(newMessage)
        : "New message received";

      if (soundEnabled) {
        playSubtleNotificationTone();
      }

      const openConversation = () => {
        setSelectedUser(sender);
        if (pathnameRef.current !== "/") {
          navigate("/");
        }
      };

      if (
        !isPageVisible &&
        browserNotifications &&
        isBrowserNotificationSupported() &&
        window.Notification.permission === "granted"
      ) {
        try {
          const notification = new window.Notification(sender.fullName, {
            body: preview,
            icon: "/relia-mark.svg",
            tag: `relia-msg-${newMessage._id}`,
          });
          notification.onclick = () => {
            window.focus();
            openConversation();
            notification.close();
          };
          return;
        } catch {
          // Fallback to in-app toast if native notification fails
        }
      }

      if (inAppToasts) {
        toast.custom(
          (t) => (
            <div
              role="status"
              aria-live="polite"
              className={`pointer-events-auto w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface shadow-lg transition-all duration-200 ${
                t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <div className="p-3 flex items-start gap-3">
                <Avatar
                  src={sender.profilePic}
                  name={sender.fullName}
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    toast.dismiss(t.id);
                    openConversation();
                  }}
                  className="flex-1 min-w-0 text-left cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {sender.fullName}
                    </p>
                    <span className="text-[11px] font-medium text-primary shrink-0">
                      Open
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {preview}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => toast.dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ),
          {
            id: `relia-msg-${newMessage._id}`,
            duration: 4500,
          }
        );
      }
    };

    const handleMessageUpdated = (updated) => {
      applyMessageUpdated(updated);
    };

    const handleMessageDeleted = (payload) => {
      applyMessageDeleted(payload);
    };

    const handleMessagesRead = (payload) => {
      applyMessagesRead(payload);
    };

    const handleUserTyping = ({ senderId } = {}) => {
      if (!senderId) return;
      setUserTyping(senderId, true);
      const existingTimer = typingTimeouts.get(senderId);
      if (existingTimer) clearTimeout(existingTimer);
      typingTimeouts.set(
        senderId,
        setTimeout(() => {
          setUserTyping(senderId, false);
          typingTimeouts.delete(senderId);
        }, 3500)
      );
    };

    const handleUserStopTyping = ({ senderId } = {}) => {
      if (!senderId) return;
      const existingTimer = typingTimeouts.get(senderId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        typingTimeouts.delete(senderId);
      }
      setUserTyping(senderId, false);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageUpdated", handleMessageUpdated);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageUpdated", handleMessageUpdated);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
      typingTimeouts.forEach((timer) => clearTimeout(timer));
      typingTimeouts.clear();
    };
  }, [
    socket,
    authUser,
    navigate,
    setSelectedUser,
    markConversationRead,
    applyMessageUpdated,
    applyMessageDeleted,
    applyMessagesRead,
    setUserTyping,
  ]);

  return null;
};

export default MessageNotificationListener;
