import { ToolbarSearchInput } from '../filters/ToolbarSearchInput';
import { ToolbarSelect } from '../filters/ToolbarSelect';
import { ViewToggle } from '../common/ViewToggle';

type UserRoleFilter = 'TOTS' | 'ADMIN' | 'CAMBRER' | 'RESPONSABLE';
type UserStatusFilter = 'TOTS' | 'ACTIU' | 'INACTIU';

type UsersFiltersBarProps = {
  searchTerm: string;
  roleFilter: UserRoleFilter;
  statusFilter: UserStatusFilter;
  onSearchTermChange: (value: string) => void;
  onRoleFilterChange: (value: UserRoleFilter) => void;
  onStatusFilterChange: (value: UserStatusFilter) => void;
  view: 'TABLE' | 'GRID';
  onViewChange: (view: 'TABLE' | 'GRID') => void;
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
  view,
  onViewChange,
}: UsersFiltersBarProps) {
  return (
    <div className="mt-6 flex w-full max-w-[1000px] flex-col gap-3 rounded-lg bg-ds-bg-elevated p-4 shadow-ds-toolbar sm:mt-8 sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:flex-nowrap lg:p-6">
      <ToolbarSearchInput
        value={searchTerm}
        onChange={onSearchTermChange}
        placeholder="Buscar por nombre, email o cargo..."
      />
      <div className="flex w-full flex-row gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:flex-nowrap lg:shrink-0">
        {/* Filtro por rol/cargo de usuario. */}
        <ToolbarSelect
          srLabel="Filtrar por cargo"
          value={roleFilter}
          onChange={(value) => onRoleFilterChange(value as UserRoleFilter)}
          options={[
            { value: 'TOTS', label: 'Totes les Categories' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'CAMBRER', label: 'Cambrer' },
            { value: 'RESPONSABLE', label: 'Responsable de sala' },
          ]}
          className="w-1/2 sm:w-[min(100%,193px)] lg:w-[193px]"
        />
        {/* Filtro por estado general del usuario (activo/inactivo). */}
        <ToolbarSelect
          srLabel="Filtrar por estado"
          value={statusFilter}
          onChange={(value) => onStatusFilterChange(value as UserStatusFilter)}
          options={[
            { value: 'TOTS', label: 'Estat: Tots' },
            { value: 'ACTIU', label: 'Estat: Actiu' },
            { value: 'INACTIU', label: 'Estat: Inactiu' },
          ]}
          className="w-1/2 sm:w-[min(100%,193px)] lg:w-[193px]"
        />
      </div>
      <ViewToggle view={view} onViewChange={onViewChange} className="self-center sm:self-auto" />
    </div>
  );
}

export type { UserRoleFilter, UserStatusFilter };
