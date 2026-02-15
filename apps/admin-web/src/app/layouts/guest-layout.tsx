import { Navigate, Outlet } from 'react-router-dom';
import { useSessionStore } from '@/entities/user';

export const GuestLayout = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

