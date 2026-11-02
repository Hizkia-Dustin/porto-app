import { MathUtils } from "three";

export function sampleWorkJourney(progress, reducedMotion = false) {
  const p = MathUtils.clamp(progress, 0, 1);

  // Phase 1: Camera glides through 3D wireframe tunnel (p: 0 -> 0.60)
  const tunnelEnd = 0.60;
  const tunnelProgress = Math.min(1, p / tunnelEnd);
  const cameraZ = reducedMotion ? 8 : 8 - 51 * Math.pow(tunnelProgress, 1.15);

  // Phase 2: Work stage slides upward revealing black section (p: 0.60 -> 0.98)
  const lift = reducedMotion
    ? (p >= 0.65 ? 1 : 0)
    : MathUtils.smoothstep(p, 0.60, 0.98);

  return {
    cameraZ,
    titleOpacity: 1,
    tunnelOpacity: 1,
    lift,
    entryOpacity: 1 - MathUtils.smoothstep(p, 0.02, 0.16),
  };
}
