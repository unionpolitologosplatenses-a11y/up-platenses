# Unión de Politólogos Platenses (UP) — sitio institucional

Sitio institucional de la Unión de Politólogos Platenses: Inicio, La Unión,
Notas, Revista y un panel de administración (CMS propio) para gestionar todo
el contenido sin tocar código.

## Arquitectura

- **Astro** en modo servidor (SSR), desplegado como **Cloudflare Pages Functions**.
  El sitio no es estático: cada página pública consulta la base de datos en
  el momento de la visita, así que publicar una nota o una edición nueva se
  refleja al instante, sin recompilar ni redeployar.
- **Cloudflare D1** (SQL): guarda notas, ediciones de la revista e información
  institucional (misión, objetivos, actividades, contacto).
- **Cloudflare R2** (almacenamiento de objetos): guarda las imágenes de notas,
  las portadas y los PDFs de la revista. Los archivos nunca se suben al
  repositorio de GitHub — solo se referencia su clave (`key`) en D1.
- **Tailwind CSS** con la paleta institucional (fucsia `#D81786`, esmeralda
  `#1B7F67`, celeste `#58BCD7`, blanco) y Montserrat como tipografía.
- **Panel admin** (`/admin`) protegido por contraseña, con sesión mediante
  una cookie firmada (HMAC-SHA256) — no depende de librerías externas.

```
src/
  pages/            → sitio público (Inicio, La Unión, Notas, Revista, Contacto)
  pages/admin/       → panel de administración
  pages/api/         → endpoints que crean/editan/eliminan contenido y suben archivos
  pages/files/       → sirve las imágenes y PDFs guardados en R2
  lib/               → helpers de D1, R2 y autenticación
  components/        → Header, Footer, tarjetas de nota y de edición
  middleware.ts       → protege /admin y /api con la sesión
schema.sql            → esquema de la base D1
wrangler.toml          → bindings de D1 y R2 para Cloudflare Pages
```

## 1. Desarrollo local

Requisitos: Node.js 18+ y una cuenta de Cloudflare (gratuita).

```bash
npm install

# Variables de entorno locales (contraseña del admin y secreto de sesión)
cp .dev.vars.example .dev.vars
# editar .dev.vars con tus propios valores

# Base de datos local (D1 simulada en tu máquina)
npm run db:init

npm run dev
```

El sitio queda disponible en `http://localhost:4321` y el panel en
`http://localhost:4321/admin` (usá la contraseña que pusiste en `.dev.vars`).

## 2. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Sitio institucional UP"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/up-platenses.git
git push -u origin main
```

## 3. Crear los recursos en Cloudflare (una sola vez)

```bash
npx wrangler login

# Base de datos D1
npx wrangler d1 create up_platenses
# copiá el "database_id" que devuelve y pegalo en wrangler.toml

# Bucket R2 para imágenes y PDFs
npx wrangler r2 bucket create up-platenses-files

# Cargar el esquema en la base remota
npm run db:init:remote
```

## 4. Conectar el repositorio a Cloudflare Pages

1. En el dashboard de Cloudflare: **Workers & Pages → Create → Pages →
   Connect to Git**, y elegí el repositorio recién subido.
2. Framework preset: **Astro**. Build command: `npm run build`. Build output
   directory: `dist`.
3. Antes del primer deploy (o después, en **Settings → Functions**), agregá
   los bindings:
   - **D1 database binding**: nombre `DB` → base `up_platenses`.
   - **R2 bucket binding**: nombre `FILES` → bucket `up-platenses-files`.
4. En **Settings → Environment variables**, agregá como *secretas*:
   - `ADMIN_PASSWORD`: la contraseña del panel admin.
   - `ADMIN_SECRET`: una cadena larga y aleatoria (para firmar las sesiones).
5. Deploy. El sitio queda publicado en una URL `https://up-platenses.pages.dev`
   (o el nombre que le hayas dado al proyecto).

También podés desplegar manualmente desde tu máquina con:

```bash
npm run deploy
```

## 5. Usar el panel de administración

Entrá a `https://TU-SITIO.pages.dev/admin` e iniciá sesión con
`ADMIN_PASSWORD`. Desde ahí podés:

- Editar la información institucional (frase de portada, presentación,
  misión, objetivos, actividades, contacto).
- Crear, editar y eliminar **notas** (con imagen, fecha, autor y contenido),
  y marcarlas como borrador o publicadas.
- Crear nuevas **ediciones de la revista** subiendo la portada y el PDF,
  completando número de edición, año, título, descripción y estado.
- Publicar o despublicar cualquier nota o edición en cualquier momento —
  los cambios se ven en el sitio al instante, sin redeploy.

## Notas sobre escalabilidad y mantenimiento

- Agregar una nueva edición de la revista (por ejemplo, "Edición 3 — 2028")
  es un formulario más, no requiere ningún cambio de código.
- El repositorio de GitHub solo contiene código: las imágenes y los PDFs
  viven en R2, así que el repo se mantiene liviano y los despliegues son
  rápidos.
- D1 y R2 están dentro del nivel gratuito de Cloudflare para un sitio de
  este tamaño (institucional, tráfico moderado).
- Si más adelante la Unión quiere más de un usuario administrador con
  permisos diferenciados, se puede reemplazar la autenticación simple
  actual por Cloudflare Access o por una tabla de usuarios en D1.
