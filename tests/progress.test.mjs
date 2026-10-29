import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleProgress, sampleJourney, ABOUT_PROGRESS, FIRST_TRANSITION_END } from "../src/experience/progress.mjs";

test("opening and closing scenes are readable with no residual particles", () => {
  const start = sampleProgress(0), end = sampleProgress(1);
  assert.equal(start.heroText, 1);
  assert.equal(start.edge, 0);
  assert.equal(start.dissolve, 0);
  assert.equal(start.particles, 0);
  assert.equal(end.aboutText, 1);
  assert.equal(end.dissolve, 1);
  assert.equal(end.reconstruct, 1);
  assert.equal(end.particles, 0);
});
test("opening artwork holds before any outline or dissolve", () => {
  assert.equal(sampleProgress(0).meet, 0);
  assert.ok(sampleProgress(.15).meet > 0 && sampleProgress(.15).meet < 1);
  assert.equal(sampleProgress(.28).meet, 1);
  assert.equal(sampleProgress(.38).meet, 1);
  assert.equal(sampleProgress(.38).edge, 0);
  assert.equal(sampleProgress(.38).dissolve, 0);
  assert.equal(sampleProgress(.38).particles, 0);
});
test("outlines precede dissolution and particles bridge both scenes", () => {
  assert.ok(sampleProgress(.58).edge > .9);
  assert.equal(sampleProgress(.58).dissolve, 0);
  assert.ok(sampleProgress(.69).particles > .99);
  assert.ok(sampleProgress(.8).reconstruct > 0);
});
test("reverse scrolling and arbitrary seeks reproduce identical bounded state", () => {
  const points = [-1, 0, .14, .37, .6, .85, 1, 2];
  const forward = points.map(sampleProgress);
  [...points].reverse().forEach((p, i) => {
    assert.deepEqual(sampleProgress(p), forward[points.length - 1 - i]);
    Object.values(sampleProgress(p)).forEach((v) => assert.ok(v >= 0 && v <= 1));
  });
});

test("the journey holds a readable About before the second transition", () => {
  for (const p of [FIRST_TRANSITION_END, ABOUT_PROGRESS, .62]) {
    const state = sampleJourney(p);
    assert.equal(sampleProgress(state.intro).aboutText, 1);
    assert.equal(state.aboutExit, 0);
    assert.equal(state.edge, 0);
    assert.equal(state.particles, 0);
    assert.equal(state.workText, 0);
  }
});

test("About outlines and dissolves before project reconstruction", () => {
  const atWork = (p) => sampleJourney(.62 + p * .38);
  assert.equal(atWork(.26).edge, 1);
  assert.equal(atWork(.26).dissolve, 0);
  assert.ok(atWork(.5).dissolve > .8);
  assert.equal(atWork(.5).reconstruct, 0);
  assert.equal(atWork(.5).particles, 1);
  assert.ok(atWork(.7).reconstruct > .5);
  assert.equal(atWork(.7).workText, 0);
  assert.equal(sampleJourney(1).particles, 0);
  assert.equal(sampleJourney(1).workText, 1);
  assert.equal(sampleJourney(1).dissolve, 1);
});

test("both transitions are deterministic on reverse and bounded outside the scroll range", () => {
  const points = [-1, 0, .14, .52, ABOUT_PROGRESS, .7, .81, .94, 1, 2];
  const forward = points.map(sampleJourney);
  [...points].reverse().forEach((p, i) => {
    assert.deepEqual(sampleJourney(p), forward[points.length - 1 - i]);
    Object.values(sampleJourney(p)).forEach((value) => assert.ok(value >= 0 && value <= 1));
  });
});
