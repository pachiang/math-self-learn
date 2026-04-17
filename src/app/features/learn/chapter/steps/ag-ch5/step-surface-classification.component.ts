import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Degree preset definitions ── */

interface DegreePreset {
  degree: number;
  label: string;
  chi: number;
  pg: number;
  kappa: string;
  classification: string;
  build: (group: THREE.Group) => void;
}

/* ── Muted height color palette ── */

function heightColor(t: number): THREE.Color {
  const r = 0.28 + 0.40 * t;
  const g = 0.35 + 0.25 * (1 - t);
  const b = 0.42 + 0.30 * (1 - t * t);
  return new THREE.Color(r, g, b);
}

/* ── Build parametric BufferGeometry ── */

function buildParametricSurface(
  fn: (u: number, v: number) => [number, number, number],
  uRange: [number, number],
  vRange: [number, number],
  segments = 80,
): THREE.BufferGeometry {
  const uCount = segments;
  const vCount = segments;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const du = (uRange[1] - uRange[0]) / uCount;
  const dv = (vRange[1] - vRange[0]) / vCount;

  const pts: [number, number, number][] = [];
  let zMin = Infinity, zMax = -Infinity;
  for (let i = 0; i <= uCount; i++) {
    for (let j = 0; j <= vCount; j++) {
      const u = uRange[0] + i * du;
      const v = vRange[0] + j * dv;
      const p = fn(u, v);
      if (isFinite(p[2])) {
        zMin = Math.min(zMin, p[2]);
        zMax = Math.max(zMax, p[2]);
      }
      pts.push(p);
    }
  }
  if (zMax - zMin < 0.001) { zMax = zMin + 1; }

  for (let i = 0; i <= uCount; i++) {
    for (let j = 0; j <= vCount; j++) {
      const idx = i * (vCount + 1) + j;
      const p = pts[idx];
      positions.push(p[0], p[1], p[2]);
      const t = (p[2] - zMin) / (zMax - zMin);
      const c = heightColor(isFinite(t) ? Math.max(0, Math.min(1, t)) : 0.5);
      colors.push(c.r, c.g, c.b);
    }
  }

  for (let i = 0; i < uCount; i++) {
    for (let j = 0; j < vCount; j++) {
      const a = i * (vCount + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (vCount + 1) + j;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* ── Build height-map surface ── */

function buildHeightMap(
  fn: (x: number, y: number) => number,
  xyRange: [number, number],
  segments = 100,
): THREE.BufferGeometry {
  const n = segments;
  const lo = xyRange[0], hi = xyRange[1];
  const step = (hi - lo) / n;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  let zMin = Infinity, zMax = -Infinity;
  const zVals: number[] = [];

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      const x = lo + i * step;
      const y = lo + j * step;
      let z = fn(x, y);
      if (!isFinite(z)) z = 0;
      zVals.push(z);
      if (z < zMin) zMin = z;
      if (z > zMax) zMax = z;
    }
  }
  if (zMax - zMin < 0.001) { zMax = zMin + 1; }

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      const x = lo + i * step;
      const y = lo + j * step;
      const z = zVals[i * (n + 1) + j];
      positions.push(x, y, z);
      const t = (z - zMin) / (zMax - zMin);
      const c = heightColor(Math.max(0, Math.min(1, t)));
      colors.push(c.r, c.g, c.b);
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * (n + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (n + 1) + j;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* ── Surface material factory ── */

function surfaceMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.82,
    metalness: 0.0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88,
  });
}

/* ── Build functions for each degree ── */

function buildPlane(group: THREE.Group): void {
  // d=1: a plane tilted at 45 degrees: z = x
  const geo = buildHeightMap(
    (x, y) => x,
    [-1.5, 1.5], 80,
  );
  group.add(new THREE.Mesh(geo, surfaceMaterial()));
}

function buildQuadric(group: THREE.Group): void {
  // d=2: sphere (parametric)
  const geo = buildParametricSurface(
    (u, v) => [
      1.2 * Math.sin(u) * Math.cos(v),
      1.2 * Math.sin(u) * Math.sin(v),
      1.2 * Math.cos(u),
    ],
    [0, Math.PI], [0, Math.PI * 2], 80,
  );
  group.add(new THREE.Mesh(geo, surfaceMaterial()));
}

function buildCubic(group: THREE.Group): void {
  // d=3: Fermat cubic z = cbrt(1 - x^3 - y^3)
  const geo = buildHeightMap(
    (x, y) => {
      const val = 1 - x * x * x - y * y * y;
      if (val >= 0) return Math.pow(val, 1 / 3);
      return -Math.pow(-val, 1 / 3);
    },
    [-1.4, 1.4], 100,
  );
  group.add(new THREE.Mesh(geo, surfaceMaterial()));
}

function buildQuartic(group: THREE.Group): void {
  // d=4: z = (1 - x^4 - y^4)^(1/4) where 1-x^4-y^4 >= 0
  // Render upper and lower sheets
  const n = 100;
  const lo = -1.1, hi = 1.1;
  const step = (hi - lo) / n;

  const buildSheet = (sign: number): void => {
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    let zMin = Infinity, zMax = -Infinity;
    const zVals: number[] = [];

    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const x = lo + i * step;
        const y = lo + j * step;
        const val = 1 - x * x * x * x - y * y * y * y;
        let z: number;
        if (val >= 0) {
          z = sign * Math.pow(val, 0.25);
        } else {
          z = 0;
        }
        zVals.push(z);
        if (val >= 0 && isFinite(z)) {
          zMin = Math.min(zMin, z);
          zMax = Math.max(zMax, z);
        }
      }
    }
    if (!isFinite(zMin) || zMax - zMin < 0.001) { zMin = -1; zMax = 1; }

    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const x = lo + i * step;
        const y = lo + j * step;
        const z = zVals[i * (n + 1) + j];
        positions.push(x, y, z);
        const t = (z - zMin) / (zMax - zMin);
        const c = heightColor(Math.max(0, Math.min(1, t)));
        colors.push(c.r, c.g, c.b);
      }
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const xi = lo + i * step;
        const yi = lo + j * step;
        const xi1 = lo + (i + 1) * step;
        const yi1 = lo + (j + 1) * step;
        // Only add face if all four vertices are in the valid region
        const v00 = 1 - xi ** 4 - yi ** 4;
        const v10 = 1 - xi1 ** 4 - yi ** 4;
        const v01 = 1 - xi ** 4 - yi1 ** 4;
        const v11 = 1 - xi1 ** 4 - yi1 ** 4;
        if (v00 < -0.01 || v10 < -0.01 || v01 < -0.01 || v11 < -0.01) continue;

        const a = i * (n + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (n + 1) + j;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    group.add(new THREE.Mesh(geo, surfaceMaterial()));
  };

  buildSheet(1);
  buildSheet(-1);
}

