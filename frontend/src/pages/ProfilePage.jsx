import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "../components/Avatar";

const ProfilePage = () => {
  const {
    authUser,
    updateProfile,
    isUpdatingProfile,
    changePassword,
    isChangingPassword,
  } = useAuthStore();

  const [selectedPreview, setSelectedPreview] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const fileInputRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setSelectedPreview(null);
    setFullName(authUser?.fullName || "");
  }, [authUser]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelPreview = () => {
    setSelectedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (isUpdatingProfile) return;

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      toast.error("Display name cannot be empty");
      return;
    }

    const payload = {};
    if (trimmedName !== authUser.fullName) {
      payload.fullName = trimmedName;
    }
    if (selectedPreview) {
      payload.profilePic = selectedPreview;
    }
    if (Object.keys(payload).length === 0) return;

    const ok = await updateProfile(payload);
    if (ok) {
      setSelectedPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Complete all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    const ok = await changePassword({ currentPassword, newPassword });
    if (ok) {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  if (!authUser) return null;

  const displayedPic = selectedPreview || authUser.profilePic;
  const hasProfileChanges =
    Boolean(selectedPreview) || fullName.trim() !== authUser.fullName;

  return (
    <main className="flex-1 bg-background py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-xl font-heading font-semibold text-foreground">
              Profile & Security
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update your display name, photo, and account password.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to messages
          </Link>
        </div>

        {/* Profile Identity & Display Name */}
        <form
          onSubmit={handleSaveProfile}
          className="rounded-xl border border-border bg-surface p-6 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative self-start">
              <Avatar
                src={displayedPic}
                name={fullName || authUser.fullName}
                size="xl"
              />
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdatingProfile}
                aria-label="Choose profile photo"
                className="absolute -bottom-1 -right-1 size-8 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
              >
                <Camera className="size-3.5" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-base font-heading font-semibold text-foreground">
                {authUser.fullName}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isUpdatingProfile
                  ? "Saving your profile changes…"
                  : "PNG or JPG recommended. Your name and photo appear across conversations."}
              </p>

              <div className="pt-0.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUpdatingProfile}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface-elevated hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer disabled:opacity-50"
                >
                  Upload photo
                </button>
                {selectedPreview && (
                  <button
                    type="button"
                    onClick={handleCancelPreview}
                    disabled={isUpdatingProfile}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Discard
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-border space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-full-name"
                className="block text-xs font-medium text-foreground"
              >
                Display name
              </label>
              <input
                id="profile-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg bg-surface-elevated border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring transition-colors"
              />
            </div>

            {hasProfileChanges && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold transition-colors cursor-pointer disabled:opacity-55"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Account Information */}
        <section className="rounded-xl border border-border bg-surface divide-y divide-border">
          <div className="px-6 py-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account details
            </h3>
          </div>

          <div className="px-6 py-3.5 flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Email address</span>
            <span className="font-medium text-foreground truncate">
              {authUser.email}
            </span>
          </div>

          <div className="px-6 py-3.5 flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium text-foreground tabular-nums">
              {authUser.createdAt
                ? new Date(authUser.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Active"}
            </span>
          </div>

          <div className="px-6 py-3.5 flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <span className="size-1.5 rounded-full bg-success" />
              Active
            </span>
          </div>
        </section>

        {/* Change Password */}
        <form
          onSubmit={handleChangePassword}
          className="rounded-xl border border-border bg-surface p-6 space-y-4"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Update password
          </h3>

          {passwordError && (
            <div
              role="alert"
              className="px-3.5 py-2.5 rounded-lg bg-destructive/10 border border-destructive/25 text-xs font-medium text-destructive"
            >
              {passwordError}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="current-password"
              className="block text-xs font-medium text-foreground"
            >
              Current password
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordError("");
                  setPasswordForm((p) => ({
                    ...p,
                    currentPassword: e.target.value,
                  }));
                }}
                className="w-full h-10 px-3 pr-10 text-sm rounded-lg bg-surface-elevated border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={
                  showCurrent ? "Hide current password" : "Show current password"
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showCurrent ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="block text-xs font-medium text-foreground"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordError("");
                    setPasswordForm((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }));
                  }}
                  placeholder="Min. 6 characters"
                  className="w-full h-10 px-3 pr-10 text-sm rounded-lg bg-surface-elevated border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showNew ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-new-password"
                className="block text-xs font-medium text-foreground"
              >
                Confirm new password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordError("");
                  setPasswordForm((p) => ({
                    ...p,
                    confirmPassword: e.target.value,
                  }));
                }}
                className="w-full h-10 px-3 text-sm rounded-lg bg-surface-elevated border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface-elevated hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer disabled:opacity-55"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Updating…</span>
                </>
              ) : (
                "Update password"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ProfilePage;
