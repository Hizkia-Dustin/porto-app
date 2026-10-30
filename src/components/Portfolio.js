"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ScrollProgress from "./reactbits/ScrollProgress";
import TargetCursor from "./TargetCursor";
import Topography from "./Topography";
import AboutAtrium from "./AboutAtrium";
import styles from "./Portfolio.module.css";

const assets = "/assets/figma/red-hero";
const socialLinks = {
  GitHub: "https://github.com/Hizkia-Dustin",
  LinkedIn: "https://linkedin.com/in/hizkia-dustin",
};

function RollingFace({ children, icon = false }) {
  return (
    <>
      <span className={`${styles.pillFace} ${icon ? styles.pillIcon : ""}`}>{children}</span>
      <span className={`${styles.pillFaceAlt} ${icon ? styles.pillIcon : ""}`} aria-hidden="true">
        {children}
      </span>
      <span className={styles.pillFill} aria-hidden="true" />
    </>
  );
}

export default function Portfolio() {
  const hero = useRef(null);
  const dialog = useRef(null);
  const [panel, setPanel] = useState("");

  useEffect(() => {
    const element = hero.current;
    const observer = new ResizeObserver(([entry]) => {
      element.style.setProperty("--hero-scale", entry.contentRect.width / 1440);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function openPanel(name) {
    setPanel(name);
    dialog.current.showModal();
  }

  return (
    <main className={styles.page} id="home" aria-label="Hizkia Dustin portfolio">
      <TargetCursor
        targetSelector="a, button, .cursor-target, [tabindex='0']"
        cursorColor="#ffffff"
        cursorColorOnTarget="#ffffff"
        blendMode="difference"
        size={34}
        cornerSize={10}
        thickness={2.5}
        padding={4}
        hoverDuration={0.2}
      />
      <ScrollProgress position="both" color="#15100e" trackColor="rgba(21, 16, 14, 0.15)" thickness={3} />
      <section className={styles.hero} ref={hero} aria-label="Portfolio introduction">
      <div className={styles.artboard}>
        <header className={styles.header}>
          {/* Keep exported SVGs at their native dimensions; scale the artboard as a unit. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.headerLines} src={`${assets}/1b2a8.svg`} alt="" aria-hidden="true" />
          <a className={`${styles.logo} cursor-target`} href="#home" data-cursor-label="HOME" aria-label="HZ — Home">HZ</a>
          <div className={styles.intro}>
            <div className={`${styles.pillCell} ${styles.introTop} cursor-target`} tabIndex={0} data-cursor-label="ROLE" aria-label="UI/UX enthusiast">
              <RollingFace>UI/UX ENTHUSIAST</RollingFace>
            </div>
            <div className={`${styles.pillCell} ${styles.introBottom} cursor-target`} tabIndex={0} data-cursor-label="MOTTO" aria-label="Learn from everywhere">
              <RollingFace>LEARN FROM EVERYWHERE</RollingFace>
            </div>
          </div>
          <div className={styles.socials}>
            {[
              ["GitHub", "41fa7.png"],
              ["LinkedIn", "75785.png"],
            ].map(([name, image]) => socialLinks[name] ? (
              <a className={`${styles.pillCell} cursor-target`} key={name} href={socialLinks[name]} target="_blank" rel="noopener noreferrer" data-cursor-label={name.toUpperCase()} aria-label={name}>
                <RollingFace icon>
                  <Image src={`${assets}/${image}`} width={28} height={28} alt="" />
                </RollingFace>
              </a>
            ) : (
              <button className={`${styles.pillCell} cursor-target`} key={name} type="button" onClick={() => openPanel(name)} data-cursor-label={name.toUpperCase()} aria-label={`${name} — tautan belum diisi`}>
                <RollingFace icon>
                  <Image src={`${assets}/${image}`} width={28} height={28} alt="" />
                </RollingFace>
              </button>
            ))}
          </div>
          <nav className={styles.nav} aria-label="Main navigation">
            <a className="cursor-target" href="#about" data-cursor-label="ABOUT">ABOUT</a>
            <button className="cursor-target" type="button" onClick={() => openPanel("Work")} data-cursor-label="WORK">WORK</button>
            <button className="cursor-target" type="button" onClick={() => openPanel("Contact")} data-cursor-label="CONTACT">CONTACT</button>
          </nav>
        </header>
        <section className={styles.emptyStage} aria-label="Interactive topographic hero">
          <div className={styles.topography}>
            <Topography
              color="#4f7cff"
              lineCount={22}
              lineWidth={1.2}
              elevation={1}
              foreground={0.2}
              tilt={32}
              speed={0.25}
              direction="forward"
              glow={0.6}
              depthOfField={0.4}
              fog={0.35}
              hoverEffect="lift"
              clickEffect="pulse"
              majorLines
              scale={1}
              detail={0.35}
              morph={0.2}
              brightness={1}
              markers="none"
              glitch={0}
              opacity={1}
              mouseInteraction
              mouseRadius={1}
              mouseStrength={0.6}
              trail={0.3}
              parallax={0.5}
              intro
              lightMode={false}
            />
          </div>
          <div className={styles.topographyShade} aria-hidden="true" />
        </section>
        <div className={`${styles.marquee} cursor-target`} tabIndex={0} data-cursor-label="PAUSE" aria-label="I'm still cooking. Thanks for watching. Fokuskan atau arahkan kursor untuk menjeda.">
          <div className={styles.track} aria-hidden="true">
            {[0, 1, 2, 3].map((copy) => (
              <div className={styles.marqueeGroup} key={copy}>
                <span>I&apos;M STILL COOKING</span><i />
                <span>THANKS FOR WATCHING</span><i />
              </div>
            ))}
          </div>
        </div>
      </div>
      </section>
      <AboutAtrium />
      <dialog className={styles.dialog} ref={dialog} onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current.close();
      }}>
        <div className={styles.dialogHeading}>
          <h1>{panel}</h1>
          <button className="cursor-target" type="button" aria-label="Tutup" onClick={() => dialog.current.close()}>×</button>
        </div>
        <p>{panel === "GitHub" || panel === "LinkedIn" ? "Tautan profil belum diisi." : "Bagian ini belum diisi."}</p>
      </dialog>
    </main>
  );
}
