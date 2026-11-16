import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { axiosInstance } from "../lib/axios";
import { getErrorMessage } from "../lib/utils";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your account email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setIsUnavailable(false);

    try {
      const res = await axiosInstance.post("/auth/forgot-password", {
        email: trimmed,
      });
      setServerMessage(
        res.data?.message ||
          "If an account exists for that email address, we have sent password reset instructions."
      );
      setIsSubmitted(true);
    } catch (error) {
      if (error?.response?.data?.code === "EMAIL_SERVICE_UNAVAILABLE") {
        setIsUnavailable(true);
      }
      setErrorMessage(
        getErrorMessage(error, "Unable to process password reset request.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={isSubmitted ? "Check your inbox" : "Reset your password"}
      subtitle={
        isSubmitted
          ? "Password reset instructions have been processed."
          : "Enter the email address associated with your Relia account."
      }
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
      {isSubmitted ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted border border-border space-y-1 text-sm">
            <p className="font-medium text-foreground">Request received</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {serverMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setEmail("");
            }}
            className="w-full h-10 rounded-lg border border-border bg-surface-elevated hover:bg-muted text-sm font-medium text-foreground transition-colors cursor-pointer"
          >
            Try a different email
          </button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {errorMessage && (
            <div
              role="alert"
              className={`px-3 py-2.5 rounded-lg border text-xs leading-relaxed ${
                isUnavailable
                  ? "bg-amber-500/10 border-amber-500/25 text-warning"
                  : "bg-destructive/10 border-destructive/25 text-destructive"
              }`}
            >
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="forgot-email"
              className="block text-xs font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setErrorMessage("");
                setIsUnavailable(false);
                setEmail(e.target.value);
              }}
              placeholder="name@company.com"
              className="w-full h-10 px-3 text-sm rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Sending reset link…</span>
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
