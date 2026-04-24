
type StatusBadgeProps = {
  /** L'estat a mostrar (ex: ACTIU, INACTIU, DISPONIBLE, etc.) */
  status: string;
  /** Classes addicionals per personalitzar el badge. */
  className?: string;
};

/**
 * Component unificat per a mostrar estats en format "pastilla" (pill badge).
 * Utilitza els colors de la marca Dish-Sync.
 */
export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();
  const isActive = normalizedStatus === 'ACTIU' || normalizedStatus === 'DISPONIBLE';
  
  return (
    <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 font-ds-sans text-[10px] font-bold uppercase tracking-[0.5px] text-white shadow-sm transition-all sm:text-[11px] ${
      isActive 
        ? 'bg-ds-brand-olive' 
        : 'bg-ds-wine-40'
    } ${className}`}>
      {status}
    </span>
  );
}
