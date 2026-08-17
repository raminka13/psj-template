# PSJ Template — guía del proyecto

Template base de Astro para las páginas de **Para Siempre Juntos (PSJ)**.
Se clona una copia por cada página, funnel o micrositio nuevo.

Stack: Astro 7 (salida estática) · Tailwind 4 · TypeScript strict · Netlify.

---

## Regla de oro

**Ningún componente escribe colores, radios, sombras ni espaciado de sección
literales.** Todo sale de tokens. Si necesitas un valor que no existe como
token, agrégalo a `src/styles/tokens.css` — no lo escribas inline.

Esto es lo que permite re-marcar una página entera editando un archivo. En
cuanto un componente lleva `bg-[#c81e3a]` o `py-24`, esa promesa se rompe y
nadie se entera hasta que hay que cambiar la marca.

Auditoría rápida de que se sigue cumpliendo:

```bash
grep -rE '#[0-9a-fA-F]{3,8}|rgba?\(|rounded-\[|py-\[' src/components src/layouts src/pages
```

Solo `src/styles/tokens.css` y `src/config/theme.ts` deben definir colores.

---

## Los 4 archivos que se editan al clonar

| Archivo                    | Qué cambiar                                       |
| -------------------------- | ------------------------------------------------- |
| `src/config/site.ts`       | Dominio, nombre, descripción, keywords, redes, OG  |
| `src/styles/tokens.css`    | Colores de marca, radios, espaciado, sombras       |
| `src/config/fonts.ts`      | Tipografías (solo el `name` de cada familia)       |
| `src/config/navigation.ts` | Menú del header y columnas del footer              |
| `src/config/ctas.ts`       | Textos y destinos de las llamadas a la acción      |
| `src/config/forms.ts`      | Campos de los formularios y copy de las gracias    |
| `.env`                     | URL del webhook de GHL (`cp .env.example .env`)    |

Después: `npm run og` para regenerar la imagen de Open Graph con la marca nueva.

---

## Sistema de tokens

Dos capas, y la separación importa:

```
src/styles/tokens.css   ← los valores. Es el archivo que se edita.
src/styles/global.css   ← el puente hacia Tailwind. Casi nunca se toca.
```

En `tokens.css` hay dos bloques:

- **`:root { }`** — valores con nombre propio (`--brand-primary`, `--surface`,
  `--ink`). `global.css` los conecta a utilidades con `@theme inline`.
- **`@theme { }`** — valores cuyo nombre ya cae en un namespace de Tailwind
  (`--radius-*`, `--shadow-*`, `--ease-*`, `--spacing-*`, `--text-*`) y por eso
  generan su clase directamente.

`@theme inline` no es opcional en el puente: sin `inline`, Tailwind congela el
valor al compilar y ni el modo oscuro ni los overrides por página tendrían
efecto. Con `inline`, `bg-primary` compila a `background-color: var(--brand-primary)`
y la referencia se resuelve donde se usa.

### Utilidades disponibles

| Categoría   | Clases                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------- |
| Marca       | `bg-primary` `text-primary` `bg-primary-soft` `bg-primary-hover` `text-on-primary`, ídem `secondary` y `accent` |
| Superficies | `bg-surface` `bg-surface-muted` `bg-surface-raised` `bg-surface-inverse`                  |
| Texto       | `text-ink` `text-ink-muted` `text-ink-subtle` `text-ink-inverse`                          |
| Bordes      | `border-line` `border-line-strong`                                                        |
| Estados     | `bg-success` `bg-warning` `bg-danger` (+ `-soft`)                                         |
| Radios      | `rounded-btn` `rounded-card` `rounded-input` `rounded-image` `rounded-badge` `rounded-modal` |
| Sombras     | `shadow-sm` `shadow-card` `shadow-lg` `shadow-brand`                                      |
| Tipografía  | `font-sans` `font-display` · `text-display` `text-h1` `text-h2` `text-h3` `text-lead`     |
| Ritmo       | `py-section` `py-section-sm` `max-w-page` `h-header` · `measure` (ancho de lectura)        |
| Movimiento  | `ease-out-soft` `ease-smooth` `ease-spring`                                               |

La escala tipográfica es fluida (`clamp`): crece con el viewport sin media queries.

### Cambiar el tema de UNA sola página

```astro
<PageLayout theme={{ primary: "#C81E3A", radiusCard: "0.25rem", sectionY: "4rem" }}>
```

