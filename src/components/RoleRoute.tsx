import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/auth.hook';

interface RoleRouteProps {
  allowedRoles: string[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user } = useAuth();

  if (!user?.rol) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    if (user.rol === 'ADMIN') return <Navigate to="/" replace />;
    if (user.rol === 'CAMBRER') return <Navigate to="/camarero" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
