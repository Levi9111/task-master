import { useAppSelector } from './store';

export function useAuth() {
  const authState = useAppSelector((state) => state.auth);

  return authState;
}
