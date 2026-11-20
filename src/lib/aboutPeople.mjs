import {
  BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Matrix4,
  Mesh, Quaternion, Shape, SphereGeometry, Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { floorHeight } from "./aboutGeometry.mjs";

// Bake the figures and their equipment by material, so each station has only three draws.
function workshop(scene, name, x, z, angle, palette, contactShadow, build) {
  const parts = new Map();
  function put(geometry, surface) {
    if (!parts.has(surface)) parts.set(surface, []);
    const triangles = geometry.index ? geometry.toNonIndexed() : geometry;
    parts.get(surface).push(triangles);
    if (triangles !== geometry) geometry.dispose();
  }
  function box(x, y, z, w, h, d, surface, tilt = 0) {
    put(new BoxGeometry(w, h, d).rotateZ(tilt).translate(x, y, z), surface);
  }
  function oval(x, y, z, w, h, d, surface) {
    put(new SphereGeometry(1, 12, 8).scale(w, h, d).translate(x, y, z), surface);
  }
  const up = new Vector3(0, 1, 0);
  function rod(a, b, radiusA, radiusB, surface) {
    const start = new Vector3(...a);
    const end = new Vector3(...b);
    const direction = end.clone().sub(start);
    const geometry = new CylinderGeometry(radiusB, radiusA, direction.length(), 8);
    const rotation = new Quaternion().setFromUnitVectors(up, direction.normalize());
    geometry.applyMatrix4(new Matrix4().makeRotationFromQuaternion(rotation));
    geometry.translate(...start.lerp(end, 0.5).toArray());
    put(geometry, surface);
  }
  function plate(points, z, thickness, surface) {
    const shape = new Shape();
    points.forEach(([px, py], i) => i ? shape.lineTo(px, py) : shape.moveTo(px, py));
    shape.closePath();
    put(new ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false }).translate(0, 0, z), surface);
  }

  const {
    dark = palette.ink,
    shade = palette.ink,
    skin = palette.highlight,
    hair = dark,
    screen = palette.highlight,
    metal = palette.rim,
    accent = palette.rim,
  } = palette;
  const ink = dark;
  const rim = metal;
  const highlight = skin;

  // Side profiles face local +X. Hand and knee positions give each role its own gesture.
  function person({ hip, knees, feet, elbows, hands, lean = 0.08, cap = false }) {
    const [hx, hy] = hip;
    const sx = hx + lean;
    for (let side = 0; side < 2; side++) {
      const depth = side ? 0.15 : -0.15;
      const cloth = side ? dark : shade;
      const leg = [hx, hy, depth];
      const knee = [...knees[side], depth];
      const shoe = [feet[side], 0.1, depth];
      rod(leg, knee, 0.17, 0.12, cloth);
      rod(knee, shoe, 0.12, 0.08, cloth);
      box(shoe[0] + 0.075, 0.085, depth, 0.36, 0.17, 0.2, dark);
      const elbow = [...elbows[side], depth * 1.5];
      const hand = [...hands[side], depth * 1.5];
      rod([sx, hy + 0.65, depth], elbow, 0.14, 0.085, cloth);
      rod(elbow, hand, 0.085, 0.062, cloth);
      oval(...hand, 0.09, 0.07, 0.07, skin);
    }
    // Tailored jacket / torso
    plate([[hx-0.22,hy-0.06],[hx+0.21,hy-0.06],[sx+0.18,hy+0.58],
      [sx+0.09,hy+0.76],[sx-0.15,hy+0.73],[hx-0.26,hy+0.22]], -0.19, 0.38, dark);
    // Refined neck
    rod([sx,hy+0.67,0],[sx+0.05,hy+0.91,0],0.095,0.085,skin);
    // Architectural head silhouette
    oval(sx+0.04,hy+1.03,0,0.19,0.24,0.17,skin);
    // Subtle, elegant facial profile (contour sits flush with face)
    plate([[sx+0.16,hy+1.04],[sx+0.22,hy+1.00],[sx+0.16,hy+0.97]],-0.04,0.08,skin);
    // Clean hair
    oval(sx+0.01,hy+1.14,0,0.20,0.16,0.18,hair);
    if (cap) box(sx+0.18,hy+1.14,0,0.28,0.045,0.30,dark);
  }
  build({
    person, box, rod, oval, plate,
    dark, shade, skin, hair, screen, metal, accent,
    ink, rim, highlight,
  });
  const group = new Group();
  group.name = name;
  group.rotation.y = angle;
  group.position.set(x, floorHeight(-z), z);
  for (const [surface, geometries] of parts) {
    const mesh = new Mesh(mergeGeometries(geometries), surface);
    group.add(mesh);
    geometries.forEach(g => g.dispose());
  }
  scene.add(group);
  contactShadow(x, z, 3.7, 1.9, angle);
}

