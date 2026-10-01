---
name: motion-presets-kit
description: Guía de uso de motion-presets-kit, presets y componentes de animación para motion/react (fade, slide, scale, clipReveal, parentVariants, TextAnimate, Marquee, Draggable, useCounter). Úsala siempre que escribas animaciones con motion-presets-kit para conocer la API, los valores por defecto y los patrones correctos.
---

# motion-presets-kit

Set tipado y validado en runtime (Zod) de helpers y presets para `motion/react`.
La API es **variant-returning**: funciones puras que devuelven `Variants`, no
componentes wrapper. También incluye componentes para casos complejos.

## Instalación

```bash
pnpm add motion-presets-kit motion zod react react-dom
```

`motion`, `zod`, `react` y `react-dom` son **peer dependencies**. Compatible con
React 18+ / 19 y `motion` ^12.

## Entry points

| Import | Contenido |
|---|---|
| `motion-presets-kit` | todo (presets + componentes + schemas) |
| `motion-presets-kit/presets` | `fade`, `slide`, `scale`, `clipReveal`, `parentVariants` |
| `motion-presets-kit/components` | `TextAnimate`, `Marquee`, `Draggable`, `useCounter` |

Importa desde el entry point más específico posible: cada preset es
tree-shakeable.

## Opciones comunes a todos los presets

| Opción | Default | Descripción |
|---|---|---|
| `duration` | `0.5` | Segundos de la transición. |
| `delay` | `0` | Retardo en segundos. |
| `ease` | `[0.16, 1, 0.3, 1]` | Nombre, bezier de 4 números o función. |
| `spring` | — | Si se define, **sobrescribe** `duration` y `ease`. |
| `excludeDelay` | `false` | Omite el `delay` propio (para heredar el stagger del padre). |
| `reducedMotion` | `true` | Respeta `prefers-reduced-motion`. |

Uso:

```tsx
import { motion } from "motion/react";
import { fade } from "motion-presets-kit/presets";

<motion.div variants={fade({ direction: "up" })} initial="initial" animate="animate">
  Hola
</motion.div>;
```

## Presets

### `fade(options?)`

Fade de entrada con dirección, blur y escala opcionales.
Extras: `direction` (`"up" | "down" | "left" | "right" | "none"`, default `"up"`),
`distance` (`60`), `blur` (`0`, px), `scale` (`1`).

```tsx
fade({ direction: "left", distance: 40, blur: 8, scale: 0.98 });
```

### `slide(options?)`

Desplazamiento puro **sin `opacity`**.
Extras: `direction` (default `"right"`), `distance` (`100`).

```tsx
slide({ direction: "right" }); // initial { x: -100 } → animate { x: 0 }
```

### `scale(options?)`

Entrada con escala + opacidad: `from` → `1` y `opacity: 0 → 1`.
Extras: `from` (default `0.8`).

```tsx
scale({ from: 0.5 });
```

### `clipReveal(options?)`

Reveal cinematográfico animando `clipPath` (con escala opcional).
Extras: `direction` (default `"up"`), `scale` (opcional, sin default).

```tsx
clipReveal({ direction: "up", scale: 1.1 });
```

### `parentVariants(options?)`

Contenedor para animar hijos en cascada. Extras: `delayChildren` (`0`) y
`startDelay` (`0`).

```tsx
<motion.div variants={parentVariants({ delayChildren: 0.12 })} initial="initial" animate="animate">
  {items.map((item) => (
    <motion.li key={item} variants={fade({ excludeDelay: true })}>
      {item}
    </motion.li>
  ))}
</motion.div>;
```

## Componentes y hooks

### `<TextAnimate>`

Anima texto por palabra o letra, preservando HTML inline, con resaltado.

- `text` (requerido, string; **acepta HTML inline**)
- `as` (tag intrínseco, default `"p"`)
- `by` (`"word" | "letter"`, default `"word"`)
- `type` (`"blurIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "typeWriter"`, default `"slideUp"`)
- `duration` (`0.4`), `startDelay` (`0`)
- `highlight` (`string[]`), `highlightClassName` (`string`)
- `reducedMotion` (`true`)
- Usa `whileInView` con `viewport={{ once: true }}`.

