import { useEffect, useState } from 'react';
import { Building2, CalendarDays, ChevronLeft, ChevronRight, Menu, Users, Download } from 'lucide-react';
import type { ReactNode } from 'react';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';
import { useAuth } from '../hooks/auth.hook';
import { ToolbarSearchInput } from '../components/filters/ToolbarSearchInput';
import { ToolbarSelect } from '../components/filters/ToolbarSelect';

type DashboardProps = {
  onManageRestaurantSelect?: unknown;
};

type MetricCard = {
  label: string;
  value: string;
  icon: ReactNode;
};

type RestaurantCard = {
  name: string;
  address: string;
  imageUrl: string;
  taules: number;
  usuaris: number;
  reservesAvui: number;
  zones: number;
  platsDisp: number;
  platsNoDisp: number;
};

const METRICS: MetricCard[] = [
  { label: 'REST. ACTIUS', value: '12', icon: <Building2 className="size-3.5" /> },
  { label: 'REST. DESACTIVATS', value: '0', icon: <Building2 className="size-3.5" /> },
  { label: 'TOTAL USUARIS', value: '84', icon: <Users className="size-3.5" /> },
  { label: 'RESERVES DIA', value: '142', icon: <CalendarDays className="size-3.5" /> },
  { label: 'RESERVES SETMANA', value: '954', icon: <CalendarDays className="size-3.5" /> },
];

const RESTAURANTS: RestaurantCard[] = [
  {
    name: 'El Castell Centre',
    address: 'PLAZA DE CATALUNYA, 1 · 08002 BCN',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    taules: 45,
    usuaris: 18,
    reservesAvui: 64,
    zones: 4,
    platsDisp: 124,
    platsNoDisp: 3,
  },
  {
    name: 'El Castell Eixample',
    address: 'CARRER D\'ARAGÓ, 250 · 08007 BCN',
    imageUrl: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80',
    taules: 32,
    usuaris: 12,
    reservesAvui: 41,
    zones: 3,
    platsDisp: 98,
    platsNoDisp: 0,
  },
  {
    name: 'El Castell Sarrià',
    address: 'MAJOR DE SARRIÀ, 42 · 08017 BCN',
    imageUrl: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?auto=format&fit=crop&w=1200&q=80',
    taules: 28,
    usuaris: 10,
    reservesAvui: 37,
    zones: 2,
    platsDisp: 85,
    platsNoDisp: 5,
  },
];

const PAGE_SIZE = 3;

function RestaurantOverviewCard({ restaurant }: { restaurant: RestaurantCard }) {
  return (
    <article className="overflow-hidden rounded-xl border border-ds-card-border bg-ds-bg-elevated shadow-ds-card">
      <img src={restaurant.imageUrl} alt={restaurant.name} className="h-40 w-full object-cover" />
      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <h3 className="font-ds-display text-2xl text-ds-brand-wine sm:text-3xl">{restaurant.name}</h3>
          <p className="mt-1 text-[10px] font-semibold tracking-wide text-ds-wine-40 uppercase">{restaurant.address}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
          <p className="text-ds-wine-40 uppercase">TAULES <span className="ml-1 font-bold text-ds-brand-wine">{restaurant.taules}</span></p>
          <p className="text-ds-wine-40 uppercase">USUARIS <span className="ml-1 font-bold text-ds-brand-wine">{restaurant.usuaris}</span></p>
          <p className="text-ds-wine-40 uppercase">RESERVES AVUI <span className="ml-1 font-bold text-ds-brand-wine">{restaurant.reservesAvui}</span></p>
          <p className="text-ds-wine-40 uppercase">ZONES <span className="ml-1 font-bold text-ds-brand-wine">{restaurant.zones}</span></p>
          <p className="text-ds-wine-40 uppercase">PLATS DISP. <span className="ml-1 font-bold text-ds-brand-olive">{restaurant.platsDisp}</span></p>
          <p className="text-ds-wine-40 uppercase">PLATS NO DISP. <span className="ml-1 font-bold text-red-400">{restaurant.platsNoDisp}</span></p>
        </div>
      </div>
    </article>
  );
}

