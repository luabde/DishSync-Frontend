import { useAuthStore } from '../store/authStore';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <LayoutDashboard className="h-6 w-6 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">Dish Sync Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">
                                Hola, {user?.name}
                            </span>
                            <button
                                onClick={logout}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-2xl mx-auto mt-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">¡Bienvenido al panel de control!</h2>
                    <p className="text-gray-600">
                        Has iniciado sesión exitosamente como <span className="font-semibold text-gray-900">{user?.role}</span>.
                        Esta es una vista protegida, lo que significa que el sistema de autenticación con tokens está funcionando correctamente.
                    </p>
                </div>
            </main>
        </div>
    );
}
