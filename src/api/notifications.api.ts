import { API_BASE_URL } from './config';
import { fetchWithAuth } from './client';

export interface ContactNotificationDTO {
  id: number;
  email: string;
  missatge: string;
  estat: string;
  createdAt: string;
}

const parseApiError = async (res: Response, fallback: string) => {
  try {
    const error = await res.json();
    return typeof error?.message === 'string' ? error.message : fallback;
  } catch {
    return fallback;
  }
};

export const notificationsApi = {
  getContactNotifications: async (): Promise<ContactNotificationDTO[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/usuaris/contactes`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudieron obtener los mensajes de contacto'));
    }

    return res.json();
  },
  markContactAsRead: async (contactId: number): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/usuaris/contactes/${contactId}/read`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo marcar el mensaje como leído'));
    }
  },
};
