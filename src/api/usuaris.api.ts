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

export interface DashboardUserDTO {
  id: number;
  nom: string;
  cognoms: string;
  email: string;
  rol: 'ADMIN' | 'CAMBRER' | 'RESPONSABLE';
  estat: 'ACTIU' | 'INACTIU';
  id_restaurant: number | null;
  restaurant: { nom: string } | null;
}

export interface CreateUserInput {
  nom: string;
  cognoms: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'CAMBRER' | 'RESPONSABLE';
  estat: 'ACTIU' | 'INACTIU';
  restaurant?: number | null;
}

export interface UpdateUserInput {
  nom: string;
  cognoms: string;
  email: string;
  rol: 'ADMIN' | 'CAMBRER' | 'RESPONSABLE';
  estat: 'ACTIU' | 'INACTIU';
  restaurant: number | null;
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
  // Usuarios disponibles para asignación en el wizard de restaurante.
  getUsersForAssignment: async (): Promise<AssignableUserDTO[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/usuaris`);
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudieron obtener los usuarios'));
    return res.json();
  },
  getAllUsers: async (): Promise<DashboardUserDTO[]> => {
    // Primer intento: convención normal del proyecto (API_BASE_URL ya incluye /api).
    let res = await fetchWithAuth(`${API_BASE_URL}/usuaris/allUsers`);

    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudieron obtener todos los usuarios'));
    return res.json();
  },
  deleteUser: async (userId: number): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/usuaris/${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudo eliminar el usuario'));
  },
  createUser: async (payload: CreateUserInput): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudo crear el usuario'));
  },
  updateUser: async (userId: number, payload: UpdateUserInput): Promise<void> => {
    // Edición de usuario usada por la tabla inline de gestión.
    const res = await fetchWithAuth(`${API_BASE_URL}/usuaris/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudo modificar el usuario'));
  },
  validateEmailExists: async (email: string): Promise<boolean> => {
    // Validación de duplicado de email.
    const encodedEmail = encodeURIComponent(email);
    const res = await fetchWithAuth(`${API_BASE_URL}/usuaris/validate-email?email=${encodedEmail}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudo validar el email'));
    const data = await res.json();
    return Boolean(data?.exists);
  },
  validateUsernameExists: async (username: string): Promise<boolean> => {
    // Validación de duplicado de nombre de usuario (campo nom).
    const encodedUsername = encodeURIComponent(username);
    const res = await fetchWithAuth(`${API_BASE_URL}/usuaris/validate-username?username=${encodedUsername}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'No se pudo validar el nombre de usuario'));
    const data = await res.json();
    return Boolean(data?.exists);
  },
};