export default function Dashboard(_: DashboardProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TOTS');
  const [currentPage, setCurrentPage] = useState(1);
  const sidebarNavItems = getSidebarNavItems(user?.rol);

  const filteredRestaurants = RESTAURANTS.filter((rest) => 
    rest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rest.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRestaurants.length / PAGE_SIZE);
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const paginatedRestaurants = filteredRestaurants.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) setCurrentPage(1);
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

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

      <main className="flex min-h-screen min-w-0 flex-1 flex-col border-l border-black/5">
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
                Panel de Control
              </h1>
            </div>
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-ds-sm border-2 border-ds-brand-wine font-ds-sans text-ds-brand-wine uppercase transition-colors hover:bg-ds-brand-wine/5 lg:static lg:right-auto lg:top-auto lg:h-auto lg:w-auto lg:translate-y-0 lg:px-3.5 lg:py-3.5 lg:text-[12.8px] lg:font-bold lg:leading-none lg:tracking-[1.5px] lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2"
              aria-label="Descargar informe"
            >
              <span className="hidden lg:inline">Descargar informe</span>
              <Download className="size-5 lg:hidden" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-10 lg:pt-10">
          <div className="flex w-full max-w-[960px] flex-col items-center">
            <div className="mb-10 flex flex-col items-center">
              <h2 className="text-center font-ds-display text-xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
                Resumen Ejecutivo
              </h2>
              <p className="mt-3 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
                Cadena El Castell
              </p>
            </div>

            <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {METRICS.map((metric) => (
                <article key={metric.label} className="rounded-lg border border-ds-card-border bg-ds-bg-elevated p-4 shadow-ds-card sm:p-5">
                  <div className="mb-3 flex items-center justify-between text-ds-wine-40 sm:mb-4">
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase">{metric.label}</p>
                    {metric.icon}
                  </div>
                  <p className="text-2xl font-bold text-ds-brand-wine sm:text-4xl">{metric.value}</p>
                </article>
              ))}
            </section>

            <section className="mt-16 flex w-full flex-col items-center gap-8">
              {/* Barra de filtros unificada igual que en las pantallas de gestión */}
              <div className="flex w-full flex-col gap-3 rounded-lg bg-ds-bg-elevated p-4 shadow-ds-toolbar sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:flex-nowrap lg:p-6">
                <ToolbarSearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar restaurantes por nombre o dirección..."
                />
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:w-auto lg:flex-nowrap lg:shrink-0">
                  <ToolbarSelect
                    srLabel="Filtrar por estado"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: 'TOTS', label: 'Estat: Tots' },
                      { value: 'ACTIU', label: 'Estat: Actiu' },
                      { value: 'INACTIU', label: 'Estat: Inactiu' },
                    ]}
                    className="sm:w-[180px]"
                  />
                </div>
              </div>

              <div className="w-full">
                <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedRestaurants.map((restaurant) => (
                    <RestaurantOverviewCard key={restaurant.name} restaurant={restaurant} />
                  ))}
                </div>

                {filteredRestaurants.length > 0 && (
                  <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 rounded-ds-table border border-ds-card-border bg-ds-table-header-bg px-4 py-5 shadow-ds-table sm:flex-row sm:justify-between sm:px-6 sm:py-6">
                    <p className="text-center font-ds-sans text-xs font-medium text-ds-wine-40 sm:text-left">
                      Mostrant {filteredRestaurants.length ? `${paginatedRestaurants.length} de ${filteredRestaurants.length}` : '0'} restaurants
                    </p>
                    <div className="hidden items-center gap-1 sm:flex">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={totalPages === 0 || safeCurrentPage === 1}
                        className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                        aria-label="Pàgina anterior"
                      >
                        <ChevronLeft className="size-3.5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                        onClick={() => setCurrentPage((prev) => totalPages === 0 ? prev : Math.min(totalPages, prev + 1))}
                        disabled={totalPages === 0 || safeCurrentPage === totalPages}
                        className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
                        aria-label="Pàgina següent"
                      >
                        <ChevronRight className="size-3.5 text-ds-brand-wine" />
                      </button>
                    </div>
                  </div>
                )}

                {filteredRestaurants.length === 0 && (
                  <div className="py-20 text-center text-ds-wine-40">
                    <p className="font-ds-display text-2xl">No hay resultados</p>
                    <p className="mt-2 text-sm italic">Prueba con otro nombre o dirección</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
