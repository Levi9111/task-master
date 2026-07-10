import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/user.types';
import { api } from './axios';

export const usersService = {
  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data;
  },
};
