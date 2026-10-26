"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ProjectOverview from "./ProjectOverview";

function Arrow({ down = false }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={down ? "arrow arrow-down" : "arrow"}>
    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.2" />
  </svg>;
}

export default function HeroExperience() {
  const root = useRef(null), stage = useRef(null), canvas = useRef(null);
  const [motionOff, setMotionOff] = useState(false);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup, cancelled = false, generation = 0;
    async function start() {
      const run = ++generation;
      cleanup?.();
      cleanup = undefined;
      if (motionOff || media.matches) { setStatus("static"); return; }
      setStatus("loading");
      try {
        const { createExperience } = await import("@/experience/createExperience");
        if (cancelled || run !== generation) return;
        cleanup = createExperience({
          root: root.current, stage: stage.current, mount: canvas.current,
          onReady: () => { if (!cancelled && run === generation) setStatus("ready"); },
          onFailure: () => { if (!cancelled && run === generation) setStatus("unavailable"); },
        });
      } catch {
        if (!cancelled && run === generation) setStatus("unavailable");
      }
    }
    start();
    media.addEventListener("change", start);
    return () => { cancelled = true; generation++; cleanup?.(); media.removeEventListener("change", start); };
  }, [motionOff]);

  return (
    <main ref={root} className="experience" id="intro">
      <a className="skip-link" href="#about">Skip to about</a>
      <header className="site-header">
        <a className="wordmark" href="#intro" aria-label="Ideas in Motion, introduction">
          <svg className="wordmark-symbol" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M18 2v32M2 18h32M6.7 6.7l22.6 22.6M6.7 29.3L29.3 6.7" stroke="currentColor" strokeWidth="2" /><circle cx="18" cy="18" r="7" fill="currentColor" /></svg>
          <span>Ideas in Motion<span className="edition">A personal edition</span></span>
        </a>
        <nav aria-label="Main navigation"><a href="#intro">Intro <span>01</span></a><a href="#about">The maker <span>02</span></a><a href="#work">Work <span>03</span></a></nav>
        <span className="header-note">ART MEETS TECHNOLOGY<span>VOL. 01 — 2026</span></span>
      </header>
      <div className="stage" ref={stage}>
        <div className="story-scenes">
        <div ref={canvas} className="canvas-mount" />
        <div className="scene-shade" aria-hidden="true" />
        <div className="scene-grain" aria-hidden="true" />
        <div className="touch-light" aria-hidden="true" />
        <div className="scene-guide" aria-hidden="true"><span>Ⅰ</span><i /><span>Ⅲ</span></div>
        <section className="scene-copy hero-copy" data-copy="hero" aria-labelledby="hero-title">
          <div className="static-art hero-static" aria-hidden="true">
            <Image unoptimized src="/assets/web/landscape.webp" alt="" fill preload sizes="100vw" className="static-landscape" />
            <Image unoptimized src="/assets/web/floating-maker.webp" alt="" width={1448} height={1086} preload className="static-character hero-man" />
            <Image unoptimized src="/assets/web/floating-muse.webp" alt="" width={1448} height={1086} preload className="static-character hero-woman" />
            <Image unoptimized src="/assets/web/parchment-celestial.webp" alt="" width={600} height={450} className="static-paper static-paper-1" />
            <Image unoptimized src="/assets/web/parchment-butterfly.webp" alt="" width={600} height={450} className="static-paper static-paper-2" />
            <Image unoptimized src="/assets/web/parchment-orbit.webp" alt="" width={600} height={450} className="static-paper static-paper-3" />
            <Image unoptimized src="/assets/web/parchment-sculpture.webp" alt="" width={600} height={450} className="static-paper static-paper-4" />
            <Image unoptimized src="/assets/web/parchment-portrait.webp" alt="" width={600} height={450} className="static-paper static-paper-5" />
            <Image unoptimized src="/assets/web/parchment-column.webp" alt="" width={600} height={450} className="static-paper static-paper-6" />
          </div>
          <div className="copy-inner hero-panel">
            <p className="eyebrow">A personal edition — 01</p>
            <h1 id="hero-title" tabIndex={-1}>Ideas in<br /><em>motion.</em></h1>
            <div className="hero-panel-bottom">
              <p className="hero-description">Two worlds.<br />A new possibility.</p>
              <p className="hero-disciplines">ART <span>Ⅰ</span><br />DESIGN <span>Ⅱ</span><br />TECHNOLOGY <span>Ⅲ</span></p>
              <a href="#about" className="text-link">Meet the maker <span className="round-arrow"><Arrow /></span></a>
            </div>
          </div>
          <span className="art-caption">FIG. 01 <span>THE BEGINNING OF AN IDEA</span></span>
        </section>
        <div className="bridge-copy" data-copy="bridge" aria-hidden="true">
          <p className="eyebrow">Every possibility begins somewhere.</p>
          <p>Ideas become<br /><em>stories.</em></p>
        </div>
        <section className="scene-copy about-copy" data-copy="about" id="about" aria-labelledby="about-title">
          <div className="static-art about-static" aria-hidden="true">
            <Image unoptimized src="/assets/web/landscape.webp" alt="" fill sizes="100vw" className="static-landscape" />
            <Image unoptimized src="/assets/web/seated-maker.webp" alt="" width={1086} height={1448} className="static-character" />
          </div>
          <div className="copy-inner">
            <p className="eyebrow"><span className="small-line" /> 02 — The mind behind the motion</p>
            <h2 id="about-title" tabIndex={-1}>A creative<br /><em>mind.</em></h2>
            <p className="about-description">An exploration of art, design, and technology.<br className="desktop-break" /> Turning a little curiosity into something<br className="desktop-break" /> you can feel, discover, and interact with.</p>
            <a href="#work" className="text-link">Explore the work <span className="round-arrow"><Arrow /></span></a>
          </div>
          <span className="art-caption">FIG. 02 <span>WHERE CURIOSITY TAKES SHAPE</span></span>
        </section>
        <footer className="scene-footer">
          <span className="footer-discipline">CREATIVE DEVELOPMENT<br />& DIGITAL EXPERIENCES</span>
          <div className="scroll-cue" aria-hidden="true"><span className="scroll-line" /><span data-caption>Scroll to bring worlds together</span><Arrow down /></div>
          <span className="chapter-count" data-chapter>01 / 03</span>
          <div className="progress-track" aria-hidden="true"><span /></div>
        </footer>
        </div>
        <ProjectOverview />
      </div>
      <div className="motion-control">
        <button type="button" aria-pressed={motionOff} onClick={() => setMotionOff(!motionOff)}>
          <span className={status === "ready" ? "motion-indicator is-on" : "motion-indicator"} />
          {motionOff ? "Enable motion" : "Reduce motion"}
        </button>
        <span className="sr-only" role="status">{status === "loading" ? "Preparing the animated artwork. All content is available below." : status === "unavailable" ? "Static artwork shown. Animation is unavailable on this device." : status === "static" ? "Static artwork. All content is available without animation." : "Scroll to explore the animated artwork."}</span>
      </div>
    </main>
  );
}
