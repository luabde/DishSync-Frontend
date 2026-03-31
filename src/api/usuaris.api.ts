import { API_BASE_URL } from './config';
import { fetchWithAuth } from './client';

export interface AssignableUserDTO {
  id: number;
  nom: string;
  cognoms: string;
  email: string;
  rol: 'ADMIN' | 'CAMBRER' | 'RESPONSABLE';
  id_restaurant: number | null;
}

const parseApiError = async (res: Response, fallback: string) => {
  try {
    const error = await res.json();
    return typeof error?.message === 'string' ? error.message : fallback;
  } catch {
    return fallback;
  }
};

export const usuarisApi = {
  getUsersForAssignment: async (): Promise<AssignableUserDTO[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/usuaris`);
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudieron obtener los usuarios'));
    return res.json();
  },
};
