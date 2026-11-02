# WEBGL, SHADERS & CREATIVE COMPUTING

Synthesizing technical knowledge from:
- `sources/award-caliber-websites` (WebGL Engine)
- `sources/giats-portfolio` (Production Three.js architecture)
- `sources/awwwards-examples` (Curated WebGPU / Three.js showcases)
- `sources/goated-ui` (Shaders & Canvas)

---

## 1. When to Use WebGL vs Canvas 2D vs DOM

| Technique | When to Use | When to Avoid |
|---|---|---|
| **DOM + CSS / GSAP** | Layouts, cards, text reveals, UI states, standard menus | Deforming 10,000 points, liquid image ripples |
| **Canvas 2D** | Lightweight generative graphs, 2D trailing lines, interactive cursors | 3D lighting, complex mesh geometry, vertex deformation |
| **WebGL / OGL / Three.js** | 3D spatial scenes, custom GLSL fragment distortion, particle oceans, raymarching, post-processing | Simple text layouts, standard forms, non-visual UI |

**Rule of Thumb:**
- Use **OGL** for lightweight 2D image distortion, plane ripples, and minimal shaders (~8KB footprint).
- Use **Three.js** when you need real 3D camera geometry, environment maps, glTF models, or particle depth.
- Use **React Three Fiber (R3F)** when the entire web application is fundamentally a 3D canvas experience.

---

## 2. Essential Performance Rules for WebGL in Browser

### A. Device Pixel Ratio (DPR) Clamping
Never use raw `window.devicePixelRatio`. A 3x Retina display will render `9x` the fragment pixels and cause heavy thermal throttling on mobile devices.

```javascript
// Clamp DPR between 1.0 and 1.75 (maximum 2.0 on high-end desktop)
const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
renderer.setPixelRatio(pixelRatio);
```

### B. Viewport Culling & Visibility Pausing
Do not run an active `requestAnimationFrame` loop when the canvas is scrolled out of view or the browser tab is hidden:

```javascript
let isVisible = false;
let rafId = null;

const observer = new IntersectionObserver(([entry]) => {
  isVisible = entry.isIntersecting;
  if (isVisible) wakeRenderLoop();
  else cancelAnimationFrame(rafId);
}, { threshold: 0 });

observer.observe(canvasElement);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancelAnimationFrame(rafId);
  else if (isVisible) wakeRenderLoop();
});
```

### C. Thorough Disposal to Prevent Memory Leaks
Always dispose geometries, textures, and materials when a React component unmounts:

```javascript
export function disposeScene(scene, renderer) {
  scene.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry?.dispose();
    if (object.material.isMaterial) {
      cleanMaterial(object.material);
    } else if (Array.isArray(object.material)) {
      object.material.forEach(cleanMaterial);
    }
  });
  renderer.dispose();
  renderer.forceContextLoss();
}

function cleanMaterial(mat) {
  Object.keys(mat).forEach((prop) => {
    if (mat[prop] && typeof mat[prop].dispose === "function") {
      mat[prop].dispose();
    }
  });
  mat.dispose();
}
```

---

## 3. Shader Recipes for Award-Winning Websites

### A. Liquid Ripple Image Distortion (Fragment Shader)
Creates liquid wave displacement when hovering over project cards:

```glsl
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uHoverProgress;
uniform float uTime;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  // Distance from interactive pointer
  float dist = distance(uv, uMouse);
  
  // Wave equation with exponential dampening
  float wave = sin(dist * 24.0 - uTime * 3.5) * 0.03 * uHoverProgress;
  float falloff = smoothstep(0.45, 0.0, dist);
  
  vec2 distortedUv = uv + (normalize(uv - uMouse) * wave * falloff);
  
  // Chromatic aberration on wave edges
  float r = texture2D(uTexture, distortedUv + vec2(0.003 * wave, 0.0)).r;
  float g = texture2D(uTexture, distortedUv).g;
  float b = texture2D(uTexture, distortedUv - vec2(0.003 * wave, 0.0)).b;
  
  gl_FragColor = vec4(r, g, b, 1.0);
}
```

### B. Procedural Film Grain & Noise Overlay
Eliminates digital banding in gradients and dark backgrounds:

```glsl
float pseudoNoise(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(uBaseTexture, vUv);
  float grain = (pseudoNoise(vUv * uResolution + fract(uTime)) - 0.5) * 0.045;
  gl_FragColor = vec4(color.rgb + grain, color.a);
}
```

---

## 4. Camera Choreography Linked to Scroll Progression

When linking a 3D camera to user scroll, map progress cleanly via normalized playhead easing:

```javascript
// Sample journey progression between 0 and 1
export function updateCameraOnScroll(progress, camera) {
  const p = Math.max(0, Math.min(1, progress));
  
  // Curved camera motion through 3D space
  const targetZ = 12 - 40 * Math.pow(p, 1.2);
  const targetX = Math.sin(p * Math.PI) * 4.5;
  const targetRotY = Math.sin(p * Math.PI * 0.5) * -0.25;

  camera.position.x = targetX;
  camera.position.z = targetZ;
  camera.rotation.y = targetRotY;
}
```
