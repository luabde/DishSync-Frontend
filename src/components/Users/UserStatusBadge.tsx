type UserStatus = 'ACTIU' | 'INACTIU';

export function UserStatusBadge({ status }: { status: UserStatus }) {
  // El estado se pinta con color + texto para lectura rápida en tabla.
  const isActive = status === 'ACTIU';
  return (
    <div className="flex items-center gap-2">
      <span className={`size-1.5 rounded-full ${isActive ? 'bg-ds-brand-olive' : 'bg-ds-status-inactive-dot'}`} />
      <span className={`font-ds-ui text-xs ${isActive ? 'text-ds-brand-olive' : 'text-ds-status-inactive-text'}`}>
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  );
}
