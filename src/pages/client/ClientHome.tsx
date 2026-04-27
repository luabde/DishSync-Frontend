import { useEffect, useState, useRef, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

import { API_BASE_URL } from "../../api/config";

// Import assets
// Base URL for landing assets from backend
const ASSETS_BASE_URL = API_BASE_URL.replace("/api", "/public/landing");

const herobImg = `${ASSETS_BASE_URL}/herob.jpg`;
const ravioliImg = `${ASSETS_BASE_URL}/ravioli.png`;
const nosotrosImg = `${ASSETS_BASE_URL}/nosotros.png`;
const menuImg = `${ASSETS_BASE_URL}/menu.jpg`;

import { publicClientApi, type ContactPayload, type RestaurantLocationDTO } from "../../api/publicClient.api";

const INITIAL_CONTACT: ContactPayload = {
  nom: "",
  cognoms: "",
  email: "",
  telefon: "",
  missatge: "",
};

export default function ClientHome() {
  const [restaurants, setRestaurants] = useState<RestaurantLocationDTO[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactPayload>(INITIAL_CONTACT);
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [contactMessage, setContactMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const mapRef = useRef<any>(null); // Using any temporarily while types settle
  const slidingLineRef = useRef<HTMLDivElement>(null);
  const navEnlacesRef = useRef<HTMLDivElement>(null);

  // Load restaurants
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await publicClientApi.getRestaurantLocations();
        setRestaurants(data.filter(r => r.estat !== 'INACTIU'));
      } catch (error) {
        console.error("Error loading restaurants:", error);
      } finally {
        setIsLoadingRestaurants(false);
      }
    };
    loadRestaurants();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current && restaurants.length > 0) {
      const map = L.map("map").setView([41.393, 2.165], 13);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      restaurants.forEach((r) => {
        if (r.lat && r.lng) {
          L.marker([r.lat, r.lng])
            .addTo(map)
            .bindPopup(`
              <div style="text-align: center; font-family: 'Montserrat', sans-serif;">
                <b style="font-family: 'Playfair Display', serif; font-size: 1.1em; color: #4A0E0E;">${r.nom}</b><br>
                <span style="font-size: 0.85em; color: #666;">${r.direccio}</span><br>
                <span style="font-size: 0.8em; color: #5F6D43; font-weight: 600; display: block; margin: 5px 0;">ABIERTO</span>
                <a href="#contacto" style="display: inline-block; margin-top: 5px; color: #4A0E0E; text-decoration: none; font-weight: 700; font-size: 0.8em; border-bottom: 1px solid #4A0E0E;">CONTACTAR</a>
              </div>
            `);
        }
      });
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [restaurants]);

  // Sliding Line Logic
  useEffect(() => {
    const navEnlaces = navEnlacesRef.current;
    const slidingLine = slidingLineRef.current;
    if (!navEnlaces || !slidingLine) return;

    const navLinks = navEnlaces.querySelectorAll("a");

    function positionLine(link: HTMLElement) {
      const navRect = navEnlaces!.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      slidingLine!.style.left = (linkRect.left - navRect.left) + "px";
      slidingLine!.style.width = linkRect.width + "px";
    }

    const hash = window.location.hash || "#inicio";
    let activeLink: HTMLElement | null = null;

    navLinks.forEach((link) => {
      if (link.getAttribute("href") === hash) {
        activeLink = link as HTMLElement;
      }
    });

    if (!activeLink && navLinks.length > 0) activeLink = navLinks[0] as HTMLElement;

    if (activeLink) {
      setTimeout(() => positionLine(activeLink!), 150);
    }

    const handleHashChange = () => {
      const newHash = window.location.hash || "#inicio";
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === newHash) {
          positionLine(link as HTMLElement);
        }
      });
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("resize", () => {
      const currentHash = window.location.hash || "#inicio";
      navLinks.forEach(l => {
        if (l.getAttribute("href") === currentHash) positionLine(l as HTMLElement);
      });
    });

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.classList.add("menu-abierto");
    } else {
      document.body.classList.remove("menu-abierto");
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove("menu-abierto");
  };

  const handleContactChange = (field: keyof ContactPayload, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmitContact = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSendingContact(true);
    setContactMessage(null);

    try {
      await publicClientApi.sendContactForm(contactForm);
      setContactMessage({ type: "success", text: "Mensaje enviado correctamente. Te responderemos pronto." });
      setContactForm(INITIAL_CONTACT);
    } catch (error) {
      setContactMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo enviar el mensaje",
      });
    } finally {
      setIsSendingContact(false);
    }
  };



  return (
    <div className="client-home-wrapper">
      <header id="inicio">
        <nav className="nav-principal">
          <div
            className={`menu-hamburguesa ${isMenuOpen ? "active" : ""}`}
            id="menu-toggle"
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <a className="ElCastell" href="#inicio">El Castell</a>

          <div className={`nav-contenedor-movil ${isMenuOpen ? "active" : ""}`} id="nav-menu">
            {/* Close Button inside the overlay */}
            <button className="btn-cerrar-menu" onClick={closeMenu}>×</button>

            <div className="nav-enlaces" ref={navEnlacesRef}>
              <a href="#inicio" onClick={closeMenu}>INICIO</a>
              <a href="#menu" onClick={closeMenu}>MENÚ</a>
              <a href="#restaurantes" onClick={closeMenu}>RESTAURANTES</a>
              <a href="#encuentranos" onClick={closeMenu}>ENCUÉNTRANOS</a>
              <a href="#contacto" onClick={closeMenu}>CONTACTO</a>
              <div className="nav-sliding-line" ref={slidingLineRef}></div>
            </div>

            <div className="menu-mobile-footer">
              <a href="#contacto" className="boton-primario" onClick={closeMenu}>RESERVAR MESA</a>
            </div>
          </div>

          <a href="#contacto" className="boton-primario header-reserve-btn" onClick={closeMenu}>RESERVAR MESA</a>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-top">
          <div className="hero-photo photo-left">
            <div className="framed-media">
              <img src={herobImg} alt="Ambiente de restaurante" />
            </div>
            <p className="photo-tag">MESA 8 (CENTRO)</p>
          </div>
          <div className="hero-indicator">
            <div className="indicator-text-wrap">
              <span className="indicator-text">RESERVA</span>
              <span className="indicator-text">TU MESA YA</span>
            </div>
            <svg className="indicator-arrow-svg" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 60L12 2M12 2L4 10M12 2L20 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="hero-content-center">
          <h1>SABOREA LA <br /> EXCELENCIA</h1>
          <a href="#restaurantes" className="boton-secundario">VER RESTAURANTES</a>
        </div>

        <div className="hero-bottom">
          <div className="rating-box">
            <span className="star-icon">★</span>
            <div className="rating-content">
              <span className="rating-score">4.7</span>
              <p className="rating-text">Valoración media de nuestros clientes</p>
            </div>
          </div>
          <div className="hero-photo photo-right">
            <div className="framed-media">
              <img src={ravioliImg} alt="Detalle de comida" />
            </div>
            <p className="photo-tag">NUEVO PLATO RAVIOLI (VALENCIA)</p>
          </div>
        </div>
      </section>

      <section id="nosotros" className="seccion-estandar">
        <div className="nosotros-container">
          <div className="nosotros-text-side">
            <h2 className="hero-title-style">NUESTRA ESENCIA</h2>
            <p className="texto-destacado">Tradición y vanguardia se encuentran en el corazón de Barcelona.</p>
          </div>
          <div className="nosotros-image-side">
            <div className="framed-image-wrapper">
              <img src={nosotrosImg} alt="Interior del restaurante El Castell" />
            </div>
            <p className="photo-tag">SALA PRINCIPAL (SARRIÀ)</p>
          </div>
        </div>
      </section>

      <section id="menu" className="menu-promo-section">
        <div className="menu-promo-container">
          <div className="menu-promo-image-side">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="arch-image-wrapper">
                <img src={menuImg} alt="Platos del menú" />
              </div>
              <p className="photo-tag" style={{ marginTop: "15px", textAlign: "center" }}>NUESTRA SELECCIÓN DE PLATOS</p>
            </div>
          </div>
          <div className="menu-promo-text-side">
            <h2 className="hero-title-style">NUESTRO MENÚ</h2>
            <p className="texto-destacado">Descubre una propuesta gastronómica que respeta el producto y celebra la creatividad.</p>
            <Link to="/menu" className="boton-primario">VER NUESTRO MENÚ</Link>
          </div>
        </div>
      </section>

      <section id="restaurantes" className="seccion-estandar" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="elegant-centered" style={{ marginBottom: "40px" }}>
            <h2 className="hero-title-style">RESTAURANTES</h2>
            <p className="texto-destacado">Descubre nuestras ubicaciones en el corazón de Barcelona.</p>
          </div>
          <div className="restaurants-grid-row" id="restaurants-container">
            {isLoadingRestaurants ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--wine-red)", opacity: 0.6 }}>Cargando restaurantes...</p>
            ) : restaurants.length === 0 ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--wine-red)", opacity: 0.6 }}>No se pudieron cargar los restaurantes en este momento.</p>
            ) : (
              restaurants.map((r) => (
                <article key={r.id} className="flex flex-col overflow-hidden rounded-2xl border border-ds-card-border bg-ds-bg-elevated shadow-ds-card transition-all hover:shadow-ds-card-hover">
                  {/* Area de Imagen / Placeholder */}
                  <div className="relative h-48 shrink-0 overflow-hidden bg-[#F5F5F5] flex items-center justify-center">
                    <span className="text-[14px] font-bold uppercase tracking-[2px] text-[#7A8C99]">
                      Sense Imatge
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-ds-wine-40">
                      {r.direccio}
                    </p>
                    <h3 className="mt-1 font-ds-sans text-[18px] font-black uppercase tracking-tight text-ds-brand-wine">
                      {r.nom}
                    </h3>

                    <div className="mt-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white ${(r.estat === 'ACTIU' || !r.estat) ? 'bg-[#5B6D43]' : 'bg-[#6F1D1B]'}`}>
                        {r.estat || 'ACTIU'}
                      </span>
                    </div>

                    <div className="mt-6 flex flex-1 flex-col justify-between border-t border-ds-row-divider pt-6 text-left">
                      <div className="flex flex-col gap-1 font-ds-sans text-sm text-ds-brand-wine/80">
                        <p className="font-bold uppercase tracking-wider text-[10px] text-ds-wine-40">Horari</p>
                        <p className="italic font-medium">Lun - Dom: 13:00 - 24:00</p>
                      </div>

                      <a href="#contacto" className="mt-6 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[2px] text-ds-brand-wine transition-opacity hover:opacity-70">
                        CONTACTAR
                        <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "25px", height: "10px" }}>
                          <path d="M0 12H58M58 12L50 4M58 12L50 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section id="encuentranos" className="seccion-estandar" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="elegant-centered" style={{ marginBottom: "40px" }}>
            <h2 className="hero-title-style">ENCUÉNTRANOS</h2>
            <p className="texto-destacado">Estamos muy cerca de ti.</p>
          </div>
          <div className="full-width-map-container">
            <div id="map"></div>
          </div>
        </div>
      </section>

      <section id="contacto" className="seccion-estandar" style={{ paddingTop: "100px", paddingBottom: "100px" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="contact-split-layout">
            <div className="contact-info-side">
              <h2 className="hero-title-style" style={{ textAlign: "left" }}>CONTACTO</h2>
              <p className="texto-destacado" style={{ margin: "0 0 40px 0", textAlign: "left" }}>¿Tienes alguna duda o petición especial? Escríbenos.</p>

              <div className="contact-details-list" style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "flex-start" }}>
                <div className="contact-detail-item" style={{ textAlign: "left" }}>
                  <h3 style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", letterSpacing: "2px", color: "var(--wine-red)", opacity: 0.6, marginBottom: "10px" }}>TELÉFONO</h3>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 700 }}>+34 932 456 789</p>
                </div>
                <div className="contact-detail-item" style={{ textAlign: "left" }}>
                  <h3 style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", letterSpacing: "2px", color: "var(--wine-red)", opacity: 0.6, marginBottom: "10px" }}>EMAIL</h3>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 700 }}>reservas@elcastell.com</p>
                </div>
              </div>
            </div>

            <div className="contact-form-side">
              <div className="zigzag-wrapper" style={{ margin: 0 }}>
                <div className="zigzag-form-container">
                  <form className="formulario-contacto" id="contact-form" onSubmit={onSubmitContact}>
                    <div className="form-row" style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
                      <div className="form-group" style={{ flex: 1, textAlign: "left" }}>
                        <input
                          type="text"
                          id="nom"
                          placeholder="NOMBRE"
                          required
                          value={contactForm.nom}
                          onChange={(e) => handleContactChange("nom", e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1, textAlign: "left" }}>
                        <input
                          type="text"
                          id="cognoms"
                          placeholder="APELLIDOS"
                          required
                          value={contactForm.cognoms}
                          onChange={(e) => handleContactChange("cognoms", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-row" style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
                      <div className="form-group" style={{ flex: 1, textAlign: "left" }}>
                        <input
                          type="email"
                          id="email"
                          placeholder="TU@EMAIL.COM"
                          required
                          value={contactForm.email}
                          onChange={(e) => handleContactChange("email", e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1, textAlign: "left" }}>
                        <input
                          type="tel"
                          id="telefon"
                          placeholder="TELÉFONO"
                          required
                          value={contactForm.telefon}
                          onChange={(e) => handleContactChange("telefon", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: "40px", textAlign: "left" }}>
                      <textarea
                        id="missatge"
                        rows={4}
                        placeholder="¿EN QUÉ PODEMOS AYUDARTE?"
                        value={contactForm.missatge}
                        onChange={(e) => handleContactChange("missatge", e.target.value)}
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      id="submit-contact"
                      className="boton-primario"
                      style={{ width: "100%", padding: "20px" }}
                      disabled={isSendingContact}
                    >
                      {isSendingContact ? "ENVIANDO..." : "ENVIAR MENSAJE"}
                    </button>
                    {contactMessage && (
                      <p id="contact-response-message" style={{
                        marginTop: "20px",
                        textAlign: "center",
                        display: "block",
                        color: contactMessage.type === "success" ? "#2d5a2d" : "#4A0E0E"
                      }}>
                        {contactMessage.text}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
    </div>
  );
}
