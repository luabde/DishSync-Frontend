# DishSync — Frontend

Interfície web de **DishSync**: aplicació **React** amb **TypeScript** i **Vite** que consumeix l’API REST del backend (reserves, restaurants, carta, personal, etc.). Estils amb **Tailwind CSS 4**.

## Documentació addicional

- Detall de dependències: [docs/dependències.md](docs/dependències.md)
- Arquitectura, rutes i entorn: [docs/arquitectura.md](docs/arquitectura.md)

## Requisits

- Node.js (recomanat ≥ 18)
- pnpm (recomanat; el projecte defineix `packageManager`)

## Instal·lació

```bash
pnpm install
```

Copia les variables d’entorn:

```bash
cp .env.example .env
```

Edita `.env` (vegeu la secció següent).

## Variables d’entorn

| Variable | Descripció |
|----------|------------|
| `VITE_API_URL` | URL base de l’API (ex. `http://localhost:3000/api`). En build de producció ha de coincidir amb el domini real del backend. |
| `VITE_SUPABASE_STORAGE_URL` | URL pública d’emmagatzematge (opcional), per resoldre URLs d’imatges segons `src/utils/resolveMediaUrl.ts`. |

Les variables visibles al navegador han de començar per `VITE_` (convenció de Vite). La URL de l’API es llegeix a `src/api/config.ts`.

## Scripts

| Script | Comanda | Descripció |
|--------|---------|------------|
| `dev` | `pnpm dev` | Servidor de desenvolupament (per defecte `http://localhost:5173`) |
| `build` | `pnpm build` | Comprovació TypeScript (`tsc -b`) + build Vite a `dist/` |
| `preview` | `pnpm preview` | Previsualitza el build de producció |
| `lint` | `pnpm lint` | ESLint sobre el projecte |

## Execució en local

1. Assegura’t que el backend està en marxa i que `VITE_API_URL` apunta a ell.
2. `pnpm dev`
3. Obre el navegador a la URL que mostri la consola (normalment port **5173**).

El backend ha d’acceptar CORS amb `credentials: true` i l’origen del frontend (vegeu `CORS_ORIGIN` al backend).

## Arquitectura (resum)

- **Entrada**: `src/main.tsx` → `App.tsx`
- **Rutes**: `react-router-dom` (`BrowserRouter`, rutes públiques i protegides)
- **Autenticació**: cookies HTTP-only (`access_token`, `refresh_token`) + `fetch` amb `credentials: 'include'`; helper `fetchWithAuth` a `src/api/client.ts` (renovació de sessió en 401)
- **Estat global**: contextos React (`AuthProvider`, flux de reserva client, wizard de restaurant)
- **API**: mòduls `src/api/*.api.ts` i `API_BASE_URL`
- **Alias**: `@/` → `src/` (configurat a `vite.config.ts`)

## Rutes principals

Definides a `App.tsx`:

- **Públiques**: `/`, `/reservar`, estats de reserva (`/reservar/confirmada`, etc.), `/login`, `/menu`
- **ADMIN** (ruta protegida + rol): dashboard, usuaris, restaurants, plats (incloent alias `/plats`)
- **CAMBRER**: `/camarero` i gestió de reserves
- **RESPONSABLE**: `/responsable`, reserves i `/responsable/plats`
- Qualsevol altra ruta redirigeix a `/`

## Build i desplegament

`pnpm build` genera fitxers estàtics a `dist/`. El servidor que serveixi la SPA ha de fer **fallback a `index.html`** per a les rutes del client (React Router).

## Guia Tailwind + Vite

Per la configuració detallada de Tailwind amb Vite, vegeu [TAILWIND_VITE_SETUP_GUIDE.md](TAILWIND_VITE_SETUP_GUIDE.md).
