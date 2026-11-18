import * as THREE from "three";
import { projects } from "../data/projects.mjs";

// Peripheral spatial anchors around the tunnel so the central "WORK" sign remains visible.
const cardConfigs = [
  { x: -5.8, y: 2.7, width: 4.2, spin: [0.38, 0.46, 0.18] },
  { x: 6.1, y: -2.3, width: 4.4, spin: [-0.44, -0.38, 0.24] },
  { x: -6.5, y: -2.5, width: 4.1, spin: [0.35, -0.48, -0.2] },
  { x: 5.8, y: 2.9, width: 4.3, spin: [-0.38, 0.52, -0.22] },
  { x: -5.7, y: 0.5, width: 4.1, spin: [0.48, 0.36, 0.19] },
  { x: 6.4, y: -0.6, width: 4.2, spin: [-0.42, -0.45, 0.16] },
  { x: -3.8, y: 3.3, width: 3.9, spin: [0.32, -0.55, 0.26] },
  { x: 4.0, y: -3.1, width: 4.2, spin: [-0.5, 0.42, -0.22] },
];

function createBackCanvas(project, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");

  // Dark matte chassis base
  ctx.fillStyle = "#0a0d0c";
  ctx.fillRect(0, 0, 768, 480);

  // Subtle cyber grid dot matrix
  ctx.fillStyle = "rgba(75, 95, 85, 0.25)";
  for (let x = 24; x < 768; x += 32) {
    for (let y = 24; y < 480; y += 32) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // Outer framing with technical chamfer
  ctx.strokeStyle = "rgba(90, 115, 105, 0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, 736, 448);

  // Corner accent tick marks
  const tick = 14;
  ctx.strokeStyle = "#ff4c4c";
  ctx.lineWidth = 2.5;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(16, 16 + tick); ctx.lineTo(16, 16); ctx.lineTo(16 + tick, 16);
  // Top-right
  ctx.moveTo(752 - tick, 16); ctx.lineTo(752, 16); ctx.lineTo(752, 16 + tick);
  // Bottom-left
  ctx.moveTo(16, 464 - tick); ctx.lineTo(16, 464); ctx.lineTo(16 + tick, 464);
  // Bottom-right
  ctx.moveTo(752 - tick, 464); ctx.lineTo(752, 464); ctx.lineTo(752, 464 - tick);
  ctx.stroke();

  // Technical Header
  ctx.fillStyle = "#8a9e94";
  ctx.font = "13px monospace";
  ctx.fillText("SPEC // MONOLITH_NODE", 32, 46);
  ctx.textAlign = "right";
  ctx.fillText(`ID: [${project.id || index + 1}]`, 736, 46);

  // Central geometric wireframe emblem
  ctx.save();
  ctx.translate(384, 230);
  ctx.strokeStyle = "rgba(100, 130, 115, 0.6)";
  ctx.lineWidth = 1.5;

  // Concentric circle
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.stroke();

  // Dashed outer orbit
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, 96, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(-115, 0); ctx.lineTo(115, 0);
  ctx.moveTo(0, -115); ctx.lineTo(0, 115);
  ctx.stroke();

  // Central large project ID
  ctx.fillStyle = "#fafafa";
  ctx.font = "bold 44px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(project.id || `0${index + 1}`, 0, 0);
  ctx.restore();

  // Footer metadata
  ctx.fillStyle = "#8a9e94";
  ctx.font = "12px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`ARCHIVE: ${(project.title || "PROJECT").toUpperCase()}`, 32, 436);
  ctx.fillText(`CATEGORY: ${(project.category || "DESIGN EXPERIMENT").toUpperCase()}`, 32, 452);

  // Faux mini barcode on bottom right
  const barcodeX = 620;
  const barcodeY = 422;
  const bars = [3, 1, 4, 2, 5, 2, 1, 4, 2, 3, 1, 5, 2, 4];
  ctx.fillStyle = "rgba(220, 240, 230, 0.75)";
  let curX = barcodeX;
  bars.forEach(b => {
    ctx.fillRect(curX, barcodeY, b, 28);
    curX += b + 3;
  });

  return canvas;
}

function createFrontCanvas(project, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");

  // Base background
  ctx.fillStyle = "#0c100e";
  ctx.fillRect(0, 0, 768, 480);

  // Artwork placeholder block with project color
  ctx.fillStyle = project.color || "#19221e";
  ctx.fillRect(16, 16, 736, 400);

  // Bottom bezel
  ctx.fillStyle = "#0c100e";
  ctx.fillRect(0, 416, 768, 64);

  // Project title & category
  ctx.fillStyle = "#fafafa";
  ctx.font = "bold 18px monospace";
  ctx.fillText((project.title || `PROJECT ${index + 1}`).toUpperCase(), 24, 452);

  ctx.fillStyle = "#7b8c84";
  ctx.font = "13px monospace";
  ctx.fillText((project.category || "FEATURED WORK").toUpperCase(), 340, 452);

  ctx.fillStyle = "#fafafa";
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`[${project.id || index + 1}]`, 744, 452);

  // Top right badge
  ctx.fillStyle = "rgba(12, 16, 14, 0.75)";
  ctx.fillRect(590, 28, 142, 30);
  ctx.fillStyle = "#ff4c4c";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`SYS // 0${index + 1}`, 661, 48);

  return canvas;
}