Las claves están en `src/config/theme.ts`. También hay presets con nombre
(`themePresets.retoSabiduria`, `.masSabiduria`, `.emprende`) para funnels que
se repiten.

### Modo oscuro

Vive en `[data-theme="dark"]` de `tokens.css`. Lo pone un script inline en
`BaseLayout` **antes del primer paint**, leyendo `localStorage` y, si no hay
nada, la preferencia del sistema. Usa `dark:` normal en las clases.

---

## Sistema de SEO

Una página declara solo lo que la diferencia; el resto sale de `site.ts`.

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import { getFaqs } from "@lib/content";

const faqs = await getFaqs();
---

<PageLayout
  seo={{
    title: "Reto de Sabiduría",           // el sufijo "| PSJ" se agrega solo
    description: "…",                      // se recorta a ~158 caracteres
    keywords: ["reto de fe", "…"],         // se combinan con las globales
    faqs,                                  // genera el FAQPage del JSON-LD
    breadcrumbs: [{ name: "Retos", href: "/retos" }],
  }}
>
```

Se emite **un solo bloque `<script type="application/ld+json">`** por página,
con un `@graph` donde las entidades se referencian por `@id`. Varios bloques
sueltos hacen que Google lea la misma organización como entidades distintas.

### FAQs — una sola fuente de datos

El mismo array va al layout (que genera el schema) y al componente (que lo
dibuja). Nunca los dupliques:

```astro
<PageLayout seo={{ title: "…", faqs }}>
  <FaqSection items={faqs} />
</PageLayout>
```

### Entidades extra de schema

```astro
---
import { product, course, event } from "@lib/schema";
---
<PageLayout
  seo={{ title: "…" }}
  schemaExtra={[product({ name: "…", description: "…", price: 27, url: "/reto" })]}
