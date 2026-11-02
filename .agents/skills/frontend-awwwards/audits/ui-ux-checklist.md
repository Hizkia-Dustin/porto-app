# COMPREHENSIVE UI/UX CHECKLIST

Synthesizing the 119 UX guidelines, touch rules, and craft criteria from `sources/ui-ux-pro-max`, `sources/impeccable`, and `sources/microsoft-review`.

---

## Priority 1: Accessibility (Critical)
- [ ] **Contrast Ratio:** Normal text ≥ 4.5:1; large display text (≥ 18pt / 24px) ≥ 3:1 against background.
- [ ] **Visible Focus Rings:** Every interactive button, link, and input has a distinct `:focus-visible` indicator (minimum 2px outline with offset).
- [ ] **Accessible Icon Buttons:** Every icon-only button contains an `aria-label` or visually hidden screen reader text.
- [ ] **Image Alt Attributes:** Meaningful images have descriptive `alt` attributes; purely decorative elements have `alt=""` and `aria-hidden="true"`.
- [ ] **Semantic Landmarks:** Page uses proper `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>` elements.

---

## Priority 2: Touch & Interaction (Critical)
- [ ] **Touch Target Size:** All touch targets on mobile are at least `44px x 44px`.
- [ ] **Touch Spacing:** Minimum `8px` spacing between adjacent interactive touch targets to prevent mis-clicks.
- [ ] **Interactive Feedback:** All actions provide immediate visual feedback (hover, active/pressed, focus, disabled, loading).
- [ ] **No Hover-Only Dependencies:** Critical information or actions must not be locked behind a mouse `:hover` state on touch devices.
- [ ] **Predictable Tap States:** Buttons scale subtly (`scale(0.98)`) or shift tone on tap with transition durations between 150ms–250ms.

---

## Priority 3: Layout Stability & Performance (High)
- [ ] **Zero Layout Shift (CLS < 0.1):** All images, videos, iframes, and canvas elements have explicitly reserved aspect ratio containers (`aspect-ratio: 16/9`, etc.).
- [ ] **Zero Horizontal Overflow:** Page body has zero unwanted horizontal scrolling at any viewport width (`overflow-x: clip` or `hidden` on root stage).
- [ ] **Safe Area Insets:** Fixed navbars and bottom sheets respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` for notched phones.
- [ ] **DPR Clamping:** WebGL and canvas viewports clamp device pixel ratio to `Math.min(window.devicePixelRatio, 1.75)`.

---

## Priority 4: Typography & Editorial Rhythm (Medium)
- [ ] **Base Reading Size:** Body copy is at least `15px–16px` on desktop and mobile.
- [ ] **Line Measure (Max Characters):** Paragraph blocks never exceed `75–80` characters per line.
- [ ] **Line-Height Proportions:** Tight leading (`0.9–1.1`) for large display headlines; comfortable leading (`1.5–1.7`) for multi-line body text.
- [ ] **No Typographic Widows / Orphans:** Single trailing words on the last line of headlines are eliminated via `text-wrap: balance` or non-breaking spaces.

---

## Priority 5: Motion & Easing (Medium)
- [ ] **Reduced Motion Support:** `@media (prefers-reduced-motion: reduce)` disables or instantly resolves all non-essential scrub and parallax animations.
- [ ] **Composite-Only Transitions:** Animations strictly modify `transform` and `opacity`; no animating `width`, `height`, `margin`, or `left/top`.
- [ ] **Custom Easing:** Motion uses deliberate decelerating curves (`expo.out`, `power4.out`, or custom cubic-bezier) rather than generic linear or browser default ease.
- [ ] **GSAP Ticker Sync:** Smooth scroll libraries (Lenis) are bound to the GSAP ticker with lag smoothing configured.
