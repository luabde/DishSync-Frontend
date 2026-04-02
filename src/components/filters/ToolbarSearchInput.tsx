import { Search } from 'lucide-react';

type ToolbarSearchInputProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

// Input global para barras de filtros con el estilo unificado del dashboard.
export function ToolbarSearchInput({ value, placeholder, onChange }: ToolbarSearchInputProps) {
  return (
    <div className="relative w-full min-w-0 sm:flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-brand-gray/40" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#F5F5F5] border-none rounded-xl py-3 pl-10 pr-4 font-ds-ui text-sm text-brand-gray placeholder:text-brand-gray/40 focus:ring-2 focus:ring-brand-accent2/20 transition-all outline-none"
      />
    </div>
  );
}
