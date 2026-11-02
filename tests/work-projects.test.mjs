import test from "node:test";
import assert from "node:assert/strict";
import { projects } from "../src/data/projects.mjs";
import { sampleProjectSequence, projectTrackX, projectScrollProgress, WORK_INTRO_END } from "../src/lib/workProjects.mjs";

test("ten unique editable project examples", () => {
  assert.equal(projects.length, 10);
  assert.equal(new Set(projects.map(p => p.id)).size, 10);
  assert.ok(projects.every(p => p.title && p.category && p.description && p.color));
});
test("project navigation centers every card after the tunnel finishes", () => {
  const viewport = 1280, gap = viewport * 0.04;
  let left = 0;
  const centers = projects.map(project => {
    const width = viewport * project.layout.width / 100;
    const center = left + width / 2;
    left += width + gap;
    return center;
  });
  let previous = WORK_INTRO_END;
  projects.forEach((_, index) => {
    const progress = projectScrollProgress(centers[index], viewport, centers.at(-1));
    assert.ok(progress > previous && progress <= 1);
    previous = progress;
    const sequence = sampleProjectSequence(progress);
    assert.equal(sequence.intro, 1);
    const center = projectTrackX(sequence.gallery, viewport, centers.at(-1)) + centers[index];
    assert.ok(Math.abs(center - viewport / 2) < 1e-7);
  });
  assert.equal(sampleProjectSequence(0).gallery, 0);
  assert.equal(sampleProjectSequence(1).gallery, 1);
});
