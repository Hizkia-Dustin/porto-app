"use client";

import { useSyncExternalStore } from "react";

export function getTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  try { localStorage.setItem("hz-theme", getTheme()); } catch { /* Private browsing may disable storage. */ }
  window.dispatchEvent(new Event("hz-theme-change"));
}

export function subscribeTheme(callback) {
  const onStorage = (event) => {
    if (event.key !== "hz-theme" && event.key !== null) return;
    document.documentElement.dataset.theme = event.newValue === "light" ? "light" : "dark";
    callback();
  };
  window.addEventListener("hz-theme-change", callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("hz-theme-change", callback);
    window.removeEventListener("storage", onStorage);
  };
}

const serverTheme = () => "dark";
export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, serverTheme);
}
