import type { RefObject } from "react";

type ClientHomeHeaderProps = {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  navEnlacesRef: RefObject<HTMLDivElement | null>;
  slidingLineRef: RefObject<HTMLDivElement | null>;
};

export function ClientHomeHeader({
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  navEnlacesRef,
  slidingLineRef,
}: ClientHomeHeaderProps) {
  return (
    <header id="inicio">
      <nav className="nav-principal">
        <div
          className={`menu-hamburguesa ${isMenuOpen ? "active" : ""}`}
          id="menu-toggle"
          onClick={onToggleMenu}
        >
          <svg viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect className="line line-1" x="0" y="4" width="32" height="2" rx="1" fill="currentColor"/>
            <rect className="line line-2" x="0" y="11" width="32" height="2" rx="1" fill="currentColor"/>
            <rect className="line line-3" x="0" y="18" width="32" height="2" rx="1" fill="currentColor"/>
          </svg>
        </div>

        <a className="ElCastell" href="/">El Castell</a>

        <div className={`nav-contenedor-movil ${isMenuOpen ? "active" : ""}`} id="nav-menu">
          {/* Botón de cierre dentro del menú móvil */}
          <button className="btn-cerrar-menu" onClick={onCloseMenu}>×</button>

          <div className="nav-enlaces" ref={navEnlacesRef}>
            <a href="/#inicio" onClick={onCloseMenu}>INICI</a>
            <a href="/#menu" onClick={onCloseMenu}>MENÚ</a>
            <a href="/#restaurantes" onClick={onCloseMenu}>RESTAURANTS</a>
            <a href="/#encuentranos" onClick={onCloseMenu}>TROBA'NS</a>
            <a href="/#contacto" onClick={onCloseMenu}>CONTACTE</a>
            <div className="nav-sliding-line" ref={slidingLineRef}></div>
          </div>

          <div className="menu-mobile-footer">
            <a href="/#restaurantes" className="boton-primario" onClick={onCloseMenu}>RESERVAR TAULA</a>
          </div>
        </div>

        <a href="/#restaurantes" className="header-reserve-btn" onClick={onCloseMenu}>
          <span className="reserve-desktop">RESERVAR TAULA</span>
          <span className="reserve-mobile">RESERVA</span>
        </a>
      </nav>
    </header>
  );
}
