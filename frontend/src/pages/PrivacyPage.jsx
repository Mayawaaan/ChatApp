import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { BRAND } from "../config/brand";

const PrivacyPage = () => {
  const { authUser } = useAuthStore();

  return (
    <main className="flex-1 bg-background py-8 px-4 sm:px-6">
      <article
        className="max-w-3xl mx-auto rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {BRAND.name} Messaging Platform
            </p>
          </div>
          <Link
            to={authUser ? "/" : "/login"}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface-elevated text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
        </div>

        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-1.5">
            <h2 className="text-base font-heading font-semibold text-foreground">
              1. Information we store
            </h2>
            <p>
              {BRAND.name} stores the account details you provide when signing up
              (display name, email address, hashed password, and optional
              profile photo) along with messages and media attachments sent
              through conversations.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-heading font-semibold text-foreground">
              2. Authentication & session cookies
            </h2>
            <p>
              Authentication uses HTTP-only JWT session cookies to verify API
              requests and real-time WebSocket connections. Passwords are stored
              using salted bcrypt hashes and are never exposed in API responses.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-heading font-semibold text-foreground">
              3. Local preferences & browser alerts
            </h2>
            <p>
              Theme appearance, accent colors, and notification toggles are
              stored locally in your browser. Desktop browser notifications are
              only requested when you explicitly opt in from Settings.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
};

export default PrivacyPage;
