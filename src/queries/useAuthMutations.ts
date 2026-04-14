import { useMutation } from '@tanstack/react-query';
import { authService, type LoginPayload } from '../services/auth.service';
import { useAppDispatch } from '../app/store';
import { setCredentials } from '../app/slices/authSlice';
import { tokenStorage } from '../utils/tokenStorage';
import { addToast } from '../app/slices/notificationSlice';

export function useLoginMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (credentials: LoginPayload) => authService.login(credentials),
    onSuccess: (response) => {
      // 1. Save refresh token to localStorage
      tokenStorage.setRefreshToken(response.data.refreshToken);

      // 2. Save user and access token to Redux
      dispatch(
        setCredentials({
          user: response.data.user,
          accessToken: response.data.accessToken,
        }),
      );

      // 3. Show success toast
      dispatch(addToast({ message: 'Welcome back!', type: 'success' }));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch(
        addToast({
          message: Array.isArray(message) ? message[0] : message,
          type: 'error',
        }),
      );
    },
  });
}
