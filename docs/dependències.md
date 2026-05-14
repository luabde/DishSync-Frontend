# Dependències del frontend

Versions orientatives segons `package.json`. La columna **Ús al codi** indica si hi ha imports a `src/` (revisió estàtica). Si diu **No referenciat**, el paquet està instal·lat però **no apareix** al codi font actual (preparació futura o dependència residual).

## Dependències d’execució (`dependencies`)

| Paquet | Versió (orientativa) | Funció | Ús al codi |
|--------|----------------------|--------|-----------|
| **react** | ^19.x | Biblioteca UI principal | Sí |
| **react-dom** | ^19.x | Renderitzat al DOM | Sí |
| **react-router-dom** | ^7.x | Rutes (`BrowserRouter`, `Routes`, `Route`, `Navigate`) | Sí (`App.tsx`) |
| **axios** | ^1.x | Client HTTP (alternativa a `fetch`) | No referenciat a `src/` (s’usa `fetch` / `fetchWithAuth`) |
| **@tanstack/react-query** | ^5.x | Caché i sincronització amb el servidor | No referenciat a `src/` |
| **zustand** | ^5.x | Estat global lleuger | No referenciat a `src/` |
| **react-hook-form** | ^7.x | Formularis amb menys re-renders | No referenciat a `src/` |
| **@hookform/resolvers** | ^5.x | Resolvers (p. ex. Zod) amb react-hook-form | No referenciat a `src/` |
| **zod** | ^4.x | Esquemes de validació | No referenciat a `src/` |
| **@fullcalendar/react** | ^6.x | Component de calendari React | Sí (`StepCalendar.tsx`) |
| **@fullcalendar/daygrid** | ^6.x | Vista mensual / graella de dies | Sí |
| **@fullcalendar/interaction** | ^6.x | Clics i selecció de dates | Sí |
| **leaflet** | ^1.x | Mapes interactius (OpenStreetMap) | Sí (`RestaurantsMap.tsx`, estils a `ClientHome`) |
| **react-leaflet** | ^5.x | Components React per Leaflet | No referenciat (el mapa usa l’API imperativa de `leaflet`) |
| **lucide-react** | ^0.x | Icones SVG com a components | Sí (diverses pàgines i components) |
| **jspdf** | ^4.x | Generació de PDF al navegador | Sí (`exportUtils.ts`) |
| **jspdf-autotable** | ^5.x | Taules dins dels PDF amb jsPDF | Sí (`exportUtils.ts`) |
| **@tailwindcss/vite** | ^4.x | Plugin Vite per Tailwind CSS v4 | Sí (`vite.config.ts`) |

## Desenvolupament (`devDependencies`)

| Paquet | Funció |
|--------|--------|
| **vite** | Bundler i servidor de desenvolupament |
| **@vitejs/plugin-react** | Suport React (Fast Refresh, JSX) |
| **typescript** | Tipat estàtic |
| **tailwindcss** | Framework CSS utility-first (v4) |
| **postcss** / **autoprefixer** | Pipeline CSS (compatibilitat entre navegadors) |
| **eslint**, **@eslint/js**, **typescript-eslint**, **eslint-plugin-react-hooks**, **eslint-plugin-react-refresh**, **globals** | Qualitat de codi i regles React |
| **@types/react**, **@types/react-dom**, **@types/node**, **@types/leaflet** | Tipus TypeScript |
| **@shadcn/ui** | Metapaquet / tooling relacionat amb l’ecosistema shadcn |
