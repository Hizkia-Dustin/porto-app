"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "./SmoothScroll";
import ScrollFloat from "./ScrollFloat";
import Particles from "./reactbits/Particles";
import BlurText from "./reactbits/BlurText";
import ShinyText from "./reactbits/ShinyText";
import Magnet from "./reactbits/Magnet";
import styles from "./Portfolio.module.css";

const asset = (name) => `/assets/figma/${name}`;
const skills = [
  ["Figma", "2dcf7.svg", "7dfc9.svg"],
  ["Canva", "21f89.svg", null],
  ["Next.js", "3abde.svg", "9737c.svg"],
  ["JavaScript", "2d506.svg", "95d9b.svg"],
  ["HTML", "fbefa.svg", "7afa0.svg"],
  ["CSS", "009b2.svg", "73597.svg"],
];

// Fill in handles and URLs here when the contact details are ready.
const contacts = [
  { label: "Instagram", value: "[username Instagram]", href: null, icon: "5f9bc.svg", footerIcon: "bc7a3.svg", arrow: "1389f.svg" },
  { label: "GitHub", value: "[username GitHub]", href: null, icon: "00d0a.svg", footerIcon: "edd98.svg", arrow: "ea180.svg" },
  { label: "WhatsApp", value: "[nomor HP]", href: null, icon: "c47f1.svg", footerIcon: "29c35.svg", arrow: "78ff2.svg" },
];
const projects = [
  { title: "WEBSITE PORTOFOLIO PERSONAL", category: "Web Design · Development" },
  { title: "[JUDUL PROYEK]", category: "UI/UX Design · Figma" },
  { title: "[JUDUL PROYEK]", category: "Frontend · React" },
  { title: "[JUDUL PROYEK]", category: "Next.js · Full Stack" },
];

function SkillIcons({ compact = false }) {
  return <div className={`${styles.skills} ${compact ? styles.compactSkills : ""}`}>
    {skills.filter((skill) => !compact || skill[2]).map(([name, regular, small]) => (
      <div className={styles.skill} key={name} title={name}>
        <Image src={asset(compact ? small : regular)} alt={name} width={compact ? 28 : 36} height={compact ? 28 : 36} style={{ height: "auto" }} />
      </div>
    ))}
  </div>;
}

function ContactRows({ footer = false }) {
  return <div className={footer ? styles.footerContacts : styles.aboutContacts}>
    {contacts.map((contact) => {
      const Tag = contact.href ? "a" : "div";
      return <Tag className={styles.contactRow} key={contact.label} {...(contact.href ? { href: contact.href, target: "_blank", rel: "noopener noreferrer" } : {})}>
        <span className={styles.contactIcon}><Image src={asset(footer ? contact.footerIcon : contact.icon)} width={footer ? 20.837 : 18} height={footer ? 20.837 : 18} style={{ height: "auto" }} alt="" /></span>
        <span className={styles.contactText}><span>{contact.label}{!footer && contact.label === "WhatsApp" ? " / Phone" : ""}</span><span>{contact.value}</span></span>
        {footer && <span className={styles.contactArrow} aria-hidden="true"><Image src={asset(contact.arrow)} width={14.586} height={14.586} style={{ height: "auto" }} alt="" /></span>}
      </Tag>;
    })}
  </div>;
}

function Rule({ light = false, className = "" }) {
  return <Image className={`${styles.rule} ${className}`} src={asset(light ? "0ee03.svg" : "413ac.svg")} width={1320} height={light ? 1 : 4} style={{ height: "auto" }} alt="" />;
}

function Ticker({ children, dark = false }) {
  return <div className={`${styles.ticker} ${dark ? styles.tickerDark : styles.tickerOrange}`} aria-hidden="true">
    <div className={styles.tickerTrack} data-loop={dark ? "reverse" : "forward"}>
      {[0, 1].map((copy) => <div className={styles.tickerGroup} data-loop-group key={copy}>
        {Array.from({ length: 5 }, (_, index) => <span key={index}>{children}<i /></span>)}
      </div>)}
    </div>
  </div>;
}

