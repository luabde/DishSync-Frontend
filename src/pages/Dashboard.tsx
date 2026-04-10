import { useEffect, useState } from 'react';
import { Building2, CalendarDays, Menu, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';
import { useAuth } from '../hooks/auth.hook';

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

function RestaurantOverviewCard({ restaurant }: { restaurant: RestaurantCard }) {
  return (
    <article className="overflow-hidden rounded-xl border border-ds-card-border bg-ds-bg-elevated shadow-ds-card">
      <img src={restaurant.imageUrl} alt={restaurant.name} className="h-40 w-full object-cover" />
      <div className="space-y-4 p-5">
        <div>
          <h3 className="font-ds-display text-3xl text-ds-brand-wine">{restaurant.name}</h3>
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
        <button
          type="button"
          className="w-full rounded-lg border border-ds-brand-wine px-4 py-2.5 text-[10px] font-bold tracking-[1.2px] text-ds-brand-wine uppercase"
        >
          Acceder al dashboard +
        </button>
      </div>
    </article>
  );
}

export default function Dashboard(_: DashboardProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarNavItems = getSidebarNavItems(user?.rol);

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

      <main className="flex min-h-screen min-w-0 flex-1 flex-col border-l border-black/5 px-4 py-5 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-ds-sm border border-ds-brand-wine/30 text-ds-brand-wine lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-expanded={sidebarOpen}
              aria-controls="staff-sidebar-mobile"
              aria-label="Obrir menú"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <h1 className="font-ds-display text-[54px] leading-none text-ds-brand-wine">Panel de Control</h1>
              <p className="mt-1 text-sm text-ds-wine-40">Resumen ejecutivo de la cadena El Castell</p>
            </div>
          </div>
          <button
            type="button"
            className="self-start rounded-ds-sm bg-ds-brand-wine px-6 py-3 text-xs font-bold tracking-[1px] text-white uppercase shadow-ds-btn"
          >
            Descargar informe
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {METRICS.map((metric) => (
            <article key={metric.label} className="rounded-lg border border-ds-card-border bg-ds-bg-elevated p-5 shadow-ds-card">
              <div className="mb-4 flex items-center justify-between text-ds-wine-40">
                <p className="text-[10px] font-semibold tracking-[1.5px] uppercase">{metric.label}</p>
                {metric.icon}
              </div>
              <p className="text-4xl font-bold text-ds-brand-wine">{metric.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="font-ds-display text-[42px] text-ds-brand-wine">Nuestros Restaurantes</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 xl:grid-cols-3">
            {RESTAURANTS.map((restaurant) => (
              <RestaurantOverviewCard key={restaurant.name} restaurant={restaurant} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
