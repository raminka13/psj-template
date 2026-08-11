/**
 * Genera public/og-default.jpg a partir de un SVG.
 *
 * Se guarda como JPG y no como SVG porque WhatsApp y algunas versiones de
 * Facebook no renderizan SVG en las tarjetas de enlace: se ve el enlace pelón.
 *
 *   node scripts/generate-og.mjs
 *
 * Al re-marcar el template, cambia los colores y textos de aquí abajo y
 * vuelve a correrlo.
 */

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = join(root, "public", "og-default.jpg");

// ── Edita esto al re-marcar ───────────────────────────────────────────────
const BRAND = {
  title: "Para Siempre Juntos",
  subtitle: "Contenido de fe que transforma tu vida",
  gradientFrom: "#1e2a5a",
  gradientTo: "#3b5bdb",
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND.gradientFrom}"/>
      <stop offset="100%" stop-color="${BRAND.gradientTo}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1060" cy="110" r="270" fill="#ffffff" opacity="0.07"/>
  <circle cx="140" cy="560" r="180" fill="#ffffff" opacity="0.05"/>
  <text x="96" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="700" fill="#ffffff">${BRAND.title}</text>
  <text x="96" y="372" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#ffffff" opacity="0.82">${BRAND.subtitle}</text>
  <rect x="96" y="424" width="120" height="6" rx="3" fill="#ffffff" opacity="0.55"/>
</svg>`;

await mkdir(dirname(outputPath), { recursive: true });
await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(outputPath);

// Sin este aviso es imposible saber si el script corrió o falló en silencio.
console.log(`✓ OG generada: ${outputPath}`);
