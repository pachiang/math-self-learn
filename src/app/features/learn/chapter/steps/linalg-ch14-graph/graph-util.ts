/**
 * Graph utilities for Ch14 — spectral graph theory visualisations.
 * Works for small undirected/directed graphs (≤ 20 nodes).
 */

export type Mat = number[][];

export interface GraphData {
  n: number;
  /** Edges as [source, target] pairs (0-indexed). */
  edges: [number, number][];
  directed?: boolean;
}

// ─── Matrix construction ─────────────────────────────────────────

export function adjacencyMatrix(g: GraphData): Mat {
  const A = zeros(g.n, g.n);
  for (const [i, j] of g.edges) {
    A[i][j] = 1;
    if (!g.directed) A[j][i] = 1;
  }
  return A;
}

export function degreeMatrix(g: GraphData): Mat {
  const D = zeros(g.n, g.n);
  const A = adjacencyMatrix(g);
  for (let i = 0; i < g.n; i++) {
    let d = 0;
    for (let j = 0; j < g.n; j++) d += A[i][j];
    D[i][i] = d;
  }
  return D;
}

export function incidenceMatrix(g: GraphData): Mat {
  const B = zeros(g.n, g.edges.length);
  for (let e = 0; e < g.edges.length; e++) {
    const [i, j] = g.edges[e];
    B[i][e] = 1;
    B[j][e] = -1;
  }
  return B;
}

export function laplacianMatrix(g: GraphData): Mat {
  const A = adjacencyMatrix(g);
  const L = zeros(g.n, g.n);
  for (let i = 0; i < g.n; i++) {
    let d = 0;
    for (let j = 0; j < g.n; j++) d += A[i][j];
    L[i][i] = d;
    for (let j = 0; j < g.n; j++) L[i][j] -= A[i][j];
  }
  return L;
}

/** Row-stochastic transition matrix P = D⁻¹ A (for random walks). */
export function transitionMatrix(g: GraphData): Mat {
  const A = adjacencyMatrix(g);
  const P = zeros(g.n, g.n);
  for (let i = 0; i < g.n; i++) {
    let d = 0;
    for (let j = 0; j < g.n; j++) d += A[i][j];
    if (d > 0) {
      for (let j = 0; j < g.n; j++) P[i][j] = A[i][j] / d;
    }
  }
  return P;
}

// ─── Matrix helpers ──────────────────────────────────────────────

export function zeros(r: number, c: number): Mat {
  return Array.from({ length: r }, () => new Array(c).fill(0));
}

export function matVec(A: Mat, v: number[]): number[] {
  return A.map((row) => row.reduce((s, a, j) => s + a * v[j], 0));
}

export function vecNorm(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

export function vecNormalize(v: number[]): number[] {
  const n = vecNorm(v);
  return n < 1e-12 ? v : v.map((x) => x / n);
}

// ─── Jacobi eigendecomposition (symmetric matrices) ──────────────

export interface EigenResult {
  values: number[];
  vectors: Mat;
}

/**
 * Cyclic Jacobi rotation for symmetric matrices.
 * Returns eigenvalues sorted ascending and columns of vectors as eigenvectors.
 */
export function sortedEigen(A: Mat): EigenResult {
  const n = A.length;
  const M = A.map((r) => r.slice());
  const V = zeros(n, n);
  for (let i = 0; i < n; i++) V[i][i] = 1;

  for (let sweep = 0; sweep < 50; sweep++) {
    let off = 0;
    for (let p = 0; p < n - 1; p++)
      for (let q = p + 1; q < n; q++) off += M[p][q] * M[p][q];
    if (off < 1e-12) break;

    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = M[p][q];
        if (Math.abs(apq) < 1e-14) continue;
        const theta = (M[q][q] - M[p][p]) / (2 * apq);
        let t: number;
        if (Math.abs(theta) > 1e15) {
          t = 0.5 / theta;
        } else {
          t = theta === 0 ? 1 : Math.sign(theta) / (Math.abs(theta) + Math.sqrt(1 + theta * theta));
        }
        const c = 1 / Math.sqrt(1 + t * t);
        const s = t * c;

        M[p][p] -= t * apq;
        M[q][q] += t * apq;
        M[p][q] = 0;
        M[q][p] = 0;
        for (let i = 0; i < n; i++) {
          if (i !== p && i !== q) {
            const aip = M[i][p], aiq = M[i][q];
            M[i][p] = c * aip - s * aiq;
            M[p][i] = M[i][p];
            M[i][q] = s * aip + c * aiq;
            M[q][i] = M[i][q];
          }
        }
        for (let i = 0; i < n; i++) {
          const vip = V[i][p], viq = V[i][q];
          V[i][p] = c * vip - s * viq;
          V[i][q] = s * vip + c * viq;
        }
      }
    }
  }

  // Collect and sort ascending
  const pairs: { val: number; col: number[] }[] = [];
  for (let i = 0; i < n; i++) {
    pairs.push({ val: M[i][i], col: V.map((row) => row[i]) });
  }
  pairs.sort((a, b) => a.val - b.val);

  const values = pairs.map((p) => p.val);
  const vectors = zeros(n, n);
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) vectors[i][k] = pairs[k].col[i];
  }
  return { values, vectors };
}