>
```

Disponibles: `product()` `course()` `event()` `videoObject()` `article()`
`faqPage()` `breadcrumbList()`.

### Páginas que NO deben indexarse

Las rutas de funnel (`/gracias`, `/checkout`, `/upsell`, `/oto`, `/downsell`,
`/replay-privado`) llevan `noindex` automático y quedan fuera del sitemap y del
robots.txt. La lista está en `site.noindexPatterns`. Para una página suelta:
`seo={{ noindex: true }}`.

---

## Estructura

```
src/
├─ config/      site.ts · tokens de marca · fonts.ts · navigation.ts · theme.ts
├─ styles/      tokens.css (los valores) · global.css (el puente)
├─ lib/         seo.ts · schema.ts · blog.ts · content.ts
├─ layouts/     BaseLayout (sin chrome) · PageLayout (header+footer)
├─ components/
│  ├─ seo/      Seo.astro · Faq.astro
│  ├─ ui/       Button Card Badge Container Section SectionHeading Prose ThemeToggle
│  └─ sections/ Hero Features Testimonials FaqSection Cta Header Footer BlogList PostCard
├─ content/     blog/*.md · retos/*.md
├─ data/        faqs.json · testimonios.json · fechas.json
└─ pages/       index · 404 · acerca · proximos-retos · blog/ · retos/ · robots.txt.ts · rss.xml.ts
```

`BaseLayout` para páginas sin distracciones (venta larga, checkout, replay).
`PageLayout` para todo lo demás.

---

## Contenido

`src/content.config.ts` valida el frontmatter con Zod **en tiempo de build**:
un post sin `description` rompe el build en vez de publicar un `<meta>` vacío.

Un post nuevo es un `.md` en `src/content/blog/`. Todo su SEO (título,
descripción, keywords, fechas, portada, tags, FAQs) sale del frontmatter — no
hay nada que escribir a mano.

`draft: true` lo saca del build, del listado, del RSS y del sitemap, pero sigue
visible en `astro dev` para poder revisarlo.

**Las FAQs y los testimonios llevan un campo `order` obligatorio.** No es
decorativo: `getCollection()` no respeta el orden del array del JSON, así que
sin él salen barajados. Usa siempre los helpers de `@lib/content`
(`getFaqs()`, `getTestimonios()`), que ya ordenan.

### Fechas de arranque

`src/data/fechas.json` dice cuándo empieza cada grupo, y de ahí sale
`/proximos-retos`. Una entrada son cuatro campos: `reto` (el nombre del archivo
en `src/content/retos/`), `startDate` en `YYYY-MM-DD`, `status` y una `note`
opcional.

Es una colección aparte y no un campo del reto porque la relación es
uno-a-muchos: el mismo reto abre grupo cada pocas semanas. Metido en el
frontmatter habría que reescribir el archivo del programa cada vez que se abre
una fecha.

`getProximasFechas()` es el único acceso, y hace tres cosas que no conviene
saltarse:

- **Filtra las fechas pasadas** en cada build. Un calendario es el único
  contenido que se rompe solo: sin el filtro, la página seguiría anunciando un
  grupo que arrancó en marzo.
- **Rompe el build** si una fecha apunta a un reto que no existe, en vez de
  publicar una fila que enlaza a un 404.
- **Avisa en consola** cuando no queda ninguna fecha futura. La página tiene
  estado vacío, pero el aviso es lo que hace que alguien lo note.

Esta colección **no lleva `order`** a propósito: el orden lo fija `startDate`,
que ya es un dato de la fecha. Un `order` paralelo se desincronizaría del
calendario a la primera edición.

Las fechas se muestran con `Intl` y **`timeZone: "UTC"` es obligatorio** en los
formateadores: `"2026-09-07"` se interpreta como medianoche UTC, y formatearla en
la zona del servidor de build la correría un día atrás en cualquier huso
negativo. El lunes 7 se publicaría como "domingo 6".

---

## Comandos

```bash
npm run dev       # servidor local en :4321
npm run build     # build de producción a dist/
npm run check     # tipos (debe salir 0 errores)
npm run og        # regenera public/og-default.jpg con la marca actual
npm run format    # prettier
```

---

## Accesibilidad — lo que ya está resuelto, no lo rompas

- Enlace "Saltar al contenido" como primer elemento tabulable.
- `:focus-visible` con anillo del color de marca, global.
- `prefers-reduced-motion` anula animaciones y transiciones.
- FAQ y menú móvil con `<details>` nativo: funcionan sin JS y son navegables
  por teclado de fábrica.
- Testimonios en `<figure>/<blockquote>/<figcaption>`.
- Iconos decorativos con `aria-hidden="true"`.

Si un elemento es clicable, que sea `<a>` o `<button>` — nunca un `<div>` con
listener.

---

## Trampa de TypeScript: el prop `as`

Cuando un componente renderiza una etiqueta dinámica (`<Tag>`), **Astro deja de
inferir el tipo de `Astro.props` y todo se vuelve `any` en silencio**. Por eso
esos componentes llevan anotación explícita:

```astro
import type { HTMLTag } from "astro/types";
interface Props { as?: HTMLTag; /* … */ }
const { as: Tag = "div", /* … */ }: Props = Astro.props;
```

Sin el `: Props` el build pasa igual, pero se pierde todo el chequeo de tipos
del componente. Si agregas un componente con `as`, copia este patrón.

---

## Formularios

Un formulario se pone en cualquier página o post con una línea:

```astro
<Form id="optin-reto" location="seccion-registro" />
```

Se dibuja desde el registro `src/config/forms.ts`. Vienen tres: `optin-reto`,
`contacto` y `registro-whatsapp`. **Agregar uno nuevo es agregar un objeto a ese
archivo** — no hay que tocar componentes, ni el endpoint, ni crear la página de
gracias (se genera sola).

De esa misma definición salen el HTML, la validación del servidor
(`src/lib/forms.ts` deriva el esquema de Zod) y el copy de la confirmación. Un
`id` que no exista rompe el build a propósito.

### Cómo llegan los datos a GoHighLevel

`<Form>` → POST a `/api/form` → el servidor reenvía a GHL.

**Nunca postees a GHL desde el navegador.** Su Inbound Webhook no pide API key:
la URL *es* la credencial. En el HTML, cualquiera podría inyectar contactos en el
CRM. Por eso `FORM_WEBHOOK_URL` está declarada como `secret` en el esquema de
`astro:env` — si alguien intenta importarla en código de cliente, el build falla.

`/api/form` es la **única ruta on-demand** del sitio (`export const prerender =
false`). Las páginas que contienen formularios siguen siendo estáticas.

### Tres reglas del payload que no se pueden romper

Son restricciones de GHL, no preferencias:

1. **Plano y en camelCase.** GHL exige claves de una sola palabra, sin espacios.
2. **Sin arrays.** GHL los recibe pero no los puede usar dentro de las acciones;
   los valores múltiples se unen con comas.
3. **Siempre el mismo juego de claves, aunque vayan vacías.** GHL arma el mapeo
   de campos con un request de muestra: una clave que no venga en esa muestra no
   aparece en el desplegable del workflow y no se puede usar nunca. Por eso
   `buildGhlPayload()` emite la unión de los campos de *todos* los formularios,
   con `""` donde no aplica. Si esto se "optimizara" quitando las claves vacías,
   los formularios que compartan workflow perderían campos en silencio.

El teléfono se normaliza a E.164 (`+528112345678`) con `toE164()`. Sin eso no
sirve para WhatsApp ni para los envíos de GHL.

### Mensajes de error y de éxito

Todos los textos viven en el registro, junto al campo o al formulario:

```ts
{
  name: "email", type: "email", required: true,
  messages: {
    required: "Escribe tu correo: ahí te llega el acceso al reto.",
    invalid:  "Ese correo no se ve bien. Revisa que tenga @ y un dominio.",
    success:  "Te mandaremos el acceso a este correo.",
  },
}
```

Si no declaras ninguno, se usan los de `DEFAULT_FIELD_MESSAGES` /
`DEFAULT_FORM_MESSAGES`.

Cuatro decisiones que conviene no deshacer:

1. **`required` e `invalid` son mensajes distintos.** "Está vacío" y "está mal
   escrito" no son el mismo problema ni se arreglan igual; un único "campo
   inválido" deja a la persona adivinando.
2. **Los mismos textos los usan el cliente y el servidor.** `fieldMessages()`
   alimenta tanto la validación del navegador como el esquema de Zod. Si el
   navegador dijera una cosa y el servidor otra, parecería que en el segundo
   intento se hizo mal algo distinto.
3. **`success` solo si añade información.** La palomita verde ya comunica que
   el campo está bien; poner "correcto" bajo cada uno es ruido. Úsalo para
   decir algo útil ("te responderemos aquí").
4. **`novalidate` lo pone el JavaScript, nunca el HTML.** Así quien no tenga JS
   conserva la validación nativa del navegador. Si lo escribieras en el markup,
   esas personas se quedarían sin ninguna validación en el cliente.

Cuándo se valida: al **salir** del campo (no mientras se escribe por primera
vez, que es regañar por un correo a medio teclear) y otra vez al escribir si el
campo ya estaba en rojo, para que el error desaparezca en cuanto se corrige.

### Estado del envío

`FormStatus.astro` muestra cuatro estados con su icono: `loading`, `success`,
`error` de validación y `error` de servidor o de red. Los mensajes de red y de
servidor **dicen explícitamente que los datos no se guardaron**, para que la
persona sepa si debe reintentar.

Va con `role="alert"` y `aria-live="assertive"` en un contenedor que ya existe
en el DOM: los lectores de pantalla solo anuncian cambios dentro de una región
viva preexistente. Si el elemento con `aria-live` apareciera junto con el texto,
muchos no dirían nada.

### `successMode`: a dónde va después de enviar

- `"redirect"` (por defecto) → `/gracias/{id}`. Es lo que quiere un funnel: una
  URL propia que se puede medir como conversión.
- `"inline"` → el formulario se reemplaza por el mensaje de éxito sin cambiar de
  página. Para contacto dentro de una landing larga, donde saltar de página
  rompe la lectura.

Sin JavaScript **siempre** redirige, aunque el modo sea `inline`: el endpoint
responde con un 303 y la página de gracias existe igual.

### Anti-spam y errores

Honeypot (responde éxito falso para que el bot no reintente) y trampa de tiempo
(`FORM_MIN_SECONDS`). No hay límite por IP: en funciones serverless un contador
en memoria no es fiable entre invocaciones, así que sería una falsa sensación de
seguridad. Si algún día llega spam real, el punto de enganche es Turnstile.

**Si el webhook falla, se devuelve error y se registra el payload completo en los
logs.** No se finge éxito: fingirlo pierde el lead para siempre y en silencio.

### Funciona sin JavaScript

El POST nativo llega al endpoint y este responde con un 303 a la página de
gracias. El script solo mejora: errores por campo sin recargar y bloqueo del
doble envío. Al tocar `Form.astro` o `Field.astro`, **prueba siempre con JS
desactivado** (`form.submit()` desde la consola salta el listener y reproduce
ese camino).

### Atribución

`UtmCapture.astro` guarda las UTMs del **primer toque** en `sessionStorage` y las
inyecta al enviar. Sin eso, alguien que entra por un anuncio a un post y convierte
en otra página se atribuiría a "directo".

---

## CTAs

Cada CTA se define una vez en `src/config/ctas.ts` y se invoca por id:

```astro
<CtaButton id="empezar-reto" location="hero" />
<CtaBanner id="empezar-reto" anchorId="cta-final" />
<CtaInline id="optin-email" />          {/* a media lectura, sirve en MDX */}
<CtaCard   id="optin-email" withForm /> {/* incrusta el formulario */}
<CtaSticky id="empezar-reto" hideNear="#cta-final" />
```

Cambiar el texto o el destino en veinte páginas es editar una línea. **No
escribas botones de CTA a mano**: pierdes el tracking y vuelves al problema de
tener CTAs desincronizados entre páginas.

`CtaSticky` se esconde cuando el CTA principal está a la vista (`hideNear`) para
no mostrar el mismo botón dos veces, y solo aparece en móvil.

Todos emiten `data-cta` y `data-cta-location`; `CtaTracking.astro` los manda a
`dataLayer`/`gtag` con un solo listener delegado. Medir un CTA nuevo no requiere
tocar la página que lo usa.

---

## Páginas de confirmación

`/gracias/{formId}` se genera **estáticamente** desde el registro de formularios.
El copy de cada una vive en `confirmation` dentro de la definición del formulario.

`ConfirmationLayout` fuerza `noindex` y quita el menú a propósito: es el momento
de mayor atención de la sesión y cada enlace de más es una salida.

---

## Variables de entorno

Se declaran en el bloque `env` de `astro.config.mjs` y se documentan en
`.env.example`. Para trabajar en local: `cp .env.example .env`.

Para inspeccionar el payload sin tener GHL conectado, apunta `FORM_WEBHOOK_URL` a
`http://localhost:4321/api/echo` y mira la consola del servidor.

