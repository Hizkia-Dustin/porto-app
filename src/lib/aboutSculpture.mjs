  import { BoxGeometry, ExtrudeGeometry, Group, Mesh, Path, Shape } from "three";
import { floorHeight } from "./aboutGeometry.mjs";

// A cut-steel side profile. The open elbow and staggered feet read from across the room.
function photographerShape() {
  const s = new Shape();
  s.moveTo(-0.62, 0);
  s.lineTo(-0.36, 0.84);
  s.lineTo(-0.32, 1.36);
  s.quadraticCurveTo(-0.42, 1.53, -0.28, 1.96);
  s.quadraticCurveTo(-0.23, 2.17, -0.06, 2.2);
  s.lineTo(-0.03, 2.32);
  s.bezierCurveTo(-0.22, 2.55, -0.09, 2.78, 0.12, 2.76);
  s.quadraticCurveTo(0.32, 2.76, 0.34, 2.56);
  s.lineTo(0.4, 2.48);
  s.lineTo(0.34, 2.45);
  s.lineTo(0.33, 2.36);
  s.lineTo(0.19, 2.32);
  s.lineTo(0.17, 2.23);
  s.lineTo(0.42, 2.47);
  s.lineTo(0.63, 2.48);
  s.lineTo(0.59, 2.33);
  s.lineTo(0.42, 2.24);
  s.lineTo(0.31, 1.91);
  s.quadraticCurveTo(0.25, 1.8, 0.11, 1.86);
  s.lineTo(0.15, 1.4);
  s.lineTo(0.3, 0.78);
  s.lineTo(0.29, 0.15);
  s.lineTo(0.48, 0.08);
  s.lineTo(0.5, 0);
  s.lineTo(0.1, 0);
  s.lineTo(0.06, 0.7);
  s.lineTo(-0.1, 1.11);
  s.lineTo(-0.14, 0.66);
  s.lineTo(-0.39, 0.13);
  s.lineTo(-0.24, 0.08);
  s.lineTo(-0.23, 0);
  s.closePath();
  const elbow = new Path();
  elbow.moveTo(0.13, 2.12);
  elbow.lineTo(0.37, 2.31);
  elbow.lineTo(0.24, 2.01);
  elbow.closePath();
  s.holes.push(elbow);
  return s;
}

export function addArchiveFurniture(scene, obscura, paletteOrInk, accentOrShadow, maybeShadow) {
  const isPaletteObj = paletteOrInk && !paletteOrInk.isMaterial;
  const palette = isPaletteObj ? paletteOrInk : {
    dark: paletteOrInk,
    shade: paletteOrInk,
    metal: paletteOrInk,
    accent: accentOrShadow,
    screen: paletteOrInk,
  };
  const contactShadow = isPaletteObj ? accentOrShadow : maybeShadow;
  const { dark, shade = dark, metal = dark, accent, screen = dark } = palette;

  function slab(parent, dimensions, position, surface) {
    const piece = new Mesh(new BoxGeometry(...dimensions), surface);
    piece.position.set(...position);
    parent.add(piece);
  }

  const figure = new Group();
  const x = obscura.x - 4.55;
  const z = obscura.z + 1.7;
  figure.position.set(x, floorHeight(-z), z);
  figure.rotation.y = Math.atan2(z - obscura.z, obscura.x - x);
  const body = new ExtrudeGeometry(photographerShape(), {
    depth: 0.12, bevelEnabled: false, curveSegments: 6,
  });
  // Architectural cut-metal sculpture in dark charcoal with shade edges (no split red rim)
  const sculpture = new Mesh(body, [dark, shade]);
  figure.add(sculpture);

  // Precision telephoto camera & lens rig
  slab(figure, [0.34, 0.25, 0.29], [0.5, 2.54, 0.06], dark);     // Camera chassis
  slab(figure, [0.19, 0.16, 0.18], [0.73, 2.54, 0.06], metal);    // Graphite lens barrel
  slab(figure, [0.03, 0.18, 0.20], [0.78, 2.54, 0.06], accent);   // Iconic red lens ring
  slab(figure, [0.04, 0.20, 0.22], [0.84, 2.54, 0.06], metal);    // Lens hood
  slab(figure, [0.01, 0.16, 0.18], [0.86, 2.54, 0.06], screen);   // Front glass element
  slab(figure, [1.45, 0.09, 0.48], [-0.03, 0, 0.06], dark);       // Sculpture ground plinth
  scene.add(figure);
  contactShadow(x, z, 2.3, 1.15, figure.rotation.y);

  const bench = new Group();
  const bx = obscura.x + 4.35;
  const bz = obscura.z + 2.05;
  bench.position.set(bx, floorHeight(-bz), bz);
  bench.rotation.y = -0.31;
  const seatBottom = 0.66;
  // Modern gallery bench: dark architectural seat, subtle red reveal shadow line, metal legs
  slab(bench, [3.25, 0.14, 0.78], [0, seatBottom + 0.07, 0], dark);
  slab(bench, [3.10, 0.02, 0.70], [0, seatBottom - 0.01, 0], accent);
  for (const legX of [-1.18, 1.18]) {
    const footZ = bz - legX * Math.sin(bench.rotation.y);
    const footY = floorHeight(-footZ) - bench.position.y - 0.035;
    slab(bench, [0.13, seatBottom - footY, 0.62], [legX, (seatBottom + footY) / 2, 0], metal);
  }
  scene.add(bench);
  contactShadow(bx, bz, 4.05, 1.65, bench.rotation.y);
}
