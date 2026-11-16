import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { BRAND } from "../config/brand";

const SHORTCUTS = [
  { keys: ["Enter"], action: "Send message (default)" },
  { keys: ["Shift", "Enter"], action: "Insert a new line in the composer" },
  { keys: ["Ctrl / Cmd", "Enter"], action: "Send when Ctrl+Enter mode is selected in Settings" },
  { keys: ["Esc"], action: "Close image preview, search bar, or edit mode" },
];

const HelpPage = () => {
  const { authUser } = useAuthStore();

  return (
    <main className="flex-1 bg-background py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-xl font-heading font-semibold text-foreground">
              Help & Shortcuts
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Keyboard shortcuts and quick references for {BRAND.name}.
            </p>
          </div>
          <Link
            to={authUser ? "/" : "/login"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            {authUser ? "Back to messages" : "Sign in"}
          </Link>
        </div>

        {/* Keyboard Shortcuts */}
        <section className="rounded-xl border border-border bg-surface divide-y divide-border">
          <div className="px-6 py-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Keyboard shortcuts
            </h2>
          </div>

          {SHORTCUTS.map((item) => (
            <div
              key={item.action}
              className="px-6 py-3.5 flex items-center justify-between gap-4"
            >
              <span className="text-sm text-foreground">{item.action}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-surface-elevated border border-border text-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Usage Overview */}
        <section className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-surface p-5 space-y-1.5">
            <h3 className="text-sm font-heading font-semibold text-foreground">
              Managing conversations
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hover or focus any message to react, copy text, or edit and
              delete your own messages. Use the search icon in the chat header
              to filter messages, or open the details panel to browse shared
              images.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-1.5">
            <h3 className="text-sm font-heading font-semibold text-foreground">
              Alerts & privacy
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Customize message previews, read receipts, typing indicators, and
              desktop browser alerts inside{" "}
              <Link to="/settings" className="text-primary hover:underline">
                Settings
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Policies */}
        <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HelpPage;
