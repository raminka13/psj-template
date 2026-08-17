---
name: Para Siempre Juntos — Template
description: Sistema visual editorial y sereno para páginas de contenido de fe en español.
colors:
  brand-primary: "oklch(0.5 0.11 205)"
  brand-secondary: "oklch(0.72 0.15 45)"
  brand-accent: "oklch(0.68 0.17 155)"
  on-primary: "oklch(0.99 0 0)"
  surface: "oklch(1 0 0)"
  surface-muted: "oklch(0.976 0.004 70)"
  surface-inverse: "oklch(0.22 0.014 70)"
  ink: "oklch(0.23 0.012 70)"
  ink-muted: "oklch(0.52 0.012 70)"
  ink-subtle: "oklch(0.56 0.011 70)"
  ink-inverse: "oklch(0.98 0 0)"
  line: "oklch(0.905 0.005 70)"
  line-strong: "oklch(0.83 0.008 70)"
  success: "oklch(0.48 0.15 150)"
  warning: "oklch(0.75 0.15 75)"
  danger: "oklch(0.5 0.2 25)"
typography:
  display:
    fontFamily: "Newsreader, Georgia, Times New Roman, serif"
    fontSize: "clamp(2.5rem, 1.6rem + 4vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2.25rem, 1.5rem + 3.2vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(1.75rem, 1.3rem + 1.9vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "0.375rem"
  input: "0.625rem"
  btn: "0.75rem"
  card: "1.25rem"
  image: "1.5rem"
  pill: "9999px"
spacing:
  gutter: "1.5rem"
  section-sm: "clamp(2.5rem, 1.5rem + 3vw, 3.5rem)"
  section: "clamp(3.5rem, 2rem + 6vw, 6rem)"
  page-max: "80rem"
  measure: "68ch"
components:
  button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.btn}"
    padding: "0 1.5rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "oklch(0.44 0.1 205)"
    textColor: "{colors.on-primary}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.btn}"
    padding: "0 1.5rem"
    height: "2.75rem"
  card-elevated:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.5rem"
  card-soft:
    backgroundColor: "oklch(0.95 0.011 205)"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.5rem"
  input-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "0.75rem 1rem"
  badge-primary:
    backgroundColor: "oklch(0.95 0.011 205)"
    textColor: "{colors.brand-primary}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
---

# Design System: Para Siempre Juntos — Template

## Overview

**Creative North Star: "El Devocional de Sobremesa"**

Un libro de lectura diaria que vive en la mesa de la cocina. Se abre todos los
días, se lee en quince minutos y no intenta impresionar a nadie: su autoridad
viene de estar ahí y de leerse bien, no de llamar la atención. Todo el sistema
sale de esa imagen — una serif de publicación pensada para lectura sostenida,
papel de tono cálido, y una interfaz que se aparta para dejar leer.

La densidad es baja y el aire es generoso, pero no es un sistema "minimalista"
por estética: es que el contenido se consume a diario y cualquier decoración
cansa a la tercera visita. El acento frío sobre neutros cálidos es deliberado —
el calor lo dan el papel y los grises, así que el color de marca puede ser
sobrio sin que la página se sienta corporativa.

El sistema está construido sobre tokens semánticos: ningún componente escribe un
color, un radio o un espaciado literal. Eso no es higiene de código, es la
función del producto — es un template del que se saca una copia por cada página
de PSJ, y re-marcar una copia entera tiene que ser editar un archivo.

**Key Characteristics:**

- Serif editorial para títulos, sans altamente legible para cuerpo
- Un solo acento visible: teal apagado sobre neutros cálidos
- Plano en reposo; la sombra es respuesta a un estado, no decoración
- Escala tipográfica y espaciado fluidos (`clamp`), sin media queries
- Modo claro y oscuro con paridad de contraste medida, no estimada

## Colors

Una paleta de un solo acento: un teal apagado que nunca compite con el
contenido, apoyado en neutros de tinte cálido que aportan la cercanía que el
acento no gasta.

### Primary

