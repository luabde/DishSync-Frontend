import { refreshSession } from './session';

/**
 * Peticiones a la API con cookies httpOnly (access_token, refresh_token).
 * Ante 401 intenta renovar la sesión y repite la petición una vez.
 * `url` debe ser la URL completa del endpoint.
 */
export async function fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
  const requestInit: RequestInit = { ...init, credentials: 'include' };
  let res = await fetch(url, requestInit);
  if (res.status === 401) {
    const renewed = await refreshSession();
    if (renewed) res = await fetch(url, requestInit);
  }
  return res;
}
