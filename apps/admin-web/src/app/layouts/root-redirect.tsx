import { Navigate } from 'react-router-dom';
import { useSessionStore } from '@/entities/user';

export const RootRedirect = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

