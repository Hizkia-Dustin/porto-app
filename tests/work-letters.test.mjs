import assert from "node:assert/strict";
import test from "node:test";
import { LETTER_COPIES, sampleWorkLetter } from "../src/lib/workLetters.mjs";
import { sampleWorkJourney } from "../src/lib/workJourney.mjs";

test("WORK stays assembled until the camera reaches the end of the tunnel", () => {
  for (const p of [0, 0.3, 0.59, 0.6]) {
    const cameraZ = sampleWorkJourney(p).cameraZ;
    for (let row = 0; row < 4; row++) {
      const visible = Array.from({ length: LETTER_COPIES }, (_, i) => sampleWorkLetter(row, i, p, cameraZ)).filter(l => l.opacity > 0);
      assert.equal(visible.length, 1);
      assert.equal(visible[0].y, 0);
    }
  }
});

test("letters expand into four curved streams and reverse deterministically", () => {
  for (let row = 0; row < 4; row++) {
    const end = Array.from({ length: LETTER_COPIES }, (_, i) => sampleWorkLetter(row, i, 0.82, -43));
    assert.equal(end.filter(l => l.opacity === 1).length, LETTER_COPIES);
    assert.ok(Math.max(...end.map(l => l.x)) - Math.min(...end.map(l => l.x)) > 2);
    assert.notEqual(end[0].y, end[7].y);
    for (const p of [0, 0.6, 0.7, 0.82, 1, 0.82, 0.7, 0]) {
      const letter = sampleWorkLetter(row, 7, p, sampleWorkJourney(p).cameraZ);
      assert.ok(Object.values(letter).every(Number.isFinite));
      assert.ok(letter.opacity >= 0 && letter.opacity <= 1);
    }
    const stops = [0, 0.6, 0.7, 0.82, 1];
    const forward = stops.map(p => sampleWorkLetter(row, 7, p, sampleWorkJourney(p).cameraZ));
    [...stops].reverse().forEach((p, i) => {
      assert.deepEqual(sampleWorkLetter(row, 7, p, sampleWorkJourney(p).cameraZ), forward[stops.length - 1 - i]);
    });
  }
});

test("reduced motion fades the single title without multiplying or moving letters", () => {
  for (let copy = 0; copy < LETTER_COPIES; copy++) {
    const state = sampleWorkLetter(0, copy, 0.8, 8, true);
    assert.equal(state.opacity, 0);
    assert.equal(state.y, 0);
  }
});

test("all four streams keep moving throughout the gallery and retrace on reverse scroll", () => {
  for (let row = 0; row < 4; row++) {
    const stops = [1, 1.25, 1.5, 1.75, 2, 2.4];
    const forward = stops.map(p => sampleWorkLetter(row, 3, p, -43));
    forward.forEach((letter, i) => {
      assert.ok(Object.values(letter).every(Number.isFinite));
      assert.equal(letter.opacity, 1);
      if (i) assert.notEqual(letter.x, forward[i - 1].x);
    });
    [...stops].reverse().forEach((p, i) => assert.deepEqual(sampleWorkLetter(row, 3, p, -43), forward[stops.length - 1 - i]));
  }
});
