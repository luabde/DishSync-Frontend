import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientHome from './pages/client/ClientHome';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import CreateRestaurant from './pages/admin/CreateRestaurant';
import ManageRestaurant from './pages/admin/ManageRestaurant';
import ManageRestaurants from './pages/admin/ManageRestaurants';
import UsersManagement from './pages/admin/UsersManagement';
import CreateUser from './pages/admin/CreateUser';
import EditUser from './pages/admin/EditUser';
import WaiterPanel from './pages/WaiterPanel';
import ResponsablePanel from './pages/ResponsablePanel';
import ManageDishes from './pages/admin/ManageDishes';
import CreateDish from './pages/admin/CreateDish';
import EditDish from './pages/admin/EditDish';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { AuthProvider } from './context/authContext';
import { CreateRestaurantProvider } from './context/CreateRestaurantContext';
import type { ManageRestaurantData } from './components/admin/CreateRestaurant/ManageRestaurantForm';

function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<ManageRestaurantData | null>(null);
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClientHome />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route
                path="/dashboard"
                element={<Dashboard onManageRestaurantSelect={setSelectedRestaurant} />}
              />
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/admin/dishes" element={<ManageDishes onEditDishSelect={setSelectedDishId} />} />
              <Route path="/admin/dishes/new" element={<CreateDish />} />
              <Route path="/admin/dishes/edit" element={<EditDish dishId={selectedDishId} />} />
              {/* Alias de compatibilidad único para plats. */}
              <Route path="/plats" element={<ManageDishes onEditDishSelect={setSelectedDishId} />} />
              <Route
                path="/restaurants"
                element={<ManageRestaurants onManageRestaurantSelect={setSelectedRestaurant} />}
              />
              <Route path="/users/new" element={<CreateUser />} />
              <Route path="/users/:id/edit" element={<EditUser />} />
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
