/**
 * Helpers del blog. Centralizados para que el filtrado de borradores no se
 * repita en cada página — y para que no se olvide en una de ellas, que es
 * como los drafts terminan publicados.
 */

import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/**
 * Posts publicados, del más reciente al más viejo.
 *
 * En producción se excluyen los borradores; en `astro dev` se incluyen para
 * poder revisarlos antes de publicar.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => import.meta.env.DEV || !data.draft);

  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Todos los tags en uso, con su conteo, ordenados por frecuencia. */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts();
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Convierte un tag en slug para la URL: "Vida Diaria" → "vida-diaria". */
export function tagToSlug(tag: string): string {
  return (
    tag
      .toLowerCase()
      .normalize("NFD")
      // Quita los acentos: sin esto "oración" daría "oracio%CC%81n" en la URL.
      // ̀-ͯ es el bloque de marcas diacríticas que NFD deja sueltas.
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

/** Fecha legible en español: "11 de agosto de 2026". */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Minutos de lectura estimados a 200 palabras por minuto. */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ── Paginación ────────────────────────────────────────────────────────────
//
// Se hace a mano en vez de con el helper `paginate()` de Astro por una razón
// concreta: `paginate()` obliga a una ruta con parámetro rest (`[...page]`),
// y esa ruta chocaría con la de los posts (`[...slug]`) al vivir las dos en
// /blog. Con esto las URLs quedan /blog y /blog/pagina/2, sin ambigüedad y
// sin límite en cómo se organicen las carpetas de contenido.

export const POSTS_PER_PAGE = 9;

export interface PostPage {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  /** URL de la página anterior, o null si es la primera. */
  prevUrl: string | null;
  nextUrl: string | null;
}

/** URL de una página del índice. La 1 es /blog, no /blog/pagina/1. */
export function blogPageUrl(pageNumber: number): string {
  return pageNumber <= 1 ? "/blog" : `/blog/pagina/${pageNumber}`;
}

/** Corta la lista de posts y calcula los enlaces de navegación. */
export function paginatePosts(posts: Post[], currentPage: number): PostPage {
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const start = (currentPage - 1) * POSTS_PER_PAGE;

  return {
    posts: posts.slice(start, start + POSTS_PER_PAGE),
    currentPage,
    totalPages,
    prevUrl: currentPage > 1 ? blogPageUrl(currentPage - 1) : null,
    nextUrl: currentPage < totalPages ? blogPageUrl(currentPage + 1) : null,
  };
}
