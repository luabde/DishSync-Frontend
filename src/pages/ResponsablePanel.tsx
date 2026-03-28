import { useEffect, useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../hooks/auth.hook';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';

export default function ResponsablePanel() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sidebarNavItems = useMemo(() => getSidebarNavItems(user?.rol), [user?.rol]);

    useEffect(() => {
        if (!sidebarOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [sidebarOpen]);

    return (
        <div className="flex min-h-screen bg-ds-bg-page font-ds-sans antialiased">
            <StaffSidebar
                navItems={sidebarNavItems}
                userDisplayName={user?.nom ?? ''}
                userRoleLabel={getRoleDisplayLabel(user?.rol)}
                onLogout={() => void logout()}
                mobileOpen={sidebarOpen}
                onMobileClose={() => setSidebarOpen(false)}
            />

            <main className="min-w-0 flex-1 border-l border-black/5 p-4 sm:p-8 lg:p-10">
                <div className="mb-6 flex items-center gap-3 lg:hidden">
                    <button
                        type="button"
                        className="flex size-11 shrink-0 items-center justify-center rounded-ds-sm border border-ds-brand-wine/30 text-ds-brand-wine"
                        onClick={() => setSidebarOpen(true)}
                        aria-expanded={sidebarOpen}
                        aria-controls="staff-sidebar-mobile"
                        aria-label="Obrir menú"
                    >
                        <Menu className="size-6" />
                    </button>
                </div>
                <h1 className="font-ds-display text-2xl font-bold text-ds-brand-wine">
                    Panel responsable de sala
                </h1>
                <p className="mt-2 text-ds-fg-secondary">
                    Aquest és l’espai propi del responsable de sala (reserves, sala, etc.), separat del
                    panell d’administració.
                </p>
            </main>
        </div>
    );
}
