import { Link, useLocation } from "react-router-dom";
import { BRAND } from "../config/brand";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const Footer = () => {
  const location = useLocation();
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  // AuthLayout renders its own aligned footer inside the form column
  if (isAuthRoute) {
    return null;
  }

  const isChatRoute = location.pathname === "/";
  const year = new Date().getFullYear();

  if (isChatRoute) {
    return (
      <footer className="hidden md:flex h-9 px-5 border-t border-border bg-surface items-center justify-between text-[11px] text-muted-foreground shrink-0">
        <div className="flex items-center gap-2">
          <span>
            © {year} {BRAND.name}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Built by{" "}
            <a
              href={BRAND.author.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              {BRAND.author.name}
            </a>
          </span>
        </div>

        <nav aria-label="Footer links" className="flex items-center gap-4">
          <Link to="/help" className="hover:text-foreground transition-colors">
            Help
          </Link>
          <Link
            to="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </nav>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-border bg-surface py-4 px-4 sm:px-6 text-xs text-muted-foreground">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>
            © {year} {BRAND.name}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Built by{" "}
            <a
              href={BRAND.author.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              {BRAND.author.name}
            </a>
          </span>
        </div>

        <nav aria-label="Footer links" className="flex items-center gap-4">
          <Link to="/help" className="hover:text-foreground transition-colors">
            Help
          </Link>
          <Link
            to="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