/* ── Presets ── */

const DEGREE_PRESETS: DegreePreset[] = [
  {
    degree: 1,
    label: 'd=1 (\u5E73\u9762)',
    chi: 3,
    pg: 0,
    kappa: '-\\infty',
    classification: '\u6709\u7406\u66F2\u9762',
    build: buildPlane,
  },
  {
    degree: 2,
    label: 'd=2 (\u4E8C\u6B21)',
    chi: 4,
    pg: 0,
    kappa: '-\\infty',
    classification: '\u6709\u7406\u66F2\u9762',
    build: buildQuadric,
  },
  {
    degree: 3,
    label: 'd=3 (\u4E09\u6B21)',
    chi: 9,
    pg: 0,
    kappa: '-\\infty',
    classification: '\u6709\u7406\u66F2\u9762',
    build: buildCubic,
  },
  {
    degree: 4,
    label: 'd=4 (\u56DB\u6B21)',
    chi: 24,
    pg: 1,
    kappa: '0',
    classification: 'K3 \u66F2\u9762',
    build: buildQuartic,
  },
];

/* ── Component ── */

@Component({
  selector: 'app-step-surface-classification',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="\u66F2\u9762\u7684\u62D3\u64B2\u8207\u5206\u985E" subtitle="&sect;5.5">
      <p>
        Classifying algebraic surfaces is much harder than classifying curves. For
        curves, the genus (number of holes) is the key invariant. For surfaces, we
        need more invariants.
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>Key topological invariants for surfaces:</p>
      <p>
        <strong>Euler characteristic \u03C7</strong>: for a smooth surface of degree
        <app-math [e]="'d'" /> in
        <app-math [e]="'\\mathbb{P}^3'" />:
      </p>
      <app-math block [e]="chiFormula"></app-math>
      <ul>
        <li>d=1 (\u5E73\u9762): \u03C7 = 3</li>
        <li>d=2 (\u4E8C\u6B21\u66F2\u9762): \u03C7 = 4</li>
        <li>d=3 (\u4E09\u6B21\u66F2\u9762): \u03C7 = 9</li>
        <li>d=4 (K3 \u66F2\u9762): \u03C7 = 24</li>
      </ul>
    </app-prose-block>

    <app-prose-block>
      <p>
        The geometric genus
        <app-math [e]="'p_g'" /> and irregularity
        <app-math [e]="'q'" /> are finer invariants:
      </p>
      <ul>
        <li>
          <app-math [e]="'p_g'" /> = number of independent holomorphic 2-forms
        </li>
        <li>
          <app-math [e]="'q'" /> = number of independent holomorphic 1-forms
        </li>
        <li>
          For a smooth surface of degree d:
          <app-math [e]="pgFormula"></app-math>
        </li>
      </ul>
      <ul>
        <li>d=1,2,3: <app-math [e]="'p_g = 0'" /> (rational surfaces)</li>
        <li>d=4: <app-math [e]="'p_g = 1'" /> (K3 surface)</li>
        <li>d=5: <app-math [e]="'p_g = 4'" /></li>
      </ul>
    </app-prose-block>

    <app-prose-block>
      <p>
        The <strong>Enriques-Kodaira classification</strong> (20th century masterpiece)
        classifies all algebraic surfaces into categories by their Kodaira dimension
        <app-math [e]="'\\kappa'" />:
      </p>
      <ul>
        <li>
          <app-math [e]="'\\kappa = -\\infty'" />: rational and ruled surfaces (simplest)
        </li>
        <li>
          <app-math [e]="'\\kappa = 0'" />: abelian surfaces, K3 surfaces, Enriques
          surfaces (rich geometry)
        </li>
        <li>
          <app-math [e]="'\\kappa = 1'" />: elliptic surfaces
        </li>
        <li>
          <app-math [e]="'\\kappa = 2'" />: surfaces of general type (most complex)
        </li>
      </ul>
      <p>
        This mirrors how curves are classified by genus (genus 0 = rational, genus 1 =
        elliptic, genus \u2265 2 = general type).
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u89C0\u5BDF\u4E0D\u540C\u6B21\u6578\u66F2\u9762\u7684\u62D3\u64B2\u8907\u96DC\u5EA6\u5982\u4F55\u589E\u9577">
      <!-- Degree selector buttons -->
      <div class="preset-row">
        @for (p of presets; track p.degree; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i"
                  (click)="selectPreset(i)">{{ p.label }}</button>
        }
      </div>

      <!-- Three.js container -->
      <div #threeContainer class="three-container"></div>

      <!-- Classification table -->
      <div class="class-table">
        <div class="ct-row">
          <span class="ct-label">\u6B21\u6578 d</span>
          <span class="ct-val">{{ activePreset().degree }}</span>
        </div>
        <div class="ct-row">
          <span class="ct-label">Euler \u7279\u5FB5 \u03C7</span>
          <span class="ct-val">{{ activePreset().chi }}</span>
        </div>
        <div class="ct-row">
          <span class="ct-label">\u5E7E\u4F55\u8667\u683C p<sub>g</sub></span>
          <span class="ct-val">{{ activePreset().pg }}</span>
        </div>
        <div class="ct-row">
          <span class="ct-label">\u5C0F\u5E73\u7DAD\u5EA6 \u03BA</span>
          <span class="ct-val">
            <app-math [e]="activePreset().kappa"></app-math>
          </span>
        </div>
        <div class="ct-row">
          <span class="ct-label">\u5206\u985E</span>
          <span class="ct-val highlight">{{ activePreset().classification }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Enriques-Kodaira \u5206\u985E\u662F 20 \u4E16\u7D00\u4EE3\u6578\u5E7E\u4F55\u6700\u5049\u5927\u7684\u6210\u5C31\u4E4B\u4E00\u3002\u5B83\u544A\u8A34\u6211\u5011\uFF1A\u6240\u6709\u4EE3\u6578\u66F2\u9762\u90FD\u80FD\u6B78\u5165\u56DB\u5927\u985E\u2014\u2014\u6309\u5C0F\u5E73\u7DAD\u5EA6
        <app-math [e]="'\\kappa'" /> \u5206\u7D1A\u3002\u9019\u500B\u5206\u985E\u5716\u666F\u81F3\u4ECA\u4ECD\u662F\u66F4\u9AD8\u7DAD\u5EA6\u4EE3\u6578\u5E7E\u4F55\uFF08\u5982\u4E09\u7DAD\u69D7\u7684\u5206\u985E\uFF09\u7684\u6307\u8DEF\u660E\u71C8\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .preset-row {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    }
    .pre-btn {
      padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 11px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active {
        background: var(--accent-10); border-color: var(--accent);
        color: var(--accent); font-weight: 600;
      }
    }
    .three-container {
      width: 100%; height: 420px; border-radius: 10px;
      border: 1px solid var(--border); overflow: hidden; margin-bottom: 10px;
    }
    .class-table {
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); overflow: hidden;
    }
    .ct-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 16px; font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
    }
    .ct-label {
      color: var(--text-muted); font-weight: 600; font-size: 12px;
    }
    .ct-val {
      color: var(--text); font-weight: 700;
    }
    .ct-val.highlight {
      color: var(--accent);
    }
  `,
})
export class StepSurfaceClassificationComponent implements OnDestroy {
  readonly presets = DEGREE_PRESETS;

  readonly chiFormula = String.raw`\chi(V_d) = d^3 - 4d^2 + 6d`;
  readonly pgFormula = String.raw`p_g = \frac{(d-1)(d-2)(d-3)}{6}`;

  /* ── Signals ── */
  readonly presetIdx = signal(0);
  readonly activePreset = computed(() => DEGREE_PRESETS[this.presetIdx()]);

  /* ── Three.js refs ── */
  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId = 0;
  private resizeObserver: ResizeObserver | null = null;
  private dynamicGroup: THREE.Group | null = null;

  private lastPresetIdx = -1;

  constructor() {
    afterNextRender(() => {
      this.initThree();
      this.rebuildSurface();
    });
  }

  selectPreset(idx: number): void {
    this.presetIdx.set(idx);
    this.rebuildSurface();
  }

  /* ── Three.js initialization ── */

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x141418);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(3.0, 2.2, 3.0);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.6;
    this.controls.maxDistance = 10;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.55);
    dirLight.position.set(5, 8, 4);
    this.scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0xccddff, 0.2);
    fillLight.position.set(-3, 5, -3);
    this.scene.add(fillLight);

    // Dynamic group
    this.dynamicGroup = new THREE.Group();
    this.scene.add(this.dynamicGroup);

    // Animation loop
    const animate = (): void => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls!.update();

      const idx = this.presetIdx();
      if (idx !== this.lastPresetIdx) {
        this.rebuildSurface();
      }

      this.renderer!.render(this.scene!, this.camera!);
    };
    animate();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);
  }

  /* ── Rebuild surface ── */

  private rebuildSurface(): void {
    if (!this.dynamicGroup || !this.scene) return;
    this.clearGroup(this.dynamicGroup);

    const idx = this.presetIdx();
    this.lastPresetIdx = idx;
    DEGREE_PRESETS[idx].build(this.dynamicGroup);
  }

  /* ── Utility ── */

  private clearGroup(group: THREE.Group): void {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const mat = child.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat.dispose();
      } else if (child instanceof THREE.Line || child instanceof THREE.LineLoop) {
        child.geometry.dispose();
        const mat = child.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else (mat as THREE.Material).dispose();
      } else if (child instanceof THREE.Group) {
        this.clearGroup(child);
      }
    }
  }

  private onResize(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container || !this.camera || !this.renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  ngOnDestroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.controls?.dispose();
    if (this.scene) {
      this.scene.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach(m => m.dispose());
          else mat.dispose();
        } else if (obj instanceof THREE.Line || obj instanceof THREE.LineLoop) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach(m => m.dispose());
          else (mat as THREE.Material).dispose();
        }
      });
    }
    this.renderer?.dispose();
    const container = this.containerRef()?.nativeElement;
    if (container && this.renderer) {
      try { container.removeChild(this.renderer.domElement); }
      catch { /* already removed */ }
    }
    this.resizeObserver?.disconnect();
  }
}
