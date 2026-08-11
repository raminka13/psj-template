/**
 * ============================================================================
 *  REGISTRO DE CTAs
 * ============================================================================
 *  Cada llamada a la acción se define UNA vez y las páginas la invocan por id:
 *
 *      <CtaButton id="empezar-reto" />
 *
 *  El punto: cuando cambie el precio, la fecha de apertura o el texto del
 *  botón, se edita aquí y cambia en las veinte páginas que lo usan. Con los
 *  CTA copiados a mano siempre queda uno viejo diciendo "cupos abiertos" tres
 *  semanas después de cerrar.
 *
 *  Cada CTA lleva su id a los atributos data-cta del HTML, así que medir
 *  clics en analytics no requiere tocar ninguna página. Ver CtaTracking.astro.
 * ============================================================================
 */

import type { FormId } from "@config/forms";

export interface CtaDefinition {
  /** Texto del botón. Que empiece con un verbo: "Empezar", no "Más info". */
  label: string;
  /** Destino. Ruta interna, ancla (#retos) o URL externa. */
  href: string;
  /** Aspecto. `primary` para la acción principal de la página. */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /** Título para los bloques grandes (banner, tarjeta). */
  title?: string;
  /** Bajada para los bloques grandes. */
  description?: string;
  /** Letra chica bajo el botón: garantía, cupos, "sin tarjeta". */
  note?: string;
  /** Acción secundaria opcional, al lado de la principal. */
  secondary?: { label: string; href: string };
  /** Abre en pestaña nueva con rel de seguridad. */
  external?: boolean;
  /** Si el CTA abre un formulario, su id del registro de formularios. */
  formId?: FormId;
}

/**
 * UN LABEL POR INTENCIÓN.
 *
 * Antes convivían "Empezar el reto", "Quiero entrar al reto" y "Ver los retos".
 * Son la misma intención escrita de tres formas, y eso tiene un costo real: la
 * persona no sabe si los tres botones llevan al mismo sitio, y en analítica
 * quedan tres etiquetas para una sola conversión.
 *
 * Antes de añadir un CTA, comprueba que su intención no esté ya cubierta. Si
 * lo está, reutiliza el id que existe en vez de inventar otra redacción.
 */
export const ctas = {
  /** Intención: EMPEZAR. Es la acción principal de todo el sitio. */
  "empezar-reto": {
    label: "Empezar el reto",
    href: "/retos",
    variant: "primary",
    title: "El próximo grupo empieza el lunes",
    description:
      "Entras hoy, empiezas el lunes con todos los demás. Si a los 14 días no era para ti, te devolvemos tu dinero.",
    note: "Sin suscripción. Un solo pago con acceso de por vida.",
    secondary: { label: "Tengo una pregunta", href: "/#preguntas" },
  },

  /**
   * Misma intención EMPEZAR, pero con el formulario incrustado en vez de un
   * enlace. Comparte la etiqueta a propósito: cambia el mecanismo, no la
   * promesa, así que la persona no tiene que releer para saber qué hace.
   */
  "empezar-reto-form": {
    label: "Empezar el reto",
    href: "/#registro",
    variant: "primary",
    title: "Recibe el reto en tu correo",
    description:
      "Quince minutos al día durante 21 días. Empiezas el lunes con un grupo que arranca contigo.",
    formId: "optin-reto",
  },

  /** Intención distinta: unirse al grupo de acompañamiento. */
  "unirse-whatsapp": {
    label: "Únete al grupo",
    href: "/#registro",
    variant: "primary",
    title: "El acompañamiento pasa en el grupo",
    description: "Ahí van los recordatorios diarios, las dudas y las sesiones en vivo.",
    formId: "registro-whatsapp",
  },

  /** Intención LEER. */
  "leer-blog": {
    label: "Leer el blog",
    href: "/blog",
    variant: "outline",
  },

  /** Intención CONTACTAR. */
  contacto: {
    label: "Escríbenos",
    href: "/#contacto",
    variant: "outline",
  },
} as const satisfies Record<string, CtaDefinition>;

export type CtaId = keyof typeof ctas;

/** Devuelve un CTA del registro. Lanza si el id no existe. */
export function getCta(id: string): CtaDefinition {
  const cta = (ctas as Record<string, CtaDefinition>)[id];

  // Fallar en el build y no en silencio: un CTA que no existe se renderizaría
  // como un botón sin texto ni destino, y eso pasa desapercibido en revisión.
  if (!cta) {
    throw new Error(
      `CTA "${id}" no existe en src/config/ctas.ts. Disponibles: ${Object.keys(ctas).join(", ")}`,
    );
  }

  return cta;
}