---

## Retos

Cada reto es un `.md` en `src/content/retos/`. De ese único archivo salen **cuatro
cosas a la vez**, así que añadir un reto es añadir un archivo y nada más:

1. Su página en `/retos/{id}` (`src/pages/retos/[reto].astro`)
2. Su tarjeta en `/retos` y en la home
3. Su entrada en el submenú del header
4. Su enlace en la columna "Programas" del footer

Por eso `navigation.ts` **no** lista los retos a mano: si lo hiciera, cada reto
nuevo obligaría a acordarse de editarlo y el menú acabaría desfasado del footer.

Dos campos que se confunden fácil:

- **`description`** → el `<meta description>`, 50-160 caracteres. Para el resultado
  de búsqueda.
- **`promise`** → la bajada del hero, máximo 20 palabras (validado por Zod). Usar
  la descripción aquí empuja el botón fuera de la primera pantalla.

**No inventes precios.** El schema soporta `offer` en `course()`, pero los retos
del template no declaran precio a propósito: una cifra inventada en el JSON-LD es
un dato falso declarado a Google.

### El submenú del header

Se abre con hover, pero eso es solo una de las tres formas de llegar:

- **Teclado** → `:focus-within` en CSS. Al tabular hasta "Retos" el panel aparece
  y sus enlaces entran en el orden de tabulación. Cero JavaScript.
