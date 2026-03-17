
# Com Instal·lar Tailwind CSS en un Projecte Vite amb React (pnpm)

Aquesta és una guia pas a pas per configurar **Tailwind CSS (versió 4)** en un projecte Vite creat amb React, utilitzant el gestor de paquets pnpm.

## 1. Instal·lar les dependències

Un cop tens el teu projecte creat amb Vite, necessites instal·lar els paquets de Tailwind CSS, el plugin per a Vite i l'eina de línia de comandes de Tailwind (CLI) al voltant de postcss/autoprefixer.

Obre el terminal a l'arrel del teu projecte i executa:
\\\ash
pnpm add tailwindcss @tailwindcss/vite
\\\

## 2. Configurar el plugin a Vite

Obre l'arxiu de configuració de Vite, que s'anomena ite.config.ts o ite.config.js. Has d'importar el plugin de Tailwind CSS per a Vite i afegir-lo a la llista de plugins.

Exemple de com hauria de quedar ite.config.ts:

\\\	ypescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
\\\

Aquest pas assegura que durant l'execució de pnpm run dev o en fer build, Vite entengui, filtri i afegeixi els estils de Tailwind CSS.

## 3. Importar Tailwind CSS als teus estils

El darrer pas és assegurar-te que el teu arxiu general d'estils estigui injectant l'estil de TailwindCSS.
Obre el teu fitxer d'estils principal (per defecte a Vite amb React sol ser src/index.css) i afegeix aquesta directiva al capdamunt de tot del document:

\\\css
@import "tailwindcss";
\\\

## 4. Iniciar el Servidor

Un cop realitzats aquests passos, ja pots començar a posar directament les classes de tailwind als teus elements HTML o components de React.

Llança el servidor com fas normalment:
\\\ash
pnpm run dev
\\\

