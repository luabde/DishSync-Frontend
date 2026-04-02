import { ChevronDown } from 'lucide-react';

type ToolbarSelectOption = {
  value: string;
  label: string;
};

type ToolbarSelectProps = {
  srLabel: string;
  value: string;
  options: ToolbarSelectOption[];
  className?: string;
  onChange: (value: string) => void;
};

// Select global para filtros: mismo look&feel en dashboard y gestión de usuarios.
export function ToolbarSelect({ srLabel, value, options, className = '', onChange }: ToolbarSelectProps) {
  return (
    <label className={`relative block h-[46px] w-full ${className}`}>
      <span className="sr-only">{srLabel}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full appearance-none bg-[#F5F5F5] border-none rounded-xl px-4 pr-10 font-ds-sans text-sm text-brand-gray focus:ring-2 focus:ring-brand-accent2/20 transition-all outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-[21px] -translate-y-1/2 text-brand-gray/40" />
    </label>
  );
}
