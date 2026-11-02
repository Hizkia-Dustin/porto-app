# ADVANCED ANIMATION & MOTION CHOREOGRAPHY

Synthesizing principles and code architectures from:
- `sources/gsap-skills` (Official GreenSock agent knowledge)
- `sources/gsap-library` (Core engine mechanics)
- `sources/lenis` (Darkroom Engineering smooth scrolling)
- `sources/award-caliber-websites` (Motion Engine)
- `sources/goated-ui` (Interaction recipes)

---

## 1. The Physics of Motion: Core Principles

### A. Motion Conveys Physical Meaning
- Elements must not arbitrarily slide in from random directions.
- Motion communicates **mass, momentum, spatial hierarchy, and continuity**.
- Heavy objects move slower with higher inertia; lightweight accents snap with crisp dampening.

### B. Continuous Motion Over Fragmented Triggers
- Avoid "fade-and-slide up on every card as it enters the viewport". This is the hallmark of template engines and generic AI websites.
- Prefer **orchestrated sequences**:
  - The loader expands seamlessly into the hero canvas.
  - As the user scrolls, typography unfolds, splits, or scales while background cameras glide.
  - Hovering a card doesn't just change background color; it influences adjacent elements, pulls the cursor magnetically, and tilts the card geometry.

### C. Standard Easing Palettes
Never use browser default `ease` or `linear` for UI elements:
```javascript
// High-end cinematic entrance (decelerating smoothly into place)
const EASE_OUT_EXPO = "expo.out";       // cubic-bezier(0.16, 1, 0.3, 1)
const EASE_OUT_QUINT = "quint.out";     // cubic-bezier(0.22, 1, 0.36, 1)

// Fluid interactive spring-like feel (for magnetic hovers and drags)
const EASE_POWER4 = "power4.out";

// Reversible smooth scroll scrubbing
const SCRUB_SMOOTH = 1.2; // 1.2s dampening lag
```

---

## 2. GSAP + ScrollTrigger Architecture

### A. The Master ScrollTrigger Setup in React / Next.js
Always register plugins and clean up properly in modern React / Next.js lifecycle:

```jsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

export function useGsapScrollTrigger(setupCallback, dependencies = []) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      setupCallback(containerRef.current);
    }, containerRef);

    return () => ctx.revert(); // Flawless cleanup on unmount
  }, dependencies);

  return containerRef;
}
```

### B. Pinning & Horizontal Storytelling
For multi-phase horizontal scroll sections:

```javascript
gsap.to(".horizontal-track", {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: ".horizontal-container",
    pin: true,
    scrub: 1,
    start: "top top",
    end: () => `+=${track.scrollWidth - window.innerWidth}`,
    invalidateOnRefresh: true,
  },
});
```

---

## 3. Lenis Smooth Scrolling Integration

Lenis is the gold standard for smooth scrolling because it does not hijack native scroll mechanics — it normalizes velocity and synchronizes with the GPU refresh loop.

### A. Canonical Lenis + GSAP Ticker Binding
In a global layout or client provider:

```jsx
"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // Synchronize Lenis with GSAP's internal ticker
    lenis.on("scroll", ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0); // Critical for precise scroll-scrub syncing

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

---

## 4. Typography & SplitText Reveals

Breaking text into words, characters, or lines creates breathtaking editorial entrances.

### A. Masked Line-by-Line Stagger Reveal
Wrap lines in an overflow-hidden mask to achieve high-fashion editorial entrances:

```javascript
// Each line starts below its container mask (yPercent: 100)
gsap.fromTo(
  ".editorial-line",
  { yPercent: 110, rotateZ: 2, opacity: 0 },
  {
    yPercent: 0,
    rotateZ: 0,
    opacity: 1,
    duration: 1.1,
    stagger: 0.08,
    ease: "power4.out",
    scrollTrigger: {
      trigger: ".editorial-heading",
      start: "top 80%",
    },
  }
);
```

---

## 5. Micro-Interactions & Magnetic Physics

### A. Performance-First Magnetic Element
Use GSAP `quickTo` for 120 FPS cursor and button tracking without triggering layout recalculations:

```javascript
export function makeMagnetic(element, strength = 0.35) {
  const xTo = gsap.quickTo(element, "x", { duration: 0.6, ease: "power3.out" });
  const yTo = gsap.quickTo(element, "y", { duration: 0.6, ease: "power3.out" });

  const onMouseMove = (e) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    xTo(distanceX);
    yTo(distanceY);
  };

  const onMouseLeave = () => {
    xTo(0);
    yTo(0);
  };

  element.addEventListener("mousemove", onMouseMove);
  element.addEventListener("mouseleave", onMouseLeave);

  return () => {
    element.removeEventListener("mousemove", onMouseMove);
    element.removeEventListener("mouseleave", onMouseLeave);
  };
}
```

---

## 6. Performance & Accessibility (WCAG Non-Negotiables)

1. **Composite-Only Properties:** Only animate `transform` (`x`, `y`, `scale`, `rotation`) and `opacity`. Never animate `top`, `left`, `margin`, `padding`, `width`, or `height`.
2. **Layer Promotion:** Use `will-change: transform` only on elements actively animating, and remove it when resting to conserve GPU memory.
3. **Respect `prefers-reduced-motion`:**
```javascript
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReduced) {
  // Jump instantly to completed state, skip scrub animations
  gsap.set(targets, { opacity: 1, x: 0, y: 0, scale: 1 });
}
```
