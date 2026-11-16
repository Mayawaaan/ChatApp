import { create } from "zustand";

export const THEME_OPTIONS = [
  { id: "theme-indigo", label: "Indigo", swatch: "#4f46e5" },
  { id: "theme-blue", label: "Blue", swatch: "#2563eb" },
  { id: "theme-sky", label: "Sky", swatch: "#0284c7" },
  { id: "theme-cyan", label: "Cyan", swatch: "#0891b2" },
  { id: "theme-teal", label: "Teal", swatch: "#0d9488" },
  { id: "theme-emerald", label: "Emerald", swatch: "#059669" },
  { id: "theme-green", label: "Green", swatch: "#16a34a" },
  { id: "theme-lime", label: "Lime", swatch: "#65a30d" },
  { id: "theme-yellow", label: "Yellow", swatch: "#ca8a04" },
  { id: "theme-amber", label: "Amber", swatch: "#d97706" },
  { id: "theme-orange", label: "Orange", swatch: "#ea580c" },
  { id: "theme-red", label: "Red", swatch: "#dc2626" },
  { id: "theme-rose", label: "Rose", swatch: "#e11d48" },
  { id: "theme-pink", label: "Pink", swatch: "#db2777" },
  { id: "theme-fuchsia", label: "Fuchsia", swatch: "#c026d3" },
  { id: "theme-purple", label: "Purple", swatch: "#9333ea" },
  { id: "theme-violet", label: "Violet", swatch: "#7c3aed" },
  { id: "theme-gray", label: "Graphite", swatch: "#3f3f46" },
];

export const resolveColorMode = (mode) => {
  if (mode === "light" || mode === "dark") return mode;
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
};

const getInitialColorMode = () => {
  const saved = localStorage.getItem("app-color-mode");
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  return "system";
};

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("app-theme") || "theme-indigo",
  colorMode: getInitialColorMode(),
  setTheme: (newTheme) => {
    set({ theme: newTheme });
    localStorage.setItem("app-theme", newTheme);
  },
  setColorMode: (mode) => {
    set({ colorMode: mode });
    localStorage.setItem("app-color-mode", mode);
  },
  toggleColorMode: () =>
    set((state) => {
      const currentResolved = resolveColorMode(state.colorMode);
      const next = currentResolved === "dark" ? "light" : "dark";
      localStorage.setItem("app-color-mode", next);
      return { colorMode: next };
    }),
  themes: THEME_OPTIONS.map((t) => t.id),
}));
