import { ToolbarSearchInput } from '../../filters/ToolbarSearchInput';
import { ToolbarSelect } from '../../filters/ToolbarSelect';

type SelectOption = {
  value: string;
  label: string;
};

type AvailabilityFiltersBarProps = {
  searchTerm: string;
  selectedCategory: string;
  categoryOptions: SelectOption[];
  selectedState: string;
  stateOptions: SelectOption[];
  onSearchTermChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStateChange: (value: string) => void;
};

export function AvailabilityFiltersBar({
  searchTerm,
  selectedCategory,
  categoryOptions,
  selectedState,
  stateOptions,
  onSearchTermChange,
  onCategoryChange,
  onStateChange,
}: AvailabilityFiltersBarProps) {
  return (
    <div className="mt-6 flex w-full max-w-[960px] flex-col gap-3 rounded-lg bg-ds-bg-elevated p-4 shadow-ds-toolbar sm:mt-8 sm:p-5 lg:flex-row lg:items-center lg:gap-4 lg:p-6">
      <div className="w-full lg:min-w-0 lg:flex-1">
        <ToolbarSearchInput
          value={searchTerm}
          onChange={onSearchTermChange}
          placeholder="Buscar per nom, categoria o ingredient..."
        />
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:shrink-0 lg:gap-3">
        <ToolbarSelect
          srLabel="Filtrar per categoria"
          value={selectedCategory}
          onChange={onCategoryChange}
          options={categoryOptions}
          className="w-full lg:w-[230px]"
        />
        <ToolbarSelect
          srLabel="Filtrar per disponibilitat"
          value={selectedState}
          onChange={onStateChange}
          options={stateOptions}
          className="w-full lg:w-[180px]"
        />
      </div>
    </div>
  );
}
