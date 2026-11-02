import React from "react";

/**
 * Asymmetric Editorial Layout Component
 * Anti-Slop Principles Demonstrated:
 * - Replaces 3-card grid with asymmetric focal hierarchy
 * - Uses scale contrast (massive headline vs delicate micro-data)
 * - Negative space breathing rooms
 * - Purposeful hairline borders with no plastic shadows
 */
export default function EditorialShowcase({
  tagline = "CURATED ARCHIVE // 2026",
  headline = "ARCHITECTURAL TECTONICS & SPATIAL INTERACTION",
  description = "Exploring the boundary between structural code, kinetic physics, and digital typography. Designed with mathematical rhythm and zero generic template residue.",
  metrics = [
    { label: "FRAME RATE", value: "120 FPS" },
    { label: "LATENCY TARGET", value: "< 16 MS" },
    { label: "TYPOGRAPHIC SCALE", value: "FLUID RATIO" },
  ],
}) {
  return (
    <section className="relative min-h-screen w-full bg-[#0a0c0b] text-[#f4f2ee] px-6 md:px-16 py-24 flex flex-col justify-between selection:bg-[#e20b3a] selection:text-[#0a0c0b]">
      {/* Top Meta Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 text-xs tracking-widest uppercase font-mono text-white/50">
        <span>{tagline}</span>
        <span className="hidden sm:inline">01 / SELECTED ESSAY</span>
      </header>

      {/* Main Asymmetric Grid */}
      <div className="my-auto py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end">
        {/* Dominant Left Anchor (7 Columns) */}
        <div className="lg:col-span-8">
          <h1 className="text-[clamp(2.75rem,7vw+0.5rem,8.5rem)] font-bold tracking-tighter leading-[0.92] text-balance">
            {headline}
          </h1>
        </div>

        {/* Secondary Editorial Column (4 Columns Offset) */}
        <div className="lg:col-span-4 lg:pl-6 space-y-8">
          <p className="text-base md:text-lg text-white/70 leading-relaxed font-light max-w-[42ch]">
            {description}
          </p>

          {/* Technical Spec List (Replaces Generic Icon Cards) */}
          <div className="border-t border-white/10 pt-6 space-y-4 font-mono text-xs">
            {metrics.map((item, idx) => (
              <div key={idx} className="flex justify-between items-baseline py-1 border-b border-white/5">
                <span className="text-white/40">{item.label}</span>
                <span className="text-[#e20b3a] font-semibold tracking-wider">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editorial Footer */}
      <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-white/10 pt-6 text-xs text-white/40 font-mono">
        <span>SCROLL FOR DEEP EXPLORATION</span>
        <span className="mt-2 sm:mt-0">[ DIRECTION: EDITORIAL TECTONICS ]</span>
      </footer>
    </section>
  );
}
