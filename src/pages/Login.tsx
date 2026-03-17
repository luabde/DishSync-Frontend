import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowRight, Shield, Loader2, UtensilsCrossed } from 'lucide-react';

// ─── Logo mark ────────────────────────────────────────────────────────────────
const LogoMark: React.FC = () => (
    <div style={{
        width: 64, height: 64,
        borderRadius: '50%',
        backgroundColor: '#fff',
        border: '1px solid #e8e0d5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(74,14,14,0.08)',
        margin: '0 auto 20px',
    }}>
        {/* Simple castle-like shape */}
        <svg width="30" height="30" viewBox="0 0 100 120" fill="none">
            <rect x="10" y="0" width="18" height="20" rx="2" fill="#4A0E0E" />
            <rect x="41" y="0" width="18" height="20" rx="2" fill="#4A0E0E" />
            <rect x="72" y="0" width="18" height="20" rx="2" fill="#4A0E0E" />
            <rect x="5" y="20" width="90" height="60" rx="4" fill="#4A0E0E" />
            <rect x="35" y="60" width="30" height="60" rx="2" fill="#4A0E0E" />
        </svg>
    </div>
);

export default function Login(): React.ReactElement {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [remember, setRemember] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            if (email === 'admin@elcastell.com' && password === '123456') {
                login('dummy-token-12345', { id: '1', email, name: 'Admin Usuario', role: 'ADMIN' });
                navigate('/');
            }
        } catch (err) {
            console.error('Error al iniciar sesión', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setPassword(e.target.value);
    };

    const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setRemember(e.target.checked);
    };

    const togglePasswordVisibility = (): void => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: '"Montserrat", sans-serif',
            backgroundColor: '#F9F7F2',
        }}>
            <style>
                {`
                    .login-input::placeholder {
                        color: #b5a89a;
                        opacity: 1;
                    }
                    .icon-spin {
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}
            </style>

            {/* ── LEFT PANEL ── image + text overlay */}
            <div style={{
                flex: '0 0 46%',
                position: 'relative',
                overflow: 'hidden',
                background: '#1a1008',
            }}>
                {/* Background image */}
                <img
                    src="/src/assets/nosotros.png"
                    alt="cocina"
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        opacity: 0.75,
                    }}
                />

                {/* Dark gradient at bottom */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(20,5,5,0.92) 0%, rgba(20,5,5,0.45) 55%, transparent 100%)',
                }} />

                {/* Text at bottom-left */}
                <div style={{
                    position: 'absolute',
                    bottom: 48, left: 44, right: 44,
                    color: '#fff',
                }}>
                    <p style={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: '#D4AF37',
                        marginBottom: 14,
                    }}>
                        Administración
                    </p>
                    <h2 style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: 38,
                        fontWeight: 700,
                        lineHeight: 1.18,
                        margin: '0 0 18px',
                        color: '#fff',
                    }}>
                        La excelencia comienza tras bambalinas.
                    </h2>
                    <p style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.68)',
                        lineHeight: 1.65,
                        maxWidth: 320,
                        margin: 0,
                    }}>
                        Bienvenido al panel de control interno de El Castell. Por favor, identifíquese para gestionar las operaciones diarias.
                    </p>
                </div>
            </div>

            {/* ── RIGHT PANEL ── form */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                position: 'relative',
                padding: '0 60px',
                justifyContent: 'center',
            }}>

                {/* Secure access badge */}
                <div style={{
                    position: 'absolute',
                    top: 28, right: 36,
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: '#9a8070',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}>
                    <Shield size={13} strokeWidth={2.5} />
                    Secure Access
                </div>

                {/* Decorative utensils bottom-right */}
                <div style={{
                    position: 'absolute',
                    bottom: 24, right: 30,
                    color: '#4A0E0E',
                    opacity: 0.18
                }}>
                    <UtensilsCrossed size={40} strokeWidth={1.5} />
                </div>

                {/* Form card */}
                <div style={{ maxWidth: 360, width: '100%', margin: '0 auto', zIndex: 10 }}>

                    {/* Logo + title */}
                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <LogoMark />

                        <h1 style={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: 30,
                            fontWeight: 700,
                            fontStyle: 'italic',
                            color: '#4A0E0E',
                            margin: '0 0 8px',
                        }}>
                            El Castell
                        </h1>
                        <div style={{
                            width: 36, height: 2,
                            background: '#D4AF37',
                            borderRadius: 2,
                            margin: '8px auto 14px',
                        }} />
                        <p style={{
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: '#9a8070',
                            margin: 0,
                        }}>
                            Acceso exclusivo para el staff
                        </p>
                    </div>

                    <form onSubmit={onSubmit}>

                        {/* Email */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: '#4A0E0E',
                                marginBottom: 8,
                            }}>
                                Correo Electrónico
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="login-input"
                                    type="email"
                                    placeholder="adrian.n@elcastell.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        border: '1.5px solid #f2ece4',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        color: '#333',
                                        backgroundColor: '#fff',
                                        outline: 'none',
                                        fontFamily: '"Montserrat", sans-serif',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#4A0E0E'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#f2ece4'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 14 }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 8,
                            }}>
                                <label style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: '#4A0E0E',
                                }}>
                                    Contraseña
                                </label>
                                <button type="button" style={{
                                    background: 'none', border: 'none',
                                    fontSize: 10, fontWeight: 600,
                                    color: '#D4AF37',
                                    cursor: 'pointer',
                                    letterSpacing: '0.06em',
                                    padding: 0,
                                    fontFamily: '"Montserrat", sans-serif',
                                }}>
                                    ¿Olvidó su clave?
                                </button>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="login-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="········"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 42px 12px 14px',
                                        border: '1.5px solid #f2ece4',
                                        borderRadius: 8,
                                        fontSize: 16,
                                        color: '#4A0E0E',
                                        backgroundColor: '#fff',
                                        outline: 'none',
                                        fontFamily: '"Montserrat", sans-serif',
                                        boxSizing: 'border-box',
                                        letterSpacing: showPassword ? 'normal' : '0.12em',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#4A0E0E'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#f2ece4'}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    style={{
                                        position: 'absolute',
                                        right: 14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        color: '#b5a89a',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            marginBottom: 28,
                        }}>
                            <input
                                id="remember"
                                type="checkbox"
                                checked={remember}
                                onChange={handleRememberChange}
                                style={{
                                    width: 15, height: 15,
                                    accentColor: '#4A0E0E',
                                    cursor: 'pointer',
                                }}
                            />
                            <label htmlFor="remember" style={{
                                fontSize: 12,
                                color: '#7a6a60',
                                cursor: 'pointer',
                                fontWeight: 500,
                            }}>
                                Recordar sesión en este dispositivo
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                backgroundColor: isLoading ? '#7a3535' : '#4A0E0E',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontFamily: '"Montserrat", sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#6b1414'; }}
                            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#4A0E0E'; }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="icon-spin" />
                                    Accediendo...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} style={{ marginRight: -4 }} />
                                    Iniciar Sesión
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>

                    </form>

                    {/* Footer */}
                    <div style={{ marginTop: 36, textAlign: 'center' }}>
                        <p style={{
                            fontSize: 10.5,
                            color: '#b5a49a',
                            marginBottom: 12,
                            lineHeight: 1.6,
                        }}>
                            Este sistema está monitoreado. El acceso no autorizado está estrictamente<br />
                            prohibido y será reportado.
                        </p>
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: 20,
                            marginBottom: 24,
                        }}>
                            {['Soporte IT', 'Políticas Internas'].map(link => (
                                <button key={link} type="button" style={{
                                    background: 'none', border: 'none', padding: 0,
                                    fontSize: 10, fontWeight: 600,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#9a8070',
                                    cursor: 'pointer',
                                    fontFamily: '"Montserrat", sans-serif',
                                }}>
                                    {link}
                                </button>
                            ))}
                        </div>

                        {/* DishSync branding */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            paddingTop: 16,
                            borderTop: '1px solid #e8e0d5',
                        }}>
                            <span style={{
                                fontSize: 10,
                                color: '#b5a89a',
                                fontWeight: 500,
                                letterSpacing: '0.06em',
                            }}>
                                Gestionado con
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                {/* DishSync logo mark */}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#4A0E0E" strokeWidth="1.5" />
                                    <path d="M7 12h10M12 7v10" stroke="#4A0E0E" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                                </svg>
                                <span style={{
                                    fontFamily: '"Montserrat", sans-serif',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    color: '#4A0E0E',
                                }}>
                                    DishSync
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
