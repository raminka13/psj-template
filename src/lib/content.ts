/**
 * Acceso a las colecciones compartidas (FAQs y testimonios), ya ordenadas.
 *
 * Existe por una razón concreta: getCollection() NO devuelve las entradas en
 * el orden del archivo JSON. Si cada página llamara a getCollection()
 * directamente, tarde o temprano una se olvidaría de ordenar y publicaría las
 * preguntas barajadas. Aquí el orden viene resuelto de fábrica.
 */

import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { FaqItem } from "@lib/seo";
import type { Testimonial } from "@components/sections/Testimonials.astro";

export type Reto = CollectionEntry<"retos">;

/**
 * FAQs listas para pasar tanto a `seo.faqs` como a `<Faq items={...} />`.
 *
 * @param group  Filtra por grupo temático ("pagos", "acceso"). Sin valor, todas.
 */
export async function getFaqs(group?: string): Promise<FaqItem[]> {
  const entries = await getCollection("faqs");

  return entries
    .filter(({ data }) => !group || data.group === group)
    .sort((a, b) => a.data.order - b.data.order)
    .map(({ data }) => ({ q: data.q, a: data.a }));
}

/**
 * Testimonios ordenados.
 *
 * @param options.programa  Filtra por programa ("reto-sabiduria", "emprende"…).
 * @param options.featuredOnly  Solo los marcados como destacados.
 * @param options.limit  Corta la lista a N.
 */
export async function getTestimonios(
  options: { programa?: string; featuredOnly?: boolean; limit?: number } = {},
): Promise<Testimonial[]> {
  const { programa, featuredOnly = false, limit } = options;
  const entries = await getCollection("testimonios");

  const filtered = entries
    .filter(({ data }) => !programa || data.programa === programa)
    .filter(({ data }) => !featuredOnly || data.featured)
    .sort((a, b) => a.data.order - b.data.order)
    .map(({ data }) => ({
      quote: data.quote,
      name: data.name,
      role: data.role,
      initials: data.initials,
    }));

  return limit ? filtered.slice(0, limit) : filtered;
}

// ── Retos ─────────────────────────────────────────────────────────────────

/**
 * Retos publicados, en el orden declarado.
 *
 * Es la fuente de la home, del índice /retos, de las páginas individuales y
 * del submenú del header. Los borradores se ven en `astro dev` para poder
 * revisarlos, pero nunca en producción.
 */
export async function getRetos(options: { featuredOnly?: boolean } = {}): Promise<Reto[]> {
  const entries = await getCollection("retos", ({ data }) => import.meta.env.DEV || !data.draft);

  return entries
    .filter(({ data }) => !options.featuredOnly || data.featured)
    .sort((a, b) => a.data.order - b.data.order);
}

/** Un reto por su id (el nombre del archivo). Null si no existe. */
export async function getReto(id: string): Promise<Reto | null> {
  return (await getEntry("retos", id)) ?? null;
}
