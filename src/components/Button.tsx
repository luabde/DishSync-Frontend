import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        children,
        variant = 'primary',
        isLoading = false,
        leftIcon,
        rightIcon,
        fullWidth = true,
        className = '',
        disabled,
        ...props
    }, ref) => {

        const baseStyles = "relative font-bold transition-all duration-300 flex items-center justify-center transform active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed border";

        const variants = {
            primary: "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-2xl shadow-brand-primary/40 border-white/10 py-4.5 rounded-2xl text-lg",
            outline: "bg-transparent hover:bg-white/5 text-white border-white/30 py-3.5 rounded-xl"
        };

        const widthStyle = fullWidth ? "w-full" : "px-8";

        return (
            <button
                ref={ref}
                disabled={isLoading || disabled}
                className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
                {...props}
            >
                {isLoading && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';
