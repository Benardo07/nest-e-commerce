import axios from 'axios';
import { envConfig } from './env';
import { authTokenAtom } from '../store/auth';
import { getDefaultStore } from 'jotai';

const store = getDefaultStore();

export const httpClient = axios.create({
  baseURL: envConfig.VITE_API_URL,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  const token = store.get(authTokenAtom);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      store.set(authTokenAtom, null);
    }
    return Promise.reject(error);
  },
);
