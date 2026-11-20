"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Defers mounting of heavy below-the-fold 3D experiences until:
 * 1. The user is already at this section (e.g. page refreshed while scrolled down, or direct #hash anchor), OR
 * 2. The user initiates a scroll towards the section, OR
 * 3. An idle callback fires (so the initial hero & page loader run at silky smooth 60fps without CPU contention).
 */
export default function ViewportGate({
  children,
  rootMargin = "400px",
  minHeight = "100vh",
  id,
}) {
  const containerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(() => {
    if (typeof window === "undefined") return false;
    const isDirectHash = id && window.location.hash === `#${id}`;
    const isAlreadyScrolled = window.scrollY > 150;
    return isDirectHash || isAlreadyScrolled;
  });

  useEffect(() => {
    if (shouldRender) return;

    let disposed = false;
    let observer = null;
    let idleHandle = null;
    let timerHandle = null;

    const mount = () => {
      if (disposed) return;
      setShouldRender(true);
      cleanup();
    };

    const cleanup = () => {
      disposed = true;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (idleHandle && typeof cancelIdleCallback === "function") {
        cancelIdleCallback(idleHandle);
      }
      if (timerHandle) {
        clearTimeout(timerHandle);
      }
      window.removeEventListener("scroll", onFirstUserIntent);
      window.removeEventListener("wheel", onFirstUserIntent);
      window.removeEventListener("touchmove", onFirstUserIntent);
    };

    const startObserver = () => {
      const node = containerRef.current;
      if (!node || disposed) return;
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          mount();
        }
      }, { rootMargin });
      observer.observe(node);
    };

    const onFirstUserIntent = () => {
      cleanup();
      startObserver();
    };

    // If user is already near, observe immediately
    if (window.scrollY > 50 || (id && window.location.hash === `#${id}`)) {
      startObserver();
      return cleanup;
    }

    // Otherwise, wait for user intent (scroll/wheel/touch) so initial refresh & loader are 100% lag-free
    window.addEventListener("scroll", onFirstUserIntent, { passive: true, once: true });
    window.addEventListener("wheel", onFirstUserIntent, { passive: true, once: true });
    window.addEventListener("touchmove", onFirstUserIntent, { passive: true, once: true });

    // Background idle fallback: if user stays on hero, mount during idle after 2.5s
    if (typeof requestIdleCallback === "function") {
      idleHandle = requestIdleCallback(() => startObserver(), { timeout: 2500 });
    } else {
      timerHandle = setTimeout(() => startObserver(), 2500);
    }

    return cleanup;
  }, [shouldRender, rootMargin, id]);

  return (
    <div ref={containerRef} style={shouldRender ? undefined : { minHeight }}>
      {shouldRender ? children : null}
    </div>
  );
}
