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
          <span></span>
          <span></span>
          <span></span>
        </div>

        <a className="ElCastell" href="#inicio">El Castell</a>

        <div className={`nav-contenedor-movil ${isMenuOpen ? "active" : ""}`} id="nav-menu">
          {/* Botón de cierre dentro del menú móvil */}
          <button className="btn-cerrar-menu" onClick={onCloseMenu}>×</button>

          <div className="nav-enlaces" ref={navEnlacesRef}>
            <a href="#inicio" onClick={onCloseMenu}>INICIO</a>
            <a href="#menu" onClick={onCloseMenu}>MENÚ</a>
            <a href="#restaurantes" onClick={onCloseMenu}>RESTAURANTES</a>
            <a href="#encuentranos" onClick={onCloseMenu}>ENCUÉNTRANOS</a>
            <a href="#contacto" onClick={onCloseMenu}>CONTACTO</a>
            <div className="nav-sliding-line" ref={slidingLineRef}></div>
          </div>

          <div className="menu-mobile-footer">
            <a href="#restaurantes" className="boton-primario" onClick={onCloseMenu}>RESERVAR MESA</a>
          </div>
        </div>

        <a href="#restaurantes" className="boton-primario header-reserve-btn" onClick={onCloseMenu}>RESERVAR MESA</a>
      </nav>
    </header>
  );
}
