import { API_BASE_URL } from '../api/config';

function getApiOrigin(): string {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

/**
 * URL base de Supabase Storage (público), p. ej.
 * `https://<ref>.supabase.co/storage/v1/object/public/dishSync-img`
 * Definir en `.env` como `VITE_SUPABASE_STORAGE_URL` (Vite solo expone variables con prefijo `VITE_`).
 */
function getSupabaseStorageBase(): string {
  const raw = (import.meta.env.VITE_SUPABASE_STORAGE_URL as string | undefined)?.trim();
  return raw ? raw.replace(/\/+$/, '') : '';
}

/**
 * Convierte rutas guardadas en BD (`public/dishes/...`, `dishes/...`, `/public/...`) o URLs absolutas
 * en URL final para `<img src>`. Con base de Storage configurada, se sirve desde Supabase; si no, desde el backend (`/public/...`).
 */
export function resolvePublicMediaUrl(url?: string | null): string {
  if (!url?.trim()) return '';
  const u = url.trim();
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('data:') || u.startsWith('blob:')) return u;

  const base = getSupabaseStorageBase();
  if (base) {
    let objectPath = u.replace(/^\/+/, '');
    if (objectPath.startsWith('public/')) {
      objectPath = objectPath.slice('public/'.length);
    }
    return `${base}/${objectPath}`.replace(/([^:]\/)\/+/g, '$1');
  }

  const normalizedPath = u.startsWith('/') ? u : `/${u}`;
  return `${getApiOrigin()}${normalizedPath}`;
}
