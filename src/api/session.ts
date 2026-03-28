import { API_BASE_URL } from './config';

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Renueva el access_token (cookie httpOnly). Varias llamadas en paralelo
 * comparten la misma petición para no disparar varios /auth/refresh.
 */
export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}
