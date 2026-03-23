import { useAuth } from '../hooks/auth.hook';
import { useNavigate } from 'react-router-dom';

export default function WaiterPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-white p-8 text-gray-900">
      <h1 className="text-2xl font-bold">Panel Camarero (prueba)</h1>
      <p className="mt-3">Usuario: {user?.nom}</p>
      <p>Rol: {user?.rol}</p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          className="rounded bg-gray-800 px-4 py-2 text-white"
          onClick={() => navigate('/')}
        >
          Ir a panel admin
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 px-4 py-2"
          onClick={() => void logout()}
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
