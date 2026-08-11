/**
 * ============================================================================
 *  JSON-LD / SCHEMA.ORG
 * ============================================================================
 *  Construye UN SOLO bloque `@graph` por página, con las entidades enlazadas
 *  entre sí por `@id`.
 *
 *  Por qué un solo grafo y no varios <script> sueltos: cuando una página emite
 *  tres bloques independientes que mencionan la misma organización, Google los
 *  lee como tres entidades distintas y no sabe cuál es la buena. Con `@graph`
 *  y `@id` estables, la Organization se declara una vez y todo lo demás la
 *  referencia — es la diferencia entre "hay datos" y "los datos se entienden".
 *
 *  IDs estables que se usan en todo el sitio:
 *    {url}/#organization   la marca PSJ
 *    {url}/#website        el sitio como tal
 *    {url}{path}#webpage   la página concreta
 * ============================================================================
 */

import { absoluteUrl, site } from "@config/site";
import type { BreadcrumbItem, FaqItem, ResolvedSeo } from "@lib/seo";

/** Un nodo de JSON-LD. Se mantiene laxo a propósito: schema.org es enorme. */
export type SchemaNode = Record<string, unknown>;

// ── IDs canónicos ──────────────────────────────────────────────────────────
export const ORG_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

/** Quita el HTML de un texto para poder meterlo en JSON-LD. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Fecha en formato ISO 8601, que es lo que espera schema.org. */
function isoDate(date: Date): string {
  return date.toISOString();
}

// ============================================================================
//  CONSTRUCTORES DE ENTIDADES
// ============================================================================

/** La marca. Se declara una sola vez por sitio y todo lo demás la referencia. */
export function organization(): SchemaNode {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.organization.legalName,
    alternateName: site.shortName,
    url: site.url,
    email: site.organization.email,
    logo: {
      "@type": "ImageObject",
      "@id": `${site.url}/#logo`,
      url: absoluteUrl(site.organization.logo),
      caption: site.name,
    },
    image: { "@id": `${site.url}/#logo` },
    sameAs: [...site.organization.sameAs],
  };
}

/** El sitio. Incluye el buscador interno si existe la ruta /buscar. */
export function website(options: { searchUrl?: string } = {}): SchemaNode {
  const node: SchemaNode = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.defaultDescription,
    publisher: { "@id": ORG_ID },
    inLanguage: site.lang,
  };

  if (options.searchUrl) {
    node.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${options.searchUrl}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    };
  }

  return node;
}

/** La página concreta. `WebPage`, o `ItemPage`/`CollectionPage` si se indica. */
export function webPage(
  seo: ResolvedSeo,
  options: { type?: "WebPage" | "CollectionPage" | "ItemPage" | "AboutPage" | "ContactPage" } = {},
): SchemaNode {
  const node: SchemaNode = {
    "@type": options.type ?? "WebPage",
    "@id": `${seo.canonical}#webpage`,
    url: seo.canonical,
    name: seo.title,
    description: seo.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: seo.lang,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: seo.image,
      caption: seo.imageAlt,
    },
  };

  if (seo.publishedTime) node.datePublished = isoDate(seo.publishedTime);
  if (seo.modifiedTime) node.dateModified = isoDate(seo.modifiedTime);

  return node;
}

/**
 * Migas de pan. Siempre se antepone "Inicio" para que la cadena arranque en
 * la raíz — sin eso Google no dibuja el breadcrumb en el resultado.
 */
export function breadcrumbList(items: BreadcrumbItem[], pageUrl: string): SchemaNode {
  const full: BreadcrumbItem[] = [{ name: "Inicio", href: "/" }, ...items];

  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: full.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

/** Bloque de preguntas frecuentes. Es el que puede ganar el acordeón en la SERP. */
export function faqPage(faqs: FaqItem[], pageUrl: string): SchemaNode {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: stripHtml(faq.q),
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(faq.a),
      },
    })),
  };
}

/** Post del blog. Se deriva entero del frontmatter, sin escribir SEO a mano. */
export function article(seo: ResolvedSeo): SchemaNode {
  const node: SchemaNode = {
    "@type": "BlogPosting",
    "@id": `${seo.canonical}#article`,
    // headline, no title: sin el sufijo de marca. Ver la nota en ResolvedSeo.
    headline: seo.headline,
    description: seo.description,
    image: seo.image,
    author: {
      "@type": "Person",
      name: seo.author,
    },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@id": `${seo.canonical}#webpage` },
    inLanguage: seo.lang,
  };

  if (seo.publishedTime) node.datePublished = isoDate(seo.publishedTime);
  // Si no hay fecha de actualización se usa la de publicación: Google prefiere
  // que dateModified exista a que falte.
  node.dateModified = isoDate(seo.modifiedTime ?? seo.publishedTime ?? new Date());
  if (seo.tags.length > 0) node.keywords = seo.tags.join(", ");

  return node;
}

