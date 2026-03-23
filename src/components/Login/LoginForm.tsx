import React from 'react';
import { Eye, EyeOff, Lock, Building2, ArrowRight } from 'lucide-react';
import { Input } from '../Input';
import { Button } from '../Button';

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoginFormProps {
    email: string;
    password: string;
    showPassword: boolean;
    remember: boolean;
    isLoading: boolean;
    /** Error message from the server. Set to null/undefined to hide. */
    error?: string | null;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRememberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTogglePassword: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LoginForm: React.FC<LoginFormProps> = ({
    email,
    password,
    showPassword,
    remember,
    isLoading,
    error,
    onEmailChange,
    onPasswordChange,
    onRememberChange,
    onTogglePassword,
    onSubmit,
}) => (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">

        {/* Email input */}
        <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
                Correo Electrónico
            </label>
            <Input
                type="email"
                placeholder="adrian.n@elcastell.com"
                value={email}
                onChange={onEmailChange}
                required
                leftIcon={<Building2 size={18} className="text-[#b5a89a]" />}
                className="rounded-lg! border-[1.5px]! border-[#f2ece4]! bg-white! py-3.5! text-brand-primary! placeholder:text-[#b5a89a]! focus:border-brand-primary! focus:ring-0!"
            />
        </div>

        {/* Password input */}
        <div className="relative">
            {/* Custom label row with "forgot password" link */}
            <div className="flex justify-between items-center mb-1 w-full absolute -top-1.5 z-10 left-0 right-0 px-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
                    Contraseña
                </label>
                <button
                    type="button"
                    className="border-none bg-transparent p-0 text-[10px] font-semibold tracking-[0.06em] text-brand-accent2 cursor-pointer"
                >
                    ¿Olvidó su clave?
                </button>
            </div>

            <div className="pt-5">
                <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="········"
                    value={password}
                    onChange={onPasswordChange}
                    required
                    leftIcon={<Lock size={18} className="text-[#b5a89a]" />}
                    rightIcon={
                        <button
                            type="button"
                            onClick={onTogglePassword}
                            className="text-[#b5a89a] hover:text-brand-primary transition-colors pr-2"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    }
                    className={`rounded-lg! border-[1.5px]! border-[#f2ece4]! bg-white! py-3.5! text-brand-primary! placeholder:text-[#b5a89a]! focus:border-brand-primary! focus:ring-0! ${showPassword ? 'tracking-normal!' : 'tracking-[0.12em]!'} `}
                />
            </div>
        </div>

        {/* Remember me */}
        <div className="my-2.5 mb-3 flex items-center gap-2.5">
            <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={onRememberChange}
                className="h-3.75 w-3.75 cursor-pointer accent-brand-primary"
            />
            <label htmlFor="remember" className="cursor-pointer text-xs font-medium text-[#7a6a60]">
                Recordar sesión en este dispositivo
            </label>
        </div>

        {/* Error message — shown when the server returns an error */}
        {error && (
            <p className="mb-1 rounded-lg border border-red-600/20 bg-red-600/5 px-3.5 py-2.5 text-xs font-medium text-red-600">
                {error}
            </p>
        )}

        {/* Submit button */}
        <Button
            type="submit"
            isLoading={isLoading}
            variant="primary"
            rightIcon={!isLoading && <ArrowRight size={16} />}
            className="bg-brand-primary hover:bg-[#6b1414] text-[11px] uppercase tracking-[0.2em] py-3.5 mt-2"
        >
            {isLoading ? 'Accediendo...' : 'Iniciar Sesión'}
        </Button>
    </form>
);
