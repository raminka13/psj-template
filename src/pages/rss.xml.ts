/** Feed RSS del blog. Enlazado desde el <head> en BaseLayout. */

import { site } from "@config/site";
import { getPublishedPosts } from "@lib/blog";
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();

  return rss({
    title: `${site.name} — Blog`,
    description: site.defaultDescription,
    site: context.site ?? site.url,
    // El feed nunca incluye borradores: getPublishedPosts los filtra, pero
    // en `astro dev` sí los deja pasar, así que aquí se vuelven a excluir.
    items: posts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
        categories: post.data.tags,
        author: post.data.author,
      })),
    customData: `<language>${site.lang}</language>`,
  });
};
