import type { ApiResponse } from '../types/api.types';
import type { Comment, CreateCommentPayload } from '../types/comment.types';
import { api } from './axios';

export const commentsService = {
  getComments: async (taskId: string) => {
    const response = await api.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`);
    return response.data;
  },

  createComment: async (taskId: string, payload: CreateCommentPayload) => {
    const response = await api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, payload);
    return response.data;
  },
};
