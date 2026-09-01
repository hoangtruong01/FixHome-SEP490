// src/api/client.ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '../constants';
import { storageService } from '../services/storage.service';

const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach JWT token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storageService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor – handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: Handle token expiration – navigate to login
      await storageService.removeToken();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
