import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  Copy,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion as Motion } from "motion/react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { usePreferencesStore } from "../store/usePreferencesStore";
import { formatDateDivider, formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import Avatar from "./Avatar";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "🎉"];

const isSameCalendarDay = (a, b) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    loadOlderMessages,
    hasMoreMessages,
    isLoadingMoreMessages,
    isMessagesLoading,
    messagesError,
    selectedUser,
    editMessage,
    deleteMessage,
    toggleReaction,
    searchConversationMessages,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const { density, timeFormat, showMessageAvatars } = usePreferencesStore();

  const scrollContainerRef = useRef(null);
  const messageEndRef = useRef(null);
  const prevLastMessageIdRef = useRef(null);

  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [reactionPickerForId, setReactionPickerForId] = useState(null);

  useEffect(() => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults(null);
    setEditingMessageId(null);
    setReactionPickerForId(null);
    prevLastMessageIdRef.current = null;
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  useEffect(() => {
    const lastId = messages[messages.length - 1]?._id;
    if (lastId && lastId !== prevLastMessageIdRef.current) {
      prevLastMessageIdRef.current = lastId;
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (lightboxSrc) setLightboxSrc(null);
        else if (reactionPickerForId) setReactionPickerForId(null);
        else if (editingMessageId) setEditingMessageId(null);
        else if (isSearchOpen) {
          setIsSearchOpen(false);
          setSearchTerm("");
          setSearchResults(null);
        } else if (isInfoOpen) setIsInfoOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxSrc, reactionPickerForId, editingMessageId, isSearchOpen, isInfoOpen]);

  const handleLoadOlder = async () => {
    const el = scrollContainerRef.current;
    const prevHeight = el?.scrollHeight || 0;
    const count = await loadOlderMessages();
    if (count > 0 && el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight - prevHeight;
      });
    }
  };

  const handleRunSearch = async (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q || !selectedUser?._id) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchConversationMessages(selectedUser._id, q);
      setSearchResults(results);
    } catch {
      toast.error("Unable to search conversation");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Unable to copy");
    }
  };

  const handleSaveEdit = async (messageId) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    const ok = await editMessage(messageId, trimmed);
    if (ok) {
      setEditingMessageId(null);
      setEditingText("");
    }
  };

  const displayedMessages = searchResults ?? messages;

  const groupedMessages = useMemo(() => {
    return displayedMessages.map((msg, idx) => {
      const prev = displayedMessages[idx - 1];
      const next = displayedMessages[idx + 1];
      const showDateDivider =
        !prev || !isSameCalendarDay(prev.createdAt, msg.createdAt);

      const groupedWithPrev =
        prev &&
        !showDateDivider &&
        prev.senderId === msg.senderId &&
        new Date(msg.createdAt) - new Date(prev.createdAt) < FIVE_MINUTES_MS;

      const groupedWithNext =
        next &&
        isSameCalendarDay(msg.createdAt, next.createdAt) &&
        next.senderId === msg.senderId &&
        new Date(next.createdAt) - new Date(msg.createdAt) < FIVE_MINUTES_MS;

      return {
        msg,
        showDateDivider,
        groupedWithPrev,
        groupedWithNext,
      };
    });
  }, [displayedMessages]);

  const sharedImages = useMemo(
    () => messages.filter((m) => Boolean(m.image)),
    [messages]
  );

  const lastOwnMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === authUser?._id) return messages[i]._id;
    }
    return null;
  }, [messages, authUser?._id]);

  if (!selectedUser) return null;

  const isSelectedOnline = onlineUsers.includes(selectedUser._id);
  const isCompact = density === "compact";

  return (
    <div className="flex-1 flex min-w-0 h-full overflow-hidden">
      <section
        aria-label={`Conversation with ${selectedUser.fullName}`}
        className="flex-1 flex flex-col min-w-0 h-full bg-background"
      >
        <ChatHeader
          isSearchOpen={isSearchOpen}
          onToggleSearch={() => {
            setIsSearchOpen((v) => !v);
            if (isSearchOpen) {
              setSearchTerm("");
              setSearchResults(null);
            }
          }}
          isInfoOpen={isInfoOpen}
          onToggleInfo={() => setIsInfoOpen((v) => !v)}
        />

        {isSearchOpen && (
          <form
            onSubmit={handleRunSearch}
            className="px-4 py-2 border-b border-border bg-surface flex items-center gap-2 shrink-0"
          >
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <input
              type="search"
              autoFocus
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!e.target.value.trim()) setSearchResults(null);
              }}
              placeholder="Search messages in this thread…"
              aria-label="Search messages"
              className="flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            )}
            <button
              type="submit"
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer"
            >
              Find
            </button>
            {searchResults && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {searchResults.length} results
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchTerm("");
                setSearchResults(null);
              }}
              aria-label="Close message search"
              className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </form>
        )}

        {isMessagesLoading ? (
          <MessageSkeleton />
        ) : messagesError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2.5">
            <p className="text-sm font-medium text-foreground">
              Unable to load conversation
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {messagesError}
            </p>
            <button
              type="button"
              onClick={() => getMessages(selectedUser._id)}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              Try again
            </button>
          </div>
        ) : displayedMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-1.5">
            <h3 className="text-sm font-heading font-semibold text-foreground">
              {searchResults ? "No matching messages" : "No messages yet"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              {searchResults
                ? "Try a different keyword or clear the search bar."
                : `Send a message below to start chatting with ${selectedUser.fullName}.`}
            </p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto relia-scroll px-3 sm:px-6 py-4"
          >
            {!searchResults && hasMoreMessages && (
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadOlder}
                  disabled={isLoadingMoreMessages}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-border bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoadingMoreMessages ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Loading older…</span>
                    </>
                  ) : (
                    "Load older messages"
                  )}
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {groupedMessages.map(
                ({ msg, showDateDivider, groupedWithPrev, groupedWithNext }) => {
                  const isOwn = msg.senderId === authUser?._id;
                  const senderProfile = isOwn ? authUser : selectedUser;
                  const isEditing = editingMessageId === msg._id;

                  const reactionCounts = (msg.reactions || []).reduce(
                    (acc, r) => {
                      const existing = acc.find((item) => item.emoji === r.emoji);
                      if (existing) {
                        existing.count += 1;
                        if (r.userId === authUser?._id) existing.reacted = true;
                      } else {
                        acc.push({
                          emoji: r.emoji,
                          count: 1,
                          reacted: r.userId === authUser?._id,
                        });
                      }
                      return acc;
                    },
                    []
                  );

                  return (
                    <Motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.14, ease: "easeOut" }}
                    >
                      {showDateDivider && (
                        <div className="my-4 flex items-center gap-3">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {formatDateDivider(msg.createdAt)}
                          </span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                      )}

                      <div
                        className={`group/msg flex items-end gap-2 ${
                          isOwn ? "justify-end" : "justify-start"
                        } ${
                          groupedWithPrev
                            ? isCompact
                              ? "mt-0.5"
                              : "mt-1"
                            : isCompact
                              ? "mt-2"
                              : "mt-3.5"
                        }`}
                      >
                        {!isOwn && showMessageAvatars && (
                          <div className="w-7 shrink-0">
                            {!groupedWithNext && (
                              <Avatar
                                src={senderProfile?.profilePic}
                                name={senderProfile?.fullName}
                                size="xs"
                              />
                            )}
                          </div>
                        )}

                        <div
                          className={`flex flex-col max-w-[82%] sm:max-w-[66%] ${
                            isOwn ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-1.5 ${
                              isOwn ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            {isEditing ? (
                              <div className="w-72 sm:w-80 p-2.5 rounded-xl bg-surface border border-primary shadow-sm space-y-2">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  rows={2}
                                  autoFocus
                                  className="w-full text-sm bg-surface-elevated border border-border rounded-md p-2 text-foreground focus:outline-none focus:border-primary resize-none"
                                />
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingMessageId(null)}
                                    className="px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(msg._id)}
                                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`text-sm leading-relaxed break-words whitespace-pre-wrap ${
                                  isCompact ? "px-3 py-1.5" : "px-3.5 py-2"
                                } ${
                                  isOwn
                                    ? `bg-[var(--bubble-outgoing)] text-[var(--bubble-outgoing-foreground)] rounded-xl ${
                                        groupedWithNext
                                          ? "rounded-br-sm"
                                          : "rounded-br-[4px]"
                                      }`
                                    : `bg-[var(--bubble-incoming)] text-[var(--bubble-incoming-foreground)] border border-border/80 rounded-xl ${
                                        groupedWithNext
                                          ? "rounded-bl-sm"
                                          : "rounded-bl-[4px]"
                                      }`
                                }`}
                              >
                                {msg.image && (
                                  <button
                                    type="button"
                                    onClick={() => setLightboxSrc(msg.image)}
                                    className="block mb-1.5 rounded-lg overflow-hidden focus:outline-none cursor-zoom-in"
                                  >
                                    <img
                                      src={msg.image}
                                      alt="Message attachment"
                                      className="max-w-full sm:max-w-[260px] max-h-72 object-cover rounded-lg"
                                    />
                                  </button>
                                )}
                                {msg.text && <p>{msg.text}</p>}
                                {msg.isEdited && (
                                  <span className="block text-[10px] opacity-70 mt-0.5">
                                    edited
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Compact floating action bar on hover/focus */}
                            {!isEditing && (
                              <div className="relative opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100 transition-opacity flex items-center rounded-md border border-border bg-surface shadow-2xs p-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReactionPickerForId(
                                      reactionPickerForId === msg._id
                                        ? null
                                        : msg._id
                                    )
                                  }
                                  aria-label="Add reaction"
                                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                >
                                  <Smile className="size-3.5" />
                                </button>

                                {msg.text && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(msg.text)}
                                    aria-label="Copy message"
                                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                  >
                                    <Copy className="size-3.5" />
                                  </button>
                                )}

                                {isOwn && msg.text && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMessageId(msg._id);
                                      setEditingText(msg.text);
                                    }}
                                    aria-label="Edit message"
                                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                  >
                                    <Pencil className="size-3.5" />
                                  </button>
                                )}

                                {isOwn && (
                                  <button
                                    type="button"
                                    onClick={() => deleteMessage(msg._id)}
                                    aria-label="Delete message"
                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                )}

                                {reactionPickerForId === msg._id && (
                                  <div
                                    className={`absolute bottom-full mb-1 z-20 flex items-center gap-0.5 p-1 rounded-lg border border-border bg-surface shadow-md ${
                                      isOwn ? "right-0" : "left-0"
                                    }`}
                                  >
                                    {QUICK_REACTIONS.map((emoji) => (
                                      <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => {
                                          toggleReaction(msg._id, emoji);
                                          setReactionPickerForId(null);
                                        }}
                                        className="size-7 rounded hover:bg-muted flex items-center justify-center text-sm cursor-pointer"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {reactionCounts.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1 px-0.5">
                              {reactionCounts.map(({ emoji, count, reacted }) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => toggleReaction(msg._id, emoji)}
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs border transition-colors cursor-pointer ${
                                    reacted
                                      ? "bg-muted border-primary/40 text-foreground"
                                      : "bg-surface border-border text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  {count > 1 && (
                                    <span className="text-[11px] font-medium tabular-nums">
                                      {count}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}

                          {(!groupedWithNext || msg._id === lastOwnMessageId) && (
                            <div className="flex items-center gap-1 mt-1 px-0.5 text-[11px] text-muted-foreground tabular-nums">
                              <time dateTime={msg.createdAt}>
                                {formatMessageTime(msg.createdAt, timeFormat)}
                              </time>
                              {isOwn && msg._id === lastOwnMessageId && (
                                <span
                                  className="inline-flex items-center"
                                  title={msg.isRead ? "Seen" : "Sent"}
                                >
                                  {msg.isRead ? (
                                    <CheckCheck className="size-3.5 text-primary" />
                                  ) : (
                                    <Check className="size-3.5" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Motion.div>
                  );
                }
              )}
            </AnimatePresence>
            <div ref={messageEndRef} />
          </div>
        )}

        <MessageInput />
      </section>

      {/* Contact Info & Shared Media Drawer */}
      {isInfoOpen && (
        <aside
          aria-label="Conversation details"
          className="hidden sm:flex w-72 lg:w-76 border-l border-border bg-surface flex-col shrink-0 overflow-y-auto relia-scroll"
        >
          <div className="h-14 px-4 border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h3>
            <button
              type="button"
              onClick={() => setIsInfoOpen(false)}
              aria-label="Close conversation info"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="p-5 border-b border-border flex flex-col items-center text-center space-y-2">
            <Avatar
              src={selectedUser.profilePic}
              name={selectedUser.fullName}
              size="xl"
              online={isSelectedOnline}
              showStatus
            />
            <div>
              <p className="text-sm font-heading font-semibold text-foreground">
                {selectedUser.fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-56 mt-0.5">
                {selectedUser.email}
              </p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shared media
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {sharedImages.length}
              </span>
            </div>

            {sharedImages.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No shared images yet.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {sharedImages.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => setLightboxSrc(m.image)}
                    className="aspect-square rounded-md overflow-hidden border border-border hover:opacity-90 transition-opacity cursor-zoom-in"
                  >
                    <img
                      src={m.image}
                      alt="Shared attachment"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image attachment preview"
          onClick={() => setLightboxSrc(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            aria-label="Close image preview"
            className="absolute top-4 right-4 size-9 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
          <img
            src={lightboxSrc}
            alt="Full size attachment"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
