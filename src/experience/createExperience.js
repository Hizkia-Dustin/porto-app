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
  const contactSection = root.querySelector("#contact");
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
    root.classList.remove("is-enhanced", "is-contact", "is-work");
    root.querySelectorAll("[data-copy]").forEach((el) => {
      el.removeAttribute("style");
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
    });
    stage.style.removeProperty("--progress");
    stage.style.removeProperty("--work-reveal");
    root.style.removeProperty("--work-overflow");
    root.style.removeProperty("--dial-turn");
    sceneFooter.style.removeProperty("opacity");
    sceneFooter.removeAttribute("aria-hidden");
    sceneFooter.inert = false;
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
      const [library, athens, ceiling] = await Promise.all([
        "astronomy-library", "school-of-athens", "celestial-ceiling",
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
      const nextArtwork = makeLayer(athens, 2);
      const heroArtwork = makeLayer(library, 3);
      const workMaps = [athens, ceiling, library, ceiling];
      const workLayers = workMaps.map((map) => makeLayer(map, 7));
      const workImages = [...workCopy.querySelectorAll(".work-image")];
      const count = 10000;
      const startSamples = sampleArtwork(library.image, count);
      const endSamples = sampleArtwork(athens.image, count);
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

      // The second passage reuses the same dissolve and particle shaders for the four manuscripts.
      const workSamples = workMaps.map((map) => sampleArtwork(map.image, count));
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
      function cover(mesh, zoom = 1) {
        const image = mesh.material.uniforms.uMap.value.image;
        const aspect = image.width / image.height;
        const boxAspect = viewportWidth / baseHeight;
        mesh.material.uniforms.uUvScale.value.set(Math.min(1, boxAspect / aspect), Math.min(1, aspect / boxAspect));
        place(mesh, .5, .5, viewportWidth * zoom);
        mesh.scale.y = baseHeight * zoom;
      }
      function layout(p) {
        const { approach, reconstruct } = sampleProgress(p);
        cover(heroArtwork, 1.04 + approach * .06);
        cover(nextArtwork, 1.04 + (1 - reconstruct) * .06);
      }
      const heroCopy = root.querySelector('[data-copy="hero"]');
      const bridgeCopy = root.querySelector('[data-copy="bridge"]');
      const aboutCopy = root.querySelector('[data-copy="about"]');
      const chapter = root.querySelector("[data-chapter]");
      const caption = root.querySelector("[data-caption]");
      function copy(el, visibility, offset) {
        el.style.opacity = visibility;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
        el.inert = visibility < .1;
        el.setAttribute("aria-hidden", visibility < .1 ? "true" : "false");
      }
      let baseCamX = 0, baseCamZ = 10, baseRotZ = 0;
      const sceneColor = new THREE.Color(0x111b1a), workColor = new THREE.Color(0x111b1a);
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
        heroArtwork.material.uniforms.uEdge.value = state.edge;
        heroArtwork.material.uniforms.uDissolve.value = state.dissolve;
        nextArtwork.material.uniforms.uReveal.value = state.reconstruct;
        nextArtwork.material.uniforms.uEdge.value = Math.max((1 - phase(journey.intro, .84, .98)) * .95, journey.edge);
        nextArtwork.material.uniforms.uDissolve.value = journey.dissolve;
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
        root.style.setProperty("--dial-turn", `${state.approach * 45}deg`);
        copy(workCopy, journey.workText, 0);
        workCopy.inert = journey.workText < .99;
        workCopy.style.visibility = journey.workText === 0 ? "hidden" : "visible";
        sceneFooter.style.opacity = 1 - journey.workText;
        sceneFooter.inert = journey.workText > .99;
        sceneFooter.setAttribute("aria-hidden", journey.workText > .99 ? "true" : "false");
        stage.style.setProperty("--progress", p);
        stage.style.setProperty("--work-reveal", journey.workText);
        root.classList.toggle("is-work", journey.workText > .99);
        chapter.textContent = journey.work > .7 ? "Selected work" : journey.intro < .78 ? "The Digital Codex" : "About & skills";
        caption.textContent = journey.work > .24 ? "Selected projects" : journey.intro < .8 ? "Scroll to continue" : "Scroll to view projects";
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
          const boxAspect = rect.width / rect.height;
          mesh.material.uniforms.uUvScale.value.set(Math.min(1, boxAspect / aspect), Math.min(1, aspect / boxAspect));
          place(mesh, (rect.left + rect.width / 2 - workRect.left) / width,
            (rect.top + rect.height / 2 - workRect.top) / height, imageWidth / width * viewportWidth);
          mesh.scale.y = imageHeight / height * baseHeight;
          mesh.updateMatrixWorld();
        });
        layout(.6);
        heroArtwork.updateMatrixWorld();
        const startMatrix = heroArtwork.matrixWorld.clone();
        layout(.96);
        nextArtwork.updateMatrixWorld();
        const endMatrix = nextArtwork.matrixWorld.clone();
        const visibleWork = workLayers.filter((mesh) => mesh.position.y + mesh.scale.y / 2 > -baseHeight / 2);
        const v = new THREE.Vector3();
        for (let i = 0; i < count; i++) {
          v.set(...startSamples[i], 0)
            .applyMatrix4(startMatrix).toArray(positions, i * 3);
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
        onRefresh: (self) => { resize(); update(self.progress); },
      } });
      timeline.to(playhead, { progress: 1, duration: 1, ease: "none", onUpdate: () => update(playhead.progress) });
      trigger = timeline.scrollTrigger;
      // Keep the Work chapter's full natural height before revealing the outro.
      const outro = gsap.timeline({ scrollTrigger: {
        trigger: contactSection, start: "top bottom", end: "top top",
        scrub: true, invalidateOnRefresh: true,
      } });
      outro.fromTo(contactSection.querySelector("[data-contact-reveal]"),
        { y: 70, opacity: .2 }, { y: 0, opacity: 1, ease: "none" }, 0);
      outro.fromTo(contactSection.querySelector(".contact-index"),
        { y: 45, opacity: .3 }, { y: 0, opacity: 1, ease: "none" }, 0);
      const contactHeader = ScrollTrigger.create({
        trigger: contactSection, start: "top 100px", end: "bottom top",
        toggleClass: { targets: root, className: "is-contact" },
      });
      cleanups.push(() => { outro.revert(); contactHeader.kill(); });
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
      resizeObserver.observe(workCopy);
      let refreshFrame;
      const workObserver = new ResizeObserver(() => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      workObserver.observe(workCopy);
      cleanups.push(() => { workObserver.disconnect(); cancelAnimationFrame(refreshFrame); });
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

      function render() {
        if (disposed) return;
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
          dirty = true;
        }
        if (dirty && !document.hidden) { renderer.render(scene, camera); dirty = false; }
        frame = requestAnimationFrame(render);
      }
      render();
      const onAnchor = (event) => {
        const link = event.target.closest('a[href="#intro"], a[href="#about"], a[href="#work"], a[href="#contact"]');
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (link.hash === "#contact") {
          pendingFocus = null;
          window.scrollTo({ top: window.scrollY + contactSection.getBoundingClientRect().top, behavior: event.isTrusted ? "smooth" : "instant" });
          root.querySelector("#contact-title").focus({ preventScroll: true });
          history.replaceState(null, "", link.hash);
          return;
        }
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
      } else if (window.location.hash === "#contact") {
        window.scrollTo({ top: window.scrollY + contactSection.getBoundingClientRect().top, behavior: "instant" });
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
