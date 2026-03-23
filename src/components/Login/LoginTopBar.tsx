import React from 'react';
import { Globe } from 'lucide-react';

// Top bar del panel derecho.
// Muestra el estado del sistema a la izquierda y selector de idioma a la derecha.

export const LoginTopBar: React.FC = () => (
  <div className="absolute top-6 right-8 left-8 flex justify-between items-center z-20">
    <div className="flex items-center gap-1.5 text-[#4A0E0E] text-[10px] font-semibold tracking-wide px-2.5 py-1 bg-[#4A0E0E]/5 rounded-full">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span className="opacity-80">System Operational</span>
    </div>
    <button className="flex items-center gap-1.5 border border-[#EAE3DB] px-3 py-1.5 rounded-md text-[11px] text-[#7a6a60] font-medium hover:border-[#4A0E0E] transition-all">
      <Globe size={14} />
      ES
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  </div>
);