// ─── Force-directed layout ──────────────────────────────────────

export interface Pos { x: number; y: number; }

/**
 * Simple spring-electric layout for small graphs.
 * Returns positions normalised to fit within [-1, 1] × [-1, 1].
 */
export function forceLayout(g: GraphData, iterations = 120): Pos[] {
  const n = g.n;
  if (n === 0) return [];
  if (n === 1) return [{ x: 0, y: 0 }];

  // Init on a circle
  const pos: Pos[] = Array.from({ length: n }, (_, i) => ({
    x: Math.cos((2 * Math.PI * i) / n) * 0.5 + (Math.random() - 0.5) * 0.05,
    y: Math.sin((2 * Math.PI * i) / n) * 0.5 + (Math.random() - 0.5) * 0.05,
  }));

  const edgeSet = new Set<string>();
  for (const [a, b] of g.edges) {
    edgeSet.add(`${Math.min(a, b)}-${Math.max(a, b)}`);
  }

  const kRepel = 0.3;
  const kAttract = 0.15;
  const idealLen = 1.0;

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 0.1 * (1 - iter / iterations);
    const fx = new Array(n).fill(0);
    const fy = new Array(n).fill(0);

    // Repulsion (all pairs)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = pos[i].x - pos[j].x;
        let dy = pos[i].y - pos[j].y;
        const dist = Math.max(0.01, Math.sqrt(dx * dx + dy * dy));
        const force = kRepel / (dist * dist);
        dx /= dist; dy /= dist;
        fx[i] += dx * force; fy[i] += dy * force;
        fx[j] -= dx * force; fy[j] -= dy * force;
      }
    }

    // Attraction (edges)
    for (const [a, b] of g.edges) {
      let dx = pos[b].x - pos[a].x;
      let dy = pos[b].y - pos[a].y;
      const dist = Math.max(0.01, Math.sqrt(dx * dx + dy * dy));
      const force = kAttract * (dist - idealLen);
      dx /= dist; dy /= dist;
      fx[a] += dx * force; fy[a] += dy * force;
      fx[b] -= dx * force; fy[b] -= dy * force;
    }

    for (let i = 0; i < n; i++) {
      const mag = Math.sqrt(fx[i] * fx[i] + fy[i] * fy[i]);
      const cap = Math.min(mag, temp) / Math.max(mag, 1e-6);
      pos[i].x += fx[i] * cap;
      pos[i].y += fy[i] * cap;
    }
  }

  // Normalise to [-1, 1]
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pos) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scale = Math.max(rangeX, rangeY) / 2;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  for (const p of pos) {
    p.x = (p.x - cx) / scale;
    p.y = (p.y - cy) / scale;
  }
  return pos;
}

// ─── PageRank (power iteration) ──────────────────────────────────

/**
 * Compute PageRank via power iteration on a directed graph.
 * @param damping — probability of random jump (usually 0.15)
 * @param maxIter — max iterations
 * @returns ranks (sums to 1)
 */
export function pagerank(
  g: GraphData,
  damping = 0.15,
  maxIter = 200,
): { ranks: number[]; iterations: number } {
  const n = g.n;
  if (n === 0) return { ranks: [], iterations: 0 };

  // Build column-stochastic matrix (j → i transition)
  const outDeg = new Array(n).fill(0);
  for (const [src] of g.edges) outDeg[src]++;

  let r = new Array(n).fill(1 / n);

  let iter = 0;
  for (; iter < maxIter; iter++) {
    const next = new Array(n).fill(damping / n);
    for (const [src, dst] of g.edges) {
      if (outDeg[src] > 0) {
        next[dst] += (1 - damping) * r[src] / outDeg[src];
      }
    }
    // Handle dangling nodes (no outgoing edges)
    let danglingMass = 0;
    for (let i = 0; i < n; i++) {
      if (outDeg[i] === 0) danglingMass += r[i];
    }
    for (let i = 0; i < n; i++) {
      next[i] += (1 - damping) * danglingMass / n;
    }

    // Check convergence
    let diff = 0;
    for (let i = 0; i < n; i++) diff += Math.abs(next[i] - r[i]);
    r = next;
    if (diff < 1e-8) { iter++; break; }
  }
  return { ranks: r, iterations: iter };
}
