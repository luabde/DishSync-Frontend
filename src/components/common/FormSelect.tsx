import React from 'react';

type FormSelectProps = {
  label: string;
  error?: string;
  className?: string;
  selectClassName?: string;
  labelClassName?: string;
  options: { value: string | number; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

const baseLabelClassName = 'text-xs font-bold uppercase tracking-wider text-brand-primary ml-1';
const baseSelectClassName =
  'w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 transition-all outline-none appearance-none';

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  className = 'space-y-2',
  selectClassName = '',
  labelClassName = '',
  options,
  ...props
}) => {
  return (
    <div className={className}>
      <label className={`${baseLabelClassName} ${labelClassName}`}>{label}</label>
      <div className="relative">
        <select
          {...props}
          className={`${baseSelectClassName} ${selectClassName}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom arrow for appearance-none select */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-primary/40">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error ? <p className="text-xs text-red-500 ml-1">{error}</p> : null}
    </div>
  );
};

export default FormSelect;
