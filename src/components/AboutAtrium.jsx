"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ArrowRight } from "lucide-react";
import ShuffleText from "./ShuffleText";
import { createAboutJourney, scrollToTravel } from "../lib/aboutJourney.mjs";
import { floorHeight as floorY, groundedBoxGeometry } from "../lib/aboutGeometry.mjs";
import { museumExhibits, roomStops } from "../lib/aboutExhibits.mjs";
import styles from "./Portfolio.module.css";

const WIDTH = 1487;
const HEIGHT = 1058;
const RED = "#e20b3a";
const INK = "#101413";
const FOV = 42;
const HALF_HEIGHT = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

// Calibrate world-space planes against the selected architectural view.
function world(x, y, depth) {
  return new THREE.Vector3((x / WIDTH * 2 - 1) * HALF_HEIGHT * WIDTH / HEIGHT * depth, (1 - y / HEIGHT * 2) * HALF_HEIGHT * depth, -depth);
}

function projectPanel(element, corners, camera, width, height, panelWidth = 500, panelHeight = 620) {
  if (corners.some(point => point.clone().applyMatrix4(camera.matrixWorldInverse).z > -0.1)) {
    element.style.visibility = "hidden";
    return;
  }
  element.style.visibility = "visible";
  const [p0, p1, p2, p3] = corners.map(point => {
    const p = point.clone().project(camera);
    return { x: (p.x + 1) * width / 2, y: (1 - p.y) * height / 2 };
  });
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;
  const determinant = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / determinant;
  const h = (dx1 * sy - sx * dy1) / determinant;
  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + h * p3.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + h * p3.y;
  element.style.transform = `matrix3d(${a / panelWidth},${d / panelWidth},0,${g / panelWidth},${b / panelHeight},${e / panelHeight},0,${h / panelHeight},0,0,1,0,${p0.x},${p0.y},0,1)`;
}

