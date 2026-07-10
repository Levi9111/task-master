import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from './components/layout/ToastContainer';
import { useAppDispatch } from './app/store';
import { tokenStorage } from './utils/tokenStorage';
import { setCredentials, logout } from './app/slices/authSlice';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const dispatch = useAppDispatch();
  const [rehydrating, setRehydrating] = useState(true);

  useEffect(() => {
    const rehydrateAuth = async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        setRehydrating(false);
        return;
      }

      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        // 1. Silent Refresh Access Token
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );
        const accessToken = refreshResponse.data.data.accessToken;

        // 2. Fetch User Profile using the fresh access token
        const profileResponse = await axios.get(`${baseURL}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const user = profileResponse.data.data;

        // 3. Dispatch to Redux store
        dispatch(setCredentials({ user, accessToken }));
      } catch (error) {
        console.error('Failed to rehydrate session:', error);
        tokenStorage.clear();
        dispatch(logout());
      } finally {
        setRehydrating(false);
      }
    };

    rehydrateAuth();
  }, [dispatch]);

  if (rehydrating) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-bg-base text-text-primary gap-4">
        <Loader2 className="h-12 w-12 text-accent-primary animate-spin" />
        <p className="text-sm text-text-secondary font-medium tracking-wide">Restoring secure session...</p>
      </div>
    );
  }

  return <AppRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