/** Producto con oferta — para páginas de venta de retos y cursos. */
export function product(options: {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency?: string;
  url: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  rating?: { value: number; count: number };
}): SchemaNode {
  const node: SchemaNode = {
    "@type": "Product",
    "@id": `${absoluteUrl(options.url)}#product`,
    name: options.name,
    description: options.description,
    brand: { "@id": ORG_ID },
    offers: {
      "@type": "Offer",
      price: options.price,
      priceCurrency: options.currency ?? "USD",
      availability: `https://schema.org/${options.availability ?? "InStock"}`,
      url: absoluteUrl(options.url),
    },
  };

  if (options.image) node.image = absoluteUrl(options.image);

  if (options.rating) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: options.rating.value,
      reviewCount: options.rating.count,
    };
  }

  return node;
}

/**
 * Curso — para los retos y programas.
 *
 * `Course` y no `Product` porque es lo que estos programas son, y porque
 * Google tiene resultados enriquecidos propios para cursos. La oferta va
 * dentro del mismo nodo: separar el precio en un Product aparte crearía dos
 * entidades para la misma cosa.
 */
export function course(options: {
  name: string;
  description: string;
  url: string;
  /** "online" para un curso 100% digital. */
  mode?: string;
  /** Duración en ISO 8601, ej. "P21D" para 21 días. */
  duration?: string;
  /** Carga por sesión en ISO 8601, ej. "PT15M". */
  workload?: string;
  /** Solo si hay un precio real. Inventarlo sería declarar datos falsos. */
  offer?: { price: number; currency?: string };
}): SchemaNode {
  const node: SchemaNode = {
    "@type": "Course",
    "@id": `${absoluteUrl(options.url)}#course`,
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.url),
    provider: { "@id": ORG_ID },
    inLanguage: site.lang,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: options.mode ?? "online",
      ...(options.workload ? { courseWorkload: options.workload } : {}),
    },
  };

  if (options.duration) node.timeRequired = options.duration;

  if (options.offer) {
    node.offers = {
      "@type": "Offer",
      price: options.offer.price,
      priceCurrency: options.offer.currency ?? "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(options.url),
    };
  }

  return node;
}

/** Evento en vivo — para masterclasses y aperturas de reto. */
export function event(options: {
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  url: string;
  image?: string;
  online?: boolean;
}): SchemaNode {
  return {
    "@type": "Event",
    "@id": `${absoluteUrl(options.url)}#event`,
    name: options.name,
    description: options.description,
    startDate: isoDate(options.startDate),
    ...(options.endDate ? { endDate: isoDate(options.endDate) } : {}),
    eventAttendanceMode: options.online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: options.online
      ? { "@type": "VirtualLocation", url: absoluteUrl(options.url) }
      : undefined,
    organizer: { "@id": ORG_ID },
    ...(options.image ? { image: absoluteUrl(options.image) } : {}),
  };
}

/** Video — para replays y lecciones embebidas. */
export function videoObject(options: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: Date;
  /** Duración en formato ISO 8601, ej. "PT12M30S". */
  duration?: string;
  embedUrl?: string;
  contentUrl?: string;
}): SchemaNode {
  return {
    "@type": "VideoObject",
    name: options.name,
    description: options.description,
    thumbnailUrl: absoluteUrl(options.thumbnailUrl),
    uploadDate: isoDate(options.uploadDate),
    ...(options.duration ? { duration: options.duration } : {}),
    ...(options.embedUrl ? { embedUrl: options.embedUrl } : {}),
    ...(options.contentUrl ? { contentUrl: options.contentUrl } : {}),
    publisher: { "@id": ORG_ID },
  };
}

// ============================================================================
//  ENSAMBLADO DEL GRAFO
// ============================================================================

export interface BuildGraphOptions {
  seo: ResolvedSeo;
  /** Tipo de WebPage. Por defecto "WebPage". */
  pageType?: "WebPage" | "CollectionPage" | "ItemPage" | "AboutPage" | "ContactPage";
  /** Entidades extra ya construidas: product(), course(), event(), videoObject(). */
  extra?: SchemaNode[];
}

/**
 * Arma el grafo completo de la página.
 *
 * Organization y WebSite van siempre. WebPage siempre. Breadcrumb y FAQPage
 * solo si la página aportó los datos. Article solo si type === "article".
 */
export function buildGraph({ seo, pageType, extra = [] }: BuildGraphOptions): SchemaNode {
  const graph: SchemaNode[] = [organization(), website(), webPage(seo, { type: pageType })];

  if (seo.breadcrumbs.length > 0) {
    graph.push(breadcrumbList(seo.breadcrumbs, seo.canonical));
  }

  if (seo.faqs.length > 0) {
    graph.push(faqPage(seo.faqs, seo.canonical));
  }

  if (seo.type === "article") {
    graph.push(article(seo));
  }

  graph.push(...extra);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * Serializa el grafo para meterlo en un <script>.
 *
 * El escape de `<` es una medida de seguridad, no un capricho: sin él, un
 * título o una respuesta de FAQ que contenga "</script>" cerraría la etiqueta
 * antes de tiempo y el resto del JSON se ejecutaría como HTML.
 */
export function serializeSchema(graph: SchemaNode): string {
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}
