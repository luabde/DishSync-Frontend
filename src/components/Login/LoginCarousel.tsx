import React from 'react';
import { ChefHat, ClipboardList, BarChart3 } from 'lucide-react';
import { COLORS } from './loginStyles';

// ─── Carousel Slides ──────────────────────────────────────────────────────────
// Para añadir o editar slides, modifica únicamente este array.

export interface CarouselSlide {
    tag: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    bgColor: string;
}

export const SLIDES: CarouselSlide[] = [
    {
        tag: "Consell d'Ús",
        title: 'Actualització en temps real',
        description: "Amb DishSync, pots actualitzar el teu menú en qualsevol moment i els canvis es reflectiran a l'instant en totes les teves plataformes.",
        icon: <ChefHat size={28} />,
        bgColor: '#4A0E0E',
    },
    {
        tag: 'Gestió Multi-Local',
        title: 'Gestiona diversos restaurants',
        description: "Sabies que pots controlar diversos establiments des d'un sol compte? Estalvia temps i centralitza tota l'operativa del teu negoci.",
        icon: <BarChart3 size={28} />,
        bgColor: '#1a1008',
    },
    {
        tag: 'Optimització',
        title: 'Analitza els teus plats estrella',
        description: "Revisa les estadístiques diàries per optimitzar el teu estoc i potenciar aquells plats que més agraden als teus clients.",
        icon: <ClipboardList size={28} />,
        bgColor: '#2D0909',
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
            {/* Dark gradient overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)',
            }} />

            {/* Bottom content */}
            <div style={{
                position: 'absolute',
                bottom: 64, left: 44, right: 44,
                color: '#fff',
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
                    }}>
                        {slide.title}
                    </h2>
                    <p style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.65)',
                        lineHeight: 1.7,
                        maxWidth: 330,
                        margin: 0,
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
                                backgroundColor: i === activeSlide ? COLORS.gold : 'rgba(255,255,255,0.35)',
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
    );
};
