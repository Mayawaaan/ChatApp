import axios from "axios";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

const baseURL = API_ORIGIN
  ? `${API_ORIGIN}/api`
  : import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "/api";

const TOKEN_STORAGE_KEY = "bloop-auth-token";
let memoryAuthToken = null;

export const getStoredAuthToken = () => {
  if (memoryAuthToken) return memoryAuthToken;
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) memoryAuthToken = token;
    return token;
  } catch {
    return memoryAuthToken;
  }
};

export const setStoredAuthToken = (token) => {
  memoryAuthToken = token || null;
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Keep memory token fallback even if localStorage is restricted
  }
};

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
