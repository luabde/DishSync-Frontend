import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
        return (
            <div className="space-y-2 w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-300 ml-1 transition-colors group-hover:text-white">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-accent2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full py-4 glass-realistic text-white 
              placeholder-gray-400/60 focus:outline-none focus:ring-2 
              focus:ring-white/20 focus:bg-white/10 
              transition-all duration-300 ease-in-out
              ${leftIcon ? 'pl-12' : 'pl-5'} 
              ${rightIcon ? 'pr-14' : 'pr-5'}
              ${error ? 'border-red-500/50 focus:ring-red-500/30' : ''}
              ${className}
            `}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 flex items-center">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-red-400 text-xs mt-2 ml-1 font-medium animate-in fade-in duration-300">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
