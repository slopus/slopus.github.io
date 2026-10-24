/**
 * Stem cell -> icon, on the GPU. The rendering engine needs only a canvas (an
 * HTMLCanvasElement or an OffscreenCanvas), so it runs in a worker too.
 *
 * The founding cell is exactly C-298's StemCell: the same seeded membrane
 * harmonics, the same offset core, the same colours. When the item is given its
 * icon, the cell divides over and over. Every division splits the icon's own
 * pixels in half along their longer axis (a k-d tree over points sampled from
 * the icon), so each daughter migrates to the centroid of the half it owns and
 * takes on that half's average colour.
 *
 * One division: the cell rounds up, its core stretches and is pulled apart into
 * two, the membrane pinches at a cleavage furrow, and a new membrane opens
 * between the daughters.
 *
 * Rendering is one fragment-shader pass. Cells are signed-distance shapes; each
 * pixel belongs to the nearest cell (an additively weighted Voronoi), so
 * neighbours press against each other with a thin gap instead of overlapping.
 * The CPU only packs ~40 floats per cell into a texture and bins cells into a
 * coarse grid so each pixel tests a handful of cells, not all of them.
 */

const TAU = Math.PI * 2;

/** An sRGB colour as three 0–255 channels. */
export type StemCellColor = readonly [number, number, number];
type Linear = readonly [number, number, number];

/** The theme's `--stem-cell-membrane` and `--stem-cell-core`, resolved. */
export interface StemCellPalette {
    readonly membrane: StemCellColor;
    readonly core: StemCellColor;
}

// ---------------------------------------------------------------------------
// The StemCell model, ported from stemCellGeometry.ts.

function hash(text: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

function prng(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** A membrane's radial harmonics: lobes, their octave, two neighbours, and a tilt. */
export interface StemCellHarmonics {
    readonly L: number;
    readonly a1: number;
    readonly a2: number;
    readonly a3: number;
    readonly p3: number;
    readonly a4: number;
    readonly p4: number;
    readonly a5: number;
    readonly p5: number;
    readonly p1: number;
}

/** A core's radial harmonics. */
export interface StemCellCoreHarmonics {
    readonly a2: number;
    readonly p2: number;
    readonly a3: number;
    readonly p3: number;
}

/** The stem cell as an analytic shape, in 0..1 mark units. */
export interface StemCellModel {
    readonly x: number;
    readonly y: number;
    readonly r: number;
    readonly harmonics: StemCellHarmonics;
    readonly core: StemCellCoreHarmonics & {
        readonly x: number;
        readonly y: number;
        readonly r: number;
    };
}

/**
 * The same draw order and parameters as stemCellGeometry(), returned as an
 * analytic shape (centre, radius, harmonics) in 0..1 canvas units instead of
 * sampled points, so the shader draws the identical cell.
 */
export function stemCellModel(id: string): StemCellModel {
    const padding = 0.06;
    const coreOffset = 0.11;
    const coreRadius = 0.105;
    const margin = 0.1;
    const rand = prng(hash(id));
    const between = (lo: number, hi: number) => lo + (hi - lo) * rand();

    const coreAngle = between(0, TAU);
    const coreDistance = coreOffset * Math.sqrt(rand());
    const core = {
        x: Math.cos(coreAngle) * coreDistance,
        y: Math.sin(coreAngle) * coreDistance,
        r: coreRadius * between(0.85, 1.15),
        a2: between(0.05, 0.12),
        p2: between(0, TAU),
        a3: between(0.0, 0.05),
        p3: between(0, TAU),
    };
    const coreShape = (t: number) =>
        1 + core.a2 * Math.cos(2 * t + core.p2) + core.a3 * Math.cos(3 * t + core.p3);
    const lobes = [3, 4, 4, 4, 5][Math.floor(rand() * 5)]!;
    const lobeAmp = between(0.13, 0.18) * (lobes === 5 ? 0.75 : 1);
    const lobePhase = between(0, TAU);
    const m: StemCellHarmonics = {
        L: lobes,
        a1: lobeAmp,
        a2: lobeAmp * between(0.08, 0.18),
        a3: between(0.02, 0.06),
        p3: between(0, TAU),
        a4: between(0.02, 0.06),
        p4: between(0, TAU),
        a5: between(0.0, 0.06),
        p5: between(0, TAU),
        p1: lobePhase,
    };
    const membraneShape = (t: number) =>
        1 +
        m.a1 * Math.cos(m.L * t + m.p1) +
        m.a2 * Math.cos(2 * m.L * t + 2 * m.p1) +
        m.a3 * Math.cos((m.L - 1) * t + m.p3) +
        m.a4 * Math.cos((m.L + 1) * t + m.p4) +
        m.a5 * Math.cos(t + m.p5);

    let scale = 0.32;
    for (let i = 0; i < 48; i++) {
        const t = (i / 48) * TAU;
        const rr = core.r * coreShape(t);
        const px = core.x + Math.cos(t) * rr;
        const py = core.y + Math.sin(t) * rr;
        const needed = (Math.hypot(px, py) + margin) / membraneShape(Math.atan2(py, px));
        if (needed > scale) scale = needed;
    }
    // The original fits the bounding box of its 32 samples into the padded square.
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < 32; i++) {
        const t = (i / 32) * TAU;
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
            p3: core.p3,
        },
    };
}

