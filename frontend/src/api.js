import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getProducts = () => api.get('/products').then(r => r.data.data);

export const createProduct = (payload) => api.post('/products', payload).then(r => r.data);

export const postIncoming = (payload) => api.post('/products/incoming', payload).then(r => r.data);

export const postOutgoing = (payload) => api.post('/products/outgoing', payload).then(r => r.data);

export const getLogs = (limit = 50) => api.get(`/logs?limit=${limit}`).then(r => r.data.data);

export default api;
