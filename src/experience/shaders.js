export const artworkVertex = /* glsl */ `
  varying vec2 vUv;
  uniform vec2 uUvScale;
  void main() {
    vUv = (uv - .5) * uUvScale + .5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const artworkFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uTexel;
  uniform vec3 uTint;
  uniform float uEdge;
  uniform float uDissolve;
  uniform float uReveal;
  uniform float uBackground;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
      mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
  }
  float luminance(vec2 offset) {
    vec4 c = texture2D(uMap, vUv + offset * uTexel);
    return dot(c.rgb, vec3(.299, .587, .114)) * c.a;
  }
  void main() {
    vec4 source = texture2D(uMap, vUv);
    float tl = luminance(vec2(-1., 1.)), tc = luminance(vec2(0., 1.)), tr = luminance(vec2(1., 1.));
    float ml = luminance(vec2(-1., 0.)), mr = luminance(vec2(1., 0.));
    float bl = luminance(vec2(-1., -1.)), bc = luminance(vec2(0., -1.)), br = luminance(vec2(1., -1.));
    float gx = -tl - 2. * ml - bl + tr + 2. * mr + br;
    float gy = -bl - 2. * bc - br + tl + 2. * tc + tr;
    float edge = smoothstep(.09, .8, length(vec2(gx, gy)));
    vec3 outline = vec3(.012, .019, .028) + vec3(.79, .87, 1.) * edge * mix(1.1, .4, uBackground);
    vec3 color = mix(source.rgb * uTint, outline, uEdge);
    float field = noise(vUv * 76.) * .65 + noise(vUv * 191.) * .35;
    float dissolve = smoothstep(uDissolve * 1.24 - .12, uDissolve * 1.24 + .02, field);
    float reveal = 1. - smoothstep(uReveal * 1.24 - .12, uReveal * 1.24 + .02, field);
    float rim = (1. - smoothstep(.0, .06, abs(field - uDissolve * 1.24)))
      * step(.01, uDissolve) * (1. - step(.99, uDissolve));
    color += vec3(.7, .8, 1.) * rim * edge * .35 * (1. - uBackground * .8);
    gl_FragColor = vec4(color, source.a * dissolve * reveal);
    #include <colorspace_fragment>
  }
`;

export const particleVertex = /* glsl */ `
  attribute vec3 aTarget;
  attribute vec3 aScatter;
  attribute float aSeed;
  uniform float uMorph;
  uniform float uVisibility;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    float arc = sin(uMorph * 3.14159265);
    vec3 p = mix(position, aTarget, uMorph) + aScatter * arc;
    p.x += sin(aSeed * 30. + uMorph * 9.) * arc * .5;
    p.y += cos(aSeed * 22. + uMorph * 7.) * arc * .25;
    vec4 view = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * view;
    gl_PointSize = clamp((1.6 + aSeed * 3.2) * uPixelRatio * 8. / -view.z, 1., 8.);
    vAlpha = uVisibility * (.7 + aSeed * .8);
    vSeed = aSeed;
  }
`;

export const particleFragment = /* glsl */ `
  varying float vAlpha;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - .5) * 2.;
    if (d > 1.) discard;
    float glow = pow(1. - d, 1.8);
    gl_FragColor = vec4(mix(vec3(.62, .76, 1.), vec3(1., .88, .62), vSeed), glow * vAlpha);
    #include <colorspace_fragment>
  }
`;
