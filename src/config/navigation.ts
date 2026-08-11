/**
 * ============================================================================
 *  NAVEGACIÓN
 * ============================================================================
 *  Los menús del header y del footer. Editando esto cambian los dos.
 * ============================================================================
 */

export interface NavLink {
  label: string;
  href: string;
  /** Abre en pestaña nueva y agrega rel de seguridad. */
  external?: boolean;
  /**
   * Rellena un submenú desplegable con contenido dinámico.
   *
   * "retos" hace que el Header cargue la colección de retos y liste uno por
   * entrada. Se resuelve en el Header y no aquí porque leer una colección es
   * asíncrono y este archivo es de configuración pura.
   *
   * El enlace padre SIEMPRE navega a un destino real: en pantallas táctiles no
   * existe el hover, así que un padre que solo abre el menú deja a esas
   * personas sin poder llegar a la sección.
   */
  dropdown?: "retos";
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

/** Menú principal del header. Máximo 5 entradas: más de eso nadie las lee. */
export const mainNav: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Retos", href: "/retos", dropdown: "retos" },
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Blog", href: "/blog" },
  { label: "Preguntas", href: "/#preguntas" },
];

/** CTA del header. Es la única acción destacada de la barra. */
export const headerCta: NavLink = {
  label: "Empezar el reto",
  href: "/retos",
};

/** Columnas del footer. */
export const footerNav: FooterColumn[] = [
  {
    title: "Contenido",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Retos", href: "/retos" },
      { label: "Testimonios", href: "/#testimonios" },
    ],
  },
  /**
   * La columna "Programas" NO se escribe a mano: el Footer la genera desde la
   * colección de retos. Si se listaran aquí, cada reto nuevo obligaría a
   * acordarse de editar este archivo, y el footer terminaría desactualizado
   * respecto al menú, que es lo que pasa siempre.
   */
  {
    title: "Legal",
    links: [
      { label: "Aviso de privacidad", href: "/privacidad" },
      { label: "Términos y condiciones", href: "/terminos" },
    ],
  },
];
