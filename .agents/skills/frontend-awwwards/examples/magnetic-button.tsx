"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Performance-First Magnetic Interactive Button
 * Uses GSAP quickTo for zero-layout-thrashing cursor attraction
 * Bypasses physics on touch screens and prefers-reduced-motion
 */
export default function MagneticButton({
  children,
  strength = 0.35,
  className = "",
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    const content = contentRef.current;
    if (!btn || !content) return;

    // Skip on touch or reduced motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || isReduced) return;

    // GSAP quickTo handles 120 FPS continuous tweening
    const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
    const textXTo = gsap.quickTo(content, "x", { duration: 0.4, ease: "power3.out" });
    const textYTo = gsap.quickTo(content, "y", { duration: 0.4, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      xTo(deltaX);
      yTo(deltaY);
      textXTo(deltaX * 0.4); // Subtle parallax separation between button & text
      textYTo(deltaY * 0.4);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
      textXTo(0);
      textYTo(0);
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return (
    <button
      ref={buttonRef}
      className={`relative inline-flex items-center justify-center px-8 py-4 font-mono text-xs uppercase tracking-widest text-[#f4f2ee] bg-[#141716] border border-white/15 hover:border-[#e20b3a] hover:text-[#e20b3a] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e20b3a] cursor-pointer will-change-transform ${className}`}
      {...props}
    >
      <span ref={contentRef} className="inline-block will-change-transform pointer-events-none">
        {children}
      </span>
    </button>
  );
}
