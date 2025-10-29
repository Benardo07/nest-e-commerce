import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};
