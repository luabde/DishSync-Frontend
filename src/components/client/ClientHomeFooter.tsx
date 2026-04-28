export function ClientHomeFooter() {
  return (
    <footer className="footer-editorial">
      <div className="footer-grid-container desktop-footer">
        <div className="footer-brand-col">
          <span className="footer-logo-large">El Castell</span>
          <p className="footer-tagline">Redefiniendo el lujo gastronómico a través de la esencia de los ingredientes y la vanguardia culinaria.</p>
        </div>

        <div className="footer-nav-col">
          <a href="#inicio">INICIO</a>
          <a href="#menu">MENU</a>
          <a href="#restaurantes">RESTAURANTES</a>
          <a href="#encuentranos">ENCUÉNTRANOS</a>
          <a href="#contacto">CONTACTO</a>
        </div>

        <div className="footer-contact-col">
          <span>+34 932 456 789</span>
          <span>reservas@elcastell.com</span>
          <span>Barcelona, España</span>
        </div>
      </div>

      <div className="footer-bottom-desktop container-desktop-only">
        <div className="footer-copy-desktop">© 2026 Restaurante El Castell. Todos los derechos reservados.</div>
        <div className="footer-legal-desktop">
          <a href="#">Privacidad | Términos de Uso</a>
        </div>
      </div>

      <div className="footer-content-centered mobile-footer">
        <span className="footer-logo-large">El Castell</span>
        <p className="footer-tagline">Redefiniendo el lujo gastronómico a través de la esencia de los ingredientes y la vanguardia culinaria.</p>

        <nav className="footer-nav-row-mobile">
          <a href="#contacto">CONTACTO</a>
          <a href="#menu">MENU</a>
          <a href="#restaurantes">RESTAURANTES</a>
          <a href="#contacto">CONTACTO</a>
          <a href="#contacto">RESERVAR</a>
        </nav>

        <div className="footer-contact-row-mobile">
          <span>+34 932 456 789</span>
          <span>reservas@elcastell.com</span>
          <span>Barcelona, España</span>
        </div>
      </div>
    </footer>
  );
}
