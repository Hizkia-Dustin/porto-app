"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import styles from "./PageLoader.module.css";

export default function PageLoader() {
  const overlay = useRef(null);
  const counter = useRef(null);
  const skip = useRef(() => {});
  const [finished, setFinished] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (finished || !lenis || lenis.isStopped) return;
    lenis.stop();
    return () => lenis.start();
  }, [finished, lenis]);

  useEffect(() => {
    const screen = overlay.current;
    const content = document.getElementById("home");
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousInert = content?.inert ?? false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let completed = false;
    let exitTimeline;
    let countTween;
    const timers = new Set();
    const progress = { value: 0 };

    root.style.overflow = "hidden";
    if (content) content.inert = true;

    const restore = () => {
      root.style.overflow = previousOverflow;
      if (content) content.inert = previousInert;
    };
    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      exitTimeline?.kill();
      countTween?.kill();
      timers.forEach(clearTimeout);
      restore();
      setFinished(true);
    };
    skip.current = finish;
    const onKey = (event) => { if (event.key === "Escape") finish(); };
    document.addEventListener("keydown", onKey);
    motion.addEventListener("change", finish);

    const delay = (ms) => new Promise((resolve) => {
      const timer = setTimeout(() => { timers.delete(timer); resolve(); }, ms);
      timers.add(timer);
    });
    const update = (value) => {
      if (disposed || completed) return;
      countTween?.kill();
      countTween = gsap.to(progress, {
        value, duration: motion.matches ? 0 : 0.3, ease: "power2.out",
        onUpdate: () => { counter.current.textContent = `${Math.round(progress.value)}%`; },
      });
    };

    // Only await critical fonts and viewport assets
    const images = [...(content?.querySelectorAll("img:not([loading='lazy'])") ?? [])];
    const tasks = [document.fonts.ready, ...images.map((image) => image.decode().catch(() => {}))];
    let settled = 0;
    const assets = Promise.allSettled(tasks.map((task) => Promise.resolve(task).finally(() => {
      settled += 1;
      update(settled / tasks.length * 100);
    })));

    const reveal = async () => {
      await Promise.all([Promise.race([assets, delay(650)]), delay(motion.matches ? 0 : 80)]);
      if (disposed || completed) return;
      if (motion.matches) { finish(); return; }
      update(100);
      exitTimeline = gsap.timeline({ onComplete: finish })
        .to(screen.querySelector(`.${styles.mark}`), {
          opacity: 1, scale: 1, duration: 0.35, ease: "expo.out",
        }, 0)
        .to(screen.querySelectorAll(`.${styles.meta}, .${styles.counterMask}`), {
          opacity: 0, y: -16, duration: 0.2, ease: "power2.in",
        }, 0.2)
        .to(screen.querySelectorAll(`.${styles.slice} span`), {
          yPercent: -110, duration: 0.35, stagger: 0.03, ease: "power3.inOut",
        }, 0.25)
        .to(screen.querySelectorAll(`.${styles.curtain}`), {
          yPercent: -101, duration: 0.5, stagger: 0.04, ease: "power4.inOut",
        }, 0.35);
    };
    reveal();
    // Failed assets or an interrupted animation must never trap the visitor.
    const watchdog = setTimeout(finish, 7000);
    timers.add(watchdog);

    return () => {
      disposed = true;
      exitTimeline?.kill();
      countTween?.kill();
      timers.forEach(clearTimeout);
      document.removeEventListener("keydown", onKey);
      motion.removeEventListener("change", finish);
      restore();
    };
  }, []);

  if (finished) return null;

  return (
    <>
      <div className={styles.overlay} ref={overlay} data-page-loader data-lenis-prevent>
        <div className={styles.curtains} aria-hidden="true">
          {[0, 1, 2, 3].map((panel) => <div className={styles.curtain} key={panel} />)}
        </div>
        <span className={styles.status} role="status">Memuat portfolio Hizkia Dustin…</span>
        <div className={`${styles.meta} ${styles.identity}`} aria-hidden="true">HIZKIA DUSTIN<span>DESIGN & CODE</span></div>
        <div className={styles.mark} aria-hidden="true">
          {[0, 1, 2, 3].map((slice) => (
            <div className={styles.slice} style={{ "--slice": slice }} key={slice}><span>HZ</span></div>
          ))}
        </div>
        <div className={`${styles.meta} ${styles.caption}`} aria-hidden="true">LEARN FROM<br />EVERYWHERE.</div>
        <div className={styles.counterMask} aria-hidden="true"><span ref={counter}>0%</span></div>
        <button className={styles.skip} type="button" onClick={() => skip.current()}>Lewati intro</button>
      </div>
      <noscript><style>{`.${styles.overlay}{display:none}`}</style></noscript>
    </>
  );
}