- **Verde Azulado Sereno** (`oklch(0.5 0.11 205)`): el único acento visible en
  pantalla. Botones primarios, enlaces, anillo de foco, numeración de pasos,
  iconos activos. Su tono se eligió por distancia: queda a 55° del verde de
  éxito, 130° del ámbar y 180° del rojo, así que un botón nunca se confunde con
  un estado. En modo oscuro sube a `oklch(0.72 0.12 205)` y su texto encima se
  invierte a oscuro.

### Secondary

- **Ámbar Cálido** (`oklch(0.72 0.15 45)`): reservado para presets de funnel y
  acentos puntuales. No aparece en la misma vista que el primario.

### Tertiary

- **Verde Vivo** (`oklch(0.68 0.17 155)`): igual que el ámbar, existe para
  presets y destacados de programa. Fuera de la vista por defecto.

### Neutral

- **Papel** (`oklch(1 0 0)`): fondo de página y de tarjetas elevadas.
- **Papel Sombreado** (`oklch(0.976 0.004 70)`): secciones alternas. El tinte
  cálido (tono 70) es lo que da temperatura al sistema.
- **Tinta** (`oklch(0.23 0.012 70)`): texto principal, 16.9:1 sobre papel.
- **Tinta Suave** (`oklch(0.52 0.012 70)`): texto secundario y bajadas.
- **Tinta Tenue** (`oklch(0.56 0.011 70)`): placeholders y pies. Su luminosidad
  está fijada por el contraste (4.68:1), no por gusto.
- **Trazo** (`oklch(0.905 0.005 70)`): hairlines, divisores y bordes de campo.

### Estados

- **Verde Confirmación** (`oklch(0.48 0.15 150)`), **Ámbar Aviso**
  (`oklch(0.75 0.15 75)`), **Rojo Error** (`oklch(0.5 0.2 25)`).

### Named Rules

**La Regla del Acento Único.** Solo `brand-primary` es visible en una pantalla.
`secondary` y `accent` existen para estados y presets de funnel; si aparecen los
tres a la vez, la página deja de leerse como marca y empieza a leerse como
plantilla.

**La Regla del Frío sobre Cálido.** El acento es frío y los neutros cálidos. La
temperatura la aportan el papel y los grises, nunca el acento. Calentar el
acento rompe el equilibrio y empuja el sistema al beige de catálogo.

**La Regla del Contraste Medido.** Los tonos de estado se usan como texto sobre
su propio fondo suave, así que su luminosidad la fija la medición y no la
estética. Aclararlos también aclara su fondo: el contraste no mejora, empeora.

## Typography

**Display Font:** Newsreader (con Georgia, Times New Roman)
**Body Font:** Inter (con system-ui, -apple-system, Segoe UI)

**Character:** Newsreader es una serif de publicación dibujada para lectura
sostenida en pantalla, con optical sizing real — los títulos grandes usan un
dibujo de más contraste y astas más finas. Inter aporta apertura y altura de x
para el cuerpo, que es lo que sostiene la legibilidad en pantallas malas y con
vista cansada. El contraste entre ambas es de género, no de tamaño: eso es lo
que hace que un título se lea como título sin necesidad de gritar.

### Hierarchy

- **Display** (700, `clamp(2.5rem, 1.6rem + 4vw, 4.25rem)`, 1.1): títulos de
  hero. El tope es 4.25rem y está medido: por encima, un titular de 7-8 palabras
  salta a tres líneas en una columna de hero.
- **Headline** (700, `clamp(2.25rem, 1.5rem + 3.2vw, 3.5rem)`, 1.1): `<h1>` de
  páginas interiores.
- **Title** (600, `clamp(1.75rem, 1.3rem + 1.9vw, 2.5rem)`, 1.15): títulos de
  sección y citas destacadas.
- **Lead** (400, `clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)`, 1.55): bajadas.
- **Body** (400, 1rem, 1.65): texto corrido. Ancho de lectura tope 68ch.
- **Label** (500, 0.875rem, 1.4): navegación, etiquetas de campo, botones.

