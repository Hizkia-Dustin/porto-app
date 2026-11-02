# Next.js (App Router)

The default stack. Every file below was built and run under Next {{major:nexttest/next}} with React {{major:nexttest/react}}, including
the transitions, back/forward navigation, the 404 and the WebGL planes. Next ships version-matched
docs in `node_modules/next/dist/docs/`; read the relevant guide whenever an API looks different
from what you remember.

## Scaffold

```bash
npx create-next-app@latest <dir> --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*" --use-npm --yes
cd <dir> && npm i gsap lenis ogl && npm i -D playwright axe-core
```
Delete the starter page styles and assets. Tailwind is fine if the user or project uses it;
tokens then become `@theme` variables with the same names.

```
src/app/layout.tsx          flags script, persistent layers, loader, header, <Motion /> last
src/app/fonts.ts            next/font declarations
src/app/globals.css         tokens + engine.css (engine.md), then site styles
src/app/page.tsx, work/[slug]/page.tsx, not-found.tsx, sitemap.ts, robots.ts, icon.svg
src/components/Motion.tsx   client wrapper: <Engine setup={setupMotion} />
src/motion/setup.ts         global motion: transition, loader format/exit, background, driver
src/engine/                 engine.md files + next.tsx (below) + gl/ (webgl.md, optional)
src/data/site.ts            all content (content.md)
```

## Adapter: `src/engine/next.tsx`

A capture-phase click listener intercepts internal links: plain `<a>` and `next/link` (which
stands down when `defaultPrevented` is set). It plays the leave animation while prefetching,
cleans up, then pushes. A `usePathname` effect runs `enter()` once the new page is committed.
Back/forward skips the curtain.

```tsx
{{file:nexttest/src/engine/next.tsx}}
```

## Layout: `src/app/layout.tsx`

```tsx
{{file:nexttest/src/app/layout.tsx}}
```
- `suppressHydrationWarning` on `<html>` is required: the flags script and the engine add classes
  before React hydrates.
- `<Motion />` must be the **last** child of `<body>`. React runs effects children-first, so
  `usePage` registrations in pages happen before the engine boots.
- `#gl`, `#curtain`, `#cursor` and `#loader` live in the root layout, so they persist across
  navigations for free.
- Header with `aria-current`: a client component using `usePathname()`.

## Global motion: `src/components/Motion.tsx` + `src/motion/setup.ts`

```tsx
{{file:nexttest/src/components/Motion.tsx}}
```
```ts
// src/motion/setup.ts (example: iris transition from the click point + a scroll-tinted background)
{{file:nexttest/src/motion/setup.ts}}
```
`setupMotion` runs once on the client, after scroll and GL init and before the first page. It
is the only safe place for code that touches `window` at setup time. Never put DOM code at the
top level of a module: `'use client'` modules also run on the server.

## Component-level motion: `usePage`

```tsx
{{file:nexttest/src/components/Marquee.tsx}}
```
`usePage(fn)` registers on mount and runs `fn` once the page is ready (after the loader). Its
tweens and ScrollTriggers are reverted on navigation, and the returned cleanup runs too. Use
refs for targets. Server components just use data attributes (`data-split`, `data-reveal`,
`data-gl`): no client code needed.

## Fonts: `src/app/fonts.ts`

```ts
{{file:nexttest/src/app/fonts.ts}}
```
Add every `.variable` to `<html className>`. In tokens:
`--f-display: var(--font-display), system-ui, sans-serif;`. `next/font` handles preloading and
fallback metrics.

## Metadata, sitemap, robots, 404, icons

- `metadata` / `generateMetadata` per page: unique `title` and `description` (the layout's
  `title.template` adds the site name). `alternates: { canonical: './' }` in the layout
  resolves per page.
- OG image: `public/og.png` (1200x630, generate with `og.mjs`, then rebuild), or an
  `opengraph-image.tsx` file convention for per-page images.
- `src/app/sitemap.ts` and `src/app/robots.ts`:

```ts
{{file:nexttest/src/app/sitemap.ts}}
```
```ts
{{file:nexttest/src/app/robots.ts}}
```
- `src/app/not-found.tsx` is the designed 404 (it carries the concept). Static routes with
  `generateStaticParams` + `export const dynamicParams = false` make unknown slugs 404.
- Favicon: `src/app/icon.svg` (file convention), plus `apple-icon.png` if possible.
- JSON-LD: a `<script type="application/ld+json">` in the layout or page, escaped as shown above.

## Pages

```tsx
// src/app/work/[slug]/page.tsx (a case page: static params, metadata, GL hero, next project)
{{file:nexttest/src/app/work/[slug]/page.tsx}}
```
- Images: `next/image` with `width`/`height` (or `fill` + a sized parent) and `sizes`. The
  hero/LCP image takes `loading="eager" fetchPriority="high"` (`priority` is deprecated in
  Next 16). GL planes read the rendered `<img>`, so `next/image` works with `data-gl`.
- Inline styles in these examples are for brevity. Real projects use CSS modules or global
  classes from the system.

## Static export (optional)

For a site with no server features, `output: 'export'` in `next.config.ts` produces `out/`.
Deploy it anywhere and QA it with `serve.mjs out`. `next/image` then needs
`images: { unoptimized: true }`, so pre-size and compress images yourself. On Vercel, prefer
the default build: image optimization included.

## QA

```bash
npm run build && npx next start -p 4400          # background; production server
node $SKILL/scripts/audit.mjs http://127.0.0.1:4400/
node $SKILL/scripts/shoot.mjs http://127.0.0.1:4400/ --nav
```
Never QA `next dev`: it is slower, has dev overlays, and runs effects twice in Strict Mode.
The engine is idempotent, but timings and FPS are not representative.

## Pitfalls

- **SplitText vs React re-renders.** Only put `data-split` on text that never re-renders on the
  client (server components, static props). If a client component re-renders split text, React
  throws on the mutated DOM.
- **Don't remove React-owned nodes.** The engine hides the loader instead of removing it.
  Follow the same rule in your own code: hide, or render conditionally from state.
- **No DOM at module level** in anything imported by a client component. Put it in
  `setupMotion`, `usePage`, or effects.
- **Opting out:** `data-no-transition` on a link skips the curtain (downloads, modals, anchors
  handled elsewhere). `target="_blank"`, external, `mailto:` and same-page links are skipped
  automatically.
- **`loading.tsx` / Suspense:** the enter animation runs when the pathname commits. Avoid
  route-level loading UI on showcase pages, or the curtain lifts onto a skeleton.
- **Native alternative:** React's `<ViewTransition>` (docs:
  `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`) morphs shared elements
  with the browser View Transitions API. It is great for thumbnail → hero morphs. Don't combine
  it with the curtain on the same navigation.
- Bundle baseline: Next + React is roughly 170 KB of gzipped JS before your code; with GSAP,
  Lenis and OGL about 250 KB. Lazy-load anything heavier (`next/dynamic`, `await import()`).
