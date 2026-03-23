// Llamadas al backend de autenticación.
// credentials: 'include' → envía las cookies automáticamente.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

const refresh = async (): Promise<boolean> => {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
};

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
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
    let res = await fetch(`${BASE_URL}/auth/me`, {
      credentials: 'include'
    });

    if (res.status === 401) {
      const refreshed = await refresh();
      if (refreshed) {
        res = await fetch(`${BASE_URL}/auth/me`, {
          credentials: 'include'
        });
      }
    }

    if (!res.ok) throw new Error(await parseApiError(res, 'No autenticado'));

    const data = await res.json();
    return { ...data, user: normalizeUser(data.user as RawUser) };
  },

  logout: async () => {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  }
};