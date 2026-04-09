import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRestaurant from './pages/CreateRestaurant';
import ManageRestaurant from './pages/ManageRestaurant';
import UsersManagement from './pages/UsersManagement';
import CreateUser from './pages/CreateUser';
import WaiterPanel from './pages/WaiterPanel';
import ResponsablePanel from './pages/ResponsablePanel';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { AuthProvider } from './context/authContext';
import { CreateRestaurantProvider } from './context/CreateRestaurantContext';
import type { ManageRestaurantData } from './components/CreateRestaurant/ManageRestaurantForm';

function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<ManageRestaurantData | null>(null);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route
                path="/"
                element={<Dashboard onManageRestaurantSelect={setSelectedRestaurant} />}
              />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/users/new" element={<CreateUser />} />
              <Route
                path="/restaurants/new"
                element={
                  <CreateRestaurantProvider>
                    <CreateRestaurant />
                  </CreateRestaurantProvider>
                }
              />
              {/* Ruta de edición visual de un restaurante existente. */}
              <Route
                path="/restaurants/:restaurantId/manage"
                element={<ManageRestaurant restaurant={selectedRestaurant} />}
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={['CAMBRER']} />}>
              <Route path="/camarero" element={<WaiterPanel />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={['RESPONSABLE']} />}>
              <Route path="/responsable" element={<ResponsablePanel />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
