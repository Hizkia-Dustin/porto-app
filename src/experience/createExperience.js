import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sampleProgress, sampleJourney, ABOUT_PROGRESS, FIRST_TRANSITION_END, phase } from "./progress.mjs";
import { artworkVertex, artworkFragment, particleVertex, particleFragment } from "./shaders";

const asset = (name) => `/assets/web/${name}.webp`;

// Sample actual opaque surfaces, favouring edges over flat image regions.
function sampleArtwork(image, count) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = Math.round(256 * image.height / image.width);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const candidates = [];
  const luma = (i) => (data[i] + data[i + 1] + data[i + 2]) * data[i + 3] / 765;
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const i = (y * canvas.width + x) * 4;
      if (data[i + 3] < 100) continue;
      const edge = Math.abs(luma(i + 4) - luma(i - 4)) +
        Math.abs(luma(i + canvas.width * 4) - luma(i - canvas.width * 4));
      if (edge > 24 || (x * 7 + y * 13) % 11 === 0) candidates.push([x / canvas.width - .5, .5 - y / canvas.height]);
    }
  }
  if (!candidates.length) throw new Error("The artwork has no visible surface samples.");
  return Array.from({ length: count }, (_, i) => candidates[(i * 7919) % candidates.length]);
}

export function createExperience({ root, stage, mount, onReady, onFailure }) {
  gsap.registerPlugin(ScrollTrigger);
  let disposed = false;
  let renderer, trigger, timeline, resizeObserver;
  let frame = 0, dirty = true, progress = 0, pendingFocus = null;
  const textures = [], materials = [], geometries = [], cleanups = [];
  const workCopy = root.querySelector('[data-copy="work"]');
  const sceneFooter = root.querySelector(".scene-footer");

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    timeline?.kill();
    trigger?.kill(true);
    cleanups.forEach((fn) => fn());
    textures.forEach((t) => t.dispose());
    materials.forEach((m) => m.dispose());
    geometries.forEach((g) => g.dispose());
    renderer?.dispose();
    renderer?.domElement.remove();
    root.classList.remove("is-enhanced");
    root.querySelectorAll("[data-copy]").forEach((el) => {
      el.removeAttribute("style");
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
    });
    stage.style.removeProperty("--progress");
    stage.style.removeProperty("--work-reveal");
    root.style.removeProperty("--work-overflow");
    sceneFooter.style.removeProperty("opacity");
    sceneFooter.removeAttribute("aria-hidden");
  }

  async function init() {
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
      renderer.setClearColor(0x080e14, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      mount.appendChild(renderer.domElement);
      const onContextLost = (event) => { event.preventDefault(); dispose(); onFailure(); };
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);
      cleanups.push(() => renderer.domElement.removeEventListener("webglcontextlost", onContextLost));
      const loader = new THREE.TextureLoader();
      const load = async (name) => {
        const texture = await loader.loadAsync(asset(name));
        if (disposed) { texture.dispose(); return null; }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        textures.push(texture);
        return texture;
      };
      const [
        landscape, floating, muse, seated,
        portrait, orbit, sculpture, celestial, butterfly, column
      ] = await Promise.all([
        "landscape", "floating-maker", "floating-muse", "seated-maker",
        "parchment-portrait", "parchment-orbit", "parchment-sculpture",
        "parchment-celestial", "parchment-butterfly", "parchment-column"
      ].map(load));
      if (disposed) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, .1, 60);
      camera.position.z = 10;
      const geometry = new THREE.PlaneGeometry(1, 1);
      geometries.push(geometry);
      const makeLayer = (map, order, background = false, tint = 0xffffff, doubleSide = false) => {
        const uniforms = {
          uMap: { value: map },
          uUvScale: { value: new THREE.Vector2(1, 1) },
          uTexel: { value: new THREE.Vector2(1 / map.image.width, 1 / map.image.height) },
          uTint: { value: new THREE.Color(tint) },
          uEdge: { value: 0 }, uDissolve: { value: 0 }, uReveal: { value: 1 },
          uBackground: { value: background ? 1 : 0 },
        };
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: artworkVertex,
          fragmentShader: artworkFragment,
          transparent: true,
          depthWrite: false,
          depthTest: false,
          side: doubleSide ? THREE.DoubleSide : THREE.FrontSide
        });
        materials.push(material);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = order;
        scene.add(mesh);
        return mesh;
      };
      const nextBackground = makeLayer(landscape, 0, true, 0x485b72);
      const background = makeLayer(landscape, 1, true, 0xf0e5d0);
      const nextCharacter = makeLayer(seated, 2);
      const heroCharacter = makeLayer(floating, 3, false, 0xffffff, true);
      const heroMuse = makeLayer(muse, 4, false, 0xffffff, true);
      const workLayers = [landscape, orbit, sculpture].map((map) => makeLayer(map, 7));
      const workImages = [...workCopy.querySelectorAll(".work-image")];

      // Scattered Renaissance parchment codex sheets framing the hero composition
      const paperDefs = [
        // Top-left celestial mechanics diagram (high foreground float)
        { map: celestial, order: 5, x: 0.13, y: 0.15, size: 0.165, z: 1.25, rotZ: -0.26, rotX: 0.18, rotY: -0.22,
          driftX: -0.32, driftY: 0.22, driftRot: 0.45, speed: 1.1, phase: 0.0, amp: 0.035 },
        // Top-right botanical butterfly study
        { map: butterfly, order: 5, x: 0.87, y: 0.14, size: 0.155, z: 1.15, rotZ: 0.28, rotX: -0.14, rotY: 0.18,
          driftX: 0.30, driftY: -0.20, driftRot: -0.5, speed: 0.9, phase: 1.8, amp: 0.03 },
        // Top-center armillary / spherical geometry
        { map: orbit, order: 2, x: 0.50, y: 0.09, size: 0.115, z: -0.4, rotZ: -0.12, rotX: 0.22, rotY: 0.08,
          driftX: 0.05, driftY: -0.25, driftRot: 0.3, speed: 1.3, phase: 3.1, amp: 0.02 },
        // Far left flank portrait study (near muse)
        { map: portrait, order: 4, x: 0.08, y: 0.46, size: 0.16, z: 0.9, rotZ: 0.19, rotX: 0.12, rotY: -0.24,
          driftX: -0.35, driftY: 0.12, driftRot: -0.4, speed: 0.85, phase: 4.2, amp: 0.03 },
        // Far right flank classical column (near maker)
        { map: column, order: 4, x: 0.92, y: 0.46, size: 0.15, z: 0.8, rotZ: -0.24, rotX: -0.15, rotY: 0.20,
          driftX: 0.36, driftY: 0.14, driftRot: 0.42, speed: 1.05, phase: 2.4, amp: 0.028 },
        // Bottom-left classical sculpture bust (foreground corner)
        { map: sculpture, order: 6, x: 0.13, y: 0.85, size: 0.185, z: 1.6, rotZ: 0.34, rotX: 0.20, rotY: -0.18,
          driftX: -0.28, driftY: 0.25, driftRot: 0.55, speed: 0.95, phase: 5.1, amp: 0.04 },
        // Bottom-right celestial orbits study (foreground right)
        { map: celestial, order: 6, x: 0.87, y: 0.84, size: 0.17, z: 1.45, rotZ: -0.30, rotX: -0.18, rotY: 0.22,
          driftX: 0.26, driftY: 0.22, driftRot: -0.48, speed: 1.15, phase: 0.9, amp: 0.038 },
        // Bottom-center geometry sheet (below title card)
        { map: orbit, order: 3, x: 0.50, y: 0.91, size: 0.115, z: 0.3, rotZ: 0.14, rotX: 0.16, rotY: -0.12,
          driftX: 0.08, driftY: 0.28, driftRot: 0.35, speed: 1.2, phase: 2.7, amp: 0.025 },
        // Mid-left deep space botanical study (stereoscopic background)
        { map: butterfly, order: 2, x: 0.22, y: 0.28, size: 0.095, z: -1.4, rotZ: -0.16, rotX: 0.08, rotY: 0.14,
          driftX: -0.18, driftY: -0.12, driftRot: -0.25, speed: 0.8, phase: 1.3, amp: 0.018 },
        // Mid-right deep space portrait study
        { map: portrait, order: 2, x: 0.78, y: 0.29, size: 0.095, z: -1.2, rotZ: 0.22, rotX: -0.10, rotY: -0.15,
          driftX: 0.18, driftY: -0.14, driftRot: 0.28, speed: 1.0, phase: 3.7, amp: 0.018 },
        // Mid-left lower accent (sculpture fragment)
        { map: sculpture, order: 3, x: 0.26, y: 0.72, size: 0.105, z: -0.2, rotZ: -0.22, rotX: 0.14, rotY: -0.10,
          driftX: -0.15, driftY: 0.18, driftRot: -0.32, speed: 1.1, phase: 4.8, amp: 0.022 },
        // Mid-right lower accent (column fragment)
        { map: column, order: 3, x: 0.74, y: 0.71, size: 0.105, z: -0.1, rotZ: 0.20, rotX: -0.12, rotY: 0.16,
          driftX: 0.16, driftY: 0.16, driftRot: 0.36, speed: 0.9, phase: 2.1, amp: 0.022 }
      ];

      const papers = paperDefs.map((def) => {
        const mesh = makeLayer(def.map, def.order, false, 0xffffff, true);
        return { mesh, cfg: def, base: null };
      });
      const paperMeshes = papers.map((p) => p.mesh);
      const heroLayers = [heroCharacter, heroMuse, ...paperMeshes];
      const count = 10000;
      const startSamples = sampleArtwork(floating.image, count);
      const museSamples = sampleArtwork(muse.image, count);
      const endSamples = sampleArtwork(seated.image, count);
      const positions = new Float32Array(count * 3), targets = new Float32Array(count * 3);
      const scatter = new Float32Array(count * 3), seeds = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        seeds[i] = Math.abs((Math.sin(i * 127.1 + 12.34) * 43758.5453) % 1);
        scatter.set([Math.sin(i * 2.4) * 5, Math.cos(i * 7.1) * 3, Math.sin(i * 3.7) * 4], i * 3);
      }
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
      particleGeometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
      particleGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      geometries.push(particleGeometry);
      const particleMaterial = new THREE.ShaderMaterial({
        vertexShader: particleVertex, fragmentShader: particleFragment,
        uniforms: { uMorph: { value: 0 }, uVisibility: { value: 0 }, uPixelRatio: { value: 1 } },
        transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      });
      materials.push(particleMaterial);
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.frustumCulled = false;
      particles.renderOrder = 8;
      scene.add(particles);

      // The second passage reuses the same dissolve and particle shaders.
      const workSamples = [landscape, orbit, sculpture].map((map) => sampleArtwork(map.image, count));
      const workPositions = new Float32Array(count * 3), workTargets = new Float32Array(count * 3);
      const workGeometry = new THREE.BufferGeometry();
      workGeometry.setAttribute("position", new THREE.BufferAttribute(workPositions, 3));
      workGeometry.setAttribute("aTarget", new THREE.BufferAttribute(workTargets, 3));
      workGeometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
      workGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      geometries.push(workGeometry);
      const workMaterial = particleMaterial.clone();
      materials.push(workMaterial);
      const workParticles = new THREE.Points(workGeometry, workMaterial);
      workParticles.frustumCulled = false;
      workParticles.renderOrder = 8;
      scene.add(workParticles);

      let viewportWidth = 1, mobile = false;
      const baseHeight = 2 * Math.tan(THREE.MathUtils.degToRad(20)) * 10;
      function place(mesh, x, y, width, z = 0, rotZ = 0, rotX = 0, rotY = 0) {
        const image = mesh.material.uniforms.uMap.value.image;
        mesh.position.set((x - .5) * viewportWidth, (.5 - y) * baseHeight, z);
        mesh.scale.set(width, width * image.height / image.width, 1);
        mesh.rotation.set(rotX, rotY, rotZ);
      }
      // Calibrated fingertip pixels keep both hands together across desktop ratios.
      function placeHand(mesh, hand, screenX, screenY, width, rotation, mirrored) {
        const image = mesh.material.uniforms.uMap.value.image;
        const depth = .7;
        const perspective = (10 - depth) / 10;
        mesh.scale.set(width * perspective * (mirrored ? -1 : 1), width * perspective * image.height / image.width, 1);
        mesh.rotation.z = rotation;
        const anchor = new THREE.Vector3(hand[0] / image.width - .5, .5 - hand[1] / image.height, 0)
          .multiply(mesh.scale).applyAxisAngle(new THREE.Vector3(0, 0, 1), rotation);
        mesh.position.set((screenX - .5) * viewportWidth * perspective - anchor.x,
          (.5 - screenY) * baseHeight * perspective - anchor.y, depth);
      }
      function layout(p) {
        const { meet, approach, reconstruct } = sampleProgress(p);
        const bgWidth = Math.max(viewportWidth, baseHeight * landscape.image.width / landscape.image.height) * 1.45;
        place(background, .5 - approach * .012, .5, bgWidth, -4);
        place(nextBackground, .5, .5, bgWidth, -4);
        // shortcut: layered artwork supports a shallow camera move; use GLB for a full orbit.
        const heroWidth = Math.min(viewportWidth * (mobile ? .62 : .43), baseHeight * .98);
        const gap = (mobile ? .13 : .12) * (1 - meet);
        placeHand(heroMuse, [1390, 115], .5 - gap, .43, heroWidth, -.52 + meet * .06, false);
        placeHand(heroCharacter, [1390, 140], .5 + gap, .43, heroWidth, -.45 + meet * .04, true);
        place(nextCharacter, mobile ? .64 : .73, mobile ? .4 : .53,
          mobile ? viewportWidth * .87 : baseHeight * .63, .6 + (1 - reconstruct) * .2);

        papers.forEach((pItem) => {
          const cfg = pItem.cfg;
          const currentX = cfg.x + cfg.driftX * approach;
          const currentY = cfg.y + cfg.driftY * approach;
          const currentZ = cfg.z + (cfg.z > 0 ? approach * 1.5 : -approach * 0.7);
          const currentRotZ = cfg.rotZ + cfg.driftRot * approach;
          const paperWidth = baseHeight * (mobile ? cfg.size * 0.8 : cfg.size);
          pItem.base = {
            x: currentX, y: currentY, z: currentZ, scale: paperWidth,
            rotZ: currentRotZ, rotX: cfg.rotX, rotY: cfg.rotY
          };
          place(pItem.mesh, currentX, currentY, paperWidth, currentZ, currentRotZ, cfg.rotX, cfg.rotY);
        });
      }
      const heroCopy = root.querySelector('[data-copy="hero"]');
      const bridgeCopy = root.querySelector('[data-copy="bridge"]');
      const aboutCopy = root.querySelector('[data-copy="about"]');
      const chapter = root.querySelector("[data-chapter]");
      const caption = root.querySelector("[data-caption]");
      const contact = root.querySelector(".touch-light");
      function copy(el, visibility, offset) {
        el.style.opacity = visibility;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
        el.inert = visibility < .1;
        el.setAttribute("aria-hidden", visibility < .1 ? "true" : "false");
      }
      function applyPaperFloat(time) {
        const damp = Math.max(0, 1 - sampleJourney(progress).intro / 0.45);
        if (damp <= 0.001) return;
        for (let i = 0; i < papers.length; i++) {
          const pItem = papers[i];
          const cfg = pItem.cfg;
          const b = pItem.base;
          if (!b) continue;
          const bobY = Math.sin(time * cfg.speed + cfg.phase) * cfg.amp * damp;
          const bobX = Math.cos(time * cfg.speed * 0.75 + cfg.phase) * (cfg.amp * 0.35) * damp;
          const bobRotZ = Math.sin(time * cfg.speed * 0.6 + cfg.phase) * (0.04 * damp);
          const bobRotX = Math.cos(time * cfg.speed * 0.5 + cfg.phase) * (0.03 * damp);
          place(
            pItem.mesh,
            b.x + bobX,
            b.y + bobY,
            b.scale,
            b.z,
            b.rotZ + bobRotZ,
            b.rotX + bobRotX,
            b.rotY + bobRotZ * 0.4
          );
        }
      }
      let baseCamX = 0, baseCamZ = 10, baseRotZ = 0;
      const sceneColor = new THREE.Color(0x080e14), workColor = new THREE.Color(0x101c20);
      const clearColor = new THREE.Color();
      function update(p) {
        progress = p;
        const journey = sampleJourney(p);
        const state = sampleProgress(journey.intro);
        layout(journey.intro);
        baseCamX = state.approach * .13 * (1 - state.reconstruct);
        baseCamZ = 10 - state.approach * .35 * (1 - state.reconstruct);
        baseRotZ = state.approach * .018 * (1 - state.reconstruct);
        camera.position.set(baseCamX, 0, baseCamZ);
        camera.rotation.set(0, 0, baseRotZ);
        heroLayers.forEach((mesh) => {
          mesh.material.uniforms.uEdge.value = state.edge;
          mesh.material.uniforms.uDissolve.value = state.dissolve;
        });
        background.material.uniforms.uEdge.value = state.edge * .8;
        background.material.uniforms.uDissolve.value = phase(journey.intro, .62, .9);
        nextCharacter.material.uniforms.uReveal.value = state.reconstruct;
        nextCharacter.material.uniforms.uEdge.value = Math.max((1 - phase(journey.intro, .84, .98)) * .95, journey.edge);
        nextCharacter.material.uniforms.uDissolve.value = journey.dissolve;
        nextBackground.material.uniforms.uEdge.value = journey.edge * .8;
        nextBackground.material.uniforms.uDissolve.value = phase(journey.work, .32, .7);
        renderer.setClearColor(clearColor.copy(sceneColor).lerp(workColor, phase(journey.work, .3, .8)), 1);
        particleMaterial.uniforms.uMorph.value = state.morph;
        particleMaterial.uniforms.uVisibility.value = state.particles;
        workMaterial.uniforms.uMorph.value = journey.morph;
        workMaterial.uniforms.uVisibility.value = journey.particles;
        workLayers.forEach((mesh) => {
          mesh.material.uniforms.uReveal.value = journey.reconstruct;
          mesh.material.uniforms.uEdge.value = 1 - phase(journey.work, .65, .86);
          mesh.material.uniforms.uDissolve.value = phase(journey.work, .9, 1);
        });
        copy(heroCopy, state.heroText, -70 * (1 - state.heroText));
        copy(bridgeCopy, state.bridgeText, -15 * phase(journey.intro, .7, .78));
        copy(aboutCopy, state.aboutText * (1 - journey.aboutExit), 24 * (1 - state.aboutText) - journey.aboutExit * 40);
        copy(workCopy, journey.workText, 0);
        workCopy.inert = journey.workText < .99;
        workCopy.style.visibility = journey.workText === 0 ? "hidden" : "visible";
        sceneFooter.style.opacity = 1 - journey.workText;
        sceneFooter.setAttribute("aria-hidden", journey.workText > .99 ? "true" : "false");
        stage.style.setProperty("--progress", p);
        stage.style.setProperty("--work-reveal", journey.workText);
        contact.style.opacity = state.contact;
        chapter.textContent = journey.work > .7 ? "03 / 03" : journey.intro < .78 ? "01 / 03" : "02 / 03";
        caption.textContent = journey.work > .24 ? "Ideas taking a new form" : journey.intro < .28 ? "Scroll to bring worlds together" : journey.intro < .42 ? "A spark of possibility" : journey.intro < .8 ? "An idea taking shape" : "Scroll to explore the work";
        if (pendingFocus && Math.abs(p - pendingFocus.progress) < .001) {
          pendingFocus.element.focus({ preventScroll: true });
          pendingFocus = null;
        }
        dirty = true;
      }
      function resize() {
        const { width, height } = stage.getBoundingClientRect();
        if (!width || !height) return;
        mobile = width < 768;
        particleGeometry.setDrawRange(0, mobile ? 4200 : count);
        workGeometry.setDrawRange(0, mobile ? 4200 : count);
        const pixelRatio = Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.75);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        viewportWidth = baseHeight * camera.aspect;
        particleMaterial.uniforms.uPixelRatio.value = pixelRatio;
        workMaterial.uniforms.uPixelRatio.value = pixelRatio;
        root.style.setProperty("--work-overflow", `${Math.max(0, workCopy.offsetHeight - height)}px`);
        // Match shader thumbnails to their eventual DOM positions for a clean handoff.
        const workRect = workCopy.getBoundingClientRect();
        workLayers.forEach((mesh, index) => {
          const rect = workImages[index].getBoundingClientRect();
          const image = mesh.material.uniforms.uMap.value.image;
          let imageWidth = rect.width, imageHeight = rect.height;
          const aspect = image.width / image.height;
          if (index === 0) {
            const boxAspect = rect.width / rect.height;
            mesh.material.uniforms.uUvScale.value.set(Math.min(1, boxAspect / aspect), Math.min(1, aspect / boxAspect));
          } else {
            imageWidth = Math.min(rect.width - 36, (rect.height - 36) * aspect);
            imageHeight = imageWidth / aspect;
          }
          place(mesh, (rect.left + rect.width / 2 - workRect.left) / width,
            (rect.top + rect.height / 2 - workRect.top) / height, imageWidth / width * viewportWidth);
          mesh.scale.y = imageHeight / height * baseHeight;
          mesh.updateMatrixWorld();
        });
        layout(.6);
        heroCharacter.updateMatrixWorld();
        heroMuse.updateMatrixWorld();
        const startMatrix = heroCharacter.matrixWorld.clone();
        const museMatrix = heroMuse.matrixWorld.clone();
        layout(.96);
        nextCharacter.updateMatrixWorld();
        const endMatrix = nextCharacter.matrixWorld.clone();
        const visibleWork = workLayers.filter((mesh) => mesh.position.y + mesh.scale.y / 2 > -baseHeight / 2);
        const v = new THREE.Vector3();
        for (let i = 0; i < count; i++) {
          v.set(...(i % 2 ? museSamples[i] : startSamples[i]), 0)
            .applyMatrix4(i % 2 ? museMatrix : startMatrix).toArray(positions, i * 3);
          v.set(...endSamples[i], 0).applyMatrix4(endMatrix).toArray(targets, i * 3);
          v.toArray(workPositions, i * 3);
          const mesh = visibleWork[i % visibleWork.length] || workLayers[0];
          const index = workLayers.indexOf(mesh);
          const sample = workSamples[index][i];
          const uvScale = mesh.material.uniforms.uUvScale.value;
          v.set(Math.max(-.5, Math.min(.5, sample[0] / uvScale.x)), Math.max(-.5, Math.min(.5, sample[1] / uvScale.y)), 0)
            .applyMatrix4(mesh.matrixWorld).toArray(workTargets, i * 3);
        }
        particleGeometry.attributes.position.needsUpdate = true;
        particleGeometry.attributes.aTarget.needsUpdate = true;
        workGeometry.attributes.position.needsUpdate = true;
        workGeometry.attributes.aTarget.needsUpdate = true;
        update(progress);
      }
      root.classList.add("is-enhanced");
      resize();
      const playhead = { progress: 0 };
      timeline = gsap.timeline({ scrollTrigger: {
        trigger: root, pin: stage, start: "top top",
        end: () => `+=${Math.round(window.innerHeight * (window.innerWidth < 768 ? 2.5 : 3.6) / FIRST_TRANSITION_END)}`,
        scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
        onRefresh: resize,
      } });
      timeline.to(playhead, { progress: 1, duration: 1, ease: "none", onUpdate: () => update(playhead.progress) });
      trigger = timeline.scrollTrigger;
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
      resizeObserver.observe(workCopy);
      const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      const onPointerMove = (e) => {
        if (mobile || sampleJourney(progress).intro > 0.45) return;
        const rect = stage.getBoundingClientRect();
        mouse.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouse.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        dirty = true;
      };
      stage.addEventListener("pointermove", onPointerMove, { passive: true });
      cleanups.push(() => stage.removeEventListener("pointermove", onPointerMove));

      function render(now = 0) {
        if (disposed) return;
        const time = now * 0.001;
        if (sampleJourney(progress).intro < 0.45) {
          mouse.x += (mouse.targetX - mouse.x) * 0.06;
          mouse.y += (mouse.targetY - mouse.y) * 0.06;
          const pFade = Math.max(0, 1 - sampleJourney(progress).intro / 0.35);
          camera.position.x = baseCamX + mouse.x * 0.16 * pFade;
          camera.position.y = -mouse.y * 0.12 * pFade;
          camera.position.z = baseCamZ;
          camera.rotation.x = -mouse.y * 0.015 * pFade;
          camera.rotation.y = mouse.x * 0.02 * pFade;
          camera.rotation.z = baseRotZ;
          applyPaperFloat(time);
          dirty = true;
        }
        if (dirty && !document.hidden) { renderer.render(scene, camera); dirty = false; }
        frame = requestAnimationFrame(render);
      }
      render();
      const onAnchor = (event) => {
        const link = event.target.closest('a[href="#intro"], a[href="#about"], a[href="#work"]');
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const about = link.hash === "#about";
        const work = link.hash === "#work";
        const destination = work ? 1 : about ? ABOUT_PROGRESS : 0;
        const top = trigger.start + (trigger.end - trigger.start) * destination;
        pendingFocus = { progress: destination, element: root.querySelector(work ? "#work-title" : about ? "#about-title" : "#hero-title") };
        window.scrollTo({ top, behavior: work && event.isTrusted ? "smooth" : "instant" });
        ScrollTrigger.update();
        update(trigger.progress);
        history.replaceState(null, "", link.hash);
      };
      root.addEventListener("click", onAnchor);
      cleanups.push(() => root.removeEventListener("click", onAnchor));
      if (window.location.hash === "#about") {
        window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * ABOUT_PROGRESS, behavior: "instant" });
        ScrollTrigger.update();
      } else if (window.location.hash === "#work") {
        window.scrollTo({ top: trigger.end, behavior: "instant" });
        ScrollTrigger.update();
      }
      onReady();
    } catch (error) {
      if (disposed) return;
      console.warn("The cinematic view is unavailable; showing the static artwork.", error);
      dispose();
      onFailure();
    }
  }
  init();
  return dispose;
}
