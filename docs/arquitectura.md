# Arquitectura del frontend

## Stack

- **Vite 7** com a entorn de build i `dev`
- **React 19** + **TypeScript**
- **React Router 7** per navegació
- **Tailwind CSS 4** mitjançant `@tailwindcss/vite`
- **Fetch** amb `credentials: 'include'` per cookies HTTP-only del backend (JWT en cookies)

## Estructura de carpetes (`src/`)

| Carpeta / fitxer | Rol |
|------------------|-----|
| `main.tsx` | Entrada: `createRoot`, `StrictMode`, import global d’estils |
| `App.tsx` | Definició de rutes, providers (`AuthProvider`, `ClientReservationProvider`), navegació |
| `api/` | Configuració base (`config.ts`), clients d’autenticació, restaurants, plats, usuaris, taules, etc. |
| `api/client.ts` | `fetchWithAuth`: peticions amb cookies; en `401` intenta renovar la sessió i repetir una vegada |
| `api/session.ts` | Lògica de renovació de sessió (cridada des de `fetchWithAuth`) |
| `context/` | Estat global React (`authContext`, wizard de restaurant, flux de reserva client) |
| `components/` | Components reutilitzables (login, rutes protegides, formularis, mapa, etc.) |
| `pages/` | Pàgines per ruta (admin, client, responsable/cambrer) |
| `utils/` | Utilitats (p. ex. exportació PDF, resolució d’URLs de mitjans) |
| `styles/` | Tokens de disseny i CSS global |

Alias de rutes: `@/` → `src/` (definit a `vite.config.ts`).

## Flux d’autenticació

1. El backend estableix cookies `access_token` i `refresh_token` en fer login (`credentials` necessaris en CORS).
2. `AuthProvider` (`context/authContext.tsx`) al muntar crida `authApi.me()` per sincronitzar l’usuari.
3. Es guarda una còpia lleugera de l’usuari a `localStorage` (`user`) per UX; la font de veritat de sessió són les cookies.
4. `ProtectedRoute` redirigeix a `/login` si no hi ha sessió vàlida (segons el context i la càrrega).
5. `RoleRoute` restringeix per rols (`ADMIN`, `CAMBRER`, `RESPONSABLE`).

## Rutes principals

Resum del mapa definit a `App.tsx`:

- **Públiques**: `/`, `/reservar`, `/reservar/confirmada`, `/reservar/cancelada`, `/reservar/expirada`, `/login`, `/menu`
- **Protegides + ADMIN**: `/dashboard`, `/users`, `/users/new`, `/users/:id/edit`, `/restaurants`, `/restaurants/new`, `/restaurants/:restaurantId/manage`, `/admin/dishes`, `/admin/dishes/new`, `/admin/dishes/edit`, `/plats` (àlies)
- **Protegides + CAMBRER**: `/camarero`, crear/editar reserves
- **Protegides + RESPONSABLE**: `/responsable`, reserves, `/responsable/plats`
- **Fallback**: `*` → redirecció a `/`

## Capa d’API

- **`src/api/config.ts`**: exporta `API_BASE_URL` des de `import.meta.env.VITE_API_URL` amb fallback a `http://localhost:3000/api`.
- Els mòduls `*.api.ts` encapsulen endpoints concrets (auth, restaurants, plats, usuaris, taules, notificacions, client públic).
- Les peticions autenticades han d’usar helpers que incloguin `credentials: 'include'` (p. ex. `fetchWithAuth`).

## Variables d’entorn

Definides a `.env.example`:

| Variable | Descripció |
|----------|------------|
| `VITE_API_URL` | URL base de l’API (ex. `http://localhost:3000/api`). **Obligatòria en build** si el backend no és el valor per defecte. |
| `VITE_SUPABASE_STORAGE_URL` | URL pública d’emmagatzematge (ex. Supabase) per resoldre imatges; opcional segons `resolveMediaUrl` |

Qualsevol variable visible al client ha de començar per `VITE_` (convenció de Vite).

## Build i desplegament

- `pnpm build` genera assets estàtics a `dist/`.
- El servidor que serveixi `dist` ha de configurar **fallback a `index.html`** per a rutes SPA (React Router amb `BrowserRouter`).

## Integració amb el backend

- El backend ha d’exposar CORS amb `credentials: true` i `origin` coincident amb la URL del frontend (vegeu documentació del backend: `CORS_ORIGIN`).
- En producció amb domini separat per API i web, les cookies cross-site requereixen `SameSite=None` i `Secure` al backend (ja contemplat al flux d’auth del servidor).
