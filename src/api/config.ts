/**
 * URL base del backend. Definir en `.env` como VITE_API_URL (obligatorio en build).
 * Todas las llamadas al API deben partir de aquí o de helpers que la importen.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';