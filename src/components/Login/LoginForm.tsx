import React from 'react';
import { Eye, EyeOff, Lock, Building2, ArrowRight } from 'lucide-react';
import { Input } from '../Input';
import { Button } from '../Button';
import { COLORS, FONTS } from './loginStyles';

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
        <div className="login-override-input">
            <Input
                type="email"
                placeholder="adrian.n@elcastell.com"
                value={email}
                onChange={onEmailChange}
                required
                leftIcon={<Building2 size={18} className="text-[#b5a89a]" />}
                label="Correo Electrónico"
            />
        </div>

        {/* Password input */}
        <div className="login-override-input relative">
            {/* Custom label row with "forgot password" link */}
            <div className="flex justify-between items-center mb-1 w-full absolute -top-1.5 z-10 left-0 right-0 px-1">
                <label style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: COLORS.primary,
                }}>
                    Contraseña
                </label>
                <button
                    type="button"
                    style={{
                        background: 'none', border: 'none',
                        fontSize: 10, fontWeight: 600,
                        color: COLORS.gold,
                        cursor: 'pointer',
                        letterSpacing: '0.06em',
                        padding: 0,
                        fontFamily: FONTS.sans,
                    }}
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
                            className="text-[#b5a89a] hover:text-[#4A0E0E] transition-colors pr-2"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    }
                    style={{ letterSpacing: showPassword ? 'normal' : '0.12em' }}
                />
            </div>
        </div>

        {/* Remember me */}
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginTop: 10, marginBottom: 12,
        }}>
            <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={onRememberChange}
                style={{ width: 15, height: 15, accentColor: COLORS.primary, cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{
                fontSize: 12,
                color: COLORS.textSubtle,
                cursor: 'pointer',
                fontWeight: 500,
            }}>
                Recordar sesión en este dispositivo
            </label>
        </div>

        {/* Error message — shown when the server returns an error */}
        {error && (
            <p style={{
                fontSize: 12,
                color: '#DC2626',
                background: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: 8,
                padding: '10px 14px',
                margin: '0 0 4px',
                fontWeight: 500,
            }}>
                {error}
            </p>
        )}

        {/* Submit button */}
        <Button
            type="submit"
            isLoading={isLoading}
            variant="primary"
            rightIcon={!isLoading && <ArrowRight size={16} />}
            className="bg-[#4A0E0E] hover:bg-[#6b1414] text-[11px] uppercase tracking-[0.2em] py-3.5 mt-2"
        >
            {isLoading ? 'Accediendo...' : 'Iniciar Sesión'}
        </Button>
    </form>
);
