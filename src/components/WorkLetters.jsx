"use client";

import { LETTER_COPIES } from "../lib/workLetters.mjs";
import styles from "./WorkSection.module.css";

// Adjacent slices share their cut endpoints so the assembled outlines line up.
// Each row is [left cut %, right cut %, travel X (vw), Y (vh), Z (vh), spin].
const fractures = [
  [[29, 41, -70, -34, 68, -40], [57, 46, -57, 13, 56, 52], [71, 80, -48, -7, 38, -28], [105, 105, -60, 43, 50, 37]],
  [[42, 26, -23, -62, 35, 28], [62, 77, -62, 8, 26, -43], [105, 105, -18, 62, 34, 55]],
  [[34, 47, 16, -61, 32, -39], [74, 54, 58, -10, 28, 63], [105, 105, 25, 61, 42, -53]],
  [[36, 24, 55, -43, 54, 42], [53, 64, 64, -14, 44, -50], [77, 66, 63, 15, 50, 29], [105, 105, 46, 53, 56, -34]],
];

export default function WorkLetters({ ref }) {
  return (
    <h2 ref={ref} className={styles.letters} aria-label="WORK">
      {[..."WORK"].flatMap((letter, row) =>
        Array.from({ length: LETTER_COPIES }, (_, copy) => (
          <span key={`${row}-${copy}`} data-layer={(row * LETTER_COPIES + copy) % 3 === 1 ? "front" : "back"} aria-hidden="true">
            {copy === 7 ? <>
              <b className={styles.solidGlyph}>{letter}</b>
              {fractures[row].map(([left, right, x, y, z, spin], i, cuts) => {
                const [topLeft, topRight] = cuts[i - 1] ?? [-5, -5];
                return <i key={i} className={styles.shard} data-glyph={letter} style={{
                  "--cut": `polygon(-5% ${topLeft}%, 105% ${topRight}%, 105% ${right}%, -5% ${left}%)`,
                  "--fly-x": `${x}vw`, "--fly-y": `${y}vh`, "--fly-z": `${z}vh`, "--spin": `${spin}deg`,
                }}>{letter}</i>;
              })}
            </> : letter}
          </span>
        )),
      )}
    </h2>
  );
}
