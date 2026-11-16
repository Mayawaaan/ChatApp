import { create } from "zustand";

const STORAGE_KEY = "relia-notification-prefs";

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        inAppToasts: true,
        showMessagePreview: true,
        browserNotifications: false,
        soundEnabled: false,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      inAppToasts: parsed.inAppToasts !== false,
      showMessagePreview: parsed.showMessagePreview !== false,
      browserNotifications: Boolean(parsed.browserNotifications),
      soundEnabled: Boolean(parsed.soundEnabled),
    };
  } catch {
    return {
      inAppToasts: true,
      showMessagePreview: true,
      browserNotifications: false,
      soundEnabled: false,
    };
  }
};

const savePrefs = (prefs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota errors
  }
};

export const isBrowserNotificationSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

export const getBrowserNotificationPermission = () => {
  if (!isBrowserNotificationSupported()) return "unsupported";
  return window.Notification.permission;
};

export const playSubtleNotificationTone = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    osc.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {
    // Ignore autoplay blocks
  }
};

const initial = loadPrefs();

const snapshot = (s) => ({
  inAppToasts: s.inAppToasts,
  showMessagePreview: s.showMessagePreview,
  browserNotifications: s.browserNotifications,
  soundEnabled: s.soundEnabled,
});

export const useNotificationStore = create((set, get) => ({
  inAppToasts: initial.inAppToasts,
  showMessagePreview: initial.showMessagePreview,
  browserNotifications: initial.browserNotifications,
  soundEnabled: initial.soundEnabled,
  permission: getBrowserNotificationPermission(),

  syncPermission: () => {
    set({ permission: getBrowserNotificationPermission() });
  },

  setInAppToasts: (value) => {
    set({ inAppToasts: value });
    savePrefs({ ...snapshot(get()), inAppToasts: value });
  },

  setShowMessagePreview: (value) => {
    set({ showMessagePreview: value });
    savePrefs({ ...snapshot(get()), showMessagePreview: value });
  },

  setSoundEnabled: (value) => {
    set({ soundEnabled: value });
    savePrefs({ ...snapshot(get()), soundEnabled: value });
  },

  setBrowserNotifications: (value) => {
    set({ browserNotifications: value });
    savePrefs({ ...snapshot(get()), browserNotifications: value });
  },

  requestBrowserPermission: async () => {
    if (!isBrowserNotificationSupported()) {
      set({ permission: "unsupported", browserNotifications: false });
      return "unsupported";
    }
    const result = await window.Notification.requestPermission();
    const enabled = result === "granted";
    set({ permission: result, browserNotifications: enabled });
    savePrefs({ ...snapshot(get()), browserNotifications: enabled });
    return result;
  },
}));
