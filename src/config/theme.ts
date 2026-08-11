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
 * Presets de marca reutilizables entre funnels.
 *
 * Un preset es solo un ThemeOverrides con nombre: si vas a hacer cinco
 * páginas del mismo reto, defínelo aquí una vez en vez de repetir los
 * colores en cada página.
 */
export const themePresets = {
  /** Identidad principal de PSJ — es la de tokens.css, no hace falta pasarla. */
  psj: {},

  /** Reto de Sabiduría: índigo profundo con dorado. */
  retoSabiduria: {
    primary: "oklch(0.48 0.17 285)",
    secondary: "oklch(0.78 0.14 85)",
    accent: "oklch(0.62 0.14 320)",
    radiusCard: "1rem",
  },

  /** Más Sabiduría: verde bosque, formas más suaves. */
  masSabiduria: {
    primary: "oklch(0.5 0.12 165)",
    secondary: "oklch(0.74 0.13 65)",
    accent: "oklch(0.58 0.15 200)",
    radiusCard: "1.75rem",
    radiusBtn: "9999px",
  },

  /** Emprende con Propósito: naranja terracota, look más anguloso. */
  emprende: {
    primary: "oklch(0.58 0.17 40)",
    secondary: "oklch(0.45 0.1 250)",
    accent: "oklch(0.68 0.16 145)",
    radiusCard: "0.5rem",
    radiusBtn: "0.375rem",
  },
} as const satisfies Record<string, ThemeOverrides>;

export type ThemePresetName = keyof typeof themePresets;
