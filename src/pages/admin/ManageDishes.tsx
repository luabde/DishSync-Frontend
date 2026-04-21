import { useEffect, useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import { useAuth } from '../../hooks/auth.hook';
import { DishCard } from '../../components/admin/Dishes/DishCard';
import { DishesFiltersBar } from '../../components/admin/Dishes/DishesFiltersBar';
import { DishesPagination } from '../../components/admin/Dishes/DishesPagination';
import type { DishItem, DishStatus } from '../../components/admin/Dishes/types';
import { platsApi, resolvePlatImageUrl } from '../../api/plats.api';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const PAGE_SIZE = 6;

type ManageDishesProps = {
  onEditDishSelect: (dishId: number) => void;
};

export default function ManageDishes({ onEditDishSelect }: ManageDishesProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dishes, setDishes] = useState<DishItem[]>([]);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Guarda el valor actual de la búsqueda de los filtrs
  const [categoryFilter, setCategoryFilter] = useState('TOTES');
  const [statusFilter, setStatusFilter] = useState<'TOTS' | DishStatus>('TOTS');
  const [currentPage, setCurrentPage] = useState(1);
  const [dishToDelete, setDishToDelete] = useState<DishItem | null>(null);
  const [deletingDishId, setDeletingDishId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const sidebarNavItems = getSidebarNavItems(user?.rol);

  useEffect(() => {
    const loadDishes = async () => {
      try {
        setLoadError('');
        const plats = await platsApi.getPlats();
        const mappedDishes: DishItem[] = plats.map((plat) => ({
          id: plat.id,
          name: plat.nom,
          description: plat.descripcio ?? '',
          price: typeof plat.preu === 'number' ? plat.preu : Number.parseFloat(plat.preu),
          category: plat.categoria?.nom ?? 'Sense categoria',
          // El backend todavía no expone estado del plato; usamos disponible por defecto.
          status: 'DISPONIBLE',
          // Si no hay imagen real, mantenemos vacío para que la card muestre placeholder neutro.
          imageUrl: resolvePlatImageUrl(plat.url),
        }));
        setDishes(mappedDishes);
      } catch (error) {
        console.error('No se pudieron obtener los platos', error);
        setLoadError('No se han podido cargar los platos.');
      }
    };

    void loadDishes();
  }, []);

  useEffect(() => {
    // Bloquea scroll del body cuando el sidebar móvil está abierto.
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  // Genera opciones únicas de categoría para el select.
  const categoryOptions = (() => {
    const options = Array.from(new Set(dishes.map((dish) => dish.category)));
    /*
      Primero devuelve la opcion de todas, luego añade todas las categorias de options
    */
    return [{ value: 'TOTES', label: 'Totes les Categories' }, ...options.map((category) => ({ value: category, label: category }))];
  })();

  const statusOptions = [
    { value: 'TOTS', label: 'Estat: Tots' },
    { value: 'DISPONIBLE', label: 'Estat: Disponibles' },
    { value: 'NO_DISPONIBLE', label: 'Estat: No disponibles' },
  ];

  // Búsqueda por texto + filtros por categoría/estado.
  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = normalizedQuery.length === 0
      || dish.name.toLowerCase().includes(normalizedQuery)
      || dish.description.toLowerCase().includes(normalizedQuery)
      || dish.category.toLowerCase().includes(normalizedQuery);

    const matchesCategory = categoryFilter === 'TOTES' || dish.category === categoryFilter;
    const matchesStatus = statusFilter === 'TOTS' || dish.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDishes.length / PAGE_SIZE);
  // Evita salir de rango cuando cambia el total de resultados.
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const paginatedDishes = filteredDishes.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  useEffect(() => {
    // Al cambiar filtros, reiniciamos a la primera página.
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) setCurrentPage(1);
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const confirmDeleteDish = async () => {
    // Evita ejecutar sin selección o duplicar peticiones durante la misma eliminación.
    if (!dishToDelete || deletingDishId) return;
    try {
      setDeleteError('');
      setDeletingDishId(dishToDelete.id);
      await platsApi.deletePlat(dishToDelete.id);
      // Actualiza la grilla local para reflejar la eliminación sin recargar toda la página.
      setDishes((prev) => prev.filter((dish) => dish.id !== dishToDelete.id));
      setDishToDelete(null);
    } catch (error) {
      console.error('No se pudo eliminar el plato', error);
      setDeleteError('No se pudo eliminar el plato. Inténtalo de nuevo.');
    } finally {
      setDeletingDishId(null);
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
        <header className="sticky top-0 z-20 shrink-0 border-b-2 border-ds-brand-wine bg-ds-canvas">
          <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:h-[105px] lg:flex-row lg:items-center lg:gap-0 lg:px-10 lg:py-0 lg:pl-[120px]">
            <div className="flex min-h-[36px] min-w-0 flex-1 items-center gap-2.5 lg:h-full lg:min-h-0">
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-ds-sm text-ds-brand-wine lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-expanded={sidebarOpen}
                aria-controls="staff-sidebar-mobile"
                aria-label="Obrir menú"
              >
                <Menu className="size-5" />
              </button>
              <h1 className="min-w-0 font-ds-display text-lg font-semibold leading-none tracking-wide text-ds-brand-wine sm:text-2xl lg:text-[28.8px] lg:tracking-[2px]">
                Platos
              </h1>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/dishes/new')}
              className="flex size-9 shrink-0 items-center justify-center rounded-ds-sm border-2 border-ds-brand-wine font-ds-sans text-ds-brand-wine uppercase transition-colors hover:bg-ds-brand-wine hover:text-white lg:static lg:right-auto lg:top-auto lg:h-auto lg:w-auto lg:translate-y-0 lg:px-3.5 lg:py-3.5 lg:text-[12.8px] lg:font-bold lg:leading-none lg:tracking-[1.5px] lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2"
              aria-label="Nuevo Plato"
            >
              <span className="hidden lg:inline">Nuevo Plato</span>
              <Plus className="size-5 lg:hidden" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
          <h2 className="text-center font-ds-display text-xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Gestionar platos
          </h2>
          <p className="mt-3 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Control de menús i gestió de plats.
          </p>

          <DishesFiltersBar
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            categoryOptions={categoryOptions}
            statusOptions={statusOptions}
            onSearchTermChange={setSearchTerm}
            onCategoryFilterChange={setCategoryFilter}
            onStatusFilterChange={(value) => setStatusFilter(value as 'TOTS' | DishStatus)}
          />
          {loadError ? (
            <p className="mt-4 text-sm text-red-500">{loadError}</p>
          ) : null}

          <section className="mt-6 grid w-full max-w-[960px] grid-cols-1 gap-8 sm:mt-8 md:grid-cols-2 xl:grid-cols-3">
            {paginatedDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onEdit={(selectedDish) => {
                  onEditDishSelect(selectedDish.id);
                  navigate('/admin/dishes/edit');
                }}
                onDelete={(selectedDish) => {
                  setDeleteError('');
                  setDishToDelete(selectedDish);
                }}
              />
            ))}
          </section>

          <DishesPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            visibleItems={paginatedDishes.length}
            totalItems={filteredDishes.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <ConfirmDialog
        title="Eliminar plato"
        description={dishToDelete ? `¿Seguro que quieres eliminar ${dishToDelete.name}?` : ''}
        isOpen={Boolean(dishToDelete)}
        isLoading={Boolean(dishToDelete && deletingDishId === dishToDelete.id)}
        errorMessage={deleteError}
        // En desktop, centra el modal respecto al contenido derecho (sin sidebar).
        overlayClassName="lg:left-[300px]"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => void confirmDeleteDish()}
        onCancel={() => {
          if (deletingDishId) return;
          setDeleteError('');
          setDishToDelete(null);
        }}
      />
    </div>
  );
}
