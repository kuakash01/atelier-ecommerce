import axios, { AxiosInstance } from "axios";

const apiAdmin: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
});

apiAdmin.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // ONLY use dedicated admin tokens — never fallback to storefront customer token
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("admin_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/admin/signin")
      ) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("adminInfo");
        window.location.href = "/admin/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default apiAdmin;
