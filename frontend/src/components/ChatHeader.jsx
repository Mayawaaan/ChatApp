import { ArrowLeft, PanelRight, Search, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import Avatar from "./Avatar";

const ChatHeader = ({
  isSearchOpen,
  onToggleSearch,
  isInfoOpen,
  onToggleInfo,
}) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, typingUsers } = useAuthStore();

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = Boolean(typingUsers[selectedUser._id]);

  return (
    <header className="h-16 px-3 sm:px-5 border-b border-border bg-surface flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          aria-label="Back to conversations"
          className="md:hidden p-2 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-5" />
        </button>

        <Avatar
          src={selectedUser.profilePic}
          name={selectedUser.fullName}
          size="md"
          online={isOnline}
          showStatus
        />

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-heading font-semibold text-foreground truncate">
            {selectedUser.fullName}
          </h2>
          <p className="text-xs flex items-center gap-1.5 text-muted-foreground">
            {isTyping ? (
              <span className="font-medium text-primary">Typing…</span>
            ) : (
              <>
                <span
                  className={`size-1.5 rounded-full ${
                    isOnline ? "bg-success" : "bg-muted-foreground/40"
                  }`}
                />
                <span>{isOnline ? "Online" : "Offline"}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleSearch}
          aria-pressed={isSearchOpen}
          aria-label="Search messages in conversation"
          title="Search messages"
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isSearchOpen
              ? "bg-primary-subtle text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Search className="size-4" />
        </button>

        <button
          type="button"
          onClick={onToggleInfo}
          aria-pressed={isInfoOpen}
          aria-label="Conversation info and shared media"
          title="Conversation details & media"
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isInfoOpen
              ? "bg-primary-subtle text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <PanelRight className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          aria-label="Close conversation"
          title="Close conversation"
          className="hidden md:inline-flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
