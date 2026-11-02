# WebGL

WebGL is standard on award-winning sites (6 of 7 recent Site of the Day portfolios). It is
worth adding only when it expresses the concept and holds 60 fps on a mid-range phone. The
engine's optional GL module (code at the end of this file, in `src/engine/gl/`) gives you one
shared OGL canvas with two primitives. Extend them rather than adding a second renderer.
Install: `npm i ogl`.

## Primitives

1. **DOM-synced planes** (`data-gl`): every `<figure data-gl>` gets a plane drawn exactly over
   its rect each frame. The `<img>` stays in the DOM (SEO, a11y, LCP, fallback) at opacity 0.
   Built-in look: in-shader object-fit cover, hover zoom and pointer push, chromatic split from
   scroll velocity, organic bottom-up reveal, bend with scroll velocity.
   Procedural variant (`data-gl="procedural"`): seeded fbm field in three palette colors with grain.

   | Attribute | Effect |
   |---|---|
   | `data-gl` | Image plane for the `<img>` inside. Remote images need `crossorigin="anonymous"` |
   | `data-gl="procedural" data-seed="2.4" data-colors="#a,#b,#c"` | Generative cover in the palette (for projects without imagery). Put a `.gl-fallback` div with `role="img"` + `aria-label` inside |
   | `data-gl-instant` | Visible immediately (hero media, the target of a shared-element transition) |
   | `data-gl-scrub` | Reveal follows scroll position (0 as it enters, 1 at 25% from the top) |
   | `data-gl-duration="2.4"` | Length of the timed reveal in seconds (default 1.6) |

2. **Fullscreen layer** (`setBackground(fragment, uniforms)`): a shader under the planes for skies,
   fields, gradients, noise, light. Built-in uniforms: `uTime, uResolution, uScroll (0..1),
   uScrollY, uVelocity, uMouse (smoothed 0..1)`; varying `vUv`.

Customize the plane shaders in `src/engine/gl/shaders.ts` per concept (that is expected):
change the hover, the reveal shape and the velocity response. Keep the uniform names so the
engine can drive them.
Tested example: a photographer's "darkroom" replaced `imageFragment` so prints develop out of
paper white (dark tones first, uneven like tray agitation) under a red safelight cast, and hover
turns the room lights on (true color); `data-gl-scrub` tied development to scroll position.

**Layering rules (the canvas is UNDER the content):**
- No background on a `[data-gl]` element or its ancestors inside `<main>` (the engine forces
  `background: none` on GL elements; `shoot.mjs` reports `glHidden` for covered planes).
- Text over a GL image: put a gradient scrim as a pseudo-element on the container in the DOM.
- Fixed UI over GL imagery: `mix-blend-mode: difference` or a scrim.

## Recipes

### Scroll-driven sky / time of day (fullscreen)
```ts
import { onPage, setBackground } from '../engine';
const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime, uScroll;
uniform vec2 uMouse, uResolution;
uniform vec3 uA, uB, uC;           // palette stops (dawn, noon, dusk)
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main() {
  float t = uScroll;
  vec3 top = mix(mix(uA, uB, smoothstep(0.0, 0.5, t)), uC, smoothstep(0.5, 1.0, t));
  vec3 bottom = mix(top, vec3(1.0), 0.35 - 0.25 * t);
  vec2 sun = vec2(0.2 + 0.6 * t, 0.85 - 0.6 * abs(t - 0.5) * 2.0) + (uMouse - 0.5) * 0.03;
  float glow = smoothstep(0.35, 0.0, distance(vUv * vec2(uResolution.x / uResolution.y, 1.0), sun * vec2(uResolution.x / uResolution.y, 1.0)));
  vec3 col = mix(bottom, top, vUv.y) + glow * 0.25;
  col += (hash(vUv * uResolution + fract(uTime)) - 0.5) * 0.03; // grain
  gl_FragColor = vec4(col, 1.0);
}`;
// Register once, in setupMotion (src/motion/setup.ts); it persists across pages:
setBackground(frag, { uA: { value: [0.62, 0.72, 0.86] }, uB: { value: [0.97, 0.96, 0.92] }, uC: { value: [0.93, 0.47, 0.25] } });
```
Text over a moving background must keep AA contrast at every scroll position: pick ink colors
that work on all stops, or tween the ink color with the same progress.
`setBackground` returns `null` when GL is off (reduced motion, no WebGL): style `html` with a
static gradient as the fallback.

### Image hover variants (edit `imageFragment`)
- **Liquid:** offset `uv` by `fbm(uv * 3.0 + uTime * 0.2) * 0.03 * uHover`.
- **Pixel sort / mosaic:** `uv = floor(uv * mix(400.0, 24.0, uHover)) / mix(400.0, 24.0, uHover)`.
- **Lens:** inside `distance(vUv, uMouse) < 0.2`, scale uv toward uMouse by `1.0 - 0.3 * uHover`.
- **Duotone to color:** mix luminance-mapped duotone (palette) with the true color by `uHover`.

### Reveal variants (edit `revealMask`)
- Horizontal wipe: use `uv.x`. Circle from center: `distance(uv, vec2(0.5))`.
- Blinds: `fract(uv.y * 8.0)` compared to `uReveal`.

### Text in WebGL
Prefer real DOM text. If a concept truly needs GL text (displacing a giant word), render the word
into a 2D canvas (`ctx.font` with the loaded webfont after `document.fonts.ready`), use it as a
texture on a `data-gl`-like plane, and keep the DOM word visually hidden but present.

### 3D models
Only when the concept is spatial. Use Three.js + `GLTFLoader` with Draco/Meshopt-compressed GLB
under 1.5 MB, lazy-import it (`await import('three')`) after the hero paints, and render in its
own canvas only while visible. Never block the loader on a model.

## Performance rules

- One canvas, DPR capped at 2 (engine), `antialias: false`, geometry segments ≤ 32.
- Fragment work: ≤ 5 fbm octaves per fullscreen pixel; avoid loops over textures; no
  `discard`-heavy shaders on large areas.
- Pause when the tab is hidden (engine) and skip planes off-screen (engine).
- Textures: images ≤ 2000 px on the long edge, compressed (AVIF/WebP for DOM, the GL reads the
  decoded `<img>`). Remote images need CORS (`crossorigin="anonymous"`).
- Test: the `shoot.mjs` FPS sample must stay at 55 or above on desktop. For heavy scenes,
  throttle the CPU 4x in DevTools and reduce octaves or DPR when it drops.
- Reduced motion, Save-Data, or no WebGL: the engine never starts GL; DOM images and the static
  fallback must look finished, not broken.

## Module code

Add these two files only when the site uses GL. The core (`engine.md`) imports `./gl`; without
GL, delete the lines marked `// GL` there instead.

### `src/engine/gl/index.ts`

```ts
{{file:nexttest/src/engine/gl/index.ts}}
```

### `src/engine/gl/shaders.ts`

```ts
{{file:nexttest/src/engine/gl/shaders.ts}}
```