### Named Rules

**La Regla del Énfasis en Familia.** Para destacar una palabra dentro de un
titular se usa `<em>` — itálica de la misma serif. Nunca otro color, otra
fuente ni un degradado. Newsreader carga su itálica precisamente para esto.

**La Regla del Tracking de Serif.** El tracking de display es casi neutro
(`-0.005em`). Las grotescas piden -0.02em para cerrar huecos; una serif ya trae
ese ajuste dibujado en las serifas, y apretarla más pega los remates.

**La Regla de las Dos Líneas.** Un titular de hero ocupa como máximo dos líneas
en escritorio. Tres líneas es un error de escala tipográfica, no de longitud de
copy: se baja el tamaño o se recorta el titular, y se mide.

## Layout

Contenedor de 80rem con márgenes laterales de 1.5rem. El ritmo vertical lo lleva
un único token de sección fluido (`clamp(3.5rem, 2rem + 6vw, 6rem)`): 6rem en
escritorio y ~3.4rem en móvil, porque un valor fijo que se ve elegante en un
monitor ocupa casi un tercio de la pantalla en un teléfono.

La rejilla base es de 12 columnas y se usa asimétricamente: el texto del hero
ocupa 8 columnas en portátil y 7 en escritorio ancho, dejando el resto como aire
deliberado. Las secciones de formulario reparten 5/6 entre argumento y campos.

El texto corrido se limita a 68ch. La escala tipográfica y el espaciado son
fluidos, así que el sistema no declara breakpoints propios más allá de los de
Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).

## Elevation & Depth

Sistema plano con capas tonales. La profundidad la dan tres cosas en este orden:
el tinte de fondo entre secciones (`surface` frente a `surface-muted`), los
hairlines de 1px, y solo al final la sombra. Las sombras que existen son
tenues y están teñidas con el tono cálido de los neutros, nunca en negro puro —
una sombra negra sobre papel cálido se ve sucia y despegada.

### Shadow Vocabulary

- **shadow-sm** (`0 1px 2px oklch(0.2 0.01 70 / 0.05)`): separación mínima de
  tarjeta en reposo.
- **shadow-card** (`0 1px 2px … 0.04, 0 8px 24px … 0.06`): tarjetas elevadas.
- **shadow-lg** (`0 2px 4px … 0.04, 0 16px 48px … 0.1`): paneles flotantes,
  submenú de navegación, respuesta a hover.
- **shadow-brand** (`0 8px 24px color-mix(in oklab, brand-primary 28%, transparent)`):
  única sombra con color. Exclusiva del botón primario.

### Named Rules

**La Regla de Plano en Reposo.** Las superficies son planas por defecto. La
sombra aparece como respuesta a un estado — hover, foco, elevación real — o para
separar algo que de verdad flota sobre el contenido. Una sombra permanente en
una tarjeta estática es decoración.

## Shapes

Escala de radios semántica, no numérica: `rounded-card` sigue significando lo
mismo aunque cambie su valor, `rounded-xl` no. Los valores forman una progresión
suave (pequeño 0.375rem → campo 0.625rem → botón 0.75rem → tarjeta 1.25rem →
imagen 1.5rem) más una píldora completa para badges y avatares. El paso pequeño
existe para elementos diminutos —código en línea, casillas— donde el radio de
campo los deja casi circulares.

Las divisiones se hacen con hairlines de 1px en `line`, y con `divide-y` antes
que con cajas: agrupar por proximidad y línea fina se lee más ligero que meter
cada cosa en su propio contenedor.

### Named Rules

**La Regla de Una Sola Escala.** El sistema usa una escala de radios y la aplica
entera. Botones de esquina redonda en una página de tarjetas cuadradas, o al
revés, es diseño roto. Para cambiar el carácter de forma de una página se
cambian todos los radios a la vez, no uno.

## Components

### Buttons

