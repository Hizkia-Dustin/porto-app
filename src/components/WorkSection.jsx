"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import Galaxy from "./Galaxy";
import WorkLetters from "./WorkLetters";
import WorkProjects from "./WorkProjects";
import { projectScrollProgress, projectTrackX, sampleProjectSequence, WORK_INTRO_END } from "../lib/workProjects.mjs";
import { sampleWorkJourney } from "../lib/workJourney.mjs";
import { LETTER_COPIES, sampleWorkLetter } from "../lib/workLetters.mjs";
import styles from "./WorkSection.module.css";

export default function WorkSection() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const entryRef = useRef(null);
  const lettersRef = useRef(null);
  const projectsRef = useRef(null);
  const stripRef = useRef(null);
  const [activeProject, setActiveProject] = useState(0);
  const lenis = useLenis();

  function selectProject(index) {
    const root = rootRef.current;
    const strip = stripRef.current;
    if (!root || !strip || !stageRef.current || index < 0 || index >= strip.children.length) return;
    const centers = [...strip.children].map(card => card.offsetLeft + card.offsetWidth / 2);
    const progress = projectScrollProgress(centers[index], stageRef.current.clientWidth, centers.at(-1));
    const top = window.scrollY + root.getBoundingClientRect().top + (root.offsetHeight - stageRef.current.clientHeight) * progress;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lenis) lenis.scrollTo(top, { duration: reducedMotion ? 0 : 1 });
    else window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  }

  function enterWork(event) {
    event.preventDefault();
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const top = window.scrollY + root.getBoundingClientRect().top + (root.offsetHeight - stage.offsetHeight) * WORK_INTRO_END * 0.58;
    if (lenis) {
      lenis.scrollTo(top, {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 2,
      });
    } else {
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    const canvas = canvasRef.current;
    const entry = entryRef.current;
    const letters = [...lettersRef.current.children];
    const projectGallery = projectsRef.current;
    const strip = stripRef.current;
    const cards = [...strip.children];
    if (!root || !stage || !track || !canvas || !entry) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      root.dataset.webgl = "unavailable";
      projectGallery.inert = false;
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor("#101413", 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 120);
    const materials = [];

    function surface(color) {
      const m = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      materials.push(m);
      return m;
    }

    function quad(points, material) {
      const g = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
      g.setIndex([0, 1, 2, 0, 2, 3]);
      scene.add(new THREE.Mesh(g, material));
    }

    const red = surface("#e20b3a");
    const shade = surface("#cb1038");
    quad([[-12, 7.25, 9], [12, 7.25, 9], [12, 7.25, -46], [-12, 7.25, -46]], shade);
    quad([[-12, -7.25, 9], [12, -7.25, 9], [12, -7.25, -46], [-12, -7.25, -46]], red);
    quad([[-12, -7.25, 9], [-12, 7.25, 9], [-12, 7.25, -46], [-12, -7.25, -46]], red);
    quad([[12, -7.25, 9], [12, 7.25, 9], [12, 7.25, -46], [12, -7.25, -46]], red);
    // Leave the far end open so Galaxy is visible through the tunnel.

    const lines = [];
    const line = (a, b) => lines.push(...a, ...b);
    for (let z = 8; z >= -46; z -= 1.2) {
      line([-12, -7.24, z], [12, -7.24, z]);
      line([-12, 7.24, z], [12, 7.24, z]);
      line([-11.99, -7.25, z], [-11.99, 7.25, z]);
      line([11.99, -7.25, z], [11.99, 7.25, z]);
    }
    for (let x = -12; x <= 12; x += 0.6) {
      line([x, -7.24, 9], [x, -7.24, -46]);
      line([x, 7.24, 9], [x, 7.24, -46]);
    }
    for (let y = -7.2; y <= 7.25; y += 0.6) {
      line([-11.99, y, 9], [-11.99, y, -46]);
      line([11.99, y, 9], [11.99, y, -46]);
    }

    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
    const gridMaterial = new THREE.LineBasicMaterial({ color: "#101413", transparent: true, opacity: 0.64 });
    materials.push(gridMaterial);
    scene.add(new THREE.LineSegments(gridGeometry, gridMaterial));

    const dust = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) {
      dust.set([
        ((i * 0.618034) % 1 - 0.5) * 23,
        ((i * 0.414214) % 1 - 0.5) * 14,
        -8 - ((i * 0.754878) % 1) * 37,
      ], i * 3);
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dust, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: "#ff4c4c",
      size: 0.04,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    materials.push(dustMaterial);
    const particles = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(particles);

    let viewportWidth = stage.clientWidth;
    let viewportHeight = stage.clientHeight;
    let cardCenters = [...strip.children].map(card => card.offsetLeft + card.offsetWidth / 2);
    let activeCard = -1;
    let progress = 0;
    let visible = false;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let disposed = false;
    const playhead = { progress: 0 };

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onUpdate: self => { progress = self.progress; },
      onRefresh: self => { progress = self.progress; },
    });

    function draw(time) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const dt = Math.min(0.05, Math.max(0, (time - lastTime) / 1000 || 0.016));
      lastTime = time;

      playhead.progress = motion.matches
        ? progress
        : THREE.MathUtils.damp(playhead.progress, progress, 14, dt);

      const sequence = sampleProjectSequence(playhead.progress);
      const state = sampleWorkJourney(sequence.intro, motion.matches);
      const projectOpacity = THREE.MathUtils.smoothstep(playhead.progress, WORK_INTRO_END - 0.015, WORK_INTRO_END);
      projectGallery.style.opacity = String(projectOpacity);
      projectGallery.style.visibility = projectOpacity > 0 ? "visible" : "hidden";
      projectGallery.inert = projectOpacity < 0.95;
      const stripX = projectTrackX(sequence.gallery, viewportWidth, cardCenters.at(-1));
      strip.style.transform = `translate3d(${stripX}px, 0, 0)`;
      const focusX = viewportWidth / 2 - stripX;
      const nearest = cardCenters.reduce((best, center, i) => Math.abs(center - focusX) < Math.abs(cardCenters[best] - focusX) ? i : best, 0);
      if (nearest !== activeCard) { activeCard = nearest; setActiveProject(nearest); }
      cards.forEach((card, index) => {
        const offset = THREE.MathUtils.clamp((cardCenters[index] - focusX) / viewportWidth, -1, 1);
        card.style.setProperty("--orbit-angle", `${motion.matches ? 0 : offset * -12}deg`);
        card.style.setProperty("--orbit-scale", String(motion.matches ? 1 : 1 - Math.abs(offset) * 0.12));
        card.style.setProperty("--image-shift", `${motion.matches ? 0 : offset * -3}%`);
      });

      letters.forEach((letter, index) => {
        const position = sampleWorkLetter(Math.floor(index / LETTER_COPIES), index % LETTER_COPIES, sequence.intro + sequence.gallery * 1.4, state.cameraZ, motion.matches);
        letter.style.transform = `translate(-50%, -50%) translate3d(${viewportWidth / 2 + position.x * viewportHeight}px, ${viewportHeight / 2 + position.y * viewportHeight}px, 0)`;
        letter.style.fontSize = `${position.size * viewportHeight}px`;
        letter.style.opacity = String(position.opacity);
      });

      camera.position.set(0, 0, state.cameraZ);
      canvas.style.opacity = state.tunnelOpacity;
      entry.style.opacity = String(state.entryOpacity);
      entry.inert = state.entryOpacity < 0.2;

      // Smooth upward lift: the work tunnel ascends, revealing the pristine black section
      track.style.transform = `translate3d(0, ${(-state.lift * 100).toFixed(3)}vh, 0)`;
      stage.style.setProperty("--work-progress", playhead.progress);
      stage.style.setProperty("--work-lift", state.lift);

      if (!motion.matches) elapsed += dt;
      particles.position.y = Math.sin(elapsed * 0.2) * 0.12;

      // Only render WebGL while the tunnel is still partially or fully in view
      if (state.lift < 0.999) {
        renderer.render(scene, camera);
      }

      frame = requestAnimationFrame(draw);
    }

    const wake = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      viewportWidth = width;
      viewportHeight = height;
      cardCenters = [...strip.children].map(card => card.offsetLeft + card.offsetWidth / 2);
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      trigger.refresh();
      wake();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    observer.observe(root);

    const intersection = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      wake();
    }, { threshold: 0 });
    intersection.observe(stage);

    document.addEventListener("visibilitychange", wake);
    root.dataset.webgl = "ready";
    resize();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      trigger.kill();
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", wake);
      scene.traverse(object => object.geometry?.dispose());
      materials.forEach(m => m.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <section id="work" className={styles.work} ref={rootRef} aria-label="Work — selected projects">
        {/* The entrance sign stays in document flow while the camera moves inside. */}
        <div className={styles.marquee} aria-hidden="true">
          <div>
            {[0, 1, 2, 3].map(i => (
              <span key={i}>I&apos;M STILL COOKING · THANKS FOR WATCHING · </span>
            ))}
          </div>
        </div>

      <div className={styles.stage} ref={stageRef}>
        <WorkLetters ref={lettersRef} />
        <WorkProjects ref={projectsRef} stripRef={stripRef} active={activeProject} onSelect={selectProject} />
        <div className={styles.track} ref={trackRef}>
          {/* Layer 1: 3D Red Wireframe Tunnel */}
          <div className={styles.tunnelPane}>
            <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
            <div className={styles.entry} ref={entryRef}>
              <a
                href="#work"
                onClick={enterWork}
                className={`${styles.enter} cursor-target`}
                data-cursor-label="ENTER"
              >
                SCROLL TO ENTER <span>↓</span>
              </a>
              <span className={styles.chapter}>03 / SELECTED WORK</span>
            </div>
          </div>

        </div>

          {/* Galaxy stays behind the tunnel throughout the camera journey. */}
          <div className={styles.blackPane}>
            <Galaxy
              transparent={false}
              backgroundColor="#000000"
              starColors={["#ffffff", "#e20b3a", "#ff8da1", "#edddd4"]}
              density={0.85}
              speed={0.55}
              starSpeed={0.3}
              glowIntensity={0.18}
              twinkleIntensity={0.4}
              flareIntensity={0.6}
              layers={4}
              mouseRepulsion={true}
              mouseInteraction={true}
              repulsionStrength={2}
              clickWarp={true}
              intro={false}
            />
          </div>
      </div>
    </section>
  );
}
