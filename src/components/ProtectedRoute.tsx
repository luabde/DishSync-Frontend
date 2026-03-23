import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/auth.hook';

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-body text-brand-primary font-medium">
                Cargando sesión...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
