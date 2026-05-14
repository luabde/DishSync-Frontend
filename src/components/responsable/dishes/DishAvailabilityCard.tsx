import { useState } from 'react';

export type DishAvailabilityItem = {
  id: number;
  idRestaurant: number;
  nom: string;
  descripcio: string;
  preu: number;
  categoria: string;
  imageUrl: string;
  disponibilitat: boolean;
};

type DishAvailabilityCardProps = {
  dish: DishAvailabilityItem;
  isUpdating: boolean;
  onAvailabilityChange: (dish: DishAvailabilityItem, nextValue: boolean) => void;
};

const formatPrice = (price: number) => `${price.toFixed(2)}€`;

export function DishAvailabilityCard({ dish, isUpdating, onAvailabilityChange }: DishAvailabilityCardProps) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ds-card-border bg-ds-bg-elevated shadow-ds-card transition-all hover:shadow-ds-card-hover">
      {/* Contenedor con h-44 y p-2 como el admin para que la foto tenga la misma escala */}
      <div className="relative h-44 shrink-0 overflow-hidden p-2">
        {dish.imageUrl && !hasImageError ? (
          <img
            key={dish.imageUrl}
            src={dish.imageUrl}
            alt={dish.nom}
            className="size-full object-contain transition-transform duration-500 hover:scale-105"
            onLoad={() => setHasImageError(false)}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="font-ds-sans text-[10px] font-bold uppercase tracking-widest text-ds-ui-muted opacity-40">
              Sense imatge
            </span>
          </div>
        )}

        {/* Toggle de disponibilitat */}
        <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/20 bg-white/90 px-2.5 py-1.5 shadow-sm backdrop-blur-xs">
          <span className="font-ds-sans text-[8px] font-semibold uppercase tracking-[0.7px] text-ds-brand-olive">
            {dish.disponibilitat ? 'Disponible' : 'Esgotat'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={dish.disponibilitat}
            disabled={isUpdating}
            onClick={() => onAvailabilityChange(dish, !dish.disponibilitat)}
            className={`relative h-[15px] w-[29px] rounded-full transition-colors ${dish.disponibilitat ? 'bg-ds-brand-olive' : 'bg-ds-brand-olive/30'} ${isUpdating ? 'cursor-not-allowed opacity-60' : ''}`}
            aria-label={`Canviar disponibilitat de ${dish.nom}`}
          >
            <span
              className={`absolute top-0.5 block size-[12px] rounded-full bg-[#F9F7F2] shadow-[0_1px_2px_rgba(0,0,0,0.22)] transition-all ${dish.disponibilitat ? 'left-[16px]' : 'left-px'}`}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-ds-sans text-[10px] font-bold uppercase tracking-widest text-ds-wine-40">
            {dish.categoria}
          </span>
        </div>
        <h3 className="font-ds-sans text-base font-bold uppercase tracking-tight text-ds-brand-wine line-clamp-2">
          {dish.nom}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[32px] font-ds-sans text-[13px] font-medium leading-relaxed text-ds-wine-70">
          {dish.descripcio || 'Sense descripció disponible per a aquest plat.'}
        </p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-ds-sans text-lg font-bold tracking-tight text-ds-brand-wine">
            {formatPrice(dish.preu)}
          </span>
        </div>
      </div>
    </article>
  );
}
