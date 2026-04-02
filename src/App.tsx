import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRestaurant from './pages/CreateRestaurant';
import UsersManagement from './pages/UsersManagement';
import WaiterPanel from './pages/WaiterPanel';
import ResponsablePanel from './pages/ResponsablePanel';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { AuthProvider } from './context/authContext';
import { CreateRestaurantProvider } from './context/CreateRestaurantContext';

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
              <Route path="/users" element={<UsersManagement />} />
              <Route
                path="/restaurants/new"
                element={
                  <CreateRestaurantProvider>
                    <CreateRestaurant />
                  </CreateRestaurantProvider>
                }
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
