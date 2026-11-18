import { getTheme, subscribeTheme } from "./theme";

// Recolor the existing draw calls, including canvas lettering and exhibit lights.
// Keeping a shared uniform avoids rebuilding geometry or resetting the camera.
export function bindSceneTheme(scene, renderer, { darkBackground, alpha = 1, invalidate }) {
  const light = { value: getTheme() === "light" ? 1 : 0 };
  const seen = new Set();
  scene.traverse((object) => {
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.filter(Boolean).forEach((material) => {
      if (seen.has(material)) return;
      seen.add(material);
      const compile = material.onBeforeCompile;
      const cacheKey = material.customProgramCacheKey();
      material.onBeforeCompile = (shader, gl) => {
        compile.call(material, shader, gl);
        shader.uniforms.hzLightTheme = light;
        shader.fragmentShader = `uniform float hzLightTheme;\n${shader.fragmentShader}`.replace(/}\s*$/, `
          if (hzLightTheme > 0.5) {
            vec3 pigment = gl_FragColor.rgb;
            float high = max(pigment.r, max(pigment.g, pigment.b));
            float low = min(pigment.r, min(pigment.g, pigment.b));
            float tint = smoothstep(0.025, 0.12, high - low);
            float neutral = dot(pigment, vec3(0.2126, 0.7152, 0.0722));
            float paper = min(high / 0.8863, 1.0);
            gl_FragColor.rgb = vec3(mix(neutral, paper, tint));
          }
        }`);
      };
      material.customProgramCacheKey = () => `${cacheKey}-hz-theme-v1`;
      material.needsUpdate = true;
    });
  });
  const update = () => {
    light.value = getTheme() === "light" ? 1 : 0;
    renderer.setClearColor(light.value ? "#fafafa" : darkBackground, alpha);
    invalidate();
  };
  update();
  return subscribeTheme(update);
}
