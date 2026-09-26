import axios, { AxiosInstance } from "axios";

const apiUser: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach token from localStorage as fallback if exists,
// while httpOnly cookie is automatically attached by the browser
apiUser.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("user_token") || localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiUser.interceptors.response.use(
  (response) => response,
  (error) => {
    // Graceful error handling
    if (error.response?.status === 401) {
      // Session expired or unauthenticated
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_token");
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

export default apiUser;
