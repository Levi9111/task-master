import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/user.types';
import { tokenStorage } from '../utils/tokenStorage';
import { api } from './axios';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginPayload) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: Omit<User, '_id' | 'role' | 'avatar'> & { password: string }) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },
};
