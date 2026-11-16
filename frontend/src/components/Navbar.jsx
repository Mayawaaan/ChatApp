import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { resolveColorMode, useThemeStore } from "../store/useThemeStore";
import { BRAND } from "../config/brand";
import BrandLogo from "./BrandLogo";
import Avatar from "./Avatar";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const Navbar = () => {
  const { authUser, logout, socketStatus } = useAuthStore();
  const { sessionUnreadByUser } = useChatStore();
  const { colorMode, toggleColorMode } = useThemeStore();
  const location = useLocation();

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  if (isAuthRoute) {
    return null;
  }

  const totalUnread = Object.values(sessionUnreadByUser).reduce(
    (sum, n) => sum + (n || 0),
    0
  );

  const isDark = resolveColorMode(colorMode) === "dark";

  const navLinkClass = (active) =>
    `inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs sm:text-[13px] font-medium transition-colors duration-150 ${
      active
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-30 h-12 border-b border-border bg-surface">
      <div className="h-full px-3 sm:px-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            to={authUser ? "/" : "/login"}
            className="rounded-md focus-visible:outline-2"
            aria-label={`${BRAND.name} Home`}
          >
            <BrandLogo size="sm" />
          </Link>

          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {authUser && (
              <Link to="/" className={navLinkClass(location.pathname === "/")}>
                <span>Messages</span>
                {totalUnread > 0 && (
                  <span className="inline-flex items-center justify-center min-w-4.5 h-4 px-1 rounded-full text-[10px] font-semibold tabular-nums bg-primary text-primary-foreground">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/settings"
              className={navLinkClass(location.pathname === "/settings")}
            >
              Settings
            </Link>

            <Link
              to="/help"
              className={`${navLinkClass(location.pathname === "/help")} hidden sm:inline-flex`}
            >
              Help
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {authUser && socketStatus === "reconnecting" && (
            <span
              role="status"
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-warning border border-amber-500/20"
            >
              <span className="size-1.5 rounded-full bg-warning animate-pulse" />
              Reconnecting
            </span>
          )}

          <button
            type="button"
            onClick={toggleColorMode}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {authUser ? (
            <>
              <Link
                to="/profile"
                className={`inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  location.pathname === "/profile"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Avatar
                  src={authUser.profilePic}
                  name={authUser.fullName}
                  size="xs"
                />
                <span className="hidden md:inline max-w-28 truncate text-foreground">
                  {authUser.fullName}
                </span>
              </Link>

              <button
                type="button"
                onClick={logout}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
