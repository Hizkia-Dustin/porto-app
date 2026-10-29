"use client";

import { useEffect, useState } from "react";

// Adapted from React Bits' Scroll Progress:
// https://reactbits.dev/components/scroll-progress
export default function ScrollProgress({
  position = "right", // "right" | "top" | "both"
  color = "#15100e",
  trackColor = "rgba(21, 16, 14, 0.15)",
  thickness = 3,
  className = "",
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const totalScroll = scrollHeight - clientHeight;
      if (totalScroll <= 0) {
        setProgress(0);
        return;
      }
      const current = Math.min(1, Math.max(0, scrollTop / totalScroll));
      setProgress(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

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
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: color,
              transformOrigin: "left center",
              transform: `scaleX(${progress})`,
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
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: color,
              transformOrigin: "top center",
              transform: `scaleY(${progress})`,
              willChange: "transform",
              transition: "transform 80ms ease-out",
            }}
          />
        </div>
      )}
    </div>
  );
}