export default function Portfolio() {
  const root = useRef(null);
  const [openProject, setOpenProject] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    let disposed = false;
    const ready = async () => {
      await document.fonts.ready;
      if (disposed) return;
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (paused) return;
        const select = gsap.utils.selector(root);
        select("[data-loop]").forEach((track) => {
          const reverse = track.dataset.loop === "reverse";
          const loop = gsap.fromTo(track, { xPercent: reverse ? -50 : 0 }, {
            xPercent: reverse ? 0 : -50, duration: track.dataset.loop === "hero" ? 22 : 32,
            ease: "none", repeat: -1,
          });
          ScrollTrigger.create({ trigger: track, start: "top bottom", end: "bottom top", onToggle: ({ isActive }) => loop.paused(!isActive) });
        });
        select("[data-parallax]").forEach((layer) => {
          const depth = Number(layer.dataset.parallax);
          gsap.fromTo(layer, { y: -depth / 2 }, {
            y: depth / 2, ease: "none",
            scrollTrigger: { trigger: layer.parentElement, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true },
          });
        });
        select("[data-reveal]").forEach((block) => gsap.from(block, {
          y: 28, opacity: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: block, start: "top 93%", toggleActions: "play none none reverse" },
        }));
        ScrollTrigger.refresh();
      }, root);
    };
    ready();
    return () => { disposed = true; media.revert(); };
  }, [paused]);

  useEffect(() => {
    // Accordion changes move every trigger below the project list.
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [openProject]);

  useEffect(() => {
    const video = root.current?.querySelector("[data-hero-video]");
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (paused || reducedMotion.matches) video.pause();
      else video.play().catch(() => {});
    };
    syncPlayback();
    reducedMotion.addEventListener("change", syncPlayback);
    return () => reducedMotion.removeEventListener("change", syncPlayback);
  }, [paused]);

  return <SmoothScroll><main className={`${styles.portfolio} ${paused ? styles.motionPaused : ""}`} ref={root} id="home">
    <a className="skip-link" href="#about">Lewati ke tentang saya</a>
    <header className={styles.header}>
      <nav aria-label="Navigasi utama">
        {["Home", "About", "Work", "Contact"].map((item) => (
          <Magnet key={item} padding={25} magnetStrength={3.5}>
            <a href={`#${item.toLowerCase()}`}>{item}</a>
          </Magnet>
        ))}
      </nav>
      <Image className={styles.navRule} src={asset("80a14.svg")} width={1439.5} height={3} style={{ height: "auto" }} alt="" />
    </header>

    <section className={styles.hero} aria-labelledby="hero-title">
      <Particles
        particleColors={["#c8b082", "#9c7a4c", "#582f29"]}
        particleCount={45}
        speed={0.12}
        particleBaseSize={1.5}
      />
      <h1 id="hero-title" className="sr-only">Hizkia Dustin — Frontend Developer</h1>
      <div className={styles.heroLabels}>
        <div>
          <span className={styles.squareLabel}>Portfolio 2026</span>
          <small>v.01 — Hero Section</small>
        </div>
        <div className={styles.codeLabel}>
          <span>▌▌▌▌ ▌▌▌ ▌▌▌▌</span>
          <small>FE-DEV-001</small>
        </div>
      </div>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack} data-loop="hero">
          {[0, 1].map((copy) => <span className={styles.marqueeGroup} data-loop-group key={copy}>FRONTEND DEVELOPER&nbsp;</span>)}
        </div>
      </div>
      <div className={styles.heroCharacter}>
        <div data-parallax="140">
          <video className={styles.heroVideo} data-hero-video autoPlay loop muted playsInline preload="auto" poster={asset("17a4d.png")} aria-label="Karakter scholar bergerak dengan laptop dan tumpukan buku">
            <source src={asset("hero-idle-transparent.webm")} type="video/webm" />
          </video>
        </div>
      </div>
      <div className={styles.heroEditorial}>
        <strong>
          <BlurText text="Crafting interfaces" delay={70} animateBy="words" />
        </strong>
        <p>
          <BlurText
            text="Building fast, accessible and thoughtfully designed web experiences from pixel to production."
            delay={35}
            animateBy="words"
          />
        </p>
      </div>
      <div className={styles.heroAside}>
        <p>
          <BlurText text="Where classical curiosity" delay={45} />
        </p>
        <p>
          <BlurText text="meets modern tooling." delay={45} />
        </p>
        <span lang="ja">フロントエンド開発者</span>
      </div>
      <p className={styles.heroAnnotation}>— I build things<br />&nbsp; that live in browsers.</p>
      <div className={styles.heroBottom}>
        <div className={styles.tags}>
          {["React", "JavaScript", "Next.js", "CSS / Tailwind"].map((tag) => (
            <Magnet key={tag} padding={20} magnetStrength={4}>
              <span>{tag}</span>
            </Magnet>
          ))}
        </div>
        <strong>
          <ShinyText text="Craft · Code · Curiosity" shimmerColor="rgba(212, 175, 55, 0.85)" speed={3.5} />
        </strong>
      </div>
    </section>

    <section className={styles.about} id="about" aria-labelledby="about-title">
      <Rule />
      <div className={styles.aboutHeader}><div><span className={styles.squareLabel}>About</span><ScrollFloat className={styles.hello} id="about-title">HAI!</ScrollFloat></div><div className={styles.codeLabel}><span>SECTION — 02</span><small>FE-ABOUT-002</small></div></div>
      <Rule light />
      <div className={styles.aboutColumns}>
        <div className={styles.bio} data-reveal><h3>Hizkia Dustin</h3><p>Hai, saya Hizkia Dustin! Sebagai seorang builder, saya menikmati proses kreatif baik di balik layar maupun di depan layar—mulai dari merancang arsitektur database dan mengembangkan sistem web, hingga meracik desain antarmuka di Figma serta elemen visual interaktif.</p><p>Perpaduan antara logika pemrograman dan kepekaan desain inilah yang membantu saya menciptakan produk digital yang fungsional sekaligus menarik. Silakan jelajahi karya saya di bawah ini, dan mari berkolaborasi!</p><span className={styles.littleLabel}>Skills</span><SkillIcons /></div>
        <aside data-reveal><span className={styles.littleLabel}>Contact</span><ContactRows /><p className={styles.peekNote}>▪ — itu saya yang mengintip ↓</p></aside>
      </div>
      <div className={styles.peeker}><div data-parallax="90"><Image src={asset("400c9.png")} width={915} height={515} sizes="64vw" alt="Karakter mengintip dari balik pembatas halaman" /></div></div>
    </section>

    <section className={styles.work} id="work" aria-labelledby="work-title">
      <div className={styles.workIntro}>
        <p className={styles.workLead}>Koleksi karya terpilih — dari desain antarmuka<br />hingga pengembangan web penuh.</p>
        <div className={styles.workScene}>
          <ScrollFloat className={styles.workTitle} id="work-title" scrollStart="top 92%" scrollEnd="center 65%">PROYEK</ScrollFloat>
          <div className={styles.reader}><div data-parallax="-40"><Image src={asset("c8951.png")} width={429} height={643} sizes="(min-width: 1344px) 400px, 30vw" alt="Karakter melayang sambil membaca grimoire" /></div></div>
        </div>
        <div className={`${styles.codeLabel} ${styles.workCode}`}><span>SECTION — 03</span><small>FE-WORK-003</small></div>
      </div>
      <div className={styles.projectList}>
        {projects.map((project, index) => <article key={index} className={styles.project}>
          <h3><button className={styles.projectToggle} aria-expanded={openProject === index} aria-controls={`project-panel-${index}`} id={`project-toggle-${index}`} onClick={() => setOpenProject(openProject === index ? null : index)}><span className={styles.projectNumber}>{String(index + 1).padStart(2, "0")}</span><span className={styles.projectIdentity}><strong>PROYEK {String(index + 1).padStart(2, "0")} — {project.title}</strong><small>{project.category}</small></span><span className={styles.plus} aria-hidden="true">{openProject === index ? "−" : "+"}</span></button></h3>
          <div id={`project-panel-${index}`} role="region" aria-labelledby={`project-toggle-${index}`} hidden={openProject !== index} className={styles.projectPanel}>
            <div className={styles.placeholderLabel}><span>Contoh tampilan · placeholder — bukan proyek nyata</span><span>FE-WORK-00{index + 1} / SAMPLE</span></div>
            <div className={styles.projectBody}>
              <div className={styles.projectPreview} aria-label="Placeholder preview proyek"><div className={styles.browserChrome}>{["8add4.svg", "542aa.svg", "11af7.svg"].map((file) => <Image key={file} src={asset(file)} width={10} height={10} alt="" />)}<span>https://namakamu.dev</span></div></div>
              <div className={styles.projectInfo}><div><span className={styles.sampleTag}>Contoh / Placeholder</span><h4>{project.title}</h4><small>{project.category}</small></div><div className={styles.projectDescription}><span>Deskripsi Proyek</span><p>{index === 0 ? "Portofolio personal yang dirancang untuk menampilkan karya, kemampuan, dan identitas profesional. Dibangun dengan pendekatan desain yang bersih dan tipografi yang kuat, situs ini mengutamakan keterbacaan dan pengalaman pengguna yang nyaman di semua ukuran layar." : "Detail proyek akan ditambahkan di sini. Area ini disiapkan untuk menampilkan deskripsi, hasil desain, dan teknologi yang digunakan."}</p><p>— Ini adalah contoh deskripsi · konten asli akan disesuaikan</p></div><div className={styles.projectTech}><span>Teknologi yang Digunakan</span><SkillIcons compact /></div></div>
            </div>
          </div>
        </article>)}
      </div>
    </section>

    <section className={styles.contact} id="contact" aria-labelledby="contact-title">
      <Ticker>I&apos;M STILL COOKING</Ticker><Ticker dark>THANKS FOR WATCHING</Ticker>
      <div className={styles.contactBanner} />
      <ScrollFloat className={styles.hireTitle} id="contact-title">HIRE ME!!!</ScrollFloat>
      <div className={styles.contactCharacter}><div data-parallax="120"><Image src={asset("ea04c.png")} width={764} height={698} sizes="54vw" alt="Karakter bersantai dengan laptop dan tumpukan buku" /></div></div>
      <ContactRows footer />
    </section>
    <button className={styles.motionToggle} onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Lanjutkan animasi berulang" : "Jeda animasi berulang"}>{paused ? "PLAY MOTION" : "PAUSE MOTION"}<span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button>
  </main></SmoothScroll>;
}
