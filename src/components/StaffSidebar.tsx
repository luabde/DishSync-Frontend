import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { X, Bell, MailOpen, Mail, Loader2, Check, Reply } from 'lucide-react';
import type { StaffSidebarNavItem } from '../navigation/staffSidebarNav';
import { notificationsApi, type ContactNotificationDTO } from '../api/notifications.api';

export type { StaffSidebarNavItem } from '../navigation/staffSidebarNav';

const navItemClass = () =>
    `rounded-ds-sm px-4 py-2.5 text-left sm:px-5 sm:py-3 w-full block border-0 bg-transparent cursor-pointer font-inherit`;

const navLabelClass = (isActive: boolean) =>
    `text-xs font-semibold tracking-[1px] uppercase sm:text-[13px] ${isActive ? 'text-ds-brand-gold' : 'text-ds-nav-muted'
    }`;

// Props del panel interno del sidebar (contenido y acciones visibles).
type StaffSidebarPanelProps = {
    // Titulo de marca que aparece en la cabecera del sidebar.
    brandTitle: string;
    // Items de navegacion que se renderizan en el menu lateral.
    navItems: StaffSidebarNavItem[];
    // Letra mostrada dentro del avatar circular del usuario.
    avatarLetter: string;
    // Nombre visible del usuario autenticado.
    userDisplayName: string;
    // Texto del rol del usuario (p. ej. "Administrador").
    userRoleLabel: string;
    // Callback obligatorio para cerrar sesion.
    onLogout: () => void;
    // Callback opcional al navegar (en movil se usa para cerrar el panel).
    onNavigate?: () => void;
    // Controla si se muestra el boton "X" para cerrar en cabeceras moviles.
    showCloseButton?: boolean;
    // Callback opcional del boton de cierre.
    onClose?: () => void;
    // Permiso para mostrar/usar notificaciones en el panel.
    canManageNotifications: boolean;
};

type NotificationUIState = {
    // Mensaje seleccionado en la columna izquierda para ver su detalle.
    selectedId: number | null;
    // ID del mensaje que se está marcando como leído para bloquear solo ese botón.
    isUpdatingId: number | null;
    // Error de red o backend para mostrar feedback al usuario.
    error: string | null;
    // Mensajes de contacto que llegan desde backend.
    items: ContactNotificationDTO[];
};

