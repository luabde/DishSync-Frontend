import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../hooks/auth.hook';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';
import { usuarisApi } from '../api/usuaris.api';
import { restaurantApi, type RestaurantListItemDTO } from '../api/restaurant.api';

export default function CreateUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState('');
  const [restaurants, setRestaurants] = useState<RestaurantListItemDTO[]>([]);
  const [createForm, setCreateForm] = useState({
    nom: '',
    cognoms: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'CAMBRER' as 'ADMIN' | 'CAMBRER' | 'RESPONSABLE',
    estat: 'ACTIU' as 'ACTIU' | 'INACTIU',
    restaurant: '',
  });
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({});
  const sidebarNavItems = getSidebarNavItems(user?.rol);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await restaurantApi.getRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error('No se pudieron cargar los restaurantes', error);
        setCreateError('No se pudieron cargar los restaurantes para asignación.');
      }
    };
    void loadRestaurants();
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  const validateCreateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!createForm.nom.trim()) errors.nom = 'El nombre es obligatorio.';
    if (!createForm.cognoms.trim()) errors.cognoms = 'Los apellidos son obligatorios.';
    if (!createForm.email.trim()) errors.email = 'El email es obligatorio.';
    else if (!emailRegex.test(createForm.email.trim())) errors.email = 'Formato de email inválido.';
    if (!createForm.password) errors.password = 'La contraseña es obligatoria.';
    else if (createForm.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    if (!createForm.confirmPassword) errors.confirmPassword = 'Confirma la contraseña.';
    else if (createForm.password !== createForm.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    setCreateError('');
    if (!validateCreateForm()) return;

    try {
      setIsSubmittingCreate(true);

      const [emailExists, usernameExists] = await Promise.all([
        usuarisApi.validateEmailExists(createForm.email.trim()),
        usuarisApi.validateUsernameExists(createForm.nom.trim()),
      ]);

      if (emailExists || usernameExists) {
        const errors: Record<string, string> = {};
        if (emailExists) errors.email = 'Este email ya está registrado.';
        if (usernameExists) errors.nom = 'Este nombre de usuario ya existe.';
        setCreateFormErrors(errors);
        return;
      }

      await usuarisApi.createUser({
        nom: createForm.nom.trim(),
        cognoms: createForm.cognoms.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        rol: createForm.rol,
        estat: createForm.estat,
        restaurant: createForm.restaurant ? Number(createForm.restaurant) : null,
      });

      navigate('/users', { replace: true });
    } catch (error) {
      console.error('No se pudo crear el usuario', error);
      setCreateError('No se pudo crear el usuario. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ds-bg-page font-ds-sans text-ds-fg-default antialiased">
      <StaffSidebar
        navItems={sidebarNavItems}
        userDisplayName={user?.nom ?? ''}
        userRoleLabel={getRoleDisplayLabel(user?.rol)}
        onLogout={() => void logout()}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col border-l border-black/5">
        <header className="relative shrink-0 border-b-2 border-ds-brand-wine bg-ds-canvas">
          <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:h-[105px] lg:flex-row lg:items-center lg:gap-0 lg:px-10 lg:py-0 lg:pl-[80px]">
            <div className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 lg:h-full lg:min-h-0">
              <button
                type="button"
                className="flex size-11 shrink-0 items-center justify-center rounded-ds-sm border border-ds-brand-wine/30 text-ds-brand-wine lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-expanded={sidebarOpen}
                aria-controls="staff-sidebar-mobile"
                aria-label="Obrir menú"
              >
                <Menu className="size-6" />
              </button>
              <h1 className="min-w-0 font-ds-display text-xl font-semibold leading-none tracking-wide text-ds-brand-wine sm:text-2xl lg:text-[28.8px] lg:tracking-[2px]">
                Usuarios
              </h1>
            </div>
            <Link
              to="/users"
              className="w-full shrink-0 rounded-ds-sm border-2 border-ds-brand-wine px-3 py-2.5 text-center font-ds-sans text-[11px] font-bold leading-none tracking-[1.5px] text-ds-brand-wine uppercase sm:px-3.5 sm:py-3.5 sm:text-[12.8px] lg:absolute lg:right-10 lg:top-1/2 lg:w-auto lg:-translate-y-1/2"
            >
              Volver al listado
            </Link>
          </div>
        </header>

        <div className="flex flex-1 justify-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
          <div className="w-full max-w-4xl rounded-ds-table border border-ds-card-border bg-ds-bg-elevated shadow-ds-table">
            <div className="border-b border-ds-row-divider px-6 py-5">
              <h2 className="font-ds-display text-3xl font-black tracking-tight text-ds-brand-wine">Crear usuario</h2>
              <p className="mt-1 text-sm italic text-ds-wine-70">Completa todos los datos obligatorios del usuario.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[1.2px] text-ds-wine-70">Nombre</span>
                <input
                  value={createForm.nom}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, nom: e.target.value }))}
                  className="rounded-ds-sm border border-ds-input-border px-3 py-2.5 font-ds-sans text-sm text-ds-fg-default outline-none focus:border-ds-brand-wine/50"
                />
                {createFormErrors.nom && <span className="text-xs text-red-600">{createFormErrors.nom}</span>}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[1.2px] text-ds-wine-70">Apellidos</span>
                <input
                  value={createForm.cognoms}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, cognoms: e.target.value }))}
                  className="rounded-ds-sm border border-ds-input-border px-3 py-2.5 font-ds-sans text-sm text-ds-fg-default outline-none focus:border-ds-brand-wine/50"
                />
                {createFormErrors.cognoms && <span className="text-xs text-red-600">{createFormErrors.cognoms}</span>}
              </label>
              <label className="flex flex-col gap-1.5 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[1.2px] text-ds-wine-70">Email</span>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="rounded-ds-sm border border-ds-input-border px-3 py-2.5 font-ds-sans text-sm text-ds-fg-default outline-none focus:border-ds-brand-wine/50"
                />
                {createFormErrors.email && <span className="text-xs text-red-600">{createFormErrors.email}</span>}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[1.2px] text-ds-wine-70">Contraseña</span>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="rounded-ds-sm border border-ds-input-border px-3 py-2.5 font-ds-sans text-sm text-ds-fg-default outline-none focus:border-ds-brand-wine/50"
                />
                {createFormErrors.password && <span className="text-xs text-red-600">{createFormErrors.password}</span>}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[1.2px] text-ds-wine-70">Confirmar contraseña</span>
                <input
                  type="password"
                  value={createForm.confirmPassword}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="rounded-ds-sm border border-ds-input-border px-3 py-2.5 font-ds-sans text-sm text-ds-fg-default outline-none focus:border-ds-brand-wine/50"
                />
                {createFormErrors.confirmPassword && <span className="text-xs text-red-600">{createFormErrors.confirmPassword}</span>}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[1.2px] text-ds-wine-70">Rol</span>
                <select
                  value={createForm.rol}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, rol: e.target.value as 'ADMIN' | 'CAMBRER' | 'RESPONSABLE' }))}
                  className="rounded-ds-sm border border-ds-input-border bg-white px-3 py-2.5 font-ds-sans text-sm text-ds-fg-default outline-none focus:border-ds-brand-wine/50"
                >
                  <option value="CAMBRER">CAMBRER</option>
                  <option value="RESPONSABLE">RESPONSABLE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[1.2px] text-ds-wine-70">Estado</span>
                <select
                  value={createForm.estat}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, estat: e.target.value as 'ACTIU' | 'INACTIU' }))}
                  className="rounded-ds-sm border border-ds-input-border bg-white px-3 py-2.5 font-ds-sans text-sm text-ds-fg-default outline-none focus:border-ds-brand-wine/50"
                >
                  <option value="ACTIU">ACTIU</option>
                  <option value="INACTIU">INACTIU</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[1.2px] text-ds-wine-70">Restaurante (opcional)</span>
                <select
                  value={createForm.restaurant}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, restaurant: e.target.value }))}
                  className="rounded-ds-sm border border-ds-input-border bg-white px-3 py-2.5 font-ds-sans text-sm text-ds-fg-default outline-none focus:border-ds-brand-wine/50"
                >
                  <option value="">Sin asignar</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.nom}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="border-t border-ds-row-divider px-6 py-4">
              {createError && <p className="mb-3 text-sm text-red-600">{createError}</p>}
              <div className="flex justify-end gap-2">
                <Link
                  to="/users"
                  className="rounded-ds-sm border border-ds-pagination-border px-4 py-2 text-xs font-bold uppercase tracking-[1.3px] text-ds-brand-wine"
                >
                  Cancelar
                </Link>
                <button
                  type="button"
                  onClick={() => void handleCreateUser()}
                  disabled={isSubmittingCreate}
                  className="rounded-ds-sm bg-ds-brand-wine px-4 py-2 text-xs font-bold uppercase tracking-[1.3px] text-white disabled:opacity-50"
                >
                  {isSubmittingCreate ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
