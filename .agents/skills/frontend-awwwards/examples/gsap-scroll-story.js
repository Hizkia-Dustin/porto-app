/**
 * Production-Ready GSAP ScrollTrigger Storytelling Architecture
 * Demonstrates: Pinning, Scrubbing, Multi-Phase Journey, and Memory-Safe Cleanup
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initScrollStory(containerElement, stageElement, options = {}) {
  if (!containerElement || !stageElement) return null;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Context wrapper ensures complete cleanup on unmount
  const ctx = gsap.context(() => {
    if (motion.matches) {
      // Instantly set end state for reduced-motion users
      gsap.set(".story-card", { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerElement,
        start: "top top",
        end: "+=300%", // 300vh scroll distance
        pin: stageElement,
        scrub: 1.2, // 1.2s smooth dampening scrub
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Phase 1: Hero typography unfolds & scales back
    masterTimeline.to(".hero-title", {
      scale: 0.85,
      opacity: 0.2,
      duration: 1,
      ease: "power2.inOut",
    });

    // Phase 2: Feature showcase slides in with asymmetric parallax
    masterTimeline.fromTo(
      ".feature-showcase",
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
      "-=0.5" // 0.5s overlap for continuous flow
    );

    // Phase 3: Background stage transition into cosmic space
    masterTimeline.to(
      ".background-canvas",
      {
        opacity: 1,
        scale: 1.05,
        duration: 1.2,
        ease: "none",
      },
      "-=1.0"
    );
  }, containerElement);

  return () => ctx.revert();
}
