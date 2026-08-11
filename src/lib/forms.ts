/**
 * ============================================================================
 *  LÓGICA DE FORMULARIOS
 * ============================================================================
 *  Validación, normalización de teléfono y armado del payload para GoHighLevel.
 *
 *  El esquema de Zod se DERIVA del registro (src/config/forms.ts) en vez de
 *  escribirse aparte. Así el campo que se dibuja y el campo que se valida son
 *  literalmente la misma definición: no pueden desincronizarse, que es como se
 *  cuelan los formularios que aceptan basura o rechazan datos buenos.
 * ============================================================================
 */

import { z } from "astro/zod";
import { fieldMessages, forms, type FormDefinition, type FormField } from "@config/forms";

// ============================================================================
//  VALIDACIÓN
// ============================================================================

/**
 * Construye el validador de un campo suelto a partir de su definición.
 *
 * Los mensajes salen de `fieldMessages()`, los MISMOS que usa la validación
 * del navegador. Que cliente y servidor digan lo mismo importa: si el navegador
 * dice "escribe tu correo" y el servidor responde "campo inválido", la persona
 * cree que la segunda vez hizo mal algo distinto.
 *
 * Se distingue "vacío" de "mal escrito" con dos `.min()` encadenados, porque
 * no son el mismo problema ni se arreglan igual.
 */
function fieldSchema(field: FormField): z.ZodTypeAny {
  const required = field.required ?? false;
  const msg = fieldMessages(field);

  switch (field.type) {
    case "email": {
      // z.email() y no z.string().email(): en Zod 4 el segundo está obsoleto.
      const schema = z
        .string()
        .trim()
        .min(1, msg.required)
        .pipe(z.email({ message: msg.invalid }));
      return required ? schema : z.string().trim().optional();
    }

    case "tel": {
      // Se valida sobre los dígitos, no sobre lo escrito: la gente teclea
      // espacios, guiones y paréntesis, y rechazarlos por eso es hostil.
      const min = field.minLength ?? 8;
      const max = field.maxLength ?? 15;
      const schema = z
        .string()
        .trim()
        .min(1, msg.required)
        .refine(
          (value) => {
            const digits = value.replace(/\D/g, "");
            return digits.length >= min && digits.length <= max;
          },
          { message: msg.invalid },
        );
      return required ? schema : z.string().trim().optional();
    }

    case "checkbox": {
      // Un checkbox marcado llega como "on"; desmarcado no llega. Si es
      // obligatorio (consentimiento), tiene que venir.
      return required ? z.literal("on", { message: msg.required }) : z.string().optional();
    }

    case "select": {
      const values = (field.options ?? []).map((option) => option.value);
      const schema = z
        .string()
        .min(1, msg.required)
        .refine((value) => values.includes(value), { message: msg.invalid });
      return required ? schema : z.string().optional();
    }

    case "textarea":
    case "text":
    default: {
      const schema = z
        .string()
        .trim()
        .min(1, msg.required)
        .min(field.minLength ?? 2, msg.invalid)
        // Tope alto: no molesta a nadie real y frena a un bot que intente
        // mandar un megabyte de texto.
        .max(field.maxLength ?? 5000, "El texto es demasiado largo.");
      return required ? schema : z.string().trim().optional();
    }
  }
}

/** Arma el esquema completo de un formulario desde su definición. */
export function buildSchema(form: FormDefinition) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of form.fields) {
    shape[field.name] = fieldSchema(field);
  }

  return z.object(shape);
}

export interface ValidationResult {
  success: boolean;
  /** Datos ya limpios (trim aplicado). Solo si success. */
  data: Record<string, string>;
  /** Errores por nombre de campo. */
  errors: Record<string, string>;
}

/** Valida los datos crudos del formulario contra su definición. */
export function validateForm(form: FormDefinition, raw: Record<string, string>): ValidationResult {
  const result = buildSchema(form).safeParse(raw);

  if (result.success) {
    return { success: true, data: result.data as Record<string, string>, errors: {} };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "_form");
    // Solo el primer error por campo: mostrar tres mensajes bajo un input
    // abruma y ninguno se lee.
    if (!errors[key]) errors[key] = issue.message;
  }

  return { success: false, data: {}, errors };
}

// ============================================================================
//  TELÉFONO
// ============================================================================

/**
 * Normaliza un teléfono a formato E.164 (`+5218112345678`).
 *
 * Sin esto el número no sirve: GHL necesita E.164 para enviar WhatsApp y SMS,
 * y un "81 1234 5678" suelto no le dice de qué país es.
 *
 * @param national  Lo que escribió la persona; puede traer espacios y guiones.
 * @param countryCode  Código de país sin el "+", ej. "52".
 */
