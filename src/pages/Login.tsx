import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

// ─── Icons (inline SVG to avoid extra deps) ──────────────────────────────────
const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const ArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
);

const UtensilsIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.18 }}>
        <line x1="3" y1="2" x2="3" y2="22" />
        <path d="M7 2v7a4 4 0 0 1-4 4v9" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6h4v2l-1 7" />
    </svg>
);

// ─── Logo mark ────────────────────────────────────────────────────────────────
const LogoMark = () => (
    <div style={{
        width: 64, height: 64,
        borderRadius: '50%',
        backgroundColor: '#fff',
        border: '1px solid #e8e0d5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(74,14,14,0.08)',
        margin: '0 auto 20px',
    }}>
        {/* Simple castle-like shape using the hourglass / logo mark */}
        <svg width="30" height="30" viewBox="0 0 100 120" fill="none">
            <rect x="10" y="0"  width="18" height="20" rx="2" fill="#4A0E0E" />
            <rect x="41" y="0"  width="18" height="20" rx="2" fill="#4A0E0E" />
            <rect x="72" y="0"  width="18" height="20" rx="2" fill="#4A0E0E" />
            <rect x="5"  y="20" width="90" height="60" rx="4" fill="#4A0E0E" />
            <rect x="35" y="60" width="30" height="60" rx="2" fill="#4A0E0E" />
        </svg>
    </div>
);

export default function Login() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const login    = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));
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
                    <ShieldIcon />
                    Secure Access
                </div>

                {/* Decorative utensils bottom-right */}
                <div style={{
                    position: 'absolute',
                    bottom: 24, right: 30,
                    color: '#4A0E0E',
                }}>
                    <UtensilsIcon />
                </div>

                {/* Form card */}
                <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>

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
                                    onChange={e => setEmail(e.target.value)}
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
                                    onBlur={e  => e.currentTarget.style.borderColor = '#f2ece4'}
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
                                    onChange={e => setPassword(e.target.value)}
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
                                    onBlur={e  => e.currentTarget.style.borderColor = '#f2ece4'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
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
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
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
                                onChange={e => setRemember(e.target.checked)}
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
                            {isLoading ? 'Accediendo...' : 'Iniciar Sesión'}
                            {!isLoading && <ArrowIcon />}
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
