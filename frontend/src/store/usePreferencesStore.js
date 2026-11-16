import { create } from "zustand";

const STORAGE_KEY = "relia-user-preferences";

const DEFAULTS = {
  density: "comfortable", // 'comfortable' | 'compact'
  timeFormat: "24h", // '24h' | '12h'
  enterToSend: true, // true: Enter sends, false: Ctrl/Cmd+Enter sends
  sendTypingIndicators: true,
  sendReadReceipts: true,
  showMessageAvatars: true,
  contactSort: "recent", // 'recent' | 'name' | 'online'
};

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
};

const persistPrefs = (state) => {
  try {
    const {
      density,
      timeFormat,
      enterToSend,
      sendTypingIndicators,
      sendReadReceipts,
      showMessageAvatars,
      contactSort,
    } = state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        density,
        timeFormat,
        enterToSend,
        sendTypingIndicators,
        sendReadReceipts,
        showMessageAvatars,
        contactSort,
      })
    );
  } catch {
    // Ignore storage errors
  }
};

export const usePreferencesStore = create((set, get) => ({
  ...loadPrefs(),

  setPreference: (key, value) => {
    set({ [key]: value });
    persistPrefs({ ...get(), [key]: value });
  },

  resetPreferences: () => {
    set(DEFAULTS);
    persistPrefs(DEFAULTS);
  },
}));
