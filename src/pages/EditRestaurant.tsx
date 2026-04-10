import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Image as ImageIcon, Menu } from 'lucide-react';
import { useAuth } from '../hooks/auth.hook';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';
import { restaurantApi } from '../api/restaurant.api';
import FormField from '../components/common/FormField';

// Split "08:30 - 23:30" into { start, end } for the two time inputs.
function splitSchedule(schedule: string) {
  const [start = '', end = ''] = schedule.split('-').map((v) => v.trim());
  return { start, end };
}

const sharedInputClass =
  'w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 transition-all outline-none focus:ring-brand-accent2/20';

export default function EditRestaurant() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const id = Number(restaurantId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nom: '',
    direccio: '',
    telefon: '',
    horariStart: '',
    horariEnd: '',
    descripcio: '',
  });

  // Image state — mirrors ManageRestaurantForm logic.
  const [existingUrl, setExistingUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const sidebarNavItems = getSidebarNavItems(user?.rol);

  useEffect(() => {
    const boot = async () => {
      try {
        const data = await restaurantApi.getRestaurantById(id);
        const { start, end } = splitSchedule(data.horaris);
        setForm({
          nom: data.nom,
          direccio: data.direccio,
          telefon: data.telefon,
          horariStart: start,
          horariEnd: end,
          descripcio: data.descripcio ?? '',
        });
        setExistingUrl(data.url);
      } catch (error) {
        console.error('Error carregant restaurant', error);
        setSubmitError('No s\'ha pogut carregar el restaurant.');
      } finally {
        setIsLoading(false);
      }
    };
    void boot();
  }, [id]);

  // Build base64 preview when a new file is selected.
  useEffect(() => {
    if (!selectedFile) {
      setPhotoPreviewUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreviewUrl(reader.result);
        setImageRemoved(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const displayedImage = photoPreviewUrl ?? (!imageRemoved ? existingUrl : null);
  const hasVisibleImage = Boolean(displayedImage);

  const removePhoto = () => {
    setSelectedFile(null);
    setPhotoPreviewUrl(null);
    setImageRemoved(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.nom.trim()) errors.nom = 'El nom és obligatori.';
    if (!form.direccio.trim()) errors.direccio = 'L\'adreça és obligatòria.';
    if (!form.telefon.trim()) errors.telefon = 'El telèfon és obligatori.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setSubmitError('');
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const horaris =
        form.horariStart && form.horariEnd
          ? `${form.horariStart} - ${form.horariEnd}`
          : form.horariStart || form.horariEnd || '';

      await restaurantApi.updateRestaurant(id, {
        nom: form.nom.trim(),
        direccio: form.direccio.trim(),
        telefon: form.telefon.trim(),
        horaris,
        descripcio: form.descripcio.trim(),
        imageFile: selectedFile ?? undefined,
        removeImage: imageRemoved,
      });
      navigate('/', { replace: true });
    } catch (error) {
      console.error('No s\'ha pogut guardar el restaurant', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No s\'ha pogut guardar el restaurant. Torna-ho a intentar.',
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
            <Link to="/" className="hover:text-brand-primary transition-colors">
              Restaurants
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-primary/60">Editar</span>
          </nav>
          <h1 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Editar restaurant
          </h1>
          <p className="mx-auto mt-3 mb-12 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Modifica la informació i les dades de contacte de l'establiment.
          </p>
        </header>

        <main className="max-w-4xl mx-auto px-6 transition-all duration-700 w-full">
          <div className="bg-white rounded-ds-table shadow-2xl shadow-brand-primary/10 p-10 md:p-14 transition-all duration-700">
            <div className="space-y-6">
              {/* Photo upload — identical UX to ManageRestaurantForm */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">
                  Foto
                </label>
                <label className="relative block border-2 border-dashed border-gray-200 rounded-2xl p-10 bg-[#F5F5F5]/50 group hover:bg-[#F5F5F5] hover:border-brand-accent2/30 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setSelectedFile(file);
                      setImageRemoved(false);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  {hasVisibleImage ? (
                    <div className="relative h-56 w-full rounded-xl overflow-hidden">
                      <img
                        src={displayedImage!}
                        alt={`Imatge del restaurant ${form.nom}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removePhoto();
                        }}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white text-xs font-bold hover:bg-black/80 transition-colors"
                        aria-label="Eliminar imatge"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 h-40">
                      <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-6 w-6 text-brand-gray/40 group-hover:text-brand-accent2 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-brand-gray/60 leading-relaxed">
                          Fes clic o arrossega una imatge aquí <br />
                          <span className="opacity-60 text-[10px] uppercase font-bold">
                            Format: JPG, PNG (Màx. 5MB)
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <FormField
                label="Nom de l'establiment"
                value={form.nom}
                error={formErrors.nom}
                onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: La Brasseria"
                inputClassName={sharedInputClass}
              />
              <FormField
                label="Adreça completa"
                value={form.direccio}
                error={formErrors.direccio}
                onChange={(e) => setForm((prev) => ({ ...prev, direccio: e.target.value }))}
                placeholder="Ex: Carrer Major 12, Barcelona"
                inputClassName={sharedInputClass}
              />
              <FormField
                label="Telèfon de contacte"
                value={form.telefon}
                error={formErrors.telefon}
                onChange={(e) => setForm((prev) => ({ ...prev, telefon: e.target.value }))}
                placeholder="Ex: 93 123 45 67"
                inputClassName={sharedInputClass}
              />

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">
                  Horaris
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <input
                    value={form.horariStart}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, horariStart: e.target.value }))
                    }
                    placeholder="Obertura (ex: 08:00)"
                    className={sharedInputClass}
                  />
                  <input
                    value={form.horariEnd}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, horariEnd: e.target.value }))
                    }
                    placeholder="Tancament (ex: 23:30)"
                    className={sharedInputClass}
                  />
                </div>
              </div>

              <FormField
                as="textarea"
                rows={5}
                label="Descripció"
                value={form.descripcio}
                onChange={(e) => setForm((prev) => ({ ...prev, descripcio: e.target.value }))}
                placeholder="Explica breument de què tracta l'establiment..."
                inputClassName={`${sharedInputClass} resize-none`}
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
                to="/"
                className="text-center font-ds-sans text-xs font-bold uppercase tracking-[1px] text-brand-primary/40 hover:text-brand-primary transition-colors"
              >
                Tornar al llistat
              </Link>
            </div>
          </div>

          <footer className="mt-10 w-full max-w-3xl mx-auto border-t border-ds-footer-rule pt-6 pb-12 text-center font-ds-ui text-xs text-ds-ui-muted sm:mt-16 sm:pt-8 sm:text-sm">
            <p>
              Necessites ajuda per configurar l'establiment?{' '}
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
