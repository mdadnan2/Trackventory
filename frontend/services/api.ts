import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (idToken: string) => api.post('/auth/login', { idToken })
};

export const usersAPI = {
  create: (data: any) => api.post('/users', data),
  getAll: (page = 1, limit = 20) => api.get(`/users?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data)
};

export const itemsAPI = {
  create: (data: any) => api.post('/items', data),
  getAll: (page = 1, limit = 50) => api.get(`/items?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/items/${id}`),
  update: (id: string, data: any) => api.patch(`/items/${id}`, data)
};

export const packagesAPI = {
  create: (data: any) => api.post('/packages', data),
  getAll: (page = 1, limit = 50) => api.get(`/packages?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/packages/${id}`),
  update: (id: string, data: any) => api.patch(`/packages/${id}`, data)
};

export const citiesAPI = {
  create: (data: any) => api.post('/cities', data),
  getAll: (page = 1, limit = 100) => api.get(`/cities?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/cities/${id}`)
};

export const campaignsAPI = {
  create: (data: any) => api.post('/campaigns', data),
  getAll: (page = 1, limit = 50) => api.get(`/campaigns?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/campaigns/${id}`),
  update: (id: string, data: any) => api.patch(`/campaigns/${id}`, data)
};

export const stockAPI = {
  getCentralStock: (itemId?: string) => api.get(`/stock/central${itemId ? `?itemId=${itemId}` : ''}`),
  getVolunteerStock: (volunteerId: string, itemId?: string) => 
    api.get(`/stock/volunteer/${volunteerId}${itemId ? `?itemId=${itemId}` : ''}`),
  addStock: (data: any) => api.post('/stock/add', data),
  assignStock: (data: any) => api.post('/stock/assign', data)
};

export const distributionAPI = {
  create: (data: any) => api.post('/distribution', data),
  reportDamage: (data: any) => api.post('/distribution/damage', data),
  getAll: (params?: any) => api.get('/distribution', { params })
};

export const reportsAPI = {
  getStockSummary: () => api.get('/reports/stock-summary'),
  getVolunteerStock: () => api.get('/reports/volunteer-stock'),
  getCampaignDistribution: (campaignId?: string) => 
    api.get(`/reports/campaign-distribution${campaignId ? `?campaignId=${campaignId}` : ''}`),
  getRepeatDistribution: () => api.get('/reports/repeat-distribution')
};

export default api;
