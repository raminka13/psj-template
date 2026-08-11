/**
 * ============================================================================
 *  RESOLUCIÓN DE SEO
 * ============================================================================
 *  Fusiona lo que declara cada página con los valores por defecto de
 *  src/config/site.ts y devuelve un objeto ya normalizado y listo para
 *  renderizar en el <head>.
 *
 *  El objetivo es que una página solo tenga que declarar lo que la diferencia
 *  (title, description, keywords) y todo lo demás — canónica, OG, locale,
 *  robots — salga bien sin pensarlo.
 * ============================================================================
 */

import { absoluteUrl, isNoindexPath, site } from "@config/site";

export interface FaqItem {
  /** La pregunta, tal como la escribiría el visitante. */
  q: string;
  /** La respuesta. Acepta HTML simple (<strong>, <a>, <br>). */
  a: string;
}

export interface BreadcrumbItem {
  name: string;
  /** Ruta relativa ("/blog") o URL absoluta. */
  href: string;
}

export interface SeoProps {
  /** Título de la página, SIN el sufijo de marca (lo agrega titleTemplate). */
  title?: string;
  /** Si es true, se usa `title` tal cual, sin aplicar la plantilla. */
  rawTitle?: boolean;
  description?: string;
  /** Se combinan con site.defaultKeywords y se deduplican. */
  keywords?: string[];
  /** Ruta relativa a /public o URL absoluta. 1200×630. */
  image?: string;
  imageAlt?: string;
  /** Fuerza una canónica distinta a la URL actual (para contenido duplicado). */
  canonical?: string;
  /** Saca la página del índice. Las rutas de funnel ya lo hacen solas. */
  noindex?: boolean;
  /** Impide que los buscadores sigan los links de la página. */
  nofollow?: boolean;
  /** "website" para landings, "article" para posts del blog. */
  type?: "website" | "article";

  // ── Solo para type="article" ──────────────────────────────────────────
  publishedTime?: Date;
  modifiedTime?: Date;
  author?: string;
  tags?: string[];

  // ── Datos que alimentan el JSON-LD ────────────────────────────────────
  /** Genera el bloque FAQPage. Pásale el MISMO array que renderiza el <Faq />. */
  faqs?: FaqItem[];
  /** Genera el BreadcrumbList. El primer nivel (Inicio) se agrega solo. */
  breadcrumbs?: BreadcrumbItem[];
}

export interface ResolvedSeo {
  /** Título completo con el sufijo de marca. Va en <title> y en Open Graph. */
  title: string;
  /**
   * Título limpio, sin "| Para Siempre Juntos".
   *
   * Es el que usa `headline` en el JSON-LD: Google pide el titular del
   * artículo, no el del navegador, y recomienda que no lleve marca ni pase de
   * ~110 caracteres.
   */
  headline: string;
  description: string;
  keywords: string[];
  image: string;
  imageAlt: string;
  canonical: string;
  robots: string;
  type: "website" | "article";
  locale: string;
  lang: string;
  siteName: string;
  publishedTime?: Date;
  modifiedTime?: Date;
  author: string;
  tags: string[];
  faqs: FaqItem[];
  breadcrumbs: BreadcrumbItem[];
}

/** Límite práctico antes de que Google corte la descripción en el resultado. */
const DESCRIPTION_MAX = 158;

/** Recorta en el último espacio para no partir una palabra a la mitad. */
function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

/** Quita duplicados ignorando mayúsculas y espacios sobrantes. */
function dedupeKeywords(keywords: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of keywords) {
    const keyword = raw.trim();
    if (!keyword) continue;

    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(keyword);
  }

  return result;
}

/**
 * Construye la URL canónica.
 *
 * Se normaliza sin barra final (salvo la home) y sin query string: dos URLs
 * que solo difieren en `?utm_source=` son la misma página, y si la canónica
 * arrastra el parámetro Google las trata como contenido duplicado.
 */
function buildCanonical(currentUrl: URL, override?: string): string {
  if (override) return absoluteUrl(override);

  const pathname = currentUrl.pathname.replace(/\/+$/, "") || "/";
  return new URL(pathname, site.url).href;
}

/**
 * Punto de entrada. Llamar desde el layout con `Astro.url`.
 *
 * @param props  Lo que declaró la página.
 * @param currentUrl  `Astro.url`.
 */
export function resolveSeo(props: SeoProps, currentUrl: URL): ResolvedSeo {
  const pathname = currentUrl.pathname;

  const title = props.title
    ? props.rawTitle
      ? props.title
      : site.titleTemplate.replace("%s", props.title)
    : site.defaultTitle;

  const description = truncate(props.description ?? site.defaultDescription, DESCRIPTION_MAX);

  const keywords = dedupeKeywords([...(props.keywords ?? []), ...site.defaultKeywords]);

  // Una ruta de funnel se saca del índice aunque la página no lo pida:
  // es más fácil olvidarse de poner noindex que de quitarlo.
  const noindex = props.noindex || isNoindexPath(pathname);
  const robots = [noindex ? "noindex" : "index", props.nofollow ? "nofollow" : "follow"].join(", ");

  return {
    title,
    headline: props.title ?? site.name,
    description,
    keywords,
    image: absoluteUrl(props.image ?? site.defaultImage),
    imageAlt: props.imageAlt ?? props.title ?? site.defaultImageAlt,
    canonical: buildCanonical(currentUrl, props.canonical),
    robots,
    type: props.type ?? "website",
    locale: site.locale,
    lang: site.lang,
    siteName: site.name,
    publishedTime: props.publishedTime,
    modifiedTime: props.modifiedTime,
    author: props.author ?? site.defaultAuthor.name,
    tags: props.tags ?? [],
    faqs: props.faqs ?? [],
    breadcrumbs: props.breadcrumbs ?? [],
  };
}
