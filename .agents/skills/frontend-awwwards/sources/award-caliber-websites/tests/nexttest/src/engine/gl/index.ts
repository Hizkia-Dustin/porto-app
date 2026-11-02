// DOM-synced WebGL planes on ONE shared canvas (the standard award-site technique).
//   <figure data-gl>                         image plane: uses the <img> inside (keep the img: SEO, a11y, fallback)
//   <figure data-gl="procedural" data-seed="3" data-colors="#0d0d0d,#e9e4da,#ff4d00">  generative cover
//   data-gl-scrub (reveal tied to scroll position)  data-gl-duration="2.4" (timed reveal length)  data-gl-instant
// The DOM element stays in layout; the canvas draws on top of its rect each frame.
// Disabled under reduced motion, without WebGL, or with Save-Data; DOM images then show as-is.
import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture, Vec2, Triangle } from 'ogl';
import { gsap } from 'gsap';
import { vertex, imageFragment, proceduralFragment } from './shaders';
import { scrollState } from '../scroll';
import { prefersReducedMotion } from '../env';

type Item = { el: HTMLElement; mesh: Mesh; program: Program; hover: { v: number }; revealed: boolean; scrub: boolean; io?: IntersectionObserver; off: () => void };

let renderer: Renderer | null = null;
let camera: Camera;
let scene: Transform;
let geometry: Plane;
const items: Item[] = [];
const textures = new Map<string, Texture>();
let vw = 0, vh = 0, time = 0, velocity = 0;
let bg: { scene: Transform; program: Program } | null = null;
const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

const hex = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function glSupported() {
  if (prefersReducedMotion()) return false;
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return false;
  try { return !!document.createElement('canvas').getContext('webgl'); } catch { return false; }
}

export function initGL() {
  if (renderer || !glSupported()) return;
  renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 2), alpha: true, antialias: false, premultipliedAlpha: true });
  const gl = renderer.gl;
  gl.canvas.classList.add('gl-canvas');
  gl.canvas.setAttribute('aria-hidden', 'true');
  // Lives in a host element that persists across navigations (#gl in the layout).
  (document.getElementById('gl') || document.body).appendChild(gl.canvas);
  camera = new Camera(gl, { near: -10, far: 10 });
  camera.position.z = 1;
  scene = new Transform();
  geometry = new Plane(gl, { widthSegments: 24, heightSegments: 24 });
  document.documentElement.classList.add('gl-on');
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { mouse.tx = e.clientX / vw; mouse.ty = 1 - e.clientY / vh; }, { passive: true });
  gsap.ticker.add(render);
}

/**
 * Fullscreen shader layer drawn under the DOM planes (skies, fields, gradients, noise).
 * Built-in uniforms: uTime (s), uResolution (px), uScroll (0..1 page progress), uScrollY (px),
 * uVelocity (smoothed scroll velocity), uMouse (0..1, smoothed). Varying: vUv.
 * Persists across navigations until clearBackground(). Returns the Program (tween its uniforms).
 */
export function setBackground(fragment: string, uniforms: Record<string, { value: unknown }> = {}) {
  if (!renderer) return null;
  clearBackground();
  const gl = renderer.gl;
  const program = new Program(gl, {
    vertex: `attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`,
    fragment,
    uniforms: {
      uTime: { value: 0 }, uResolution: { value: new Vec2(vw, vh) }, uScroll: { value: 0 }, uScrollY: { value: 0 },
      uVelocity: { value: 0 }, uMouse: { value: new Vec2(0.5, 0.5) }, ...uniforms,
    },
    depthTest: false,
    depthWrite: false,
  });
  const scene = new Transform();
  new Mesh(gl, { geometry: new Triangle(gl), program }).setParent(scene);
  bg = { scene, program };
  return program;
}
export function clearBackground() { bg = null; }

function resize() {
  if (!renderer) return;
  vw = innerWidth; vh = innerHeight;
  renderer.setSize(vw, vh);
  camera.orthographic({ left: -vw / 2, right: vw / 2, top: vh / 2, bottom: -vh / 2, near: -10, far: 10 });
}

function loadTexture(img: HTMLImageElement, program: Program) {
  const src = img.currentSrc || img.src;
  const gl = renderer!.gl;
  let tex = textures.get(src);
  const apply = (t: Texture) => {
    program.uniforms.tMap.value = t;
    const im = t.image as HTMLImageElement;
    program.uniforms.uImage.value.set(im.naturalWidth || 1, im.naturalHeight || 1);
  };
  if (tex) return apply(tex);
  tex = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR });
  textures.set(src, tex);
  const im = new Image();
  im.crossOrigin = 'anonymous';
  im.decoding = 'async';
  im.onload = () => { tex!.image = im; apply(tex!); };
  im.src = src;
}

