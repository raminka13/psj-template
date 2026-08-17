/**
 * ============================================================================
 *  OVERRIDES DE TEMA POR PÁGINA
 * ============================================================================
 *  Los valores por defecto viven en src/styles/tokens.css y aplican a todo el
 *  sitio. Este archivo permite que UNA página concreta se salga de ellos sin
 *  tocar el CSS global — útil para funnels donde cada reto tiene su color.
 *
 *  Uso:
 *      <PageLayout theme={{ primary: "#C81E3A", radiusCard: "0.25rem" }}>
 *
 *  Funciona porque las utilidades de Tailwind resuelven la variable en el
 *  punto de uso (ver la explicación de `@theme inline` en global.css). Al
 *  reescribir la variable en <html>, toda la página hereda el cambio.
 *
 *  Los derivados (hover, soft, sombra de marca) se recalculan solos con
 *  color-mix: basta con dar el color base.
 * ============================================================================
 */

/** Claves disponibles para el prop `theme`, con la variable CSS que escriben. */
const THEME_VAR_MAP = {
  // Marca
  primary: "--brand-primary",
  secondary: "--brand-secondary",
  accent: "--brand-accent",
  onPrimary: "--brand-primary-on",
  onSecondary: "--brand-secondary-on",
  onAccent: "--brand-accent-on",

  // Superficies y texto
  surface: "--surface",
  surfaceMuted: "--surface-muted",
  surfaceRaised: "--surface-raised",
  ink: "--ink",
  inkMuted: "--ink-muted",
  line: "--line",

  // Bordes redondeados
  radiusBtn: "--radius-btn",
  radiusInput: "--radius-input",
  radiusCard: "--radius-card",
  radiusImage: "--radius-image",
  radiusModal: "--radius-modal",

  // Medidas y ritmo
  containerMax: "--container-page",
  sectionY: "--spacing-section",
  headerH: "--header-h",
  measure: "--measure",

  // Tipografía
  fontBody: "--font-body",
  fontHeading: "--font-heading",
  trackingDisplay: "--tracking-display",
  leadingBody: "--leading-body",

  // Foco
  ringColor: "--ring-color",
  ringWidth: "--ring-w",
} as const;

export type ThemeOverrides = Partial<Record<keyof typeof THEME_VAR_MAP, string>>;

/**
 * Convierte el objeto `theme` en un string de declaraciones CSS.
 * Devuelve `undefined` si no hay nada que sobrescribir, para no emitir un
 * atributo style vacío.
 */
export function themeToStyle(theme?: ThemeOverrides): string | undefined {
  if (!theme) return undefined;

  const declarations = Object.entries(theme)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => {
      const cssVar = THEME_VAR_MAP[key as keyof typeof THEME_VAR_MAP];
      return cssVar ? `${cssVar}: ${value}` : null;
    })
    .filter((declaration): declaration is string => declaration !== null);

  return declarations.length > 0 ? declarations.join("; ") : undefined;
}

