import axios from "axios";
import { API_BASE_URL } from "../config";
import { loadSession } from "./storage";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // fail fast on a bad rural connection instead of hanging the UI
});

api.interceptors.request.use(async (config) => {
  const session = await loadSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

export default api;