- **Shape:** esquinas suaves (`0.75rem`), altura fija por tamaño (2.25 / 2.75 / 3.5rem).
- **Primary:** fondo `brand-primary`, texto `on-primary`, `shadow-brand`.
- **Hover / Focus:** el fondo se oscurece un 12% en 120ms. Al pulsar, el botón
  baja 1px. El foco usa el anillo global de 2px en el color de marca.
- **Outline / Ghost:** borde `line-strong` sobre transparente, o solo texto con
  fondo teñido al hover. Nunca dos botones sólidos juntos.
- Renderiza `<a>` si tiene destino y `<button>` si no: un `<div>` con listener no
  se tabula, no responde a Enter y el lector de pantalla no lo anuncia.

### Cards / Containers

- **Corner Style:** `1.25rem`.
- **Background:** `surface` para elevadas, tinte de marca al 10% para las suaves.
- **Shadow Strategy:** ver Elevation. En reposo, borde antes que sombra.
- **Border:** hairline `line`; en tarjetas tintadas, `brand-primary` al 22%.
- **Internal Padding:** 1.5rem.
- En rejillas, las celdas alternan tinte: una rejilla de tarjetas idénticas
  blancas sobre blanco no da jerarquía y hace que cosas distintas parezcan la
  misma.

### Inputs / Fields

- **Style:** fondo `surface`, borde `line`, radio `0.625rem`, padding 0.75/1rem.
- **Label:** siempre encima del campo. El placeholder nunca hace de etiqueta —
  desaparece al escribir y deja sin referencia a quien usa lector de pantalla.
- **Focus:** anillo global de 2px con 2px de separación.
- **Error:** borde `danger`, mensaje debajo del campo, `aria-invalid`.
- **Éxito:** borde `success` y palomita a la derecha; el mensaje de texto solo
  aparece si añade información, no para decir "correcto".

### Navigation

- Barra fija de 4.5rem con fondo translúcido y desenfoque. Etiquetas en `label`,
  estado activo con fondo teñido de marca.
- El submenú se abre con `:hover` **y** `:focus-within`, y su enlace padre
  navega a una página real: sin eso, teclado y pantallas táctiles se quedan
  fuera. Cierra con 200ms de gracia para que un desvío del ratón no lo cancele.

### Steps (componente propio)

Secuencia numerada en banda horizontal, sin tarjetas: círculos con borde de
marca unidos por un hairline. Existe porque una secuencia no es una rejilla —
meter pasos ordenados en tarjetas iguales esconde justo lo que importa, que hay
un orden.

## Do's and Don'ts

### Do:

- **Do** usar `<em>` para enfatizar dentro de un titular: itálica de la misma
  familia.
- **Do** teñir las sombras con el tono cálido de los neutros
  (`oklch(0.2 0.01 70 / …)`), nunca negro puro.
- **Do** medir el contraste al tocar la paleta. Al cambiar el acento de este
  sistema fallaron cuatro pares que "se veían bien" (placeholder 3.65, éxito
  3.03). Mínimo 4.5:1, o 3:1 en texto ≥18px.
- **Do** mantener ≥40° de separación de tono entre el acento y los colores de
  estado, para que un botón no se confunda con un error.
- **Do** separar con hairline y proximidad antes que con una caja.

### Don't:

- **Don't** usar `Fraunces` ni `Instrument Serif` como display. Son las serifs
  que todo generador de UI elige por defecto y delatan el origen del diseño
  antes de que nadie lea una palabra.
- **Don't** aplicar degradados de color al texto. Un titular con tres colores de
  marca es la firma visual del titular generado por IA, rompe la regla del
  acento único, y con `color: transparent` desaparece por completo si el
  `background-clip` falla.
- **Don't** volver a un acento azul-violeta genérico (tono ~264). Es el color
  por defecto de cualquier interfaz generada y no dice nada de esta marca.
- **Don't** poner una barra de acento gruesa al lado de citas o tarjetas
  (`border-left: 3px solid`). El detector de Impeccable la marca por sí sola
  como el recurso más reconocible de la UI generada por máquina.
