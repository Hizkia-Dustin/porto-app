import { BufferGeometry, Color, Float32BufferAttribute, Points, PointsMaterial } from "three";
import { floorHeight } from "./aboutGeometry.mjs";

export function createAboutParticles() {
  const count = 1080;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Stable distribution keeps the composition unchanged across reloads.
    const x = -23 + ((i * 0.61803398875) % 1) * 49;
    const z = 2 - ((i * 0.754877666) % 1) * 38;
    const bottom = floorHeight(-z) + 0.8;
    positions.set([x, bottom + ((i * 0.41421356) % 1) * (5.5 - bottom), z], i * 3);
    new Color(i % 3 === 0 ? "#e20b3a" : "#101413").toArray(colors, i * 3);
  }
  const origins = positions.slice();
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  const material = new PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false });
  const points = new Points(geometry, material);
  points.name = "Museum ambient particles";
  // Tiny drift can cross the initial bounding sphere at the edge of the view.
  points.frustumCulled = false;
  let elapsed = 0;
  return {
    points,
    update(dt, reducedMotion, zoomAmount) {
      material.opacity = 0.55 * (1 - Math.min(1, Math.max(0, zoomAmount)));
      if (reducedMotion) return;
      elapsed += Math.min(0.05, Math.max(0, dt));
      const position = geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const phase = i * 2.39996;
        position.setXYZ(i,
          origins[i * 3] + Math.sin(elapsed * 0.19 + phase) * 0.3,
          origins[i * 3 + 1] + Math.sin(elapsed * 0.26 + phase) * 0.22,
          origins[i * 3 + 2] + Math.cos(elapsed * 0.16 + phase) * 0.2);
      }
      position.needsUpdate = true;
    },
  };
}
