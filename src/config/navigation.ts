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

/**
 * Menú principal del header. Máximo 5 entradas: más de eso nadie las lee.
 *
 * "Acerca" entró en el hueco que dejó "Testimonios", no como sexta entrada. La
 * decisión: los testimonios son un ancla a una sección de la home y además
 * aparecen dentro de cada página de reto y de /acerca, así que se llega a ellos
 * por todos lados; "Acerca de PSJ" es una página propia y sin entrada en el
 * menú no se llega nunca. Sigue enlazada desde el footer.
 *
 * "Próximos retos" NO está aquí a propósito: vive en el submenú de Retos
 * (`retosSubnav`), que es donde la busca quien acaba de leer un reto. Meterla
 * arriba habría dejado el menú en seis entradas y dos de ellas diciendo "reto".
 */
export const mainNav: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Retos", href: "/retos", dropdown: "retos" },
  { label: "Acerca", href: "/acerca" },
  { label: "Blog", href: "/blog" },
  { label: "Preguntas", href: "/#preguntas" },
];

/**
 * Enlaces fijos que cierran el submenú de Retos, debajo de la lista de retos
 * que el Header genera desde la colección.
 *
 * Estaban escritos a mano dentro de Header.astro ("Ver todos los retos"). Salen
 * a la config porque este archivo es el que alguien abre para editar los menús:
 * una entrada de menú escondida en el markup de un componente es una entrada que
 * nadie encuentra cuando hay que cambiarla.
 *
 * En móvil no se repite la que apunta al mismo destino que el enlace padre.
 */
export const retosSubnav: NavLink[] = [
  { label: "Próximos retos", href: "/proximos-retos" },
  { label: "Ver todos los retos", href: "/retos" },
];

/** CTA del header. Es la única acción destacada de la barra. */
export const headerCta: NavLink = {
  label: "Empezar el reto",
  href: "/retos",
};

/**
 * Columnas del footer.
 *
 * Son DOS aquí y tres en pantalla: el Footer inserta "Programas" en medio. Y
 * tres es el número máximo, no una casualidad — la rejilla del footer es
 * `[1.5fr_repeat(3,1fr)]`, así que una cuarta columna se caería a una segunda
 * fila en tablet. Si algún día hacen falta más enlaces, se agrupan dentro de
 * estas columnas antes de tocar esa rejilla.
 */
export const footerNav: FooterColumn[] = [
  {
    title: "Contenido",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Retos", href: "/retos" },
      { label: "Próximos retos", href: "/proximos-retos" },
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
    /**
     * Antes se llamaba "Legal" y solo llevaba privacidad y términos. "Acerca de
     * PSJ" no cabía en "Contenido" (no es contenido, es la marca) y abrir una
     * cuarta columna rompía la rejilla, así que la columna pasó a agrupar todo
     * lo institucional. Es el patrón normal de footer: la empresa y su letra
     * chica juntas.
     */
    title: "Sobre PSJ",
    links: [
      { label: "Acerca de PSJ", href: "/acerca" },
      { label: "Aviso de privacidad", href: "/privacidad" },
      { label: "Términos y condiciones", href: "/terminos" },
    ],
  },
];