export function toE164(national: string, countryCode: string): string {
  let digits = national.replace(/\D/g, "");
  const country = countryCode.replace(/\D/g, "");

  if (!digits) return "";

  // Si ya viene con el código de país pegado al inicio, no duplicarlo.
  if (digits.startsWith(country) && digits.length > country.length) {
    digits = digits.slice(country.length);
  }

  // México: los números móviles se escriben a veces con un 1 delante
  // (herencia del viejo formato +521). Hoy GHL y WhatsApp esperan +52 seguido
  // de los 10 dígitos, así que ese 1 sobra.
  if (country === "52" && digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  // Argentina usa un 9 tras el código para móviles y ese SÍ se conserva.

  return `+${country}${digits}`;
}

// ============================================================================
//  PAYLOAD PARA GOHIGHLEVEL
// ============================================================================

/**
 * Claves de contexto que SIEMPRE viajan, en todos los formularios.
 *
 * Esto no es un adorno: GHL construye el mapeo de campos a partir de un request
 * de muestra. Una clave que no venga en esa muestra no aparece en el
 * desplegable del workflow y no se puede usar nunca. Por eso el payload manda
 * el juego completo con "" en vez de omitir lo que está vacío.
 */
const CONTEXT_KEYS = [
  "pageUrl",
  "pagePath",
  "referrer",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmTerm",
  "utmContent",
  "gclid",
  "fbclid",
] as const;

/** Campos de contacto que GHL reconoce solos. Siempre presentes. */
const CONTACT_KEYS = ["firstName", "lastName", "email", "phone", "name"] as const;

/**
 * Unión de los nombres de campo de TODOS los formularios del registro.
 *
 * Por qué la unión y no solo los del formulario que se envió: si los tres
 * formularios apuntan al mismo workflow de GHL, el mapeo se construye con la
 * muestra de UNO de ellos. Si esa muestra viniera de un opt-in, la clave
 * `message` del formulario de contacto no existiría en el mapeo y esos mensajes
 * se perderían para siempre, en silencio.
 *
 * Emitiendo siempre el mismo juego de claves, una sola muestra basta para
 * mapear todo y agregar un formulario nuevo no rompe los mapeos ya hechos.
 */
const ALL_FIELD_KEYS = [
  ...new Set(
    Object.values(forms as Record<string, FormDefinition>)
      .flatMap((form) => form.fields.map((field) => field.name))
      // phoneCountry es auxiliar de la interfaz: se funde dentro de `phone`.
      .filter((name) => name !== "phoneCountry"),
  ),
];

export interface BuildPayloadOptions {
  form: FormDefinition;
  /** Datos ya validados. */
  data: Record<string, string>;
  /** Contexto de la página, del cuerpo del request. */
  context: Record<string, string>;
  /** Momento del envío. Se inyecta para poder probar de forma determinista. */
  submittedAt: Date;
}

/**
 * Arma el JSON que recibe GoHighLevel.
 *
 * Reglas que impone GHL y que este código respeta:
 *   - Plano: nada anidado. GHL no sabe leer objetos dentro de objetos.
 *   - Claves de una sola palabra (camelCase), sin espacios.
 *   - Sin arrays: GHL los acepta pero no los puede usar dentro de las acciones,
 *     así que un checkbox múltiple se une con comas.
 *   - Todo string: evita que GHL adivine tipos distintos entre envíos.
 */
export function buildGhlPayload({
  form,
  data,
  context,
  submittedAt,
}: BuildPayloadOptions): Record<string, string> {
  const payload: Record<string, string> = {
    formId: form.id,
    formName: form.name,
  };

  // 1. Juego completo de claves, vacías. Contacto + todos los campos de todos
  //    los formularios: así el payload tiene siempre la misma forma.
  for (const key of CONTACT_KEYS) {
    payload[key] = "";
  }
  for (const key of ALL_FIELD_KEYS) {
    payload[key] = "";
  }

  // 2. Los valores del formulario que se envió.
  for (const field of form.fields) {
    if (field.name === "phoneCountry") continue;

    const value = data[field.name] ?? "";
    // GHL acepta arrays en el request pero no los puede usar dentro de las
    // acciones, así que un checkbox múltiple se une con comas.
    payload[field.name] = Array.isArray(value) ? (value as string[]).join(", ") : String(value);
  }

  // 3. Teléfono en E.164, combinando el país con el número nacional.
  if (data.phone) {
    payload.phone = toE164(data.phone, data.phoneCountry ?? "52");
  }

  // 4. `name` completo: GHL lo usa en plantillas de mensajes.
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  if (fullName) payload.name = fullName;

  // 5. Consentimiento como "true"/"false" y no "on": legible en el workflow.
  if ("consent" in data) {
    payload.consent = data.consent === "on" ? "true" : "false";
  }

  // 6. Contexto y atribución, siempre completo.
  for (const key of CONTEXT_KEYS) {
    payload[key] = context[key] ?? "";
  }

  payload.submittedAt = submittedAt.toISOString();

  return payload;
}
