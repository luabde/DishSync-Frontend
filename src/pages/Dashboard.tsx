import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/auth.hook';
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ListFilter,
    Menu,
    Search,
} from 'lucide-react';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';
import { API_BASE_URL } from '../api/config';
import { fetchWithAuth } from '../api/client';

/** Resposta del backend (Prisma / REST) */
type ApiRestaurant = {
    id: number;
    nom: string;
    direccio: string;
    horaris: string;
    telefon: string;
    url: string | null;
    descripcio: string | null;
    estat: 'ACTIU' | 'INACTIU';
};

const PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200&h=200';

async function fetchRestaurants(): Promise<ApiRestaurant[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/restaurants`);
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data as ApiRestaurant[];
}

function StatusCell({ estat }: { estat: ApiRestaurant['estat'] }) {
    const active = estat === 'ACTIU';
    return (
        <div className="flex items-center gap-2 pl-0 sm:pl-4 lg:pl-6">
            <span
                className={`size-1.5 shrink-0 rounded-full ${active ? 'bg-ds-brand-olive' : 'bg-ds-status-inactive-dot'}`}
            />
            <span
                className={`font-ds-ui text-xs font-medium ${active ? 'text-ds-brand-olive' : 'text-ds-status-inactive-text'}`}
            >
                {estat}
            </span>
        </div>
    );
}

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);

    const sidebarNavItems = useMemo(() => getSidebarNavItems(user?.rol), [user?.rol]);

    useEffect(() => {
        void fetchRestaurants().then(setRestaurants);
        console.log("restaurants", restaurants);
    }, []);

    useEffect(() => {
        if (!sidebarOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
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

            <div className="flex min-h-screen min-w-0 flex-1 flex-col border-l border-black/5">
                <header className="relative shrink-0 border-b-2 border-ds-brand-wine bg-ds-canvas">
                    <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:h-[105px] lg:flex-row lg:items-center lg:gap-0 lg:px-10 lg:py-0 lg:pl-[125px]">
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
                                Gestionar Restaurants
                            </h1>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/restaurants/new')}
                            className="w-full shrink-0 rounded-ds-sm border-2 border-ds-brand-wine px-3 py-2.5 font-ds-sans text-[11px] font-bold leading-none tracking-[1.5px] text-ds-brand-wine uppercase sm:px-3.5 sm:py-3.5 sm:text-[12.8px] lg:absolute lg:right-10 lg:top-1/2 lg:w-auto lg:-translate-y-1/2"
                        >
                            Nou restaurant
                        </button>
                    </div>
                </header>

                <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
                    <h2 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
                        Gestionar restaurants
                    </h2>
                    <p className="mt-3 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
                        Control de menús i gestió de plats.
                    </p>

                    <div className="mt-4 flex w-full max-w-[960px] flex-col gap-3 rounded-lg bg-ds-bg-elevated p-4 shadow-ds-toolbar sm:mt-5 sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:flex-nowrap lg:p-6">
                        <div className="relative w-full min-w-0 sm:flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-ds-ui-muted" />
                            <input
                                type="search"
                                placeholder="Cerca pel nom o ciutat..."
                                className="w-full rounded-lg border border-ds-input-border bg-ds-surface-muted py-2.5 pl-10 pr-4 font-ds-sans text-sm text-ds-fg-default placeholder:text-ds-ui-muted"
                            />
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:w-auto lg:flex-nowrap lg:shrink-0">
                            <button
                                type="button"
                                className="flex h-[46px] w-full min-w-0 shrink-0 items-center justify-between gap-2 rounded-lg border border-ds-input-border bg-ds-surface-muted px-4 font-ds-sans text-sm text-black sm:w-[min(100%,193px)] lg:w-[193px]"
                            >
                                Totes les Categories
                                <ChevronDown className="size-[21px] shrink-0 opacity-60" />
                            </button>
                            <button
                                type="button"
                                className="flex h-[46px] w-full min-w-0 shrink-0 items-center justify-between gap-2 rounded-lg border border-ds-input-border bg-ds-surface-muted px-4 font-ds-sans text-sm text-black sm:w-[min(100%,180px)] lg:w-[180px]"
                            >
                                Estat: Tots
                                <ChevronDown className="size-[21px] shrink-0 opacity-60" />
                            </button>
                            <button
                                type="button"
                                className="flex h-[46px] w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-ds-input-border px-4 font-ds-sans text-sm text-black sm:w-auto lg:px-[17px]"
                            >
                                <ListFilter className="size-4 shrink-0 opacity-70" />
                                Més filtres
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 w-full max-w-[900px] overflow-hidden rounded-ds-table border border-ds-card-border bg-ds-bg-elevated shadow-ds-table sm:mt-8">
                        <div className="-mx-px overflow-x-auto sm:mx-0">
                            <table className="w-full min-w-[560px] border-collapse text-left md:min-w-[640px]">
                                <thead>
                                    <tr className="bg-ds-table-header-bg">
                                        <th className="px-3 py-3 font-ds-sans text-[10px] font-bold uppercase tracking-[1.1px] text-ds-wine-50 sm:px-5 sm:py-4 sm:text-[11px] lg:px-8">
                                            <span className="block leading-tight">Informació del</span>
                                            <span className="block leading-tight">Restaurant</span>
                                        </th>
                                        <th className="px-3 py-4 font-ds-sans text-[10px] font-bold uppercase tracking-[1.1px] text-ds-wine-50 sm:px-5 sm:py-6 sm:text-[11px] lg:px-8">
                                            Ubicació
                                        </th>
                                        <th className="px-3 py-4 font-ds-sans text-[10px] font-bold uppercase tracking-[1.1px] text-ds-wine-50 sm:px-5 sm:py-6 sm:text-[11px] lg:px-8">
                                            Estat
                                        </th>
                                        <th className="px-3 py-4 text-right font-ds-sans text-[10px] font-bold uppercase tracking-[1.1px] text-ds-wine-50 sm:px-5 sm:py-6 sm:text-[11px] lg:px-8">
                                            Accions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {restaurants.map((r, i) => (
                                        <tr
                                            key={r.id}
                                            className={i > 0 ? 'border-t border-ds-row-divider' : ''}
                                        >
                                            <td className="px-3 py-4 align-middle sm:px-5 sm:py-5 lg:px-8 lg:py-6">
                                                <div className="flex max-w-[280px] items-start gap-3 sm:items-center sm:gap-4">
                                                    <div
                                                        className={`relative size-10 shrink-0 overflow-hidden rounded-lg shadow-ds-thumb sm:size-12 ${r.estat === 'INACTIU' ? 'opacity-60' : ''}`}
                                                    >
                                                        <img
                                                            src={r.url?.trim() || PLACEHOLDER_IMAGE}
                                                            alt=""
                                                            className="size-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-ds-sans text-sm font-bold text-ds-brand-wine sm:text-base">
                                                            {r.nom}
                                                        </p>
                                                        {r.descripcio ? (
                                                            <p className="font-ds-sans text-[11px] font-medium leading-4 text-ds-wine-40 sm:text-xs">
                                                                {r.descripcio}
                                                            </p>
                                                        ) : null}
                                                        {r.horaris ? (
                                                            <p className="font-ds-sans text-[11px] font-medium leading-4 text-ds-wine-40 sm:text-xs">
                                                                {r.horaris}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 align-middle sm:px-5 sm:py-5 lg:px-8 lg:py-6">
                                                <p className="font-ds-sans text-xs font-medium leading-5 text-ds-wine-70 sm:text-sm">
                                                    {r.direccio || '—'}
                                                </p>
                                                {r.telefon ? (
                                                    <p className="font-ds-sans text-[11px] leading-4 text-ds-wine-40 sm:text-xs">
                                                        {r.telefon}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="px-2 py-4 align-middle sm:px-3 sm:py-5 lg:px-2 lg:py-6">
                                                <StatusCell estat={r.estat} />
                                            </td>
                                            <td className="px-3 py-4 align-middle sm:px-5 sm:py-5 lg:px-8 lg:py-6">
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        className="rounded-lg bg-ds-btn-gestionar-bg px-3 py-1.5 font-ds-sans text-[11px] font-bold text-ds-brand-copper sm:px-4 sm:py-2 sm:text-xs"
                                                    >
                                                        Gestionar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-4 border-t border-ds-row-divider bg-ds-table-header-bg px-4 py-5 sm:flex-row sm:justify-between sm:px-6 sm:py-6">
                            <p className="text-center font-ds-sans text-xs font-medium text-ds-wine-40 sm:text-left">
                                Mostrant{' '}
                                {restaurants.length
                                    ? `1-${restaurants.length} de ${restaurants.length}`
                                    : '0'}{' '}
                                restaurants
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    className="flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated opacity-30"
                                    aria-label="Pàgina anterior"
                                >
                                    <ChevronLeft className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    className="flex size-8 items-center justify-center rounded bg-ds-brand-wine font-ds-sans text-xs font-bold text-white"
                                >
                                    1
                                </button>
                                <button
                                    type="button"
                                    className="flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated font-ds-sans text-xs font-bold text-ds-brand-wine"
                                >
                                    2
                                </button>
                                <button
                                    type="button"
                                    className="flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated font-ds-sans text-xs font-bold text-ds-brand-wine"
                                >
                                    3
                                </button>
                                <button
                                    type="button"
                                    className="flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated"
                                    aria-label="Pàgina següent"
                                >
                                    <ChevronRight className="size-3.5 text-ds-brand-wine" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <footer className="mt-10 w-full max-w-3xl border-t border-ds-footer-rule pt-6 text-center font-ds-ui text-xs text-ds-ui-muted sm:mt-16 sm:pt-8 sm:text-sm">
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
            </div>
        </div>
    );
}