export default function AboutAtrium() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const copyRef = useRef(null);
  const stackRef = useRef(null);
  const designRef = useRef(null);
  const galleryRefs = useRef([]);
  const [activeStop, setActiveStop] = useState(0);

  function navigateRoom(destination) {
    const section = sectionRef.current;
    const top = window.scrollY + section.getBoundingClientRect().top;
    window.scrollTo({ top: top + (section.offsetHeight - stageRef.current.clientHeight) * destination,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const copy = copyRef.current;
    const stack = stackRef.current;
    const design = designRef.current;
    let disposed = false;
    let cleanup = () => {};

    async function init() {
      const font = new FontFace("AtriumDisplay", "url(/fonts/Coluna.otf)");
      try { document.fonts.add(await font.load()); } catch { /* The system font remains usable if the asset fails. */ }
      if (disposed) { document.fonts.delete(font); return; }
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
      } catch {
        section.dataset.webgl = "unavailable";
        document.fonts.delete(font);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(RED, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, 0.1, 100);
      const materials = new Set();
      const textures = [];

      function material(color = RED, map = null) {
        const value = new THREE.MeshBasicMaterial({ color: map ? "#ffffff" : color, map, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
        materials.add(value);
        return value;
      }
      const red = material();
      const sideRed = material("#b20930");
      const black = material(INK);
      const edge = new THREE.LineBasicMaterial({ color: INK });
      materials.add(edge);

      function path(points, parent = scene, lineMaterial = edge) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        parent.add(line);
        return line;
      }
      function face(coords, surface = red, parent = scene, outline = true) {
        const points = coords.map(p => (p instanceof THREE.Vector3 ? p.clone() : world(...p)));
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(points.flatMap(p => p.toArray()), 3));
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
        geometry.setIndex([0, 1, 2, 0, 2, 3]);
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, surface);
        parent.add(mesh);
        if (outline) path([...points, points[0]], parent);
        return points;
      }
      const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const letterControllers = [];

      function lettering(finalText, coords, staggerDelay = 0) {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d", { alpha: false });
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        textures.push(texture);

        ctx.font = '800px "AtriumDisplay", sans-serif';
        const bounds = ctx.measureText(finalText);
        const glyphWidth = bounds.actualBoundingBoxLeft + bounds.actualBoundingBoxRight;
        const glyphHeight = bounds.actualBoundingBoxAscent + bounds.actualBoundingBoxDescent;
        const scaleX = 494 / (glyphWidth || 1);
        const scaleY = 1022 / (glyphHeight || 1);

        function drawText(txt) {
          ctx.fillStyle = RED;
          ctx.fillRect(0, 0, 512, 1024);
          ctx.font = '800px "AtriumDisplay", sans-serif';
          ctx.save();
          ctx.translate(9, 1);
          ctx.scale(scaleX, scaleY);
          ctx.fillStyle = INK;
          ctx.fillText(txt, bounds.actualBoundingBoxLeft, bounds.actualBoundingBoxAscent);
          ctx.restore();
          texture.needsUpdate = true;
        }

        drawText(finalText);
        face(coords, material(RED, texture));

        const ctrl = {
          finalText,
          staggerDelay,
          elapsed: 0,
          duration: 0.45 + staggerDelay,
          active: true,
          lastScrambleTime: 0,
          start() {
            this.active = true;
            this.elapsed = 0;
            this.lastScrambleTime = 0;
          },
          update(timeNow, dt) {
            if (!this.active) return;
            this.elapsed += dt;
            if (this.elapsed < this.staggerDelay) return;
            if (this.elapsed >= this.duration) {
              this.active = false;
              drawText(this.finalText);
              return;
            }
            // Scramble update throttled to every 65ms for buttery-smooth 60fps rendering
            if (timeNow - this.lastScrambleTime > 65) {
              this.lastScrambleTime = timeNow;
              let scramble = "";
              for (let i = 0; i < this.finalText.length; i++) {
                scramble += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
              }
              drawText(scramble);
            }
          }
        };

        letterControllers.push(ctrl);
        return ctrl;
      }

      const floorPoint = (x, z) => new THREE.Vector3(x, floorY(-z), z);
      const ceilingPoint = (x, z) => new THREE.Vector3(x, 6.4, z);
      function plane(points, surface = red) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        geometry.setIndex([0, 1, 2, 0, 2, 3]);
        const mesh = new THREE.Mesh(geometry, surface);
        scene.add(mesh);
        return mesh;
      }

      // The full room encloses the entire camera path, not just the initial view.
      plane([floorPoint(-25, 5), floorPoint(28, 5), floorPoint(28, -38), floorPoint(-25, -38)]);
      plane([ceilingPoint(-25, 5), ceilingPoint(28, 5), ceilingPoint(28, -38), ceilingPoint(-25, -38)]);
      plane([ceilingPoint(-25, -38), ceilingPoint(28, -38), floorPoint(28, -38), floorPoint(-25, -38)], black);
      plane([ceilingPoint(28, -38), ceilingPoint(28, 5), floorPoint(28, 5), floorPoint(28, -38)]);
      plane([ceilingPoint(-25, 5), ceilingPoint(-25, -38), floorPoint(-25, -38), floorPoint(-25, 5)]);
      for (let x = -24; x <= 28; x += 2) {
        const line = path([floorPoint(x, 5), floorPoint(x, -38)]);
        line.position.y = 0.006;
      }
      for (let z = -37; z <= 5; z += 2) {
        const line = path([floorPoint(-25, z), floorPoint(28, z)]);
        line.position.y = 0.006;
      }
      for (let x = -24; x <= 28; x += 6) {
        const line = path([ceilingPoint(x, 5), ceilingPoint(x, -38)]);
        line.position.y = -0.006;
      }
      for (let z = -37; z <= 5; z += 6) {
        const line = path([ceilingPoint(-25, z), ceilingPoint(28, z)]);
        line.position.y = -0.006;
      }

      function groundedBlock(width, height, depth, x, z, rotation, surfaces = red) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.rotation.y = rotation;
        const geometry = groundedBoxGeometry(width, height, depth, z, rotation);
        group.add(new THREE.Mesh(geometry, surfaces));
        group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edge));
        scene.add(group);
        return group;
      }

      function createTotem(x, z, rotation) {
        const exhibit = groundedBlock(4.3, 0.28, 2, x, z, rotation, black);
        const bottom = floorY(-z) + 0.28;
        const bodyGeometry = new THREE.BoxGeometry(3.9, 5.5, 1.4);
        bodyGeometry.translate(0, bottom + 2.75, 0);
        exhibit.add(new THREE.Mesh(bodyGeometry, [sideRed, sideRed, red, red, black, sideRed]));
        exhibit.add(new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeometry), edge));
        exhibit.updateMatrixWorld(true);
        return {
          target: new THREE.Vector3(x, bottom + 2.75, z),
          corners: [[-1.83, bottom + 5.37, 0.706], [1.83, bottom + 5.37, 0.706], [1.83, bottom + 0.13, 0.706], [-1.83, bottom + 0.13, 0.706]]
            .map(p => exhibit.localToWorld(new THREE.Vector3(...p))),
        };
      }
      const codeTotem = createTotem(9, -16, Math.PI / 12);
      const designTotem = createTotem(17, -25, Math.PI / 24);
      const stackCorners = codeTotem.corners;
      const gallery = museumExhibits.map(({ x, z, rotation, title, eyebrow }) => {
        const partition = groundedBlock(6.4, 4.8, 0.9, x, z, rotation, [sideRed, sideRed, red, red, red, sideRed]);
        const poster = document.createElement("canvas");
        poster.width = 850; poster.height = 560;
        const ctx = poster.getContext("2d");
        ctx.fillStyle = INK; ctx.fillRect(0, 0, 850, 560);
        ctx.fillStyle = RED; ctx.font = '26px monospace'; ctx.fillText(eyebrow, 44, 66);
        ctx.font = '76px "AtriumDisplay", sans-serif'; ctx.fillText(title, 44, 165, 760);
        const texture = new THREE.CanvasTexture(poster);
        texture.colorSpace = THREE.SRGBColorSpace;
        textures.push(texture);
        const center = floorY(-z) + 2.5;
        const artwork = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 3.7), material(RED, texture));
        artwork.position.set(0, center, 0.456);
        partition.add(artwork);
        partition.updateMatrixWorld(true);
        return {
          target: new THREE.Vector3(x, center, z),
          corners: [[-2.75, center + 1.85, 0.462], [2.75, center + 1.85, 0.462], [2.75, center - 1.85, 0.462], [-2.75, center - 1.85, 0.462]]
            .map(p => partition.localToWorld(new THREE.Vector3(...p))),
        };
      });
      const journey = createAboutJourney(codeTotem.target, designTotem.target, gallery.map(panel => panel.target));
      const legs = [journey, journey.design, ...journey.gallery];

      // Grounded volumetric architectural accordion folding wall:
      // Seams connect all panels down to the floor grid, with 3D thickness on top and end caps.
      const frontSeams = [
        [-45, -30, 6.6],   // 0: left of AB
        [276, 164, 9.2],   // 1: right of AB / fold 1
        [293, 168, 9.3],   // 2: left of card
        [732, 221, 10.6],  // 3: right of card / fold 2
        [779, 200, 9.8],   // 4: left of O
        [951, 259, 11.6],  // 5: right of O / fold 3
        [959, 264, 11.4],  // 6: left of U
        [1089, 312, 13.0], // 7: right of U / fold 4
        [1097, 315, 12.8], // 8: left of T
        [1208, 353, 14.3], // 9: right of T
      ];

      const THICKNESS = 0.55;
      const frontTop = frontSeams.map(([x, y, d]) => world(x, y, d));
      const frontBot = frontSeams.map(([x, y, d]) => new THREE.Vector3(world(x, y, d).x, floorY(d), -d));
      const backTop = frontTop.map(ft => new THREE.Vector3(ft.x, ft.y, ft.z - THICKNESS));
      const backBot = frontBot.map(fb => new THREE.Vector3(fb.x, floorY(-(fb.z - THICKNESS)), fb.z - THICKNESS));

      // 1. Top caps: visible architectural thickness across the top edge of every panel
      for (let i = 0; i < frontSeams.length - 1; i++) {
        face([frontTop[i], backTop[i], backTop[i + 1], frontTop[i + 1]], sideRed);
      }

      // 2. Left and right end caps: closes the edges into depth so it looks solid
      face([backTop[0], frontTop[0], frontBot[0], backBot[0]], sideRed);
      face([frontTop[9], backTop[9], backBot[9], frontBot[9]], sideRed);

      // 3. Back faces: solid volumetric rear enclosure
      for (let i = 0; i < frontSeams.length - 1; i++) {
        face([backTop[i + 1], backTop[i], backBot[i], backBot[i + 1]], red, scene, false);
      }

      // 4. Front panels: grounded to floor with letters and about card
      lettering("AB", [frontTop[0], frontTop[1], frontBot[1], frontBot[0]], 0.0);
      face([frontTop[1], frontTop[2], frontBot[2], frontBot[1]]);
      face([frontTop[2], frontTop[3], frontBot[3], frontBot[2]]);
      face([frontTop[3], frontTop[4], frontBot[4], frontBot[3]]);
      lettering("O", [frontTop[4], frontTop[5], frontBot[5], frontBot[4]], 0.1);
      face([frontTop[5], frontTop[6], frontBot[6], frontBot[5]]);
      lettering("U", [frontTop[6], frontTop[7], frontBot[7], frontBot[6]], 0.2);
      face([frontTop[7], frontTop[8], frontBot[8], frontBot[7]]);
      lettering("T", [frontTop[8], frontTop[9], frontBot[9], frontBot[8]], 0.3);

      const panelCorners = [[294, 223, 9.29], [731, 251, 10.59], [731, 752, 10.59], [294, 780, 9.29]].map(p => world(...p));

      let width = 1, height = 1, frame = 0, visible = false;
      let targetX = 0, targetY = 0, lastTime = 0, entered = false;
      let travel = 0;
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const draw = time => {
        frame = 0;
        if (disposed || !visible || document.hidden) return;
        const dt = Math.min((time - lastTime) / 1000 || 0.016, 0.05);
        lastTime = time;
        const ease = 1 - Math.exp(-dt * 6);
        const scroll = THREE.MathUtils.clamp(-section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - height), 0, 1);
        const destination = scrollToTravel(scroll, motion.matches);
        travel = motion.matches ? destination : THREE.MathUtils.lerp(travel, destination, ease);
        if (Math.abs(travel - destination) < 0.0001 && !motion.matches) travel = destination;
        const legIndex = Math.min(Math.floor(travel), legs.length - 1);
        const leg = legs[legIndex];
        const legTravel = THREE.MathUtils.clamp(travel - legIndex, 0, 1);
        camera.position.copy(leg.camera.getPoint(legTravel));
        camera.position.x += motion.matches ? 0 : targetX * 0.035 * Math.max(0, 1 - travel);
        camera.position.y += motion.matches ? 0 : -targetY * 0.025 * Math.max(0, 1 - travel);
        camera.lookAt(leg.look.getPoint(legTravel));
        camera.updateMatrixWorld();
        letterControllers.forEach(ctrl => ctrl.update(time, dt));
        projectPanel(copy, panelCorners, camera, width, height);
        copy.style.opacity = String(1 - THREE.MathUtils.smoothstep(travel, 0.08, 0.28));
        copy.inert = travel > 0.28;
        projectPanel(stack, stackCorners, camera, width, height);
        stack.style.opacity = String(THREE.MathUtils.smoothstep(travel, 0.4, 0.65) * (1 - THREE.MathUtils.smoothstep(travel, 1.05, 1.35)));
        stack.inert = travel < 0.4 || travel > 1.35;
        projectPanel(design, designTotem.corners, camera, width, height);
        design.style.opacity = String(THREE.MathUtils.smoothstep(travel, 1.35, 1.7) * (1 - THREE.MathUtils.smoothstep(travel, 2.05, 2.35)));
        design.inert = travel < 1.35 || travel > 2.35;
        gallery.forEach((panel, i) => {
          const element = galleryRefs.current[i];
          projectPanel(element, panel.corners, camera, width, height, 850, 560);
          const distance = Math.abs(travel - (i + 3));
          element.style.opacity = String(1 - THREE.MathUtils.smoothstep(distance, 0.25, 0.65));
          element.inert = distance > 0.25;
        });
        setActiveStop(Math.round(travel));
        stage.style.setProperty("--room-progress", scroll);
        stage.dataset.view = travel > 1.7 ? "design" : travel > 0.75 ? "skills" : "about";
        renderer.render(scene, camera);
        frame = requestAnimationFrame(draw);
      };
      const wake = () => {
        if (!frame && visible && !document.hidden && !disposed) { lastTime = performance.now(); frame = requestAnimationFrame(draw); }
      };
      const resize = () => {
        width = stage.clientWidth;
        height = stage.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        wake();
      };
      const move = event => {
        const box = stage.getBoundingClientRect();
        targetX = (event.clientX - box.left) / box.width * 2 - 1;
        targetY = (event.clientY - box.top) / box.height * 2 - 1;
      };
      const leave = () => { targetX = 0; targetY = 0; };
      let lastShuffleTime = 0;
      const triggerShuffle = () => {
        const now = performance.now();
        if (now - lastShuffleTime < 1000) return;
        lastShuffleTime = now;
        letterControllers.forEach(ctrl => ctrl.start());
        wake();
      };
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          letterControllers.forEach(ctrl => ctrl.start());
          if (!entered) { entered = true; section.dataset.entered = "true"; }
        }
        wake();
      });
      const observer = new ResizeObserver(resize);
      observer.observe(stage);
      intersection.observe(section);
      section.addEventListener("pointermove", move, { passive: true });
      section.addEventListener("pointerleave", leave);
      section.addEventListener("click", triggerShuffle);
      section.addEventListener("pointerenter", triggerShuffle);
      document.addEventListener("visibilitychange", wake);
      resize();
      camera.updateMatrixWorld();
      projectPanel(copy, panelCorners, camera, width, height);
      section.dataset.webgl = "ready";
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        intersection.disconnect();
        section.removeEventListener("pointermove", move);
        section.removeEventListener("pointerleave", leave);
        section.removeEventListener("click", triggerShuffle);
        section.removeEventListener("pointerenter", triggerShuffle);
        document.removeEventListener("visibilitychange", wake);
        scene.traverse(object => object.geometry?.dispose());
        textures.forEach(texture => texture.dispose());
        materials.forEach(value => value.dispose());
        renderer.dispose();
        document.fonts.delete(font);
      };
    }
    init();
    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <section className={styles.about} id="about" ref={sectionRef} aria-labelledby="about-title">
      <div className={styles.aboutStage} ref={stageRef} data-view="about">
      <canvas className={styles.aboutCanvas} ref={canvasRef} aria-hidden="true" />
      <h2 id="about-title" className={styles.aboutAccessibleTitle}>About</h2>
      <div className={styles.aboutCopy} ref={copyRef}>
        <div className={styles.aboutIndex}>
          <ShuffleText
            text="02 / ABOUT — PROFILE"
            duration={0.45}
            triggerOnHover={true}
          />
        </div>
        <div className={styles.aboutText}>
          <p className={styles.aboutLead}>I’m a UI/UX enthusiast<br />and frontend developer<br />who loves turning ideas<br />into meaningful, human<br />experiences.</p>
          <p className={styles.aboutBody}>I explore the space between design<br />and code, bringing ideas to life through<br />thoughtful interfaces, purposeful motion,<br />and the details that make a website<br />feel special. Always learning.</p>
        </div>
      </div>
      <article className={styles.stackTotem} ref={stackRef} aria-labelledby="stack-title">
        <p className={styles.stackIndex}>03 / THE TOOLKIT</p>
        <h3 id="stack-title">TECH<br />STACK.</h3>
        <p className={styles.stackIntro}>Design, development<br />& a little bit of motion.</p>
        <ul>
          <li><span>01 / FOUNDATION</span><strong>HTML · CSS · JavaScript</strong></li>
          <li><span>02 / INTERFACE</span><strong>React · Next.js</strong></li>
          <li><span>03 / MOTION</span><strong>GSAP · Three.js</strong></li>
        </ul>
        <p className={styles.stackFooter}>UI / UX ENTHUSIAST — ALWAYS LEARNING</p>
      </article>
      <article className={`${styles.stackTotem} ${styles.designTotem}`} ref={designRef} aria-labelledby="design-stack-title">
        <p className={styles.stackIndex}>04 / DESIGN TOOLKIT</p>
        <h3 id="design-stack-title">DESIGN<br />TOOLS.</h3>
        <p className={styles.stackIntro}>From a first sketch<br />to a clear visual story.</p>
        <ul>
          <li><span>01 / INTERFACE & PROTOTYPE</span><strong>Figma</strong></li>
          <li><span>02 / VISUAL CONTENT</span><strong>Canva</strong></li>
          <li><span>03 / PRACTICE</span><strong>Layout · Typography · UI / UX</strong></li>
        </ul>
        <p className={styles.stackFooter}>DESIGN WITH INTENT — BUILD WITH CURIOSITY</p>
      </article>
      {museumExhibits.map((exhibit, i) => (
        <article className={styles.museumPanel} ref={element => { galleryRefs.current[i] = element; }} key={exhibit.title} aria-labelledby={`museum-title-${i}`}>
          <p className={styles.museumIndex}>{exhibit.eyebrow}</p>
          <h3 id={`museum-title-${i}`}>{exhibit.title}</h3>
          <ul>{exhibit.rows.map(row => (
            <li key={row.title}>
              <span>{row.title}</span>
              {row.href ? <a href={row.href} target="_blank" rel="noopener noreferrer">{row.role} <ArrowRight size={22} /></a> : <strong>{row.role}</strong>}
            </li>
          ))}</ul>
          {exhibit.note && <p className={styles.museumNote}>{exhibit.note}</p>}
        </article>
      ))}
      <nav className={styles.roomNavigation} aria-label="Explore the About room">
        <span>{String(activeStop + 2).padStart(2, "0")} / {roomStops[activeStop]}</span>
        <span className={styles.roomProgress} aria-hidden="true"><i /></span>
        {activeStop > 0 && <button type="button" onClick={() => navigateRoom((activeStop - 1) / 6)} aria-label="Previous exhibit">&larr;</button>}
        <button className="cursor-target" type="button" onClick={() => navigateRoom(activeStop === 6 ? 0 : (activeStop + 1) / 6)}>
          {activeStop === 6 ? "BACK TO ABOUT" : `EXPLORE ${roomStops[activeStop + 1]}`} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </nav>
      </div>
    </section>
  );
}
