import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/auth.hook';
import { getDefaultRouteForRole } from '../navigation/defaultRouteForRole';

interface RoleRouteProps {
  allowedRoles: string[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user } = useAuth();

  if (!user?.rol) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to={getDefaultRouteForRole(user.rol)} replace />;
  }

  return <Outlet />;
};
