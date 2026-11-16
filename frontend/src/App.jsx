import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MotionConfig } from "motion/react";
import { Loader2 } from "lucide-react";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import MessageNotificationListener from "./components/MessageNotificationListener.jsx";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import Settings from "./pages/Settings.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { useAuthStore } from "./store/useAuthStore.js";
import { resolveColorMode, useThemeStore } from "./store/useThemeStore.js";
import { BRAND } from "./config/brand.js";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme, colorMode } = useThemeStore();

  useEffect(() => {
    const applyTheme = () => {
      const resolved = resolveColorMode(colorMode);
      const root = document.documentElement;
      root.className = `${theme} ${resolved === "dark" ? "dark" : ""}`.trim();
    };

    applyTheme();

    if (colorMode === "system" && window.matchMedia) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", applyTheme);
      return () => media.removeEventListener("change", applyTheme);
    }
  }, [theme, colorMode]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center h-dvh bg-background text-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Loading {BRAND.name}…</p>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh flex flex-col bg-background text-foreground">
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              fontSize: "13px",
              boxShadow: "0 10px 25px -5px rgba(9, 9, 11, 0.14)",
            },
          }}
        />
        <MessageNotificationListener />
        <Navbar />
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route
              path="/"
              element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/signup"
              element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/forgot-password"
              element={
                !authUser ? <ForgotPasswordPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/reset-password"
              element={
                !authUser ? <ResetPasswordPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                !authUser ? <ResetPasswordPage /> : <Navigate to="/" replace />
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/profile"
              element={
                authUser ? <ProfilePage /> : <Navigate to="/login" replace />
              }
            />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </MotionConfig>
  );
};

export default App;
