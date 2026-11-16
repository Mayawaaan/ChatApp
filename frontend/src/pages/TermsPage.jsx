import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { BRAND } from "../config/brand";

const TermsPage = () => {
  const { authUser } = useAuthStore();

  return (
    <main className="flex-1 bg-background py-8 px-4 sm:px-6">
      <article
        className="max-w-3xl mx-auto rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              Terms of Service
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
              1. Acceptable use
            </h2>
            <p>
              Use {BRAND.name} responsibly for respectful, lawful
              communication. Do not attempt to impersonate other users, disrupt
              real-time services, or upload abusive or unauthorized content.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-heading font-semibold text-foreground">
              2. Account security
            </h2>
            <p>
              You are responsible for safeguarding your account password and
              signing out on shared devices. Use the password change tool in
              Profile or the reset flow if you suspect unauthorized access.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-heading font-semibold text-foreground">
              3. Service availability
            </h2>
            <p>
              Real-time messaging depends on active network and server
              connectivity. Features such as image attachments and password
              recovery emails depend on configured external services.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
};

export default TermsPage;
