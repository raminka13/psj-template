/**
 * ============================================================================
 *  CONFIGURACIÓN GLOBAL DEL SITIO
 * ============================================================================
 *  Fuente única de verdad para identidad, SEO por defecto y datos de la
 *  organización. Al clonar el template para una página nueva de PSJ, este es
 *  el PRIMER archivo que se edita.
 *
 *  Todo lo que está aquí alimenta automáticamente:
 *    - los <meta> de cada página        (src/lib/seo.ts)
 *    - el JSON-LD de schema.org         (src/lib/schema.ts)
 *    - el sitemap y el robots.txt
 *    - el feed RSS del blog
 * ============================================================================
 */

export interface SiteAuthor {
  name: string;
  url?: string;
}

export const site = {
  // ── Identidad ────────────────────────────────────────────────────────────
  /** Sin barra final. Debe coincidir con `site` en astro.config.mjs. */
  url: "https://parasiemprejuntos.com",
  name: "Para Siempre Juntos",
  shortName: "PSJ",

  /** Idioma del contenido. `locale` es el formato que pide Open Graph. */
  lang: "es",
  locale: "es_MX",

  // ── SEO por defecto ──────────────────────────────────────────────────────
  /** `%s` se reemplaza por el título de la página. */
  titleTemplate: "%s | Para Siempre Juntos",
  /** Título de la home y fallback cuando una página no define el suyo. */
  defaultTitle: "Para Siempre Juntos — Contenido de fe que transforma tu vida",
  defaultDescription:
    "Retos, cursos y comunidad para crecer en fe, sabiduría y propósito. Recursos en español para tu vida diaria, tu familia y tu llamado.",

  /**
   * Keywords base que se combinan con las de cada página.
   * Google ignora <meta keywords>, pero mantenerlas aquí sirve para otros
   * buscadores y, sobre todo, para tener documentado el enfoque de cada página.
   */
  defaultKeywords: [
    "contenido cristiano en español",
    "crecimiento espiritual",
    "retos de fe",
    "sabiduría bíblica",
  ],

  /** Imagen Open Graph por defecto. Ruta relativa a /public. 1200×630. */
  defaultImage: "/og-default.jpg",
  defaultImageAlt: "Para Siempre Juntos",

  /**
   * Color de la barra del navegador en móvil (<meta name="theme-color">).
   * En hex a propósito: el soporte de oklch en theme-color aún es irregular
   * en navegadores móviles y un valor no reconocido se ignora en silencio.
   * Mantenlo en sintonía con --brand-primary de tokens.css.
   */
  themeColor: "#3b5bdb",

  /**
   * Idiomas alternativos, para hreflang. Ej: { en: "https://…/en" }.
   * Vacío a propósito: emitir hreflang en un sitio de un solo idioma no
   * aporta nada y, mal puesto, hace que Google sirva la versión equivocada.
   */
  alternateLocales: {} as Record<string, string>,

  // ── Redes ────────────────────────────────────────────────────────────────
  /** Handle de X/Twitter con @, o null si no aplica. */
  twitter: null as string | null,

  // ── Organización (schema.org) ────────────────────────────────────────────
  organization: {
    legalName: "Para Siempre Juntos",
    /** Ruta relativa a /public. Idealmente cuadrado, mínimo 112×112. */
    logo: "/logo.svg",
    email: "info@parasiemprejuntos.com",
    /** Perfiles oficiales — alimentan `sameAs` en el JSON-LD. */
    sameAs: [
      "https://www.facebook.com/parasiemprejuntos",
      "https://www.instagram.com/parasiemprejuntos",
      "https://www.youtube.com/@parasiemprejuntos",
    ],
  },

  /** Autor por defecto de los posts del blog. */
  defaultAuthor: {
    name: "Para Siempre Juntos",
  } satisfies SiteAuthor,

  // ── Sitemap / indexación ─────────────────────────────────────────────────
  /**
   * Rutas que NUNCA deben entrar al sitemap ni ser indexadas.
   * Son las páginas intermedias de funnel: si Google las indexa, la gente
   * llega al "gracias" sin haber comprado y a la OTO sin contexto.
   * Se evalúan como expresiones regulares contra el pathname.
   */
  noindexPatterns: [
    "^/gracias",
    "^/thank-you",
    "^/checkout",
    "^/upsell",
    "^/downsell",
    "^/oto",
    "^/replay-privado",
  ],
} as const;

export type Site = typeof site;

/** Convierte una ruta relativa en URL absoluta usando `site.url`. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, site.url).href;
}

/** ¿Esta ruta debe quedar fuera del índice? Usado por el sitemap y por <Seo>. */
export function isNoindexPath(pathname: string): boolean {
  return site.noindexPatterns.some((pattern) => new RegExp(pattern).test(pathname));
}
