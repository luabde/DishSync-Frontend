import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../hooks/auth.hook';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';
import { usuarisApi } from '../api/usuaris.api';
import { restaurantApi, type RestaurantListItemDTO } from '../api/restaurant.api';
import FormField from '../components/common/FormField';
import FormSelect from '../components/common/FormSelect';

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
    <div className="flex min-h-screen bg-[#F9F7F2] font-ds-sans text-ds-fg-default antialiased">
      <StaffSidebar
        navItems={sidebarNavItems}
        userDisplayName={user?.nom ?? ''}
        userRoleLabel={getRoleDisplayLabel(user?.rol)}
        onLogout={() => void logout()}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col border-l border-black/5 pb-12 transition-all duration-500">
        <header className="max-w-4xl mx-auto pt-8 px-6 text-center w-full">
          <div className="flex items-center justify-start mb-6 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex size-11 items-center justify-center rounded-ds-sm border border-ds-brand-wine/30 text-ds-brand-wine"
            >
              <Menu className="size-6" />
            </button>
          </div>
          <nav className="flex items-center justify-center gap-2 text-xs font-medium text-brand-gray/40 mb-12 uppercase tracking-widest">
            <Link to="/users" className="hover:text-brand-primary transition-colors">Usuaris</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-primary/60">Nou</span>
          </nav>
          <h1 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Crear usuari
          </h1>
          <p className="mx-auto mt-3 mb-12 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Configura els permisos i l'accés per al nou membre de l'equip.
          </p>
        </header>

        <main className="max-w-4xl mx-auto px-6 transition-all duration-700 w-full">
          <div className="bg-white rounded-ds-table shadow-2xl shadow-brand-primary/10 p-10 md:p-14 transition-all duration-700">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                label="Nom"
                value={createForm.nom}
                error={createFormErrors.nom}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: Joan"
              />
              <FormField
                label="Cognoms"
                value={createForm.cognoms}
                error={createFormErrors.cognoms}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, cognoms: e.target.value }))}
                placeholder="Ex: García Pou"
              />
              <FormField
                label="Email"
                type="email"
                className="md:col-span-2 space-y-2"
                value={createForm.email}
                error={createFormErrors.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="joan@exemple.com"
              />
              <FormField
                label="Contrasenya"
                type="password"
                autoComplete="new-password"
                value={createForm.password}
                error={createFormErrors.password}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
              <FormField
                label="Confirmar contrasenya"
                type="password"
                autoComplete="new-password"
                value={createForm.confirmPassword}
                error={createFormErrors.confirmPassword}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="••••••••"
              />
              <FormSelect
                label="Rol"
                value={createForm.rol}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, rol: e.target.value as any }))}
                options={[
                  { value: 'CAMBRER', label: 'CAMBRER' },
                  { value: 'RESPONSABLE', label: 'RESPONSABLE Sòl' },
                  { value: 'ADMIN', label: 'ADMIN' },
                ]}
              />
              <FormSelect
                label="Estat"
                value={createForm.estat}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, estat: e.target.value as any }))}
                options={[
                  { value: 'ACTIU', label: 'ACTIU' },
                  { value: 'INACTIU', label: 'INACTIU' },
                ]}
              />
              <FormSelect
                label="Restaurant (opcional)"
                className="md:col-span-2 space-y-2"
                value={createForm.restaurant}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, restaurant: e.target.value }))}
                options={[
                  { value: '', label: 'Sense assignar' },
                  ...restaurants.map((r) => ({ value: r.id, label: r.nom })),
                ]}
              />
            </div>

            <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col gap-4">
              {createError && <p className="text-sm text-red-600 italic text-center mb-4">{createError}</p>}
              <button
                type="button"
                onClick={() => void handleCreateUser()}
                disabled={isSubmittingCreate}
                className="w-full py-4 bg-ds-brand-wine text-white rounded-ds-sm font-ds-sans text-sm font-bold uppercase tracking-[1.5px] shadow-sm transition-all duration-300 hover:bg-ds-brand-wine/90 hover:shadow-ds-btn active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmittingCreate ? 'Creant...' : 'Crear usuari'}
              </button>
              <Link
                to="/users"
                className="text-center font-ds-sans text-xs font-bold uppercase tracking-[1px] text-brand-primary/40 hover:text-brand-primary transition-colors"
              >
                Tornar al llistat
              </Link>
            </div>
          </div>

          <footer className="mt-10 w-full max-w-3xl mx-auto border-t border-ds-footer-rule pt-6 pb-12 text-center font-ds-ui text-xs text-ds-ui-muted sm:mt-16 sm:pt-8 sm:text-sm">
            <p>
              Necessites ajuda per configurar l'equip?{' '}
              <a href="#" className="font-semibold text-ds-brand-gold hover:underline">
                Contacta amb suport tècnic
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