// Contenido interno del sidebar de staff.
function StaffSidebarPanel({
    brandTitle,
    navItems,
    avatarLetter,
    userDisplayName,
    userRoleLabel,
    onLogout,
    onNavigate,
    showCloseButton,
    onClose,
    canManageNotifications,
}: StaffSidebarPanelProps) {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    // Ref al botón campana para calcular posición del popup flotante.
    const bellButtonRef = useRef<HTMLButtonElement>(null);
    // Posición del popup calculada en tiempo de apertura.
    const [popupStyle, setPopupStyle] = useState<{ width: number; left: number; bottom: number } | null>(null);
    // Estado único del widget de notificaciones (listado + selección + errores).
    const [notificationsState, setNotificationsState] = useState<NotificationUIState>({
        selectedId: null,
        isUpdatingId: null,
        error: null,
        items: [],
    });

    const handleLogout = () => {
        void onLogout();
        onNavigate?.();
    };

    // Separamos mensajes por estado para pintar "No leídos" y "Leídos".
    const unreadNotifications = notificationsState.items.filter((item) => item.estat !== 'Llegit');
    const readNotifications = notificationsState.items.filter((item) => item.estat === 'Llegit');
    const selectedNotification =
        notificationsState.items.find((item) => item.id === notificationsState.selectedId) ?? null;
    const unreadCount = unreadNotifications.length;

    // Carga mensajes desde backend para refrescar contador y listado.
    const fetchNotifications = async () => {
        if (!canManageNotifications) return;
        setNotificationsState((prev) => ({ ...prev, error: null }));

        try {
            const items = await notificationsApi.getContactNotifications();
            setNotificationsState((prev) => {
                const selectedStillExists = items.some((item) => item.id === prev.selectedId);
                return {
                    ...prev,
                    items,
                    selectedId: selectedStillExists ? prev.selectedId : items[0]?.id ?? null,
                };
            });
        } catch (error) {
            setNotificationsState((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error inesperado',
            }));
        }
    };

    // Al recargar página, pedimos mensajes para que el badge de no leídas salga desde el inicio.
    useEffect(() => {
        if (!canManageNotifications) return;
        void fetchNotifications();
    }, [canManageNotifications]);

    useEffect(() => {
        if (!isNotificationsOpen) return;
        void fetchNotifications();
    }, [isNotificationsOpen]);

    const markAsRead = async (contactId: number) => {
        setNotificationsState((prev) => ({ ...prev, isUpdatingId: contactId, error: null }));
        try {
            await notificationsApi.markContactAsRead(contactId);
            setNotificationsState((prev) => ({
                ...prev,
                isUpdatingId: null,
                items: prev.items.map((item) =>
                    item.id === contactId ? { ...item, estat: 'Llegit' } : item,
                ),
            }));
        } catch (error) {
            setNotificationsState((prev) => ({
                ...prev,
                isUpdatingId: null,
                error: error instanceof Error ? error.message : 'Error al actualizar el mensaje',
            }));
        }
    };

    // Abre la plataforma de correo con destinatario y borrador de respuesta.
    const handleReply = (email: string) => {
        const subject = encodeURIComponent('Respuesta a tu mensaje de contacto - DishSync');
        const body = encodeURIComponent('Hola,\n\nGracias por contactarnos.\n\n');
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    };

    // Calcula posición del popup desde el bounding rect del botón campana y lo abre.
    const handleBellClick = useCallback(() => {
        if (!isNotificationsOpen && bellButtonRef.current) {
            const rect = bellButtonRef.current.getBoundingClientRect();
            const isLg = window.innerWidth >= 1024;
            const popupWidth = isLg ? 560 : Math.min(480, window.innerWidth - 32);
            const rawLeft = rect.right - popupWidth;
            const left = Math.max(16, rawLeft);
            const bottom = window.innerHeight - rect.top + 12;
            setPopupStyle({ width: popupWidth, left, bottom });
        }
        setIsNotificationsOpen((prev) => !prev);
    }, [isNotificationsOpen]);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="relative shrink-0 pb-6 sm:pb-8 lg:pb-12">
                <div className="flex items-center justify-center lg:block lg:text-center">
                    <h2 className="font-ds-display text-xl font-bold text-ds-canvas sm:text-2xl lg:text-[1.5rem] lg:leading-none">
                        {brandTitle}
                    </h2>
                </div>
                {showCloseButton && onClose ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-0 top-0 rounded-ds-sm p-2 text-ds-canvas transition-colors hover:bg-white/10 lg:hidden"
                        aria-label="Tancar menú"
                    >
                        <X className="size-6" strokeWidth={2} />
                    </button>
                ) : null}
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 sm:py-2">
                <div className="flex flex-col gap-3 sm:gap-[15px] lg:pt-2">
                    {navItems.map((item) =>
                        item.to ? (
                            <NavLink
                                key={item.id}
                                to={item.to}
                                end={item.matchEnd ?? true}
                                onClick={() => onNavigate?.()}
                                className={() => navItemClass()}
                            >
                                {({ isActive }) => (
                                    <span className={navLabelClass(isActive)}>{item.label}</span>
                                )}
                            </NavLink>
                        ) : (
                            <button
                                key={item.id}
                                type="button"
                                className={navItemClass()}
                                onClick={() => onNavigate?.()}
                            >
                                <span className={navLabelClass(false)}>{item.label}</span>
                            </button>
                        ),
                    )}
                </div>
            </nav>

            <div className="shrink-0 border-t border-white/10 pt-5 sm:pt-6">
                <div className="flex flex-col gap-4 sm:gap-5">
                    <div className="relative flex items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ds-avatar-bg font-ds-avatar text-sm font-bold text-ds-avatar-fg sm:size-[35px] sm:text-base">
                                {avatarLetter}
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-semibold text-white">
                                    {userDisplayName || 'Usuari'}
                                </span>
                                <span className="truncate text-[10px] uppercase tracking-wide text-ds-nav-subtle">
                                    {userRoleLabel}
                                </span>
                            </div>
                        </div>
                        {canManageNotifications ? (
                            <button
                                ref={bellButtonRef}
                                type="button"
                                onClick={handleBellClick}
                                className="relative p-2 -mr-2 text-ds-nav-muted hover:text-white transition-colors"
                                aria-label="Notificaciones"
                            >
                                <Bell className="size-5" />
                                {unreadCount > 0 ? (
                                    <span className="absolute right-0 top-0 inline-flex min-w-4 -translate-y-0.5 translate-x-0.5 items-center justify-center rounded-full bg-ds-brand-gold px-1 text-[10px] font-bold text-ds-brand-wine">
                                        {unreadCount}
                                    </span>
                                ) : null}
                            </button>
                        ) : null}

                        {isNotificationsOpen && popupStyle && createPortal(
                            <div
                                style={{ width: popupStyle.width, left: popupStyle.left, bottom: popupStyle.bottom }}
                                className="fixed z-[9999] origin-bottom-right rounded-ds-md bg-white drop-shadow-xl"
                            >
                                <div className="relative z-10 flex flex-col rounded-ds-md bg-white overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                                        <h3 className="font-ds-sans text-xs font-bold tracking-wide text-ds-ink uppercase">
                                            Notificaciones
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setIsNotificationsOpen(false)}
                                            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                        >
                                            <X className="size-4" strokeWidth={2} />
                                        </button>
                                    </div>
                                    <div
                                        className="grid"
                                        style={{
                                            gridTemplateColumns: popupStyle.width >= 480 ? '200px minmax(0,1fr)' : '1fr',
                                            minHeight: 320,
                                            maxHeight: 480,
                                        }}
                                    >
                                        <div
                                            className="bg-ds-canvas p-3 overflow-y-auto"
                                            style={{
                                                borderBottom: popupStyle.width < 480 ? '1px solid rgba(0,0,0,0.05)' : undefined,
                                                borderRight: popupStyle.width >= 480 ? '1px solid rgba(0,0,0,0.05)' : undefined,
                                                maxHeight: popupStyle.width < 480 ? '160px' : undefined,
                                            }}
                                        >
                                            <div className="mb-3">
                                                <p className="text-[10px] font-bold uppercase tracking-[1px] text-ds-brand-wine">
                                                    No leidos ({unreadNotifications.length})
                                                </p>
                                                <div className="mt-2 flex flex-col gap-1.5">
                                                    {unreadNotifications.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            className={`w-full rounded-ds-sm border px-2.5 py-2 text-left transition-colors ${notificationsState.selectedId === item.id
                                                                ? 'border-ds-brand-gold bg-white'
                                                                : 'border-transparent bg-white/75 hover:border-ds-brand-wine/20'
                                                                }`}
                                                            onClick={() => setNotificationsState((prev) => ({ ...prev, selectedId: item.id }))}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <Mail className="mt-0.5 size-3.5 shrink-0 text-ds-brand-copper" />
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-[11px] font-semibold text-ds-brand-wine">{item.email}</p>
                                                                    <p className="truncate text-[11px] text-ds-ui-muted">{item.missatge}</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[1px] text-ds-ui-muted">
                                                    Leidos ({readNotifications.length})
                                                </p>
                                                <div className="mt-2 flex flex-col gap-1.5">
                                                    {readNotifications.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            className={`w-full rounded-ds-sm border px-2.5 py-2 text-left transition-colors ${notificationsState.selectedId === item.id
                                                                ? 'border-ds-brand-gold bg-white'
                                                                : 'border-transparent bg-white/75 hover:border-ds-brand-wine/20'
                                                                }`}
                                                            onClick={() => setNotificationsState((prev) => ({ ...prev, selectedId: item.id }))}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <MailOpen className="mt-0.5 size-3.5 shrink-0 text-ds-ui-muted" />
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-[11px] font-medium text-ds-ui-muted">{item.email}</p>
                                                                    <p className="truncate text-[11px] text-ds-ui-muted">{item.missatge}</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col p-5">
                                            {notificationsState.error ? (
                                                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                                                    <p className="text-xs text-red-500">{notificationsState.error}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => void fetchNotifications()}
                                                        className="rounded-ds-sm border border-ds-brand-wine/20 px-3 py-1.5 text-[11px] font-semibold text-ds-brand-wine"
                                                    >
                                                        Reintentar
                                                    </button>
                                                </div>
                                            ) : selectedNotification ? (
                                                <>
                                                    <p className="text-[11px] font-semibold text-ds-brand-wine">{selectedNotification.email}</p>
                                                    <p className="mt-1 text-[10px] uppercase tracking-[0.8px] text-ds-ui-muted">
                                                        {new Date(selectedNotification.createdAt).toLocaleString('es-ES')}
                                                    </p>
                                                    <p className="mt-3 text-[13px] leading-relaxed text-ds-ink">
                                                        {selectedNotification.missatge}
                                                    </p>
                                                    <div className="mt-auto grid grid-cols-1 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReply(selectedNotification.email)}
                                                            className="inline-flex items-center justify-center gap-1.5 rounded-ds-sm border border-ds-brand-copper/40 bg-ds-brand-copper/10 px-3 py-2 text-[11px] font-bold tracking-[0.8px] text-ds-brand-copper uppercase"
                                                        >
                                                            <Reply className="size-3.5" />
                                                            Responder por correo
                                                        </button>
                                                        {selectedNotification.estat !== 'Llegit' ? (
                                                            <button
                                                                type="button"
                                                                disabled={notificationsState.isUpdatingId === selectedNotification.id}
                                                                onClick={() => void markAsRead(selectedNotification.id)}
                                                                className="inline-flex items-center justify-center gap-1.5 rounded-ds-sm bg-ds-brand-wine px-3 py-2 text-[11px] font-bold tracking-[0.8px] text-white uppercase disabled:opacity-60"
                                                            >
                                                                {notificationsState.isUpdatingId === selectedNotification.id ? (
                                                                    <Loader2 className="size-3.5 animate-spin" />
                                                                ) : (
                                                                    <Check className="size-3.5" />
                                                                )}
                                                                Marcar como leído
                                                            </button>
                                                        ) : (
                                                            <div className="inline-flex items-center justify-center gap-1.5 rounded-ds-sm border border-ds-brand-olive/30 bg-ds-brand-olive/10 px-3 py-2 text-[11px] font-semibold text-ds-brand-olive">
                                                                <Check className="size-3.5" />
                                                                Mensaje leído
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-center">
                                                    <p className="text-xs text-ds-ui-muted">No hay mensajes disponibles</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-ds-sm border-2 border-ds-canvas py-2.5 font-ds-sans text-xs font-bold text-white hover:bg-white hover:text-ds-brand-wine transition-colors"
                    >
                        CERRAR SESIÓN
                    </button>
                </div>
            </div>
        </div>
    );
}

export type StaffSidebarProps = {
    brandTitle?: string;
    /** Vincles del menú; el resaltat es calcula amb la ruta actual (`useLocation`). */
    navItems: StaffSidebarNavItem[];
    /** Nom visible (p. ex. `user.nom` des de context / localStorage). */
    userDisplayName: string;
    /** Subtítol del rol (p. ex. `getRoleDisplayLabel(user.rol)`). */
    userRoleLabel: string;
    /** Per defecte, primera lletra de `userDisplayName`. */
    avatarLetter?: string;
    onLogout: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
};

// Componente principal del sidebar de staff.
// Contiene el panel interno y el panel móvil.
export function StaffSidebar({
    brandTitle = 'EL CASTELL',
    navItems,
    userDisplayName,
    userRoleLabel,
    avatarLetter: avatarLetterProp,
    onLogout,
    mobileOpen,
    onMobileClose,
}: StaffSidebarProps) {
    const avatarLetter =
        avatarLetterProp ??
        (userDisplayName.trim().charAt(0) || 'U').toUpperCase();

    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onMobileClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mobileOpen, onMobileClose]);

    const panelProps = {
        brandTitle,
        navItems,
        avatarLetter,
        userDisplayName,
        userRoleLabel,
        onLogout,
        canManageNotifications: navItems.some((item) => item.id === 'usuarios'),
    };

    return (
        <>
            <aside className="relative z-30 hidden w-[260px] shrink-0 bg-ds-sidebar-bg px-4 py-8 sm:w-[280px] sm:px-5 sm:py-10 lg:flex lg:h-screen lg:w-[300px] lg:flex-col lg:sticky lg:top-0 lg:self-start">
                <StaffSidebarPanel {...panelProps} />
            </aside>

            <div
                className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
                aria-hidden={!mobileOpen}
            >
                <button
                    type="button"
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${mobileOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={onMobileClose}
                    aria-label="Tancar menú"
                />
                <aside
                    id="staff-sidebar-mobile"
                    className={`absolute inset-y-0 left-0 flex h-full w-full sm:w-[300px] sm:max-w-[300px] flex-col bg-ds-sidebar-bg px-4 py-6 shadow-xl transition-transform duration-200 ease-out sm:px-5 sm:py-8 overflow-visible ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navegació"
                >
                    <StaffSidebarPanel
                        {...panelProps}
                        onNavigate={onMobileClose}
                        showCloseButton
                        onClose={onMobileClose}
                    />
                </aside>
            </div>
        </>
    );
}