function add(el: HTMLElement) {
  if (!renderer) return;
  const gl = renderer.gl;
  const procedural = el.dataset.gl === 'procedural';
  const uniforms: Record<string, { value: unknown }> = {
    uPlane: { value: new Vec2(1, 1) },
    uTime: { value: 0 },
    uHover: { value: 0 },
    uVelocity: { value: 0 },
    uReveal: { value: el.hasAttribute('data-gl-instant') ? 1 : 0 },
    uMouse: { value: new Vec2(0.5, 0.5) },
  };
  if (procedural) {
    const [c1, c2, c3] = (el.dataset.colors || '#111111,#888888,#eeeeee').split(',').map(hex);
    Object.assign(uniforms, { uC1: { value: c1 }, uC2: { value: c2 }, uC3: { value: c3 }, uSeed: { value: parseFloat(el.dataset.seed || '1') } });
  } else {
    const blank = new Texture(gl, { image: new Uint8Array([0, 0, 0, 0]), width: 1, height: 1 });
    Object.assign(uniforms, { tMap: { value: blank }, uImage: { value: new Vec2(1, 1) } });
  }
  const program = new Program(gl, { vertex, fragment: procedural ? proceduralFragment : imageFragment, uniforms, transparent: true });
  const mesh = new Mesh(gl, { geometry, program });
  mesh.setParent(scene);
  const img = el.querySelector('img');
  if (img && !procedural) {
    if (img.complete && img.naturalWidth) loadTexture(img, program);
    else img.addEventListener('load', () => loadTexture(img, program), { once: true });
  }
  const hover = { v: 0 };
  const enter = () => gsap.to(hover, { v: 1, duration: 0.9, ease: 'expo.out' });
  const leave = () => gsap.to(hover, { v: 0, duration: 0.9, ease: 'expo.out' });
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    program.uniforms.uMouse.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
  };
  el.addEventListener('pointerenter', enter);
  el.addEventListener('pointerleave', leave);
  el.addEventListener('pointermove', move);
  const scrub = el.hasAttribute('data-gl-scrub');
  const item: Item = {
    el, mesh, program, hover, revealed: false, scrub,
    off: () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointermove', move);
    },
  };
  if (!el.hasAttribute('data-gl-instant') && !scrub) {
    item.io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !item.revealed) {
        item.revealed = true;
        gsap.to(program.uniforms.uReveal, { value: 1, duration: parseFloat(el.dataset.glDuration || '1.6'), ease: 'expo.out', delay: parseFloat(el.dataset.delay || '0') });
        item.io?.disconnect();
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    item.io.observe(el);
  }
  items.push(item);
}

/** Scan a page for [data-gl] elements. Call on every page load. */
export function mountGL(root: ParentNode = document) {
  if (!renderer) return;
  root.querySelectorAll<HTMLElement>('[data-gl]').forEach(add);
}

/** Remove all planes (before a page swap). Textures stay cached for back-navigation. */
export function unmountGL() {
  while (items.length) {
    const it = items.pop()!;
    it.off();
    it.io?.disconnect();
    it.mesh.setParent(null);
    it.program.remove?.();
  }
}

/** Fade every plane out, e.g. as part of a page-leave animation. */
export function hideGL(duration = 0.6) {
  return gsap.to(items.map((i) => i.program.uniforms.uReveal), { value: 0, duration, ease: 'expo.in' });
}

function render(t: number) {
  if (!renderer || document.hidden) return;
  time = t;
  const target = Math.max(-40, Math.min(40, scrollState().velocity));
  velocity += (target - velocity) * 0.12;
  let visible = 0;
  for (const it of items) {
    const r = it.el.getBoundingClientRect();
    const onScreen = r.bottom > -100 && r.top < vh + 100 && r.width > 0;
    it.mesh.visible = onScreen;
    if (!onScreen) continue;
    visible++;
    it.mesh.scale.set(r.width, r.height, 1);
    it.mesh.position.set(r.left + r.width / 2 - vw / 2, vh / 2 - (r.top + r.height / 2), 0);
    const u = it.program.uniforms;
    u.uPlane.value.set(r.width, r.height);
    u.uTime.value = time;
    u.uHover.value = it.hover.v;
    u.uVelocity.value = velocity * 0.05;
    // data-gl-scrub: reveal follows position: 0 when the top enters the viewport, 1 at 25% from the top.
    if (it.scrub) u.uReveal.value = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
  }
  mouse.x += (mouse.tx - mouse.x) * 0.08;
  mouse.y += (mouse.ty - mouse.y) * 0.08;
  if (bg) {
    const u = bg.program.uniforms;
    const s = scrollState();
    u.uTime.value = time; u.uResolution.value.set(vw, vh); u.uScroll.value = s.progress; u.uScrollY.value = s.y;
    u.uVelocity.value = velocity; u.uMouse.value.set(mouse.x, mouse.y);
    renderer.render({ scene: bg.scene, camera });
    renderer.render({ scene, camera, clear: false });
  } else if (visible || renderer.gl.canvas.dataset.dirty !== '0') {
    renderer.render({ scene, camera });
    renderer.gl.canvas.dataset.dirty = visible ? '1' : '0';
  }
}
