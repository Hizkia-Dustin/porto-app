"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#*+~";

/**
 * High-performance, zero-dependency text shuffle / scramble component.
 * Completely immune to matrix3d layout issues, font loading delays, or GSAP SplitText bugs.
 * Always renders visible text immediately, then scrambles smoothly at 60fps.
 */
export default function ShuffleText({
  text = "",
  className = "",
  style = {},
  duration = 0.55,
  triggerOnHover = true,
  autoStart = true,
}) {
  const [displayText, setDisplayText] = useState(text);
  const animatingRef = useRef(false);

  const startShuffle = useCallback(() => {
    if (animatingRef.current || !text) return;
    animatingRef.current = true;

    const length = text.length;
    const startTime = performance.now();
    const totalDuration = duration * 1000;
    let lastTick = 0;

    const frame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      const settledCount = Math.floor(progress * (length + 2));

      // Throttle character randomized changes slightly to ~30fps for a clean cinematic look
      if (now - lastTick > 32 || progress >= 1) {
        lastTick = now;
        let result = "";
        for (let i = 0; i < length; i++) {
          const char = text[i];
          if (char === " " || char === "/" || char === "—" || char === "-") {
            result += char;
          } else if (i < settledCount) {
            result += char;
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setDisplayText(result);
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setDisplayText(text);
        animatingRef.current = false;
      }
    };

    requestAnimationFrame(frame);
  }, [text, duration]);

  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(startShuffle, 200);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startShuffle]);

  return (
    <span
      className={`inline-block select-none ${className}`}
      style={{ display: "inline-block", ...style }}
      onMouseEnter={triggerOnHover ? startShuffle : undefined}
    >
      {displayText}
    </span>
  );
}
