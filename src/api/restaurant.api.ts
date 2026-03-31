import { API_BASE_URL } from './config';
import { fetchWithAuth } from './client';

interface CreateRestaurantInput {
  nom: string;
  direccio: string;
  horaris: string;
  telefon: string;
  descripcio?: string;
  url?: string;
  wizardData: Record<string, unknown>;
  imageFile?: File;
}

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
   * Crea restaurante enviando multipart/form-data:
   * - campos básicos (nom, direccio, ...)
   * - wizardData serializado como JSON
   * - image (file) para guardado local en backend/public
   */
  createRestaurant: async (payload: CreateRestaurantInput) => {
    const formData = new FormData();
    formData.append('nom', payload.nom);
    formData.append('direccio', payload.direccio);
    formData.append('horaris', payload.horaris);
    formData.append('telefon', payload.telefon);
    formData.append('descripcio', payload.descripcio ?? '');
    formData.append('url', payload.url ?? '');
    formData.append('wizardData', JSON.stringify(payload.wizardData));
    if (payload.imageFile) {
      formData.append('image', payload.imageFile);
    }

    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo crear el restaurante'));
    }

    return res.json();
  },
};
