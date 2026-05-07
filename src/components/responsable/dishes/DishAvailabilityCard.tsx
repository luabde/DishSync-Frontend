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
    <article className="flex h-full flex-col overflow-hidden rounded-[17px] border border-[#F3F4F6] bg-ds-bg-elevated shadow-[0_2px_14px_rgba(0,0,0,0.08)]">
      <div className="relative h-[186px] overflow-hidden bg-ds-table-header-bg">
        {dish.imageUrl && !hasImageError ? (
          <img
            key={dish.imageUrl}
            src={dish.imageUrl}
            alt={dish.nom}
            className="size-full object-cover"
            onLoad={() => setHasImageError(false)}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="font-ds-sans text-[10px] font-bold uppercase tracking-widest text-ds-ui-muted opacity-50">
              Sense imatge
            </span>
          </div>
        )}

        <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/20 bg-white/90 px-2.5 py-1.5 shadow-sm backdrop-blur-xs">
          <span className="font-ds-sans text-[8px] font-semibold uppercase tracking-[0.7px] text-ds-brand-olive">
            Disponible
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
        <h3 className="font-ds-sans text-[20px] font-bold leading-none text-ds-brand-copper">
          {dish.nom}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[32px] font-ds-sans text-[11px] font-bold leading-[18px] text-[#4B5563]">
          {dish.descripcio || 'Sense descripció disponible.'}
        </p>
        <span className="mt-2 font-ds-sans text-[17px] font-bold text-ds-brand-gold">
          {formatPrice(dish.preu)}
        </span>
      </div>
    </article>
  );
}
