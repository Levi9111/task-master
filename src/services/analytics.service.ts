import type { ApiResponse } from '../types/api.types';
import { api } from './axios';

export interface TaskStat {
  status: string;
  count: number;
}

export const analyticsService = {
  getTeamStats: async (teamId: string) => {
    const response = await api.get<ApiResponse<TaskStat[]>>(`/analytics/teams/${teamId}/tasks`);
    return response.data;
  },
};
