/*!
 * Powered by Paper Shaders: https://shaders.paper.design
 * https://github.com/paper-design/shaders
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Ported from slopus/happy at 0d226074d:
 * packages/happy-android/app/src/main/kotlin/com/slopus/happy/ui/start/GrainGradient.kt
 * packages/happy-ios/Sources/HappyUI/Start/GrainGradientView.swift
 * Their Paper Grain Gradient "corners" port fixes softness .5, intensity .5,
 * noise .25 and speed 1, replaces the noise texture with proceduralHash21,
 * and uses forward differences instead of fwidth. Those choices are retained.
 * Desktop changes: AGSL/Metal types to GLSL ES 1.00, gl_FragColor output,
 * and WebGL's already-upward fragment Y coordinate (no native Y inversion).
 *
 * Taken from slopus/happy-desktop at aa8e7a43:
 * packages/happy-desktop-ui/src/onboardingGrainShader.ts, the shader behind
 * desktop onboarding. Its noise, grain, and colour bands are unchanged. The
 * homepage replaces the corner shape in main(): the field is in page space, so
 * one surface runs the length of the page, its colour in slow swells along the
 * sides and, by surface, the top and bottom and blobs in the corners, with a
 * plain column down the middle; each half has noise of its own, blended across
 * the middle. The page shows one moment of it, `u_time`, drawn a piece at a time:
 * `u_origin` is the piece's top left in the page in device px, `u_ratio` device
 * pixels per CSS pixel, `u_width` and `u_height` the page's size in CSS px, and
 * the rest the surface (SurfaceShape in grainGradientRenderer.ts). Near the
 * page's ends it moves on by `u_elapsed` seconds: all the way in the first and
 * last `u_zone.x` and `u_zone.z` px, and not at all past a further `u_zone.y`
 * and `u_zone.w`, so the moving rows meet the still ones without a seam. With
 * `u_elapsed` 0 every row is the still.
 */
