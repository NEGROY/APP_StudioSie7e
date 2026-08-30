# APP_StudioSie7e

Aplicacion web para Studio Siete: landing publica, login, panel de administracion y API Node.js con arquitectura MVC.

## Requisitos

- Node.js 22+
- PostgreSQL 16
- Docker, si se usara Dockploy o el compose local

## Configuracion local

1. Copiar `.env.example` a `.env`.
2. Ajustar `DATABASE_URL` y `JWT_SECRET`.
3. Levantar PostgreSQL desde `../BD` con `docker compose up -d`.
4. Instalar dependencias con `npm install`.
5. Ejecutar `npm run dev`.

Credenciales seed:

- Admin: `admin@studiosiete.local` / `admin123`
- Usuario: `usuario@studiosiete.local` / `usuario123`

## Scripts

- `npm run dev`: API Node y frontend Astro en modo desarrollo.
- `npm run build`: genera el build estatico de Astro.
- `npm start`: sirve la API y el build generado desde Express.
