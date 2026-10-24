type Point = readonly [number, number];
type Harmonic = { k: number; a: number; phase: number };
const TAU = Math.PI * 2;

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

function radial(harmonics: readonly Harmonic[], drift: number): (theta: number) => number {
    return (theta) => {
        let r = 1;
        for (const { k, a, phase } of harmonics) r += a * Math.cos(k * theta + phase + drift);
        return r;
    };
}

/** The user-tuned stemCell.mjs model, with its SVG sampling and parameters intact. */
export function stemCellGeometry(id: string, drift = 0) {
    const samples = 32;
    const padding = 0.06;
    const coreOffset = 0.11;
    const coreRadius = 0.105;
    const margin = 0.1;
    const rand = prng(hash(id));
    const between = (lo: number, hi: number) => lo + (hi - lo) * rand();

    // Place the core first, then size the membrane to contain it.
    const coreAngle = between(0, TAU);
    const coreDistance = coreOffset * Math.sqrt(rand());
    const core = {
        x: Math.cos(coreAngle) * coreDistance,
        y: Math.sin(coreAngle) * coreDistance,
        r: coreRadius * between(0.85, 1.15),
        shape: radial(
            [
                { k: 2, a: between(0.05, 0.12), phase: between(0, TAU) },
                { k: 3, a: between(0.0, 0.05), phase: between(0, TAU) },
            ],
            drift,
        ),
    };
    const lobes = [3, 4, 4, 4, 5][Math.floor(rand() * 5)]!;
    const lobeAmp = between(0.13, 0.18) * (lobes === 5 ? 0.75 : 1);
    const lobePhase = between(0, TAU);
    const membraneShape = radial(
        [
            { k: lobes, a: lobeAmp, phase: lobePhase },
            { k: 2 * lobes, a: lobeAmp * between(0.08, 0.18), phase: 2 * lobePhase },
            { k: lobes - 1, a: between(0.02, 0.06), phase: between(0, TAU) },
            { k: lobes + 1, a: between(0.02, 0.06), phase: between(0, TAU) },
            { k: 1, a: between(0.0, 0.06), phase: between(0, TAU) },
        ],
        drift,
    );

    let scale = 0.32;
    for (let i = 0; i < 48; i++) {
        const t = (i / 48) * TAU;
        const rr = core.r * core.shape(t);
        const px = core.x + Math.cos(t) * rr;
        const py = core.y + Math.sin(t) * rr;
        const needed = (Math.hypot(px, py) + margin) / membraneShape(Math.atan2(py, px));
        if (needed > scale) scale = needed;
    }

    const membranePoints: Point[] = [];
    const corePoints: Point[] = [];
    for (let i = 0; i < samples; i++) {
        const t = (i / samples) * TAU;
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
        Math.max(...ys),
    ];
    const fit = (1 - 2 * padding) / Math.max(maxX - minX, maxY - minY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const place = ([x, y]: Point): Point => [0.5 + (x - cx) * fit, 0.5 + (y - cy) * fit];
    return { membrane: membranePoints.map(place), core: corePoints.map(place) };
}

/** Closed Catmull–Rom spline through the model's fixed 32 samples. */
export function stemCellSmoothPath(points: readonly Point[], size: number): string {
    const p = points.map(([x, y]): Point => [x * size, y * size]);
    const n = p.length;
    const f = (value: number) => value.toFixed(2);
    let d = `M${f(p[0]![0])} ${f(p[0]![1])}`;
    for (let i = 0; i < n; i++) {
        const p0 = p[(i - 1 + n) % n]!;
        const p1 = p[i]!;
        const p2 = p[(i + 1) % n]!;
        const p3 = p[(i + 2) % n]!;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6] as const;
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6] as const;
        d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
    }
    return `${d}Z`;
}
