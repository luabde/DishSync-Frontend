import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type PlatListItemDTO, type PlatCategoryDTO, platsApi, resolvePlatImageUrl } from "../../api/plats.api";
import { publicClientApi, type RestaurantLocationDTO } from "../../api/publicClient.api";
import "./style.css";

export default function MenuPage() {
  const [plats, setPlats] = useState<PlatListItemDTO[]>([]);
  const [categories, setCategories] = useState<PlatCategoryDTO[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantLocationDTO[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [platsData, categoriesData, restaurantsData] = await Promise.all([
          platsApi.getPlats(),
          platsApi.getCategories(),
          publicClientApi.getRestaurantLocations()
        ]);
        
        setPlats(platsData);
        setCategories(categoriesData);
        setRestaurants(restaurantsData);
        
        // No seleccionamos ninguno por defecto para que no salga el badge de disponibilidad hasta que elijan uno
        setSelectedRestaurantId(null);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
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

  // Definir orden manual de categorías
  const categoryOrder = ["BEGUDES", "ENTRANTS", "PRINCIPALS", "POSTRES"];

  // Group dishes by category and SORT them
  const groupedMenu = categories
    .map(cat => ({
      ...cat,
      items: plats.filter(p => p.id_categoria === cat.id)
    }))
    .filter(group => group.items.length > 0)
    .sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.nom.toUpperCase());
      const indexB = categoryOrder.indexOf(b.nom.toUpperCase());
      if (indexA === -1 && indexB === -1) return a.nom.localeCompare(b.nom);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  return (
    <div className="client-home-wrapper menu-page-wrapper">
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

          <Link className="ElCastell" to="/">El Castell</Link>

          <div className={`nav-contenedor-movil ${isMenuOpen ? "active" : ""}`} id="nav-menu">
            <button className="btn-cerrar-menu" onClick={closeMenu}>×</button>

            <div className="nav-enlaces">
              <a href="/" onClick={closeMenu}>INICIO</a>
              <a href="/#menu" onClick={closeMenu}>MENÚ</a>
              <a href="/#restaurantes" onClick={closeMenu}>RESTAURANTES</a>
              <a href="/#encuentranos" onClick={closeMenu}>ENCUÉNTRANOS</a>
              <a href="/#contacto" onClick={closeMenu}>CONTACTO</a>
              <div className="nav-sliding-line"></div>
            </div>

            <div className="menu-mobile-footer">
              <a href="/#contacto" className="boton-primario">RESERVAR MESA</a>
            </div>
          </div>

          <a href="/#contacto" className="boton-primario header-reserve-btn">RESERVAR MESA</a>
        </nav>
      </header>

      <section className="menu-hero-section-simple">
        <h1 className="hero-title-style">NUESTRA CARTA</h1>
        
        <div className="restaurant-selector-container" style={{ marginTop: '30px' }}>
          <p className="texto-destacado" style={{ fontSize: '0.9rem', marginBottom: '15px', opacity: 0.8 }}>Elija un restaurante para ver la disponibilidad:</p>
          <div className="restaurant-tabs" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {restaurants.map((rest) => (
              <button
                key={rest.id}
                className={`boton-secundario ${selectedRestaurantId === rest.id ? 'active' : ''}`}
                onClick={() => setSelectedRestaurantId(prev => prev === rest.id ? null : rest.id)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '10px 25px',
                  backgroundColor: selectedRestaurantId === rest.id ? 'var(--wine-red)' : 'transparent',
                  color: selectedRestaurantId === rest.id ? 'var(--soft-cream)' : 'var(--wine-red)',
                  border: '1px solid var(--wine-red)',
                  transition: 'all 0.3s ease',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}
              >
                {rest.nom}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="menu-paper-section">
        <div className="menu-paper-container">
          {/* Agenda Style Tabs */}
          {!isLoading && groupedMenu.length > 0 && (
            <div className="agenda-tabs-container">
              <button
                className={`agenda-tab ${selectedCategoryId === null ? 'active' : ''}`}
                onClick={() => setSelectedCategoryId(null)}
              >
                TODAS
              </button>
              {groupedMenu.map((group) => (
                <button
                  key={group.id}
                  className={`agenda-tab ${selectedCategoryId === group.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryId(group.id)}
                >
                  {group.nom}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="loading-state">
              <p className="texto-destacado">Cargando nuestra selección...</p>
            </div>
          ) : groupedMenu.length === 0 ? (
            <div className="empty-state">
              <p className="texto-destacado">Estamos actualizando nuestra carta. Vuelve pronto.</p>
            </div>
          ) : (
            <div className="menu-paper-content">
              {groupedMenu
                .filter(group => !selectedCategoryId || group.id === selectedCategoryId)
                .map((group) => (
                <div key={group.id} className="menu-category-paper animated-category-fade" id={`category-${group.id}`}>
                  <div className="category-header-paper">
                    <h2 className="category-title-paper">{group.nom}</h2>
                  </div>

                  <div className="menu-items-vertical">
                    {group.items.map((item) => {
                      return (
                        <div key={item.id} className="menu-item-paper">
                          <div className="item-image-paper">
                            {item.url ? (
                              <img 
                                src={resolvePlatImageUrl(item.url)} 
                                alt={item.nom} 
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                            ) : (
                              <div className="image-placeholder"></div>
                            )}
                          </div>
                          <div className="item-info-paper">
                            <div className="item-header-row">
                              <h3 className="item-name-paper">{item.nom}</h3>
                              <span className="item-price-paper">{item.preu}€</span>
                            </div>
                            
                            <div className="item-paper-divider"></div>
                            
                            <div className="item-details-row">
                              {item.descripcio && <p className="item-desc-paper">{item.descripcio}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="footer-editorial">
        <div className="footer-grid-container desktop-footer">
          <div className="footer-brand-col">
            <span className="footer-logo-large">El Castell</span>
            <p className="footer-tagline">Redefiniendo el lujo gastronómico a través de la esencia de los ingredientes y la vanguardia culinaria.</p>
          </div>

          <div className="footer-nav-col">
            <Link to="/">INICIO</Link>
            <Link to="/menu">MENU</Link>
            <a href="/#restaurantes">RESTAURANTES</a>
            <a href="/#encuentranos">ENCUÉNTRANOS</a>
            <a href="/#contacto">CONTACTO</a>
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
            <Link to="/menu">MENU</Link>
            <a href="/#restaurantes">RESTAURANTES</a>
            <a href="/#contacto">CONTACTO</a>
            <a href="/#contacto">RESERVAR</a>
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
