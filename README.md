# Projecte Final

Este repositorio contiene tanto el frontend (React/Vite) como el backend (Node.js/Prisma) del proyecto. A continuación se detallan las instrucciones para tu compañera (¡y para ti!) de forma que podáis instalar las dependencias y ejecutar ambos entornos sin problemas.

## Requisitos Previos

- [Node.js](https://nodejs.org/es/) (versión 18 o superior recomendada).
- [PostgreSQL](https://www.postgresql.org/) (o el motor de base de datos que estés usando con Prisma, asegúrate de tenerlo encendido localmente o tener la URL del host remoto).

---

## 1. Configuración del Backend

El backend utiliza Node.js y Prisma como ORM.

### Instalación de dependencias
Abre una terminal en la raíz del proyecto y navega hacia la carpeta del backend:

```bash
cd backend
npm install
```

### Variables de Entorno
Es necesario que conectes el backend a una base de datos. Crea un archivo llamado `.env` dentro de la carpeta `backend` e incluye la cadena de conexión:

```env
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/NOMBRE_BD?schema=public"
```

*(Nota: Cámbialo por las credenciales reales de tu base de datos).* 

### Base de Datos y Prisma
Una vez creado el archivo `.env`, debes crear las tablas en la base de datos e inicializar el cliente de Prisma:

```bash
# Sincroniza el esquema con tu base de datos y genera el cliente
npx prisma migrate dev

# Si tienes datos iniciales preparados en seed.js, puebla la base de datos:
npm run seed
```

### Ejecutar el Backend
Para arrancar el servidor backend:

```bash
node index.js
# O el comando que configuréis más adelante, como 'npm run dev' si añadís nodemon.
```

---

## 2. Configuración del Frontend

El frontend está desarrollado con React, Vite y TailwindCSS.

### Instalación de dependencias
Abre una **nueva pestaña o ventana** en tu terminal (para no cerrar el backend), y entra en la carpeta del frontend:

```bash
cd frontend
npm install
```

### Ejecutar el Frontend
Una vez instaladas las dependencias, levanta el entorno de desarrollo:

```bash
npm run dev
```

Te mostrará un enlace local (generalmente `http://localhost:5173/`). Puedes abrir esa URL en tu navegador y verás la aplicación.

---

## Resumen rápido para el día a día

Cuando queráis trabajar, siempre tendréis que abrir dos terminales en la carpeta principal del proyecto:

**Terminal 1 (Backend):**
```bash
cd backend
node index.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

¡Listo! Con esto ya deberíais poder programar la una en el back y la otra en el front teniendo todo unificado.
