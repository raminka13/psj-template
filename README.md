# PSJ Template

Template base de Astro para las páginas de **Para Siempre Juntos**.
Se clona una copia por cada página, funnel o micrositio nuevo.

Astro 7 · Tailwind 4 · TypeScript strict · Netlify

## Qué trae

- **Tokens de diseño** — colores, radios, sombras, espaciado y tipografía en un
  solo archivo. Cambiar tres colores re-marca la página entera.
- **Tema por página** — cualquier página puede sobrescribir la marca sin tocar
  el CSS global. Incluye presets por programa.
- **Modo oscuro** sin destello, con toggle y memoria.
- **SEO completo** — meta, Open Graph, Twitter Card, canónicas, keywords y un
  solo bloque JSON-LD con `@graph` (Organization, WebSite, WebPage,
  BreadcrumbList, FAQPage, Article, Product, Course, Event, Video).
- **FAQs con schema** desde una sola fuente de datos.
- **Sitemap y robots.txt** generados, con las rutas de funnel excluidas.
- **Blog** con content collections validadas por Zod, tags, paginación y RSS.
- **Formularios** por registro, que postean a GoHighLevel desde el servidor.
  Funcionan sin JavaScript, con honeypot, validación y captura de UTMs.
- **Páginas de gracias** generadas por formulario, con su propio copy.
- **Sistema de CTAs** con registro central, cinco componentes y tracking automático.
- **Fuentes auto-hospedadas** con fallbacks de métricas ajustadas (sin CLS).
- **Skills de diseño** para agentes, versionados con el repo.

## Empezar

```bash
npm install
cp .env.example .env
npm run dev
```

Sin `.env` el build falla a propósito: `FORM_WEBHOOK_URL` es obligatoria y un
sitio con formularios que no guardan nada es peor que uno sin formularios.

## Clonar para una página nueva

Edita estos cuatro archivos y ya:

| Archivo                    | Qué cambiar                                   |
| -------------------------- | --------------------------------------------- |
| `src/config/site.ts`       | Dominio, nombre, descripción, keywords, redes |
| `src/styles/tokens.css`    | Colores de marca, radios, espaciado           |
| `src/config/fonts.ts`      | Tipografías                                   |
| `src/config/navigation.ts` | Menús                                         |

Después `npm run og` para regenerar la imagen de Open Graph.

## Comandos

```bash
npm run dev       # servidor local en :4321
npm run build     # build de producción a dist/
npm run check     # tipos
npm run og        # regenera public/og-default.jpg
npm run format    # prettier
```

## Deploy

Netlify, salida estática. `netlify.toml` ya trae el build, las cabeceras de
seguridad, la caché inmutable de assets y `noindex` en deploy previews.
No hace falta adaptador salvo que un día se necesite SSR.

Antes de publicar, cambia `site.url` en `src/config/site.ts` — de ahí salen la
canónica, el sitemap y el robots.txt.

## Documentación

Las convenciones completas (tokens, SEO, accesibilidad, trampas) están en
[CLAUDE.md](CLAUDE.md).
