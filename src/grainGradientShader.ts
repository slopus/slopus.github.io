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
 * one surface runs the length of the page, its colour at the left and right
 * edges and a plain column down the middle. `u_top` is the canvas's top in the
 * page and `u_ratio` its device pixels per CSS pixel.
 */
export const grainGradientFragmentShader = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_top;
uniform float u_ratio;
uniform float u_time;
uniform vec3 u_colorBack;
uniform vec3 u_color0;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

const float COUNT = 4.;
const float SOFTNESS = .5;
const float INTENSITY = .5;
const float NOISE = .25;
// Half the width, in CSS px, of the column down the middle of the page that stays plain.
const float CALM = 480.;

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

void main() {
  float t = .1 * (u_time + 7.);
  // The page, not the canvas: x from its left edge and y down from its top, in device px.
  vec2 page = vec2(gl_FragCoord.x, u_top + u_resolution.y - gl_FragCoord.y);
  float right = step(.5 * u_resolution.x, page.x);
  float y = page.y / u_ratio;
  // CSS px from the nearer side, and the room each side keeps outside the calm column.
  float edge = min(page.x, u_resolution.x - page.x) / u_ratio;
  float margin = max(.5 * u_resolution.x / u_ratio - CALM, 0.);
  float base = clamp(.06 * u_resolution.x / u_ratio, 18., 40.);
  // How far the colour reaches in wanders down the page and over time, each side on its own.
  float wave = .65 * snoise(vec2(y / 700. + 37. * right, 2. * t + 11. * right))
    + .35 * snoise(vec2(y / 260. - 23. * right, 3. * t));
  float reach = mix(.4, 1.2, clamp(.5 + .7 * wave, 0., 1.)) * margin + base;
  float fade = 1.6 * reach + 60.;
  // The calm column is the plain base colour.
  if (edge > fade) {
    gl_FragColor = vec4(u_colorBack, 1.);
    return;
  }
  float shape = 1. - smoothstep(0., reach, edge);
  shape *= mix(.75, 1.1, .5 + .5 * snoise(vec2(y / 1300. - 5. * right, 2. * t)));
  // The grain fades out with the colour, so the column never fills with specks.
  float grained = 1. - smoothstep(.6 * reach, fade, edge);

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
