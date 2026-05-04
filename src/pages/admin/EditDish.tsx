import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import { platsApi, resolvePlatImageUrl, type PlatCategoryDTO } from '../../api/plats.api';
import FormField from '../../components/common/FormField';
import FormSelect from '../../components/common/FormSelect';
import FormImageUpload from '../../components/common/FormImageUpload';

type EditDishForm = {
  nom: string;
  descripcio: string;
  preu: string;
  id_categoria: string;
};

type EditDishProps = {
  // Id del plato seleccionado previamente en el listado.
  dishId: number | null;
};

export default function EditDish({ dishId }: EditDishProps) {
  // Contexto de sesión para renderizar el sidebar y permitir logout.
  const { user, logout } = useAuth();
  // Navegación programática tras guardar cambios.
  const navigate = useNavigate();
  // Control de visibilidad del sidebar en móvil.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Error al cargar datos iniciales del formulario.
  const [loadError, setLoadError] = useState('');
  // Error al guardar los cambios del plato.
  const [saveError, setSaveError] = useState('');
  // Catálogo de categorías para el select.
  const [categories, setCategories] = useState<PlatCategoryDTO[]>([]);
  // Nuevo archivo de imagen seleccionado por el usuario.
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // URL temporal para previsualizar el archivo recién seleccionado.
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  // URL de imagen actualmente guardada en backend.
  const [existingImageUrl, setExistingImageUrl] = useState('');
  // Mapa de errores de validación por campo.
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // Estado editable del formulario.
  const [editForm, setEditForm] = useState<EditDishForm>({
    nom: '',
    descripcio: '',
    preu: '',
    id_categoria: '',
  });
  // Ítems del sidebar según el rol del usuario autenticado.
  const sidebarNavItems = getSidebarNavItems(user?.rol);
  // Mantiene el focus/errores visuales igual que el resto de formularios reutilizables.
  const getInputClassName = (field: keyof EditDishForm) =>
    `focus:ring-brand-accent2/20 ${formErrors[field] ? 'ring-2 ring-red-200 focus:ring-red-200' : ''}`;
  const getSelectClassName = () =>
    `focus:ring-brand-accent2/20 ${formErrors.id_categoria ? 'ring-2 ring-red-200 focus:ring-red-200' : ''}`;

  useEffect(() => {
    // Bloquea el scroll del body mientras el menú lateral móvil está abierto.
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    // Cargamos en paralelo datos del plato y catálogo de categorías para editar.
    const loadData = async () => {
      if (dishId == null || dishId < 1) {
        setLoadError('No s\'ha seleccionat cap plat per editar.');
        return;
      }

      try {
        const [plats, categoriesResponse] = await Promise.all([
          platsApi.getPlats(),
          platsApi.getCategories(),
        ]);
        // Localiza el plato concreto a editar dentro del listado.
        const dish = plats.find((item) => item.id === dishId);
        if (!dish) {
          setLoadError('No s\'ha trobat el plat sol·licitat.');
          return;
        }

        setCategories(categoriesResponse);
        setEditForm({
          nom: dish.nom ?? '',
          descripcio: dish.descripcio ?? '',
          preu: String(dish.preu ?? ''),
          id_categoria: String(dish.id_categoria ?? ''),
        });
        setExistingImageUrl(resolvePlatImageUrl(dish.url));
      } catch (error) {
        console.error('No s\'han pogut carregar les dades del plat', error);
        setLoadError('No s\'han pogut carregar les dades del plat.');
      }
    };

    void loadData();
  }, [dishId]);

  useEffect(() => {
    // Genera preview temporal para la nueva imagen elegida.
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const validateForm = () => {
    // Validación básica para evitar llamadas inválidas al backend.
    const errors: Record<string, string> = {};
    const parsedPrice = Number(editForm.preu);
    const parsedCategoryId = Number(editForm.id_categoria);
    if (!editForm.nom.trim()) errors.nom = 'El nom és obligatori.';
    if (!editForm.descripcio.trim()) errors.descripcio = 'La descripció és obligatòria.';
    if (!editForm.preu.trim()) errors.preu = 'El preu és obligatori.';
    else if (!Number.isFinite(parsedPrice) || parsedPrice < 0) errors.preu = 'El preu ha de ser major o igual a 0.';
    if (!editForm.id_categoria.trim()) errors.id_categoria = 'La categoria és obligatòria.';
    else if (!Number.isInteger(parsedCategoryId) || parsedCategoryId < 1) errors.id_categoria = 'Categoria invàlida.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateDish = async () => {
    // Limpia el error de guardado anterior y valida antes de enviar.
    setSaveError('');
    if (!validateForm() || dishId == null || dishId < 1) return;

    try {
      await platsApi.updatePlat({
        id: dishId,
        nom: editForm.nom.trim(),
        descripcio: editForm.descripcio.trim(),
        preu: Number(editForm.preu),
        id_categoria: Number(editForm.id_categoria),
        // Si hay imagen nueva, enviamos url vacía para que backend use el nuevo archivo.
        // Si no hay imagen nueva, mantenemos o eliminamos la actual según existingImageUrl.
        url: photoFile ? '' : existingImageUrl.replace(/^https?:\/\/[^/]+/, ''),
        imageFile: photoFile ?? undefined,
      });
      // Al guardar correctamente volvemos al listado de platos.
      navigate('/admin/dishes', { replace: true });
    } catch (error) {
      console.error('No s\'ha pogut actualitzar el plat', error);
      setSaveError('No s\'ha pogut actualitzar el plat. Revisa les dades i torna-ho a intentar.');
    }
  };

  const categoryOptions = [
    { value: '', label: 'Selecciona una categoria' },
    ...categories.map((category) => ({ value: String(category.id), label: category.nom })),
  ];

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
            <Link to="/admin/dishes" className="hover:text-brand-primary transition-colors">Plats</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-primary/60">Editar</span>
          </nav>
          <h1 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Editar plat
          </h1>
        </header>

        <main className="max-w-4xl mx-auto px-6 transition-all duration-700 w-full">
          <div className="bg-ds-bg-elevated rounded-ds-table shadow-2xl shadow-brand-primary/10 p-10 md:p-14 transition-all duration-700">
            {loadError ? <p className="mb-6 text-sm text-red-600 italic text-center">{loadError}</p> : null}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                label="Nom"
                className="md:col-span-2 space-y-2"
                value={editForm.nom}
                error={formErrors.nom}
                inputClassName={getInputClassName('nom')}
                onChange={(e) => setEditForm((prev) => ({ ...prev, nom: e.target.value }))}
              />
              <FormField
                as="textarea"
                rows={4}
                label="Descripció"
                className="md:col-span-2 space-y-2"
                value={editForm.descripcio}
                error={formErrors.descripcio}
                inputClassName={`${getInputClassName('descripcio')} resize-none`}
                onChange={(e) => setEditForm((prev) => ({ ...prev, descripcio: e.target.value }))}
              />
              <FormField
                label="Preu"
                type="number"
                min={0}
                step="0.01"
                value={editForm.preu}
                error={formErrors.preu}
                inputClassName={getInputClassName('preu')}
                onChange={(e) => setEditForm((prev) => ({ ...prev, preu: e.target.value }))}
              />
              <FormSelect
                label="Categoria"
                className="space-y-2"
                options={categoryOptions}
                value={editForm.id_categoria}
                error={formErrors.id_categoria}
                selectClassName={getSelectClassName()}
                onChange={(e) => setEditForm((prev) => ({ ...prev, id_categoria: e.target.value }))}
              />
              <FormImageUpload
                label="Imatge (opcional)"
                className="md:col-span-2"
                previewUrl={photoPreviewUrl ?? existingImageUrl}
                previewAlt="Preview plat"
                onFileChange={(file) => {
                  // Al seleccionar archivo nuevo, sustituimos la imagen previa.
                  setPhotoFile(file);
                }}
                onRemoveImage={() => {
                  // Si hay nueva imagen la quitamos; si no, eliminamos la existente.
                  if (photoFile) setPhotoFile(null);
                  else setExistingImageUrl('');
                }}
              />
            </div>

            <div className="mt-12 pt-10 border-t border-ds-footer-rule flex flex-col gap-4">
              {saveError ? <p className="text-sm text-red-600 italic text-center mb-4">{saveError}</p> : null}
              <button
                type="button"
                onClick={() => void handleUpdateDish()}
                disabled={Boolean(loadError)}
                className="w-full py-4 bg-ds-brand-wine text-white rounded-ds-sm font-ds-sans text-sm font-bold uppercase tracking-[1.5px] shadow-sm transition-all duration-300 hover:bg-ds-brand-wine/90 disabled:opacity-50"
              >
                Guardar canvis
              </button>
              <Link to="/admin/dishes" className="text-center font-ds-sans text-xs font-bold uppercase tracking-[1px] text-brand-primary/40 hover:text-brand-primary transition-colors">
                Tornar al llistat
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