// ---------------------------------------------------------------------------
// Colour.

const SRGB_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) {
    const c = i / 255;
    SRGB_TO_LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
const toSrgb = (l: number) => {
    const c = Math.min(1, Math.max(0, l));
    return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
};
function colorToLinear(color: StemCellColor): Linear {
    return [SRGB_TO_LINEAR[color[0]]!, SRGB_TO_LINEAR[color[1]]!, SRGB_TO_LINEAR[color[2]]!];
}
const mix3 = (a: Linear, b: Linear, t: number): Linear => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------------------------------------------------------------------------
// The icon's pixels -> one point per final cell -> the lineage tree.

/** What the engine can draw an icon from. */
export type StemCellIconSource = ImageBitmap | HTMLImageElement | OffscreenCanvas;

interface IconPoint {
    readonly x: number;
    readonly y: number;
    readonly color: Linear;
}

interface IconPoints {
    readonly pts: IconPoint[];
    readonly spacing: number;
}

function samplePoints(image: StemCellIconSource, leafPx: number, size: number): IconPoints {
    const S = 160;
    const c = new OffscreenCanvas(S, S);
    const g = c.getContext("2d", { willReadFrequently: true });
    if (!g) throw new StemCellUnavailable("No 2D context to read the icon");
    g.imageSmoothingQuality = "high";
    g.drawImage(image, 0, 0, S, S);
    const data = g.getImageData(0, 0, S, S).data;
    let opaque = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i]! > 128) opaque++;
    opaque = Math.max(opaque, 1);
    // One point per final cell, each about leafPx device pixels across.
    const targetCells = Math.min(
        1600,
        Math.max(1, (opaque / (S * S)) * Math.pow(size / leafPx, 2)),
    );
    const spacing = Math.sqrt((2 * opaque) / (Math.sqrt(3) * targetCells));
    const rowH = (spacing * Math.sqrt(3)) / 2;
    const rand = prng(7);

    const pts: IconPoint[] = [];
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
                    const al = data[o + 3]! / 255;
                    r += SRGB_TO_LINEAR[data[o]!]! * al;
                    gg += SRGB_TO_LINEAR[data[o + 1]!]! * al;
                    b += SRGB_TO_LINEAR[data[o + 2]!]! * al;
                    a += al;
                }
            }
            if (a / n < 0.5) continue;
            pts.push({ x: px / S, y: py / S, color: [r / a, gg / a, b / a] });
        }
    }
    return { pts, spacing: spacing / S };
}

interface LineageNode {
    readonly id: number;
    readonly depth: number;
    readonly x: number;
    readonly y: number;
    readonly r: number;
    readonly color: Linear;
    children: readonly [LineageNode, LineageNode] | null;
    readonly stagger: number;
    /** This cell's own membrane character. */
    readonly h: StemCellHarmonics;
    /** This cell's own core character. */
    readonly core: StemCellCoreHarmonics & {
        readonly dx: number;
        readonly dy: number;
        readonly ratio: number;
    };
}

interface Lineage {
    readonly root: LineageNode;
    readonly depth: number;
    readonly count: number;
    readonly spacing: number;
}

