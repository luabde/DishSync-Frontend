import { API_BASE_URL } from "./config";

// DTO mínimo que consume la landing para pintar cards y mapa.
export interface RestaurantLocationDTO {
  id: number;
  nom: string;
  direccio: string;
  horaris?: string;
  url?: string | null;
  lat: number | null;
  lng: number | null;
  estat?: "ACTIU" | "INACTIU";
}

export interface ContactPayload {
  nom: string;
  cognoms: string;
  email: string;
  telefon: string;
  missatge: string;
}

const parseApiError = async (res: Response, fallback: string) => {
  // Normaliza errores de backend para mostrar mensajes legibles en UI.
  try {
    const error = await res.json();
    return typeof error?.message === "string" ? error.message : fallback;
  } catch {
    return fallback;
  }
};

export const publicClientApi = {
  getRestaurantLocations: async (): Promise<RestaurantLocationDTO[]> => {
    // Endpoint público del backend con restaurantes + coordenadas.
    const res = await fetch(`${API_BASE_URL}/restaurants/locations`);
    if (!res.ok) {
      throw new Error(await parseApiError(res, "No se pudieron cargar los restaurantes"));
    }
    return res.json();
  },

  sendContactForm: async (payload: ContactPayload): Promise<void> => {
    // Crea cliente + comentario de contacto en backend.
    const res = await fetch(`${API_BASE_URL}/usuaris/contactes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(await parseApiError(res, "No se pudo enviar el mensaje"));
    }
  },
};
