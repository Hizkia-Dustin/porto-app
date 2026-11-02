# Astro

Use Astro when the site is a content-only showcase and motion is the product: a WebGL-heavy
portfolio, a launch microsite, a scroll story with page transitions. It ships static HTML with
minimal JS (about 75 KB gzipped with the full engine, versus about 250 KB on Next.js). Its
ClientRouter lets the leave animation overlap with fetching the next page. Every file below was
built and run under Astro {{major:astrotest/astro}}.

## Scaffold

```bash
npm create astro@latest <dir> -- --template minimal --add sitemap --install --no-git --skip-houston --yes
cd <dir> && npm i gsap lenis ogl && npm i -D playwright axe-core @astrojs/check typescript
```

```
astro.config.mjs            site URL, sitemap, prefetch
src/layouts/Base.astro      head/SEO, ClientRouter, persisted layers, loader, engine start
src/components/Loader.astro
src/pages/index.astro, work/[slug].astro, 404.astro
src/styles/tokens.css, engine.css (engine.md), site styles
src/motion/setup.ts         global motion: transition, loader format/exit, background, driver
src/engine/                 engine.md files + astro.ts (below) + gl/ (webgl.md, optional)
src/data/site.ts            all content (content.md)
public/robots.txt, favicon.svg, og.png, fonts/
```

## Adapter: `src/engine/astro.ts`

```ts
{{file:astrotest/src/engine/astro.ts}}
```

## Layout: `src/layouts/Base.astro`

```astro
{{file:astrotest/src/layouts/Base.astro}}
```
- `transition:persist` keeps `#gl`, `#curtain` and `#cursor` alive, because Astro replaces
  `<body>` on navigation. `transition:animate="none"` on `<html>` disables Astro's own
  crossfade, since the engine owns the transition.
- Fonts: run `font.mjs` (writes to `public/fonts`), paste the `@font-face` blocks into
  `tokens.css` and the preload tags into the head (the `head` slot or inline).

## Loader: `src/components/Loader.astro`

```astro
{{file:astrotest/src/components/Loader.astro}}
```

## Global motion: `src/motion/setup.ts`

```ts
{{file:astrotest/src/motion/setup.ts}}
```
Same contract as in Next: runs once on the client, after scroll/GL init and before the first
page. Register `setTransition`, `setLoaderFormat`, `setLoaderExit`, `setBackground` and driver
modules here.

## Config: `astro.config.mjs`

```js
{{file:astrotest/astro.config.mjs}}
```
`public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://<domain>/sitemap-index.xml
```

## Component scripts

Astro bundles each `<script>` once per site and runs it once. Register page work through
`onPage`; never run DOM code at the top level, because it would not re-run after navigation.

```astro
<script>
  import { gsap } from 'gsap';
  import { onPage } from '../engine';
  onPage(() => {
    const el = document.querySelector('[data-marquee]');
    if (!el) return;                     // runs on every page: check presence
    /* ... */
  });
</script>
```

## Pages

- `src/pages/work/[slug].astro` with `getStaticPaths()` from `site.ts`. Pass `title`,
  `description` and `image` to `Base` for per-page SEO.
- `src/pages/404.astro` is the designed 404. Static hosts serve it for unknown URLs, and so do
  `serve.mjs` and `astro preview`.
- Images: Astro's `<Image>` from `astro:assets` (sized, modern formats) for files in
  `src/assets`. GL planes read the rendered `<img>`.

## QA

```bash
npm run build
node $SKILL/scripts/serve.mjs dist --port 4400     # background
node $SKILL/scripts/audit.mjs dist                 # or the URL
node $SKILL/scripts/shoot.mjs http://127.0.0.1:4400/ --nav
```

## Pitfalls

- Astro swaps `<html>` attributes on navigation. The adapter restores the engine flags in
  `astro:after-swap`; if you add your own classes to `<html>`, restore them there too.
- The loader markup is in every page's HTML. The adapter removes it after each swap, so it only
  plays on first load.
- `astro:page-load` also fires on the first load: the adapter ignores it, because `start()`
  boots immediately.
