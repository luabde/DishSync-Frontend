import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import ManageRestaurantForm, { type ManageRestaurantData } from '../../components/common/CreateRestaurant/ManageRestaurantForm';

const EMPTY_RESTAURANT: ManageRestaurantData = {
    id: 0,
    nom: '',
    direccio: '',
    telefon: '',
    descripcio: '',
    url: null,
};

type ManageRestaurantProps = {
    restaurant: ManageRestaurantData | null;
};

export default function ManageRestaurant({ restaurant: selectedRestaurant }: ManageRestaurantProps) {
    const { user, logout } = useAuth();
    // Controla apertura/cierre del sidebar móvil.
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarNavItems = getSidebarNavItems(user?.rol);
    const restaurant = selectedRestaurant ?? EMPTY_RESTAURANT;

    useEffect(() => {
        // Cuando el menú móvil está abierto, bloqueamos scroll del body.
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

            <div className="flex min-h-screen min-w-0 flex-1 flex-col border-l border-black/5 pb-12 transition-all duration-500">
                <header className="max-w-4xl mx-auto pt-8 px-6 text-center w-full">
                    <div className="flex items-center justify-start mb-6 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="flex size-11 items-center justify-center rounded-ds-sm border border-ds-brand-wine/30 text-ds-brand-wine"
                        >
                            <Menu className="size-6" />
                        </button>
                    </div>
                    <nav className="flex items-center justify-center gap-2 text-xs font-medium text-brand-gray/40 mb-12 uppercase tracking-widest">
                        <Link to="/restaurants" className="hover:text-brand-primary transition-colors">Restaurants</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-brand-primary/60">Restaurant</span>
                    </nav>
                    <h1 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
                        Gestió restaurant
                    </h1>
                    <p className="mx-auto mt-3 mb-12 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
                        Detalls de contacte i ubicació principal d'aquest establiment.
                    </p>
                </header>

                <main className="max-w-4xl mx-auto px-6 transition-all duration-700 w-full">
                    <div className="bg-ds-bg-elevated rounded-ds-table shadow-2xl shadow-brand-primary/10 p-10 md:p-14 transition-all duration-700">
                        {/* Formulario desacoplado: recibe todo por props. */}
                        <ManageRestaurantForm restaurant={restaurant} />
                    </div>

                    <footer className="mt-10 w-full max-w-3xl border-t border-ds-footer-rule pt-6 text-center font-ds-ui text-xs text-ds-ui-muted sm:mt-16 sm:pt-8 sm:text-sm">
                        <p>
                            Necessites ajuda per configurar el teu establiment?{' '}
                            <a
                                href="#"
                                className="font-semibold text-ds-brand-gold hover:underline"
                            >
                                Contacta amb suport tecnic
                            </a>
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
}