- **Táctil** → no existe el hover, por eso el enlace padre navega a `/retos`, una
  página real. Un padre que solo abre el menú deja a esas personas sin salida.
- **Escape** → cierra y devuelve el foco al padre. Necesita un `data-nav-closed`
  propio porque `:focus-within` mantendría el panel abierto.

Debajo de la lista de retos van los enlaces fijos del panel ("Próximos retos",
"Ver todos los retos"). Salen de `retosSubnav` en `navigation.ts`, no del markup
del Header: una entrada de menú escondida en un componente es una entrada que
nadie encuentra cuando hay que cambiarla. En móvil se filtra la que apunta al
mismo destino que el enlace padre.

**El header está topado en 5 entradas y las cinco están ocupadas** (Inicio,
Retos, Acerca, Blog, Preguntas). Para meter una sexta hay que sacar otra, no
estirar el menú: por eso "Próximos retos" vive en el submenú y "Testimonios"
quedó solo en el footer. Y el footer aguanta exactamente **3 columnas** — su
rejilla es `[1.5fr_repeat(3,1fr)]`, así que una cuarta se cae a otra fila en
tablet.

El panel se separa del disparador con `padding`, no con `margin`: con margen queda
una zona muerta y el menú se cierra al bajar el ratón. El cierre lleva 200ms de
gracia para que un desvío en diagonal no lo cancele a medio camino.

---

## Reglas de composición

Estas son las que hacen que una página no se lea como plantilla generada. Son
**contables**, así que se pueden verificar antes de dar algo por terminado.

