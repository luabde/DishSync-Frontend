import React from 'react';

// ─── Logotipo visual del restaurante ─────────────────────────────────────────
// Componente puro sin props, fácil de sustituir por una imagen real.

export const LogoMark: React.FC = () => (
    <div className="relative w-21 h-21 mx-auto mb-7">
        <div className="absolute inset-0 bg-white rounded-full shadow-[0_12px_24px_rgba(74,14,14,0.04)] border border-[#EAE3DB]" />
        <div className="absolute inset-1 rounded-full border border-[#FAF8F5]" />
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-b from-transparent to-[#FAF8F5]/50 rounded-full">
            <svg
                width="34"
                height="34"
                viewBox="0 0 100 120"
                fill="none"
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(74,14,14,0.06))' }}
            >
                <rect x="10" y="0"  width="18" height="20" rx="2" fill="#4A0E0E" />
                <rect x="41" y="0"  width="18" height="20" rx="2" fill="#4A0E0E" />
                <rect x="72" y="0"  width="18" height="20" rx="2" fill="#4A0E0E" />
                <rect x="5"  y="20" width="90" height="60" rx="4" fill="#4A0E0E" />
                <rect x="35" y="60" width="30" height="60" rx="2" fill="#4A0E0E" />
            </svg>
        </div>
    </div>
);