export const grainGradientFragmentShader = `
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_origin;
uniform float u_ratio;
uniform float u_time;
uniform float u_elapsed;
uniform vec4 u_zone;
uniform float u_width;
uniform float u_height;
uniform vec4 u_sides;
uniform vec4 u_ends;
uniform vec4 u_corners;
uniform vec2 u_shape;
uniform vec3 u_colorBack;
uniform vec3 u_color0;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

const float COUNT = 4.;
const float SOFTNESS = .5;
const float INTENSITY = .5;
const float NOISE = .25;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g = vec3(0.);
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float randomR(vec2 p) { return hash21(mod(floor(p), 100.)); }

float valueNoiseR(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 n) {
  float amplitude = 0.2;
  float total = 0.;
  for (int i = 0; i < 3; i++) {
    n = rotate(n, 0.3);
    total += valueNoiseR(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.6;
  }
  return total;
}

float grain(vec2 g, vec3 slow) {
  float baseNoise = snoise(g * .5);
  float grainDist = baseNoise * snoise(g * .2) - slow.x - slow.y;
  float rawNoise = .75 * baseNoise - (slow.z + fbm(rotate(.4 * g, 2.)));
  float noise = clamp(rawNoise, 0., 1.);
  return INTENSITY * 2. / COUNT * (grainDist + .5) + NOISE * 10. / COUNT * noise;
}

float band(float mixer, float aa) {
  return smoothstep(.5 - .5 * SOFTNESS - aa, .5 + .5 * SOFTNESS + aa, clamp(mixer, 0., 1.));
}

// Colour and grain for a point d CSS px from an edge whose colour reaches reach px in; the
// grain dissolves a little further than the colour.
vec2 rim(float d, float reach) {
  if (reach < 1.) return vec2(0.);
  return vec2(1. - smoothstep(0., reach, d), 1. - smoothstep(.6 * reach, 1.3 * reach + 40., d));
}

// One side's swell down the page: two long, slow octaves of noise, each side with its own.
float sideWave(float y, float wavelength, float t, float right) {
  return .8 * snoise(vec2(y / wavelength + 37. * right, .8 * t + 11. * right))
    + .2 * snoise(vec2(y / (.5 * wavelength) - 23. * right, t));
}

// A blob in a page corner, its radius wandering around it and over time.
vec2 blob(vec2 css, vec2 corner, float radius, float t, float seed) {
  if (radius < 1.) return vec2(0.);
  vec2 away = css - corner;
  float reach = radius * (1. + .3 * snoise(away / radius * 1.4 + vec2(seed, t)));
  return rim(length(away), reach);
}

void main() {
  // The page in device px, x from its left edge and y down from its top; and in CSS px.
  vec2 page = vec2(u_origin.x + gl_FragCoord.x, u_origin.y + u_resolution.y - gl_FragCoord.y);
  vec2 css = page / u_ratio;
  float moving = max(1. - smoothstep(u_zone.x, u_zone.x + u_zone.y, css.y), smoothstep(u_height - u_zone.z - u_zone.w, u_height - u_zone.z, css.y));
  float t = .1 * (u_time + moving * u_elapsed + 7.);
  float width = u_width;
  // 0 on the left half and 1 on the right, each half with noise of its own. Across the middle
  // the two are blended, so where colour crosses it (a corner patch on a narrow page) they never
  // meet in a line.
  float blend = min(.15 * width, 200.);
  float right = smoothstep(.5 * width - blend, .5 * width + blend, css.x);
  float edge = min(css.x, width - css.x);
  // 1 at a side edge, 0 down the middle.
  float outer = 1. - edge / (.5 * width);
  float wavelength = u_shape.y;

  // Each side's reach wanders, so the band swells and thins down the page in a few big shapes,
  // and the two sides do it differently.
  float wave = mix(sideWave(css.y, wavelength, t, 0.), sideWave(css.y, wavelength, t, 1.), right);
  vec2 side = mix(u_sides.xy, u_sides.zw, right);
  float margin = max(.5 * width - u_shape.x, 0.);
  vec2 colour = rim(edge, margin * clamp(side.x + side.y * wave, 0., .92));

  // The page's top and bottom, deepest at the sides and shallow over the middle.
  float across = snoise(vec2(css.x / (1.3 * wavelength) + 3., t));
  float valance = mix(.35, 1., outer);
  colour = max(colour, rim(css.y, max(u_ends.x + u_ends.y * across, 0.) * valance));
  colour = max(colour, rim(u_height - css.y, max(u_ends.z + u_ends.w * snoise(vec2(css.x / (1.3 * wavelength) - 9., t)), 0.) * valance));

  // The corners: the page's top two, and the bottom two at its end.
  colour = max(colour, blob(css, vec2(0., 0.), u_corners.x, t, 1.));
  colour = max(colour, blob(css, vec2(width, 0.), u_corners.y, t, 17.));
  colour = max(colour, blob(css, vec2(0., u_height), u_corners.z, t, 33.));
  colour = max(colour, blob(css, vec2(width, u_height), u_corners.w, t, 49.));

  // Everywhere else, the plain base colour.
  if (colour.y <= 0.) {
    gl_FragColor = vec4(u_colorBack, 1.);
    return;
  }
  float swell = mix(snoise(vec2(css.y / 1300., 2. * t)), snoise(vec2(css.y / 1300. - 5., 2. * t)), right);
  float shape = colour.x * mix(.75, 1.1, .5 + .5 * swell);
  float grained = colour.y;

  vec2 grain_uv = page * .7;
  vec3 slow = vec3(fbm(.002 * grain_uv + 10.), fbm(.003 * grain_uv), fbm(.001 * grain_uv));
  float added = grain(grain_uv, slow);
  shape += grained * added;
  float aa = grained * (abs(grain(grain_uv + vec2(.7, 0.), slow) - added) + abs(grain(grain_uv - vec2(0., .7), slow) - added));
  shape = clamp(shape - .5 / COUNT, 0., 1.);
  float totalShape = smoothstep(0., SOFTNESS + 2. * aa, clamp(shape * COUNT, 0., 1.));
  float mixer = shape * (COUNT - 1.);

  vec3 gradient = u_color0;
  gradient = mix(gradient, u_color1, band(mixer, aa));
  gradient = mix(gradient, u_color2, band(mixer - 1., aa));
  gradient = mix(gradient, u_color3, band(mixer - 2., aa));
  gl_FragColor = vec4(gradient * totalShape + u_colorBack * (1. - totalShape), 1.);
}
`;
