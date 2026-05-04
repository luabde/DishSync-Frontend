import { useEffect, useState, useRef, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./style.css";

import { API_BASE_URL } from "../../api/config";
import { ClientHomeFooter } from "../../components/client/ClientHomeFooter";
import { ClientHomeHeader } from "../../components/client/ClientHomeHeader";
import { RestaurantCard } from "../../components/client/RestaurantCard";
import { RestaurantsMap } from "../../components/client/RestaurantsMap";

// Recursos visuales de la landing.
// URL base de assets públicos servidos por backend.
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

  const slidingLineRef = useRef<HTMLDivElement>(null);
  const navEnlacesRef = useRef<HTMLDivElement>(null);

  // Carga inicial de restaurantes para cards y mapa (solo activos en UI).
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

  // Lógica de la línea horizontal cuando estas en una pagina en el nav
  useEffect(() => {
    // Referencias al contenedor de enlaces y a la línea que se mueve.
    const navEnlaces = navEnlacesRef.current;
    const slidingLine = slidingLineRef.current;
    if (!navEnlaces || !slidingLine) return;

    // Todos los <a> del menú para poder comparar href con el hash actual.
    const navLinks = navEnlaces.querySelectorAll("a");

    // Coloca la línea justo debajo del enlace recibido, ajustando left y width.
    function positionLine(link: HTMLElement) {
      const navRect = navEnlaces!.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      slidingLine!.style.left = (linkRect.left - navRect.left) + "px";
      slidingLine!.style.width = linkRect.width + "px";
    }

    // Al montar: detecta el hash actual y busca su enlace correspondiente.
    const hash = window.location.hash || "#inicio";
    let activeLink: HTMLElement | null = null;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href === hash || href === "/" + hash || (hash === "#inicio" && href === "/")) {
        activeLink = link as HTMLElement;
      }
    });

    if (!activeLink && navLinks.length > 0) activeLink = navLinks[0] as HTMLElement;

    if (activeLink) {
      // Delay corto para asegurar layout estable antes de calcular medidas.
      setTimeout(() => positionLine(activeLink!), 150);
    }

    // Cuando cambia el hash (scroll con anclas o click en menú), recoloca línea.
    const handleHashChange = () => {
      const newHash = window.location.hash || "#inicio";
      navLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (href === newHash || href === "/" + newHash || (newHash === "#inicio" && href === "/")) {
          positionLine(link as HTMLElement);
        }
      });
    };

    // También se reposiciona en resize para evitar desalineación en responsive.
    const handleResize = () => {
      const currentHash = window.location.hash || "#inicio";
      navLinks.forEach(l => {
        const href = l.getAttribute("href") || "";
        if (href === currentHash || href === "/" + currentHash || (currentHash === "#inicio" && href === "/")) positionLine(l as HTMLElement);
      });
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("resize", handleResize);

    return () => {
      // Limpieza de listeners para evitar fugas al desmontar.
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("resize", handleResize);
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
      setContactMessage({ type: "success", text: "Missatge enviat correctament. Us respondrem aviat." });
      setContactForm(INITIAL_CONTACT);
    } catch (error) {
      setContactMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No s'ha pogut enviar el missatge",
      });
    } finally {
      setIsSendingContact(false);
    }
  };



  return (
    <div className="client-home-wrapper">
      <ClientHomeHeader
        isMenuOpen={isMenuOpen}
        onToggleMenu={toggleMenu}
        onCloseMenu={closeMenu}
        navEnlacesRef={navEnlacesRef}
        slidingLineRef={slidingLineRef}
      />

      <section className="hero-section">
        <div className="hero-top">
          <div className="hero-photo photo-left">
            <div className="framed-media">
              <img src={herobImg} alt="Ambient de restaurant" />
            </div>
            <p className="photo-tag">TAULA 8 (CENTRE)</p>
          </div>
          <div className="hero-indicator">
            <div className="indicator-text-wrap">
              <span className="indicator-text">Reserva</span>
              <span className="indicator-text">la teva taula ja</span>
            </div>
            <svg className="indicator-arrow-svg" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Organic inverted curved arrow, straighter at the top */}
              <path d="M4 58C22 45 12 15 12 2M12 2L6 8M12 2L18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="hero-content-center">
          <h1>TRADICIÓ I <br /> AVANTGUARDA</h1>
          <a href="#restaurantes" className="boton-secundario">VEURE RESTAURANTS</a>
        </div>

        <div className="hero-bottom">
          <div className="rating-box">
            <span className="star-icon">★</span>
            <div className="rating-content">
              <span className="rating-score">4.7</span>
              <p className="rating-text">Valoració mitjana dels nostres clients</p>
            </div>
          </div>
          <div className="hero-photo photo-right">
            <div className="framed-media">
              <img src={ravioliImg} alt="Detall de menjar" />
            </div>
            <p className="photo-tag">NOU PLAT RAVIOLI (VALÈNCIA)</p>
          </div>
        </div>
      </section>

      <section id="nosotros" className="seccion-estandar">
        <div className="nosotros-container">
          <div className="nosotros-text-side">
            <h2 className="hero-title-style">LA NOSTRA ESSÈNCIA</h2>
            <p className="texto-destacado">Tradició i avantguarda es troben al cor de Barcelona.</p>
          </div>
          <div className="nosotros-image-side">
            <div className="framed-image-wrapper">
              <img src={nosotrosImg} alt="Interior del restaurant El Castell" />
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
                <img src={menuImg} alt="Plats del menú" />
              </div>
              <p className="photo-tag" style={{ marginTop: "15px", textAlign: "center" }}>LA NOSTRA SELECCIÓ DE PLATS</p>
            </div>
          </div>
          <div className="menu-promo-text-side">
            <h2 className="hero-title-style">EL NOSTRE MENÚ</h2>
            <p className="texto-destacado">Descobriu una proposta gastronòmica que respecta el producte i celebra la creativitat.</p>
            <Link to="/menu" className="boton-primario">VEURE EL NOSTRE MENÚ</Link>
          </div>
        </div>
      </section>

      <section id="restaurantes" className="seccion-estandar" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="elegant-centered" style={{ marginBottom: "40px" }}>
            <h2 className="hero-title-style">RESTAURANTS</h2>
            <p className="texto-destacado">Descobriu les nostres ubicacions al cor de Barcelona.</p>
          </div>
          {/* Estado de carga/error simple para mantener la misma estética de la página. */}
          <div className="restaurants-grid-row" id="restaurants-container">
            {isLoadingRestaurants ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--wine-red)", opacity: 0.6 }}>Carregant restaurants...</p>
            ) : restaurants.length === 0 ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--wine-red)", opacity: 0.6 }}>No s'han pogut carregar els restaurants en aquest moment.</p>
            ) : (
              restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))
            )}
          </div>
        </div>
      </section>

      <section id="encuentranos" className="seccion-estandar" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="elegant-centered" style={{ marginBottom: "40px" }}>
            <h2 className="hero-title-style">TROBA'NS</h2>
            <p className="texto-destacado">Estem molt a prop teu.</p>
          </div>
          <div className="full-width-map-container">
            {/* Usamos el componente compartido de mapa para centralizar el comportamiento Leaflet. */}
            {restaurants.length > 0 ? (
              <RestaurantsMap restaurants={restaurants} />
            ) : (
              <div className="flex h-[430px] items-center justify-center bg-ds-surface">
                <p className="text-sm text-ds-ui-muted">No hi ha coordenades disponibles per mostrar al mapa.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="contacto" className="seccion-estandar" style={{ paddingTop: "100px", paddingBottom: "100px" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="contact-split-layout">
            <div className="contact-info-side">
              <h2 className="hero-title-style" style={{ textAlign: "left" }}>CONTACTE</h2>
              <p className="texto-destacado" style={{ margin: "0 0 40px 0", textAlign: "left" }}>Teniu algun dubte o petició especial? Escriviu-nos.</p>

              <div className="contact-details-list" style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "flex-start" }}>
                <div className="contact-detail-item" style={{ textAlign: "left" }}>
                  <h3 style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", letterSpacing: "2px", color: "var(--wine-red)", opacity: 0.6, marginBottom: "10px" }}>TELÈFON</h3>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "0.02em", color: "rgba(74, 14, 14, 0.82)" }}>+34 932 456 789</p>
                </div>
                <div className="contact-detail-item" style={{ textAlign: "left" }}>
                  <h3 style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", letterSpacing: "2px", color: "var(--wine-red)", opacity: 0.6, marginBottom: "10px" }}>EMAIL</h3>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "0.02em", color: "rgba(74, 14, 14, 0.82)" }}>reserves@elcastell.com</p>
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
                          placeholder="NOM"
                          required
                          value={contactForm.nom}
                          onChange={(e) => handleContactChange("nom", e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1, textAlign: "left" }}>
                        <input
                          type="text"
                          id="cognoms"
                          placeholder="COGNOMS"
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
                          placeholder="ELVOSTRE@EMAIL.COM"
                          required
                          value={contactForm.email}
                          onChange={(e) => handleContactChange("email", e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1, textAlign: "left" }}>
                        <input
                          type="tel"
                          id="telefon"
                          placeholder="TELÈFON"
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
                        placeholder="EN QUÈ US PODEM AJUDAR?"
                        value={contactForm.missatge}
                        onChange={(e) => handleContactChange("missatge", e.target.value)}
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      id="submit-contact"
                      className="boton-primario"
                      style={{ width: "100%" }}
                      disabled={isSendingContact}
                    >
                      {isSendingContact ? "ENVIANT..." : "ENVIAR MISSATGE"}
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

      <ClientHomeFooter />
    </div>
  );
}
