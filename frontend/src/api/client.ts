import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:8081";

const client = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : "/api",
});

const isPublicRoute = (url?: string): boolean =>
  Boolean(
    url?.includes("/public/") ||
    url?.includes("/v1/auth/login")
  );

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && !isPublicRoute(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !isPublicRoute(error.config?.url)
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default client;