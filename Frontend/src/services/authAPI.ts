// src/services/authAPI.ts
import api from './api'; // Axios instance

export const authAPI = {
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  logout: () => api.post('/auth/logout'),

  refresh: () => api.post('/auth/refresh'),
};