import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/auth.hook';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    Pencil,
    Trash2,
} from 'lucide-react';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';
import { API_BASE_URL } from '../api/config';
import { fetchWithAuth } from '../api/client';
import { restaurantApi } from '../api/restaurant.api';
import { ToolbarSearchInput } from '../components/filters/ToolbarSearchInput';
import { ToolbarSelect } from '../components/filters/ToolbarSelect';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { ManageRestaurantData } from '../components/CreateRestaurant/ManageRestaurantForm';

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
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const resolveRestaurantImageUrl = (rawUrl: string | null) => {
    const cleaned = rawUrl?.trim();
    if (!cleaned) return PLACEHOLDER_IMAGE;
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned;
    return `${API_ORIGIN}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`;
};

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

type DashboardProps = {
    onManageRestaurantSelect?: (restaurant: ManageRestaurantData) => void;
};

export default function Dashboard({ onManageRestaurantSelect }: DashboardProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
    // Texto de búsqueda (ahora solo aplica sobre el nombre del restaurante).
    const [searchTerm, setSearchTerm] = useState('');
    // Filtro por estado real del restaurante.
    const [statusFilter, setStatusFilter] = useState<'TOTS' | ApiRestaurant['estat']>('TOTS');
    // Orden alfabético por nombre.
    const [sortByName, setSortByName] = useState<'A_Z' | 'Z_A'>('A_Z');
    // Página actual de la tabla (arranca en 1).
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingRestaurantId, setDeletingRestaurantId] = useState<number | null>(null);
    // Restaurante actualmente seleccionado para acciones destructivas del modal.
    const [restaurantToDelete, setRestaurantToDelete] = useState<ApiRestaurant | null>(null);
    // Mensaje devuelto por backend al intentar eliminar.
    const [deleteRestaurantError, setDeleteRestaurantError] = useState('');
    // Solo se activa cuando backend bloquea borrado por reservas futuras.
    const [showDeactivateAction, setShowDeactivateAction] = useState(false);
    // Tamaño fijo de página para mantener UX estable.
    const PAGE_SIZE = 6;

    const sidebarNavItems = getSidebarNavItems(user?.rol);

    useEffect(() => {
        void fetchRestaurants().then(setRestaurants);
    }, []);

    useEffect(() => {
        if (!sidebarOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [sidebarOpen]);

    // Resultado derivado para la tabla: filtra por nombre + estado y aplica orden.
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredRestaurants = [...restaurants]
        .filter((restaurant) => {
            // Búsqueda exclusiva por `nom`.
            const matchesName =
                normalizedSearch.length === 0 ||
                restaurant.nom.toLowerCase().includes(normalizedSearch);
            const matchesStatus =
                statusFilter === 'TOTS' || restaurant.estat === statusFilter;
            return matchesName && matchesStatus;
        })
        .sort((a, b) => {
            const compare = a.nom.localeCompare(b.nom, 'ca', { sensitivity: 'base' });
            return sortByName === 'A_Z' ? compare : -compare;
        });

    // Número total de páginas en función del resultado filtrado
    // Ceil redondea hacia arriba, ya que si dividimos el numero d erestaurante y la pagina no siempre es exacto
    const totalPages = Math.ceil(filteredRestaurants.length / PAGE_SIZE);
    // Asegura que la página actual siempre esté en rango válido.
    // Con 0 páginas usamos 1 de forma virtual para que los índices no sean negativos.
    const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
    // Índices de corte para extraer solo los restaurantes de la página activa.
    /* 
        Ejemplos con PAGE_SIZE = 6:

        página 1 -> (1-1)*6 = 0
        página 2 -> (2-1)*6 = 6
        página 3 -> (3-1)*6 = 12
    */
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    // Datos concretos que se pintan en la tabla de esta página.
    const paginatedRestaurants = filteredRestaurants.slice(startIndex, endIndex);
    // Conteo visible para el texto "Mostrant X de Y".
    const visibleCount = paginatedRestaurants.length;

    // Si cambian filtros/orden y la página queda fuera de rango, se corrige automáticamente.
    useEffect(() => {
        if (totalPages === 0 && currentPage !== 1) {
            setCurrentPage(1);
            return;
        }
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    // Al cambiar búsqueda/filtro/orden, volvemos a la primera página para evitar saltos raros.
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, sortByName]);

    // Números de página visibles en desktop.
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    const handleDeleteRestaurant = (restaurant: ApiRestaurant) => {
        // Abre el modal limpio para el restaurante seleccionado.
        setDeleteRestaurantError('');
        setShowDeactivateAction(false);
        setRestaurantToDelete(restaurant);
    };

    const confirmDeleteRestaurant = async () => {
        if (!restaurantToDelete) return;
        try {
            setDeletingRestaurantId(restaurantToDelete.id);
            await restaurantApi.deleteRestaurant(restaurantToDelete.id);
            // Si backend permite borrar, quitamos el item en cliente sin recargar.
            setRestaurants((prev) => prev.filter((item) => item.id !== restaurantToDelete.id));
            setRestaurantToDelete(null);
            setDeleteRestaurantError('');
            setShowDeactivateAction(false);
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'No se pudo eliminar el restaurante. Inténtalo de nuevo.';
            setDeleteRestaurantError(message);
            // Señal para habilitar CTA de desactivar cuando hay reservas futuras.
            setShowDeactivateAction(message.toLowerCase().includes('reserves futures'));
        } finally {
            setDeletingRestaurantId(null);
        }
    };

    const handleDeactivateRestaurant = async () => {
        if (!restaurantToDelete) return;
        try {
            setDeletingRestaurantId(restaurantToDelete.id);
            await restaurantApi.deactivateRestaurant(restaurantToDelete.id);
            // Refleja el nuevo estado en la tabla sin volver a pedir datos.
            setRestaurants((prev) =>
                prev.map((item) =>
                    item.id === restaurantToDelete.id ? { ...item, estat: 'INACTIU' } : item
                )
            );
            setRestaurantToDelete(null);
            setDeleteRestaurantError('');
            setShowDeactivateAction(false);
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'No se pudo desactivar el restaurante. Inténtalo de nuevo.';
            setDeleteRestaurantError(message);
        } finally {
            setDeletingRestaurantId(null);
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
                        <ToolbarSearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Cerca pel nom..."
                        />
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:w-auto lg:flex-nowrap lg:shrink-0">
                            {/* Filtro funcional por estado (sustituye controles no conectados). */}
                            <ToolbarSelect
                                srLabel="Filtrar per estat"
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value as 'TOTS' | ApiRestaurant['estat'])}
                                options={[
                                    { value: 'TOTS', label: 'Estat: Tots' },
                                    { value: 'ACTIU', label: 'Estat: Actius' },
                                    { value: 'INACTIU', label: 'Estat: Inactius' },
                                ]}
                                className="sm:w-[min(100%,193px)] lg:w-[193px]"
                            />
                            {/* Orden funcional por nombre para facilitar exploración del listado. */}
                            <ToolbarSelect
                                srLabel="Ordenar per nom"
                                value={sortByName}
                                onChange={(value) => setSortByName(value as 'A_Z' | 'Z_A')}
                                options={[
                                    { value: 'A_Z', label: 'Nom: A - Z' },
                                    { value: 'Z_A', label: 'Nom: Z - A' },
                                ]}
                                className="sm:w-[min(100%,193px)] lg:w-[193px]"
                            />
                        </div>
                    </div>

                    <div className="mt-6 w-full max-w-[960px] overflow-hidden rounded-ds-table border border-ds-card-border bg-ds-bg-elevated shadow-ds-table sm:mt-8">
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
                                    {paginatedRestaurants.map((r, i) => (
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
                                                            src={resolveRestaurantImageUrl(r.url)}
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
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onManageRestaurantSelect?.({
                                                                id: r.id,
                                                                nom: r.nom,
                                                                direccio: r.direccio,
                                                                telefon: r.telefon,
                                                                horaris: r.horaris,
                                                                descripcio: r.descripcio,
                                                                url: resolveRestaurantImageUrl(r.url),
                                                            });
                                                            navigate(`/restaurants/${r.id}/manage`);
                                                        }}
                                                        className="p-1.5 text-ds-ui-muted transition-colors hover:text-ds-brand-copper"
                                                        title="Gestionar restaurant"
                                                        aria-label={`Gestionar restaurant ${r.nom}`}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteRestaurant(r)}
                                                        disabled={deletingRestaurantId === r.id}
                                                        className={`rounded-lg p-2 transition-colors ${deletingRestaurantId === r.id ? 'opacity-40 cursor-not-allowed' : 'hover:text-red-500 text-ds-ui-muted'}`}
                                                        title="Eliminar restaurante"
                                                        aria-label={`Eliminar restaurante ${r.nom}`}
                                                    >
                                                        {/* Acción destructiva: abrir confirmación antes de borrar. */}
                                                        <Trash2 className="size-4" />
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
                                {/* El contador refleja el conjunto ya filtrado/ordenado mostrado en tabla. */}
                                {filteredRestaurants.length
                                    ? `${visibleCount} de ${filteredRestaurants.length}`
                                    : '0'}{' '}
                                restaurants
                            </p>
                            {/* En móvil ocultamos la paginación para simplificar la UI. */}
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
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            totalPages === 0 ? prev : Math.min(totalPages, prev + 1)
                                        )
                                    }
                                    disabled={totalPages === 0 || safeCurrentPage === totalPages}
                                    className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
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
            <ConfirmDialog
                title="Eliminar restaurante"
                description={restaurantToDelete ? `¿Seguro que quieres eliminar ${restaurantToDelete.nom}?` : ''}
                isOpen={Boolean(restaurantToDelete)}
                isLoading={Boolean(restaurantToDelete && deletingRestaurantId === restaurantToDelete.id)}
                errorMessage={deleteRestaurantError}
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={confirmDeleteRestaurant}
                onCancel={() => {
                    if (deletingRestaurantId) return;
                    // Cierre limpio del modal y de cualquier estado auxiliar.
                    setRestaurantToDelete(null);
                    setDeleteRestaurantError('');
                    setShowDeactivateAction(false);
                }}
            >
                {showDeactivateAction ? (
                    <button
                        type="button"
                        onClick={handleDeactivateRestaurant}
                        disabled={Boolean(restaurantToDelete && deletingRestaurantId === restaurantToDelete.id)}
                        className="rounded-ds-sm border border-ds-brand-wine px-4 py-2 font-ds-sans text-xs font-semibold text-ds-brand-wine transition-colors hover:bg-ds-brand-wine hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Desactivar restaurante
                    </button>
                ) : null}
            </ConfirmDialog>
        </div>
    );
}
