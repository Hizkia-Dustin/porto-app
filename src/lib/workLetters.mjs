import { MathUtils } from "three";

export const LETTER_COPIES = 10;
const rows = [10.4, 3.7, -3.7, -10.4];
const bends = [2, 1, -1, -2];
const speeds = [0.8, 1, 0.7, 0.9];
const halfFov = Math.tan(25 * Math.PI / 180);

// Four curved, scroll-driven letter streams inspired by:
// https://codepen.io/stephen533422/pen/pvogwPL
// Coordinates are viewport-height units; React owns all letter elements.
export function sampleWorkLetter(row, copy, progress, cameraZ, reducedMotion = false) {
  // Continue the stream phase beyond the entrance while the project gallery scrolls.
  const p = Math.max(0, progress);
  const spread = reducedMotion ? 0 : MathUtils.smoothstep(p, 0.6, 0.82);
  const distance = Math.max(18, cameraZ + 46);
  const startScale = 1 / (2 * halfFov * distance);
  const phase = (copy / LETTER_COPIES + Math.max(0, p - 0.82) * 3 * speeds[row]) % 1;
  const depth = 20 + 5 * (1 - (2 * phase - 1) ** 2);
  const endScale = 1 / (2 * halfFov * depth);
  return {
    x: MathUtils.lerp((row * 4 - 6) * startScale, (25 - 50 * phase) * endScale, spread),
    y: MathUtils.lerp(0, -0.8 * (rows[row] - Math.sin(phase * Math.PI) * bends[row]) * endScale, spread),
    size: MathUtils.lerp(6 * startScale, 4.8 * endScale, spread),
    opacity: reducedMotion
      ? (copy === 7 ? 1 - MathUtils.smoothstep(p, 0.6, 0.72) : 0)
      : (copy === 7 ? 1 : MathUtils.smoothstep(p, 0.66, 0.82)),
  };
}
