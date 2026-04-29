import React from 'react';

type FormFieldBaseProps = {
  label: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  variant?: 'default' | 'yellow';
};

type FormFieldInputProps = FormFieldBaseProps & {
  as?: 'input';
} & React.InputHTMLAttributes<HTMLInputElement>;

type FormFieldTextareaProps = FormFieldBaseProps & {
  as: 'textarea';
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type FormFieldProps = FormFieldInputProps | FormFieldTextareaProps;

const baseLabelClassName = 'text-xs font-bold uppercase tracking-wider text-brand-primary ml-1';
const getBaseInputClassName = (variant: 'default' | 'yellow' = 'default') => {
  const bgClass = variant === 'yellow' ? 'bg-[#FFF9E5]' : 'bg-[#F5F5F5]';
  return `w-full ${bgClass} border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-brand-accent2/20 transition-all outline-none`;
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  className = 'space-y-2',
  inputClassName = '',
  labelClassName = '',
  variant = 'default',
  as = 'input',
  ...props
}) => {
  const finalInputClassName = `${getBaseInputClassName(variant)} ${inputClassName}`;
  
  return (
    <div className={className}>
      <label className={`${baseLabelClassName} ${labelClassName}`}>{label}</label>
      {as === 'textarea' ? (
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={finalInputClassName}
        />
      ) : (
        <input
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          className={finalInputClassName}
        />
      )}
      {error ? <p className="text-xs text-red-500 ml-1">{error}</p> : null}
    </div>
  );
};

export default FormField;
