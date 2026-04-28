import { ToolbarSearchInput } from '../../filters/ToolbarSearchInput';
import { ToolbarSelect } from '../../filters/ToolbarSelect';
import { ViewToggle } from '../../common/ViewToggle';

type DishesFiltersBarProps = {
  searchTerm: string;
  categoryFilter: string;
  categoryOptions: Array<{ value: string; label: string }>;
  onSearchTermChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  view: 'TABLE' | 'GRID';
  onViewChange: (view: 'TABLE' | 'GRID') => void;
  className?: string;
};

export function DishesFiltersBar({
  searchTerm,
  categoryFilter,
  categoryOptions,
  onSearchTermChange,
  onCategoryFilterChange,
  view,
  onViewChange,
  className = '',
}: DishesFiltersBarProps) {
  return (
    <div className={`mt-6 flex w-full max-w-[1000px] flex-col gap-3 rounded-lg bg-ds-bg-elevated p-4 shadow-ds-toolbar sm:mt-8 sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:flex-nowrap lg:p-6 ${className}`}>
      <ToolbarSearchInput
        value={searchTerm}
        onChange={onSearchTermChange}
        placeholder="Buscar per nom, categoria o ingredient..."
      />
      <div className="flex w-full flex-row gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:flex-nowrap lg:shrink-0">
        <ToolbarSelect
          srLabel="Filtrar per categoria"
          value={categoryFilter}
          onChange={onCategoryFilterChange}
          options={categoryOptions}
          className="w-full sm:w-[min(100%,193px)] lg:w-[193px]"
        />
      </div>
      <ViewToggle view={view} onViewChange={onViewChange} className="self-center sm:self-auto" />
    </div>
  );
}
