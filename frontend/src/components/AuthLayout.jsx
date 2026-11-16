import { lazy, Suspense, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { motion as Motion } from "motion/react";
import gsap from "gsap";
import { BRAND } from "../config/brand";
import { resolveColorMode, useThemeStore } from "../store/useThemeStore";
import ReliaLogo from "./ReliaLogo";

const ThreeScene = lazy(() => import("./ThreeScene"));

const SceneFallback = () => (
  <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
    <div className="w-36 h-24 rounded-2xl bg-muted animate-pulse" />
  </div>
);

const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
  reverseOnDesktop = false,
}) => {
  const { colorMode, toggleColorMode } = useThemeStore();
  const brandCopyRef = useRef(null);
  const isDark = resolveColorMode(colorMode) === "dark";

  useEffect(() => {
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !brandCopyRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".auth-brand-item", {
        y: 12,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
    }, brandCopyRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-background text-foreground">
      {/* Visual Brand + 3D Panel */}
      <div
        className={`hidden lg:flex lg:w-[48%] xl:w-[50%] flex-col justify-between p-10 xl:p-12 border-border bg-surface-elevated relative overflow-hidden ${
          reverseOnDesktop ? "lg:order-2 lg:border-l" : "lg:order-1 lg:border-r"
        }`}
      >
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/login" className="focus-visible:outline-2 rounded-md">
            <ReliaLogo size="md" />
          </Link>
        </div>

        <div className="relative flex-1 min-h-[340px] w-full my-4">
          <Suspense fallback={<SceneFallback />}>
            <ThreeScene />
          </Suspense>
        </div>

        <div ref={brandCopyRef} className="relative z-10 max-w-md space-y-1.5">
          <h2 className="auth-brand-item text-xl font-heading font-semibold text-foreground leading-snug">
            {BRAND.tagline}
          </h2>
          <p className="auth-brand-item text-sm text-muted-foreground leading-relaxed">
            {BRAND.description}
          </p>
        </div>
      </div>

      {/* Form Column */}
      <div
        className={`flex-1 flex flex-col min-h-dvh bg-surface ${
          reverseOnDesktop ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <div className="px-5 sm:px-8 pt-5 flex items-center justify-between">
          <div className="lg:hidden">
            <Link to="/login" className="focus-visible:outline-2 rounded-md">
              <ReliaLogo size="sm" />
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/settings"
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Preferences
            </Link>
            <button
              type="button"
              onClick={toggleColorMode}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </div>

        <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8">
          <Motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full max-w-[380px] space-y-6"
          >
            <div className="space-y-1">
              <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {children}

            {footer && (
              <div className="pt-3 border-t border-border text-xs text-muted-foreground">
                {footer}
              </div>
            )}
          </Motion.div>
        </main>

        <footer className="px-5 sm:px-8 pb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
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
          <div className="flex items-center gap-3">
            <Link to="/help" className="hover:text-foreground transition-colors">
              Help
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthLayout;
