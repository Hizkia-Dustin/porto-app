import assert from "node:assert/strict";
import test from "node:test";
import { createAboutParticles } from "../src/lib/aboutParticles.mjs";
import { floorHeight } from "../src/lib/aboutGeometry.mjs";

test("ambient particles stay inside the room, freeze for reduced motion and fade for reading", () => {
  const { points, update } = createAboutParticles();
  const position = points.geometry.attributes.position;
  update(0, false, 0);
  const initial = position.array.slice();
  for (let i = 0; i < 1200; i++) update(1 / 60, false, 0);
  assert.notDeepEqual(position.array, initial);
  for (let i = 0; i < position.count; i++) {
    const [x, y, z] = [position.getX(i), position.getY(i), position.getZ(i)];
    assert.ok([x, y, z].every(Number.isFinite));
    assert.ok(x > -25 && x < 28 && z > -38 && z < 5);
    assert.ok(y > floorHeight(-z) && y < 6.4);
  }
  const frozen = position.array.slice();
  update(1, true, 1);
  assert.deepEqual(position.array, frozen);
  assert.equal(points.material.opacity, 0);
  update(0, true, 0);
  assert.equal(points.material.opacity, 0.55);
  assert.equal(points.material.depthTest, true);
  assert.equal(points.material.depthWrite, false);
  points.geometry.dispose();
  points.material.dispose();
});
