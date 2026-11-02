import test from "node:test";
import assert from "node:assert/strict";
import { floorHeight, floorShadowGeometry } from "../src/lib/aboutGeometry.mjs";

test("rotated contact shadows remain above the floor grid throughout the museum", () => {
  for (const z of [2, -16, -35]) {
    for (const rotation of [0, Math.PI / 12, -0.7, Math.PI / 2]) {
      const geometry = floorShadowGeometry(6.8, 4.4, 9, z, rotation);
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const clearance = positions.getY(i) - floorHeight(-positions.getZ(i));
        assert.ok(clearance > 0.006 && clearance < 0.02, "shadow must clear the grid without floating");
      }
      assert.equal(geometry.attributes.uv.count, positions.count);
      geometry.dispose();
    }
  }
});
