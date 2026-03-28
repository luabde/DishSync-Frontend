/** Ruta “inicial” segons el rol (post-login i quan un usuari entra en una àrea que no li correspon). */
export function getDefaultRouteForRole(rol: string | undefined): string {
    switch (rol) {
        case 'ADMIN':
            return '/';
        case 'CAMBRER':
            return '/camarero';
        case 'RESPONSABLE':
            return '/responsable';
        default:
            return '/login';
    }
}
