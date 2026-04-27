import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import { usuarisApi } from '../../api/usuaris.api';
import { restaurantApi, type RestaurantListItemDTO } from '../../api/restaurant.api';
import FormField from '../../components/common/FormField';
import FormSelect from '../../components/common/FormSelect';

export default function EditUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [restaurants, setRestaurants] = useState<RestaurantListItemDTO[]>([]);

  const [form, setForm] = useState({
    nom: '',
    cognoms: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'CAMBRER' as 'ADMIN' | 'CAMBRER' | 'RESPONSABLE',
    estat: 'ACTIU' as 'ACTIU' | 'INACTIU',
    restaurant: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});


  // Store original values to skip duplicate validation when unchanged.
  const [originalNom, setOriginalNom] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');

  const sidebarNavItems = getSidebarNavItems(user?.rol);

  useEffect(() => {
    const boot = async () => {
      try {
        const [allUsers, restaurantsData] = await Promise.all([
          usuarisApi.getAllUsers(),
          restaurantApi.getRestaurants(),
        ]);
        setRestaurants(restaurantsData);

        const found = allUsers.find((u) => u.id === userId);
        if (!found) {
          navigate('/users', { replace: true });
          return;
        }

        setOriginalNom(found.nom);
        setOriginalEmail(found.email);
        setForm({
          nom: found.nom,
          cognoms: found.cognoms,
          email: found.email,
          password: '',
          confirmPassword: '',
          rol: found.rol,
          estat: found.estat,
          restaurant: found.id_restaurant ? String(found.id_restaurant) : '',
        });
      } catch (error) {
        console.error('Error carregant dades del usuari', error);
        setSubmitError('No s\'han pogut carregar les dades de l\'usuari.');
      } finally {
        setIsLoading(false);
      }
    };
    void boot();
  }, [userId, navigate]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.nom.trim()) errors.nom = 'El nom és obligatori.';
    if (!form.cognoms.trim()) errors.cognoms = 'Els cognoms són obligatoris.';
    if (!form.email.trim()) errors.email = 'L\'email és obligatori.';
    else if (!emailRegex.test(form.email.trim())) errors.email = 'Format d\'email invàlid.';

    // Only validate password fields if the admin typed something.
    if (form.password) {
      if (form.password.length < 6)
        errors.password = 'La contrasenya ha de tenir almenys 6 caràcters.';
      if (form.password !== form.confirmPassword)
        errors.confirmPassword = 'Les contrasenyes no coincideixen.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setSubmitError('');
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Only check for duplicates when the value actually changed.
      const checks: Promise<void>[] = [];

      if (form.email.trim() !== originalEmail) {
        checks.push(
          usuarisApi.validateEmailExists(form.email.trim()).then((exists) => {
            if (exists) throw new Error('Aquest email ja està registrat.');
          }),
        );
      }

      if (form.nom.trim() !== originalNom) {
        checks.push(
          usuarisApi.validateUsernameExists(form.nom.trim()).then((exists) => {
            if (exists) throw new Error('Aquest nom d\'usuari ja existeix.');
          }),
        );
      }

      await Promise.all(checks);

      const payload: Parameters<typeof usuarisApi.updateUser>[1] = {
        nom: form.nom.trim(),
        cognoms: form.cognoms.trim(),
        email: form.email.trim(),
        rol: form.rol,
        estat: form.estat,
        restaurant: form.restaurant ? Number(form.restaurant) : null,
        ...(form.password ? { password: form.password } : {}),
      };

      await usuarisApi.updateUser(userId, payload);
      navigate('/users', { replace: true });
    } catch (error) {
      console.error('No s\'ha pogut guardar l\'usuari', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No s\'ha pogut guardar l\'usuari. Revisa les dades i torna-ho a intentar.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F7F2]">
        <p className="font-ds-sans text-sm text-ds-brand-wine/60">Carregant...</p>
      </div>
    );
  }

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
            <Link to="/users" className="hover:text-brand-primary transition-colors">
              Usuaris
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-primary/60">Editar</span>
          </nav>
          <h1 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Editar usuari
          </h1>
          <p className="mx-auto mt-3 mb-12 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Modifica les dades i els permisos del membre de l'equip.
          </p>
        </header>

        <main className="max-w-4xl mx-auto px-6 transition-all duration-700 w-full">
          <div className="bg-white rounded-ds-table shadow-2xl shadow-brand-primary/10 p-10 md:p-14 transition-all duration-700">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                label="Nom"
                value={form.nom}
                error={formErrors.nom}
                variant="yellow"
                onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: Joan"
              />
              <FormField
                label="Cognoms"
                value={form.cognoms}
                error={formErrors.cognoms}
                variant="yellow"
                onChange={(e) => setForm((prev) => ({ ...prev, cognoms: e.target.value }))}
                placeholder="Ex: García Pou"
              />
              <FormField
                label="Email"
                type="email"
                className="md:col-span-2 space-y-2"
                value={form.email}
                error={formErrors.email}
                variant="yellow"
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="joan@exemple.com"
              />
            </div>

            {/* Password fields — always visible, empty by default. Leave blank = no change. */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                label="Nova contrasenya (opcional)"
                type="password"
                autoComplete="new-password"
                value={form.password}
                error={formErrors.password}
                variant="yellow"
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Deixa buit per no canviar"
              />
              <FormField
                label="Confirmar nova contrasenya"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                error={formErrors.confirmPassword}
                variant="yellow"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="••••••••"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormSelect
                label="Rol"
                value={form.rol}
                variant="yellow"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, rol: e.target.value as 'ADMIN' | 'CAMBRER' | 'RESPONSABLE' }))
                }
                options={[
                  { value: 'CAMBRER', label: 'CAMBRER' },
                  { value: 'RESPONSABLE', label: 'RESPONSABLE' },
                  { value: 'ADMIN', label: 'ADMIN' },
                ]}
              />
              <FormSelect
                label="Estat"
                value={form.estat}
                variant="yellow"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, estat: e.target.value as 'ACTIU' | 'INACTIU' }))
                }
                options={[
                  { value: 'ACTIU', label: 'ACTIU' },
                  { value: 'INACTIU', label: 'INACTIU' },
                ]}
              />
              <FormSelect
                label="Restaurant (opcional)"
                className="md:col-span-2 space-y-2"
                value={form.restaurant}
                variant="yellow"
                onChange={(e) => setForm((prev) => ({ ...prev, restaurant: e.target.value }))}
                options={[
                  { value: '', label: 'Sense assignar' },
                  ...restaurants.map((r) => ({ value: r.id, label: r.nom })),
                ]}
              />
            </div>

            <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col gap-4">
              {submitError && (
                <p className="text-sm text-red-600 italic text-center mb-4">{submitError}</p>
              )}
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSubmitting}
                className="w-full py-4 bg-ds-brand-wine text-white rounded-ds-sm font-ds-sans text-sm font-bold uppercase tracking-[1.5px] shadow-sm transition-all duration-300 hover:bg-ds-brand-wine/90 hover:shadow-ds-btn active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Guardant...' : 'Guardar canvis'}
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