| Regla | Límite | Cómo se comprueba |
| --- | --- | --- |
| Eyebrows (etiqueta sobre el título) | `≤ ceil(secciones / 3)` | `grep -c 'eyebrow=' src/pages/x.astro` |
| Familias de layout distintas | ≥ 4 por página | contar componentes de sección distintos |
| Misma familia seguida | máx 2 veces | leer el orden de secciones |
| Elementos de texto del hero | máx 4 | `Hero.astro` no acepta más |
| Líneas del titular en escritorio | máx 2 | medir, no mirar |
| Acentos de marca por vista | 1 | `primary` es el único visible |
| Labels por intención de CTA | 1 | revisar `src/config/ctas.ts` |

Detalles que se violan solos si nadie los vigila:

- **Nada de trust-strips en el hero.** Ni "+5.000 personas", ni logos, ni precio.
  Todo eso va en una franja debajo. El hero es un mensaje, no un resumen.
- **Los eyebrows se borran, no se reemplazan.** Si una sección necesita etiqueta
  para entenderse, el problema es el titular. La posición en la página ya
  categoriza.
- **Para enfatizar en un titular, `<em>`.** Itálica de la misma familia. Nunca
  otro color, otra fuente ni un degradado.
- **Centrar es una decisión, no un default.** `SectionHeading` alinea a la
  izquierda; el centrado se pide donde aporta.
- **Nada de barras de acento laterales** en citas o tarjetas. Es el patrón que
  el detector marca como el tell más reconocible de UI generada.

### Motion

| Elemento | Duración | Por qué |
| --- | --- | --- |
| Hover | 150ms | Se ve decenas de veces al día |
| Pulsación de botón | 120ms | Rango de feedback táctil: 100-160ms |
| Desplegables, acordeón | 200ms | Rango 150-250ms |
| Entrada del hero | 600ms | Es explicativo y se ve una vez; el tope corto no aplica |

`--ease-out-soft` es la curva de todo lo que entra o sale. **Nunca `ease-in` en
interfaz**: arranca lento justo cuando la persona mira, y se siente pesado aunque
dure lo mismo. Solo se animan `transform` y `opacity`.

### Antes de dar por terminada una página

```bash
node .claude/skills/impeccable/scripts/detect.mjs --json src/components src/pages src/layouts
```

Debe salir `[]`. Y si tocaste colores, **mide el contraste, no lo estimes**: al
cambiar la paleta de este template fallaron cuatro pares que "se veían bien"
(placeholder 3.65, éxito 3.03). Los tonos de estado se usan como texto sobre su
propio `-soft`, así que su luminosidad la fija el contraste, no el gusto.

---

## Skills de diseño instalados

En `.agents/skills/` (con symlinks desde `.claude/skills/`), versionados con el
repo para que viajen con cada copia:

- **impeccable** — vocabulario de diseño y detección de patrones genéricos.
- **taste-skill** — `design-taste-frontend`, `stitch-design-taste`.
- **ui-ux-pro-max** — bases de estilos, paletas, pares tipográficos, guías por
  stack (incluye Astro). Sus scripts de búsqueda **requieren Python 3**.
- **emil-design-eng** — animación e interacción: `animate`,
  `review-animations`, `improve-animations`, `apple-design`, `prototype`.

Consúltalos al construir o revisar UI. Al aplicar lo que sugieran, tradúcelo
siempre a tokens de este proyecto: si un skill propone un color o un radio
concreto, va a `tokens.css`, no al componente.

Son 31 skills; si el ruido estorba, se podan borrando carpetas de
`.agents/skills/`. Están versionados justamente para poder revisarlos.

---

## Al crear una página nueva

1. Empieza por `PageLayout` y las secciones existentes (`Hero`, `Features`,
   `Testimonials`, `FaqSection`, `CtaBanner`) antes de escribir maqueta nueva.
2. Declara el `seo` completo: `title`, `description`, `keywords` y, si hay
   preguntas, `faqs`.
3. Para capturar leads usa `<Form id="…" />` con un id del registro. Si el
   formulario que necesitas no existe, agrégalo a `src/config/forms.ts` en vez
   de escribir campos a mano.
4. Los CTA salen de `<CtaButton>`/`<CtaBanner>` con un id del registro, no de
   botones sueltos.
5. Si es una página de funnel que no debe indexarse, comprueba que su ruta
   caiga en `site.noindexPatterns` o pon `noindex: true`.
6. Si la página necesita otra identidad visual, usa el prop `theme` — no
   escribas colores en las clases.
7. Cierra con `npm run check` y `npm run build`.
