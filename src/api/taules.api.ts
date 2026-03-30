import { API_BASE_URL } from './config';
import { fetchWithAuth } from './client';

export interface TableTypeDTO {
  id: number;
  num_persones: number;
  span_fila: number;
  span_columna: number;
  min_persones_reserva: number;
}

const parseApiError = async (res: Response, fallback: string) => {
  try {
    const error = await res.json();
    return typeof error?.message === 'string' ? error.message : fallback;
  } catch {
    return fallback;
  }
};

export const taulesApi = {
  getTableTypes: async (): Promise<TableTypeDTO[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/taules`);
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudieron obtener los tipos de mesa'));
    return res.json();
  },
};
