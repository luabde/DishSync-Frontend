import { useEffect, useState } from 'react';
import { Menu, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import { useAuth } from '../../hooks/auth.hook';
import { DishesFiltersBar } from '../../components/admin/Dishes/DishesFiltersBar';
import { DishCard } from '../../components/admin/Dishes/DishCard';
import type { DishItem, DishStatus } from '../../components/admin/Dishes/types';
import { platsApi, resolvePlatImageUrl } from '../../api/plats.api';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ManagementTable } from '../../components/common/ManagementTable';
import { StatusBadge } from '../../components/common/StatusBadge';

const PAGE_SIZE = 8;

type ManageDishesProps = {
  onEditDishSelect: (dishId: number) => void;
};

export default function ManageDishes({ onEditDishSelect }: ManageDishesProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dishes, setDishes] = useState<DishItem[]>([]);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TOTES');
  const [statusFilter, setStatusFilter] = useState<'TOTS' | DishStatus>('TOTS');
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<'TABLE' | 'GRID'>('TABLE');
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
          status: 'DISPONIBLE',
          imageUrl: resolvePlatImageUrl(plat.url),
        }));
        setDishes(mappedDishes);
      } catch (error) {
        console.error("No s'han pogut obtenir els plats", error);
        setLoadError("No s'han pogut carregar els plats.");
      }
    };

    void loadDishes();
  }, []);

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
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const paginatedDishes = filteredDishes.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  const confirmDeleteDish = async () => {
    if (!dishToDelete || deletingDishId) return;
    try {
      setDeleteError('');
      setDeletingDishId(dishToDelete.id);
      await platsApi.deletePlat(dishToDelete.id);
      setDishes((prev) => prev.filter((dish) => dish.id !== dishToDelete.id));
      setDishToDelete(null);
    } catch (error) {
      console.error("No s'ha pogut eliminar el plat", error);
      setDeleteError("No s'ha pogut eliminar el plat. Torna-ho a intentar.");
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
          <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:h-[88px] lg:flex-row lg:items-center lg:gap-0 lg:px-10 lg:py-0 lg:pl-[120px]">
            <div className="flex min-h-[36px] min-w-0 flex-1 items-center gap-2.5 lg:h-full lg:min-h-0">
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-ds-sm text-ds-brand-wine lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </button>
              <h1 className="min-w-0 font-ds-display text-lg font-semibold leading-none tracking-wide text-ds-brand-wine sm:text-2xl lg:text-[26px] lg:tracking-[2px]">
                Plats
              </h1>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/dishes/new')}
              className="flex size-9 shrink-0 items-center justify-center rounded-[5px] border-2 border-ds-brand-wine font-ds-sans text-ds-brand-wine uppercase transition-colors hover:bg-ds-brand-wine hover:text-white lg:static lg:right-auto lg:top-auto lg:h-auto lg:w-auto lg:translate-y-0 lg:px-[24px] lg:py-[11px] lg:text-[12px] lg:font-bold lg:leading-none lg:tracking-[1.2px] lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2"
            >
              <span className="hidden lg:inline">Nou Plat</span>
              <Plus className="size-5 lg:hidden" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
          <h2 className="text-center font-ds-display text-xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Gestionar plats
          </h2>
          <p className="mt-3 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Control de menús i gestió de plats.
          </p>

          <DishesFiltersBar
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            categoryOptions={[{ value: 'TOTES', label: 'Totes les Categories' }, ...Array.from(new Set(dishes.map((d) => d.category))).map((c) => ({ value: c, label: c }))]}
            statusOptions={[
              { value: 'TOTS', label: 'Estat: Tots' },
              { value: 'DISPONIBLE', label: 'Estat: Disponibles' },
              { value: 'NO_DISPONIBLE', label: 'Estat: No disponibles' },
            ]}
            onSearchTermChange={setSearchTerm}
            onCategoryFilterChange={setCategoryFilter}
            onStatusFilterChange={(value) => setStatusFilter(value as 'TOTS' | DishStatus)}
            view={view}
            onViewChange={setView}
          />

          {loadError ? (
            <p className="mt-4 text-sm text-red-500">{loadError}</p>
          ) : null}

          {view === 'TABLE' ? (
            <div className="mt-10 w-full max-w-[1000px]">
              <ManagementTable
                headers={['Plat', 'Descripció', 'Preu', 'Estat', 'Accions']}
                tableClassName="min-w-[800px]"
                footer={
                  <div className="flex flex-col items-center justify-center gap-4 px-4 py-5 sm:flex-row sm:justify-between sm:px-6 sm:py-6">
                    <p className="text-center font-ds-sans text-xs font-medium text-ds-wine-40 sm:text-left">
                      Mostrant {filteredDishes.length ? `${paginatedDishes.length} de ${filteredDishes.length}` : '0'} plats
                    </p>
                    <div className="hidden items-center gap-1 sm:flex">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={totalPages === 0 || safeCurrentPage === 1}
                        className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <ChevronLeft className="size-3.5" />
                      </button>
                      {pageNumbers.map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`flex size-8 items-center justify-center rounded font-ds-sans text-xs font-bold ${page === safeCurrentPage
                            ? 'bg-ds-brand-wine text-white'
                            : 'border border-ds-pagination-border bg-ds-bg-elevated text-ds-brand-wine'}`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={totalPages === 0 || safeCurrentPage === totalPages}
                        className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <ChevronRight className="size-3.5 text-ds-brand-wine" />
                      </button>
                    </div>
                  </div>
                }
              >
                {paginatedDishes.map((dish) => (
                  <tr key={dish.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={dish.imageUrl}
                          alt=""
                          className="size-12 rounded-lg object-cover shadow-ds-thumb"
                        />
                        <div>
                          <p className="font-ds-sans text-sm font-bold text-ds-brand-wine uppercase tracking-tight">{dish.name}</p>
                          <p className="font-ds-sans text-[11px] font-medium text-ds-wine-40">{dish.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-xs truncate font-ds-sans text-xs font-medium italic text-ds-wine-70">
                        {dish.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-ds-sans text-sm font-black text-ds-brand-gold">
                      {dish.price.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={dish.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3 text-ds-ui-muted">
                        <button
                          onClick={() => {
                            onEditDishSelect(dish.id);
                            navigate('/admin/dishes/edit');
                          }}
                          className="p-1.5 hover:text-ds-brand-copper transition-colors"
                          title="Editar plat"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDishToDelete(dish)}
                          className="p-1.5 hover:text-red-500 transition-colors"
                          title="Eliminar plat"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </ManagementTable>
            </div>
          ) : (
            <div className="mt-10 w-full max-w-[1000px]">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-ds-table border border-ds-card-border bg-ds-bg-elevated px-4 py-5 shadow-ds-table sm:flex-row sm:justify-between sm:px-6 sm:py-6">
                <p className="text-center font-ds-sans text-xs font-medium text-ds-wine-40 sm:text-left">
                  Mostrant {filteredDishes.length ? `${paginatedDishes.length} de ${filteredDishes.length}` : '0'} plats
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={totalPages === 0 || safeCurrentPage === 1}
                    className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex size-8 items-center justify-center rounded font-ds-sans text-xs font-bold ${page === safeCurrentPage
                        ? 'bg-ds-brand-wine text-white'
                        : 'border border-ds-pagination-border bg-ds-bg-elevated text-ds-brand-wine'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={totalPages === 0 || safeCurrentPage === totalPages}
                    className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <ChevronRight className="size-3.5 text-ds-brand-wine" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <footer className="mt-10 w-full max-w-3xl border-t border-ds-footer-rule pt-6 text-center font-ds-ui text-xs text-ds-ui-muted sm:mt-16 sm:pt-8 sm:text-sm">
            <p>
              Necessites ajuda per configurar el teu establiment?{' '}
              <a href="#" className="font-semibold text-ds-brand-gold hover:underline">
                Contacta amb suport tècnic
              </a>
            </p>
          </footer>
        </div>
      </div>
      <ConfirmDialog
        title="Eliminar plat"
        description={dishToDelete ? `Segur que vols eliminar ${dishToDelete.name}?` : ''}
        isOpen={Boolean(dishToDelete)}
        isLoading={Boolean(dishToDelete && deletingDishId === dishToDelete.id)}
        errorMessage={deleteError}
        overlayClassName="lg:left-[300px]"
        confirmText="Eliminar"
        cancelText="Cancel·lar"
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
