// Shared vertex: bends the plane with scroll velocity, swells on hover.
export const vertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uVelocity;
uniform float uHover;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  float bend = sin(uv.x * 3.14159265);
  p.y += bend * uVelocity * 0.06;
  p.z += bend * uHover * 0.05;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const common = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uPlane;
uniform float uTime;
uniform float uHover;
uniform float uVelocity;
uniform float uReveal;
uniform vec2 uMouse;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}
// Reveal mask: rises from the bottom with an organic edge. uReveal 0 → hidden, 1 → shown.
float revealMask(vec2 uv) {
  float edge = uReveal * 1.25 - 0.12 + (noise(uv * vec2(6.0, 2.0) + uTime * 0.2) - 0.5) * 0.12;
  return smoothstep(edge, edge - 0.08, uv.y);
}`;

// Image plane: object-fit: cover in-shader, hover zoom + chromatic split driven by velocity.
export const imageFragment = /* glsl */ `
${common}
uniform sampler2D tMap;
uniform vec2 uImage;
vec2 cover(vec2 uv) {
  vec2 r = vec2(min((uPlane.x / uPlane.y) / (uImage.x / uImage.y), 1.0), min((uPlane.y / uPlane.x) / (uImage.y / uImage.x), 1.0));
  return uv * r + (1.0 - r) * 0.5;
}
void main() {
  vec2 uv = vUv;
  vec2 c = uv - 0.5;
  uv = 0.5 + c * (1.0 - uHover * 0.06);
  vec2 dir = (uv - uMouse) * uHover;
  uv += dir * 0.04 * smoothstep(0.6, 0.0, length(vUv - uMouse));
  float shift = (abs(uVelocity) * 0.004 + uHover * 0.004);
  vec2 t = cover(uv);
  float r = texture2D(tMap, t + vec2(shift, 0.0)).r;
  float g = texture2D(tMap, t).g;
  float b = texture2D(tMap, t - vec2(shift, 0.0)).b;
  gl_FragColor = vec4(r, g, b, 1.0) * revealMask(vUv);
}`;

// Procedural plane: seeded flowing field in the palette. Honest generative cover art for
// projects that do not have imagery yet (never a fake screenshot).
export const proceduralFragment = /* glsl */ `
${common}
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform float uSeed;
void main() {
  vec2 uv = vUv;
  vec2 p = uv * vec2(uPlane.x / uPlane.y, 1.0) * 1.6 + uSeed * 7.0;
  float t = uTime * 0.05;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 m = (uMouse - 0.5) * uHover * 0.8;
  float f = fbm(p + 2.5 * q + m + vec2(uVelocity * 0.02, 0.0));
  vec3 col = mix(uC1, uC2, smoothstep(0.2, 0.75, f));
  col = mix(col, uC3, smoothstep(0.55, 0.95, length(q) * f * 1.4));
  col += (hash(uv * uPlane + fract(uTime)) - 0.5) * 0.045; // film grain
  gl_FragColor = vec4(col, 1.0) * revealMask(vUv);
}`;
