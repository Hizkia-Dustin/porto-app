# Starter engine

Astro (static HTML, zero JS by default, per-page SEO) + GSAP (all plugins free) + Lenis + OGL.
The engine handles the plumbing that award sites get wrong; the design is yours to author.

```
src/
  data/site.ts          single source of content (projects, copy, palette for GL covers)
  layouts/Base.astro    <head> SEO/OG/JSON-LD, ClientRouter, persisted #gl/#curtain/#cursor, loader
  components/Loader.astro
  pages/                index, work/[slug], 404 (engine test pages: replace them)
  styles/tokens.css     YOUR design tokens and @font-face (rewrite entirely)
  styles/base.css       reset, a11y, engine CSS (edit only to fix engine behavior)
  engine/               scroll, reveal, transition, loader, interactions, gl/
```

`npm run dev` for development; QA always on `npm run build` output (see SKILL.md Phase 4).

## Lifecycle

First load: inline head script flags `html.js.motion` → loader runs (real progress: fonts +
critical images, 1.1 s floor, 2.6 s cap) → page init → `data-intro` timeline plays.

Navigation (Astro ClientRouter): leave animation runs **in parallel** with fetching the next page →
page cleanup (all GSAP from the old page reverted, GL planes removed) → swap → scroll reset →
page init → enter animation → intro plays. `#gl`, `#curtain`, `#cursor` persist across pages.

Reduced motion: native scroll, no GL, no reveals (content visible), short fades for loader/transitions.

## Markup API (data attributes)

| Attribute | Effect |
|---|---|
| `data-split="lines\|words\|chars"` | Masked text reveal via SplitText (re-splits on resize/font load, stays accessible) |
| `data-reveal="up\|fade\|clip\|scale"` | Block reveal. `clip` wipes up, `scale` opens from an inset |
| `data-intro` | Play with the page intro instead of on scroll (use in heroes) |
| `data-delay="0.2"` | Extra delay in seconds (works with split, reveal, GL) |
| `data-parallax="0.15"` | Scrubbed drift, fraction of the element height. Put it on an inner element inside an `overflow: clip` frame |
| `data-gl` | WebGL image plane for the `<img>` inside (hover zoom, chromatic split from scroll velocity, organic reveal). Img needs `crossorigin="anonymous"` if remote |
| `data-gl="procedural" data-seed="2.4" data-colors="#a,#b,#c"` | Generative cover in the palette (for projects without imagery). Put a `.gl-fallback` div with `role="img"` + `aria-label` inside |
| `data-gl-instant` | GL plane visible immediately (hero media) |
| `data-gl-scrub` | GL reveal follows scroll position (0 as it enters, 1 at 25% from the top) instead of a timed tween |
| `data-gl-duration="2.4"` | Length of the timed GL reveal in seconds (default 1.6) |
| `data-magnetic="0.35"` | Element leans toward the pointer |
| `data-cursor="View"` | Cursor follower grows with this label over the element |

Layering: `#gl` canvas is fixed under `#main`. Sections with GL media must not paint an opaque
background over it; put page/section colors on `html` (tokens) or on elements that hold no GL media.

## Script API (`import { ... } from '../engine'`)

```ts
onPage(({ intro, path }) => {        // runs on every page load, inside a gsap.context
  const el = document.querySelector('[data-marquee]');
  if (!el) return;                   // components register once; check presence
  // ScrollTriggers/tweens created here are reverted on navigation automatically.
  intro.add(gsap.from('.hero-meta', { autoAlpha: 0, y: 20 }), 0.4); // extend the page intro
  return () => { /* remove listeners you added to window/document */ };
});

setTransition({ leave: (curtain) => tl, enter: (curtain) => tl }); // replace the default wipe
setLoaderFormat((p) => `${p}`);                                    // counter text, p: 0 → 100 (a clock, a year...)
setLoaderExit((root) => gsap.timeline()...);                       // the loader → hero handoff
setBackground(fragmentGLSL, uniforms);                             // fullscreen shader under the planes (see webgl.md)
clearBackground();
onScroll(({ y, velocity, progress }) => {});                       // one-clock scroll feed
scrollToTarget('#work');  stopScroll();  startScroll();
hideGL(0.6);                                                       // fade planes (in a leave)
ease.out | ease.inOut | ease.soft | ease.spring                    // the shared easing names
prefersReducedMotion(), isTouch(), isMobile()
```

Global concept code (loader format/exit, transition, background shader, driver module) goes in
`src/scripts/*.ts`, imported from the `<script>` in `Base.astro` right after `import '../engine'`.

Component scripts: Astro bundles `<script>` tags once per site; they must register work through
`onPage`, never run DOM code at module top level (it would not re-run after navigation).

```astro
<script>
  import { gsap } from 'gsap';
  import { onPage } from '../engine';
  onPage(() => { /* ... */ });
</script>
```

## Loader

`components/Loader.astro` markup is yours; keep the hooks: `[data-loader-count]` (000 → 100),
`[data-loader-bar]` (scaleX), `[data-loader-out]` (exits first). Use `setLoaderFormat` for the
counter's unit and `setLoaderExit` for the handoff into the hero (shared element, continuing
motion, color handoff); call both before the first frame (in the script imported right after the
engine in `Base.astro`). Progress + exit must stay ≤ 2.6 s. The loader never shows on navigation.

## Pitfalls already handled (do not undo)

- CSS transforms on GSAP-animated elements stack with GSAP's: the curtain panel has none.
- Astro swaps `<html>` attributes on navigation: engine re-applies `js`, `motion`, `gl-on`.
- The GL canvas lives in a persisted host because Astro replaces `<body>`.
- Hidden-before-reveal states are gated on `html.motion` set before first paint (no flash, no
  invisible content without JS or with reduced motion).
- `astro:page-load` vs module-script order: the engine boots itself and ignores the first event.
