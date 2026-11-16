import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { usePreferencesStore } from "../store/usePreferencesStore";
import { formatConversationTime } from "../lib/utils";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import Avatar from "./Avatar";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    usersError,
    sessionUnreadByUser,
    sessionLastMessageByUser,
  } = useChatStore();

  const { authUser, onlineUsers, typingUsers } = useAuthStore();
  const { density, timeFormat, contactSort } = usePreferencesStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (users.length === 0) {
      getUsers();
    }
  }, [getUsers, users.length]);

  const onlineOtherCount = useMemo(() => {
    return users.filter((u) => onlineUsers.includes(u._id)).length;
  }, [users, onlineUsers]);

  const displayedUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = users.filter((user) => {
      if (showOnlineOnly && !onlineUsers.includes(user._id)) return false;
      if (!query) return true;
      return (
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    });

    return [...filtered].sort((a, b) => {
      if (contactSort === "name") {
        return (a.fullName || "").localeCompare(b.fullName || "");
      }
      if (contactSort === "online") {
        const onA = onlineUsers.includes(a._id) ? 1 : 0;
        const onB = onlineUsers.includes(b._id) ? 1 : 0;
        if (onA !== onB) return onB - onA;
      }
      const lastA = sessionLastMessageByUser[a._id]?.createdAt;
      const lastB = sessionLastMessageByUser[b._id]?.createdAt;
      if (lastA && lastB) return new Date(lastB) - new Date(lastA);
      if (lastA) return -1;
      if (lastB) return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });
  }, [
    users,
    onlineUsers,
    showOnlineOnly,
    searchQuery,
    sessionLastMessageByUser,
    contactSort,
  ]);

  if (isUsersLoading && users.length === 0) {
    return <SidebarSkeleton />;
  }

  const isCompact = density === "compact";

  return (
    <aside
      aria-label="Conversations"
      className={`h-full w-full md:w-76 lg:w-80 border-r border-border bg-surface flex-col shrink-0 ${
        selectedUser ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="p-3.5 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-heading font-semibold text-foreground">
            Messages
          </h2>

          <div
            role="tablist"
            aria-label="Filter contacts"
            className="inline-flex p-0.5 rounded-md bg-muted border border-border/70 text-[11px] font-medium"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!showOnlineOnly}
              onClick={() => setShowOnlineOnly(false)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                !showOnlineOnly
                  ? "bg-surface text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showOnlineOnly}
              onClick={() => setShowOnlineOnly(true)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer tabular-nums ${
                showOnlineOnly
                  ? "bg-surface text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Online ({onlineOtherCount})
            </button>
          </div>
        </div>

        <div className="relative">
          <Search
            className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter conversations…"
            aria-label="Search conversations"
            className="w-full h-8 pl-8 pr-7 text-[13px] rounded-md bg-surface-elevated border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relia-scroll p-1.5 space-y-0.5">
        {usersError && users.length === 0 ? (
          <div className="p-6 text-center space-y-3">
            <p className="text-xs text-muted-foreground">{usersError}</p>
            <button
              type="button"
              onClick={getUsers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </button>
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="px-4 py-12 text-center space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              {searchQuery
                ? "No matching conversations"
                : showOnlineOnly
                  ? "No contacts online"
                  : "No conversations yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? "Try searching a different name or email."
                : showOnlineOnly
                  ? "Switch back to All to see offline contacts."
                  : "Contacts will appear once registered."}
            </p>
            {(searchQuery || showOnlineOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowOnlineOnly(false);
                }}
                className="mt-2 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-primary hover:bg-muted transition-colors cursor-pointer"
              >
                Reset filter
              </button>
            )}
          </div>
        ) : (
          displayedUsers.map((user) => {
            const isSelected = selectedUser?._id === user._id;
            const isOnline = onlineUsers.includes(user._id);
            const isTyping = Boolean(typingUsers[user._id]);
            const unread = sessionUnreadByUser[user._id] || 0;
            const lastMsg = sessionLastMessageByUser[user._id];

            const preview = isTyping
              ? "Typing…"
              : lastMsg
                ? lastMsg.text?.trim()
                  ? `${lastMsg.senderId === authUser?._id ? "You: " : ""}${lastMsg.text.trim()}`
                  : `${lastMsg.senderId === authUser?._id ? "You " : ""}Sent an image`
                : isOnline
                  ? "Online"
                  : "Offline";

            return (
              <button
                key={user._id}
                type="button"
                onClick={() => setSelectedUser(user)}
                aria-current={isSelected ? "true" : undefined}
                className={`relative w-full px-2.5 flex items-center gap-3 rounded-lg text-left transition-colors duration-100 cursor-pointer ${
                  isCompact ? "py-1.5" : "py-2.5"
                } ${
                  isSelected
                    ? "bg-muted text-foreground"
                    : "hover:bg-muted/60 text-foreground"
                }`}
              >
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-primary"
                  />
                )}

                <Avatar
                  src={user.profilePic}
                  name={user.fullName}
                  size={isCompact ? "sm" : "md"}
                  online={isOnline}
                  showStatus
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[13px] truncate ${
                        unread > 0 || isSelected
                          ? "font-semibold text-foreground"
                          : "font-medium text-foreground"
                      }`}
                    >
                      {user.fullName}
                    </span>
                    {lastMsg?.createdAt && (
                      <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                        {formatConversationTime(lastMsg.createdAt, timeFormat)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span
                      className={`text-xs truncate ${
                        isTyping
                          ? "font-medium text-primary"
                          : unread > 0
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {preview}
                    </span>

                    {unread > 0 && (
                      <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-semibold tabular-nums bg-primary text-primary-foreground shrink-0">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {authUser && (
        <div className="px-3.5 py-2.5 border-t border-border bg-surface-elevated/40 flex items-center gap-2.5">
          <Avatar
            src={authUser.profilePic}
            name={authUser.fullName}
            size="xs"
            online
            showStatus
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">
              {authUser.fullName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {authUser.email}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
