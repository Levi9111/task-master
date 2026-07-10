import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsService } from '../services/teams.service';
import type { CreateTeamPayload } from '../types/team.types';
import { useAppDispatch } from '../app/store';
import { addToast } from '../app/slices/notificationSlice';

export function useMyTeamsQuery() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsService.getMyTeams(),
  });
}

export function useCreateTeamMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => teamsService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      dispatch(addToast({ message: 'Team created successfully!', type: 'success' }));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create team';
      dispatch(addToast({ message: Array.isArray(message) ? message[0] : message, type: 'error' }));
    },
  });
}

export function useUpdateTeamMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: Partial<CreateTeamPayload> }) =>
      teamsService.updateTeam(teamId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', data.data._id] });
      dispatch(addToast({ message: 'Team updated successfully!', type: 'success' }));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update team';
      dispatch(addToast({ message: Array.isArray(message) ? message[0] : message, type: 'error' }));
    },
  });
}
