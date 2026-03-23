import React from 'react';

// Footer del panel derecho.
// Contiene links de navegación y branding de DishSync.
// Para añadir/quitar links edita el array FOOTER_LINKS.

const FOOTER_LINKS = ['Documentación', 'Estado del Sistema', 'Soporte B2B', 'Privacidad'];

export const LoginFooter: React.FC = () => (
  <div className="mt-10 text-center">
    <div className="flex justify-center gap-4 mb-6 flex-wrap">
      {FOOTER_LINKS.map(link => (
        <button
          key={link}
          type="button"
          className="text-[10.5px] font-medium text-[#A08F83] hover:text-[#4A0E0E] transition-colors bg-transparent border-none p-0 cursor-pointer"
        >
          {link}
        </button>
      ))}
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-[#e8e0d5]">
      <span className="text-[10px] text-[#b5a89a] font-medium tracking-wide">
        v2.4.1 (Build 8902)
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-[#b5a89a] uppercase tracking-widest font-semibold">
          Powered by
        </span>
        <div className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#4A0E0E" strokeWidth="2" />
            <path d="M7 12h10M12 7v10" stroke="#4A0E0E" strokeWidth="2" strokeLinecap="round" />
            <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          </svg>
          <span className="text-[11px] font-extrabold tracking-wide text-[#4A0E0E]">DishSync</span>
        </div>
      </div>
    </div>
  </div>
);