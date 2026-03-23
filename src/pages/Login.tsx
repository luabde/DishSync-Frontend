import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
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
// Auth logic   → useAuthStore (store/authStore.ts)
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
    const login    = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // ── TODO: Replace this mock with the real API call ──────────────
            // When the backend is ready, do the following instead:
            //
            //   import { loginUser } from '../api/auth';
            //   const { user } = await loginUser(email, password);
            //   login(user);
            //
            // The backend sets HttpOnly cookies automatically (access_token +
            // refresh_token), so there's nothing else to store here.
            // ─────────────────────────────────────────────────────────────────
            await new Promise((resolve) => setTimeout(resolve, 1200));
            if (email === 'admin@elcastell.com' && password === '123456') {
                login('dummy-token-12345', { id: '1', email, name: 'Admin Usuario', role: 'ADMIN' });
                navigate('/');
            } else {
                setError('Credenciales incorrectas. Comprueba tu correo y contraseña.');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión.';
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
                <h1 className="font-serif text-[34px] font-medium text-[#4A0E0E] mb-2.5 tracking-tight">
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
