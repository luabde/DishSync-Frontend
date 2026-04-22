import { ImagePlaceholder } from "./ImagePlaceholder";
import type { RestaurantLocationDTO } from "../../api/publicClient.api";

type RestaurantCardProps = {
  restaurant: RestaurantLocationDTO;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <article className="rounded-lg bg-ds-surface p-6 shadow-ds-card">
      <ImagePlaceholder
        altText={`[Imagen de ${restaurant.nom} - pendiente]`}
        className="mb-5 h-40"
      />
      <h3 className="font-ds-display text-3xl font-bold text-ds-brand-wine">{restaurant.nom}</h3>
      <p className="mt-2 text-xs uppercase tracking-[0.08em] text-ds-ui-muted">{restaurant.direccio}</p>
      <a
        href="#contacto"
        className="mt-6 inline-block w-full rounded-md border border-ds-brand-wine px-5 py-3 text-center text-[10px] font-semibold tracking-[0.2em] text-ds-fg-default"
      >
        RESERVAR MESA
      </a>
    </article>
  );
}
