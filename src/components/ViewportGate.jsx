"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Defers mounting of heavy below-the-fold 3D experiences until the user
 * scrolls within a generous threshold (rootMargin), keeping initial page
 * hydration blazing fast and eliminating initial main-thread blocking.
 */
export default function ViewportGate({ children, rootMargin = "800px", minHeight = "100vh" }) {
  const containerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldRender(true);
        observer.disconnect();
      }
    }, { rootMargin });

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender, rootMargin]);

  return (
    <div ref={containerRef} style={shouldRender ? undefined : { minHeight }}>
      {shouldRender ? children : null}
    </div>
  );
}
