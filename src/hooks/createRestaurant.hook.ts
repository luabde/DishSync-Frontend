import { useContext } from 'react';
import { CreateRestaurantContext } from '../context/CreateRestaurantContext';

/**
 * Hook de acceso al contexto del wizard de creación de restaurante.
 * Mantiene el mismo patrón de uso que useAuth.
 */
export const useCreateRestaurant = () => {
  const context = useContext(CreateRestaurantContext);
  if (!context) throw new Error('useCreateRestaurant debe usarse dentro de CreateRestaurantProvider');
  return context;
};
