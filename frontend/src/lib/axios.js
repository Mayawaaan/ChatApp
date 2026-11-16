import axios from "axios";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

const baseURL = API_ORIGIN
  ? `${API_ORIGIN}/api`
  : import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "/api";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
