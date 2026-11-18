"use client";

import { Moon, Sun } from "lucide-react";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { setTheme, useTheme } from "../lib/theme";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const theme = useTheme();
  const switching = useRef(false);
  const light = theme === "light";
  const label = light ? "Aktifkan dark mode" : "Aktifkan light mode";
  async function switchTheme() {
    if (switching.current) return;
    const next = light ? "dark" : "light";
    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTheme(next);
      return;
    }
    switching.current = true;
    try {
      const transition = document.startViewTransition(() => {
        flushSync(() => setTheme(next));
      });
      await transition.finished;
    } catch {
      setTheme(next);
    } finally {
      switching.current = false;
    }
  }
  return (
    <button className={`${styles.toggle} cursor-target`} type="button"
      aria-label={label} title={label} data-cursor-label={light ? "DARK" : "LIGHT"}
      onClick={switchTheme}>
      {light ? <Moon size={23} fill="currentColor" strokeWidth={0} aria-hidden="true" /> : <Sun size={23} aria-hidden="true" />}
    </button>
  );
}
