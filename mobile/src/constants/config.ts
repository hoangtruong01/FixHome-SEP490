// src/constants/config.ts
export const APP_CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'FixHome',
  REQUEST_TIMEOUT: 15000,
};
