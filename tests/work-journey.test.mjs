import assert from "node:assert/strict";
import test from "node:test";
import { sampleWorkJourney } from "../src/lib/workJourney.mjs";

test("Work journey glides down tunnel then smoothly lifts stage up to black section", () => {
  let prevCameraZ = Infinity;
  let prevLift = -Infinity;

  for (let i = 0; i <= 100; i++) {
    const p = i / 100;
    const state = sampleWorkJourney(p);

    assert.ok(state.cameraZ <= prevCameraZ + 0.0001, "cameraZ should be monotonically decreasing");
    prevCameraZ = state.cameraZ;

    assert.ok(state.lift >= prevLift - 0.0001, "lift should be monotonically increasing");
    prevLift = state.lift;

    assert.ok(state.lift >= 0 && state.lift <= 1, "lift should be bounded between 0 and 1");
    assert.ok(state.entryOpacity >= 0 && state.entryOpacity <= 1, "entryOpacity should be bounded");
  }

  // Phase 1 verification
  assert.equal(sampleWorkJourney(0).cameraZ, 8);
  assert.equal(sampleWorkJourney(0).lift, 0);
  assert.equal(sampleWorkJourney(0).entryOpacity, 1);
  assert.equal(sampleWorkJourney(0.5).lift, 0);
  assert.ok(sampleWorkJourney(0.6).cameraZ <= -42);

  // Phase 2 verification
  assert.ok(sampleWorkJourney(0.8).lift > 0 && sampleWorkJourney(0.8).lift < 1);
  assert.equal(sampleWorkJourney(1).lift, 1);
  assert.equal(sampleWorkJourney(1).entryOpacity, 0);

  // Reduced motion
  assert.equal(sampleWorkJourney(0.2, true).cameraZ, 8);
  assert.equal(sampleWorkJourney(0.2, true).lift, 0);
  assert.equal(sampleWorkJourney(0.9, true).lift, 1);
});