/**
 * ============================================================================
 *  PRESETS DE MARCA
 * ============================================================================
 *  Un preset da nombre a un juego de overrides para no repetir los colores en
 *  cada página de un mismo funnel.
 *
 *  ── POR QUÉ UN PRESET LLEVA `light` Y `dark` ────────────────────────────
 *  <ThemeVars> emite las variables sobre `:root`, en línea y dentro del <head>
 *  después de la hoja global. `:root` y `[data-theme="dark"]` tienen la MISMA
 *  especificidad (0,1,0), así que gana el que va después — y el que va después
 *  es siempre <ThemeVars>. Consecuencia: un preset que solo declarara colores
 *  de modo claro se los impondría también al modo oscuro, y el bloque
 *  `[data-theme="dark"]` de tokens.css nunca llegaría a aplicar.
 *
 *  No es teórico. Los tres presets anteriores declaraban un solo color y, al
 *  conectarlos por primera vez a una página, el acento quedaba así sobre el
 *  fondo oscuro (mínimo WCAG AA: 4.5:1):
 *
 *      retoSabiduria (violeta)  2.69:1   ✗
 *      masSabiduria             3.40:1   ✗
 *      emprende                 4.08:1   ✗   (y 4.48:1 en CLARO, también bajo)
 *
 *  Por eso `dark` no es opcional en la práctica para cualquier preset que
 *  toque color: si declaras `light.primary`, declara también `dark.primary` y
 *  `dark.onPrimary`. Las claves que no son de color (radios, `sectionY`) sí
 *  valen igual en los dos modos y van solo en `light`.
 *
 *  Los valores de abajo están MEDIDOS, no estimados, en los seis pares que
 *  importan (texto sobre el botón, acento sobre superficie y acento sobre su
 *  propio `-soft`, en claro y en oscuro). Todos quedan entre 5.5:1 y 9.2:1.
 *  Al tocar cualquiera, vuelve a medir: aclarar el acento aclara también su
 *  fondo `-soft`, así que el contraste no mejora, empeora.
 *
 *  `secondary` y `accent` no se renderizan en ninguna página del template
 *  (solo los usan <Button variant="secondary"> y <Badge>, que nadie invoca con
 *  esas variantes). Se mantienen por coherencia del preset, pero si algún día
 *  se usan hay que medirlos igual.
 * ============================================================================
 */
export interface ThemePreset {
  /** Valores de modo claro. Aquí van también los radios y el ritmo. */
  light: ThemeOverrides;
  /**
   * Valores de modo oscuro. Obligatorio en la práctica si `light` toca color:
   * ver la nota de cascada de arriba.
   */
  dark?: ThemeOverrides;
}

export const themePresets = {
  /** Identidad principal de PSJ — es la de tokens.css, no hace falta pasarla. */
  psj: { light: {}, dark: {} },

  /**
   * Reto de Sabiduría: azul de tinta con dorado.
   *
   * Era violeta (`oklch(0.48 0.17 285)`) y se cambió por dos razones que
   * apuntan al mismo sitio: DESIGN.md prohíbe por nombre el acento
   * azul-violeta genérico, y la regla `ai-color-palette` del detector marca
   * el rango de tono 260–310 cuando cae en un titular. El azul de tinta
   * conserva la seriedad que buscaba el violeta y mantiene el par con el oro.
   */
  retoSabiduria: {
    light: {
      primary: "oklch(0.45 0.14 245)",
      secondary: "oklch(0.78 0.14 85)",
      accent: "oklch(0.55 0.12 230)",
      radiusCard: "1rem",
    },
    dark: {
      primary: "oklch(0.74 0.11 245)",
      onPrimary: "oklch(0.18 0.012 245)",
      secondary: "oklch(0.82 0.13 85)",
      accent: "oklch(0.72 0.11 230)",
    },
  },

  /** Más Sabiduría: verde bosque, formas más suaves. */
  masSabiduria: {
    light: {
      primary: "oklch(0.44 0.11 165)",
      secondary: "oklch(0.74 0.13 65)",
      accent: "oklch(0.52 0.12 200)",
      radiusCard: "1.75rem",
      radiusBtn: "9999px",
    },
    dark: {
      primary: "oklch(0.76 0.11 165)",
      onPrimary: "oklch(0.18 0.012 165)",
      secondary: "oklch(0.8 0.12 65)",
      accent: "oklch(0.72 0.11 200)",
    },
  },

  /** Emprende con Propósito: terracota, look más anguloso. */
  emprende: {
    light: {
      primary: "oklch(0.5 0.15 38)",
      secondary: "oklch(0.45 0.1 250)",
      accent: "oklch(0.5 0.13 145)",
      radiusCard: "0.5rem",
      radiusBtn: "0.375rem",
    },
    dark: {
      primary: "oklch(0.74 0.13 38)",
      onPrimary: "oklch(0.18 0.012 38)",
      secondary: "oklch(0.72 0.1 250)",
      accent: "oklch(0.74 0.12 145)",
    },
  },
} as const satisfies Record<string, ThemePreset>;

export type ThemePresetName = keyof typeof themePresets;
