import axios from "axios";

// 1. Create the instance
const api = axios.create({
  // VITE_API_URL will be set in Vercel Dashboard later.
  // For now, it defaults to localhost so your code still works on your computer.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

// 2. Automatically add Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;