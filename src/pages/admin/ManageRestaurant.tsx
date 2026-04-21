import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import ManageRestaurantForm, { type ManageRestaurantData } from '../../components/admin/CreateRestaurant/ManageRestaurantForm';
import { Button } from '../../components/Button';

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
    const navigate = useNavigate();
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

            <div className="flex min-h-screen min-w-0 flex-1 flex-col border-l border-black/5">
                <header className="relative shrink-0 border-b-2 border-ds-brand-wine bg-ds-canvas">
                    {/* Header con botones de descarte/guardado*/}
                    <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:h-[105px] lg:flex-row lg:items-center lg:gap-0 lg:px-10 lg:py-0 lg:pl-[80px]">
                        <div className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 lg:h-full lg:min-h-0">
                            <Button
                                type="button"
                                variant="outline"
                                fullWidth={false}
                                className="size-11 shrink-0 rounded-ds-sm border border-ds-brand-wine/30! bg-transparent! p-0! text-ds-brand-wine! lg:hidden"
                                onClick={() => setSidebarOpen(true)}
                                aria-expanded={sidebarOpen}
                                aria-controls="staff-sidebar-mobile"
                                aria-label="Obrir menú"
                            >
                                <Menu className="size-6" />
                            </Button>
                            <h1 className="min-w-0 font-ds-display text-xl font-semibold leading-none tracking-wide text-ds-brand-wine sm:text-2xl lg:text-[28.8px] lg:tracking-[2px]">
                                Restaurants
                            </h1>
                        </div>
                        <div className="flex w-full gap-2 sm:gap-3 lg:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/')}
                                className="flex-1 rounded-ds-sm border-2 border-ds-brand-wine! bg-transparent! px-3 py-2.5 font-ds-sans! text-[11px]! font-bold! uppercase leading-none tracking-[1.5px] text-ds-brand-wine! sm:px-3.5 sm:py-3.5 sm:text-[12.8px]! lg:min-w-[122px]"
                            >
                                Descartar
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
                    {/* Título principal de la vista de gestión. */}
                    <h2 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
                        Gestio restaurant
                    </h2>
                    <p className="mt-3 max-w-[699px] px-1 text-center font-ds-ui text-sm font-normal text-ds-ui-muted sm:mt-4">
                        Detalles de contacto y ubicacion principal
                        <br />
                        de este establecimiento.
                    </p>

                    <div className="mt-6 w-full sm:mt-8 lg:mt-10">
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
                </div>
            </div>
        </div>
    );
}
