/**
 * Exact region model for "points on a circle, all chords drawn".
 *
 * Every chord between two circle points is exactly (its line) ∩ (disk), so the
 * regions are the cells of the line arrangement clipped to the disk. Each cell
 * is convex and is identified by its sign vector (which side of every chord).
 * We discover cells by sampling (a grid plus probes around every vertex, so even
 * tiny cells next to near-concurrent chords are found), then rebuild each cell's
 * polygon by clipping a fine circle polygon with its half-planes.
 */

export interface Pt {
  x: number;
  y: number;
}

export interface Region {
  key: string;
  poly: Pt[];
  centroid: Pt;
  area: number;
}

export interface Crossing {
  p: Pt;
  /** Number of distinct chords passing through this interior point. */
  k: number;
}

export interface Arrangement {
  points: Pt[];
  chords: [Pt, Pt][];
  crossings: Crossing[];
  regions: Region[];
  /** 1 + chords + Σ(k − 1): exact for any placement. */
  formulaCount: number;
}

const CIRCLE_SEGMENTS = 360;
const CIRCLE_POLY: Pt[] = Array.from({ length: CIRCLE_SEGMENTS }, (_, i) => {
  const t = (2 * Math.PI * i) / CIRCLE_SEGMENTS;
  return { x: Math.cos(t), y: Math.sin(t) };
});

export function pointAt(deg: number): Pt {
  const t = (deg * Math.PI) / 180;
  return { x: Math.cos(t), y: -Math.sin(t) };
}

function cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

function side(a: Pt, b: Pt, p: Pt): number {
  return cross(b.x - a.x, b.y - a.y, p.x - a.x, p.y - a.y);
}

function clip(poly: Pt[], a: Pt, b: Pt, sign: 1 | -1): Pt[] {
  const out: Pt[] = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const cur = poly[i];
    const nxt = poly[(i + 1) % n];
    const sc = sign * side(a, b, cur);
    const sn = sign * side(a, b, nxt);
    if (sc >= 0) out.push(cur);
    if ((sc >= 0) !== (sn >= 0)) {
      const t = sc / (sc - sn);
      out.push({ x: cur.x + t * (nxt.x - cur.x), y: cur.y + t * (nxt.y - cur.y) });
    }
  }
  return out;
}

function areaAndCentroid(poly: Pt[]): { area: number; centroid: Pt } {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const c = p.x * q.y - q.x * p.y;
    a += c;
    cx += (p.x + q.x) * c;
    cy += (p.y + q.y) * c;
  }
  a /= 2;
  if (Math.abs(a) < 1e-14) return { area: 0, centroid: poly[0] ?? { x: 0, y: 0 } };
  return { area: Math.abs(a), centroid: { x: cx / (6 * a), y: cy / (6 * a) } };
}

function segmentCrossing(a: Pt, b: Pt, c: Pt, d: Pt): Pt | null {
  const r = { x: b.x - a.x, y: b.y - a.y };
  const s = { x: d.x - c.x, y: d.y - c.y };
  const den = cross(r.x, r.y, s.x, s.y);
  if (Math.abs(den) < 1e-12) return null;
  const t = cross(c.x - a.x, c.y - a.y, s.x, s.y) / den;
  const u = cross(c.x - a.x, c.y - a.y, r.x, r.y) / den;
  const eps = 1e-9;
  if (t <= eps || t >= 1 - eps || u <= eps || u >= 1 - eps) return null;
  return { x: a.x + t * r.x, y: a.y + t * r.y };
}

