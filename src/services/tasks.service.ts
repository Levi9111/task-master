import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { Task, CreateTaskPayload } from '../types/task.types';
import { api } from './axios';

export interface FilterTaskParams {
  status?: string;
  priority?: string;
  assigneeId?: string;
  teamId?: string;
  page?: number;
  limit?: number;
}

export const tasksService = {
  getTasks: async (params?: FilterTaskParams) => {
    const response = await api.get<PaginatedResponse<Task>>('/tasks', { params });
    return response.data;
  },

  getTaskById: async (taskId: string) => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (payload: CreateTaskPayload) => {
    const response = await api.post<ApiResponse<any>>('/tasks', payload);
    return response.data;
  },

  updateTask: async (taskId: string, payload: Partial<CreateTaskPayload>) => {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}`, payload);
    return response.data;
  },

  deleteTask: async (taskId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/tasks/${taskId}`);
    return response.data;
  },

  uploadAttachment: async (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
