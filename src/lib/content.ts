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

// ── Fechas de arranque ────────────────────────────────────────────────────

export type EstadoDeFecha = "abierto" | "lista-de-espera" | "cerrado";

/** Una fecha de arranque con su reto ya resuelto. */
export interface FechaDeArranque {
  id: string;
  /** El reto completo, no solo su id: la fila necesita título y duración. */
  reto: Reto;
  startDate: Date;
  status: EstadoDeFecha;
  note?: string;
}

/**
 * Fechas de arranque que todavía no han pasado, de la más próxima a la más
 * lejana.
 *
 * Tres cosas que resuelve aquí y no en la página:
 *
 * 1. FILTRA EL PASADO. Un calendario es el único contenido que se rompe solo:
 *    sin este filtro, la página seguiría anunciando un grupo que arrancó en
 *    marzo. Se recalcula en cada build.
 *
 * 2. ROMPE EL BUILD si una fecha apunta a un reto que no existe. Sin esto, la
 *    fila se publicaría enlazando a un 404 y nadie se enteraría: el error
 *    aparece en una página que casi nadie revisa después de editar el JSON.
 *
 * 3. AVISA CUANDO SE VACÍA. El aviso sale en la consola del build, donde
 *    alguien lo ve, en vez de publicar el calendario en silencio con su estado
 *    vacío.
 */
export async function getProximasFechas(): Promise<FechaDeArranque[]> {
  const entries = await getCollection("fechas");

  // Se leen TODOS los retos, incluidos los borradores, para poder distinguir
  // "el reto no existe" (error de dedo: rompe el build) de "el reto está en
  // borrador" (situación normal: la fecha se guarda para cuando se publique).
  const todosLosRetos = await getCollection("retos");
  const porId = new Map(todosLosRetos.map((reto) => [reto.id, reto]));

  /**
   * Corte del día de hoy a medianoche UTC.
   *
   * Las fechas del JSON ("2026-09-07") las interpreta JavaScript como
   * medianoche UTC, así que el corte se construye igual a partir del día del
   * calendario local. Comparar contra `new Date()` a secas escondería el grupo
   * que arranca HOY en cuanto pasara la medianoche, que es justo el día en que
   * más gente entra a buscarlo.
   */
  const ahora = new Date();
  const hoy = Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  const proximas: FechaDeArranque[] = [];

  for (const { data } of entries) {
    const reto = porId.get(data.reto);

    if (!reto) {
      throw new Error(
        `La fecha "${data.id}" de src/data/fechas.json apunta al reto "${data.reto}", ` +
          `que no existe en src/content/retos/. Ids disponibles: ${[...porId.keys()].join(", ")}`,
      );
    }

    // Mismo criterio que getRetos(): los borradores se ven en `astro dev` para
    // poder revisarlos, pero nunca en producción.
    if (reto.data.draft && !import.meta.env.DEV) continue;

    if (data.startDate.getTime() < hoy) continue;

    proximas.push({
      id: data.id,
      reto,
      startDate: data.startDate,
      status: data.status,
      note: data.note,
    });
  }

  proximas.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  if (proximas.length === 0) {
    console.warn(
      "[fechas] No hay ninguna fecha de arranque futura en src/data/fechas.json. " +
        "/proximos-retos se va a publicar con el estado vacío: agrega las fechas nuevas.",
    );
  }

  return proximas;
}
