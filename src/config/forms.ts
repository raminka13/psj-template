/**
 * ============================================================================
 *  REGISTRO DE FORMULARIOS
 * ============================================================================
 *  Cada formulario se define UNA vez, como dato. De esta definición salen:
 *
 *    - el HTML del formulario         (src/components/forms/Form.astro)
 *    - la validación del servidor     (src/lib/forms.ts deriva el esquema Zod)
 *    - el payload que recibe GHL      (src/pages/api/form.ts)
 *    - la página de gracias           (src/pages/gracias/[form].astro)
 *
 *  Agregar un formulario nuevo es agregar un objeto aquí. No hay que tocar
 *  componentes, ni endpoint, ni crear páginas.
 *
 *  Para usarlo en cualquier página o post:
 *      <Form id="optin-reto" />
 * ============================================================================
 */

// ── Tipos ──────────────────────────────────────────────────────────────────

export type FieldType = "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "hidden";

/**
 * Mensajes de un campo.
 *
 * Los mismos textos se usan en el cliente y en el servidor: el navegador los
 * muestra al salir del campo y el endpoint los devuelve si algo se le escapó
 * al JavaScript. Así la persona nunca ve dos redacciones distintas del mismo
 * problema.
 */
export interface FieldMessages {
  /** Cuando está vacío y es obligatorio. */
  required?: string;
  /** Cuando el formato no cuadra: correo mal escrito, teléfono muy corto. */
  invalid?: string;
  /**
   * Confirmación cuando el campo queda bien.
   *
   * Déjalo vacío salvo que el mensaje AÑADA información ("te escribiremos
   * aquí"). Poner "correcto" bajo cada campo es ruido: la palomita verde ya
   * comunica lo mismo sin ocupar una línea ni distraer del siguiente campo.
   */
  success?: string;
}

export interface FormField {
  /** Nombre del campo. Es la clave que llega a GHL — ver `GHL_CONTACT_FIELDS`. */
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  /** Texto de ayuda bajo el campo. */
  hint?: string;
  required?: boolean;
  /** Opciones para `select`. */
  options?: { value: string; label: string }[];
  /** Valor fijo para `hidden`, o valor inicial. */
  value?: string;
  /** Ancho en la rejilla: `half` deja dos campos por fila en escritorio. */
  width?: "full" | "half";
  /** Textos de error y de éxito. Ver DEFAULT_FIELD_MESSAGES para los genéricos. */
  messages?: FieldMessages;
  /** Autocompletado del navegador. Bien puesto, acelera muchísimo el llenado. */
  autocomplete?: string;
  /** Mínimo de caracteres (o de dígitos, en `tel`). */
  minLength?: number;
  /** Máximo de caracteres (o de dígitos, en `tel`). */
  maxLength?: number;
}

/** Mensajes del envío completo, no de un campo suelto. */
export interface FormMessages {
  /** Mientras se envía. */
  submitting?: string;
  /** Cuando se guardó bien. */
  success?: string;
  /** Cuando hay campos mal llenados. */
  validationError?: string;
  /** Cuando el servidor o GHL fallan. */
  serverError?: string;
  /** Cuando no hay conexión. */
  networkError?: string;
}

export interface FormDefinition {
  id: string;
  /** Nombre legible. Viaja en el payload para identificar el origen en GHL. */
  name: string;
  fields: FormField[];
  submitLabel: string;
  /** Texto legal bajo el botón. Acepta HTML simple. */
  consentText?: string;
  /** Textos del envío. Ver DEFAULT_FORM_MESSAGES para los genéricos. */
  messages?: FormMessages;
  /**
   * Qué pasa al enviar con éxito.
   *   "redirect" (por defecto) → va a /gracias/{id}. Es lo que quiere un funnel:
   *      una URL propia que se puede medir como conversión en analytics.
   *   "inline" → el formulario se reemplaza por el mensaje de éxito sin cambiar
   *      de página. Útil en un formulario de contacto dentro de una landing
   *      larga, donde mandar a otra página rompe la lectura.
   */
  successMode?: "redirect" | "inline";
  /**
   * A qué webhook va. "default" → FORM_WEBHOOK_URL, "alt" → FORM_WEBHOOK_URL_ALT.
   * Si se pide "alt" y no está configurada, se cae a la default.
   */
  webhook?: "default" | "alt";
  /** Copy de la página de gracias que se genera para este formulario. */
  confirmation: {
    title: string;
    message: string;
    /** Pasos de "qué pasa ahora". Bajan la ansiedad y las bajas por confusión. */
    steps?: string[];
    /** id de un CTA del registro (src/config/ctas.ts) para el siguiente paso. */
    ctaId?: string;
  };
}