export function addMuseumPeople(scene, code, design, exhibits, palette, shadow) {
  const [, exhibition, events, social] = exhibits;
  function place(name, anchor, dx, dz, angle, build) {
    workshop(scene, name, anchor.x + dx, anchor.z + dz, angle, palette, shadow, build);
  }
  place("Developer at the keyboard", code, -2.2, 2.4, 0.55, ({ person, box, dark, screen, metal, accent }) => {
    person({
      hip: [-0.68, 0.84],
      knees: [[-0.14, 0.72], [-0.21, 0.69]],
      feet: [0.04, -0.24],
      elbows: [[-0.35, 1.12], [-0.44, 1.1]],
      hands: [[0.22, 1.17], [0.15, 1.16]],
      lean: 0.2,
    });
    // Task chair: dark ergonomic seat and backrest, metal hydraulic column & star base
    box(-0.7, 0.72, 0, 0.58, 0.10, 0.62, dark);
    box(-0.95, 1.05, 0, 0.08, 0.55, 0.56, dark);
    box(-0.7, 0.34, 0, 0.10, 0.64, 0.10, metal);
    box(-0.7, 0.04, 0, 0.60, 0.05, 0.60, metal);

    // Architectural workstation desk: sleek dark surface, graphite frame & legs
    box(0.54, 1.07, 0, 1.05, 0.07, 0.94, dark);
    box(0.72, 0.52, 0, 0.12, 1.02, 0.72, metal);
    box(0.12, 0.52, 0, 0.06, 1.02, 0.72, metal);

    // Laptop: metal unibody deck, dark display shell, crisp illuminated screen with red syntax line
    box(0.44, 1.13, 0, 0.52, 0.035, 0.64, metal);
    box(0.72, 1.42, 0, 0.04, 0.54, 0.64, dark, -0.16);
    box(0.70, 1.42, 0, 0.015, 0.48, 0.58, screen, -0.16);
    box(0.695, 1.45, 0, 0.018, 0.04, 0.42, accent, -0.16);
  });

  place("Artist at an easel", design, -2.8, 1.8, 0.50, ({ person, box, rod, dark, screen, metal, accent }) => {
    person({
      hip: [-0.53, 1.24],
      knees: [[-0.67, 0.63], [-0.27, 0.65]],
      feet: [-0.79, -0.18],
      elbows: [[-0.29, 1.55], [-0.17, 1.73]],
      hands: [[-0.05, 1.64], [0.31, 2.05]],
    });
    // Artist paintbrush with red paint on the tip
    rod([0.3, 2.04, 0.22], [0.62, 2.18, 0.12], 0.02, 0.01, metal);
    rod([0.62, 2.18, 0.12], [0.66, 2.20, 0.10], 0.012, 0.005, accent);

    // Studio tripod easel
    for (const depth of [-0.49, 0.49]) {
      rod([0.42, 0, depth], [0.86, 2.65, depth * 0.6], 0.045, 0.038, metal);
    }
    rod([1.37, 0, 0], [0.82, 2.35, 0], 0.045, 0.038, metal);

    // Stretched canvas on easel & tray
    box(0.72, 1.87, 0, 0.07, 1.28, 1.02, screen, -0.15);
    box(0.65, 1.26, 0, 0.24, 0.06, 1.16, dark);

    // Abstract graphic artwork on canvas: bold red signature mark, graphite structural strokes
    box(0.70, 1.95, -0.15, 0.075, 0.35, 0.25, accent, -0.15);
    box(0.70, 1.68, 0.18, 0.075, 0.28, 0.32, dark, -0.15);
    box(0.70, 2.12, 0.10, 0.075, 0.18, 0.18, metal, -0.15);
  });

  place("Crew hanging a framed print", exhibition, -3.8, 1.2, -0.18, ({ person, box, dark, screen, metal, accent }) => {
    person({
      hip: [-0.48, 1.27],
      knees: [[-0.62, 0.62], [-0.25, 0.65]],
      feet: [-0.74, -0.11],
      elbows: [[-0.22, 2.05], [-0.12, 2.19]],
      hands: [[0.31, 2.19], [0.26, 2.58]],
      cap: true,
    });
    // Gallery partition panel backing
    box(0.84, 1.39, -0.26, 1.12, 2.78, 0.10, dark);

    // Architectural gallery frame with white museum mat and red graphic poster
    box(0.84, 2.15, -0.15, 0.96, 0.88, 0.08, dark);
    box(0.84, 2.15, -0.09, 0.84, 0.76, 0.03, screen);
    box(0.84, 2.15, -0.065, 0.60, 0.52, 0.02, dark);
    box(0.84, 1.98, -0.060, 0.40, 0.06, 0.022, accent);

    // Crew step staging platform
    box(0.81, 0.06, -0.26, 1.36, 0.12, 0.65, metal);
  });

  place("Logistics crew and equipment cart", events, 4.0, 1.5, -0.25, ({ person, box, rod, dark, screen, metal, accent }) => {
    person({
      hip: [-0.78, 1.15],
      knees: [[-1.1, 0.59], [-0.41, 0.68]],
      feet: [-1.32, -0.32],
      elbows: [[-0.39, 1.56], [-0.32, 1.5]],
      hands: [[0.0, 1.38], [0.0, 1.38]],
      lean: 0.29,
      cap: true,
    });
    // Logistics flatbed cart
    box(0.72, 0.32, 0, 1.78, 0.08, 0.86, metal);
    for (const depth of [-0.34, 0.34]) {
      rod([0.03, 0.34, depth], [0, 1.39, depth], 0.035, 0.035, metal);
      for (const x of [0.08, 1.37]) {
        rod([x, 0.15, depth - 0.05], [x, 0.15, depth + 0.05], 0.14, 0.14, dark);
        rod([x, 0.15, depth - 0.06], [x, 0.15, depth + 0.06], 0.05, 0.05, metal);
      }
    }
    rod([0, 1.39, -0.34], [0, 1.39, 0.34], 0.04, 0.04, metal);

    // Touring flight cases
    // Case 1 (heavy base trunk)
    box(0.84, 0.65, 0, 1.27, 0.54, 0.72, dark);
    box(0.84, 0.82, 0, 1.29, 0.04, 0.74, metal);
    box(0.84, 0.65, 0.37, 0.24, 0.08, 0.03, accent);

    // Case 2 (top equipment box with manifest label)
    box(0.7, 1.12, 0, 0.88, 0.40, 0.72, dark);
    box(0.7, 1.12, 0.37, 0.30, 0.16, 0.015, screen);
  });

  place("Visitor recording the gallery", social, 3.6, 1.4, 2.75, ({ person, box, dark, screen, accent }) => {
    person({
      hip: [0, 1.24],
      knees: [[-0.2, 0.63], [0.12, 0.62]],
      feet: [-0.32, 0.17],
      elbows: [[0.06, 1.49], [0.26, 1.73]],
      hands: [[0.38, 1.63], [0.53, 2.12]],
    });
    // Visitor smartphone with glowing preview screen and red recording beacon
    box(0.55, 2.21, 0.22, 0.03, 0.30, 0.16, dark, -0.09);
    box(0.53, 2.21, 0.22, 0.01, 0.26, 0.14, screen, -0.09);
    box(0.525, 2.30, 0.25, 0.015, 0.035, 0.035, accent, -0.09);

    // Messenger camera bag
    box(-0.16, 1.12, 0.24, 0.44, 0.48, 0.14, dark, 0.12);
    box(-0.16, 1.12, 0.32, 0.08, 0.06, 0.025, accent, 0.12);
  });
}
