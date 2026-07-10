import type { ApiResponse } from '../types/api.types';
import type { Team, CreateTeamPayload } from '../types/team.types';
import { api } from './axios';

export const teamsService = {
  getMyTeams: async () => {
    const response = await api.get<ApiResponse<Team[]>>('/teams');
    return response.data;
  },

  createTeam: async (payload: CreateTeamPayload) => {
    const response = await api.post<ApiResponse<Team>>('/teams', payload);
    return response.data;
  },

  updateTeam: async (teamId: string, payload: Partial<CreateTeamPayload>) => {
    const response = await api.patch<ApiResponse<Team>>(`/teams/${teamId}`, payload);
    return response.data;
  },

  addMember: async (teamId: string, email: string, role: string) => {
    const response = await api.post<ApiResponse<Team>>(`/teams/${teamId}/members`, { email, role });
    return response.data;
  },
};
