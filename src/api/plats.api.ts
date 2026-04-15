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
}

interface GetPlatsResponseDTO {
  plats: PlatListItemDTO[];
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
};
