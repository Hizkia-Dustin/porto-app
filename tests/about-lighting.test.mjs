import test from "node:test";
import assert from "node:assert/strict";
import { MeshBasicMaterial, Vector3 } from "three";
import { createAboutLighting } from "../src/lib/aboutLighting.mjs";
import { floorHeight } from "../src/lib/aboutGeometry.mjs";

test("exhibit light follows the tour, strengthens on zoom, and keeps its pool on the floor", () => {
  const light = createAboutLighting();
  const target = new Vector3(17, 2, -25);
  const camera = new Vector3(23, 1.8, -17);
  light.update(target, 1 / 60, false, 0, camera);
  assert.ok(light.focus.value.x > 0 && light.focus.value.x < target.x);
  for (let i = 0; i < 180; i++) light.update(target, 1 / 60, false, 1, camera);
  assert.ok(light.focus.value.distanceTo(target) < 0.001);
  assert.ok(light.materials[0].uniforms.strength.value > 1.3);
  const pool = light.group.children[1];
  assert.ok(Math.abs(pool.position.y - floorHeight(-target.z) - 0.025) < 0.001);
  const next = new Vector3(0.5, 1, -30);
  light.update(next, 0, true, 0, camera);
  assert.deepEqual(light.focus.value, next);
  assert.equal(light.materials[0].uniforms.strength.value, 0.7);
  const material = new MeshBasicMaterial();
  light.illuminate(material);
  const shader = { uniforms: {}, vertexShader: "#include <begin_vertex>", fragmentShader: "#include <map_fragment>" };
  material.onBeforeCompile(shader);
  assert.equal(shader.uniforms.exhibitFocus, light.focus);
  light.group.children.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); });
  material.dispose();
});
