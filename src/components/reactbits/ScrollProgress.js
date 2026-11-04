"use client";

import { useEffect, useRef } from "react";

// Adapted from React Bits' Scroll Progress:
// https://reactbits.dev/components/scroll-progress
export default function ScrollProgress({
  position = "right", // "right" | "top" | "both"
  color = "#15100e",
  trackColor = "rgba(21, 16, 14, 0.15)",
  thickness = 3,
  className = "",
}) {
  const topBar = useRef(null);
  const sideBar = useRef(null);

  useEffect(() => {
    let distance = 0;
    const handleScroll = () => {
      const current = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      if (topBar.current) topBar.current.style.transform = `scaleX(${current})`;
      if (sideBar.current) sideBar.current.style.transform = `scaleY(${current})`;
    };
    const measure = () => {
      distance = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      handleScroll();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", measure);
    measure();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [position]);

  const showRight = position === "right" || position === "both";
  const showTop = position === "top" || position === "both";

  return (
    <div className={`pointer-events-none z-[9999] ${className}`} aria-hidden="true">
      {/* Top Horizontal Progressive Bar */}
      {showTop && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: `${thickness}px`,
            backgroundColor: trackColor,
          }}
        >
          <div ref={topBar}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: color,
              transformOrigin: "left center",
              transform: "scaleX(0)",
              willChange: "transform",
              transition: "transform 80ms ease-out",
            }}
          />
        </div>
      )}

      {/* Right Vertical Progressive Rail (Replaces Native Scrollbar) */}
      {showRight && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: `${thickness}px`,
            backgroundColor: trackColor,
          }}
        >
          <div ref={sideBar}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: color,
              transformOrigin: "top center",
              transform: "scaleY(0)",
              willChange: "transform",
              transition: "transform 80ms ease-out",
            }}
          />
        </div>
      )}
    </div>
  );
}
