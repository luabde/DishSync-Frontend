import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../hooks/auth.hook';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';
import { platsApi, type PlatCategoryDTO } from '../api/plats.api';
import FormField from '../components/common/FormField';
import FormSelect from '../components/common/FormSelect';
import FormImageUpload from '../components/common/FormImageUpload';

type CreateDishForm = {
  nom: string;
  descripcio: string;
  preu: string;
  id_categoria: string;
};

export default function CreateDish() {
  // Usuario autenticado (para datos del sidebar) y acción de cierre de sesión.
  const { user, logout } = useAuth();
  // Navegación programática tras crear plato o al cambiar de pantalla.
  const navigate = useNavigate();
  // Controla si el sidebar móvil está abierto/cerrado.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mensaje de error global al intentar crear el plato.
  const [createError, setCreateError] = useState('');
  // Mensaje de error global para operaciones de categorías.
  const [categoryError, setCategoryError] = useState('');
  // Mapa de errores de validación por campo del formulario principal.
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({});
  // Lista de categorías disponibles para poblar el select.
  const [categories, setCategories] = useState<PlatCategoryDTO[]>([]);
  // Valor del input para nombre de nueva categoría.
  const [newCategoryName, setNewCategoryName] = useState('');
  // Valor del input para descripción de nueva categoría.
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  // Archivo de imagen seleccionado para subir con el plato.
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // URL temporal para previsualizar la imagen seleccionada.
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  // Estado del formulario principal de creación de plato.
  const [createForm, setCreateForm] = useState<CreateDishForm>({
    nom: '',
    descripcio: '',
    preu: '',
    id_categoria: '',
  });
  // Items de navegación del sidebar según el rol del usuario logueado.
  const sidebarNavItems = getSidebarNavItems(user?.rol);
  // Reutilizable para el input del formulario principal cuando hay errores
  const getInputClassName = (field: keyof CreateDishForm) =>
    `focus:ring-brand-accent2/20 ${createFormErrors[field] ? 'ring-2 ring-red-200 focus:ring-red-200' : ''}`;
  // Cuando hay errores en el select se usa este para cambiar el estilo visual a error
  const getSelectClassName = () =>
    `focus:ring-brand-accent2/20 ${createFormErrors.id_categoria ? 'ring-2 ring-red-200 focus:ring-red-200' : ''}`;

  useEffect(() => {
    // Bloquea el scroll del body cuando el sidebar móvil está abierto.
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    // Carga las categorías al entrar para poblar el select.
    const loadCategories = async () => {
      try {
        setCategoryError('');
        const categoriesResponse = await platsApi.getCategories();
        setCategories(categoriesResponse);
      } catch (error) {
        console.error('No se pudieron cargar las categorías', error);
        setCategoryError('No se pudieron cargar las categorías.');
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    // Mantiene una URL temporal para previsualizar la imagen elegida.
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile); // Crea una URL temporal para la imagen seleccionada para poder previsualizar
    setPhotoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl); // Libera la URL temporal cuando el componente se desmonta
    };
  }, [photoFile]);

  const removePhoto = () => {
    // Permite quitar la imagen antes de guardar el plato.
    setPhotoFile(null);
  };

  const validateCreateForm = () => {
    // Construye un mapa de errores por campo para mostrar mensajes debajo de cada input.
    const errors: Record<string, string> = {};
    const normalizedName = createForm.nom.trim();
    const parsedPrice = Number(createForm.preu);
    const parsedCategoryId = Number(createForm.id_categoria);

    if (!normalizedName) {
      errors.nom = 'El nombre del plato es obligatorio.';
    }

    if (!createForm.descripcio.trim()) {
      errors.descripcio = 'La descripción es obligatoria.';
    }

    if (!createForm.preu.trim()) {
      errors.preu = 'El precio es obligatorio.';
    } else if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      errors.preu = 'Introduce un precio válido mayor o igual a 0.';
    }

    if (!createForm.id_categoria.trim()) {
      errors.id_categoria = 'La categoría es obligatoria.';
    } else if (!Number.isInteger(parsedCategoryId) || parsedCategoryId < 1) {
      errors.id_categoria = 'El ID de categoría debe ser un entero mayor que 0.';
    }

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateDish = async () => {
    // Limpia errores globales antes de validar y enviar.
    setCreateError('');
    if (!validateCreateForm()) return;

    try {
      // Convierte tipos string del formulario a tipos numéricos que espera el backend.
      await platsApi.createPlat({
        nom: createForm.nom.trim(),
        descripcio: createForm.descripcio.trim(),
        preu: Number(createForm.preu),
        url: '',
        id_categoria: Number(createForm.id_categoria),
        imageFile: photoFile ?? undefined,
      });

      // Redirige al listado para que el usuario vea el nuevo plato en contexto.
      navigate('/admin/dishes', { replace: true });
    } catch (error) {
      console.error('No se pudo crear el plato', error);
      setCreateError('No se pudo crear el plato. Revisa los datos e inténtalo de nuevo.');
    }
  };

  const handleCreateCategory = async () => {
    // Permite crear una categoría cuando no existe la deseada en el select.
    const normalizedName = newCategoryName.trim();
    if (!normalizedName) {
      setCategoryError('El nombre de la categoría es obligatorio.');
      return;
    }

    try {
      setCategoryError('');
      const createdCategory = await platsApi.createCategory({
        nom: normalizedName,
        descripcio: newCategoryDescription.trim(),
      });

      // Inserta la nueva categoría y la deja seleccionada para continuar el alta del plato.
      setCategories((prev) => [...prev, createdCategory].sort((a, b) => a.nom.localeCompare(b.nom)));
      setCreateForm((prev) => ({ ...prev, id_categoria: String(createdCategory.id) }));
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (error) {
      console.error('No se pudo crear la categoría', error);
      setCategoryError('No se pudo crear la categoría. Inténtalo de nuevo.');
    }
  };

  const categoryOptions = [
    { value: '', label: 'Selecciona una categoría' },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.nom,
    })),
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
              aria-expanded={sidebarOpen}
              aria-controls="staff-sidebar-mobile"
              aria-label="Obrir menú"
            >
              <Menu className="size-6" />
            </button>
          </div>
          <nav className="flex items-center justify-center gap-2 text-xs font-medium text-brand-gray/40 mb-12 uppercase tracking-widest">
            <Link to="/admin/dishes" className="hover:text-brand-primary transition-colors">Platos</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-primary/60">Nou</span>
          </nav>
          <h1 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Crear plato
          </h1>
          <p className="mx-auto mt-3 mb-12 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Añade un nuevo plato y vincúlalo con su categoría.
          </p>
        </header>

        <main className="max-w-4xl mx-auto px-6 transition-all duration-700 w-full">
          <div className="bg-ds-bg-elevated rounded-ds-table shadow-2xl shadow-brand-primary/10 p-10 md:p-14 transition-all duration-700">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                label="Nombre"
                value={createForm.nom}
                error={createFormErrors.nom}
                inputClassName={getInputClassName('nom')}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: Paella de marisco"
              />
              <FormField
                label="Precio"
                type="number"
                min={0}
                step="0.01"
                value={createForm.preu}
                error={createFormErrors.preu}
                inputClassName={getInputClassName('preu')}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, preu: e.target.value }))}
                placeholder="Ex: 14.90"
              />
              <FormField
                label="Descripción"
                as="textarea"
                rows={4}
                className="md:col-span-2 space-y-2"
                value={createForm.descripcio}
                error={createFormErrors.descripcio}
                inputClassName={`${getInputClassName('descripcio')} resize-none`}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, descripcio: e.target.value }))}
                placeholder="Describe ingredientes o detalles del plato"
              />
              <FormImageUpload
                label="Imagen (opcional)"
                className="md:col-span-2"
                previewUrl={photoPreviewUrl}
                previewAlt={photoFile?.name ?? 'Preview plato'}
                onFileChange={(file) => {
                  // Reutiliza el mismo flujo de foto seleccionada para enviar al backend.
                  setPhotoFile(file);
                }}
                onRemoveImage={removePhoto}
              />
              <FormSelect
                label="Categoría"
                className="md:col-span-2 space-y-2"
                options={categoryOptions}
                value={createForm.id_categoria}
                error={createFormErrors.id_categoria}
                selectClassName={getSelectClassName()}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, id_categoria: e.target.value }))}
              />
            </div>

            <div className="mt-6 rounded-ds-md border border-ds-border-default bg-ds-surface-muted p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Crear categoría</p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  label="Nombre de categoría"
                  value={newCategoryName}
                  inputClassName="focus:ring-brand-accent2/20"
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Arroces"
                />
                <FormField
                  label="Descripción (opcional)"
                  value={newCategoryDescription}
                  inputClassName="focus:ring-brand-accent2/20"
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Detalles de la categoría"
                />
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => void handleCreateCategory()}
                  className="w-full md:w-auto md:self-end rounded-ds-sm border-2 border-ds-brand-wine px-4 py-2.5 font-ds-sans text-[11px] font-bold leading-none tracking-[1.5px] text-ds-brand-wine uppercase"
                >
                  Crear categoría
                </button>
                {categoryError ? <p className="text-sm text-red-600 italic">{categoryError}</p> : null}
                {categories.length === 0 ? (
                  <p className="text-xs text-ds-ui-muted italic">
                    No hay categorías disponibles. Crea una para poder registrar el plato.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-ds-footer-rule flex flex-col gap-4">
              {createError ? <p className="text-sm text-red-600 italic text-center mb-4">{createError}</p> : null}
              <button
                type="button"
                onClick={() => void handleCreateDish()}
                className="w-full py-4 bg-ds-brand-wine text-white rounded-ds-sm font-ds-sans text-sm font-bold uppercase tracking-[1.5px] shadow-sm transition-all duration-300 hover:bg-ds-brand-wine/90 hover:shadow-ds-btn active:scale-[0.98]"
              >
                Crear plato
              </button>
              <Link
                to="/admin/dishes"
                className="text-center font-ds-sans text-xs font-bold uppercase tracking-[1px] text-brand-primary/40 hover:text-brand-primary transition-colors"
              >
                Tornar al llistat
              </Link>
            </div>
          </div>

          <footer className="mt-10 w-full max-w-3xl mx-auto border-t border-ds-footer-rule pt-6 pb-12 text-center font-ds-ui text-xs text-ds-ui-muted sm:mt-16 sm:pt-8 sm:text-sm">
            <p>
              Necessites ajuda amb el menú?{' '}
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
