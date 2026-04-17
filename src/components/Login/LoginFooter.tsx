import React from 'react';

// Footer del panel derecho.
// Contiene links de navegación y branding de DishSync.
// Para añadir/quitar links edita el array FOOTER_LINKS.

const FOOTER_LINKS = ['Documentación', 'Estado del Sistema', 'Soporte B2B', 'Privacidad'];

export const LoginFooter: React.FC = () => (
  <div className="mt-10 w-full border-t border-[#e8e0d5] pt-6 text-center sm:mt-16 sm:pt-8">
    <p className="text-[11px] font-medium text-[#A08F83] sm:text-xs">
        Tens problemes per iniciar la sessió?{' '}
        <a
            href="mailto:support@dishsync.com"
            className="font-semibold text-ds-brand-gold hover:underline"
        >
            Contacta amb suport tècnic
        </a>
    </p>
  </div>
);