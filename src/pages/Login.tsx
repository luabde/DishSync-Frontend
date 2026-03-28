import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth.hook';
import { getDefaultRouteForRole } from '../navigation/defaultRouteForRole';
import { LoginCarousel, SLIDES } from '../components/Login/LoginCarousel';
import { LoginTopBar } from '../components/Login/LoginTopBar';
import { LoginForm } from '../components/Login/LoginForm';
import { LoginFooter } from '../components/Login/LoginFooter';
import { LogoMark } from '../components/Login/LogoMark';
import { LOGIN_GLOBAL_STYLES, FONTS } from '../components/Login/loginStyles';

// ─────────────────────────────────────────────────────────────────────────────
// Login page — orchestrates state and hands it down to focused sub-components.
// Visual logic → LoginCarousel / LoginTopBar / LoginFooter / LogoMark
// Form logic   → LoginForm
// Auth logic   → useAuth (context/authContext.tsx)
// ─────────────────────────────────────────────────────────────────────────────

export default function Login(): React.ReactElement {
    // ── Carousel state ──────────────────────────────────────────────────────
    const [activeSlide,    setActiveSlide]    = useState<number>(0);
    const [contentVisible, setContentVisible] = useState<boolean>(true);

    const goToSlide = (index: number): void => {
        if (index === activeSlide) return;
        setContentVisible(false);
        setTimeout(() => {
            setActiveSlide(index);
            setContentVisible(true);
        }, 280);
    };

    // Auto-advance every 4 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            goToSlide((activeSlide + 1) % SLIDES.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [activeSlide]);

    // ── Form state ──────────────────────────────────────────────────────────
    const [email,        setEmail]        = useState<string>('');
    const [password,     setPassword]     = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [remember,     setRemember]     = useState<boolean>(false);
    const [isLoading,    setIsLoading]    = useState<boolean>(false);
    const [error,        setError]        = useState<string | null>(null);

    // ── Auth ────────────────────────────────────────────────────────────────
    const { login, isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthLoading && isAuthenticated && user?.rol) {
            navigate(getDefaultRouteForRole(user.rol), { replace: true });
        }
    }, [isAuthLoading, isAuthenticated, user?.rol, navigate]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const u = await login(email, password);
            navigate(getDefaultRouteForRole(u.rol), { replace: true });
        } catch (err: unknown) {
            const message = err instanceof Error && err.message
                ? err.message
                : 'Error desconocido al iniciar sesión.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: FONTS.sans,
            backgroundColor: '#F9F7F2',
        }}>
            {/* Global styles for placeholder overrides and animations */}
            <style>{LOGIN_GLOBAL_STYLES}</style>

            {/* Left panel — carousel */}
            <LoginCarousel
                activeSlide={activeSlide}
                contentVisible={contentVisible}
                onGoToSlide={goToSlide}
            />

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col bg-white relative px-16 justify-center">
            <LoginTopBar />
            <div className="text-center mb-11">
                <LogoMark />
                <h1 className="font-serif text-[34px] font-medium text-brand-primary mb-2.5 tracking-tight">
                El Castell
                </h1>
                <p className="text-[11px] font-medium tracking-[0.28em] uppercase text-[#A08F83] m-0">
                Acceso exclusivo para el staff
                </p>
            </div>
            <LoginForm
                    email={email}
                    password={password}
                    showPassword={showPassword}
                    remember={remember}
                    isLoading={isLoading}
                    error={error}
                    onEmailChange={(e) => setEmail(e.target.value)}
                    onPasswordChange={(e) => setPassword(e.target.value)}
                    onRememberChange={(e) => setRemember(e.target.checked)}
                    onTogglePassword={() => setShowPassword((prev) => !prev)}
                    onSubmit={onSubmit}
                />
            <LoginFooter />
            </div>
        </div>
    );
}