function buildLineage(points: IconPoints, seed: string, maxGenerations: number): Lineage {
    const { pts, spacing } = points;
    const rand = prng(hash(seed) ^ 0x9e3779b9);
    let maxDepth = 0;
    let nextId = 0;

    function build(list: IconPoint[], depth: number): LineageNode {
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
        // Generous radius: neighbours split the overlap between them, so this
        // only sets how far a cell reaches where it has no neighbour.
        const area = 0.62 * spacing * Math.sqrt(n);
        const major = Math.max(maxX - minX, maxY - minY) / 2 + spacing / 2;
        const radius = Math.min(Math.max(area, Math.sqrt(area * major)), area * 1.35);
        const coreAngle = rand() * TAU;
        const node: LineageNode = {
            id: nextId++,
            depth,
            x: sx / n,
            y: sy / n,
            r: radius,
            color: [r / n, g / n, b / n],
            children: null,
            stagger: rand(),
            h: {
                L: [3, 4, 4, 4, 5][Math.floor(rand() * 5)]!,
                a1: lerp(0.03, 0.05, rand()),
                a2: 0.008,
                a3: lerp(0.005, 0.02, rand()),
                a4: lerp(0.005, 0.02, rand()),
                a5: lerp(0, 0.02, rand()),
                p1: rand() * TAU,
                p3: rand() * TAU,
                p4: rand() * TAU,
                p5: rand() * TAU,
            },
            core: {
                dx: Math.cos(coreAngle) * 0.22 * Math.sqrt(rand()),
                dy: Math.sin(coreAngle) * 0.22 * Math.sqrt(rand()),
                ratio: lerp(0.28, 0.36, rand()),
                a2: lerp(0.05, 0.12, rand()),
                p2: rand() * TAU,
                a3: lerp(0, 0.05, rand()),
                p3: rand() * TAU,
            },
        };
        maxDepth = Math.max(maxDepth, depth);
        if (n > 1 && depth < maxGenerations) {
            const alongX = maxX - minX >= maxY - minY;
            list.sort(alongX ? (p, q) => p.x - q.x : (p, q) => p.y - q.y);
            const mid = n >> 1;
            node.children = [
                build(list.slice(0, mid), depth + 1),
                build(list.slice(mid), depth + 1),
            ];
        }
        return node;
    }
    const root = build(pts.slice(), 0);
    return { root, depth: maxDepth, count: pts.length, spacing };
}

/** When each generation divides, in ms after the icon is assigned. */
export interface StemCellTimeline {
    readonly intro: number;
    readonly starts: readonly number[];
    readonly durs: readonly number[];
    readonly divisionsEnd: number;
    readonly end: number;
}

/**
 * Everything fits in `total` ms. Divisions take the first ~62% (the first
 * cleavage gets the most room, since it is the one people actually see); the
 * rest is the tissue converging onto the icon's shape.
 */
export function stemCellTimeline(depth: number, total: number): StemCellTimeline {
    const intro = total * 0.04;
    const divisionsEnd = total * 0.62;
    const budget = divisionsEnd - intro;
    const weights: number[] = [];
    for (let g = 0; g < depth; g++) {
        const k = depth <= 1 ? 0 : g / (depth - 1);
        weights.push(g === 0 ? 1.5 : 1 - 0.6 * Math.sqrt(k));
    }
    const sum = weights.reduce((x, y) => x + y, 0) || 1;
    const starts: number[] = [];
    const durs: number[] = [];
    let t = intro;
    for (const w of weights) {
        const d = (w / sum) * budget;
        starts.push(t);
        durs.push(d);
        t += d;
    }
    return { intro, starts, durs, divisionsEnd, end: total };
}

/** Share of a generation's window a cell may wait before it starts dividing. */
const STAGGER = 0.3;
/** Share of the window a single division takes. */
const DIVIDE = 0.7;

// ---------------------------------------------------------------------------
// GPU.

const VERTEX = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
    vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
    gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
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

function compile(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
    const s = gl.createShader(type);
    if (!s) throw new Error("Could not create a shader");
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
}

const TEXELS = 11;
const FLOATS = TEXELS * 4;

/**
 * How a stem cell becomes its icon. All of them take `total` ms.
 * - generations: how many times the founding cell divides (2^n cells at most).
 * - leafPx: how small the last cells may get, in device pixels.
 */
export interface StemCellVariant {
    readonly label: string;
    readonly generations: number;
    readonly leafPx: number;
    readonly total: number;
}

export const STEM_CELL_VARIANTS = {
    eight: { label: "8 cells", generations: 3, leafPx: 1.5, total: 2500 },
    sixteen: { label: "16 cells", generations: 4, leafPx: 1.5, total: 2500 },
    tissue: { label: "Tissue", generations: 11, leafPx: 3.5, total: 2500 },
} as const satisfies Record<string, StemCellVariant>;

