import { api } from './axios';
import type { ApiResponse } from '../types/api.types';

export interface ChatMessage {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  teamId: string;
  content: string;
  createdAt: string;
}

export const chatService = {
  getHistory: async (teamId: string, limit = 50) => {
    const response = await api.get<ApiResponse<ChatMessage[]>>(`/chat/${teamId}?limit=${limit}`);
    return response.data;
  },
};
