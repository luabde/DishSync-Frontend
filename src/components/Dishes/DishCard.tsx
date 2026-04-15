import { Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DishItem } from './types';

type DishCardProps = {
  dish: DishItem;
  onEdit: (dish: DishItem) => void;
  onDelete: (dish: DishItem) => void;
};

type DishActionButtonProps = {
  label: string;
  icon: ReactNode;
  tone: 'olive' | 'copper';
  onClick: () => void;
};

// Botón interno reutilizable para mantener consistente "Editar/Eliminar".
function DishActionButton({ label, icon, tone, onClick }: DishActionButtonProps) {
  // Define el color del borde y el texto del botón de la card en función del tono.
  const toneClass = tone === 'olive'
    ? 'border-ds-brand-olive text-ds-brand-olive'
    : 'border-ds-brand-copper text-ds-brand-copper';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-semibold transition-colors hover:bg-black/5 ${toneClass}`}
    >
      {icon}
      {label}
    </button>
  );
}

// Formateo único de precio para evitar lógica repetida en la vista.
const formatPrice = (price: number) => `${price.toFixed(2)}€`;

export function DishCard({ dish, onEdit, onDelete }: DishCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-ds-card-border bg-ds-bg-elevated shadow-ds-card">
      <div className="relative h-[170px] overflow-hidden">
        <img src={dish.imageUrl} alt={dish.name} className="size-full object-cover" />
        <span className="absolute right-3 top-3 rounded-full bg-ds-brand-olive px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
          {dish.status === 'DISPONIBLE' ? 'Disponible' : 'No disponible'}
        </span>
      </div>
      <div className="p-5">
        <h3 className="h-[76px] overflow-hidden font-ds-sans text-[30px] font-bold leading-tight text-ds-brand-copper">
          {dish.name}
        </h3>
        <p className="mt-1 min-h-9 text-xs font-semibold text-slate-600">{dish.description}</p>
        <p className="mt-3 font-ds-sans text-2xl font-bold text-ds-brand-gold">{formatPrice(dish.price)}</p>
        <div className="mt-4 border-t border-brand-gray/10 pt-4">
          <div className="flex items-center gap-2">
            <DishActionButton
              label="Editar"
              icon={<Pencil className="size-3.5" />}
              tone="olive"
              onClick={() => onEdit(dish)}
            />
            <DishActionButton
              label="Eliminar"
              icon={<Trash2 className="size-3.5" />}
              tone="copper"
              onClick={() => onDelete(dish)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
