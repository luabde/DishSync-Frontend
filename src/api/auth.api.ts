// Llamadas al backend de autenticación.
// credentials: 'include' → envía las cookies automáticamente.

import { API_BASE_URL } from './config';
import { fetchWithAuth } from './client';

export { refreshSession } from './session';

interface RawUser {
  id?: number;
  userId?: number;
  nom?: string;
  email?: string;
  rol?: string;
}

interface AuthUser {
  id: number;
  nom: string;
  email: string;
  rol: string;
}

const normalizeUser = (user: RawUser): AuthUser => ({
  id: user.id ?? user.userId ?? 0,
  nom: user.nom ?? '',
  email: user.email ?? '',
  rol: user.rol ?? '',
});

const parseApiError = async (res: Response, fallback: string) => {
  try {
    const error = await res.json();
    return typeof error?.message === 'string' ? error.message : fallback;
  } catch {
    return fallback;
  }
};

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include', // incluye las cookies en la request
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      throw new Error(await parseApiError(res, 'No se pudo iniciar sesión'));
    }
    const data = await res.json();
    return { ...data, user: normalizeUser(data.user as RawUser) };
  },

  me: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/auth/me`);

    if (!res.ok) throw new Error(await parseApiError(res, 'No autenticado'));

    const data = await res.json();
    return { ...data, user: normalizeUser(data.user as RawUser) };
  },

  logout: async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  }
};