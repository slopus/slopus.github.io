var Stem = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // engine/engine-entry.ts
  var engine_entry_exports = {};
  __export(engine_entry_exports, {
    STEM_CELL_VARIANTS: () => STEM_CELL_VARIANTS,
    createStemCellEngine: () => createStemCellEngine,
    stemCellGeometry: () => stemCellGeometry,
    stemCellSmoothPath: () => stemCellSmoothPath,
    stemCellVariantFor: () => stemCellVariantFor
  });

  // engine/stemCellEngine.ts
  var TAU = Math.PI * 2;
  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function prng(seed) {
    let a = seed >>> 0;
    return () => {
      a = a + 1831565813 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function stemCellModel(id) {
    const padding = 0.06;
    const coreOffset = 0.11;
    const coreRadius = 0.105;
    const margin = 0.1;
    const rand = prng(hash(id));
    const between = (lo, hi) => lo + (hi - lo) * rand();
    const coreAngle = between(0, TAU);
    const coreDistance = coreOffset * Math.sqrt(rand());
    const core = {
      x: Math.cos(coreAngle) * coreDistance,
      y: Math.sin(coreAngle) * coreDistance,
      r: coreRadius * between(0.85, 1.15),
      a2: between(0.05, 0.12),
      p2: between(0, TAU),
      a3: between(0, 0.05),
      p3: between(0, TAU)
    };
    const coreShape = (t) => 1 + core.a2 * Math.cos(2 * t + core.p2) + core.a3 * Math.cos(3 * t + core.p3);
    const lobes = [3, 4, 4, 4, 5][Math.floor(rand() * 5)];
    const lobeAmp = between(0.13, 0.18) * (lobes === 5 ? 0.75 : 1);
    const lobePhase = between(0, TAU);
    const m = {
      L: lobes,
      a1: lobeAmp,
      a2: lobeAmp * between(0.08, 0.18),
      a3: between(0.02, 0.06),
      p3: between(0, TAU),
      a4: between(0.02, 0.06),
      p4: between(0, TAU),
      a5: between(0, 0.06),
      p5: between(0, TAU),
      p1: lobePhase
    };
    const membraneShape = (t) => 1 + m.a1 * Math.cos(m.L * t + m.p1) + m.a2 * Math.cos(2 * m.L * t + 2 * m.p1) + m.a3 * Math.cos((m.L - 1) * t + m.p3) + m.a4 * Math.cos((m.L + 1) * t + m.p4) + m.a5 * Math.cos(t + m.p5);
    let scale = 0.32;
    for (let i = 0; i < 48; i++) {
      const t = i / 48 * TAU;
      const rr = core.r * coreShape(t);
      const px = core.x + Math.cos(t) * rr;
      const py = core.y + Math.sin(t) * rr;
      const needed = (Math.hypot(px, py) + margin) / membraneShape(Math.atan2(py, px));
      if (needed > scale) scale = needed;
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < 32; i++) {
      const t = i / 32 * TAU;
      const rm = scale * membraneShape(t);
      const x = Math.cos(t) * rm;
      const y = Math.sin(t) * rm;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const fit = (1 - 2 * padding) / Math.max(maxX - minX, maxY - minY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return {
      x: 0.5 - cx * fit,
      y: 0.5 - cy * fit,
      r: scale * fit,
      harmonics: m,
      core: {
        x: 0.5 + (core.x - cx) * fit,
        y: 0.5 + (core.y - cy) * fit,
        r: core.r * fit,
        a2: core.a2,
        p2: core.p2,
        a3: core.a3,
        p3: core.p3
      }
    };
  }
  var SRGB_TO_LINEAR = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    SRGB_TO_LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  var toSrgb = (l) => {
    const c = Math.min(1, Math.max(0, l));
    return c <= 31308e-7 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };
  function colorToLinear(color) {
    return [SRGB_TO_LINEAR[color[0]], SRGB_TO_LINEAR[color[1]], SRGB_TO_LINEAR[color[2]]];
  }
  var mix3 = (a, b, t) => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t
  ];
  var clamp01 = (x) => x < 0 ? 0 : x > 1 ? 1 : x;
  var smoothstep = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  var easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  var lerp = (a, b, t) => a + (b - a) * t;
  function samplePoints(image, leafPx, size) {
    const S = 160;
    const c = new OffscreenCanvas(S, S);
    const g = c.getContext("2d", { willReadFrequently: true });
    if (!g) throw new StemCellUnavailable("No 2D context to read the icon");
    g.imageSmoothingQuality = "high";
    g.drawImage(image, 0, 0, S, S);
    const data = g.getImageData(0, 0, S, S).data;
    let opaque = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 128) opaque++;
    opaque = Math.max(opaque, 1);
    const targetCells = Math.min(
      1600,
      Math.max(1, opaque / (S * S) * Math.pow(size / leafPx, 2))
    );
    const spacing = Math.sqrt(2 * opaque / (Math.sqrt(3) * targetCells));
    const rowH = spacing * Math.sqrt(3) / 2;
    const rand = prng(7);
    const pts = [];
    for (let j = 0, y = rowH / 2; y < S; j++, y += rowH) {
      for (let x = (j % 2 ? spacing / 2 : 0) + spacing / 4; x < S; x += spacing) {
        const px = x + (rand() - 0.5) * spacing * 0.25;
        const py = y + (rand() - 0.5) * spacing * 0.25;
        let r = 0;
        let gg = 0;
        let b = 0;
        let a = 0;
        let n = 0;
        for (let sy = -2; sy <= 2; sy++) {
          for (let sx = -2; sx <= 2; sx++) {
            const qx = Math.round(px + sx * spacing * 0.22);
            const qy = Math.round(py + sy * spacing * 0.22);
            n++;
            if (qx < 0 || qy < 0 || qx >= S || qy >= S) continue;
            const o = (qy * S + qx) * 4;
            const al = data[o + 3] / 255;
            r += SRGB_TO_LINEAR[data[o]] * al;
            gg += SRGB_TO_LINEAR[data[o + 1]] * al;
            b += SRGB_TO_LINEAR[data[o + 2]] * al;
            a += al;
          }
        }
        if (a / n < 0.5) continue;
        pts.push({ x: px / S, y: py / S, color: [r / a, gg / a, b / a] });
      }
    }
    return { pts, spacing: spacing / S };
  }
  function buildLineage(points, seed, maxGenerations) {
    const { pts, spacing } = points;
    const rand = prng(hash(seed) ^ 2654435769);
    let maxDepth = 0;
    let nextId = 0;
    function build(list, depth) {
      let sx = 0;
      let sy = 0;
      let r = 0;
      let g = 0;
      let b = 0;
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const p of list) {
        sx += p.x;
        sy += p.y;
        r += p.color[0];
        g += p.color[1];
        b += p.color[2];
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
      const n = list.length;
      const area = 0.62 * spacing * Math.sqrt(n);
      const major = Math.max(maxX - minX, maxY - minY) / 2 + spacing / 2;
      const radius = Math.min(Math.max(area, Math.sqrt(area * major)), area * 1.35);
      const coreAngle = rand() * TAU;
      const node = {
        id: nextId++,
        depth,
        x: sx / n,
        y: sy / n,
        r: radius,
        color: [r / n, g / n, b / n],
        children: null,
        stagger: rand(),
        h: {
          L: [3, 4, 4, 4, 5][Math.floor(rand() * 5)],
          a1: lerp(0.03, 0.05, rand()),
          a2: 8e-3,
          a3: lerp(5e-3, 0.02, rand()),
          a4: lerp(5e-3, 0.02, rand()),
          a5: lerp(0, 0.02, rand()),
          p1: rand() * TAU,
          p3: rand() * TAU,
          p4: rand() * TAU,
          p5: rand() * TAU
        },
        core: {
          dx: Math.cos(coreAngle) * 0.22 * Math.sqrt(rand()),
          dy: Math.sin(coreAngle) * 0.22 * Math.sqrt(rand()),
          ratio: lerp(0.28, 0.36, rand()),
          a2: lerp(0.05, 0.12, rand()),
          p2: rand() * TAU,
          a3: lerp(0, 0.05, rand()),
          p3: rand() * TAU
        }
      };
      maxDepth = Math.max(maxDepth, depth);
      if (n > 1 && depth < maxGenerations) {
        const alongX = maxX - minX >= maxY - minY;
        list.sort(alongX ? (p, q) => p.x - q.x : (p, q) => p.y - q.y);
        const mid = n >> 1;
        node.children = [
          build(list.slice(0, mid), depth + 1),
          build(list.slice(mid), depth + 1)
        ];
      }
      return node;
    }
    const root = build(pts.slice(), 0);
    return { root, depth: maxDepth, count: pts.length, spacing };
  }
  function stemCellTimeline(depth, total) {
    const intro = total * 0.04;
    const divisionsEnd = total * 0.62;
    const budget = divisionsEnd - intro;
    const weights = [];
    for (let g = 0; g < depth; g++) {
      const k = depth <= 1 ? 0 : g / (depth - 1);
      weights.push(g === 0 ? 1.5 : 1 - 0.6 * Math.sqrt(k));
    }
    const sum = weights.reduce((x, y) => x + y, 0) || 1;
    const starts = [];
    const durs = [];
    let t = intro;
    for (const w of weights) {
      const d = w / sum * budget;
      starts.push(t);
      durs.push(d);
      t += d;
    }
    return { intro, starts, durs, divisionsEnd, end: total };
  }
  var STAGGER = 0.3;
  var DIVIDE = 0.7;
  var VERTEX = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
    vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
    gl_Position = vec4(aPos, 0.0, 1.0);
}`;
  var FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 outColor;

uniform highp sampler2D uCells;  // 10 RGBA32F texels per cell, one row each
uniform highp sampler2D uBins;   // per grid bin: (first index, count)
uniform highp sampler2D uIndex;  // cell ids, 1024 per row
uniform sampler2D uIcon;
uniform float uGrid;
uniform float uPx;
uniform float uFuse;
uniform float uMorph;
uniform float uWinLod;
uniform float uConverge;
uniform float uMaskLod;

vec4 cell(int c, int i) { return texelFetch(uCells, ivec2(i, c), 0); }

float smin(float a, float b, float k) {
    if (k <= 0.0) return min(a, b);
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
}

// The StemCell membrane: 1 + lobes + their octave + neighbours + a tilt.
float membrane(vec2 v, float r, vec4 h0, vec4 h1, vec4 h2) {
    float t = atan(v.y, v.x);
    float L = h0.x;
    float d = h1.z;
    float s = 1.0
        + h0.y * cos(L * t + h2.x + d)
        + h0.z * cos(2.0 * L * t + 2.0 * h2.x + d)
        + h0.w * cos((L - 1.0) * t + h2.y + d)
        + h1.x * cos((L + 1.0) * t + h2.z + d)
        + h1.y * cos(t + h2.w + d);
    return length(v) - r * s;
}

float core(vec2 v, float r, vec4 c, float drift) {
    float t = atan(v.y, v.x);
    return length(v) - r * (1.0 + c.x * cos(2.0 * t + c.y + drift) + c.z * cos(3.0 * t + c.w + drift));
}

void main() {
    vec2 p = vUv;
    int grid = int(uGrid);
    ivec2 b = clamp(ivec2(p * uGrid), ivec2(0), ivec2(grid - 1));
    vec4 bin = texelFetch(uBins, b, 0);
    int first = int(bin.x);
    int count = int(bin.y);

    // Nearest and second-nearest cell by signed distance.
    float d1 = 1e5;
    float d2 = 1e5;
    float da1 = 0.0;
    float db1 = 0.0;
    int c1 = -1;
    for (int i = 0; i < 256; i++) {
        if (i >= count) break;
        int j = first + i;
        int c = int(texelFetch(uIndex, ivec2(j % 1024, j / 1024), 0).r);
        vec4 t0 = cell(c, 0);
        vec4 t1 = cell(c, 1);
        vec4 h0 = cell(c, 6);
        vec4 h1 = cell(c, 7);
        vec4 h2 = cell(c, 8);
        float da = membrane(p - t0.xy, t1.x, h0, h1, h2);
        float db = membrane(p - t0.zw, t1.y, h0, h1, h2);
        float d = smin(da, db, t1.z);
        if (d < d1) {
            d2 = d1;
            d1 = d;
            c1 = c;
            da1 = da;
            db1 = db;
        } else if (d < d2) {
            d2 = d;
        }
    }

    vec4 cells = vec4(0.0);
    if (c1 >= 0) {
        vec4 t1 = cell(c1, 1);
        vec4 t2 = cell(c1, 2);
        vec4 t3 = cell(c1, 3);
        vec4 t4 = cell(c1, 4);
        vec4 t5 = cell(c1, 5);
        vec4 h1 = cell(c1, 7);
        vec4 ch = cell(c1, 9);
        // Seams that would cut across a thin stroke close as soon as the
        // tissue starts taking the icon's shape: a blurred icon alpha is low
        // where the icon is thin.
        float thick = smoothstep(0.6, 0.95, textureLod(uIcon, p, 3.0).a);
        float fuse = max(uFuse, (1.0 - thick) * smoothstep(0.0, 0.25, uConverge));
        float gap = t5.w * (1.0 - fuse);
        // Cells swell as they converge; the silhouette clip below keeps them
        // inside the icon, so this only fills gaps along thin strokes.
        float cover = clamp(0.5 - (d1 - 0.07 * uConverge) / uPx, 0.0, 1.0);
        // Neighbours press together but keep their own membranes, until the
        // tissue fuses.
        cover *= mix(smoothstep(gap - uPx, gap + uPx, d2 - d1), 1.0, fuse);
        // The new membrane between two daughters, opening as they separate.
        float inner = gap * t1.w;
        cover *= mix(1.0 - t1.w * (1.0 - smoothstep(inner - uPx, inner + uPx, abs(da1 - db1))), 1.0, fuse);

        float ca = core(p - t2.xy, t3.x, ch, h1.z);
        float cb = core(p - t2.zw, t3.y, ch, h1.z);
        float dc = smin(ca, cb, t3.z);
        float nucleus = clamp(0.5 - dc / uPx, 0.0, 1.0) * t3.w;
        vec3 color = mix(t4.rgb, t5.rgb, nucleus);
        // A window cell shows the icon behind it wherever the icon has paint.
        float win = cell(c1, 10).x;
        if (win > 0.0) {
            vec4 behind = textureLod(uIcon, p, uWinLod);
            vec3 seen = behind.rgb / max(behind.a, 1e-3);
            color = mix(color, seen, win * smoothstep(0.02, 0.35, behind.a));
        }
        // Converge: the tissue is pulled onto the icon's silhouette, first a
        // rough outline, then sharper, so thin strokes and holes form out of
        // the cells instead of appearing under them.
        float shapeA = textureLod(uIcon, p, uMaskLod).a;
        float thr = mix(0.03, 0.5, uConverge);
        float soft = mix(0.14, 0.08, uConverge);
        float shape = smoothstep(thr - soft, thr + soft, shapeA);
        cover *= mix(1.0, shape, smoothstep(0.0, 0.3, uConverge));
        float a = cover * t4.a;
        cells = vec4(color * a, a);
    }

    // The last moment hands over to the exact icon pixels.
    vec4 icon = textureLod(uIcon, p, 0.0);
    outColor = mix(cells, icon, uMorph);
}`;
  function compile(gl, type, source) {
    const s = gl.createShader(type);
    if (!s) throw new Error("Could not create a shader");
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  }
  var TEXELS = 11;
  var FLOATS = TEXELS * 4;
  var STEM_CELL_VARIANTS = {
    eight: { label: "8 cells", generations: 3, leafPx: 1.5, total: 2500 },
    sixteen: { label: "16 cells", generations: 4, leafPx: 1.5, total: 2500 },
    tissue: { label: "Tissue", generations: 11, leafPx: 3.5, total: 2500 }
  };
  function stemCellVariantFor(cssSize) {
    return cssSize <= 32 ? STEM_CELL_VARIANTS.eight : STEM_CELL_VARIANTS.sixteen;
  }
  var SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic|mesa offscreen/i;
  function stemCellRendererSoftware(renderer) {
    return SOFTWARE_RENDERER.test(renderer);
  }
  function stemCellAcceleration(gl) {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const value = gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
    const renderer = typeof value === "string" ? value : "";
    return { accelerated: !stemCellRendererSoftware(renderer), renderer };
  }
  var StemCellUnavailable = class extends Error {
  };
  function webgl2(canvas, attributes) {
    return typeof HTMLCanvasElement !== "undefined" && canvas instanceof HTMLCanvasElement ? canvas.getContext("webgl2", attributes) : canvas.getContext("webgl2", attributes);
  }
  function createStemCellEngine(canvas, options) {
    const id = options.id;
    const size = options.size;
    const variant = options.variant;
    const palette = options.palette;
    canvas.width = canvas.height = size;
    const context = webgl2(canvas, {
      premultipliedAlpha: true,
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      // Ask for no context at all rather than a software one.
      failIfMajorPerformanceCaveat: !options.allowSoftware
    });
    if (!context) throw new StemCellUnavailable("No hardware WebGL2 context");
    const gl = context;
    const acceleration = stemCellAcceleration(gl);
    if (!acceleration.accelerated && !options.allowSoftware)
      throw new StemCellUnavailable(`Software renderer: ${acceleration.renderer}`);
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.bindAttribLocation(program, 0, "aPos");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program) ?? "link");
    gl.useProgram(program);
    const u = (name) => gl.getUniformLocation(program, name);
    const uniforms = {
      cells: u("uCells"),
      bins: u("uBins"),
      index: u("uIndex"),
      icon: u("uIcon"),
      grid: u("uGrid"),
      px: u("uPx"),
      fuse: u("uFuse"),
      morph: u("uMorph"),
      winLod: u("uWinLod"),
      converge: u("uConverge"),
      maskLod: u("uMaskLod")
    };
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    function dataTexture(unit) {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }
    const cellsTex = dataTexture(0);
    const binsTex = dataTexture(1);
    const indexTex = dataTexture(2);
    const iconTex = dataTexture(3);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    gl.uniform1i(uniforms.cells, 0);
    gl.uniform1i(uniforms.bins, 1);
    gl.uniform1i(uniforms.index, 2);
    gl.uniform1i(uniforms.icon, 3);
    const stem = stemCellModel(id);
    const grid = Math.max(4, Math.min(48, Math.round(size / 10)));
    let cellData = new Float32Array(FLOATS * 64);
    let cellCount = 0;
    const cellBounds = [];
    const binsData = new Float32Array(grid * grid * 4);
    let lineage = null;
    let timeline = null;
    const colors = { membrane: colorToLinear(palette.membrane), core: colorToLinear(palette.core) };
    function differentiation(depth, maxDepth) {
      if (maxDepth <= 1) return depth >= 1 ? 1 : 0;
      return Math.pow(smoothstep(0.5, maxDepth, depth), 1.1);
    }
    function stemRest() {
      return {
        x: stem.x,
        y: stem.y,
        r: stem.r,
        h: stem.harmonics,
        ampScale: 1,
        cx: stem.core.x,
        cy: stem.core.y,
        cr: stem.core.r,
        ch: stem.core,
        membrane: colors.membrane,
        core: colors.core
      };
    }
    function restOf(node, maxDepth) {
      if (node.depth === 0) return stemRest();
      const k = differentiation(node.depth, maxDepth);
      const target = node.color;
      const coreTarget = colors.core[1] > colors.membrane[1] ? mix3(target, [1, 1, 1], 0.35) : [target[0] * 0.55, target[1] * 0.55, target[2] * 0.55];
      return {
        x: node.x,
        y: node.y,
        r: node.r,
        h: node.h,
        ampScale: 1,
        cx: node.x + node.core.dx * node.r,
        cy: node.y + node.core.dy * node.r,
        cr: node.r * node.core.ratio,
        ch: node.core,
        membrane: mix3(colors.membrane, target, k),
        core: mix3(colors.core, coreTarget, k)
      };
    }
    function pushCell(c) {
      if (cellData.length < (cellCount + 1) * FLOATS) {
        const next = new Float32Array(cellData.length * 2);
        next.set(cellData);
        cellData = next;
      }
      const o = cellCount * FLOATS;
      const f = cellData;
      f[o] = c.ax;
      f[o + 1] = c.ay;
      f[o + 2] = c.bx;
      f[o + 3] = c.by;
      f[o + 4] = c.ar;
      f[o + 5] = c.br;
      f[o + 6] = c.k;
      f[o + 7] = c.open;
      f[o + 8] = c.cax;
      f[o + 9] = c.cay;
      f[o + 10] = c.cbx;
      f[o + 11] = c.cby;
      f[o + 12] = c.car;
      f[o + 13] = c.cbr;
      f[o + 14] = c.ck;
      f[o + 15] = c.coreAlpha;
      f[o + 16] = toSrgb(c.membrane[0]);
      f[o + 17] = toSrgb(c.membrane[1]);
      f[o + 18] = toSrgb(c.membrane[2]);
      f[o + 19] = 1;
      f[o + 20] = toSrgb(c.core[0]);
      f[o + 21] = toSrgb(c.core[1]);
      f[o + 22] = toSrgb(c.core[2]);
      f[o + 23] = c.gap;
      const h = c.h;
      const s = c.ampScale;
      f[o + 24] = h.L;
      f[o + 25] = h.a1 * s;
      f[o + 26] = h.a2 * s;
      f[o + 27] = h.a3 * s;
      f[o + 28] = h.a4 * s;
      f[o + 29] = h.a5 * s;
      f[o + 30] = c.drift;
      f[o + 31] = 0;
      f[o + 32] = h.p1;
      f[o + 33] = h.p3;
      f[o + 34] = h.p4;
      f[o + 35] = h.p5;
      f[o + 36] = c.ch.a2;
      f[o + 37] = c.ch.p2;
      f[o + 38] = c.ch.a3;
      f[o + 39] = c.ch.p3;
      f[o + 40] = c.window ?? 0;
      f[o + 41] = 0;
      f[o + 42] = 0;
      f[o + 43] = 0;
      const amp = (h.a1 + h.a2 + h.a3 + h.a4 + h.a5) * s;
      const reach = Math.max(c.ar, c.br) * (1 + amp) + c.k * 0.3 + c.gap + 2 / size;
      cellBounds[cellCount] = [
        Math.min(c.ax, c.bx) - reach,
        Math.min(c.ay, c.by) - reach,
        Math.max(c.ax, c.bx) + reach,
        Math.max(c.ay, c.by) + reach
      ];
      cellCount++;
    }
    function gapFor(r) {
      return Math.min(1.6, Math.max(0.6, r * size * 0.07)) / size;
    }
    function coreVisibility(r) {
      return smoothstep(3.5, 9, r * size);
    }
    function restingCell(s, drift) {
      return {
        ax: s.x,
        ay: s.y,
        bx: s.x,
        by: s.y,
        ar: s.r,
        br: s.r,
        k: 0,
        open: 0,
        cax: s.cx,
        cay: s.cy,
        cbx: s.cx,
        cby: s.cy,
        car: s.cr,
        cbr: s.cr,
        ck: 0,
        coreAlpha: coreVisibility(s.r),
        membrane: s.membrane,
        core: s.core,
        gap: gapFor(s.r),
        h: s.h,
        ampScale: s.ampScale,
        ch: s.ch,
        drift
      };
    }
    const driftAt = (clock) => 0.2 * Math.sin(clock / 32e3 * TAU);
    function collect(plan, time, a, clock) {
      cellCount = 0;
      const drift = driftAt(clock);
      const regrow = variant.total * 0.18;
      const convergeAt = (ms) => clamp01((ms - time.divisionsEnd) / (time.end - time.divisionsEnd));
      const windowAt = (node) => {
        const q = convergeAt(a);
        const from = 0.04 + node.stagger * 0.22;
        return smoothstep(from, from + 0.3, q);
      };
      const nucleusFade = 1 - smoothstep(
        time.divisionsEnd - time.durs.at(-1) * 0.3,
        time.divisionsEnd + 0.1 * (time.end - time.divisionsEnd),
        a
      );
      const visit = (node, rest, bornAt) => {
        const g = node.depth;
        const canDivide = node.children !== null && g < time.starts.length;
        const start = canDivide ? time.starts[g] + node.stagger * STAGGER * time.durs[g] : Infinity;
        const length = canDivide ? DIVIDE * time.durs[g] : 1;
        const p = clamp01((a - start) / length);
        const s = bornAt !== null ? { ...rest, ampScale: smoothstep(0, regrow, a - bornAt) } : rest;
        if (p <= 0 || node.children === null) {
          const c = restingCell(s, drift);
          c.window = windowAt(node);
          c.coreAlpha *= nucleusFade;
          pushCell(c);
          return;
        }
        const [A, B] = node.children;
        const ra = restOf(A, plan.depth);
        const rb = restOf(B, plan.depth);
        if (p >= 1) {
          visit(A, ra, start + length);
          visit(B, rb, start + length);
          return;
        }
        const mc = easeInOut(smoothstep(0.12, 0.6, p));
        const ck = s.cr * 2.4 * smoothstep(0.04, 0.16, p) * (1 - smoothstep(0.36, 0.58, p));
        const coreCx = lerp(s.cx, s.x, smoothstep(0, 0.16, p));
        const coreCy = lerp(s.cy, s.y, smoothstep(0, 0.16, p));
        const m = easeInOut(smoothstep(0.22, 0.92, p));
        const k = s.r * 1.1 * smoothstep(0.02, 0.16, p) * (1 - smoothstep(0.46, 0.76, p));
        const pinch = 1 - 0.17 * smoothstep(0.42, 0.68, p) * (1 - smoothstep(0.8, 1, p));
        const colorT = smoothstep(0.3, 1, p);
        const membrane = mix3(
          mix3(s.membrane, ra.membrane, colorT),
          mix3(s.membrane, rb.membrane, colorT),
          0.5
        );
        const core = mix3(mix3(s.core, ra.core, colorT), mix3(s.core, rb.core, colorT), 0.5);
        const ax = lerp(s.x, ra.x, m);
        const ay = lerp(s.y, ra.y, m);
        const bx = lerp(s.x, rb.x, m);
        const by = lerp(s.y, rb.y, m);
        const swell = k > 0 ? 0.25 * k * clamp01(1 - Math.hypot(bx - ax, by - ay) / k) : 0;
        const ar = lerp(s.r, ra.r, m) * pinch - swell;
        const br = lerp(s.r, rb.r, m) * pinch - swell;
        const cax = lerp(coreCx, ra.cx, mc);
        const cay = lerp(coreCy, ra.cy, mc);
        const cbx = lerp(coreCx, rb.cx, mc);
        const cby = lerp(coreCy, rb.cy, mc);
        const coreSwell = ck > 0 ? 0.25 * ck * clamp01(1 - Math.hypot(cbx - cax, cby - cay) / ck) : 0;
        pushCell({
          ax,
          ay,
          bx,
          by,
          ar,
          br,
          k,
          open: smoothstep(0.7, 0.86, p),
          cax,
          cay,
          cbx,
          cby,
          car: lerp(s.cr, ra.cr, mc) - coreSwell,
          cbr: lerp(s.cr, rb.cr, mc) - coreSwell,
          ck,
          coreAlpha: coreVisibility(Math.max(ar, br)) * nucleusFade,
          membrane,
          core,
          gap: gapFor(Math.max(ar, br)),
          // Rounding up: a dividing cell loses its lobes.
          h: s.h,
          ampScale: s.ampScale * (1 - smoothstep(0, 0.16, p)),
          ch: s.ch,
          drift,
          window: windowAt(node)
        });
      };
      visit(plan.root, restOf(plan.root, plan.depth), null);
    }
    function upload() {
      const lists = Array.from({ length: grid * grid }, () => []);
      for (let c = 0; c < cellCount; c++) {
        const [x0, y0, x1, y1] = cellBounds[c];
        const bx0 = Math.max(0, Math.floor(x0 * grid));
        const bx1 = Math.min(grid - 1, Math.floor(x1 * grid));
        const by0 = Math.max(0, Math.floor(y0 * grid));
        const by1 = Math.min(grid - 1, Math.floor(y1 * grid));
        for (let by = by0; by <= by1; by++)
          for (let bx = bx0; bx <= bx1; bx++) lists[by * grid + bx].push(c);
      }
      let total = 0;
      for (let i = 0; i < lists.length; i++) {
        binsData[i * 4] = total;
        binsData[i * 4 + 1] = Math.min(lists[i].length, 256);
        total += lists[i].length;
      }
      const rows = Math.max(1, Math.ceil(total / 1024));
      const index = new Float32Array(rows * 1024);
      let o = 0;
      for (const list of lists) for (const c of list) index[o++] = c;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, cellsTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA32F,
        TEXELS,
        Math.max(1, cellCount),
        0,
        gl.RGBA,
        gl.FLOAT,
        cellData.subarray(0, Math.max(1, cellCount) * FLOATS)
      );
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, binsTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, grid, grid, 0, gl.RGBA, gl.FLOAT, binsData);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, indexTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, 1024, rows, 0, gl.RED, gl.FLOAT, index);
    }
    function draw(values) {
      upload();
      gl.viewport(0, 0, size, size);
      gl.uniform1f(uniforms.grid, grid);
      gl.uniform1f(uniforms.px, 1 / size);
      gl.uniform1f(uniforms.fuse, values.fuse ?? 0);
      gl.uniform1f(uniforms.morph, values.morph ?? 0);
      gl.uniform1f(uniforms.winLod, values.winLod ?? 0);
      gl.uniform1f(uniforms.converge, values.converge ?? 0);
      gl.uniform1f(uniforms.maskLod, values.maskLod ?? 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function setIcon(image) {
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, iconTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    function countLeaves(node) {
      return node.children ? countLeaves(node.children[0]) + countLeaves(node.children[1]) : 1;
    }
    return {
      acceleration,
      assign(image) {
        setIcon(image);
        lineage = buildLineage(
          samplePoints(image, variant.leafPx, size),
          id,
          variant.generations
        );
        timeline = stemCellTimeline(lineage.depth, variant.total);
        return {
          cells: countLeaves(lineage.root),
          generations: lineage.depth,
          durationMs: timeline.end
        };
      },
      renderWaiting(clock) {
        cellCount = 0;
        const c = restingCell(stemRest(), driftAt(clock));
        c.coreAlpha = 1;
        pushCell(c);
        draw({});
      },
      render(ms, clock = ms) {
        if (!lineage || !timeline) throw new Error("render() before assign()");
        if (ms >= timeline.end) {
          cellCount = 0;
          draw({ morph: 1 });
          return false;
        }
        collect(lineage, timeline, ms, clock);
        const q = clamp01(
          (ms - timeline.divisionsEnd) / (timeline.end - timeline.divisionsEnd)
        );
        draw({
          // Front-loaded, so the shape change spreads over the whole
          // convergence instead of bunching up at the end.
          converge: 1 - Math.pow(1 - q, 2.2),
          // Seams close once the cells have taken the icon's shape.
          fuse: smoothstep(0.25, 0.7, q),
          // The outline starts as a soft blob and tightens to the icon's edge.
          maskLod: 3.5 * Math.pow(1 - q, 2),
          winLod: 2 * (1 - smoothstep(0, 0.8, q)),
          // Only the last frames hand over to the exact icon pixels.
          morph: smoothstep(0.82, 0.96, q)
        });
        return true;
      },
      destroy() {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }

  // engine/stemCellGeometry.ts
  var TAU2 = Math.PI * 2;
  function hash2(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function prng2(seed) {
    let a = seed >>> 0;
    return () => {
      a = a + 1831565813 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function radial(harmonics, drift) {
    return (theta) => {
      let r = 1;
      for (const { k, a, phase } of harmonics) r += a * Math.cos(k * theta + phase + drift);
      return r;
    };
  }
  function stemCellGeometry(id, drift = 0) {
    const samples = 32;
    const padding = 0.06;
    const coreOffset = 0.11;
    const coreRadius = 0.105;
    const margin = 0.1;
    const rand = prng2(hash2(id));
    const between = (lo, hi) => lo + (hi - lo) * rand();
    const coreAngle = between(0, TAU2);
    const coreDistance = coreOffset * Math.sqrt(rand());
    const core = {
      x: Math.cos(coreAngle) * coreDistance,
      y: Math.sin(coreAngle) * coreDistance,
      r: coreRadius * between(0.85, 1.15),
      shape: radial(
        [
          { k: 2, a: between(0.05, 0.12), phase: between(0, TAU2) },
          { k: 3, a: between(0, 0.05), phase: between(0, TAU2) }
        ],
        drift
      )
    };
    const lobes = [3, 4, 4, 4, 5][Math.floor(rand() * 5)];
    const lobeAmp = between(0.13, 0.18) * (lobes === 5 ? 0.75 : 1);
    const lobePhase = between(0, TAU2);
    const membraneShape = radial(
      [
        { k: lobes, a: lobeAmp, phase: lobePhase },
        { k: 2 * lobes, a: lobeAmp * between(0.08, 0.18), phase: 2 * lobePhase },
        { k: lobes - 1, a: between(0.02, 0.06), phase: between(0, TAU2) },
        { k: lobes + 1, a: between(0.02, 0.06), phase: between(0, TAU2) },
        { k: 1, a: between(0, 0.06), phase: between(0, TAU2) }
      ],
      drift
    );
    let scale = 0.32;
    for (let i = 0; i < 48; i++) {
      const t = i / 48 * TAU2;
      const rr = core.r * core.shape(t);
      const px = core.x + Math.cos(t) * rr;
      const py = core.y + Math.sin(t) * rr;
      const needed = (Math.hypot(px, py) + margin) / membraneShape(Math.atan2(py, px));
      if (needed > scale) scale = needed;
    }
    const membranePoints = [];
    const corePoints = [];
    for (let i = 0; i < samples; i++) {
      const t = i / samples * TAU2;
      const rm = scale * membraneShape(t);
      membranePoints.push([Math.cos(t) * rm, Math.sin(t) * rm]);
      const rc = core.r * core.shape(t);
      corePoints.push([core.x + Math.cos(t) * rc, core.y + Math.sin(t) * rc]);
    }
    const xs = membranePoints.map((p) => p[0]);
    const ys = membranePoints.map((p) => p[1]);
    const [minX, maxX, minY, maxY] = [
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...ys),
      Math.max(...ys)
    ];
    const fit = (1 - 2 * padding) / Math.max(maxX - minX, maxY - minY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const place = ([x, y]) => [0.5 + (x - cx) * fit, 0.5 + (y - cy) * fit];
    return { membrane: membranePoints.map(place), core: corePoints.map(place) };
  }
  function stemCellSmoothPath(points, size) {
    const p = points.map(([x, y]) => [x * size, y * size]);
    const n = p.length;
    const f = (value) => value.toFixed(2);
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = p[(i - 1 + n) % n];
      const p1 = p[i];
      const p2 = p[(i + 1) % n];
      const p3 = p[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
    }
    return `${d}Z`;
  }
  return __toCommonJS(engine_entry_exports);
})();
