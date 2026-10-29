import { BoxGeometry } from "three";

export function floorHeight(depth) {
  return ((1 - 800 / 1058) * depth - 9400 / 1058) * Math.tan(21 * Math.PI / 180);
}

export function groundedBoxGeometry(width, height, depth, z, rotation) {
  const geometry = new BoxGeometry(width, height, depth);
  const positions = geometry.attributes.position;
  const top = floorHeight(-z) + height;
  for (let i = 0; i < positions.count; i++) {
    const worldZ = z + positions.getZ(i) * Math.cos(rotation) - positions.getX(i) * Math.sin(rotation);
    positions.setY(i, positions.getY(i) < 0 ? floorHeight(-worldZ) : top);
  }
  geometry.computeVertexNormals();
  return geometry;
}