/**
 * Mensajes genéricos de campo.
 *
 * Están redactados en segunda persona y diciendo QUÉ HACER, no qué falló:
 * "Escribe tu nombre" en vez de "Campo inválido". Un mensaje que solo señala
 * el error deja a la persona adivinando cómo arreglarlo.
 */
export const DEFAULT_FIELD_MESSAGES: Record<FieldType, Required<Omit<FieldMessages, "success">>> = {
  text: { required: "Este campo es obligatorio.", invalid: "Revisa lo que escribiste." },
  email: {
    required: "Escribe tu correo.",
    invalid: "Ese correo no se ve bien. Revisa que tenga @ y un dominio.",
  },
  tel: {
    required: "Escribe tu número.",
    invalid: "El número no se ve completo. Escríbelo sin el código de país.",
  },
  textarea: { required: "Este campo es obligatorio.", invalid: "Revisa lo que escribiste." },
  select: { required: "Elige una opción.", invalid: "Elige una opción de la lista." },
  checkbox: { required: "Debes aceptar para continuar.", invalid: "Debes aceptar para continuar." },
  hidden: { required: "", invalid: "" },
};

/** Mensajes genéricos del envío. */
export const DEFAULT_FORM_MESSAGES: Required<FormMessages> = {
  submitting: "Enviando…",
  success: "¡Listo! Recibimos tus datos.",
  validationError: "Revisa los campos marcados en rojo y vuelve a enviar.",
  // Dice explícitamente que los datos NO se guardaron. Un "hubo un error"
  // ambiguo deja a la persona sin saber si debe reintentar o si ya quedó.
  serverError:
    "No pudimos guardar tus datos. No se registró nada, así que puedes intentarlo de nuevo en un momento.",
  networkError:
    "No hay conexión con el servidor. Revisa tu internet e inténtalo otra vez; tus datos siguen aquí.",
};

/** Resuelve los mensajes de un campo, con los genéricos de respaldo. */
export function fieldMessages(field: FormField): Required<FieldMessages> {
  const defaults = DEFAULT_FIELD_MESSAGES[field.type];
  return {
    required: field.messages?.required ?? defaults.required,
    invalid: field.messages?.invalid ?? defaults.invalid,
    success: field.messages?.success ?? "",
  };
}

/** Resuelve los mensajes de un formulario, con los genéricos de respaldo. */
export function formMessages(form: FormDefinition): Required<FormMessages> {
  return { ...DEFAULT_FORM_MESSAGES, ...form.messages };
}

/**
 * Campos que GoHighLevel ya reconoce y mapea solo al contacto.
 * Usar exactamente estos nombres evita tener que crear campos personalizados
 * en GHL para lo básico.
 */
export const GHL_CONTACT_FIELDS = ["firstName", "lastName", "email", "phone", "name"] as const;

/**
 * Códigos de país para el campo de teléfono.
 * Lista curada de los mercados de PSJ en vez de las ~200 del mundo: una lista
 * corta se elige más rápido en móvil, y meter `libphonenumber-js` por esto
 * costaría más kilobytes que todo el formulario.
 */
export const COUNTRY_CODES = [
  { value: "52", label: "🇲🇽 México +52" },
  { value: "1", label: "🇺🇸 EE. UU. +1" },
  { value: "57", label: "🇨🇴 Colombia +57" },
  { value: "34", label: "🇪🇸 España +34" },
  { value: "51", label: "🇵🇪 Perú +51" },
  { value: "56", label: "🇨🇱 Chile +56" },
  { value: "54", label: "🇦🇷 Argentina +54" },
  { value: "593", label: "🇪🇨 Ecuador +593" },
  { value: "502", label: "🇬🇹 Guatemala +502" },
  { value: "58", label: "🇻🇪 Venezuela +58" },
] as const;

// ── Los formularios ────────────────────────────────────────────────────────