export function buildArrangement(anglesDeg: number[]): Arrangement {
  const points = anglesDeg.map(pointAt);
  const chords: [Pt, Pt][] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) chords.push([points[i], points[j]]);
  }

  // Interior crossings, merged when several chords meet at (almost) one point.
  const merged: { p: Pt; chords: Set<number> }[] = [];
  const mergeEps = 1e-6;
  for (let i = 0; i < chords.length; i++) {
    for (let j = i + 1; j < chords.length; j++) {
      const p = segmentCrossing(chords[i][0], chords[i][1], chords[j][0], chords[j][1]);
      if (!p) continue;
      const hit = merged.find((m) => Math.hypot(m.p.x - p.x, m.p.y - p.y) < mergeEps);
      if (hit) {
        hit.chords.add(i);
        hit.chords.add(j);
      } else {
        merged.push({ p, chords: new Set([i, j]) });
      }
    }
  }
  const crossings: Crossing[] = merged.map((m) => ({ p: m.p, k: m.chords.size }));
  const formulaCount = 1 + chords.length + crossings.reduce((s, c) => s + (c.k - 1), 0);

  // Sample points: grid + probes in every angular sector around each vertex.
  const samples: Pt[] = [];
  const step = 0.02;
  for (let x = -1 + step / 2; x < 1; x += step) {
    for (let y = -1 + step / 2; y < 1; y += step) {
      if (x * x + y * y < 0.995) samples.push({ x, y });
    }
  }
  const probeVertex = (v: Pt, through: number[]) => {
    const dirs: number[] = [];
    for (const ci of through) {
      const [a, b] = chords[ci];
      const t = Math.atan2(b.y - a.y, b.x - a.x);
      dirs.push(t, t + Math.PI);
    }
    dirs.push(Math.atan2(-v.y, -v.x));
    const norm = dirs.map((t) => ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)).sort((p, q) => p - q);
    for (let i = 0; i < norm.length; i++) {
      const t0 = norm[i];
      const t1 = i + 1 < norm.length ? norm[i + 1] : norm[0] + 2 * Math.PI;
      const mid = (t0 + t1) / 2;
      // Several radii, so tiny triangles near almost-concurrent chords are hit.
      for (const d of [1e-7, 1e-6, 1e-5, 1e-4, 1e-3, 4e-3]) {
        const q = { x: v.x + d * Math.cos(mid), y: v.y + d * Math.sin(mid) };
        if (q.x * q.x + q.y * q.y < 1 - 1e-12) samples.push(q);
      }
    }
  };
  for (const m of merged) probeVertex(m.p, [...m.chords]);
  // Every region touching the rim owns a whole arc between two neighbouring
  // circle points (no chord crosses an arc), so one probe just inside each arc
  // finds even the thinnest sliver next to two close points.
  const sortedAngles = anglesDeg.map((a) => ((a % 360) + 360) % 360).sort((p, q) => p - q);
  sortedAngles.forEach((a, i) => {
    const b = i + 1 < sortedAngles.length ? sortedAngles[i + 1] : sortedAngles[0] + 360;
    const mid = pointAt((a + b) / 2);
    samples.push({ x: mid.x * (1 - 1e-5), y: mid.y * (1 - 1e-5) });
  });
  points.forEach((p, pi) => {
    const through = chords
      .map((c, ci) => ((c[0] === points[pi] || c[1] === points[pi]) ? ci : -1))
      .filter((ci) => ci >= 0);
    probeVertex(p, through);
  });

  const seen = new Set<string>();
  const regions: Region[] = [];
  for (const s of samples) {
    let key = '';
    let degenerate = false;
    for (const [a, b] of chords) {
      const v = side(a, b, s);
      if (Math.abs(v) < 1e-15) {
        degenerate = true;
        break;
      }
      key += v > 0 ? '+' : '-';
    }
    if (degenerate || seen.has(key)) continue;
    seen.add(key);
    let poly = CIRCLE_POLY;
    chords.forEach(([a, b], ci) => {
      poly = clip(poly, a, b, key[ci] === '+' ? 1 : -1);
    });
    if (poly.length < 3) continue;
    const { area, centroid } = areaAndCentroid(poly);
    if (area < 1e-20) continue;
    regions.push({ key, poly, centroid, area });
  }

  // Sweep order: by angle around the centre, inner regions first within a ray.
  regions.sort((r, q) => {
    const ar = Math.atan2(r.centroid.y, r.centroid.x);
    const aq = Math.atan2(q.centroid.y, q.centroid.x);
    return ar - aq;
  });

  return { points, chords, crossings, regions, formulaCount };
}

export function polyPath(poly: Pt[]): string {
  return poly.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(4)} ${p.y.toFixed(4)}`).join(' ') + ' Z';
}

/** Generic base angles: the first n give the n-point picture. */
export const BASE_ANGLES = [100, 215, 330, 20, 265];
/** Where "place it for me" puts the sixth point. */
export const SUGGESTED_SIXTH = 158;
export const MIN_GAP_DEG = 7;

export function angleGapOk(angles: number[], candidate: number, ignoreIndex = -1): boolean {
  return angles.every((a, i) => {
    if (i === ignoreIndex) return true;
    const d = Math.abs(((a - candidate + 540) % 360) - 180);
    return d >= MIN_GAP_DEG;
  });
}

export function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}
