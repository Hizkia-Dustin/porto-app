/**
 * Masked Line & Word Reveal Animation
 * Creates the signature Awwwards editorial entrance
 * Supports accessible DOM fallbacks and prefers-reduced-motion
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function animateSplitReveal(targetSelector, options = {}) {
  const elements = document.querySelectorAll(targetSelector);
  if (!elements.length) return null;

  const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isReduced) {
    elements.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }));
    return null;
  }

  const ctx = gsap.context(() => {
    elements.forEach((element) => {
      // Split element lines into masked overflow-hidden spans
      const rawText = element.textContent.trim();
      const words = rawText.split(/\s+/);

      element.innerHTML = words
        .map(
          (word) =>
            `<span class="inline-block overflow-hidden align-top"><span class="inline-block will-change-transform split-word">${word}&nbsp;</span></span>`
        )
        .join("");

      gsap.fromTo(
        element.querySelectorAll(".split-word"),
        {
          yPercent: 110,
          rotateZ: 2,
          opacity: 0,
        },
        {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          duration: options.duration || 1.1,
          stagger: options.stagger || 0.035,
          ease: "power4.out",
          scrollTrigger: {
            trigger: element,
            start: options.start || "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  });

  return () => ctx.revert();
}
