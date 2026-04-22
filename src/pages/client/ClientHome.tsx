import { type SyntheticEvent, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { publicClientApi, type ContactPayload, type RestaurantLocationDTO } from "../../api/publicClient.api";
import { ImagePlaceholder } from "../../components/client/ImagePlaceholder";
import { RestaurantCard } from "../../components/client/RestaurantCard";
import { RestaurantsMap } from "../../components/client/RestaurantsMap";
import { SectionHeader } from "../../components/client/SectionHeader";

const INITIAL_CONTACT: ContactPayload = {
  nom: "",
  cognoms: "",
  email: "",
  telefon: "",
  missatge: "",
};

export default function ClientHome() {
  // Estado de restaurantes para cards + mapa.
  const [restaurants, setRestaurants] = useState<RestaurantLocationDTO[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [restaurantsError, setRestaurantsError] = useState<string | null>(null);

  // Estado del formulario de contacto.
  const [contactForm, setContactForm] = useState<ContactPayload>(INITIAL_CONTACT);
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [contactMessage, setContactMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Cuando se recarga la página, se cargan los restaurantes.
    const loadRestaurants = async () => {
      setIsLoadingRestaurants(true);
      setRestaurantsError(null);
      try {
        const data = await publicClientApi.getRestaurantLocations();
        setRestaurants(data);
      } catch (error) {
        setRestaurantsError(error instanceof Error ? error.message : "Error al cargar restaurantes");
      } finally {
        setIsLoadingRestaurants(false);
      }
    };

    loadRestaurants();
  }, []);

  // Asegura que en UI solo pintamos restaurantes activos.
  const activeRestaurants = restaurants.filter((restaurant) => restaurant.estat !== "INACTIU");

  const onContactChange = (field: keyof ContactPayload, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmitContact = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSendingContact(true);
    setContactMessage(null);

    try {
      // POST al endpoint público que guarda cliente + mensaje.
      await publicClientApi.sendContactForm(contactForm);
      setContactMessage({ type: "success", text: "Mensaje enviado correctamente. Te responderemos pronto." });
      setContactForm(INITIAL_CONTACT);
    } catch (error) {
      setContactMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo enviar el formulario",
      });
    } finally {
      setIsSendingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-ds-bg-page text-ds-fg-default">
      {/* Header tipo one-page con anclas a secciones internas. */}
      <header className="sticky top-0 z-20 border-b border-ds-brand-wine/30 bg-ds-bg-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <p className="font-ds-display text-5xl font-bold text-ds-brand-wine">El Castell</p>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#inicio" className="text-xs font-semibold tracking-[0.14em] text-ds-brand-wine">INICIO</a>
            <a href="#restaurantes" className="text-xs font-semibold tracking-[0.14em] text-ds-brand-wine">RESTAURANTES</a>
            <a href="#encuentranos" className="text-xs font-semibold tracking-[0.14em] text-ds-brand-wine">ENCUÉNTRANOS</a>
            <a href="#contacto" className="text-xs font-semibold tracking-[0.14em] text-ds-brand-wine">CONTACTO</a>
            <a
              href="#restaurantes"
              className="rounded-sm border border-ds-brand-wine px-5 py-2 text-[10px] font-bold tracking-[0.16em] text-ds-brand-wine"
            >
              RESERVAR MESA
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero principal */}
        <section id="inicio" className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="inline-block rounded-md bg-ds-brand-copper px-5 py-3 text-sm font-semibold text-ds-canvas shadow-ds-card">
              ★ 4.7
            </div>
            <h1 className="font-ds-display text-5xl font-black uppercase tracking-[-0.03em] text-ds-brand-wine md:text-7xl">
              Encuentra tu restaurante
            </h1>
            <a
              href="#restaurantes"
              className="inline-block rounded-sm border-2 border-ds-brand-wine px-6 py-3 text-xs font-bold tracking-[0.16em] text-ds-brand-wine"
            >
              MESAS DISPONIBLES
            </a>
          </div>
          <div className="space-y-4">
            <ImagePlaceholder altText="[Imagen hero principal - pendiente]" className="h-64 shadow-ds-card" />
            <p className="text-xs uppercase tracking-[0.12em] text-ds-ui-muted">Texto alternativo de imagen pendiente</p>
          </div>
        </section>

        {/* Sección narrativa/branding */}
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeader
              title="Nuestra esencia"
              subtitle="Tradición y vanguardia en el corazón de Barcelona. Un homenaje a la excelencia gastronómica."
            />
          </div>
          <ImagePlaceholder altText="[Imagen ambiente restaurante - pendiente]" className="h-64 shadow-ds-card" />
        </section>

        {/* Sección promocional de menú */}
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <ImagePlaceholder altText="[Imagen platos destacados - pendiente]" className="h-80 rounded-t-[8rem] shadow-ds-card" />
          <div className="space-y-6">
            <SectionHeader
              title="Nuestro menú"
              subtitle="Descubre una propuesta gastronómica que respeta el producto y celebra la creatividad."
            />
            <button className="rounded-sm border-2 border-ds-brand-wine px-6 py-3 text-xs font-bold tracking-[0.16em] text-ds-brand-wine">
              VER MENÚ
            </button>
          </div>
        </section>

        {/* Cards de restaurantes obtenidas del backend */}
        <section id="restaurantes" className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeader title="Restaurantes" subtitle="Elige tu restaurante favorito en el corazón de Barcelona." centered />

          {isLoadingRestaurants ? (
            <div className="mt-10 rounded-lg bg-ds-surface p-10 text-center shadow-ds-card">
              <p className="text-sm text-ds-ui-muted">Cargando restaurantes...</p>
            </div>
          ) : restaurantsError ? (
            <div className="mt-10 rounded-lg bg-ds-surface p-10 text-center shadow-ds-card">
              <p className="text-sm text-red-700">{restaurantsError}</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {activeRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </section>

        {/* Mapa con todos los puntos (lat/lng) */}
        <section id="encuentranos" className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeader title="Encuéntranos" subtitle="Descubre nuestras ubicaciones en el mapa." centered />
          <div className="mt-10 overflow-hidden rounded-lg shadow-ds-card">
            {activeRestaurants.length > 0 ? (
              <RestaurantsMap restaurants={activeRestaurants} />
            ) : (
              <div className="flex h-[430px] items-center justify-center bg-ds-surface">
                <p className="text-sm text-ds-ui-muted">No hay coordenadas disponibles para mostrar en el mapa.</p>
              </div>
            )}
          </div>
        </section>

        {/* Formulario conectado al endpoint público de contacto */}
        <section id="contacto" className="mx-auto max-w-3xl px-6 py-20">
          <SectionHeader
            title="Contacto"
            subtitle="¿Tienes alguna duda o petición especial? Escríbenos."
            centered
          />

          <form onSubmit={onSubmitContact} className="mt-10 rounded-lg bg-ds-surface p-8 shadow-ds-card">
            <div className="grid gap-5 md:grid-cols-2">
              <input
                value={contactForm.nom}
                onChange={(e) => onContactChange("nom", e.target.value)}
                placeholder="Tu nombre"
                className="border-b border-ds-border-default bg-transparent py-3 text-sm outline-none"
                required
              />
              <input
                value={contactForm.cognoms}
                onChange={(e) => onContactChange("cognoms", e.target.value)}
                placeholder="Tus apellidos"
                className="border-b border-ds-border-default bg-transparent py-3 text-sm outline-none"
                required
              />
              <input
                value={contactForm.email}
                onChange={(e) => onContactChange("email", e.target.value)}
                type="email"
                placeholder="tu@email.com"
                className="border-b border-ds-border-default bg-transparent py-3 text-sm outline-none"
                required
              />
              <input
                value={contactForm.telefon}
                onChange={(e) => onContactChange("telefon", e.target.value)}
                placeholder="Tu teléfono"
                className="border-b border-ds-border-default bg-transparent py-3 text-sm outline-none"
                required
              />
            </div>

            <textarea
              value={contactForm.missatge}
              onChange={(e) => onContactChange("missatge", e.target.value)}
              placeholder="¿En qué podemos ayudarte?"
              className="mt-6 h-40 w-full rounded-sm border border-ds-border-default bg-ds-surface-muted p-4 text-sm outline-none"
              required
            />

            <button
              type="submit"
              disabled={isSendingContact}
              className="mt-8 w-full rounded-sm border-2 border-ds-brand-wine py-4 text-xs font-bold tracking-[0.16em] text-ds-brand-wine disabled:opacity-60"
            >
              {isSendingContact ? "ENVIANDO..." : "ENVIAR MENSAJE"}
            </button>

            {contactMessage && (
              <p className={`mt-4 text-center text-sm ${contactMessage.type === "success" ? "text-green-700" : "text-red-700"}`}>
                {contactMessage.text}
              </p>
            )}
          </form>
        </section>
      </main>

      <footer className="bg-ds-brand-wine py-14 text-ds-canvas">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-3">
          <div>
            <p className="font-ds-display text-5xl font-bold">El Castell</p>
            <p className="mt-3 text-sm text-ds-canvas/80">
              Redefiniendo el lujo gastronómico a través de la esencia de los ingredientes.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-ds-canvas/70">CONTACTO</p>
            <p className="mt-3 text-sm text-ds-canvas/80">+34 932 456 789</p>
            <p className="text-sm text-ds-canvas/80">reservas@elcastell.com</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-ds-canvas/70">RESTAURANTES</p>
            {activeRestaurants.slice(0, 3).map((restaurant) => (
              <p key={restaurant.id} className="mt-3 text-sm text-ds-canvas/80">{restaurant.nom}</p>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
