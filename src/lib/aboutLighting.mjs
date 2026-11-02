import { Group, MathUtils, Mesh, PlaneGeometry, ShaderMaterial, Vector3, DoubleSide } from "three";
import { floorHeight } from "./aboutGeometry.mjs";

export function createAboutLighting() {
  const focus = { value: new Vector3(0, 1, -12) };
  const strength = { value: 0.7 };
  const group = new Group();
  group.name = "Active exhibit soft light";
  const vertexShader = `varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  function glow(fragmentShader) {
    return new ShaderMaterial({
      uniforms: { strength }, vertexShader,
      fragmentShader: `uniform float strength; varying vec2 vUv; ${fragmentShader}`,
      transparent: true, depthWrite: false, side: DoubleSide,
    });
  }
  const beam = new Mesh(new PlaneGeometry(8, 1), glow(`
    void main() {
      float spread = mix(0.4, 0.07, vUv.y);
      float feather = exp(-pow((vUv.x - 0.5) / spread, 2.0) * 3.0);
      float ends = smoothstep(0.0, 0.2, vUv.y) * (1.0 - smoothstep(0.88, 1.0, vUv.y));
      gl_FragColor = vec4(1.0, 0.72, 0.62, feather * ends * strength * 0.085);
    }`));
  const pool = new Mesh(new PlaneGeometry(9, 7), glow(`
    void main() {
      float radius = length((vUv - 0.5) * 2.0);
      float feather = exp(-radius * radius * 5.0) * (1.0 - smoothstep(0.75, 1.0, radius));
      gl_FragColor = vec4(1.0, 0.52, 0.4, feather * strength * 0.15);
    }`));
  pool.rotation.x = -Math.PI / 2 + Math.atan(floorHeight(1) - floorHeight(0));
  group.add(beam, pool);

  return {
    group, focus,
    materials: [beam.material, pool.material],
    // Basic materials preserve the graphic palette; a shared wash adds local light.
    illuminate(material, particle = false) {
      material.onBeforeCompile = shader => {
        shader.uniforms.exhibitFocus = focus;
        shader.uniforms.exhibitStrength = strength;
        shader.vertexShader = `varying vec3 vExhibitWorld;\n${shader.vertexShader}`.replace(
          "#include <begin_vertex>", "#include <begin_vertex>\nvExhibitWorld = (modelMatrix * vec4(position, 1.0)).xyz;",
        );
        shader.fragmentShader = `uniform vec3 exhibitFocus; uniform float exhibitStrength; varying vec3 vExhibitWorld;\n${shader.fragmentShader}`.replace(
          particle ? "#include <color_fragment>" : "#include <map_fragment>",
          `${particle ? "#include <color_fragment>" : "#include <map_fragment>"}
          float lightRadius = mix(3.5, 1.0, clamp((vExhibitWorld.y - exhibitFocus.y) / 5.0, 0.0, 1.0));
          vec2 lightDistance = (vExhibitWorld.xz - exhibitFocus.xz) / lightRadius;
          float wash = exp(-dot(lightDistance, lightDistance) * 1.6) * exhibitStrength;
          ${particle
            ? "diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.65, 0.48), wash * 0.8);"
            : "float pigment = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b)); diffuseColor.rgb += vec3(0.24, 0.075, 0.045) * wash * (0.15 + pigment);"}
          `,
        );
      };
      material.customProgramCacheKey = () => particle ? "exhibit-dust-v1" : "exhibit-wash-v1";
    },
    update(target, dt, reducedMotion, zoom, cameraPosition) {
      const blend = reducedMotion ? 1 : 1 - Math.exp(-Math.min(0.05, Math.max(0, dt)) * 7);
      focus.value.lerp(target, blend);
      strength.value = MathUtils.lerp(strength.value, 0.7 + MathUtils.clamp(zoom, 0, 1) * 0.65, blend);
      const { x, z } = focus.value;
      const bottom = floorHeight(-z);
      beam.position.set(x, (6.38 + bottom) / 2, z);
      beam.scale.y = 6.38 - bottom;
      beam.rotation.y = Math.atan2(cameraPosition.x - x, cameraPosition.z - z);
      pool.position.set(x, bottom + 0.025, z);
    },
  };
}
