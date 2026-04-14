import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { useAuth } from '../app/hooks.useAuth';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '../pages/dashboard/Dashboard';
import { AppLayout } from '../components/layout/AppLayout';

export function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path='/login'
        element={isAuthenticated ? <Navigate to='/dashboard' replace /> : <LoginPage />}
      />

      {/* Protected Routes wrapped in Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path='/dashboard' element={<DashboardPage />} />
        {/* We will add /tasks, /teams, etc. here later */}
      </Route>

      {/* Fallback routing */}
      <Route
        path='/'
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}