export const forms = {
  /** Captación básica. El que va en landings y a media lectura en los posts. */
  "optin-reto": {
    id: "optin-reto",
    name: "Opt-in Reto",
    submitLabel: "Empezar el reto",
    consentText:
      'Al registrarte aceptas recibir correos de Para Siempre Juntos. Puedes darte de baja cuando quieras. <a href="/privacidad">Aviso de privacidad</a>.',
    fields: [
      {
        name: "firstName",
        label: "Tu nombre",
        type: "text",
        placeholder: "María",
        required: true,
        autocomplete: "given-name",
        minLength: 2,
        messages: { required: "Escribe tu nombre para saber cómo llamarte." },
      },
      {
        name: "email",
        label: "Tu correo",
        type: "email",
        placeholder: "maria@correo.com",
        required: true,
        autocomplete: "email",
        messages: {
          required: "Escribe tu correo: ahí te llega el acceso al reto.",
          invalid: "Ese correo no se ve bien. Revisa que tenga @ y un dominio.",
          // Añade información en vez de repetir que está bien.
          success: "Te mandaremos el acceso a este correo.",
        },
      },
    ],
    confirmation: {
      title: "¡Listo! Ya estás dentro",
      message:
        "Te acabamos de mandar un correo con los detalles. Si no lo ves en unos minutos, revisa la carpeta de promociones o spam.",
      steps: [
        "Busca el correo de Para Siempre Juntos y márcalo como importante.",
        "El reto arranca el lunes: ese día te llega la primera lección.",
        "Aparta 15 minutos en tu mañana desde ahora.",
      ],
      ctaId: "leer-blog",
    },
  },

  /** Soporte. Va al webhook alterno si está configurado. */
  contacto: {
    id: "contacto",
    name: "Contacto",
    submitLabel: "Enviar mensaje",
    webhook: "alt",
    // Contacto va en línea: mandar a otra página a alguien que solo hizo una
    // pregunta rompe la lectura de la landing sin ganar nada.
    successMode: "inline",
    messages: {
      submitting: "Enviando tu mensaje…",
      success: "Mensaje recibido. Te respondemos en menos de 24 horas hábiles.",
    },
    fields: [
      {
        name: "firstName",
        label: "Tu nombre",
        type: "text",
        required: true,
        width: "half",
        autocomplete: "given-name",
        minLength: 2,
        messages: { required: "Escribe tu nombre." },
      },
      {
        name: "email",
        label: "Tu correo",
        type: "email",
        required: true,
        width: "half",
        autocomplete: "email",
        messages: {
          required: "Escribe tu correo: es a donde te responderemos.",
          success: "Te responderemos aquí.",
        },
      },
      {
        name: "message",
        label: "¿En qué te ayudamos?",
        type: "textarea",
        placeholder: "Cuéntanos con detalle para poder responderte bien.",
        required: true,
        minLength: 10,
        messages: {
          required: "Cuéntanos tu duda para poder ayudarte.",
          invalid: "Escribe un poco más de detalle (al menos 10 caracteres).",
        },
      },
    ],
    confirmation: {
      title: "Mensaje recibido",
      message:
        "Gracias por escribirnos. Respondemos en menos de 24 horas hábiles al correo que nos dejaste.",
      ctaId: "empezar-reto",
    },
  },

  /** Registro con WhatsApp, para los grupos de acompañamiento del reto. */
  "registro-whatsapp": {
    id: "registro-whatsapp",
    name: "Registro WhatsApp",
    submitLabel: "Úneme al grupo",
    consentText:
      'Al registrarte aceptas recibir mensajes por WhatsApp y correo. Puedes salirte cuando quieras. <a href="/privacidad">Aviso de privacidad</a>.',
    fields: [
      {
        name: "firstName",
        label: "Tu nombre",
        type: "text",
        required: true,
        autocomplete: "given-name",
        minLength: 2,
        messages: { required: "Escribe tu nombre." },
      },
      {
        name: "email",
        label: "Tu correo",
        type: "email",
        required: true,
        autocomplete: "email",
        messages: { required: "Escribe tu correo: te mandamos ahí el enlace de respaldo." },
      },
      {
        name: "phoneCountry",
        label: "País",
        type: "select",
        required: true,
        width: "half",
        value: "52",
        options: COUNTRY_CODES.map((c) => ({ value: c.value, label: c.label })),
        messages: { required: "Elige tu país para armar bien el número." },
      },
      {
        name: "phone",
        label: "WhatsApp",
        type: "tel",
        placeholder: "81 1234 5678",
        required: true,
        width: "half",
        autocomplete: "tel-national",
        hint: "Solo el número, sin el código de país.",
        minLength: 8,
        maxLength: 15,
        messages: {
          required: "Escribe tu número de WhatsApp.",
          invalid: "El número no se ve completo. Van entre 8 y 15 dígitos, sin el código de país.",
          success: "Ahí te llega la invitación al grupo.",
        },
      },
    ],
    confirmation: {
      title: "Te esperamos en el grupo",
      message:
        "En los próximos minutos te llega el enlace de invitación por WhatsApp y también por correo, por si acaso.",
      steps: [
        "Guarda nuestro número para que no te caiga en spam.",
        "Entra al grupo con el enlace que te mandamos.",
        "Preséntate: el primer mensaje es el que más engancha.",
      ],
      ctaId: "empezar-reto",
    },
  },
} as const satisfies Record<string, FormDefinition>;

export type FormId = keyof typeof forms;

/** Devuelve la definición de un formulario, o null si el id no existe. */
export function getForm(id: string): FormDefinition | null {
  return (forms as Record<string, FormDefinition>)[id] ?? null;
}

/** Todos los formularios, para generar las páginas de gracias. */
export function getAllForms(): FormDefinition[] {
  return Object.values(forms as Record<string, FormDefinition>);
}
