import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lucem_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("lucem_token");
      localStorage.removeItem("lucem_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export function fileUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${baseURL}${path}`;
}

export default api;
