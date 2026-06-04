import axios from "axios";

// Change this string to your absolute live Render backend engine link
const LIVE_BACKEND_URL = "https://welcome-water-backend.onrender.com";

const api = axios.create({
  baseURL: `${LIVE_BACKEND_URL}/api`,
});

// These handlers are perfect and can stay exactly as they are:
export const getProducts = () => api.get("/products").then((r) => r.data.data);

export const createProduct = (payload) =>
  api.post("/products", payload).then((r) => r.data);

export const postIncoming = (payload) =>
  api.post("/products/incoming", payload).then((r) => r.data);

export const postOutgoing = (payload) =>
  api.post("/products/outgoing", payload).then((r) => r.data);

export const getLogs = (limit = 50) =>
  api.get(`/logs?limit=${limit}`).then((r) => r.data.data);

export default api;
