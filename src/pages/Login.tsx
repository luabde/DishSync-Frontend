import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowRight, Shield, UtensilsCrossed, Building2, ChefHat, ClipboardList, BarChart3 } from 'lucide-react';
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
    <div className="w-16 h-16 rounded-full bg-white border border-[#e8e0d5] flex items-center justify-center shadow-[0_2px_12px_rgba(74,14,14,0.08)] mx-auto mb-5">
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
    const [activeSlide, setActiveSlide] = useState<number>(0);
    const [contentKey, setContentKey] = useState<number>(0);
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
        // 1. Fade out content only
        setContentVisible(false);
        setTimeout(() => {
            // 2. Switch slide & trigger dot transition in same render
            setActiveSlide(index);
            setContentKey(k => k + 1);
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
                    @keyframes carousel-fade-in {
                        from { opacity: 0; transform: translateY(12px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes img-fade-in {
                        from { opacity: 0; }
                        to   { opacity: 0.72; }
                    }
                    .carousel-content {
                        animation: carousel-fade-in 0.35s ease forwards;
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
                    {/* Fading text block */}
                    <div
                        key={contentKey}
                        className="carousel-content"
                        style={{
                            opacity: contentVisible ? 1 : 0,
                            transform: contentVisible ? 'translateY(0)' : 'translateY(10px)',
                            transition: 'opacity 0.28s ease, transform 0.28s ease',
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
