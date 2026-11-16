import { useEffect, useRef, useState } from "react";
import { Image, Loader2, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { usePreferencesStore } from "../store/usePreferencesStore";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const stopTypingTimeoutRef = useRef(null);
  const lastTypingEmitRef = useRef(0);

  const { sendMessage, isSendingMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();
  const { enterToSend, sendTypingIndicators } = usePreferencesStore();

  const emitStopTyping = () => {
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }
    if (socket?.connected && selectedUser?._id) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  };

  useEffect(() => {
    return () => {
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
    };
  }, [selectedUser?._id]);

  const resizeTextarea = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);
    resizeTextarea(e.target);

    if (!sendTypingIndicators || !socket?.connected || !selectedUser?._id) {
      return;
    }

    if (!value.trim()) {
      emitStopTyping();
      return;
    }

    const now = Date.now();
    if (now - lastTypingEmitRef.current > 1200) {
      socket.emit("typing", { receiverId: selectedUser._id });
      lastTypingEmitRef.current = now;
    }

    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }
    stopTypingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 2200);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be smaller than 8 MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitMessage = async () => {
    if ((!text.trim() && !imagePreview) || isSendingMessage) return;

    emitStopTyping();

    const payload = {
      text: text.trim(),
      image: imagePreview,
    };

    const ok = await sendMessage(payload);
    if (ok) {
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (e) => {
    if (enterToSend) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitMessage();
      }
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submitMessage();
    }
  };

  const canSend = Boolean(text.trim() || imagePreview) && !isSendingMessage;

  return (
    <div className="px-3 sm:px-5 py-3 border-t border-border bg-surface shrink-0">
      {imagePreview && (
        <div className="mb-2.5 flex items-center gap-2">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Attachment preview"
              className="w-20 h-20 object-cover rounded-lg border border-border"
            />
            <button
              onClick={removeImage}
              type="button"
              aria-label="Remove attachment"
              className="absolute -top-2 -right-2 size-5 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm hover:opacity-90 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSendingMessage}
          aria-label="Attach an image"
          title="Attach image"
          className={`size-9.5 rounded-lg border border-border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
            imagePreview
              ? "bg-muted text-primary border-primary/40"
              : "bg-surface-elevated text-muted-foreground hover:text-foreground hover:bg-muted"
          } disabled:opacity-50`}
        >
          <Image className="size-4" />
        </button>

        <div className="flex-1 min-w-0">
          <label htmlFor="message-composer" className="sr-only">
            Message {selectedUser?.fullName || ""}
          </label>
          <textarea
            id="message-composer"
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={emitStopTyping}
            disabled={isSendingMessage}
            placeholder={
              enterToSend
                ? `Message ${selectedUser?.fullName || ""}…`
                : `Message ${selectedUser?.fullName || ""}… (Ctrl+Enter to send)`
            }
            className="w-full min-h-9.5 max-h-32 px-3 py-2 text-sm leading-5 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring transition-colors disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="size-9.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSendingMessage ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
