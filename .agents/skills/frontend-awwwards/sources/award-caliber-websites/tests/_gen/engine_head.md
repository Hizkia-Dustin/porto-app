# Motion engine (framework-agnostic)

The plumbing that award-level sites get wrong, solved once:
- one clock (GSAP ticker drives Lenis, ScrollTrigger and WebGL)
- a page lifecycle that reverts every effect on navigation
- a loader that tracks real progress
- page transitions that overlap with the page fetch
- declarative reveals that stay accessible
- reduced-motion and no-JS paths that keep content visible

It is plain TypeScript with no framework imports and no DOM access at import time, so it is
safe under SSR. A small adapter connects it to the router: `nextjs.md`, `astro.md`, or the
contract below for any other stack.

The engine is not the design. The loader look, the transition, the tokens and every page are
authored per project. Shipping the defaults is a failure.

Dependencies: `npm i gsap lenis` (+ `ogl` for WebGL, see webgl.md).

## Files

```
src/engine/
  env.ts           media queries + the shared easing names
  scroll.ts        Lenis on the GSAP ticker; onScroll feed (y, velocity, progress)
  reveal.ts        data-split / data-reveal / data-parallax / data-intro
  loader.ts        first-load progress + exit (setLoaderFormat, setLoaderExit)
  interactions.ts  data-magnetic, cursor follower (data-cursor)
  transition.ts    curtain leave/enter (setTransition)
  index.ts         lifecycle core: boot, leave, cleanup, enter, onPage
  gl/              optional WebGL module (webgl.md)
  next.tsx | astro.ts   the adapter for your router
tokens.css         design tokens (names below are the contract; values are yours)
engine.css         foundation + engine CSS
```

## Adapter contract (wire these four hooks in any framework)

| When | Call |
|---|---|
| First load, after the DOM is ready (client only) | `boot()`: flags, scroll, GL, cursor, page init, loader, intro |
| A route change starts (internal link click) | `await leave()`: covers the screen with the curtain. Fetch the next page in parallel when the router allows it |
| Just before the old page's DOM is removed | `cleanup()`: reverts tweens, ScrollTriggers and splits, and removes GL planes |
| After the new page's DOM is in place | `enter()`: scroll to top, init page, uncover, play the intro. Back/forward: `enter({ transition: false, scrollTop: false })` |

SvelteKit: `beforeNavigate` → leave + cleanup, `afterNavigate` → enter. Nuxt: `page:start` /
`page:finish` hooks. Vite + React Router: intercept link clicks like the Next adapter, then call
`enter` in a `useEffect` on `location.pathname`.

## Layout contract (markup every page shares)

```html
<html lang="en">                     <!-- inline script in <head> adds .js and .motion before paint -->
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div id="gl" aria-hidden="true"></div>              <!-- WebGL canvas host, persists -->
  <div id="curtain" aria-hidden="true"><div class="curtain__panel"></div></div>
  <div id="cursor" aria-hidden="true"><span data-cursor-label></span></div>   <!-- optional -->
  <div id="loader" role="status" aria-label="Loading">                         <!-- optional -->
    <span data-loader-out>Name</span> <span data-loader-out data-loader-count>000</span>
    <div data-loader-bar></div>
  </div>
  <header>…</header>
  <main id="main" tabindex="-1">…page…</main>
  <footer>…</footer>
</body>
```
Before first paint, the inline head script must run:
`document.documentElement.classList.add('js'); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion');`
Hidden-before-reveal styles are gated on `html.motion`, so content stays visible without JS
and under reduced motion. `#gl`, `#curtain` and `#cursor` must survive navigation (persistent
layout in Next, `transition:persist` in Astro). The loader is hidden (not removed) when done
and sets `html.is-loaded`. QA scripts detect any `#loader` element.

## Markup API (data attributes)

| Attribute | Effect |
|---|---|
| `data-split="lines\|words\|chars"` | Masked text reveal via SplitText (re-splits on resize/font load, stays accessible) |
| `data-reveal="up\|fade\|clip\|scale"` | Block reveal. `clip` wipes up, `scale` opens from an inset |
| `data-intro` | Play with the page intro instead of on scroll (use in heroes) |
| `data-delay="0.2"` | Extra delay in seconds (works with split, reveal, GL) |
| `data-parallax="0.15"` | Scrubbed drift, fraction of the element height. Put it on an inner element inside an `overflow: clip` frame |
| `data-magnetic="0.35"` | Element leans toward the pointer |
| `data-cursor="View"` | Cursor follower grows with this label over the element |
| `data-gl`, `data-gl="procedural"`, `data-gl-*` | WebGL planes (webgl.md) |

Put `data-split` only on text that never re-renders on the client (server-rendered or static).
SplitText rewrites the DOM inside the element.

## Script API (`import { … } from '@/engine'` or a relative path)

```ts
onPage(({ intro, path }) => {        // every page load, inside a gsap.context; returns an unsubscribe
  const el = document.querySelector('[data-marquee]');
  if (!el) return;                   // global modules register once: check presence
  intro.add(gsap.from('.hero-meta', { autoAlpha: 0, y: 20 }), 0.4); // extend the page intro
  return () => { /* remove listeners you added to window/document */ };
});
// React: usePage(fn) from the adapter does the same for one component (registers on mount).

setTransition({ leave: (curtain) => tl, enter: (curtain) => tl }); // replace the default wipe
setLoaderFormat((p) => `${p}`);                                    // counter text, p: 0 → 100 (a clock, a year…)
setLoaderExit((root) => gsap.timeline()…);                         // the loader → hero handoff
onScroll(({ y, velocity, progress }) => {});                       // one-clock scroll feed; returns an unsubscribe
scrollToTarget('#work');  stopScroll();  startScroll();
setBackground(fragmentGLSL, uniforms); clearBackground(); hideGL(0.6);   // webgl.md
ease.out | ease.inOut | ease.soft | ease.spring                    // the shared easing names
prefersReducedMotion(), isTouch(), isMobile()
```

Call global setup (`setTransition`, `setLoaderFormat`, `setLoaderExit`, `setBackground`, the
driver module) once on the client **before** `boot()` runs: in Astro, from a script imported
right after the adapter; in Next, at module level of a client module imported by the
component that renders `<Engine />`. These setters touch no DOM, so they are safe in modules
that also render on the server.

## Lifecycle

- **First load:** the head script flags `html.js.motion`, then the loader runs with real
  progress (fonts + critical images, 1.1 s floor, 2.6 s cap), then page init, then the
  `data-intro` timeline plays.
- **Navigation:** the leave animation runs while the next page loads, then cleanup reverts the
  old page, then the swap, a scroll reset, page init, the enter animation and the intro.
- **Reduced motion:** native scroll, no GL, no reveals (content visible), short fades for the
  loader and transitions.

## Pitfalls already handled (do not undo)

- CSS transforms on GSAP-animated elements stack with GSAP's: the curtain panel has none.
- Lenis reports progress 1 on pages that cannot scroll: `scroll.ts` normalizes it to 0.
- SplitText turns lines into blocks: `text-indent` is kept on the first line only.
- A revealed text stays revealed when SplitText re-splits after a font load or resize.
- Hidden-before-reveal is gated on `html.motion`, set before the first paint (no flash).
- The loader is hidden instead of removed, because React owns that node in Next.
