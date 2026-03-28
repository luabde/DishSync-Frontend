import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import type { StaffSidebarNavItem } from '../navigation/staffSidebarNav';

export type { StaffSidebarNavItem } from '../navigation/staffSidebarNav';

const navItemClass = (isActive: boolean) =>
    `rounded-ds-sm px-4 py-2.5 text-left sm:px-5 sm:py-3 w-full block border-0 bg-transparent cursor-pointer font-inherit`;

const navLabelClass = (isActive: boolean) =>
    `text-xs font-semibold tracking-[1px] uppercase sm:text-[13px] ${
        isActive ? 'text-ds-brand-gold' : 'text-ds-nav-muted'
    }`;

type StaffSidebarPanelProps = {
    brandTitle: string;
    navItems: StaffSidebarNavItem[];
    avatarLetter: string;
    userDisplayName: string;
    userRoleLabel: string;
    onLogout: () => void;
    onNavigate?: () => void;
    showCloseButton?: boolean;
    onClose?: () => void;
};

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
}: StaffSidebarPanelProps) {
    const handleLogout = () => {
        void onLogout();
        onNavigate?.();
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div
                className={`flex shrink-0 items-center pb-6 sm:pb-8 lg:block lg:pb-12 lg:text-center ${
                    showCloseButton ? 'justify-between gap-2' : 'justify-center'
                }`}
            >
                <h2 className="font-ds-display text-xl font-bold text-ds-canvas sm:text-2xl lg:text-[1.5rem] lg:leading-none">
                    {brandTitle}
                </h2>
                {showCloseButton && onClose ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-ds-sm p-2 text-ds-canvas transition-colors hover:bg-white/10 lg:hidden"
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
                                className={({ isActive }) => navItemClass(isActive)}
                            >
                                {({ isActive }) => (
                                    <span className={navLabelClass(isActive)}>{item.label}</span>
                                )}
                            </NavLink>
                        ) : (
                            <button
                                key={item.id}
                                type="button"
                                className={navItemClass(false)}
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
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full max-w-[194px] rounded-ds-sm border-2 border-ds-canvas py-2.5 font-ds-sans text-xs font-bold text-white"
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
    };

    return (
        <>
            <aside className="relative hidden w-[260px] shrink-0 bg-ds-sidebar-bg px-4 py-8 sm:w-[280px] sm:px-5 sm:py-10 lg:flex lg:h-screen lg:w-[300px] lg:flex-col lg:sticky lg:top-0 lg:self-start">
                <StaffSidebarPanel {...panelProps} />
            </aside>

            <div
                className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
                aria-hidden={!mobileOpen}
            >
                <button
                    type="button"
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
                        mobileOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={onMobileClose}
                    aria-label="Tancar menú"
                />
                <aside
                    id="staff-sidebar-mobile"
                    className={`absolute inset-y-0 left-0 flex h-full w-[min(100vw-2.5rem,300px)] max-w-[300px] flex-col bg-ds-sidebar-bg px-4 py-6 shadow-xl transition-transform duration-200 ease-out sm:px-5 sm:py-8 ${
                        mobileOpen ? 'translate-x-0' : '-translate-x-full'
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
