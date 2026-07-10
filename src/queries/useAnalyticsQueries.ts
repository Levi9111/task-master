import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export function useTeamStatsQuery(teamId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['analytics', teamId],
    queryFn: () => analyticsService.getTeamStats(teamId!),
    enabled: !!teamId && enabled,
  });
}
