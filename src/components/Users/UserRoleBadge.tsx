type UserRole = 'ADMIN' | 'CAMBRER' | 'RESPONSABLE';

// Mapa centralizado: evita condicionales repetidos y mantiene consistente
// el estilo del badge según el rol en toda la app.
const roleConfig: Record<UserRole, { label: string; className: string }> = {
  ADMIN: {
    label: 'Admin',
    className: 'bg-ds-btn-gestionar-bg/40 text-ds-brand-copper',
  },
  CAMBRER: {
    label: 'Cambrer',
    className: 'bg-ds-brand-olive/20 text-ds-brand-olive',
  },
  RESPONSABLE: {
    label: 'Responsable de sala',
    className: 'bg-ds-brand-copper/25 text-ds-brand-copper',
  },
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  // Resuelve texto y colores a partir del rol recibido.
  const config = roleConfig[role];
  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-1 font-ds-sans text-[10px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
