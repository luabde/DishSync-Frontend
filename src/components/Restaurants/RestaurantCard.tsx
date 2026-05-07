import { Pencil, Trash2, MapPin, Phone } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

type RestaurantCardProps = {
  restaurant: {
    id: number;
    nom: string;
    direccio: string;
    telefon: string;
    url: string | null;
    descripcio: string | null;
    estat: 'ACTIU' | 'INACTIU';
    horaris?: string;
  };
  onEdit: (id: number) => void;
  onDelete: (restaurant: any) => void;
  imageUrl: string;
};

// Se usa en el dashboard de adnim

export function RestaurantCard({ restaurant, onEdit, onDelete, imageUrl }: RestaurantCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ds-card-border bg-ds-bg-elevated shadow-ds-card transition-all hover:shadow-ds-card-hover">
      <div className="relative h-40 shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={restaurant.nom}
          className={`size-full object-cover ${restaurant.estat === 'INACTIU' ? 'opacity-60 grayscale-[0.5]' : ''}`}
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-ds-sans text-base font-bold uppercase tracking-tight text-ds-brand-wine line-clamp-2">
          {restaurant.nom}
        </h3>
        <div className="mt-2">
          <StatusBadge status={restaurant.estat} className="shrink-0" />
        </div>
        
        {restaurant.descripcio && (
          <p className="mt-1.5 line-clamp-2 min-h-[32px] font-ds-sans text-[11px] font-medium leading-relaxed text-ds-wine-70 italic">
            {restaurant.descripcio}
          </p>
        )}

        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2 font-ds-sans text-xs text-ds-wine-70">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-ds-brand-copper" />
            <span className="line-clamp-1">{restaurant.direccio || 'Sense adreça'}</span>
          </div>
          {restaurant.telefon && (
            <div className="flex items-center gap-2 font-ds-sans text-xs text-ds-wine-70">
              <Phone className="size-3.5 shrink-0 text-ds-brand-copper" />
              <span>{restaurant.telefon}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2 border-t border-ds-row-divider pt-4">
            <button
              onClick={() => onEdit(restaurant.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ds-brand-copper px-2 py-2 font-ds-sans text-[10px] font-bold uppercase tracking-[1px] text-ds-brand-copper transition-colors hover:bg-ds-brand-copper hover:text-white"
            >
              <Pencil className="size-3" />
              Editar
            </button>
            <button
              onClick={() => onDelete(restaurant)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500 px-2 py-2 font-ds-sans text-[10px] font-bold uppercase tracking-[1px] text-red-500 transition-colors hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="size-3" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
