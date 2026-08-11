/**
 * ============================================================================
 *  TIPOGRAFÍAS
 * ============================================================================
 *  Para cambiar de fuente basta con cambiar el string `name`. Astro descarga
 *  la fuente, la auto-hospeda en el build y genera un fallback con métricas
 *  ajustadas para que no haya salto de layout (CLS) mientras carga.
 *
 *  Los `cssVariable` se conectan con Tailwind en src/styles/global.css:
 *      --font-body    →  clase `font-sans`
 *      --font-heading →  clase `font-display`
 *
 *  IMPORTANTE: `latin-ext` no es opcional para PSJ. El subset `latin` a secas
 *  no incluye ñ ni todas las vocales acentuadas en algunas familias.
 *
 *  ── POR QUÉ ESTAS DOS ────────────────────────────────────────────────────
 *
 *  Newsreader (títulos). Es una serif de publicación, diseñada para lectura
 *  larga en pantalla. Se elige por una razón concreta y no por "se ve premium":
 *  el contenido de PSJ es devocional y de lectura sostenida, que es literalmente
 *  el género para el que se dibujó. Es variable, así que trae optical sizing
 *  real: los títulos grandes usan un dibujo con menos peso en las astas y más
 *  contraste, y el texto pequeño uno más robusto. Eso lo hace un tipo, no un
 *  escalado.
 *
 *  Antes aquí había Fraunces, y se cambió a propósito: junto con Instrument
 *  Serif es la serif que todos los generadores de UI eligen por defecto, así
 *  que delata el origen del diseño antes de que nadie lea una palabra.
 *
 *  Inter (cuerpo). Se mantiene por accesibilidad, no por costumbre: la
 *  audiencia es amplia y mayor, leyendo español con acentos y ñ, y la altura
 *  de x y la apertura de Inter siguen siendo difíciles de superar en pantallas
 *  malas y con vista cansada.
 * ============================================================================
 */

import type { AstroUserConfig } from "astro";
import { fontProviders } from "astro/config";

/**
 * El tipo se toma de la propia config de Astro en vez de dejarlo inferir.
 * Sin él, `weights: [400, 500]` se infiere como `number[]` y Astro espera una
 * tupla no vacía, así que el error solo aparecería al compilar la config.
 */
export const fonts: NonNullable<AstroUserConfig["fonts"]> = [
  {
    provider: fontProviders.google(),
    name: "Inter",
    cssVariable: "--font-body",
    weights: [400, 500, 600, 700],
    styles: ["normal"],
    subsets: ["latin", "latin-ext"],
    fallbacks: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  },
  {
    provider: fontProviders.google(),
    name: "Newsreader",
    cssVariable: "--font-heading",
    weights: [400, 500, 600, 700],
    // La itálica se carga a propósito: es como se enfatiza una palabra dentro
    // de un titular. Meter otra fuente o otro color para destacar una palabra
    // es un recurso de aficionado; la itálica de la MISMA familia es el gesto
    // correcto y no rompe la unidad tipográfica.
    styles: ["normal", "italic"],
    subsets: ["latin", "latin-ext"],
    fallbacks: ["Georgia", "Times New Roman", "serif"],
  },
];

/**
 * Para cambiar una tipografía:
 *   1. Cambia `name` por la familia que quieras (Google Fonts).
 *   2. Ajusta `weights` a los pesos que esa familia sí tenga.
 *   3. Revisa `fallbacks`: deben ser del mismo género (serif con serif).
 * No hay que tocar nada más: los cssVariable ya están conectados a Tailwind.
 */
