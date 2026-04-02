import { ChevronDown, Search } from 'lucide-react';

type UserRoleFilter = 'TOTS' | 'ADMIN' | 'CAMBRER' | 'RESPONSABLE';
type UserStatusFilter = 'TOTS' | 'ACTIU' | 'INACTIU';

type UsersFiltersBarProps = {
  searchTerm: string;
  roleFilter: UserRoleFilter;
  statusFilter: UserStatusFilter;
  onSearchTermChange: (value: string) => void;
  onRoleFilterChange: (value: UserRoleFilter) => void;
  onStatusFilterChange: (value: UserStatusFilter) => void;
};

// Barra de filtros "presentacional": recibe estado/handlers desde la página.
// Así se puede reutilizar sin acoplarla a ninguna fuente de datos concreta.
export function UsersFiltersBar({
  searchTerm,
  roleFilter,
  statusFilter,
  onSearchTermChange,
  onRoleFilterChange,
  onStatusFilterChange,
}: UsersFiltersBarProps) {
  return (
    <div className="mt-4 flex w-full max-w-[960px] flex-col gap-3 rounded-lg bg-ds-bg-elevated p-4 shadow-ds-toolbar sm:mt-5 sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:flex-nowrap lg:p-6">
      <div className="relative w-full min-w-0 sm:flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-ds-ui-muted" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Buscar por nombre, email o cargo..."
          className="w-full rounded-lg border border-ds-input-border bg-ds-surface-muted py-2.5 pl-10 pr-4 font-ds-ui text-sm text-ds-fg-default placeholder:text-ds-ui-muted"
        />
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:w-auto lg:flex-nowrap lg:shrink-0">
        {/* Filtro por rol/cargo de usuario. */}
        <label className="relative block h-[46px] w-full sm:w-[min(100%,193px)] lg:w-[193px]">
          <span className="sr-only">Filtrar por cargo</span>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value as UserRoleFilter)}
            className="h-full w-full appearance-none rounded-lg border border-ds-input-border bg-ds-surface-muted px-4 pr-10 font-ds-sans text-sm text-black"
          >
            <option value="TOTS">Totes les Categories</option>
            <option value="ADMIN">Admin</option>
            <option value="CAMBRER">Cambrer</option>
            <option value="RESPONSABLE">Responsable de sala</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-[21px] -translate-y-1/2 opacity-60" />
        </label>
        {/* Filtro por estado general del usuario (activo/inactivo). */}
        <label className="relative block h-[46px] w-full sm:w-[min(100%,180px)] lg:w-[180px]">
          <span className="sr-only">Filtrar por estado</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as UserStatusFilter)}
            className="h-full w-full appearance-none rounded-lg border border-ds-input-border bg-ds-surface-muted px-4 pr-10 font-ds-sans text-sm text-black"
          >
            <option value="TOTS">Estat: Tots</option>
            <option value="ACTIU">Estat: Actiu</option>
            <option value="INACTIU">Estat: Inactiu</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-[21px] -translate-y-1/2 opacity-60" />
        </label>
      </div>
    </div>
  );
}

export type { UserRoleFilter, UserStatusFilter };
