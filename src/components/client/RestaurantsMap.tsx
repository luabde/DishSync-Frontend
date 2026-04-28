import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RestaurantLocationDTO } from "../../api/publicClient.api";

type RestaurantsMapProps = {
  restaurants: RestaurantLocationDTO[];
};

export function RestaurantsMap({ restaurants }: RestaurantsMapProps) {
  // `mapRef` apunta al <div> real del DOM donde Leaflet "monta" el mapa.
  // Leaflet NO renderiza JSX directamente: necesita un nodo HTML nativo.
  const mapRef = useRef<HTMLDivElement | null>(null);

  // Guardamos la instancia del mapa para:
  // 1) no recrearla en cada render de React
  // 2) poder acceder a ella cuando cambian los restaurantes
  // 3) destruirla correctamente al desmontar el componente
  const leafletMapRef = useRef<any>(null);

  // Icono personalizado tipo "pin".
  // Se define una sola vez (en un ref) para reutilizar la misma configuración
  // en todos los markers y en todos los renders.
  const markerIcon = useRef(
    L.icon({
      // Pin SVG embebido para no depender de archivos estáticos externos.
      iconUrl:
        "data:image/svg+xml;utf8," +
        encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#8b4513" stroke="#4a0e0e" stroke-width="1.5">
            <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/>
            <circle cx="12" cy="10" r="2.8" fill="#f9f7f2"/>
          </svg>
        `),
      iconSize: [36, 36],
      iconAnchor: [18, 34],
      popupAnchor: [0, -30],
    })
  );

  useEffect(() => {
    // Si el contenedor aún no existe en el DOM, no podemos iniciar Leaflet.
    if (!mapRef.current) return;

    // Inicialización del mapa SOLO la primera vez.
    // En actualizaciones posteriores reutilizamos la instancia ya creada.
    if (!leafletMapRef.current) {
      // Crea el mapa dentro del div referenciado por `mapRef`.
      leafletMapRef.current = L.map(mapRef.current, {
        // Muestra controles +/- de zoom.
        zoomControl: true,
      });

      // Capa base: "fondo" del mapa (tiles de OpenStreetMap).
      // Leaflet = motor de render; OpenStreetMap = proveedor de cartografía.
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(leafletMapRef.current);
    }

    // Alias local para trabajar de forma más legible.
    const map = leafletMapRef.current;

    // Antes de repintar markers, eliminamos los anteriores.
    // Esto evita duplicados cuando `restaurants` cambia.
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // `bounds` irá acumulando todas las coordenadas para calcular
    // un encuadre automático que muestre TODOS los restaurantes.
    const bounds = L.latLngBounds([]);

    restaurants.forEach((restaurant) => {
      // Crea el marker con icono personalizado en la lat/lng del restaurante.
      const marker = L.marker([restaurant.lat, restaurant.lng], {
        icon: markerIcon.current,
      });

      // Popup que aparece al hacer click en el pin.
      marker
        .bindPopup(`<strong>${restaurant.nom}</strong><br/>${restaurant.direccio}`)
        .addTo(map);

      // Añadimos cada punto al cálculo de límites globales.
      bounds.extend([restaurant.lat, restaurant.lng]);
    });

    if (restaurants.length > 0) {
      // Ajusta centro+zoom para que todos los pins entren en pantalla.
      // `padding` deja margen visual entre el último pin y el borde.
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      // Fallback cuando no hay restaurantes.
      map.setView([41.3874, 2.1686], 12);
    }

    return () => {
      // Obliga a Leaflet a recalcular tamaño si cambió el layout.
      // Evita glitches visuales al navegar/mostrar-ocultar secciones.
      map.invalidateSize();
    };
  }, [restaurants]);

  useEffect(() => {
    return () => {
      // Limpieza final al desmontar componente:
      // destruye listeners/instancia interna y libera memoria.
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Contenedor visual del mapa.
  return <div ref={mapRef} className="h-full min-h-[430px] w-full" />;
}
