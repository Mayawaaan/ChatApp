import { create } from 'zustand';

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem('app-theme') || 'theme-indigo', // Default theme
    setTheme: (newTheme) => {
        set({ theme: newTheme });
        localStorage.setItem('app-theme', newTheme);
    },
    // Define your themes here for easy access in components
    themes: [
        'theme-indigo', 'theme-blue', 'theme-green', 'theme-red', 'theme-purple', 'theme-pink',
        'theme-yellow', 'theme-teal', 'theme-orange', 'theme-gray', 'theme-emerald', 'theme-cyan',
        'theme-lime', 'theme-sky', 'theme-rose', 'theme-fuchsia', 'theme-violet', 'theme-amber'
    ],
}));