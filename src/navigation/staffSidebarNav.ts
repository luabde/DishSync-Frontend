export type StaffSidebarNavItem = {
    id: string;
    label: string;
    to?: string;
    matchEnd?: boolean;
};

const ADMIN_NAV: StaffSidebarNavItem[] = [
    { id: 'general', label: 'GENERAL', to: '/dashboard', matchEnd: true },
    { id: 'usuarios', label: 'GESTIONAR USUARIS', to: '/users', matchEnd: false },
    { id: 'carta', label: 'GESTIONAR CARTA', to: '/plats', matchEnd: false },
    { id: 'restaurants', label: 'GESTIONAR RESTAURANTS', to: '/restaurants', matchEnd: false },
];

const CAMBRER_NAV: StaffSidebarNavItem[] = [
    { id: 'sala', label: 'MAPA DE SALA', to: '/camarero', matchEnd: true },
    { id: 'reservas', label: 'RESERVAS' },
    { id: 'comandes', label: 'COMANDES' },
];

const RESPONSABLE_NAV: StaffSidebarNavItem[] = [
    { id: 'reservas', label: 'RESERVAS', to: '/responsable', matchEnd: true },
    { id: 'sala', label: 'MAPA DE SALA' },
    { id: 'estadisticas', label: 'ESTADISTICAS' },
    { id: 'ajustes', label: 'AJUSTES' },
];

/** Text per mostrar sota el nom (mateix ordre que enum RolUsuari al backend). */
export function getRoleDisplayLabel(rol: string | undefined): string {
    if (!rol) return 'Personal';
    const map: Record<string, string> = {
        ADMIN: 'Administrador',
        CAMBRER: 'Cambrer',
        RESPONSABLE: 'Responsable de sala',
    };
    return map[rol] ?? rol;
}

/** Menú del sidebar segons el rol de l’usuari (sincronitzat amb localStorage / auth). */
export function getSidebarNavItems(rol: string | undefined): StaffSidebarNavItem[] {
    switch (rol) {
        case 'ADMIN':
            return ADMIN_NAV;
        case 'CAMBRER':
            return CAMBRER_NAV;
        case 'RESPONSABLE':
            return RESPONSABLE_NAV;
        default:
            return [];
    }
}
