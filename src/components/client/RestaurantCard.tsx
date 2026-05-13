import { MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useClientReservation } from "../../hooks/clientReservation.hook";
import type { RestaurantLocationDTO } from "../../api/publicClient.api";
import { resolvePublicMediaUrl } from "../../utils/resolveMediaUrl";
import { StatusBadge } from "../common/StatusBadge";
import { ImagePlaceholder } from "./ImagePlaceholder";

type RestaurantCardProps = {
  restaurant: RestaurantLocationDTO;
};

// Se usa en la pagina principal de cliente para mostrar los restaurantes
export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { setSelectedRestaurantId, setSelectedRestaurantName, setSelectedRestaurantImageUrl } = useClientReservation();

  const restaurantImage = restaurant.url ? resolvePublicMediaUrl(restaurant.url) : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ds-card-border bg-ds-bg-elevated shadow-ds-card transition-all">
      {/* Header Image */}
      <div className="relative h-48 shrink-0 overflow-hidden">
        {restaurantImage ? (
          <img
            src={restaurantImage}
            alt={restaurant.nom}
            className="size-full object-cover"
          />
        ) : (
          <ImagePlaceholder
            altText={`[Imagen de ${restaurant.nom}]`}
            className="size-full"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-ds-sans text-lg font-bold uppercase tracking-tight text-ds-brand-wine line-clamp-2">
          {restaurant.nom}
        </h3>
        
        <div className="mt-3">
          <StatusBadge status={restaurant.estat || "ACTIU"} className="shrink-0" />
        </div>

        {restaurant.descripcio && (
          <p className="mt-2 line-clamp-2 min-h-[32px] font-ds-sans text-[11px] font-medium leading-relaxed text-ds-wine-70 italic">
            {restaurant.descripcio}
          </p>
        )}
        
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-2.5 font-ds-sans text-xs text-ds-wine-70">
            <MapPin className="mt-0.5 size-4 shrink-0 text-ds-brand-copper" />
            <span className="line-clamp-2 leading-relaxed">
              {restaurant.direccio || "Direcció no disponible"}
            </span>
          </div>
          
          <div className="flex items-center gap-2.5 font-ds-sans text-xs text-ds-wine-70">
            <Clock className="size-4 shrink-0 text-ds-brand-copper" />
            <span className="font-medium">
              {restaurant.horaris || "Horari no disponible"}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-6">
          <Link
            to="/reservar"
            onClick={() => {
              setSelectedRestaurantId(restaurant.id);
              setSelectedRestaurantName(restaurant.nom);
              setSelectedRestaurantImageUrl(restaurantImage ?? "");
            }}
            className="boton-primario flex w-full items-center justify-center text-center"
          >
            RESERVAR TAULA
          </Link>
        </div>
      </div>
    </article>
  );
}
