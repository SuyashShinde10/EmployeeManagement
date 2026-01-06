import axios from "axios";

// 1. Create the Axios instance
const api = axios.create({
  // VITE_API_URL will be set in Vercel Dashboard later.
  // For now, it defaults to localhost so your code still works on your computer.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Automatically add Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Handle Global Errors (Optional but recommended)
// This catches 401 (Unauthorized) errors if the token expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Logout user if token is invalid
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;