import { ImagePlaceholder } from "./ImagePlaceholder";
import type { RestaurantLocationDTO } from "../../api/publicClient.api";
import { Link } from "react-router-dom";
import { useClientReservation } from "../../hooks/clientReservation.hook";
import { API_BASE_URL } from "../../api/config";

type RestaurantCardProps = {
  restaurant: RestaurantLocationDTO;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { setSelectedRestaurantId, setSelectedRestaurantName } = useClientReservation();
  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
  const restaurantImage = restaurant.url
    ? (restaurant.url.startsWith("http://") || restaurant.url.startsWith("https://")
      ? restaurant.url
      : `${apiOrigin}${restaurant.url.startsWith("/") ? "" : "/"}${restaurant.url}`)
    : null;

  return (
    <article className="rounded-lg bg-ds-surface p-6 shadow-ds-card">
      {restaurantImage ? (
        <div className="mb-5 h-40 overflow-hidden rounded-ds-md bg-ds-bg-elevated">
          <img
            src={restaurantImage}
            alt={`Imagen de ${restaurant.nom}`}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <ImagePlaceholder
          altText={`[Imagen de ${restaurant.nom} - pendiente]`}
          className="mb-5 h-40"
        />
      )}
      <h3 className="min-h-[96px] font-ds-display text-3xl font-bold leading-[1.05] text-ds-brand-wine">
        {restaurant.nom}
      </h3>
      <p className="mt-2 text-xs uppercase tracking-[0.08em] text-ds-ui-muted">
        {restaurant.direccio || "Direcció no disponible"}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-ds-wine-40">
        {restaurant.horaris || "Horari no disponible"}
      </p>
      <Link
        to="/reservar"
        onClick={() => {
          setSelectedRestaurantId(restaurant.id);
          setSelectedRestaurantName(restaurant.nom);
        }}
        className="mt-6 inline-block w-full rounded-md border border-ds-brand-wine px-5 py-3 text-center text-[10px] font-semibold tracking-[0.2em] text-ds-fg-default"
      >
        RESERVAR TAULA
      </Link>
    </article>
  );
}
