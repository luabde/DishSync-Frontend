import { API_BASE_URL } from './config';
import { fetchWithAuth } from './client';

type CreateRestaurantInput = Record<string, unknown>;

const parseApiError = async (res: Response, fallback: string) => {
  try {
    const error = await res.json();
    return typeof error?.message === 'string' ? error.message : fallback;
  } catch {
    return fallback;
  }
};

export const restaurantApi = {
  /**
   * Crea restaurante enviando JSON en el body.
   * Este método se usa para enviar el payload global generado en el wizard.
   */
  createRestaurant: async (payload: CreateRestaurantInput) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo crear el restaurante'));
    }

    return res.json();
  },
};
