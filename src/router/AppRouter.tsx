import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import { useAuth } from '../app/hooks.useAuth';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '../pages/dashboard/Dashboard';
import TasksPage from '../pages/tasks/Tasks';
import TeamsPage from '../pages/teams/Teams';
import AnalyticsPage from '../pages/analytics/Analytics';
import ProfilePage from '../pages/profile/Profile';
import PlaygroundPage from '../pages/playground/Playground';
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
      <Route
        path='/register'
        element={isAuthenticated ? <Navigate to='/dashboard' replace /> : <RegisterPage />}
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
        <Route path='/tasks' element={<TasksPage />} />
        <Route path='/teams' element={<TeamsPage />} />
        <Route path='/analytics' element={<AnalyticsPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/playground' element={<PlaygroundPage />} />
      </Route>

      {/* Fallback routing */}
      <Route
        path='*'
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}