export function createTunnelCards(scene, invalidate) {
  const group = new THREE.Group();
  const textures = [];
  const materials = [];
  const images = [];
  const cardObjects = [];
  let disposed = false;

  const total = cardConfigs.length;

  cardConfigs.forEach((cfg, index) => {
    const project = projects[index % projects.length];
    const width = cfg.width;
    const height = (width * 480) / 768;
    // Real physical thickness / volume (0.42 units thick)
    const depth = 0.42;

    const frontCanvas = createFrontCanvas(project, index);
    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    textures.push(frontTexture);

    const backCanvas = createBackCanvas(project, index);
    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    textures.push(backTexture);

    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: "#0c100e",
      transparent: true,
      opacity: 1,
    });
    const frontMaterial = new THREE.MeshBasicMaterial({
      map: frontTexture,
      transparent: true,
      opacity: 1,
    });
    const backMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      transparent: true,
      opacity: 1,
    });

    materials.push(edgeMaterial, frontMaterial, backMaterial);

    // Box face order in Three.js: [+X, -X, +Y, -Y, +Z (Front), -Z (Back)]
    const cardMaterials = [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      frontMaterial,
      backMaterial,
    ];

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const cardMesh = new THREE.Mesh(geometry, cardMaterials);

    // 3D Wireframe outline highlighting the volumetric chassis
    const edgeGeo = new THREE.EdgesGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: "#ff4c4c",
      transparent: true,
      opacity: 0.65,
    });
    materials.push(wireframeMat);
    const wireframe = new THREE.LineSegments(edgeGeo, wireframeMat);
    cardMesh.add(wireframe);

    group.add(cardMesh);

    // Load project image onto front canvas
    const image = new Image();
    images.push(image);
    image.onload = () => {
      if (disposed) return;
      const ctx = frontCanvas.getContext("2d");
      const crop = Math.max(736 / image.naturalWidth, 400 / image.naturalHeight);
      const sw = 736 / crop;
      const sh = 400 / crop;
      ctx.drawImage(
        image,
        (image.naturalWidth - sw) / 2,
        (image.naturalHeight - sh) / 2,
        sw,
        sh,
        16,
        16,
        736,
        400
      );
      frontTexture.needsUpdate = true;
      invalidate();
    };
    image.src = project.image;

    cardObjects.push({
      mesh: cardMesh,
      geometry,
      edgeGeo,
      materials: cardMaterials,
      wireframeMat,
      config: cfg,
      index,
    });
  });

  scene.add(group);

  let scrollSpinBoost = 0;
  let lastProgress = 0;

  return {
    update({ time = 0, cameraZ = 8, progress = 0, dt = 0.016, mouse = { x: 0, y: 0 }, reducedMotion = false }) {
      if (disposed) return;

      // Scroll delta boosts rotational velocity, then damps smoothly back to zero-gravity glide
      const progressDelta = Math.abs(progress - lastProgress);
      lastProgress = progress;
      scrollSpinBoost += progressDelta * 35;
      scrollSpinBoost = THREE.MathUtils.damp(scrollSpinBoost, 0, 5, dt);

      const tumbleTime = time * 0.95 + scrollSpinBoost + progress * 16;

      cardObjects.forEach(({ mesh, materials: mList, wireframeMat, config, index }) => {
        // Continuous fly-through along the Z axis towards the camera
        // Normalized loop progress [0..1]
        const speed = 0.038;
        const cycle = ((time * speed + progress * 0.85 + index / total) % 1 + 1) % 1;

        // Position along Z relative to camera: from deep in the tunnel up to camera plane
        const minZ = cameraZ - 56;
        const maxZ = cameraZ + 4.5;
        // Non-linear forward acceleration (perspektif: lambat di kejauhan, melesat saat mendekat)
        const zProgress = Math.pow(cycle, 1.22);
        const currentZ = minZ + zProgress * (maxZ - minZ);

        // Opacity envelope: muncul cepat dari titik lenyap, memudar halus saat lewat kamera
        const spawnFade = THREE.MathUtils.smoothstep(cycle, 0.0, 0.06);
        const exitFade = 1 - THREE.MathUtils.smoothstep(cycle, 0.88, 0.99);
        const opacity = THREE.MathUtils.clamp(spawnFade * exitFade, 0, 1);

        mesh.visible = opacity > 0.005;
        if (!mesh.visible) return;

        mList.forEach(m => {
          m.opacity = opacity;
        });
        wireframeMat.opacity = opacity * 0.65;

        // PERSPEKTIF NYATA: Skala dari mikro/sangat kecil (2%) mengembang dramatis jadi besar (145%)
        const scaleFactor = THREE.MathUtils.lerp(0.02, 1.45, Math.pow(cycle, 1.85));
        mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Lintasan Radial: Memancar keluar dari titik tengah (vanishing point [0,0]) ke tepi layar
        const spread = THREE.MathUtils.lerp(0.03, 1.55, Math.pow(cycle, 1.55));
        const swayAmp = THREE.MathUtils.lerp(0.04, 1.0, cycle);
        const swayX = Math.sin(time * 0.75 + index * 1.3) * 0.35 * swayAmp;
        const swayY = Math.cos(time * 0.85 + index * 1.5) * 0.28 * swayAmp;

        mesh.position.set(
          config.x * spread + swayX + (mouse.x || 0) * 0.45 * swayAmp,
          config.y * spread + swayY + (mouse.y || 0) * 0.35 * swayAmp,
          currentZ
        );

        // 3D Tumbling Physics (Pitch, Yaw, Roll)
        if (reducedMotion) {
          mesh.rotation.set(0.12, (index % 2 === 0 ? 0.22 : -0.22), 0.05);
        } else {
          const [spinX, spinY, spinZ] = config.spin;
          mesh.rotation.set(
            index * 0.9 + spinX * tumbleTime,
            index * 1.2 + spinY * tumbleTime,
            index * 0.6 + spinZ * tumbleTime
          );
        }
      });
    },

    dispose() {
      disposed = true;
      images.forEach(image => { image.onload = null; });
      scene.remove(group);
      cardObjects.forEach(({ geometry, edgeGeo }) => {
        geometry.dispose();
        edgeGeo.dispose();
      });
      textures.forEach(texture => texture.dispose());
      materials.forEach(material => material.dispose());
    },
  };
}
