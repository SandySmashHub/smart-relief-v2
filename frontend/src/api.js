// src/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'https://smart-relief-backend.onrender.com/api' });

API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('srToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default API;
