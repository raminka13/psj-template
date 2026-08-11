// @ts-check
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import icon from "astro-icon";

import { fonts } from "./src/config/fonts.ts";
import { isNoindexPath, site } from "./src/config/site.ts";

/**
 * Quita la barra final para poder comparar rutas de forma fiable.
 * @param {string} pathname
 * @returns {string}
 */
const normalizePath = (pathname) => pathname.replace(/\/+$/, "") || "/";

// https://astro.build/config
export default defineConfig({
  // Debe coincidir con `site.url` en src/config/site.ts.
  // Sin esto el sitemap y las URLs canónicas no se pueden generar.
  site: site.url,

  // El sitio SIGUE siendo estático. El adaptador está solo para que las rutas
  // que declaran `export const prerender = false` (hoy únicamente
  // /api/form) se compilen como función. Todo lo demás se prerenderiza igual.
  output: "static",
  adapter: netlify(),

  // Tipografías auto-hospedadas. Ver src/config/fonts.ts.
  fonts,

  /**
   * Variables de entorno tipadas y validadas en el build.
   *
   * FORM_WEBHOOK_URL va como `secret`: Astro impide importarla desde código de
   * cliente. Con GoHighLevel eso no es opcional — su Inbound Webhook no pide
   * API key, así que la URL ES la credencial. Si se filtrara al HTML,
   * cualquiera podría inyectar contactos falsos en el CRM.
   *
   * Al no ser opcional, un despliegue sin configurarla falla en el build en vez
   * de publicar un formulario que manda los leads al vacío.
   */
  env: {
    schema: {
      FORM_WEBHOOK_URL: envField.string({ context: "server", access: "secret" }),
      /** Destino alterno, para formularios que van a otro workflow. */
      FORM_WEBHOOK_URL_ALT: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      /** Segundos mínimos entre que carga el formulario y se envía (anti-bot). */
      FORM_MIN_SECONDS: envField.number({ context: "server", access: "public", default: 3 }),
    },
  },

  trailingSlash: "ignore",

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  image: {
    // Formatos modernos por defecto en <Image />.
    responsiveStyles: true,
  },

  integrations: [
    mdx(),
    icon({
      iconDir: "src/icons",
    }),
    sitemap({
      filter: (page) => {
        const pathname = normalizePath(new URL(page).pathname);

        // Fuera las páginas intermedias de funnel.
        // La lista vive en src/config/site.ts para no duplicarla.
        if (isNoindexPath(pathname)) return false;

        // Fuera las páginas de tag. Son navegación, no contenido canónico:
        // agregan lo que ya está en los posts. Google las encuentra igual por
        // los enlaces desde /blog.
        //
        // Además evita una incoherencia que Search Console marca como error:
        // /blog/tag/[tag].astro pone noindex a los tags con menos de 3
        // artículos, y una URL con noindex dentro del sitemap dispara el
        // aviso "URL enviada marcada como noindex".
        if (pathname.startsWith("/blog/tag/")) return false;

        // Fuera el endpoint de formularios: no es una página.
        if (pathname.startsWith("/api")) return false;

        return true;
      },

      // Prioridad y frecuencia por tipo de ruta. Sin esto todas las URLs salen
      // con priority 0.5, que no le dice nada útil al crawler.
      serialize(item) {
        // Normalizar es obligatorio: las URLs del sitemap llevan barra final
        // ("/blog/"), así que comparar contra "/blog" a secas nunca coincide y
        // el índice del blog terminaría con la prioridad de un post suelto.
        const pathname = normalizePath(new URL(item.url).pathname);

        if (pathname === "/") {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (pathname === "/blog") {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (pathname.startsWith("/blog/")) {
          item.priority = 0.7;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else {
          // Landings y páginas de venta.
          item.priority = 0.9;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        }

        return item;
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
