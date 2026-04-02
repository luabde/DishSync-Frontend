import React from 'react';

type FormFieldBaseProps = {
  label: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
};

type FormFieldInputProps = FormFieldBaseProps & {
  as?: 'input';
} & React.InputHTMLAttributes<HTMLInputElement>;

type FormFieldTextareaProps = FormFieldBaseProps & {
  as: 'textarea';
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type FormFieldProps = FormFieldInputProps | FormFieldTextareaProps;

const baseLabelClassName = 'text-xs font-bold uppercase tracking-wider text-brand-primary ml-1';
const baseInputClassName =
  'w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 transition-all outline-none';

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  className = 'space-y-2',
  inputClassName = '',
  labelClassName = '',
  as = 'input',
  ...props
}) => {
  return (
    <div className={className}>
      <label className={`${baseLabelClassName} ${labelClassName}`}>{label}</label>
      {as === 'textarea' ? (
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={`${baseInputClassName} ${inputClassName}`}
        />
      ) : (
        <input
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          className={`${baseInputClassName} ${inputClassName}`}
        />
      )}
      {error ? <p className="text-xs text-red-500 ml-1">{error}</p> : null}
    </div>
  );
};

export default FormField;
