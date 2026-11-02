# MASTER QUALITY GATE & SCORING RUBRIC

Every frontend built or reviewed by **frontend-awwwards** must pass this rigorous quality gate before delivery.

**Target:** Minimum **9/10** in every applicable category.

> **RULE:** Never fake a score. If an implementation scores below 9 in any category, identify the specific deficiencies, fix them in code, and re-audit until the quality standard is honestly achieved.

---

## The 11 Evaluation Categories & Scoring Standards

### 1. Visual Design (Target: ≥ 9/10)
- **10/10:** Breathtaking visual polish, bespoke aesthetic identity, harmonious color palette derived from subject matter, immaculate contrast, refined micro-details, zero visual clutter.
- **7-8/10:** Clean and competent, but relies on common modern tropes (e.g. standard Tailwind slate-grey cards, generic pastel badges).
- **< 7/10:** Inconsistent visual hierarchy, clashing colors, unrefined borders, poor padding, template residue.

### 2. Creative Direction (Target: ≥ 9/10)
- **10/10:** Unmistakable point of view grounded in the subject's world. Memorable signature moment. Every frame works as an editorial poster.
- **7-8/10:** Good-looking but generic; could easily be re-branded for a completely different company without anyone noticing.
- **< 7/10:** Derivative clone of a trending website without understanding the underlying design logic.

### 3. Typography (Target: ≥ 9/10)
- **10/10:** Disciplined 1–2 typeface system. Intentional type scale with fluid clamp bounds. Flawless tracking, line-length (< 75 characters), and line-height. Type acts as an active visual element.
- **7-8/10:** Standard Inter/Roboto pairing. Legible but lacks character, tension, or scale contrast.
- **< 7/10:** 3+ competing font families, orphaned lines, improper leading, wall-of-text fatigue.

### 4. Layout & Composition (Target: ≥ 9/10)
- **10/10:** Dynamic editorial pacing. Masterful use of asymmetry, scale contrast, and intentional white space. Zero "SaaS Card Soup".
- **7-8/10:** Symmetrical 3-card grids across every section. Clean but predictable.
- **< 7/10:** Broken alignments, cramped containers, awkward horizontal gaps, lack of breathing room.

### 5. Motion & Interaction (Target: ≥ 9/10)
- **10/10:** Smooth 60–120 FPS performance. Motion conveys physical mass and spatial continuity. Custom easing curves (`expo.out`, `power4.out`). Zero layout thrashing. Full `prefers-reduced-motion` compliance.
- **7-8/10:** Animations work, but uses standard browser ease or generic fade-and-slide up on every section.
- **< 7/10:** Janky scrolling, layout shifts, excessive duration (> 1.5s delay), distracting or nausea-inducing motion.

### 6. UX & Usability (Target: ≥ 9/10)
- **10/10:** User instantly understands where they are and what to do within 2 seconds. Intuitive navigation, clear interactive feedback, zero dead ends, robust error prevention.
- **7-8/10:** Functional, but some hover states lack clarity or secondary links are obscured.
- **< 7/10:** Confusing navigation, broken back button behavior, modal traps, hidden primary actions.

### 7. Responsive Design (Target: ≥ 9/10)
- **10/10:** Purpose-designed for mobile, tablet, and ultra-wide screens (not just downscaled desktop). Touch interactions feel native. Zero horizontal scroll overflow.
- **7-8/10:** Desktop scaled down to mobile; cards stack into a very long vertical column without mobile-specific navigation or touch ergonomics.
- **< 7/10:** Text clipped on mobile, overlapping containers, elements overflowing viewport width.

### 8. Accessibility (WCAG 2.1 AA) (Target: ≥ 9/10)
- **10/10:** Semantic HTML throughout. Minimum 4.5:1 text contrast. Discernible `:focus-visible` rings on all interactive targets. 44x44px minimum touch targets. Proper `aria-*` tags.
- **7-8/10:** Mostly accessible, but some secondary text falls below 4.5:1 contrast, or focus indicators are faint.
- **< 7/10:** Removed focus outlines (`outline: none`), icon buttons missing accessible names, inaccessible color-only states.

### 9. Code Quality & Architecture (Target: ≥ 9/10)
- **10/10:** Next.js 16 / React 19 standards. Strict TypeScript (zero `any`). Modular component composition. Clean GSAP/Lenis lifecycle disposal. Zero console errors or warnings.
- **7-8/10:** Works, but has minor duplicate CSS, unoptimized re-renders, or missing cleanup on unmount.
- **< 7/10:** Monolithic 1000-line spaghetti files, untyped variables, memory leaks, unhandled exceptions.

### 10. Performance & Core Web Vitals (Target: ≥ 9/10)
- **10/10:** LCP < 2.0s, CLS < 0.05, INP < 150ms. GPU-accelerated transforms (`transform` & `opacity` only). DPR clamped to ≤ 1.75. Asset preloading on critical paths.
- **7-8/10:** LCP 2.5–3.5s, minor layout shift during font or image load.
- **< 7/10:** LCP > 4.0s, CLS > 0.15, heavy uncompressed images, un-debounced scroll listeners.

### 11. Originality & Anti-Slop (Target: ≥ 9/10)
- **10/10:** 100% free of AI slop tells. No generic blue-purple gradients, no repetitive card boxes, no fake stats, no gratuitous pill badges. Every element passes the Purpose Test.
- **7-8/10:** Clean design, but retains 1 or 2 generic AI markers (e.g. decorative `01 / 02` labels, unneeded pill container).
- **< 7/10:** Full AI slop bingo: blue-purple radial glow, card soup, fake metrics, thick bordered rounded cards.

---

## Official Quality Scorecard Template

```markdown
## Master Quality Gate Scorecard

| Category | Score (0-10) | Evaluation Notes & Evidence |
|---|---|---|
| 1. Visual Design | [ ] / 10 | |
| 2. Creative Direction | [ ] / 10 | |
| 3. Typography | [ ] / 10 | |
| 4. Layout Composition | [ ] / 10 | |
| 5. Motion & Interaction | [ ] / 10 | |
| 6. UX & Usability | [ ] / 10 | |
| 7. Responsive Design | [ ] / 10 | |
| 8. Accessibility | [ ] / 10 | |
| 9. Code Quality | [ ] / 10 | |
| 10. Performance | [ ] / 10 | |
| 11. Originality & Anti-Slop | [ ] / 10 | |
| **Overall Average** | **[ ] / 10** | **Pass Threshold: ≥ 9.0 in all categories** |

### Critical Action Items (if any category < 9.0):
1. ...
2. ...
```
