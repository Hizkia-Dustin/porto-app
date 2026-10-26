export function phase(progress, start, end) {
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export const ABOUT_PROGRESS = .57;
export const FIRST_TRANSITION_END = .52;

export function sampleJourney(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const work = Math.max(0, Math.min(1, (p - .62) / .38));
  return {
    intro: Math.min(1, p / FIRST_TRANSITION_END),
    work,
    aboutExit: phase(work, .04, .22),
    edge: phase(work, .05, .25),
    dissolve: phase(work, .28, .58),
    reconstruct: phase(work, .52, .85),
    particles: phase(work, .24, .38) * (1 - phase(work, .84, .98)),
    morph: phase(work, .28, .9),
    workText: phase(work, .8, 1),
  };
}

// Every value is sampled from scroll, including particle travel when reversing.
export function sampleProgress(progress) {
  const p = Math.max(0, Math.min(1, progress));
  return {
    meet: phase(p, 0.04, 0.28),
    contact: phase(p, 0.27, 0.3) * (1 - phase(p, 0.38, 0.46)),
    approach: phase(p, 0.32, 0.6),
    edge: phase(p, 0.42, 0.6),
    dissolve: phase(p, 0.59, 0.8),
    reconstruct: phase(p, 0.74, 0.96),
    heroText: 1 - phase(p, 0.3, 0.43),
    bridgeText: phase(p, 0.45, 0.55) * (1 - phase(p, 0.7, 0.78)),
    aboutText: phase(p, 0.9, 0.99),
    particles: phase(p, 0.56, 0.65) * (1 - phase(p, 0.9, 0.99)),
    morph: phase(p, 0.6, 0.96),
  };
}
