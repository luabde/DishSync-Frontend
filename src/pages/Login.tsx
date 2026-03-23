import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowRight, Building2, ChefHat, ClipboardList, BarChart3, Globe } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

// ─── Carousel Slides Data ─────────────────────────────────────────────────────
interface CarouselSlide {
    tag: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    image: string;
}

const SLIDES: CarouselSlide[] = [
    {
        tag: 'Gestión de Operaciones',
        title: 'La excelencia comienza tras bambalinas.',
        description: 'Accede al panel de control interno de El Castell y gestiona las operaciones diarias del restaurante con total precisión.',
        icon: <ChefHat size={28} />,
        image: '/src/assets/nosotros.png',
    },
    {
        tag: 'Control de Comandas',
        title: 'Cada pedido, bajo control en tiempo real.',
        description: 'Supervisa el estado de todas las comandas activas, gestiona la cocina y garantiza una experiencia impecable para cada cliente.',
        icon: <ClipboardList size={28} />,
        image: '/src/assets/nosotros.png',
    },
    {
        tag: 'Analítica del Negocio',
        title: 'Datos que impulsan tus decisiones.',
        description: 'Consulta métricas clave, tus productos más vendidos y el rendimiento de tu equipo para optimizar cada turno.',
        icon: <BarChart3 size={28} />,
        image: '/src/assets/nosotros.png',
    },
];

