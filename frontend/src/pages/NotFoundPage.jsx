import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const NotFoundPage = () => {
  const { authUser } = useAuthStore();

  return (
    <main className="flex-1 bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          404
        </p>

        <div className="space-y-1.5">
          <h1 className="text-xl font-heading font-semibold text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you requested doesn’t exist or may have moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <Link
            to={authUser ? "/" : "/login"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            {authUser ? "Back to messages" : "Go to sign in"}
          </Link>

          <Link
            to="/help"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border bg-surface-elevated hover:bg-muted text-xs font-medium text-foreground transition-colors"
          >
            Help & shortcuts
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
