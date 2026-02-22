import axios from 'axios';
import { auth } from '@/lib/firebase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (idToken: string) => api.post('/auth/login', { idToken })
};

export const usersAPI = {
  create: (data: any) => api.post('/users', data),
  getAll: (page?: number, limit?: number) => api.get('/users', { params: { page, limit } }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data)
};

export const itemsAPI = {
  create: (data: any) => api.post('/items', data),
  getAll: (page?: number, limit?: number) => api.get('/items', { params: { page, limit } }),
  getById: (id: string) => api.get(`/items/${id}`),
  update: (id: string, data: any) => api.patch(`/items/${id}`, data),
  toggleStatus: (id: string, isActive: boolean) => api.patch(`/items/${id}/toggle-status`, { isActive })
};

export const packagesAPI = {
  create: (data: any) => api.post('/packages', data),
  getAll: (page = 1, limit = 50) => api.get(`/packages?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/packages/${id}`),
  update: (id: string, data: any) => api.patch(`/packages/${id}`, data)
};

export const citiesAPI = {
  create: (data: any) => api.post('/cities', data),
  getAll: (page?: number, limit?: number) => api.get('/cities', { params: { page, limit } }),
  getById: (id: string) => api.get(`/cities/${id}`)
};

export const campaignsAPI = {
  create: (data: any) => api.post('/campaigns', data),
  getAll: (page?: number, limit?: number) => api.get('/campaigns', { params: { page, limit } }),
  getById: (id: string) => api.get(`/campaigns/${id}`),
  update: (id: string, data: any) => api.patch(`/campaigns/${id}`, data)
};

export const stockAPI = {
  getCentralStock: (itemId?: string) => {
    console.log('Calling getCentralStock:', { itemId });
    return api.get(`/stock/central${itemId ? `?itemId=${itemId}` : ''}`);
  },
  getVolunteerStock: (volunteerId: string, itemId?: string) => {
    console.log('Calling getVolunteerStock:', { volunteerId, itemId });
    return api.get(`/stock/volunteer/${volunteerId}${itemId ? `?itemId=${itemId}` : ''}`);
  },
  addStock: (data: any) => {
    console.log('Calling addStock:', data);
    return api.post('/stock/add', data);
  },
  assignStock: (data: any) => {
    console.log('Calling assignStock:', data);
    return api.post('/stock/assign', data);
  },
  returnStock: (data: any) => {
    console.log('Calling returnStock:', data);
    return api.post('/stock/return', data);
  }
};

export const distributionAPI = {
  create: (data: any) => api.post('/distribution', data),
  reportDamage: (data: any) => api.post('/distribution/damage', data),
  getAll: (params?: any) => api.get('/distribution', { params })
};

export const reportsAPI = {
  getStockSummary: (page?: number, limit?: number) => api.get('/reports/stock-summary', { params: { page, limit } }),
  getVolunteerStock: (page?: number, limit?: number) => api.get('/reports/volunteer-stock', { params: { page, limit } }),
  getCampaignDistribution: (campaignId?: string, page?: number, limit?: number) => 
    api.get('/reports/campaign-distribution', { params: { campaignId, page, limit } }),
  getRepeatDistribution: (page?: number, limit?: number) => api.get('/reports/repeat-distribution', { params: { page, limit } })
};

export default api;