```tsx
<TextAnimate text="Hola <strong>mundo</strong>" by="letter" type="blurIn" highlight={["mundo"]} />
```

Advertencia: el HTML inline se inyecta con `dangerouslySetInnerHTML`; sanitiza el
`text` si viene de input no confiable.

### `<Marquee>`

Scroll infinito en CSS puro (`@keyframes`), con children duplicados.

- `children` (requerido), `speed` (segundos/vuelta, default `20`; debe ser > 0)
- `direction` (`"left" | "right"`, default `"left"`)
- `pauseOnHover` (`true`), `gap` (default `"2rem"`)
- `reducedMotion` (`true`)

```tsx
<Marquee speed={30} direction="right" gap="1.5rem">
  <span>Logo 1</span>
  <span>Logo 2</span>
</Marquee>
```

### `<Draggable>`

Wrapper de `motion.div` con drag configurable.

- `axis` (`"x" | "y" | "both"`, default `"both"`)
- `bounds` (`"parent" | "document" | { top, right, bottom, left }`)
- `snapToGrid: [number, number]`
- `dragElastic`, `dragMomentum`, `dragControls`
- `onDragStart` / `onDrag` / `onDragEnd`

```tsx
<Draggable axis="x" bounds="parent" snapToGrid={[20, 20]}>
  <div>Arrastrame</div>
</Draggable>
```

Con `bounds="parent"` el elemento se restringe a su contenedor; el contenedor
debe poder medirse (normalmente `position: relative`).

### `useCounter(ref, options?)`

Contador animado que escribe el valor formateado en `ref.current.textContent` y
expone el valor actual de forma reactiva.

- `from` (`0`), `to` (`100`), `decimals` (`0`)
- `prefix`, `suffix`, `separator` (`","`)
- `format: (value: number) => string` (sobrescribe el formateo)
- `duration` (`1`), `reducedMotion` (`true`)
- Devuelve `{ value, start, reset }`.

```tsx
const ref = useRef<HTMLSpanElement>(null);
const { start, reset } = useCounter(ref, { to: 1250, suffix: " px" });
return (
  <>
    <span ref={ref} />
    <button onClick={start}>Start</button>
    <button onClick={reset}>Reset</button>
  </>
);
```

## Reducción de movimiento

Todos los presets aceptan `reducedMotion` (default `true`). Con
`prefers-reduced-motion: reduce` activo:

- Los presets devuelven `initial === animate` con el estado final.
- `TextAnimate` muestra el texto sin animar.
- `Marquee` no reproduce el loop.
- `useCounter` muestra el valor final directamente.

En SSR/servidor `reducedMotion` se evalúa como `false` (no hay `window`), por lo
que los presets devuelven variants estáticas y no rompen el render.

## Errores comunes

- **Olvidar `initial`/`animate`**: los presets devuelven `Variants`; el elemento
  `motion.*` debe declarar `initial="initial"` y `animate="animate"` (o
  `whileInView="animate"`).
- **Stagger que no funciona**: los hijos dentro de `parentVariants()` deben usar
  `excludeDelay: true`, si no su `delay` propio sobrescribe el del padre (CL-001).
- **`slide` no desvanece**: es intencional, `slide` no incluye `opacity`.
- **`bounds="parent"` sin contenedor posicionado**: el padre debe existir y
  poder medirse; usa `position: relative`.
- **Opciones inválidas**: no lanzan; se emite un `warn()` con prefijo
  `[motion-presets-kit]` y se usan los valores por defecto.
- **`format`/`ease`/`spring` inválidos**: Zod los valida en runtime; si no son
  válidos se avisa y se usan los defaults.

## Referencia rápida

```tsx
import { fade, slide, scale, clipReveal, parentVariants } from "motion-presets-kit/presets";
import { TextAnimate, Marquee, Draggable, useCounter } from "motion-presets-kit/components";
```
