import { useEffect, useRef, useState } from "react";
import {
  type PlatCategoryDTO,
  type RestaurantMenuDTO,
  platsApi,
  resolvePlatImageUrl,
} from "../../api/plats.api";
import { ClientHomeFooter } from "../../components/client/ClientHomeFooter";
import { ClientHomeHeader } from "../../components/client/ClientHomeHeader";
import "./style.css";

export default function MenuPage() {
  const [categories, setCategories] = useState<PlatCategoryDTO[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantMenuDTO[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slidingLineRef = useRef<HTMLDivElement>(null);
  const navEnlacesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, restaurantsData] = await Promise.all([
          platsApi.getCategories(),
          platsApi.getRestaurantsMenu(),
        ]);

        setCategories(categoriesData);
        setRestaurants(restaurantsData);

        // Por defecto dejamos seleccionado el primer restaurante para mostrar su carta.
        setSelectedRestaurantId(restaurantsData[0]?.id ?? null);
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

  // Lógica de la línea horizontal cuando estas en una pagina en el nav
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

    // Al estar en /menu, buscamos el enlace que apunta a /#menu
    let activeLink: HTMLElement | null = null;
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href === "/#menu" || href === "#menu") {
        activeLink = link as HTMLElement;
      }
    });

    if (activeLink) {
      setTimeout(() => positionLine(activeLink!), 150);
    }

    const handleResize = () => {
      if (activeLink) positionLine(activeLink);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove("menu-abierto");
  };

  // Definir orden manual de categorías
  const categoryOrder = ["BEGUDES", "ENTRANTS", "PRINCIPALS", "POSTRES"];

  const selectedRestaurant =
    restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null;
  const selectedRestaurantPlats = selectedRestaurant?.plats ?? [];

  // Group dishes by category and SORT them
  const groupedMenu = categories
    .map(cat => ({
      ...cat,
      items: selectedRestaurantPlats.filter(p => p.id_categoria === cat.id)
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
      <ClientHomeHeader
        isMenuOpen={isMenuOpen}
        onToggleMenu={toggleMenu}
        onCloseMenu={closeMenu}
        navEnlacesRef={navEnlacesRef}
        slidingLineRef={slidingLineRef}
      />

      <section className="menu-hero-section-simple">
        <h1 className="hero-title-style">LA NOSTRA CARTA</h1>
        
        <div className="restaurant-selector-container mt-[18px] mb-7 md:mt-[30px] md:mb-[60px]">
          <p className="texto-destacado mb-[15px] text-(length:--text-ds-body-sm) leading-(--text-ds-body-sm--line-height) opacity-80 md:text-[0.9rem] md:leading-normal">
            Trieu un restaurant per veure la disponibilitat:
          </p>
          <div className="restaurant-tabs flex flex-nowrap justify-start gap-[15px] overflow-x-auto pb-2 md:flex-wrap md:justify-center md:overflow-visible md:pb-0">
            {restaurants.map((rest) => {
              const isSelected = selectedRestaurantId === rest.id;

              return (
              <button
                key={rest.id}
                className={`boton-secundario cursor-pointer border border-(--wine-red) px-[14px] py-2 text-(length:--text-ds-body-sm) leading-(--text-ds-body-sm--line-height) tracking-[1px] whitespace-nowrap md:flex-none md:px-[25px] md:py-[10px] md:text-[0.9rem] md:leading-normal md:tracking-[2px] ${
                  isSelected ? "text-white" : "text-(--wine-red)"
                }`}
                onClick={() => setSelectedRestaurantId(rest.id)}
                aria-pressed={isSelected}
                style={
                  isSelected
                    ? { backgroundColor: "var(--wine-red)", color: "white" }
                    : undefined
                }
              >
                {rest.nom}
              </button>
              );
            })}
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
                TOTES
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
              <p className="texto-destacado">Carregant la nostra selecció...</p>
            </div>
          ) : groupedMenu.length === 0 ? (
            <div className="empty-state">
              <p className="texto-destacado">Estem actualitzant la nostra carta. Torneu aviat.</p>
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
                        <div
                          key={item.id}
                          className="menu-item-paper"
                          style={{
                            opacity: item.disponibilitat ? 1 : 0.55,
                            filter: item.disponibilitat ? "none" : "grayscale(0.4)",
                          }}
                        >
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
                            
                            <div className="item-details-row flex flex-col items-start gap-2 md:flex-row md:justify-between md:gap-5">
                              {item.descripcio && <p className="item-desc-paper">{item.descripcio}</p>}
                              <p
                                className="item-desc-paper mt-[2px] self-start text-left whitespace-nowrap flex-none md:ml-auto md:self-end md:text-right"
                                style={{
                                  opacity: item.disponibilitat ? 1 : 0.35,
                                }}
                              >
                                {item.disponibilitat ? "Disponible" : "No disponible"}
                              </p>
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

      <ClientHomeFooter />
    </div>
  );
}
