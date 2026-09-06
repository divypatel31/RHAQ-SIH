import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rhaq_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 anywhere means the session is dead — clear it so the next render
// redirects to login instead of hammering the API with a bad token.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("rhaq_token");
      localStorage.removeItem("rhaq_user");
    }
    return Promise.reject(err);
  }
);

export default api;
