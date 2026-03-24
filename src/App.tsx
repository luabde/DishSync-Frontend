import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRestaurant from './pages/CreateRestaurant';
import WaiterPanel from './pages/WaiterPanel';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { AuthProvider } from './context/authContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/restaurants/new" element={<CreateRestaurant />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={['CAMBRER']} />}>
              <Route path="/camarero" element={<WaiterPanel />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
