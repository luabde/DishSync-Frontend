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

interface UpdateRestaurantInput {
  id: number;
  nom: string;
  direccio: string;
  telefon: string;
  descripcio?: string;
  url?: string;
  imageFile?: File;
}

export interface RestaurantListItemDTO {
  id: number;
  nom: string;
}

export interface RestaurantDetailDTO {
  id: number;
  nom: string;
  direccio: string;
  horaris: string;
  telefon: string;
  url: string | null;
  descripcio: string | null;
  estat: 'ACTIU' | 'INACTIU';
}

export interface RestaurantDashboardItemDTO {
  id: number;
  nom: string;
  direccio: string;
  url: string | null;
  estat: 'ACTIU' | 'INACTIU';
  taules: number;
  usuaris: number;
  reservesHoy: number;
  zones: number;
  platsDisp: number;
  platsNoDisp: number;
}

export interface RestaurantsDashboardDTO {
  restaurantsActivos: number;
  restaurantsInactivos: number;
  usuarios: number;
  reservasHoy: number;
  reservasSemana: number;
  restaurantsDashboard: RestaurantDashboardItemDTO[];
}

export interface ReservationTableAvailabilityDTO {
  id: number;
  num_persones_taula: number;
  min_persones_reserva: number;
  fila: number;
  columna: number;
  span_fila: number;
  span_columna: number;
  num_persones_reserva: number | null;
  estat_reserva: string | null;
}

export interface ReservationZoneDTO {
  id: number;
  nom: string;
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
  // Dashboard principal del admin con métricas globales y por restaurante.
  getRestaurantsDashboard: async (): Promise<RestaurantsDashboardDTO> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants/dashboard`, {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo obtener el dashboard'));
    }
    return res.json();
  },

  getRestaurants: async (): Promise<RestaurantListItemDTO[]> => {
    // Catálogo simple para selects de asignación (usuarios/restaurantes).
    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudieron obtener los restaurantes'));
    }

    return res.json();
  },

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
  /**
   * Actualiza campos básicos del restaurante (sin horarios).
   * Puede incluir una nueva imagen o pedir eliminar la actual (`url: ''`).
   */
  updateRestaurant: async (payload: UpdateRestaurantInput) => {
    const formData = new FormData();
    formData.append('nom', payload.nom);
    formData.append('direccio', payload.direccio);
    formData.append('telefon', payload.telefon);
    formData.append('descripcio', payload.descripcio ?? '');
    formData.append('url', payload.url ?? '');

    if (payload.imageFile) {
      formData.append('image', payload.imageFile);
    }

    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants/${payload.id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo actualizar el restaurante'));
    }

    return res.json();
  },

  /**
   * Comprueba si ya existe un restaurante con el mismo nombre.
   */
  validateRestaurantNameExists: async (nom: string): Promise<boolean> => {
    const encodedNom = encodeURIComponent(nom);
    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants/validate-name?nom=${encodedNom}`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo validar el nombre del restaurante'));
    }

    const data = await res.json();
    return Boolean(data?.exists);
  },

  /**
   * Comprueba si ya existe un restaurante con la misma dirección.
   */
  validateRestaurantAddressExists: async (direccio: string): Promise<boolean> => {
    const encodedDireccio = encodeURIComponent(direccio);
    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants/validate-address?direccio=${encodedDireccio}`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo validar la dirección del restaurante'));
    }

    const data = await res.json();
    return Boolean(data?.exists);
  },
  deleteRestaurant: async (restaurantId: number): Promise<void> => {
    // Si hay reservas futuras el backend responde 400 con detalle para UI.
    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants/${restaurantId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudo eliminar el restaurante'));
  },
  deactivateRestaurant: async (restaurantId: number): Promise<void> => {
    // Fallback de negocio: mantiene el restaurante pero lo deja inactivo.
    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants/${restaurantId}/deactivate`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudo desactivar el restaurante'));
  },
  getRestaurantById: async (restaurantId: number): Promise<RestaurantDetailDTO> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants/${restaurantId}`);
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudo obtener el restaurante'));
    return res.json();
  },
  getReservationsForm: async (restaurantId: number): Promise<Record<string, string[]>> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/restaurants/reservationsForm/${restaurantId}`);
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudo obtener los horarios de los turnos'));
    return res.json();
  },
  getReservationTables: async (payload: {
    restaurantId: number;
    data: string;
    torn: string;
    hora: string;
    zona: number | null;
  }): Promise<ReservationTableAvailabilityDTO[]> => {
    const bodyPayload = {
      data: payload.data,
      torn: payload.torn,
      hora: payload.hora,
      zona: payload.zona,
    };

    const res = await fetchWithAuth(
      `${API_BASE_URL}/restaurants/reservationsForm/${payload.restaurantId}/getTaules`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      }
    );
    if (!res.ok) throw new Error(await parseApiError(res, "No se pudieron obtener las mesas"));
    return res.json();
  },
  getReservationZones: async (restaurantId: number): Promise<ReservationZoneDTO[]> => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/restaurants/reservationsForm/${restaurantId}/zones`
    );
    if (!res.ok) throw new Error(await parseApiError(res, "No se pudieron obtener las zonas"));
    return res.json();
  },
};
