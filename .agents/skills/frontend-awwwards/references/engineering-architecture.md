# FRONTEND ENGINEERING & ARCHITECTURE

Synthesizing best practices from:
- `sources/vercel-skills` (`react-best-practices`, `web-design-guidelines`)
- `sources/award-caliber-websites` (Next.js & Astro engine architecture)
- `sources/ui-ux-pro-max` (119 UX Guidelines & Stack Intelligence)
- `sources/microsoft-review` (Enterprise engineering & accessibility)

---

## 1. Modern Framework Stack (Next.js 16 / React 19)

### A. Server Components vs Client Components Boundary
- **Default to React Server Components (RSC):** Fetch data, render static HTML, metadata, and structural layouts on the server.
- **Push `"use client"` to the Leaf Nodes:**
  - Wrap interactive components (GSAP animations, canvas renders, cursor tracking, Lenis listeners) in targeted leaf client components.
  - Never mark an entire page or root layout as `"use client"` unless strictly necessary.

### B. Image & Asset Optimization
- Always use `next/image` with explicit `width`, `height`, or `fill` with `sizes`.
- Hero banner images that determine LCP must have `priority={true}`.
- SVGs used as decorative background elements should be inline or loaded via optimized `<img src="..." alt="" aria-hidden="true" />`.

---

## 2. Modern CSS & Tailwind Styling Standards

### A. Semantic Design Token Layer
Declare design tokens via CSS custom properties on `:root` to ensure system-wide coherence:

```css
:root {
  /* Color system */
  --bg-primary: #0a0c0b;
  --bg-surface: #141716;
  --text-primary: #f4f2ee;
  --text-muted: rgba(244, 242, 238, 0.65);
  --accent-brand: #e20b3a;

  /* Spatial rhythm */
  --space-unit: 8px;
  --radius-subtle: 4px;
  --radius-pill: 9999px;

  /* Z-index layering */
  --z-background: 0;
  --z-content: 10;
  --z-marquee: 20;
  --z-header: 30;
  --z-cursor: 100;
}
```

### B. CSS Container Queries for Fluid Components
Never rely solely on global viewport `@media` queries for internal card components:

```css
.card-wrapper {
  container-type: inline-size;
}

@container (min-width: 480px) {
  .card-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}
```

### C. CSS Subgrid for Flawless Vertical Alignment
Align card headers, images, and buttons across uneven grid items:

```css
.editorial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

.editorial-card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
}
```

---

## 3. Web Performance & Core Web Vitals

To score **9/10+** in performance audits:

1. **Largest Contentful Paint (LCP < 2.5s):**
   - Preload critical display fonts in `<head>` (`next/font/local` or `next/font/google` with `display: 'swap'`).
   - Eliminate heavy JS bundles in the initial document waterfall.
2. **Cumulative Layout Shift (CLS < 0.1):**
   - Reserve space for all images, WebGL canvases, and fonts.
   - Use `aspect-ratio: 16 / 9` or fixed dimensions before media assets resolve.
   - Never inject layout-shifting banners or dynamic heights after initial paint.
3. **Interaction to Next Paint (INP < 200ms):**
   - Decouple heavy calculations from the main thread.
   - Use `requestIdleCallback` or Web Workers for non-urgent tracking.
   - Keep event listeners passive: `{ passive: true }`.

---

## 4. Accessibility (WCAG 2.1 AA)

An award-winning site is not award-winning if it excludes visitors with disabilities. Usability accounts for 30% of jury scores:

1. **Color Contrast:**
   - Text to background contrast must be at least `4.5:1` for normal text and `3:1` for large display text.
2. **Keyboard Navigation:**
   - Every interactive element (`<a>`, `<button>`, input) must have a discernible `:focus-visible` ring.
   - Never use `outline: none` without providing an equally accessible custom focus indicator.
3. **Touch Targets on Mobile:**
   - Minimum interactive hit box: `44px x 44px`.
   - Provide minimum 8px padding between adjacent buttons.
4. **Accessible Labeling:**
   - Icon-only buttons must have `aria-label="..."`.
   - Decorative SVGs, canvas backdrops, and particles must have `aria-hidden="true"`.