/** 8 cells where the mark is a 20px lane, 16 where it has room. */
export function stemCellVariantFor(cssSize: number): StemCellVariant {
    return cssSize <= 32 ? STEM_CELL_VARIANTS.eight : STEM_CELL_VARIANTS.sixteen;
}

const SOFTWARE_RENDERER =
    /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic|mesa offscreen/i;

/** Whether a WebGL renderer string names a CPU rasteriser rather than a GPU. */
export function stemCellRendererSoftware(renderer: string): boolean {
    return SOFTWARE_RENDERER.test(renderer);
}

export interface StemCellAcceleration {
    readonly accelerated: boolean;
    readonly renderer: string;
}

/**
 * Whether this context is drawn by a real GPU. A software rasteriser would run
 * the whole shader on the CPU, so the animation is skipped there.
 */
export function stemCellAcceleration(gl: WebGL2RenderingContext): StemCellAcceleration {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const value: unknown = gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
    const renderer = typeof value === "string" ? value : "";
    return { accelerated: !stemCellRendererSoftware(renderer), renderer };
}

/** No WebGL2, or only a software one: the icon is shown without the animation. */
export class StemCellUnavailable extends Error {}

export interface StemCellEngineOptions {
    /** The item's id, which seeds its stem cell exactly as `<StemCell id>` does. */
    readonly id: string;
    /** The canvas's side in device pixels. */
    readonly size: number;
    readonly palette: StemCellPalette;
    readonly variant: StemCellVariant;
    /** Draw on a software rasteriser too. For the Blueprint and verification only. */
    readonly allowSoftware?: boolean;
}

export interface StemCellAssignment {
    readonly cells: number;
    readonly generations: number;
    readonly durationMs: number;
}

export interface StemCellEngine {
    readonly acceleration: StemCellAcceleration;
    /** Prepare the division plan for `image`. */
    assign(image: StemCellIconSource): StemCellAssignment;
    /** The stem cell as it waits; `clock` drives its slow drift. */
    renderWaiting(clock: number): void;
    /** Draw `ms` after assignment. Returns false once the icon has fully formed. */
    render(ms: number, clock?: number): boolean;
    destroy(): void;
}

interface Uniforms {
    readonly fuse?: number;
    readonly morph?: number;
    readonly winLod?: number;
    readonly converge?: number;
    readonly maskLod?: number;
}

/** One cell's pose as it rests. */
interface Rest {
    readonly x: number;
    readonly y: number;
    readonly r: number;
    readonly h: StemCellHarmonics;
    readonly ampScale: number;
    readonly cx: number;
    readonly cy: number;
    readonly cr: number;
    readonly ch: StemCellCoreHarmonics;
    readonly membrane: Linear;
    readonly core: Linear;
}

/** One drawn cell: either resting (A = B) or dividing into A and B. */
interface DrawnCell {
    ax: number;
    ay: number;
    bx: number;
    by: number;
    ar: number;
    br: number;
    k: number;
    open: number;
    cax: number;
    cay: number;
    cbx: number;
    cby: number;
    car: number;
    cbr: number;
    ck: number;
    coreAlpha: number;
    membrane: Linear;
    core: Linear;
    gap: number;
    h: StemCellHarmonics;
    ampScale: number;
    ch: StemCellCoreHarmonics;
    drift: number;
    window?: number;
}

type Bounds = readonly [number, number, number, number];

/** A WebGL2 context on either kind of canvas; there is no element in a worker. */
export function webgl2(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    attributes: WebGLContextAttributes,
): WebGL2RenderingContext | null {
    return typeof HTMLCanvasElement !== "undefined" && canvas instanceof HTMLCanvasElement
        ? canvas.getContext("webgl2", attributes)
        : (canvas as OffscreenCanvas).getContext("webgl2", attributes);
}

/**
 * A clock-free renderer: the caller says what moment to draw. Throws
 * StemCellUnavailable without WebGL2 or a real GPU.
 */
