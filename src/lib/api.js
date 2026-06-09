import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("canteen_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 ||
      error.response?.data?.message?.includes("jwt expired")
    ) {
      localStorage.removeItem("canteen_token");
      localStorage.removeItem("canteen_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);
export default api;
