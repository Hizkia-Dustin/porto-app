'use client';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { onScroll } from '@/engine';
import { usePage } from '@/engine/next';

export function Marquee({ text }: { text: string }) {
  const track = useRef<HTMLDivElement>(null);
  usePage(() => {
    const loop = gsap.to(track.current, { xPercent: -50, ease: 'none', duration: 20, repeat: -1 });
    const off = onScroll(({ velocity }) => {
      gsap.to(loop, { timeScale: (velocity < 0 ? -1 : 1) * (1 + Math.min(Math.abs(velocity) / 8, 5)), duration: 0.4, overwrite: true });
    });
    return off;
  });
  return (
    <div style={{ overflow: 'clip', fontSize: 'var(--t-xl)', whiteSpace: 'nowrap' }} aria-hidden="true">
      <div ref={track} style={{ display: 'inline-flex', gap: '1em' }}>
        <span>{text}</span><span>{text}</span>
      </div>
    </div>
  );
}
