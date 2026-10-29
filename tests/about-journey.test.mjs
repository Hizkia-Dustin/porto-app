import assert from "node:assert/strict";
import test from "node:test";
import { PerspectiveCamera, Vector3 } from "three";
import { createAboutJourney, scrollToTravel } from "../src/lib/aboutJourney.mjs";
import { floorHeight, groundedBoxGeometry } from "../src/lib/aboutGeometry.mjs";

const target = new Vector3(9, floorHeight(16) + 3.03, -16);
const designTarget = new Vector3(17, floorHeight(25) + 3.03, -25);
const galleryExhibits = [{ x: 12, z: -34, rotation: -.12 }, { x: .5, z: -30, rotation: .24 }, { x: -10, z: -34, rotation: -.2 }, { x: -19, z: -27, rotation: .12 }];
const galleryTargets = galleryExhibits.map(({x,z}) => new Vector3(x, floorHeight(-z) + 2.5, z));
const journey = createAboutJourney(target, designTarget, galleryTargets);

test("scroll can reverse and holds both readable endpoints", () => {
  assert.equal(scrollToTravel(-1), 0);
  for (let i = 0; i <= 6; i++) {
    assert.equal(scrollToTravel(i / 6), i);
    assert.equal(scrollToTravel(i / 6, true), i);
    assert.equal(scrollToTravel(Math.min(1, (i + 0.1) / 6)), i);
  }
  assert.equal(scrollToTravel(2), 6);
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    assert.ok(scrollToTravel(t) >= scrollToTravel(t - 0.01));
  }

  assert.ok(journey.camera.getPoint(1).distanceTo(journey.design.camera.getPoint(0)) < 1e-10);
  assert.ok(journey.look.getPoint(1).distanceTo(journey.design.look.getPoint(0)) < 1e-10);
});

test("design leg stays inside the room and frames the second totem", () => {
  for (let i = 0; i <= 100; i++) {
    const p = journey.design.camera.getPoint(i / 100);
    assert.ok(p.x < 28 && p.z > -38 && p.y < 6.4);
    assert.ok(p.distanceTo(designTarget) > 8);
  }
  const camera = new PerspectiveCamera(42, 1487 / 1058, 0.1, 100);
  camera.position.copy(journey.design.camera.getPoint(1));
  camera.lookAt(journey.design.look.getPoint(1));
  camera.updateMatrixWorld();
  for (const x of [-1.95, 1.95]) for (const y of [-2.75, 2.75]) {
    const p = new Vector3(x, y, 0.7).applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 24).add(designTarget).project(camera);
    assert.ok(Math.abs(p.x) < 0.9 && Math.abs(p.y) < 0.9);
  }
});

test("camera stays inside the room and clear of the profile wall and totem", () => {
  for (let i = 0; i <= 200; i++) {
    const camera = journey.camera.getPoint(i / 200);
    const look = journey.look.getPoint(i / 200);
    assert.ok(camera.toArray().every(Number.isFinite));
    assert.ok(look.toArray().every(Number.isFinite));
    assert.ok(camera.x > -25 && camera.x < 28 && camera.z > -38 && camera.z < 5);
    assert.ok(camera.y > -1 && camera.y < 6.4);
    assert.ok(camera.distanceTo(target) > 7);
    assert.ok(camera.z > -6 || camera.x > 10);
  }
});

test("destination frames every corner of the totem on desktop", () => {
  for (const aspect of [1487 / 1058, 1920 / 1080]) {
    const camera = new PerspectiveCamera(42, aspect, 0.1, 100);
    camera.position.copy(journey.camera.getPoint(1));
    camera.lookAt(journey.look.getPoint(1));
    camera.updateMatrixWorld();
    for (const x of [-1.95, 1.95]) for (const y of [-2.75, 2.75]) {
      const p = new Vector3(x, y, 0.7).applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 12).add(target).project(camera);
      assert.ok(Math.abs(p.x) < 0.9 && Math.abs(p.y) < 0.9 && p.z < 1);
    }
  }
});

test("rotated partition and plinth feet follow the floor without gaps", () => {
  for (const [width, height, depth, z, rotation] of [[4.3, 0.28, 2, -16, Math.PI / 12], [4.3, 0.28, 2, -25, Math.PI / 24], [6.4, 4.8, 0.9, -19, 0.25], [6.4, 4.8, 0.9, -26, -0.3]]) {
    const geometry = groundedBoxGeometry(width, height, depth, z, rotation);
    const vertices = geometry.attributes.position;
    const top = floorHeight(-z) + height;
    let checked = 0;
    for (let i = 0; i < vertices.count; i++) {
      if (Math.abs(vertices.getY(i) - top) < 1e-6) continue;
      const worldZ = z + vertices.getZ(i) * Math.cos(rotation) - vertices.getX(i) * Math.sin(rotation);
      assert.ok(Math.abs(vertices.getY(i) - floorHeight(-worldZ)) < 1e-6);
      checked++;
    }
    assert.ok(checked >= 4);
    geometry.dispose();
  }
});

test("gallery route is continuous, clear of exhibits, and frames each story", () => {
  const legs = [journey.design, ...journey.gallery];
  journey.gallery.forEach((leg, i) => {
    assert.ok(leg.camera.getPoint(0).distanceTo(legs[i].camera.getPoint(1)) < 1e-9);
    assert.ok(leg.look.getPoint(0).distanceTo(legs[i].look.getPoint(1)) < 1e-9);
    for (let j = 0; j <= 100; j++) {
      const p = leg.camera.getPoint(j / 100);
      assert.ok(p.x > -25 && p.x < 28 && p.z > -38 && p.y < 6.4);
      assert.ok(Math.hypot(p.x - 17, p.z + 25) > 2.5);
      assert.ok(p.y > floorHeight(-p.z) + 1);
    }
    for (const aspect of [1487 / 1058, 1920 / 1080]) {
      const camera = new PerspectiveCamera(42, aspect, 0.1, 100);
      camera.position.copy(leg.camera.getPoint(1));
      camera.lookAt(leg.look.getPoint(1)); camera.updateMatrixWorld();
      for (const x of [-3.2, 3.2]) for (const y of [-2.4, 2.4]) {
        const p = new Vector3(x, y, 0.46).applyAxisAngle(new Vector3(0, 1, 0), galleryExhibits[i].rotation).add(galleryTargets[i]).project(camera);
        assert.ok(Math.abs(p.x) < .9 && Math.abs(p.y) < .9);
      }
    }
  });
});
