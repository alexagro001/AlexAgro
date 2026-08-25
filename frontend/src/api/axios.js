import axios from "axios";

// Set VITE_API_URL in frontend/.env (see frontend/.env.example).
// Falls back to localhost so `npm run dev` works out of the box.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("alexagro_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith("/admin")) {
      localStorage.removeItem("alexagro_admin_token");
      localStorage.removeItem("alexagro_admin_profile");
      if (!window.location.pathname.endsWith("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
