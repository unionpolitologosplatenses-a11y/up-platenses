import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// El sitio corre en modo servidor (SSR) sobre Cloudflare Pages Functions.
// Esto permite que las páginas públicas lean el contenido (notas, revista,
// info institucional) directamente desde D1 en cada visita, y que el panel
// de administración escriba en D1/R2 sin necesidad de recompilar ni tocar código.
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true }, // permite `astro dev` con bindings locales (D1/R2 simulados)
  }),
  integrations: [tailwind({ applyBaseStyles: false })],
  site: 'https://up-platenses.pages.dev',
});
