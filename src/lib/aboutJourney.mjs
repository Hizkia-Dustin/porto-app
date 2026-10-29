import { CatmullRomCurve3, MathUtils, Vector3 } from "three";

export function createAboutJourney(target, designTarget, galleryTargets = []) {
  const journey = {
    camera: new CatmullRomCurve3([
      new Vector3(0, 0, 0), new Vector3(3, 0.25, -1.2),
      new Vector3(8, 0.65, -4), new Vector3(13.2, 1.05, -7.4),
      new Vector3(16, 1.05, -9),
    ]),
    look: new CatmullRomCurve3([
      new Vector3(0, 0, -12), new Vector3(3, 0.3, -14),
      new Vector3(7, 0.8, -16), target.clone(), target.clone(),
    ]),
    design: {
      camera: new CatmullRomCurve3([
        new Vector3(16, 1.05, -9), new Vector3(19, 1.3, -11.5),
        new Vector3(22.5, 1.7, -14), new Vector3(23, 1.8, -17),
      ]),
      look: new CatmullRomCurve3([
        target.clone(), new Vector3(12, 1.4, -20), designTarget.clone(), designTarget.clone(),
      ]),
    },
  };
  journey.gallery = galleryTargets.map((target, i) => {
    const previous = i === 0 ? new Vector3(23, 1.8, -17) : new Vector3(galleryTargets[i - 1].x + 1.8, galleryTargets[i - 1].y, galleryTargets[i - 1].z + 9.4);
    const destination = new Vector3(target.x + 1.8, target.y, target.z + 9.4);
    return {
      camera: new CatmullRomCurve3(i === 0
        ? [previous, new Vector3(20, 2, -19), new Vector3(14, 2.2, -20), destination]
        : [previous, previous.clone().lerp(destination, 0.5), destination]),
      look: new CatmullRomCurve3([i === 0 ? designTarget.clone() : galleryTargets[i - 1].clone(), target.clone(), target.clone()]),
    };
  });
  return journey;
}

export function scrollToTravel(scroll, reducedMotion = false) {
  const position = MathUtils.clamp(scroll, 0, 1) * 6;
  if (reducedMotion) return Math.round(position);
  const leg = Math.floor(position);
  return leg + MathUtils.smoothstep(position - leg, 0.16, 0.84);
}
