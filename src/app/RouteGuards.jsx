import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
export function RequireAuth() {
  const { isAuthenticated, isReady } = useAuth();
  if (!isReady) return null;
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
export function RequireRole({ roles }) {
  const { role, isReady } = useAuth();
  if (!isReady) return null;
  if (!role || !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
