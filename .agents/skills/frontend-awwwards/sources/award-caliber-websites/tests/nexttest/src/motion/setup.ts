// Global motion for this site: runs once on the client, before the first page initializes.
import { gsap } from 'gsap';
import { ease, setBackground, setLoaderFormat, setTransition } from '@/engine';

const sky = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uScroll;
void main() {
  vec3 top = mix(vec3(0.95), vec3(0.85, 0.88, 0.93), uScroll);
  gl_FragColor = vec4(mix(vec3(0.95), top, vUv.y), 1.0);
}`;

export function setupMotion() {
  setLoaderFormat((p) => `${Math.round(p)}%`);
  let point = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('pointerdown', (e) => { point = { x: e.clientX, y: e.clientY }; });
  setTransition({
    leave: (c) => gsap.timeline()
      .set(c, { autoAlpha: 1 })
      .set(c.querySelector('.curtain__panel'), { yPercent: 0 })
      .fromTo(c.querySelector('.curtain__panel'),
        { clipPath: `circle(0% at ${point.x}px ${point.y}px)` },
        { clipPath: `circle(150% at ${point.x}px ${point.y}px)`, duration: 0.9, ease: ease.inOut }),
    enter: (c) => gsap.timeline()
      .to(c.querySelector('.curtain__panel'), { clipPath: 'circle(0% at 50% 50%)', duration: 0.9, ease: ease.inOut })
      .set(c, { autoAlpha: 0 }),
  });
  const bg = setBackground(sky);
  if (!bg) document.documentElement.style.background = '#f2f2f2';
}