// ─── Logo mark ────────────────────────────────────────────────────────────────
const LogoMark: React.FC = () => (
    <div className="relative w-[84px] h-[84px] mx-auto mb-7">
        <div className="absolute inset-0 bg-white rounded-full shadow-[0_12px_24px_rgba(74,14,14,0.04)] border border-[#EAE3DB]"></div>
        <div className="absolute inset-[4px] rounded-full border border-[#FAF8F5]"></div>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-[#FAF8F5]/50 rounded-full">
            <svg width="34" height="34" viewBox="0 0 100 120" fill="none" style={{ filter: 'drop-shadow(0px 2px 4px rgba(74,14,14,0.06))' }}>
                <rect x="10" y="0" width="18" height="20" rx="2" fill="#4A0E0E" />
                <rect x="41" y="0" width="18" height="20" rx="2" fill="#4A0E0E" />
                <rect x="72" y="0" width="18" height="20" rx="2" fill="#4A0E0E" />
                <rect x="5" y="20" width="90" height="60" rx="4" fill="#4A0E0E" />
                <rect x="35" y="60" width="30" height="60" rx="2" fill="#4A0E0E" />
            </svg>
        </div>
    </div>
);

export default function Login(): React.ReactElement {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [remember, setRemember] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeSlide, setActiveSlide] = useState<number>(0);
    const [contentVisible, setContentVisible] = useState<boolean>(true);

    // Auto-advance carousel every 4 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            goToSlide((activeSlide + 1) % SLIDES.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [activeSlide]);

    const goToSlide = (index: number): void => {
        if (index === activeSlide) return;
        setContentVisible(false);
        setTimeout(() => {
            setActiveSlide(index);
            setContentVisible(true);
        }, 280);
    };

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
                    .login-override-input input {
                        background-color: #fff !important;
                        color: #4A0E0E !important;
                        border: 1.5px solid #f2ece4 !important;
                        border-radius: 8px !important;
                        backdrop-filter: none !important;
                    }
                    .login-override-input input:focus {
                        border-color: #4A0E0E !important;
                        box-shadow: none !important;
                        background-color: #fff !important;
                    }
                    .login-override-input label {
                        color: #4A0E0E !important;
                        font-size: 10px !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.18em !important;
                        font-weight: 700 !important;
                    }
                    @keyframes img-fade-in {
                        from { opacity: 0; }
                        to   { opacity: 0.72; }
                    }
                    .dot-pill {
                        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                                    background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                `}
            </style>

            {/* ── LEFT PANEL ── carousel */}
            <div style={{
                flex: '0 0 46%',
                position: 'relative',
                overflow: 'hidden',
                background: '#1a1008',
            }}>
                {/* Background image (crossfade via opacity) */}
                <img
                    key={activeSlide}
                    src={SLIDES[activeSlide].image}
                    alt="panel"
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        opacity: 0.72,
                        animation: 'img-fade-in 0.6s ease forwards',
                    }}
                />

                {/* Dark gradient */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(10,3,3,0.97) 0%, rgba(10,3,3,0.55) 50%, rgba(10,3,3,0.15) 100%)',
                }} />

                {/* Slide content — keyed only for the text fade, NOT wrapping the dots */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 64, left: 44, right: 44,
                        color: '#fff',
                    }}
                >
                    {/* Fading text block — simple opacity cross-fade only, no movement */}
                    <div
                        style={{
                            opacity: contentVisible ? 1 : 0,
                            transition: 'opacity 0.4s ease',
                            marginBottom: 28,
                        }}
                    >
                        {/* Icon badge */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'rgba(212,175,55,0.15)',
                            border: '1px solid rgba(212,175,55,0.35)',
                            borderRadius: 999,
                            padding: '5px 14px 5px 10px',
                            marginBottom: 22,
                        }}>
                            <span style={{ color: '#D4AF37' }}>{SLIDES[activeSlide].icon}</span>
                            <span style={{
                                fontSize: 10,
                                fontWeight: 600,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: '#D4AF37',
                            }}>
                                {SLIDES[activeSlide].tag}
                            </span>
                        </div>

                        <h2 style={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: 36,
                            fontWeight: 700,
                            lineHeight: 1.18,
                            margin: '0 0 16px',
                            color: '#fff',
                        }}>
                            {SLIDES[activeSlide].title}
                        </h2>
                        <p style={{
                            fontSize: 13,
                            color: 'rgba(255,255,255,0.65)',
                            lineHeight: 1.7,
                            maxWidth: 330,
                            margin: 0,
                        }}>
                            {SLIDES[activeSlide].description}
                        </p>
                    </div>

                    {/* Dot indicators — stable DOM, never re-keyed, so CSS transition always fires */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {SLIDES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className="dot-pill"
                                aria-label={`Diapositiva ${i + 1}`}
                                style={{
                                    height: 6,
                                    width: i === activeSlide ? 28 : 6,
                                    borderRadius: 999,
                                    backgroundColor: i === activeSlide ? '#D4AF37' : 'rgba(255,255,255,0.35)',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    display: 'block',
                                    flexShrink: 0,
                                }}
                            />
                        ))}
                    </div>
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


                {/* Top Actions Bar (Language, Status) */}
                <div style={{
                    position: 'absolute',
                    top: 24, right: 32, left: 32,
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 20,
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        color: '#4A0E0E',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        padding: '4px 10px',
                        backgroundColor: 'rgba(74, 14, 14, 0.05)',
                        borderRadius: 100,
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
                        <span style={{ opacity: 0.8 }}>System Operational</span>
                    </div>

                    <button style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'transparent',
                        border: '1px solid #EAE3DB',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 11,
                        color: '#7a6a60',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}>
                        <Globe size={14} />
                        ES
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                </div>

                    {/* Logo + title */}
                    <div style={{ textAlign: 'center', marginBottom: 44 }}>
                        <LogoMark />

                        <h1 style={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: 34,
                            fontWeight: 500,
                            color: '#4A0E0E',
                            margin: '0 0 10px',
                            letterSpacing: '-0.01em',
                        }}>
                            El Castell
                        </h1>
                        <p style={{
                            fontSize: 11,
                            fontWeight: 500,
                            letterSpacing: '0.28em',
                            textTransform: 'uppercase',
                            color: '#A08F83',
                            margin: 0,
                        }}>
                            Acceso exclusivo para el staff
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="flex flex-col gap-4">

                        {/* Email */}
                        <div className="login-override-input">
                            <Input
                                type="email"
                                placeholder="adrian.n@elcastell.com"
                                value={email}
                                onChange={handleEmailChange}
                                required
                                leftIcon={<Building2 size={18} className="text-[#b5a89a]" />}
                                label="Correo Electrónico"
                            />
                        </div>

                        {/* Password */}
                        <div className="login-override-input relative">
                            <div className="flex justify-between items-center mb-1 w-full absolute -top-1.5 z-10 left-0 right-0 px-1">
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

                            <div className="pt-5">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="········"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    leftIcon={<Lock size={18} className="text-[#b5a89a]" />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="text-[#b5a89a] hover:text-[#4A0E0E] transition-colors pr-2"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                    style={{
                                        letterSpacing: showPassword ? 'normal' : '0.12em',
                                    }}
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

                    {/* Footer */}
                    <div style={{ marginTop: 40, textAlign: 'center' }}>
                        
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: 16,
                            marginBottom: 24,
                            flexWrap: 'wrap',
                        }}>
                            {['Documentación', 'Estado del Sistema', 'Soporte B2B', 'Privacidad'].map(link => (
                                <button key={link} type="button" style={{
                                    background: 'none', border: 'none', padding: 0,
                                    fontSize: 10.5, fontWeight: 500,
                                    color: '#A08F83',
                                    cursor: 'pointer',
                                    fontFamily: '"Montserrat", sans-serif',
                                    transition: 'color 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#4A0E0E'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#A08F83'}
                                >
                                    {link}
                                </button>
                            ))}
                        </div>

                        {/* DishSync branding & Version */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: 16,
                            borderTop: '1px solid #e8e0d5',
                        }}>
                            <div style={{
                                fontSize: 10,
                                color: '#b5a89a',
                                fontWeight: 500,
                                letterSpacing: '0.04em',
                            }}>
                                v2.4.1 (Build 8902)
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{
                                    fontSize: 9,
                                    color: '#b5a89a',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    fontWeight: 600,
                                }}>
                                    Powered by
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="#4A0E0E" strokeWidth="2" />
                                        <path d="M7 12h10M12 7v10" stroke="#4A0E0E" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                                    </svg>
                                    <span style={{
                                        fontFamily: '"Montserrat", sans-serif',
                                        fontSize: 11,
                                        fontWeight: 800,
                                        letterSpacing: '0.04em',
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
