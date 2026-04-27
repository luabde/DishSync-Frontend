import { API_BASE_URL } from './config';
import { fetchWithAuth } from './client';

export interface PlatCategoryDTO {
  id: number;
  nom: string;
  descripcio?: string | null;
}

export interface PlatListItemDTO {
  id: number;
  nom: string;
  descripcio: string | null;
  preu: number | string;
  url: string | null;
  id_categoria: number;
  categoria?: PlatCategoryDTO | null;
  disponible_en?: {
    id_restaurant: number;
    disponibilitat: boolean;
  }[];
}

export interface CreatePlatDTO {
  nom: string;
  descripcio: string;
  preu: number;
  url: string;
  id_categoria: number;
  imageFile?: File;
}

export interface UpdatePlatDTO {
  id: number;
  nom: string;
  descripcio: string;
  preu: number;
  id_categoria: number;
  url?: string;
  imageFile?: File;
}

interface GetPlatsResponseDTO {
  plats: PlatListItemDTO[];
}

interface GetPlatCategoriesResponseDTO {
  categories: PlatCategoryDTO[];
}

const parseApiError = async (res: Response, fallback: string) => {
  try {
    const error = await res.json();
    return typeof error?.message === 'string' ? error.message : fallback;
  } catch {
    return fallback;
  }
};

const getApiOrigin = () => API_BASE_URL.replace(/\/api\/?$/, '');

export const resolvePlatImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${getApiOrigin()}${normalizedPath}`;
};

export const platsApi = {
  getPlats: async (): Promise<PlatListItemDTO[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/plats`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudieron obtener los platos'));
    }

    const data = (await res.json()) as GetPlatsResponseDTO;
    return Array.isArray(data?.plats) ? data.plats : [];
  },
  createPlat: async (payload: CreatePlatDTO): Promise<PlatListItemDTO> => {
    const formData = new FormData();
    formData.append('nom', payload.nom);
    formData.append('descripcio', payload.descripcio);
    formData.append('preu', String(payload.preu));
    formData.append('url', payload.url ?? '');
    formData.append('id_categoria', String(payload.id_categoria));
    if (payload.imageFile) {
      formData.append('image', payload.imageFile);
    }

    const res = await fetchWithAuth(`${API_BASE_URL}/plats`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo crear el plato'));
    }

    const data = (await res.json()) as { plat?: PlatListItemDTO };
    if (!data?.plat) {
      throw new Error('Respuesta inválida al crear el plato');
    }

    return data.plat;
  },
  getCategories: async (): Promise<PlatCategoryDTO[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/plats/categories`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudieron obtener las categorías'));
    }

    const data = (await res.json()) as GetPlatCategoriesResponseDTO;
    return Array.isArray(data?.categories) ? data.categories : [];
  },
  createCategory: async (payload: { nom: string; descripcio?: string }): Promise<PlatCategoryDTO> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/plats/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo crear la categoría'));
    }

    const data = (await res.json()) as { category?: PlatCategoryDTO };
    if (!data?.category) {
      throw new Error('Respuesta inválida al crear la categoría');
    }

    return data.category;
  },
  updatePlat: async (payload: UpdatePlatDTO): Promise<PlatListItemDTO> => {
    // Enviamos multipart para mantener el mismo flujo que creación con imagen opcional.
    const formData = new FormData();
    formData.append('nom', payload.nom);
    formData.append('descripcio', payload.descripcio);
    formData.append('preu', String(payload.preu));
    formData.append('id_categoria', String(payload.id_categoria));
    formData.append('url', payload.url ?? '');
    if (payload.imageFile) {
      formData.append('image', payload.imageFile);
    }

    const res = await fetchWithAuth(`${API_BASE_URL}/plats/${payload.id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo actualizar el plato'));
    }

    const data = (await res.json()) as { plat?: PlatListItemDTO };
    if (!data?.plat) {
      throw new Error('Respuesta inválida al actualizar el plato');
    }

    return data.plat;
  },
  deletePlat: async (platId: number): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/plats/${platId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo eliminar el plato'));
    }
  },
};
