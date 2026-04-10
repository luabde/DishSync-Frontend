import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';
import { useAuth } from '../hooks/auth.hook';
import { DishCard } from '../components/Dishes/DishCard';
import { DishesFiltersBar } from '../components/Dishes/DishesFiltersBar';
import { DishesPagination } from '../components/Dishes/DishesPagination';
import type { DishItem, DishStatus } from '../components/Dishes/types';

const DISH_IMAGE = 'https://www.figma.com/api/mcp/asset/b0f3e659-6633-4e19-8e32-f69c839e3d2c';
const PAGE_SIZE = 6;

// Mock temporal para maquetar la pantalla hasta conectar con backend real.
const MOCK_DISHES: DishItem[] = [
  { id: 1, name: 'Plato 1', description: 'Descripción plato', price: 6.5, category: 'Pasta', status: 'DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 2, name: 'Plato 2', description: 'Descripción plato', price: 7.2, category: 'Arroces', status: 'DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 3, name: 'Plato 3', description: 'Descripción plato', price: 6.5, category: 'Pasta', status: 'DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 4, name: 'Plato 4', description: 'Descripción plato', price: 8.1, category: 'Carnes', status: 'DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 5, name: 'Plato 5', description: 'Descripción plato', price: 9.5, category: 'Pescados', status: 'NO_DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 6, name: 'Plato 6', description: 'Descripción plato', price: 6.9, category: 'Pasta', status: 'DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 7, name: 'Plato 7', description: 'Descripción plato', price: 5.8, category: 'Entrantes', status: 'DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 8, name: 'Plato 8', description: 'Descripción plato', price: 7.7, category: 'Arroces', status: 'NO_DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 9, name: 'Plato 9', description: 'Descripción plato', price: 8.3, category: 'Carnes', status: 'DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 10, name: 'Plato 10', description: 'Descripción plato', price: 6.2, category: 'Entrantes', status: 'DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 11, name: 'Plato 11', description: 'Descripción plato', price: 7.1, category: 'Pescados', status: 'DISPONIBLE', imageUrl: DISH_IMAGE },
  { id: 12, name: 'Plato 12', description: 'Descripción plato', price: 10.5, category: 'Postres', status: 'NO_DISPONIBLE', imageUrl: DISH_IMAGE },
];

export default function ManageDishes() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Guarda el valor actual de la búsqueda de los filtrs
  const [categoryFilter, setCategoryFilter] = useState('TOTES');
  const [statusFilter, setStatusFilter] = useState<'TOTS' | DishStatus>('TOTS');
  const [currentPage, setCurrentPage] = useState(1);

  const sidebarNavItems = getSidebarNavItems(user?.rol);

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
    const options = Array.from(new Set(MOCK_DISHES.map((dish) => dish.category)));
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
  const filteredDishes = MOCK_DISHES.filter((dish) => {
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
          <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:h-[105px] lg:flex-row lg:items-center lg:gap-0 lg:px-10 lg:py-0 lg:pl-[120px]">
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
                Platos
              </h1>
            </div>
            <button
              type="button"
              className="w-full shrink-0 rounded-ds-sm border-2 border-ds-brand-wine px-3 py-2.5 font-ds-sans text-[11px] font-bold leading-none tracking-[1.5px] text-ds-brand-wine uppercase sm:px-3.5 sm:py-3.5 sm:text-[12.8px] lg:absolute lg:right-10 lg:top-1/2 lg:w-auto lg:-translate-y-1/2"
            >
              Nuevo Plato
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
          <h2 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
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

          <section className="mt-6 grid w-full max-w-[960px] grid-cols-1 gap-8 sm:mt-8 md:grid-cols-2 xl:grid-cols-3">
            {paginatedDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onEdit={() => undefined}
                onDelete={() => undefined}
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
    </div>
  );
}
