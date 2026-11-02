"use client";

import { LETTER_COPIES } from "../lib/workLetters.mjs";
import styles from "./WorkSection.module.css";

export default function WorkLetters({ ref }) {
  return (
    <h2 ref={ref} className={styles.letters} aria-label="WORK">
      {[..."WORK"].flatMap((letter, row) =>
        Array.from({ length: LETTER_COPIES }, (_, copy) => (
          <span key={`${row}-${copy}`} data-layer={(row * LETTER_COPIES + copy) % 3 === 1 ? "front" : "back"} aria-hidden="true">{letter}</span>
        )),
      )}
    </h2>
  );
}
