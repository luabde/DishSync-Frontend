import { ToolbarSearchInput } from '../filters/ToolbarSearchInput';
import { ToolbarSelect } from '../filters/ToolbarSelect';

type DishesFiltersBarProps = {
  searchTerm: string;
  categoryFilter: string;
  statusFilter: string;
  categoryOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  onSearchTermChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
};

export function DishesFiltersBar({
  searchTerm,
  categoryFilter,
  statusFilter,
  categoryOptions,
  statusOptions,
  onSearchTermChange,
  onCategoryFilterChange,
  onStatusFilterChange,
}: DishesFiltersBarProps) {
  return (
    // Barra desacoplada para poder reutilizarla en otras vistas de carta.
    <div className="mt-4 flex w-full max-w-[960px] flex-col gap-3 rounded-lg bg-ds-bg-elevated p-4 shadow-ds-toolbar sm:mt-5 sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:flex-nowrap lg:p-6">
      <ToolbarSearchInput
        value={searchTerm}
        onChange={onSearchTermChange}
        placeholder="Buscar per nom, categoria o ingredient..."
      />
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:w-auto lg:flex-nowrap lg:shrink-0">
        <ToolbarSelect
          srLabel="Filtrar per categoria"
          value={categoryFilter}
          onChange={onCategoryFilterChange}
          options={categoryOptions}
          className="sm:w-[min(100%,193px)] lg:w-[193px]"
        />
        <ToolbarSelect
          srLabel="Filtrar per estat"
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={statusOptions}
          className="sm:w-[min(100%,180px)] lg:w-[180px]"
        />
      </div>
    </div>
  );
}
