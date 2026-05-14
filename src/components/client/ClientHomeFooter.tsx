export function ClientHomeFooter() {
  return (
    <footer className="footer-editorial">
      <div className="footer-grid-container desktop-footer">
        <div className="footer-brand-col">
          <span className="footer-logo-large">El Castell</span>
          <p className="footer-tagline">Redefinint el luxe gastronòmic a través de l'essència dels ingredients i l'avantguarda culinària.</p>
        </div>

        <div className="footer-nav-col">
          <a href="#inicio">INICI</a>
          <a href="#menu">MENÚ</a>
          <a href="#restaurantes">RESTAURANTS</a>
          <a href="#encuentranos">TROBA'NS</a>
          <a href="#contacto">CONTACTE</a>
        </div>

        <div className="footer-contact-col">
          <span>+34 932 456 789</span>
          <span>reserves@elcastell.com</span>
          <span>Barcelona, Espanya</span>
        </div>
      </div>

      <div className="footer-bottom-desktop container-desktop-only">
        <div className="footer-copy-desktop">© 2026 Restaurant El Castell. Tots els drets reservats.</div>
      </div>

      <div className="footer-content-centered mobile-footer">
        <span className="footer-logo-large">El Castell</span>
        <p className="footer-tagline">Redefinint el luxe gastronòmic a través de l'essència dels ingredients i l'avantguarda culinària.</p>

        <nav className="footer-nav-row-mobile">
          <a href="#contacto">CONTACTE</a>
          <a href="#menu">MENÚ</a>
          <a href="#restaurantes">RESTAURANTS</a>
          <a href="#contacto">RESERVAR</a>
        </nav>

        <div className="footer-contact-row-mobile">
          <span>+34 932 456 789</span>
          <span>reserves@elcastell.com</span>
          <span>Barcelona, Espanya</span>
        </div>
      </div>
    </footer>
  );
}
