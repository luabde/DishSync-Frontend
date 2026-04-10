// Estados de disponibilidad que usamos en filtros y badges de la card.
export type DishStatus = 'DISPONIBLE' | 'NO_DISPONIBLE';

// Shape base del plato para la UI de gestión (listado, card y acciones).
export type DishItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  status: DishStatus;
  imageUrl: string;
};
