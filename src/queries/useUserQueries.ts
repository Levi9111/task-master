import { useQuery } from '@tanstack/react-query';
import { usersService } from '../services/users.service';

export function useProfileQuery() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => usersService.getProfile(),
  });
}

export function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAllUsers(),
  });
}
