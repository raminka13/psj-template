/**
 * ============================================================================
 *  POST /api/form — recibe cualquier formulario y lo reenvía a GoHighLevel
 * ============================================================================
 *  Esta es la ÚNICA ruta dinámica del sitio. Todo lo demás se prerenderiza.
 *
 *  Existe por una razón de seguridad concreta: el Inbound Webhook de GHL no
 *  pide API key, así que su URL es la credencial. Si el navegador posteara
 *  directo a GHL, esa URL quedaría a la vista en el HTML y cualquiera podría
 *  inyectar contactos falsos en el CRM. Aquí la URL nunca sale del servidor.
 *
 *  Responde de dos formas según quién pregunte:
 *    - Navegador sin JS  → redirect 303 a la página de gracias
 *    - fetch() con Accept: application/json → JSON con el destino o los errores
 * ============================================================================
 */

import { formMessages, getForm } from "@config/forms";
import { buildGhlPayload, validateForm } from "@lib/forms";
import type { APIRoute } from "astro";
import { FORM_MIN_SECONDS, FORM_WEBHOOK_URL, FORM_WEBHOOK_URL_ALT } from "astro:env/server";

// Sin esto la ruta se prerenderizaría y no podría recibir POSTs.
export const prerender = false;

/** Claves de contexto que arma el cliente y llegan en `_utm`. */
interface Attribution {
  [key: string]: string | undefined;
}

/** Campos internos: no son datos del usuario y no se validan como tales. */
const INTERNAL_FIELDS = new Set(["_form", "_location", "_ts", "_website", "_utm"]);

function wantsJson(request: Request): boolean {
  return (request.headers.get("accept") ?? "").includes("application/json");
}

/** Respuesta uniforme para las dos formas de llamar al endpoint. */
function respond(
  request: Request,
  options: {
    ok: boolean;
    redirect?: string;
    message?: string;
    errors?: Record<string, string>;
    status?: number;
  },
): Response {
  const { ok, redirect, message, errors, status = ok ? 200 : 400 } = options;

  if (wantsJson(request)) {
    return new Response(JSON.stringify({ ok, redirect, message, errors }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Sin JS: redirigir. 303 y no 302 a propósito — obliga al navegador a hacer
  // GET en el destino, así que recargar la página de gracias no reenvía el
  // formulario ni duplica el contacto en el CRM.
  if (ok && redirect) {
    return new Response(null, { status: 303, headers: { Location: redirect } });
  }

  // Sin JS y con error: se manda de vuelta a la página de origen con la marca
  // del fallo, para no dejar a la persona en una pantalla en blanco.
  const referer = request.headers.get("referer");
  const back = new URL(referer ?? "/", request.url);
  back.searchParams.set("form_error", message ? "1" : "validacion");
  return new Response(null, { status: 303, headers: { Location: back.href } });
}

export const POST: APIRoute = async ({ request, url }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return respond(request, { ok: false, message: "No pudimos leer el formulario." });
  }

  // ── 1. Identificar el formulario ────────────────────────────────────────
  const formId = String(formData.get("_form") ?? "");
  const form = getForm(formId);

  if (!form) {
    return respond(request, {
      ok: false,
      message: "Formulario no reconocido.",
      status: 400,
    });
  }

  // ── 2. Honeypot ─────────────────────────────────────────────────────────
  // Se responde ÉXITO a propósito. Si se devolviera un error, el bot sabría
  // que fue detectado y probaría otra variante; creyendo que funcionó, se va.
  const honeypot = String(formData.get("_website") ?? "");
  if (honeypot.trim() !== "") {
    console.warn(`[form] honeypot activado en "${formId}" — descartado`);
    return respond(request, {
      ok: true,
      redirect: `/gracias/${form.id}`,
      message: formMessages(form).success,
    });
  }

  // ── 3. Trampa de tiempo ─────────────────────────────────────────────────
  const renderedAt = Number(formData.get("_ts") ?? 0);
  const elapsedSeconds = renderedAt > 0 ? (Date.now() - renderedAt) / 1000 : Infinity;

  if (elapsedSeconds < FORM_MIN_SECONDS) {
    console.warn(`[form] envío demasiado rápido en "${formId}" (${elapsedSeconds}s) — descartado`);
    return respond(request, {
      ok: true,
      redirect: `/gracias/${form.id}`,
      message: formMessages(form).success,
    });
  }

  // ── 4. Validar ──────────────────────────────────────────────────────────
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (INTERNAL_FIELDS.has(key)) continue;
    raw[key] = typeof value === "string" ? value : "";
  }

  const validation = validateForm(form, raw);

  if (!validation.success) {
    return respond(request, {
      ok: false,
      errors: validation.errors,
      message: formMessages(form).validationError,
      status: 422,
    });
  }

  // ── 5. Contexto y atribución ────────────────────────────────────────────
  let attribution: Attribution = {};
  try {
    attribution = JSON.parse(String(formData.get("_utm") ?? "{}"));
  } catch {
    // Un `_utm` corrupto no debe costar un lead: se sigue sin atribución.
  }

  const referer = request.headers.get("referer") ?? "";
  const context: Record<string, string> = {
    pageUrl: attribution.pageUrl ?? referer,
    pagePath: attribution.pagePath ?? (referer ? new URL(referer).pathname : ""),
    referrer: attribution.referrer ?? "",
    utmSource: attribution.utmSource ?? "",
    utmMedium: attribution.utmMedium ?? "",
    utmCampaign: attribution.utmCampaign ?? "",
    utmTerm: attribution.utmTerm ?? "",
    utmContent: attribution.utmContent ?? "",
    gclid: attribution.gclid ?? "",
    fbclid: attribution.fbclid ?? "",
  };

  const payload = buildGhlPayload({
    form,
    data: validation.data,
    context,
    submittedAt: new Date(),
  });

  // Desde qué sección de la página se convirtió, si se declaró.
  payload.formLocation = String(formData.get("_location") ?? "");

  // ── 6. Enviar a GoHighLevel ─────────────────────────────────────────────
  const webhookUrl =
    form.webhook === "alt" && FORM_WEBHOOK_URL_ALT ? FORM_WEBHOOK_URL_ALT : FORM_WEBHOOK_URL;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Sin límite, una caída de GHL dejaría la función colgada hasta que la
      // mate el runtime, y la persona mirando un botón girando.
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`GHL respondió ${response.status}`);
    }
  } catch (error) {
    // Se registra el payload completo: es la única copia del lead si el
    // webhook falló, y permite recuperarlo a mano desde los logs de Netlify.
    console.error(
      `[form] fallo al enviar "${formId}" a GHL:`,
      error instanceof Error ? error.message : error,
      JSON.stringify(payload),
    );

    // Se devuelve el error de verdad. Fingir éxito perdería el lead para
    // siempre y en silencio; así la persona reintenta y queda rastro.
    return respond(request, {
      ok: false,
      message: formMessages(form).serverError,
      status: 502,
    });
  }

  // ── 7. Listo ────────────────────────────────────────────────────────────
  // El redirect va siempre, incluso en modo "inline": es el camino de quien no
  // tiene JavaScript. Con JS, el script ve successMode="inline" y muestra el
  // mensaje en vez de saltar de página.
  return respond(request, {
    ok: true,
    redirect: new URL(`/gracias/${form.id}`, url.origin).pathname,
    message: formMessages(form).success,
  });
};

/** Un GET a esta ruta no tiene sentido; se redirige al inicio. */
export const GET: APIRoute = () => new Response(null, { status: 303, headers: { Location: "/" } });
