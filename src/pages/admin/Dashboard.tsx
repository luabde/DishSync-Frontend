import { useEffect, useState } from 'react';
import { Building2, CalendarDays, ChevronLeft, ChevronRight, Menu, Users, Download } from 'lucide-react';
import type { ReactNode } from 'react';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import { useAuth } from '../../hooks/auth.hook';
import { ToolbarSearchInput } from '../../components/filters/ToolbarSearchInput';
import { ToolbarSelect } from '../../components/filters/ToolbarSelect';
import { restaurantApi } from '../../api/restaurant.api';
import { resolvePublicMediaUrl } from '../../utils/resolveMediaUrl';
import { ManagementTable } from '../../components/common/ManagementTable';
import { exportDashboardPDF } from '../../utils/exportUtils';

type DashboardProps = {
  onManageRestaurantSelect?: unknown;
};

type MetricCard = {
  label: string;
  value: string;
  icon: ReactNode;
};

type RestaurantCard = {
  id: number;
  name: string;
  address: string;
  imageUrl: string;
  estat: 'ACTIU' | 'INACTIU';
  taules: number;
  usuaris: number;
  reservesAvui: number;
  zones: number;
  platsDisp: number;
  platsNoDisp: number;
};

const PAGE_SIZE = 6;

function RestaurantOverviewCard({ restaurant }: { restaurant: RestaurantCard }) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [restaurant.imageUrl]);

  const isActive = restaurant.estat === 'ACTIU';
  const shouldShowImage = Boolean(restaurant.imageUrl) && !hasImageError;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-ds-card-border bg-ds-bg-elevated shadow-ds-card transition-all hover:shadow-ds-card-hover">
      {/* Area de Imagen / Placeholder */}
      <div className="relative h-48 shrink-0 overflow-hidden bg-ds-surface-muted">
        {shouldShowImage ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="size-full object-cover"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[#F5F5F5]">
            <span className="text-[14px] font-bold uppercase tracking-[2px] text-[#7A8C99]">
              Sense Imatge
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-ds-wine-40">
          {restaurant.address}
        </p>
        <h3 className="mt-1 font-ds-sans text-[18px] font-black uppercase tracking-tight text-ds-brand-wine">
          {restaurant.name}
        </h3>

        <div className="mt-4">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white ${isActive ? 'bg-[#5B6D43]' : 'bg-[#6F1D1B]'}`}>
            {restaurant.estat}
          </span>
        </div>

        <div className="mt-6 border-t border-ds-row-divider pt-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ds-wine-40">Taules</span>
              <span className="text-[13px] font-black text-black">{restaurant.taules}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ds-wine-40">Usuaris</span>
              <span className="text-[13px] font-black text-black">{restaurant.usuaris}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ds-wine-40">Reserves</span>
              <span className="text-[13px] font-black text-black">{restaurant.reservesAvui}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ds-wine-40">Zones</span>
              <span className="text-[13px] font-black text-black">{restaurant.zones}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ds-wine-40">Plats (D)</span>
              <span className="text-[13px] font-black text-[#5B6D43]">{restaurant.platsDisp}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ds-wine-40">Plats (N)</span>
              <span className="text-[13px] font-black text-[#E63946]">{restaurant.platsNoDisp}</span>
            </div>
          </div>
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
  const [view, setView] = useState<'TABLE' | 'GRID'>('GRID');
  const [summary, setSummary] = useState({
    restaurantsActivos: 0,
    restaurantsInactivos: 0,
    usuarios: 0,
    reservasHoy: 0,
    reservasSemana: 0,
  });
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);

  const sidebarNavItems = getSidebarNavItems(user?.rol);
  const metrics: MetricCard[] = [
    { label: 'REST. ACTIUS', value: String(summary.restaurantsActivos), icon: <Building2 className="size-3.5" /> },
    { label: 'REST. DESACTIVATS', value: String(summary.restaurantsInactivos), icon: <Building2 className="size-3.5" /> },
    { label: 'TOTAL USUARIS', value: String(summary.usuarios), icon: <Users className="size-3.5" /> },
    { label: 'RESERVES DIA', value: String(summary.reservasHoy), icon: <CalendarDays className="size-3.5" /> },
    { label: 'RESERVES SETMANA', value: String(summary.reservasSemana), icon: <CalendarDays className="size-3.5" /> },
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await restaurantApi.getRestaurantsDashboard();
        setSummary({
          restaurantsActivos: data.restaurantsActivos,
          restaurantsInactivos: data.restaurantsInactivos,
          usuarios: data.usuarios,
          reservasHoy: data.reservasHoy,
          reservasSemana: data.reservasSemana,
        });
        setRestaurants(
          data.restaurantsDashboard.map((r) => ({
            id: r.id,
            name: r.nom,
            address: r.direccio,
            imageUrl: resolvePublicMediaUrl(r.url),
            estat: r.estat,
            taules: r.taules,
            usuaris: r.usuaris,
            reservesAvui: r.reservesHoy,
            zones: r.zones,
            platsDisp: r.platsDisp,
            platsNoDisp: r.platsNoDisp,
          }))
        );
      } catch (error) {
        console.error("No s'ha pogut carregar el dashboard", error);
      }
    };
    void loadDashboard();
  }, []);

  const filteredRestaurants = restaurants
    .filter((rest) => statusFilter === 'TOTS' || rest.estat === statusFilter)
    .filter((rest) =>
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
  }, [searchTerm, statusFilter]);

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
                Tauler de Control
              </h1>
            </div>
            <button
              type="button"
              onClick={() => exportDashboardPDF(restaurants, summary)}
              className="flex h-[42px] items-center justify-center rounded-[5px] border-2 border-ds-brand-wine bg-transparent px-7 font-ds-sans text-[13px] font-bold uppercase tracking-[1.2px] text-ds-brand-wine transition-all duration-300 hover:bg-ds-brand-wine hover:text-white lg:static lg:right-auto lg:top-auto lg:translate-y-0 lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2"
            >
              <span className="hidden lg:inline">Descarregar informe</span>
              <Download className="size-5 lg:hidden" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-10 lg:pt-10">
          <div className="flex w-full max-w-[1000px] flex-col items-center">
            <div className="mb-10 flex flex-col items-center">
              <h2 className="text-center font-ds-display text-xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
                Resum Executiu
              </h2>
              <p className="mt-3 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
                Cadena El Castell
              </p>
            </div>

            <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {metrics.map((metric) => (
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
              <div className="flex w-full flex-col gap-3 rounded-lg bg-ds-bg-elevated p-4 shadow-ds-toolbar sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:flex-nowrap lg:p-6">
                <ToolbarSearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar restaurants per nom o adreça..."
                />
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:w-auto lg:flex-nowrap lg:shrink-0">
                  <ToolbarSelect
                    srLabel="Filtrar per estat"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: 'TOTS', label: 'Estat: Tots' },
                      { value: 'ACTIU', label: 'Estat: Actiu' },
                      { value: 'INACTIU', label: 'Estat: Inactiu' },
                    ]}
                    className="sm:w-[180px]"
                  />
                  <div className="ml-auto hidden h-11 items-center gap-1 rounded-lg bg-ds-bg-page p-1 sm:flex">
                    <button
                      type="button"
                      onClick={() => setView('TABLE')}
                      className={`flex h-full items-center gap-2 rounded-md px-3 transition-all ${view === 'TABLE' ? 'bg-ds-brand-wine text-white shadow-sm' : 'text-ds-wine-40 hover:bg-ds-wine-10'}`}
                    >
                      <Menu className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('GRID')}
                      className={`flex h-full items-center gap-2 rounded-md px-3 transition-all ${view === 'GRID' ? 'bg-ds-brand-wine text-white shadow-sm' : 'text-ds-wine-40 hover:bg-ds-wine-10'}`}
                    >
                      <Building2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full">
                {view === 'TABLE' ? (
                  <ManagementTable
                    headers={['Restaurant', 'Estat', 'Taules', 'Usuaris', 'Reserves', 'Zones', 'Plats (D/N)']}
                    tableClassName="min-w-[900px] [&_thead_th:last-child]:text-left"
                    footer={
                      <div className="flex flex-col items-center justify-center gap-4 px-4 py-5 sm:flex-row sm:justify-between sm:px-6 sm:py-6">
                        <p className="text-center font-ds-sans text-xs font-medium text-ds-wine-40 sm:text-left">
                          Mostrant {filteredRestaurants.length ? `${paginatedRestaurants.length} de ${filteredRestaurants.length}` : '0'} restaurants
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
                          >
                            <ChevronRight className="size-3.5 text-ds-brand-wine" />
                          </button>
                        </div>
                      </div>
                    }
                  >
                    {paginatedRestaurants.map((r) => (
                      <tr key={r.id}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="size-10 overflow-hidden rounded-lg border border-ds-card-border bg-ds-surface-muted">
                              {r.imageUrl ? (
                                <img src={r.imageUrl} alt={r.name} className="size-full object-cover" />
                              ) : (
                                <div className="flex size-full items-center justify-center text-[10px] font-bold text-ds-ui-muted opacity-40">N/A</div>
                              )}
                            </div>
                            <div>
                              <p className="font-ds-display text-base font-bold text-ds-brand-wine">{r.name}</p>
                              <p className="text-[10px] font-medium text-ds-wine-40 uppercase tracking-wide">{r.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 ${r.estat === 'ACTIU' ? 'bg-ds-brand-olive' : 'bg-[#6F1D1B]'}`}>
                            {r.estat}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-ds-brand-wine">{r.taules}</td>
                        <td className="px-6 py-5 text-sm font-bold text-ds-brand-wine">{r.usuaris}</td>
                        <td className="px-6 py-5 text-sm font-bold text-ds-brand-wine">{r.reservesAvui}</td>
                        <td className="px-6 py-5 text-sm font-bold text-ds-brand-wine">{r.zones}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm font-bold">
                            <span className="text-ds-brand-olive">{r.platsDisp}</span>
                            <span className="text-ds-wine-10">/</span>
                            <span className="text-red-500">{r.platsNoDisp}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </ManagementTable>
                ) : (
                  <>
                    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {paginatedRestaurants.map((restaurant) => (
                        <RestaurantOverviewCard key={restaurant.id} restaurant={restaurant} />
                      ))}
                    </div>

                    {filteredRestaurants.length > 0 && (
                      <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 rounded-ds-table border border-ds-card-border bg-ds-bg-elevated px-4 py-5 shadow-ds-table sm:flex-row sm:justify-between sm:px-6 sm:py-6">
                        <p className="text-center font-ds-sans text-xs font-medium text-ds-wine-40 sm:text-left">
                          Mostrant {filteredRestaurants.length ? `${paginatedRestaurants.length} de ${filteredRestaurants.length}` : '0'} restaurants
                        </p>
                        <div className="flex items-center gap-1">
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
                  </>
                )}

                {filteredRestaurants.length === 0 && (
                  <div className="py-20 text-center text-ds-wine-40">
                    <p className="font-ds-display text-2xl">No hi ha resultats</p>
                    <p className="mt-2 text-sm italic">Prova amb un altre nom o adreça</p>
                  </div>
                )}
              </div>
            </section>
          </div>
          
          <footer className="mt-10 w-full border-t border-ds-footer-rule pt-6 text-center font-ds-ui text-xs text-ds-ui-muted sm:mt-16 sm:pt-8 sm:text-sm">
            <p>
                Necessites ajuda per configurar el teu establiment?{' '}
                <a
                    href="#"
                    className="font-semibold text-ds-brand-gold hover:underline"
                >
                    Contacta amb suport tècnic
                </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
