// ─── Shared style constants for the Login page ────────────────────────────────
// Centralizing these here makes it easy to reskin the login page from one file.

export const COLORS = {
    primary: '#4A0E0E',
    primaryHover: '#6b1414',
    gold: '#D4AF37',
    textMuted: '#A08F83',
    textSubtle: '#7a6a60',
    textLight: '#b5a89a',
    border: '#EAE3DB',
    borderLight: '#e8e0d5',
    bg: '#F9F7F2',
    bgWhite: '#FFFFFF',
    panelDark: '#1a1008',
};

export const FONTS = {
    sans: '"Montserrat", sans-serif',
    serif: '"Playfair Display", serif',
};

/** Styles injected via <style> for things CSS-in-JS can't reach (::placeholder, overrides) */
export const LOGIN_GLOBAL_STYLES = `
    @keyframes img-fade-in {
        from { opacity: 0; }
        to   { opacity: 0.72; }
    }
    .dot-pill {
        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                    background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;
