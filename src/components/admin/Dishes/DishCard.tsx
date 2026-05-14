import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

export type DishItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
};

type DishCardProps = {
  dish: DishItem;
  onEdit: (dish: DishItem) => void;
  onDelete: (dish: DishItem) => void;
};

type DishActionButtonProps = {
  label: string;
  icon: ReactNode;
  tone: 'edit' | 'delete';
  onClick: () => void;
};

function DishActionButton({ label, icon, tone, onClick }: DishActionButtonProps) {
  const toneClass = tone === 'edit'
    ? 'border-ds-brand-copper text-ds-brand-copper hover:bg-ds-brand-copper hover:text-white'
    : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-2 py-2.5 text-[11px] font-bold uppercase tracking-[1px] transition-colors ${toneClass} font-ds-sans`}
    >
      {icon}
      {label}
    </button>
  );
}

const formatPrice = (price: number) => `${price.toFixed(2)}€`;

export function DishCard({ dish, onEdit, onDelete }: DishCardProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [dish.imageUrl]);

  const shouldShowImage = Boolean(dish.imageUrl) && !hasImageError;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ds-card-border bg-ds-bg-elevated shadow-ds-card transition-all hover:shadow-ds-card-hover">
      <div className="relative h-44 shrink-0 overflow-hidden p-2">
        {shouldShowImage ? (
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="size-full object-contain transition-transform duration-500 hover:scale-105"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="font-ds-sans text-[10px] font-bold uppercase tracking-widest text-ds-ui-muted opacity-40">Sense imatge</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-ds-sans text-[10px] font-bold uppercase tracking-widest text-ds-wine-40">
            {dish.category}
          </span>
        </div>
        <h3 className="font-ds-sans text-base font-bold uppercase tracking-tight text-ds-brand-wine line-clamp-2">
          {dish.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[32px] font-ds-sans text-[13px] font-medium leading-relaxed text-ds-wine-70">
          {dish.description || 'Sense descripció disponible per a aquest plat.'}
        </p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-ds-sans text-lg font-bold tracking-tight text-[#EAB308]">
            {formatPrice(dish.price)}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2 border-t border-ds-row-divider pt-4">
            <DishActionButton
              label="Editar"
              icon={<Pencil className="size-3" />}
              tone="edit"
              onClick={() => onEdit(dish)}
            />
            <DishActionButton
              label="Eliminar"
              icon={<Trash2 className="size-3" />}
              tone="delete"
              onClick={() => onDelete(dish)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
