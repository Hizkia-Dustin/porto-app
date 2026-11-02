import { MathUtils } from "three";

export const WORK_INTRO_END = 0.28;
export function sampleProjectSequence(progress) {
  return {
    intro: MathUtils.clamp(progress / WORK_INTRO_END, 0, 1),
    gallery: MathUtils.clamp((progress - WORK_INTRO_END) / (1 - WORK_INTRO_END), 0, 1),
  };
}

export function projectTrackX(progress, viewportWidth, lastCenter) {
  return MathUtils.lerp(viewportWidth + 48, viewportWidth / 2 - lastCenter, MathUtils.clamp(progress, 0, 1));
}

export function projectScrollProgress(center, viewportWidth, lastCenter) {
  const start = viewportWidth + 48;
  const end = viewportWidth / 2 - lastCenter;
  const target = viewportWidth / 2 - center;
  return WORK_INTRO_END + (1 - WORK_INTRO_END) * MathUtils.clamp((start - target) / (start - end), 0, 1);
}