export function createStemCellEngine(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    options: StemCellEngineOptions,
): StemCellEngine {
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
        failIfMajorPerformanceCaveat: !options.allowSoftware,
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
    const u = (name: string) => gl.getUniformLocation(program, name);
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
        maskLod: u("uMaskLod"),
    };

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    function dataTexture(unit: number): WebGLTexture {
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
    const cellBounds: Bounds[] = [];
    const binsData = new Float32Array(grid * grid * 4);

    /** Set by assign(). */
    let lineage: Lineage | null = null;
    let timeline: StemCellTimeline | null = null;

    const colors = { membrane: colorToLinear(palette.membrane), core: colorToLinear(palette.core) };

    function differentiation(depth: number, maxDepth: number): number {
        // Undecided for the first cleavages, then committing to colour.
        if (maxDepth <= 1) return depth >= 1 ? 1 : 0;
        return Math.pow(smoothstep(0.5, maxDepth, depth), 1.1);
    }

    function stemRest(): Rest {
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
            core: colors.core,
        };
    }

    function restOf(node: LineageNode, maxDepth: number): Rest {
        if (node.depth === 0) return stemRest();
        const k = differentiation(node.depth, maxDepth);
        const target = node.color;
        // The core reads against its membrane the same way the stem cell's does:
        // lighter on the dark theme, darker on the light one.
        const coreTarget: Linear =
            colors.core[1] > colors.membrane[1]
                ? mix3(target, [1, 1, 1], 0.35)
                : [target[0] * 0.55, target[1] * 0.55, target[2] * 0.55];
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
            core: mix3(colors.core, coreTarget, k),
        };
    }

    function pushCell(c: DrawnCell): void {
        if (cellData.length < (cellCount + 1) * FLOATS) {
            const next = new Float32Array(cellData.length * 2);
            next.set(cellData);
            cellData = next;
        }
        const o = cellCount * FLOATS;
        const f = cellData;
        // 0: site A, site B
        f[o] = c.ax;
        f[o + 1] = c.ay;
        f[o + 2] = c.bx;
        f[o + 3] = c.by;
        // 1: radii, membrane smooth-union, inner membrane opening
        f[o + 4] = c.ar;
        f[o + 5] = c.br;
        f[o + 6] = c.k;
        f[o + 7] = c.open;
        // 2: core A, core B
        f[o + 8] = c.cax;
        f[o + 9] = c.cay;
        f[o + 10] = c.cbx;
        f[o + 11] = c.cby;
        // 3: core radii, core smooth-union, core visibility
        f[o + 12] = c.car;
        f[o + 13] = c.cbr;
        f[o + 14] = c.ck;
        f[o + 15] = c.coreAlpha;
        // 4: membrane colour, alpha
        f[o + 16] = toSrgb(c.membrane[0]);
        f[o + 17] = toSrgb(c.membrane[1]);
        f[o + 18] = toSrgb(c.membrane[2]);
        f[o + 19] = 1;
        // 5: core colour, gap
        f[o + 20] = toSrgb(c.core[0]);
        f[o + 21] = toSrgb(c.core[1]);
        f[o + 22] = toSrgb(c.core[2]);
        f[o + 23] = c.gap;
        // 6-8: membrane harmonics
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
        // 9: core harmonics
        f[o + 36] = c.ch.a2;
        f[o + 37] = c.ch.p2;
        f[o + 38] = c.ch.a3;
        f[o + 39] = c.ch.p3;
        // 10: how much of the icon shows through this cell
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
            Math.max(c.ay, c.by) + reach,
        ];
        cellCount++;
    }

    function gapFor(r: number): number {
        // A membrane line a little under a device pixel to 1.6px, by cell size.
        return Math.min(1.6, Math.max(0.6, r * size * 0.07)) / size;
    }

    function coreVisibility(r: number): number {
        return smoothstep(3.5, 9, r * size);
    }

    function restingCell(s: Rest, drift: number): DrawnCell {
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
            drift,
        };
    }

    /** The waiting cell's slow 32 s phase drift, as the CSS version does it. */
    const driftAt = (clock: number) => 0.2 * Math.sin((clock / 32000) * TAU);

    function collect(plan: Lineage, time: StemCellTimeline, a: number, clock: number): void {
        cellCount = 0;
        const drift = driftAt(clock);
        const regrow = variant.total * 0.18;

        /** 0..1 through the convergence that follows the last division. */
        const convergeAt = (ms: number) =>
            clamp01((ms - time.divisionsEnd) / (time.end - time.divisionsEnd));

        const windowAt = (node: LineageNode) => {
            // Each cell opens onto the icon at its own moment early in convergence.
            const q = convergeAt(a);
            const from = 0.04 + node.stagger * 0.22;
            return smoothstep(from, from + 0.3, q);
        };

        // Cores dissolve before the icon's shading reaches them.
        const nucleusFade =
            1 -
            smoothstep(
                time.divisionsEnd - time.durs.at(-1)! * 0.3,
                time.divisionsEnd + 0.1 * (time.end - time.divisionsEnd),
                a,
            );

        const visit = (node: LineageNode, rest: Rest, bornAt: number | null): void => {
            const g = node.depth;
            const canDivide = node.children !== null && g < time.starts.length;
            const start = canDivide
                ? time.starts[g]! + node.stagger * STAGGER * time.durs[g]!
                : Infinity;
            const length = canDivide ? DIVIDE * time.durs[g]! : 1;
            const p = clamp01((a - start) / length);

            // A newborn cell grows its own lobes back after rounding up to divide.
            const s: Rest =
                bornAt !== null ? { ...rest, ampScale: smoothstep(0, regrow, a - bornAt) } : rest;

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

            // 1. Round up: the cell drops its lobes and draws its core to the middle.
            // 2. The core stretches along the division axis, pinches, and tears in two.
            // 3. The membrane follows: it elongates, a cleavage furrow pinches the
            //    waist, and a new membrane closes between the daughters.
            // 4. The daughters relax and press flat against each other.
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
                0.5,
            );
            const core = mix3(mix3(s.core, ra.core, colorT), mix3(s.core, rb.core, colorT), 0.5);
            const ax = lerp(s.x, ra.x, m);
            const ay = lerp(s.y, ra.y, m);
            const bx = lerp(s.x, rb.x, m);
            const by = lerp(s.y, rb.y, m);
            // A smooth union swells where both halves overlap; while they still
            // coincide that is the whole cell, so give the swelling back.
            const swell = k > 0 ? 0.25 * k * clamp01(1 - Math.hypot(bx - ax, by - ay) / k) : 0;
            const ar = lerp(s.r, ra.r, m) * pinch - swell;
            const br = lerp(s.r, rb.r, m) * pinch - swell;
            const cax = lerp(coreCx, ra.cx, mc);
            const cay = lerp(coreCy, ra.cy, mc);
            const cbx = lerp(coreCx, rb.cx, mc);
            const cby = lerp(coreCy, rb.cy, mc);
            const coreSwell =
                ck > 0 ? 0.25 * ck * clamp01(1 - Math.hypot(cbx - cax, cby - cay) / ck) : 0;
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
                window: windowAt(node),
            });
        };
        visit(plan.root, restOf(plan.root, plan.depth), null);
    }

    function upload(): void {
        // Bin cells into the grid so each pixel tests only cells that can reach it.
        const lists = Array.from({ length: grid * grid }, (): number[] => []);
        for (let c = 0; c < cellCount; c++) {
            const [x0, y0, x1, y1] = cellBounds[c]!;
            const bx0 = Math.max(0, Math.floor(x0 * grid));
            const bx1 = Math.min(grid - 1, Math.floor(x1 * grid));
            const by0 = Math.max(0, Math.floor(y0 * grid));
            const by1 = Math.min(grid - 1, Math.floor(y1 * grid));
            for (let by = by0; by <= by1; by++)
                for (let bx = bx0; bx <= bx1; bx++) lists[by * grid + bx]!.push(c);
        }
        let total = 0;
        for (let i = 0; i < lists.length; i++) {
            binsData[i * 4] = total;
            binsData[i * 4 + 1] = Math.min(lists[i]!.length, 256);
            total += lists[i]!.length;
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
            cellData.subarray(0, Math.max(1, cellCount) * FLOATS),
        );
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, binsTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, grid, grid, 0, gl.RGBA, gl.FLOAT, binsData);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, indexTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, 1024, rows, 0, gl.RED, gl.FLOAT, index);
    }

    function draw(values: Uniforms): void {
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

    function setIcon(image: StemCellIconSource): void {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, iconTex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    function countLeaves(node: LineageNode): number {
        return node.children ? countLeaves(node.children[0]) + countLeaves(node.children[1]) : 1;
    }

    return {
        acceleration,
        assign(image) {
            setIcon(image);
            lineage = buildLineage(
                samplePoints(image, variant.leafPx, size),
                id,
                variant.generations,
            );
            timeline = stemCellTimeline(lineage.depth, variant.total);
            return {
                cells: countLeaves(lineage.root),
                generations: lineage.depth,
                durationMs: timeline.end,
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
                (ms - timeline.divisionsEnd) / (timeline.end - timeline.divisionsEnd),
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
                morph: smoothstep(0.82, 0.96, q),
            });
            return true;
        },
        destroy() {
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        },
    };
}
