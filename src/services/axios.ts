import axios, { type InternalAxiosRequestConfig } from 'axios';
import { store } from '../app/store';
import { tokenStorage } from '../utils/tokenStorage';
import { logout, setAccessToken } from '../app/slices/authSlice';
import { addToast } from '../app/slices/notificationSlice';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Attach the access token from Redux to every request

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR: Handle 401s and transparent token refresh

// RESPONSE INTERCEPTOR: Handle 401s, 429s, and transparent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // NEW: Handle Rate Limiting Globally
    if (error.response?.status === 429) {
      store.dispatch(
        addToast({
          message: 'You are making requests too quickly. Please slow down.',
          type: 'warning',
        }),
      );
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        );

        const newAccessToken = response.data.data.accessToken;

        store.dispatch(setAccessToken(newAccessToken));
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        tokenStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
