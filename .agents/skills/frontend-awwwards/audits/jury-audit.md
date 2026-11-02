# AWWWARDS JURY AUDIT & BLIND CRITIQUE PROTOCOL

Adapted from the Awwwards evaluation system and the `/jury` engine in `sources/award-caliber-websites`.

---

## 1. The Blind Critique Principle

> **Why Blind?**
> When someone evaluates a website knowing the author's internal intent, they judge the *intention* rather than the *screen*.
> A juror arrives at a site cold. They have no access to the design notes, internal pitch, or private intentions.
> Therefore, this critique evaluates **strictly what a visitor sees, what the browser measures, and how the interface behaves**.

---

## 2. Awwwards Official Scoring Weights

The jury evaluation is calculated using the official international weights:

$$\text{Awwwards Score} = (0.40 \times \text{Design}) + (0.30 \times \text{Usability}) + (0.20 \times \text{Creativity}) + (0.10 \times \text{Content})$$

### A. Design (40%)
- **Art Direction & Atmosphere:** Does the page create an immersive visual world?
- **Graphic Quality:** Alignment, typography hierarchy, spatial tension, color palette discipline.
- **Editorial Polish:** Every static viewport works as an intentional composition.

### B. Usability (30%)
- **Information Architecture:** Can the user navigate with zero disorientation?
- **Interactive Feedback:** Do buttons, inputs, links, and cards provide crisp, immediate state feedback?
- **Speed & Stability:** Instant response, zero lag, smooth scrolling, clean keyboard focus.

### C. Creativity (20%)
- **Originality of Concept:** Does this break away from generic templates?
- **Signature Interactive Moment:** Is there a memorable, distinctive mechanic executed to perfection?
- **Emotional Resonance:** Does the site surprise or delight without sacrificing usability?

### D. Content (10%)
- **Copywriting Quality:** Real, substantive, evocative text tailored to the subject. Zero boilerplate fluff.
- **Visual Assets:** High-resolution bespoke imagery, tailored SVG assets, or creative 3D shaders.

---

## 3. Developer Evaluation (Technical Health)

Parallel to the visual jury, the site is audited across six core engineering areas:

1. **Semantics & SEO:** Proper document hierarchy (`h1` through `h6`), `<header>`, `<main>`, `<article>`, meta tags, OpenGraph images, canonical URLs.
2. **Animation Architecture:** 60 FPS minimum, composite-only properties (`transform`, `opacity`), zero layout thrashing, clean teardown.
3. **Accessibility (a11y):** Keyboard navigation, `:focus-visible`, color contrast ≥ 4.5:1, `aria-label` on icon controls, screen reader landmarks.
4. **Performance:** LCP < 2.0s, CLS < 0.05, sub-100KB initial CSS, asset lazy-loading.
5. **Mobile Responsiveness:** Native touch feedback, safe area padding (`env(safe-area-inset-*)`), responsive typography, no horizontal scroll leak.
6. **Markup & Code Cleanliness:** Clean DOM structure, minimal nesting depth, valid modern HTML5.

---

## 4. Ranked Fix List Format

Every audit report must conclude with a prioritized, actionable fix list ranked by leverage:

```markdown
### Priority 1: High-Impact / Critical (Blocks Site of the Day)
- [Issue description] -> [Exact code or design fix] -> [Target file & line]

### Priority 2: Refinement & Craft Polish
- [Issue description] -> [Exact code or design fix] -> [Target file & line]

### Priority 3: Micro-Delight & Edge Optimizations
- [Issue description] -> [Exact code or design fix] -> [Target file & line]
```
