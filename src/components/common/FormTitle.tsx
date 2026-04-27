import React from 'react';

interface FormTitleProps {
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export function FormTitle({ children, className = '', description }: FormTitleProps) {
  return (
    <div className={`text-center ${description ? 'mb-2' : 'mb-10'} ${className}`}>
      <h2 className="text-xl font-heading font-bold text-brand-primary">
        {children}
      </h2>
      {description && (
        <div className="max-w-lg mx-auto mt-4 mb-8">
          <p className="text-[13px] text-brand-gray/50 leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
