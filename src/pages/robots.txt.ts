/**
 * robots.txt generado, no estático.
 *
 * La URL del sitemap se arma desde `site` de astro.config, así que al clonar
 * el template y cambiar el dominio no queda apuntando al dominio anterior —
 * que es lo que pasa siempre con un robots.txt escrito a mano en /public.
 */

import { site } from "@config/site";
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site: astroSite }) => {
  const base = astroSite ?? new URL(site.url);
  const sitemapUrl = new URL("sitemap-index.xml", base).href;

  // Las rutas de funnel se bloquean explícitamente además de llevar noindex:
  // el meta robots solo se lee si el crawler entra a la página; esto le evita
  // el viaje.
  const disallowed = site.noindexPatterns.map((pattern) =>
    pattern.replace(/^\^/, "").replace(/\$$/, ""),
  );

  const body = [
    "User-agent: *",
    "Allow: /",
    ...disallowed.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
