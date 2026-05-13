import React from 'react';
import { Map, CalendarCheck, UtensilsCrossed } from 'lucide-react';
import { COLORS } from './loginStyles';
import { resolvePublicMediaUrl } from '../../utils/resolveMediaUrl';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveCarouselImageUrl = (filename: string) => {
    return resolvePublicMediaUrl(`public/carousel/${filename}`);
};

// ─── Carousel Slides ──────────────────────────────────────────────────────────
// Para añadir o editar slides, modifica únicamente este array.

export interface CarouselSlide {
    tag: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    bgColor: string;
    imageUrl?: string;
}

export const SLIDES: CarouselSlide[] = [
    {
        tag: "Gestió Visual",
        title: 'Dissenya el teu espai',
        description: "Configura el plànol del teu restaurant de forma interactiva. Defineix zones i distribueix les taules per optimitzar el servei i l'espai.",
        icon: <Map size={28} />,
        bgColor: '#4A0E0E',
        imageUrl: resolveCarouselImageUrl('carousel-1.png'),
    },
    {
        tag: 'Control de Reserves',
        title: 'Reserves en temps real',
        description: "Gestiona totes les reserves dels teus clients de forma àgil. Controla l'ocupació de les taules i evita esperes innecessàries.",
        icon: <CalendarCheck size={28} />,
        bgColor: '#1a1008',
        imageUrl: resolveCarouselImageUrl('carousel-2.png'),
    },
    {
        tag: 'Carta Digital',
        title: 'El teu menú, sempre al dia',
        description: "Personalitza la teva oferta gastronòmica a l'instant. Gestiona plats, categories i preus fàcilment des del teu panell d'administració.",
        icon: <UtensilsCrossed size={28} />,
        bgColor: '#2D0909',
        imageUrl: resolveCarouselImageUrl('carousel-3.png'),
    },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoginCarouselProps {
    activeSlide: number;
    contentVisible: boolean;
    onGoToSlide: (index: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LoginCarousel: React.FC<LoginCarouselProps> = ({
    activeSlide,
    contentVisible,
    onGoToSlide,
}) => {
    const slide = SLIDES[activeSlide];

    return (
        <div className="hidden md:flex" style={{
            flex: '0 0 46%',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: slide.bgColor,
            transition: 'background-color 0.8s ease',
        }}>
            {/* Background Images with Cross-fade transition */}
            {SLIDES.map((s, i) => (
                s.imageUrl && (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${s.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: i === activeSlide ? 1 : 0,
                            transition: 'opacity 0.8s ease',
                            zIndex: 0,
                            filter: 'brightness(0.75)', // General darkening of the image
                        }}
                    />
                )
            ))}

            {/* Dark gradient overlay — vertical and more intense at the bottom */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,1) 100%)',
                zIndex: 1,
            }} />

            {/* Additional side gradient for extra depth */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 50%)',
                zIndex: 1,
            }} />

            {/* Bottom content */}
            <div style={{
                position: 'absolute',
                bottom: 64, left: 44, right: 44,
                color: '#fff',
                zIndex: 2,
            }}>
                {/* Fading text block */}
                <div style={{
                    opacity: contentVisible ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    marginBottom: 28,
                }}>
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
                        backdropFilter: 'blur(4px)',
                    }}>
                        <span style={{ color: COLORS.gold }}>{slide.icon}</span>
                        <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: COLORS.gold,
                        }}>
                            {slide.tag}
                        </span>
                    </div>

                    <h2 style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: 36,
                        fontWeight: 700,
                        lineHeight: 1.18,
                        margin: '0 0 16px',
                        color: '#fff',
                        textShadow: '0 4px 15px rgba(0,0,0,1)',
                    }}>
                        {slide.title}
                    </h2>
                    <p style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.95)',
                        lineHeight: 1.7,
                        maxWidth: 330,
                        margin: 0,
                        textShadow: '0 2px 10px rgba(0,0,0,1)',
                    }}>
                        {slide.description}
                    </p>
                </div>

                {/* Dot indicators — stable DOM (no re-key), CSS transition always fires */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {SLIDES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onGoToSlide(i)}
                            className="dot-pill"
                            aria-label={`Diapositiva ${i + 1}`}
                            style={{
                                height: 6,
                                width: i === activeSlide ? 28 : 6,
                                borderRadius: 999,
                                backgroundColor: i === activeSlide ? COLORS.gold : 'rgba(255,255,255,0.4)',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                display: 'block',
                                flexShrink: 0,
                                transition: 'all 0.3s ease',
                                boxShadow: '0 1px 6px rgba(0,0,0,0.5)',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

