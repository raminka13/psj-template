/**
 * ============================================================================
 *  COLECCIONES DE CONTENIDO
 * ============================================================================
 *  El schema de Zod no es burocracia: valida en tiempo de build. Si un post
 *  se publica sin `description`, el build falla con un mensaje claro en vez de
 *  desplegar una página con el <meta description> vacío.
 * ============================================================================
 */

import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

/** Reutilizable: una FAQ dentro del frontmatter de un post. */
const faqSchema = z.object({
  q: z.string(),
  a: z.string(),
});

// ── Blog ──────────────────────────────────────────────────────────────────
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70, "Más de 70 caracteres se corta en los resultados de Google"),
      description: z
        .string()
        .min(50, "Muy corta para ser útil en el resultado de búsqueda")
        .max(160, "Más de 160 caracteres se corta en los resultados de Google"),

      /** Keywords de este post. Se combinan con las globales del sitio. */
      keywords: z.array(z.string()).default([]),

      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),

      author: z.string().default("Para Siempre Juntos"),

      /** Portada. `image()` la optimiza y valida que el archivo exista. */
      cover: image().optional(),
      coverAlt: z.string().optional(),

      tags: z.array(z.string()).default([]),

      /** FAQs del post: alimentan el bloque visual y el FAQPage del schema. */
      faqs: z.array(faqSchema).optional(),

      /** Un draft no se lista, no se compila y no entra al sitemap. */
      draft: z.boolean().default(false),

      /** Lo saca del índice sin quitarlo del sitio (útil para páginas de prueba). */
      noindex: z.boolean().default(false),
    }),
});

// ── FAQs reutilizables ────────────────────────────────────────────────────
// Preguntas que se repiten en varias landings. Vivir en un solo archivo evita
// que la respuesta sobre reembolsos diga una cosa en una página y otra en otra.
const faqs = defineCollection({
  loader: file("./src/data/faqs.json"),
  schema: z.object({
    id: z.string(),
    q: z.string(),
    a: z.string(),
    /** Grupo temático: "general", "pagos", "acceso"… */
    group: z.string().default("general"),
    /**
     * Orden de aparición, de menor a mayor.
     *
     * Es obligatorio y no un detalle: getCollection() NO respeta el orden del
     * array del JSON, así que sin este campo las preguntas salen barajadas y
     * la más importante puede terminar hasta abajo.
     */
    order: z.number(),
  }),
});

// ── Testimonios ───────────────────────────────────────────────────────────
const testimonios = defineCollection({
  loader: file("./src/data/testimonios.json"),
  schema: z.object({
    id: z.string(),
    quote: z.string(),
    name: z.string(),
    role: z.string().optional(),
    initials: z.string().optional(),
    /** Programa al que corresponde, para filtrar por landing. */
    programa: z.string().default("general"),
    /** Destacado: se muestra en la home. */
    featured: z.boolean().default(false),
    /** Orden de aparición. Ver la nota en la colección `faqs`. */
    order: z.number(),
  }),
});

// ── Retos ─────────────────────────────────────────────────────────────────
// Cada reto genera su propia página en /retos/{id} y su tarjeta en la home y
// en el índice, y alimenta el submenú del header. Una sola definición: si un
// reto cambia de nombre, cambia en los cuatro sitios a la vez.
const retos = defineCollection({
  loader: glob({ base: "./src/content/retos", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      /** Nombre del reto. Es el <h1> de su página y el label en el menú. */
      title: z.string().max(60, "No cabe en el submenú del header"),
      /** Frase corta para el menú y las tarjetas. Una línea. */
      tagline: z.string().max(90),
      /** Descripción para el <meta description> y las tarjetas. */
      description: z.string().min(50).max(160),

      /**
       * Bajada del hero. Es un texto DISTINTO de `description` a propósito:
       * la descripción está escrita para el resultado de búsqueda (50-160
       * caracteres) y en un hero resulta larga, empuja el botón fuera de la
       * primera pantalla y se lee como relleno. Aquí caben 20 palabras.
       */
      promise: z.string().refine((value) => value.trim().split(/\s+/).length <= 20, {
        message: "Máximo 20 palabras: es la bajada del hero, no la meta description",
      }),

      keywords: z.array(z.string()).default([]),

      /** Icono de Lucide SIN prefijo, ej. "book-open". */
      icon: z.string().default("sparkles"),

      /** Datos de un vistazo: "21 días", "15 minutos al día". */
      duration: z.string(),
      commitment: z.string(),
      /** Para quién es, en una frase. */
      audience: z.string(),

      /** Qué se lleva. 3-4 puntos; más de eso nadie los lee. */
      highlights: z
        .array(z.object({ title: z.string(), description: z.string() }))
        .min(1)
        .max(4),

      /** Lo que incluye, en frases sueltas. */
      includes: z.array(z.string()).default([]),

      /** Preguntas propias del reto. Se suman a las generales. */
      faqs: z.array(faqSchema).default([]),

      /** id del formulario del registro (src/config/forms.ts). */
      formId: z.string().default("optin-reto"),
      /** Clave para filtrar testimonios de este programa. */
      testimonialKey: z.string().optional(),

      cover: image().optional(),
      coverAlt: z.string().optional(),

      /** Orden en el menú, el índice y la home. */
      order: z.number(),
      /** Se muestra en la home. Los demás solo en /retos. */
      featured: z.boolean().default(true),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, faqs, testimonios, retos };
