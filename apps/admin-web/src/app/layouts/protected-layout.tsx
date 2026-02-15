import { Navigate, Outlet } from "react-router-dom";
import { useSessionStore } from "@/entities/user";

export const ProtectedLayout = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
