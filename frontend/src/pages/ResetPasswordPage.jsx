import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { axiosInstance } from "../lib/axios";
import { getErrorMessage } from "../lib/utils";

const ResetPasswordPage = () => {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = paramToken || searchParams.get("token") || "";

  const [status, setStatus] = useState("verifying");
  const [statusError, setStatusError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const validateToken = async () => {
      if (!token) {
        if (active) {
          setStatus("invalid");
          setStatusError("This password reset link is missing a valid token.");
        }
        return;
      }

      try {
        await axiosInstance.get(
          `/auth/reset-password/${encodeURIComponent(token)}`
        );
        if (active) setStatus("valid");
      } catch (error) {
        if (active) {
          setStatus("invalid");
          setStatusError(
            getErrorMessage(
              error,
              "This password reset link is invalid or has expired."
            )
          );
        }
      }
    };

    validateToken();
    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setFormError("Please enter and confirm your new password.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      await axiosInstance.post(
        `/auth/reset-password/${encodeURIComponent(token)}`,
        { password }
      );
      setStatus("success");
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to update your password. Request a new link."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    status === "success"
      ? "Password updated"
      : status === "invalid"
        ? "Reset link unavailable"
        : "Set a new password";

  const subtitle =
    status === "success"
      ? "Your Relia password has been changed successfully."
      : status === "invalid"
        ? "Please request a new password reset link."
        : "Choose a strong password for your Relia account.";

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
      footer={
        <div className="flex justify-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </div>
      }
    >
      {status === "verifying" && (
        <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="size-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Verifying your reset link…
          </p>
        </div>
      )}

      {status === "invalid" && (
        <div className="space-y-4">
          <div
            role="alert"
            className="p-4 rounded-lg bg-destructive/10 border border-destructive/25 space-y-1 text-sm"
          >
            <p className="font-medium text-foreground">
              Link expired or invalid
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {statusError}
            </p>
          </div>

          <Link
            to="/forgot-password"
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold flex items-center justify-center transition-colors"
          >
            Request new reset link
          </Link>
        </div>
      )}

      {status === "valid" && (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div
              role="alert"
              className="px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/25 text-xs font-medium text-destructive"
            >
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="reset-password"
              className="block text-xs font-medium text-foreground"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setFormError("");
                  setPassword(e.target.value);
                }}
                placeholder="Minimum 6 characters"
                className="w-full h-10 px-3 pr-10 text-sm rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="reset-confirm-password"
              className="block text-xs font-medium text-foreground"
            >
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setFormError("");
                  setConfirmPassword(e.target.value);
                }}
                placeholder="Re-enter your new password"
                className="w-full h-10 px-3 pr-10 text-sm rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 mt-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Updating password…</span>
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted border border-border space-y-1 text-sm">
            <p className="font-medium text-foreground">All set</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              You can now sign in with your new password.
            </p>
          </div>

          <Link
            to="/login"
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold flex items-center justify-center transition-colors"
          >
            Continue to sign in
          </Link>
        </div>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
