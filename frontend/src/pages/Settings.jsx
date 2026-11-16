import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import toast from "react-hot-toast";
import { THEME_OPTIONS, useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { usePreferencesStore } from "../store/usePreferencesStore";
import {
  isBrowserNotificationSupported,
  playSubtleNotificationTone,
  useNotificationStore,
} from "../store/useNotificationStore";
import { formatMessageTime } from "../lib/utils";

const ToggleSwitch = ({ id, checked, onChange, disabled = false, label }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-150 focus-visible:outline-2 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer ${
      checked ? "bg-primary" : "bg-muted-foreground/30"
    }`}
  >
    <span
      className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-2xs transform transition-transform duration-150 ${
        checked ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
);

const SegmentedControl = ({ value, onChange, options, ariaLabel }) => (
  <div
    role="group"
    aria-label={ariaLabel}
    className="inline-flex p-0.5 rounded-lg bg-muted border border-border/80 text-xs font-medium"
  >
    {options.map((opt) => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            active
              ? "bg-surface text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

const SECTIONS = [
  { id: "appearance", label: "Appearance" },
  { id: "messaging", label: "Messaging" },
  { id: "notifications", label: "Notifications" },
];

const Settings = () => {
  const { authUser } = useAuthStore();
  const { theme, setTheme, colorMode, setColorMode } = useThemeStore();
  const {
    density,
    timeFormat,
    enterToSend,
    sendTypingIndicators,
    sendReadReceipts,
    showMessageAvatars,
    contactSort,
    setPreference,
    resetPreferences,
  } = usePreferencesStore();
  const {
    inAppToasts,
    showMessagePreview,
    browserNotifications,
    soundEnabled,
    permission,
    syncPermission,
    setInAppToasts,
    setShowMessagePreview,
    setBrowserNotifications,
    setSoundEnabled,
    requestBrowserPermission,
  } = useNotificationStore();

  const [activeSection, setActiveSection] = useState("appearance");
  const [showAllThemes, setShowAllThemes] = useState(false);

  useEffect(() => {
    syncPermission();
  }, [syncPermission]);

  const handleEnableBrowserNotifications = async () => {
    const result = await requestBrowserPermission();
    if (result === "granted") {
      toast.success("Browser notifications enabled");
    } else if (result === "denied") {
      toast.error("Notifications are blocked in your browser settings");
    }
  };

  const handleSendTestAlert = () => {
    if (soundEnabled) {
      playSubtleNotificationTone();
    }
    toast.success(
      showMessagePreview
        ? "Emma Thompson: Looking forward to syncing later today."
        : "New message from Emma Thompson"
    );
  };

  const browserSupported = isBrowserNotificationSupported();
  const visibleThemes = showAllThemes
    ? THEME_OPTIONS
    : THEME_OPTIONS.slice(0, 8);

  return (
    <main className="flex-1 bg-background py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-xl font-heading font-semibold text-foreground">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customize display density, messaging behavior, and alerts.
            </p>
          </div>
          <Link
            to={authUser ? "/" : "/login"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            {authUser ? "Back to messages" : "Sign in"}
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Category Navigation */}
          <aside className="md:w-48 shrink-0 space-y-4">
            <nav aria-label="Settings sections" className="flex md:flex-col gap-1">
              {SECTIONS.map((sec) => {
                const active = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {sec.label}
                  </button>
                );
              })}
            </nav>

            <div className="hidden md:block pt-4 border-t border-border space-y-1 text-xs">
              {authUser && (
                <Link
                  to="/profile"
                  className="block px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  Account & password
                </Link>
              )}
              <Link
                to="/help"
                className="block px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                Help & shortcuts
              </Link>
              <Link
                to="/privacy"
                className="block px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy policy
              </Link>
              <Link
                to="/terms"
                className="block px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of service
              </Link>
            </div>
          </aside>

          {/* Settings Content Panel */}
          <div className="flex-1 min-w-0 space-y-6">
            {activeSection === "appearance" && (
              <div className="space-y-6">
                <section className="rounded-xl border border-border bg-surface divide-y divide-border">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Interface theme
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Match your system appearance or lock light or dark mode.
                      </p>
                    </div>
                    <SegmentedControl
                      ariaLabel="Interface theme"
                      value={colorMode}
                      onChange={setColorMode}
                      options={[
                        { value: "system", label: "System" },
                        { value: "light", label: "Light" },
                        { value: "dark", label: "Dark" },
                      ]}
                    />
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Accent color
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Used for primary actions and outgoing messages.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAllThemes((v) => !v)}
                        className="text-xs font-medium text-primary hover:underline cursor-pointer"
                      >
                        {showAllThemes ? "Show fewer" : `All ${THEME_OPTIONS.length}`}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      {visibleThemes.map((opt) => {
                        const active = theme === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTheme(opt.id)}
                            aria-label={`Select ${opt.label} accent`}
                            aria-pressed={active}
                            title={opt.label}
                            className={`size-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                              active
                                ? "ring-2 ring-offset-2 ring-offset-surface ring-foreground scale-105"
                                : "hover:scale-105 opacity-90 hover:opacity-100"
                            }`}
                            style={{ backgroundColor: opt.swatch }}
                          >
                            {active && <Check className="size-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Message density
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Adjust spacing between message bubbles and contacts.
                      </p>
                    </div>
                    <SegmentedControl
                      ariaLabel="Message density"
                      value={density}
                      onChange={(val) => setPreference("density", val)}
                      options={[
                        { value: "comfortable", label: "Comfortable" },
                        { value: "compact", label: "Compact" },
                      ]}
                    />
                  </div>

                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Time format
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Format used for message and sidebar timestamps.
                      </p>
                    </div>
                    <SegmentedControl
                      ariaLabel="Time format"
                      value={timeFormat}
                      onChange={(val) => setPreference("timeFormat", val)}
                      options={[
                        { value: "24h", label: "24-hour" },
                        { value: "12h", label: "12-hour" },
                      ]}
                    />
                  </div>

                  <div className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <label
                        htmlFor="toggle-message-avatars"
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        Show contact avatars in threads
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Display small profile avatars beside incoming message groups.
                      </p>
                    </div>
                    <ToggleSwitch
                      id="toggle-message-avatars"
                      label="Show contact avatars in threads"
                      checked={showMessageAvatars}
                      onChange={(val) =>
                        setPreference("showMessageAvatars", val)
                      }
                    />
                  </div>
                </section>

                {/* Live Preview */}
                <section className="rounded-xl border border-border bg-background p-4 space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Live preview
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-start">
                      <div
                        className={`max-w-xs rounded-xl rounded-bl-[4px] bg-[var(--bubble-incoming)] text-[var(--bubble-incoming-foreground)] border border-border/80 text-sm ${
                          density === "compact" ? "px-3 py-1.5" : "px-3.5 py-2"
                        }`}
                      >
                        Are we still on for the review?
                        <span className="ml-2 text-[10px] text-muted-foreground tabular-nums">
                          {formatMessageTime(new Date(), timeFormat)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div
                        className={`max-w-xs rounded-xl rounded-br-[4px] bg-[var(--bubble-outgoing)] text-[var(--bubble-outgoing-foreground)] text-sm ${
                          density === "compact" ? "px-3 py-1.5" : "px-3.5 py-2"
                        }`}
                      >
                        Yes, sharing the notes in a moment.
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeSection === "messaging" && (
              <div className="space-y-4">
                <section className="rounded-xl border border-border bg-surface divide-y divide-border">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Composer send shortcut
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Choose whether pressing Enter sends immediately or adds a
                        new line.
                      </p>
                    </div>
                    <SegmentedControl
                      ariaLabel="Composer send shortcut"
                      value={enterToSend ? "enter" : "mod-enter"}
                      onChange={(val) =>
                        setPreference("enterToSend", val === "enter")
                      }
                      options={[
                        { value: "enter", label: "Enter" },
                        { value: "mod-enter", label: "Ctrl + Enter" },
                      ]}
                    />
                  </div>

                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Contact list order
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Control how conversations are ordered in the sidebar.
                      </p>
                    </div>
                    <SegmentedControl
                      ariaLabel="Contact list order"
                      value={contactSort}
                      onChange={(val) => setPreference("contactSort", val)}
                      options={[
                        { value: "recent", label: "Recent" },
                        { value: "online", label: "Online first" },
                        { value: "name", label: "A–Z" },
                      ]}
                    />
                  </div>

                  <div className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <label
                        htmlFor="toggle-typing-indicators"
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        Send typing indicators
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Let contacts see when you are actively typing a reply.
                      </p>
                    </div>
                    <ToggleSwitch
                      id="toggle-typing-indicators"
                      label="Send typing indicators"
                      checked={sendTypingIndicators}
                      onChange={(val) =>
                        setPreference("sendTypingIndicators", val)
                      }
                    />
                  </div>

                  <div className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <label
                        htmlFor="toggle-read-receipts"
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        Send read receipts
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Notify senders when you open and read their messages.
                      </p>
                    </div>
                    <ToggleSwitch
                      id="toggle-read-receipts"
                      label="Send read receipts"
                      checked={sendReadReceipts}
                      onChange={(val) => setPreference("sendReadReceipts", val)}
                    />
                  </div>
                </section>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      resetPreferences();
                      toast.success("Messaging preferences reset to defaults");
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    Reset messaging defaults
                  </button>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-4">
                <section className="rounded-xl border border-border bg-surface divide-y divide-border">
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <label
                        htmlFor="toggle-in-app-toasts"
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        In-app message toasts
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Show a subtle toast when a message arrives in another
                        conversation.
                      </p>
                    </div>
                    <ToggleSwitch
                      id="toggle-in-app-toasts"
                      label="In-app message toasts"
                      checked={inAppToasts}
                      onChange={setInAppToasts}
                    />
                  </div>

                  <div className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <label
                        htmlFor="toggle-notification-preview"
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        Show message preview in alerts
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Turn off to hide message text inside toasts and desktop
                        notifications.
                      </p>
                    </div>
                    <ToggleSwitch
                      id="toggle-notification-preview"
                      label="Show message preview in alerts"
                      checked={showMessagePreview}
                      onChange={setShowMessagePreview}
                    />
                  </div>

                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          Browser notifications
                        </span>
                        {permission === "granted" && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-success">
                            Allowed
                          </span>
                        )}
                        {permission === "denied" && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-destructive/10 text-destructive">
                            Blocked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {!browserSupported
                          ? "This browser does not support desktop notifications."
                          : permission === "denied"
                            ? "Blocked in browser site settings. Allow notifications there to enable."
                            : "Deliver desktop alerts when Relia is in a background tab."}
                      </p>
                    </div>

                    {browserSupported && permission === "default" && (
                      <button
                        type="button"
                        onClick={handleEnableBrowserNotifications}
                        className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        Enable notifications
                      </button>
                    )}

                    {browserSupported && permission === "granted" && (
                      <ToggleSwitch
                        id="toggle-browser-notifications"
                        label="Browser notifications"
                        checked={browserNotifications}
                        onChange={setBrowserNotifications}
                      />
                    )}
                  </div>

                  <div className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <label
                        htmlFor="toggle-notification-sound"
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        Notification chime
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Play a soft chime for incoming alerts outside the active
                        conversation.
                      </p>
                    </div>
                    <ToggleSwitch
                      id="toggle-notification-sound"
                      label="Notification chime"
                      checked={soundEnabled}
                      onChange={setSoundEnabled}
                    />
                  </div>
                </section>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSendTestAlert}
                    className="px-3.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
                  >
                    Test notification
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
