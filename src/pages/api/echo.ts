/**
 * ============================================================================
 *  POST /api/echo — destino de pruebas, SOLO en desarrollo
 * ============================================================================
 *  Permite ver el payload exacto que recibiría GoHighLevel sin tener el
 *  webhook conectado todavía: en `.env` se apunta FORM_WEBHOOK_URL aquí y el
 *  JSON queda impreso en la consola del servidor.
 *
 *  Se bloquea fuera de desarrollo. Un endpoint que acepta cualquier POST y lo
 *  imprime en los logs no tiene por qué existir en producción.
 * ============================================================================
 */

import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) {
    return new Response("Not found", { status: 404 });
  }

  const body = await request.json().catch(() => null);

  console.log("\n─── payload que recibiría GoHighLevel ───");
  console.log(JSON.stringify(body, null, 2));
  console.log("─────────────────────────────────────────\n");

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
