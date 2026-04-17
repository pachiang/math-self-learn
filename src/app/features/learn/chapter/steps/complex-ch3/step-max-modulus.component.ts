import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAdd, cSub, cMul, cAbs, cArg, cExp, cFromPolar, fmtC,
} from '../complex-ch1/complex-util';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Constants ── */
const TWO_PI = 2 * Math.PI;
const COL_BG = 0x141418;
const DISK_R = 1.5;
const RADIAL_SEGS = 60;
const ANGULAR_SEGS = 80;
const BOUNDARY_N = 500;
const INTERIOR_GRID = 40;
const SEGMENTS = 120;

/* ── Aspect definitions ── */
interface Aspect {
  key: string;
  label: string;
  extract: (w: C) => number;
  clamp: [number, number];
}

const ASPECTS: Aspect[] = [
  { key: 're', label: 'Re(f)', extract: (w: C) => w[0], clamp: [-4, 4] },
  { key: 'im', label: 'Im(f)', extract: (w: C) => w[1], clamp: [-4, 4] },
  { key: 'dc', label: '\u6A21+\u5E45\u89D2', extract: (w: C) => Math.sqrt(w[0] * w[0] + w[1] * w[1]), clamp: [0, 5] },
  { key: 'arg', label: 'arg(f)', extract: (w: C) => Math.atan2(w[1], w[0]), clamp: [-Math.PI, Math.PI] },
];

/* ── Viewport position mapping ── */
interface VPLayout { col: number; row: number; }
const VP_POSITIONS: VPLayout[] = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
];

/* ── Preset functions ── */
interface MMPreset {
  label: string;
  tex: string;
  fn: (z: C) => C;
}

const PRESETS: MMPreset[] = [
  {
    label: 'z\u00B2+1',
    tex: 'f(z) = z^2 + 1',
    fn: (z: C): C => cAdd(cMul(z, z), [1, 0]),
  },
  {
    label: 'e\u1DBBz',
    tex: 'f(z) = e^z',
    fn: (z: C): C => cExp(z),
  },
  {
    label: 'z\u00B3\u2212z',
    tex: 'f(z) = z^3 - z',
    fn: (z: C): C => cSub(cMul(cMul(z, z), z), z),
  },
];

/** Find boundary max for a given aspect extract function */
function findBoundaryMax(
  f: (z: C) => C,
  extract: (w: C) => number,
  N: number,
): { maxVal: number; maxPt: C; maxTheta: number } {
  let maxVal = -Infinity;
  let maxPt: C = [DISK_R, 0];
  let maxTheta = 0;

  for (let k = 0; k < N; k++) {
    const theta = TWO_PI * k / N;
    const z = cFromPolar(DISK_R, theta);
    const val = extract(f(z));
    if (val > maxVal) {
      maxVal = val;
      maxPt = z;
      maxTheta = theta;
    }
  }
  return { maxVal, maxPt, maxTheta };
}

/** Find interior max for a given aspect extract function */
function findInteriorMax(
  f: (z: C) => C,
  extract: (w: C) => number,
): { maxVal: number; maxPt: C } {
  let maxVal = -Infinity;
  let maxPt: C = [0, 0];

  const step = (2 * DISK_R) / (INTERIOR_GRID + 1);
  for (let i = 1; i <= INTERIOR_GRID; i++) {
    for (let j = 1; j <= INTERIOR_GRID; j++) {
      const re = -DISK_R + i * step;
      const im = -DISK_R + j * step;
      const rr = Math.sqrt(re * re + im * im);
      if (rr >= DISK_R - 0.02) continue;
      const z: C = [re, im];
      const val = extract(f(z));
      if (val > maxVal) {
        maxVal = val;
        maxPt = z;
      }
    }
  }
  return { maxVal, maxPt };
}

@Component({
  selector: 'app-step-max-modulus',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="\u6700\u5927\u6A21\u539F\u7406" subtitle="&sect;3.5">
      <p>
        \u6700\u5927\u6A21\u539F\u7406\uFF1A\u82E5 f \u5728\u9023\u901A\u958B\u96C6 D \u4E0A\u89E3\u6790\u4E14\u975E\u5E38\u6578\uFF0C
        \u5247 |f| \u5728 D \u5167\u6C92\u6709\u5C40\u90E8\u6700\u5927\u503C\u3002\u63DB\u8A00\u4E4B\uFF0C
        |f(z)| \u7684\u6700\u5927\u503C\u5FC5\u5728 D \u7684\u908A\u754C\u4E0A\u9054\u5230\uFF0C\u800C\u975E\u5167\u90E8\u3002
      </p>
      <app-math block [e]="maxModFormula" />
      <p>
        \u7269\u7406\u76F4\u89BA\uFF1A\u628A |f| \u60F3\u6210\u6EAB\u5EA6\u3002\u89E3\u6790\u51FD\u6578\u7684\u300C\u6EAB\u5EA6\u300D
        \u4E0D\u80FD\u5728\u5167\u90E8\u6709\u71B1\u9EDE\u2014\u2014\u71B1\u91CF\u7E3D\u662F\u6D41\u5411\u908A\u754C\u3002
        \u540C\u6A23\u7684\u9053\u7406\u4E5F\u9069\u7528\u65BC Re(f) \u548C Im(f)\uFF1A\u5B83\u5011\u662F\u8ABF\u548C\u51FD\u6578\uFF0C\u540C\u6A23\u6C92\u6709\u5167\u90E8\u6975\u503C\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u89C0\u5BDF |f(z)|\u3001Re(f)\u3001Im(f)\u3001arg(f) \u5728\u5713\u76E4\u4E0A\u7684\u5206\u4F48\uFF1A\u6700\u5927\u503C\u6C38\u9060\u5728\u908A\u754C\u4E0A">
      <div class="preset-row">
        @for (p of presets; track p.label) {
          <button class="preset-btn"
                  [class.active]="activeIdx() === $index"
                  (click)="selectPreset($index)">
            {{ p.label }}
          </button>
        }
      </div>

      <div class="three-wrapper">
        <div #threeContainer class="three-container"></div>
        <div class="vp-divider-h"></div>
        <div class="vp-divider-v"></div>
        @for (vp of viewportLabels; track vp.key) {
          <div class="vp-label"
               [style.left.%]="vp.col * 50"
               [style.top.%]="vp.row * 50">
            {{ vp.label }}
          </div>
        }
      </div>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="info-label">max|f| \u5728\u908A\u754C</div>
          <div class="info-val">{{ boundaryMaxStr() }}</div>
          <div class="info-sub">at z = {{ boundaryMaxPtStr() }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">max|f| \u5728\u5167\u90E8</div>
          <div class="info-val">{{ interiorMaxStr() }}</div>
        </div>
        <div class="info-card badge-card">
          <div class="confirm-badge">\u908A\u754C max &#x2265; \u5167\u90E8 max</div>
        </div>
      </div>

      <div class="func-info">
        <app-math [e]="activeTex()" />
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u6700\u5927\u6A21\u539F\u7406\u662F Cauchy \u7A4D\u5206\u516C\u5F0F\u7684\u76F4\u63A5\u63A8\u8AD6\u3002
        \u5B83\u544A\u8A34\u6211\u5011\u89E3\u6790\u51FD\u6578\u6C92\u6709\u300C\u5167\u90E8\u6975\u503C\u300D\u2014\u2014
        \u6240\u6709\u6975\u7AEF\u884C\u70BA\u90FD\u767C\u751F\u5728\u908A\u754C\u3002
        \u9019\u500B\u539F\u7406\u5728\u504F\u5FAE\u5206\u65B9\u7A0B\u548C\u8ABF\u548C\u5206\u6790\u4E2D\u4E5F\u6709\u6DF1\u9060\u5F71\u97FF\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .preset-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .preset-btn {
      padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.2s, border-color 0.2s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent);
        color: var(--text); font-weight: 600; }
    }

    .three-wrapper {
      position: relative;
      width: 100%;
      margin-bottom: 10px;
    }
    .three-container {
      width: 100%;
      height: 500px;
      border-radius: 10px;
      border: 1px solid var(--border);
      overflow: hidden;
    }
    .vp-divider-h {
      position: absolute; left: 0; right: 0; top: 50%;
      height: 1px; background: rgba(255,255,255,0.06);
      pointer-events: none; z-index: 1;
    }
    .vp-divider-v {
      position: absolute; top: 0; bottom: 0; left: 50%;
      width: 1px; background: rgba(255,255,255,0.06);
      pointer-events: none; z-index: 1;
    }
    .vp-label {
      position: absolute;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      font-family: 'JetBrains Mono', monospace;
      color: rgba(255, 255, 255, 0.55);
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(4px);
      border-radius: 3px;
      pointer-events: none;
      margin: 6px;
      z-index: 2;
    }

    .info-row { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
    .info-card { flex: 1; min-width: 130px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center;
      font-family: 'JetBrains Mono', monospace; }
    .info-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
    .info-val { font-size: 14px; font-weight: 600; color: var(--text); }
    .info-sub { font-size: 10px; color: var(--text-secondary); margin-top: 2px; }

    .badge-card { display: flex; align-items: center; justify-content: center; }
    .confirm-badge { padding: 6px 14px; border-radius: 6px;
      font-size: 13px; font-weight: 700;
      background: rgba(90, 138, 90, 0.12); color: #3a7a3a;
      border: 1px solid rgba(90, 138, 90, 0.3); }

    .func-info { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
  `,
})
export class StepMaxModulusComponent implements OnDestroy {
  readonly presets = PRESETS;
  readonly aspects = ASPECTS;
  readonly diskR = DISK_R;

  readonly maxModFormula = String.raw`\max_{z \in \overline{D}} |f(z)| = \max_{z \in \partial D} |f(z)|`;

  readonly activeIdx = signal(0);
  readonly activePreset = computed(() => PRESETS[this.activeIdx()]);
  readonly activeTex = computed(() => this.activePreset().tex);

  /** All computed data for current preset (|f| aspect for info cards) */
  private readonly computedData = computed(() => {
    const f = this.activePreset().fn;
    const absExtract = ASPECTS[2].extract; // |f|

    const bnd = findBoundaryMax(f, absExtract, BOUNDARY_N);
    const int = findInteriorMax(f, absExtract);

    return {
      boundaryMax: bnd.maxVal,
      boundaryMaxPt: bnd.maxPt,
      boundaryMaxTheta: bnd.maxTheta,
      interiorMax: int.maxVal,
      interiorMaxPt: int.maxPt,
    };
  });

  readonly boundaryMaxStr = computed(() => this.computedData().boundaryMax.toFixed(4));
  readonly boundaryMaxPtStr = computed(() => fmtC(this.computedData().boundaryMaxPt, 3));
  readonly interiorMaxStr = computed(() => this.computedData().interiorMax.toFixed(4));

  /** Static viewport labels for 2x2 grid */
  readonly viewportLabels = ASPECTS.map((a, i) => ({
    key: a.key,
    label: a.label,
    col: VP_POSITIONS[i].col,
    row: VP_POSITIONS[i].row,
  }));

  /* ── Three.js refs ── */
  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId = 0;
  private resizeObserver: ResizeObserver | null = null;
  private threeReady = false;

  /** One scene per aspect */
  private scenes: Record<string, THREE.Scene> = {};
  /** Surface groups per aspect (for rebuilding) */
  private surfaceGroups: Record<string, THREE.Group> = {};

  constructor() {
    afterNextRender(() => {
      this.initThree();
      this.buildAllSurfaces();
      this.threeReady = true;
    });
  }

  selectPreset(idx: number): void {
    this.activeIdx.set(idx);
    if (this.threeReady) {
      this.buildAllSurfaces();
    }
  }

  /* ── Three.js initialization ── */

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Camera (aspect = 1)
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    this.camera.position.set(3.5, 3.0, 3.5);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(COL_BG);
    this.renderer.setScissorTest(true);
    this.renderer.autoClear = false;
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 15;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Create one scene per aspect
    for (const aspect of ASPECTS) {
      const scene = new THREE.Scene();

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const dirLight = new THREE.DirectionalLight(0xffeedd, 0.55);
      dirLight.position.set(5, 8, 4);
      scene.add(dirLight);
      const fillLight = new THREE.DirectionalLight(0xccddff, 0.2);
      fillLight.position.set(-3, 5, -3);
      scene.add(fillLight);

      // Grid
      const grid = new THREE.GridHelper(DISK_R * 2 + 1, 16, 0x2a2a30, 0x222228);
      scene.add(grid);

      // Re-axis
      const axisLen = DISK_R + 0.7;
      const reAxisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-axisLen, 0.005, 0),
        new THREE.Vector3(axisLen, 0.005, 0),
      ]);
      scene.add(new THREE.Line(reAxisGeo, new THREE.LineBasicMaterial({ color: 0x886655 })));

      // Im-axis
      const imAxisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.005, -axisLen),
        new THREE.Vector3(0, 0.005, axisLen),
      ]);
      scene.add(new THREE.Line(imAxisGeo, new THREE.LineBasicMaterial({ color: 0x556688 })));

      // Surface group
      const surfGroup = new THREE.Group();
      scene.add(surfGroup);
      this.surfaceGroups[aspect.key] = surfGroup;

      this.scenes[aspect.key] = scene;
    }

    // Animation loop
    const animate = (): void => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls!.update();
      this.renderViewports();
    };
    animate();

    // Handle resize
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);
  }

  /* ── Multi-viewport rendering ── */

  private renderViewports(): void {
    if (!this.renderer || !this.camera) return;

    const canvas = this.renderer.domElement;
    const cw = canvas.width;
    const ch = canvas.height;
    const vpW = Math.floor(cw / 2);
    const vpH = Math.floor(ch / 2);

    this.renderer.setViewport(0, 0, cw, ch);
    this.renderer.setScissor(0, 0, cw, ch);
    this.renderer.clear();

    for (let i = 0; i < ASPECTS.length; i++) {
      const aspect = ASPECTS[i];
      const pos = VP_POSITIONS[i];
      const scene = this.scenes[aspect.key];
      if (!scene) continue;

      const x = pos.col * vpW;
      const vy = pos.row === 0 ? vpH : 0;

      this.renderer.setViewport(x, vy, vpW, vpH);
      this.renderer.setScissor(x, vy, vpW, vpH);
      this.renderer.render(scene, this.camera);
    }
  }

  /* ── Build all surfaces for current preset ── */

  private buildAllSurfaces(): void {
    const f = this.activePreset().fn;

    for (const aspect of ASPECTS) {
      const group = this.surfaceGroups[aspect.key];
      if (!group) continue;
      this.clearGroup(group);

      const [clampMin, clampMax] = aspect.clamp;

      // ── 1. Base reference disk at y=0 ──
      const baseDiskGeo = new THREE.CircleGeometry(DISK_R, ANGULAR_SEGS);
      baseDiskGeo.rotateX(-Math.PI / 2);
      const baseDiskMat = new THREE.MeshBasicMaterial({
        color: 0x446688,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      });
      group.add(new THREE.Mesh(baseDiskGeo, baseDiskMat));

      // Base circle outline
      const baseCirclePts: THREE.Vector3[] = [];
      for (let i = 0; i <= ANGULAR_SEGS; i++) {
        const a = (i / ANGULAR_SEGS) * TWO_PI;
        baseCirclePts.push(new THREE.Vector3(
          DISK_R * Math.cos(a), 0, DISK_R * Math.sin(a),
        ));
      }
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(baseCirclePts),
        new THREE.LineBasicMaterial({ color: 0x556688, transparent: true, opacity: 0.3 }),
      ));

      // ── 2. Disk-shaped surface in polar coords ──
      const positions: number[] = [];
      const colors: number[] = [];
      const indices: number[] = [];

      // Height grid
      const heightGrid: number[][] = [];
      for (let ri = 0; ri <= RADIAL_SEGS; ri++) {
        heightGrid[ri] = [];
        const r = (ri / RADIAL_SEGS) * DISK_R;
        for (let ai = 0; ai <= ANGULAR_SEGS; ai++) {
          const a = (ai / ANGULAR_SEGS) * TWO_PI;
          const x = r * Math.cos(a);
          const zCoord = r * Math.sin(a);
          const w = f([x, zCoord]);
          let val = aspect.extract(w);
          val = Math.max(clampMin, Math.min(clampMax, val));
          if (!isFinite(val)) val = clampMax;
          heightGrid[ri][ai] = val;
        }
      }

      // Build vertices
      for (let ri = 0; ri <= RADIAL_SEGS; ri++) {
        const r = (ri / RADIAL_SEGS) * DISK_R;
        for (let ai = 0; ai <= ANGULAR_SEGS; ai++) {
          const a = (ai / ANGULAR_SEGS) * TWO_PI;
          const x = r * Math.cos(a);
          const zCoord = r * Math.sin(a);
          const val = heightGrid[ri][ai];

          positions.push(x, val, zCoord);

          let rgb: [number, number, number];
          if (aspect.key === 'dc') {
            const w = f([x, zCoord]);
            const argVal = Math.atan2(w[1], w[0]);
            rgb = this.aspectColor('dc', argVal, -Math.PI, Math.PI);
          } else {
            rgb = this.aspectColor(aspect.key, val, clampMin, clampMax);
          }
          colors.push(rgb[0], rgb[1], rgb[2]);
        }
      }

      // Build faces
      const aCnt = ANGULAR_SEGS + 1;
      for (let ri = 0; ri < RADIAL_SEGS; ri++) {
        for (let ai = 0; ai < ANGULAR_SEGS; ai++) {
          const a = ri * aCnt + ai;
          const b = a + 1;
          const c = a + aCnt;
          const d = c + 1;
          indices.push(a, c, b);
          indices.push(b, c, d);
        }
      }

      const surfaceGeo = new THREE.BufferGeometry();
      surfaceGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      surfaceGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      surfaceGeo.setIndex(indices);
      surfaceGeo.computeVertexNormals();

      const surfaceMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        roughness: 0.82,
        metalness: 0.0,
      });

      group.add(new THREE.Mesh(surfaceGeo, surfaceMat));

      // ── 3. Boundary ring at surface height ──
      const boundaryPts: THREE.Vector3[] = [];
      for (let i = 0; i <= ANGULAR_SEGS * 2; i++) {
        const a = (i / (ANGULAR_SEGS * 2)) * TWO_PI;
        const x = DISK_R * Math.cos(a);
        const zCoord = DISK_R * Math.sin(a);
        const w = f([x, zCoord]);
        let val = aspect.extract(w);
        val = Math.max(clampMin, Math.min(clampMax, val));
        if (!isFinite(val)) val = clampMax;
        boundaryPts.push(new THREE.Vector3(x, val, zCoord));
      }
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(boundaryPts),
        new THREE.LineBasicMaterial({ color: 0xffcc44, linewidth: 2 }),
      ));

      // ── 4. Boundary max marker (sphere) ──
      const bnd = findBoundaryMax(f, aspect.extract, BOUNDARY_N);
      const bMaxX = bnd.maxPt[0];
      const bMaxZ = bnd.maxPt[1];
      let bMaxH = aspect.extract(f(bnd.maxPt));
      bMaxH = Math.max(clampMin, Math.min(clampMax, bMaxH));

      const bMaxSphereGeo = new THREE.SphereGeometry(0.06, 16, 12);
      const bMaxSphereMat = new THREE.MeshStandardMaterial({ color: 0xff4422, emissive: 0x661100 });
      const bMaxMesh = new THREE.Mesh(bMaxSphereGeo, bMaxSphereMat);
      bMaxMesh.position.set(bMaxX, bMaxH, bMaxZ);
      group.add(bMaxMesh);

      // Vertical line from base to boundary max
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(bMaxX, 0, bMaxZ),
          new THREE.Vector3(bMaxX, bMaxH, bMaxZ),
        ]),
        new THREE.LineBasicMaterial({ color: 0xff4422, transparent: true, opacity: 0.6 }),
      ));

      // ── 5. Interior max marker (dimmer sphere) ──
      const int = findInteriorMax(f, aspect.extract);
      const iMaxX = int.maxPt[0];
      const iMaxZ = int.maxPt[1];
      let iMaxH = aspect.extract(f(int.maxPt));
      iMaxH = Math.max(clampMin, Math.min(clampMax, iMaxH));

      const iMaxSphereGeo = new THREE.SphereGeometry(0.04, 12, 8);
      const iMaxSphereMat = new THREE.MeshStandardMaterial({
        color: 0x88aacc, emissive: 0x223344,
        transparent: true, opacity: 0.8,
      });
      const iMaxMesh = new THREE.Mesh(iMaxSphereGeo, iMaxSphereMat);
      iMaxMesh.position.set(iMaxX, iMaxH, iMaxZ);
      group.add(iMaxMesh);

      // Vertical line from base to interior max
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(iMaxX, 0, iMaxZ),
          new THREE.Vector3(iMaxX, iMaxH, iMaxZ),
        ]),
        new THREE.LineBasicMaterial({ color: 0x88aacc, transparent: true, opacity: 0.4 }),
      ));
    }
  }

  /* ── Color schemes per aspect (same as reference dissection component) ── */

  private aspectColor(key: string, val: number, lo: number, hi: number): [number, number, number] {
    const c = new THREE.Color();
    const t = (val - lo) / (hi - lo);

    switch (key) {
      case 're': {
        if (t < 0.5) {
          const s = t * 2;
          c.setHSL(0.52, 0.30 * (1 - s), 0.32 + 0.42 * s);
        } else {
          const s = (t - 0.5) * 2;
          c.setHSL(0.36, 0.28 * s, 0.74 - 0.38 * s);
        }
        break;
      }
      case 'im': {
        if (t < 0.5) {
          const s = t * 2;
          c.setHSL(0.06, 0.32 * (1 - s), 0.36 + 0.38 * s);
        } else {
          const s = (t - 0.5) * 2;
          c.setHSL(0.72, 0.25 * s, 0.74 - 0.34 * s);
        }
        break;
      }
      case 'abs': {
        if (t < 0.5) {
          const s = t * 2;
          c.setHSL(0.62, 0.35 * (1 - s * 0.6), 0.18 + 0.50 * s);
        } else {
          const s = (t - 0.5) * 2;
          c.setHSL(0.08 * s, 0.15 + 0.30 * s, 0.68 - 0.22 * s);
        }
        break;
      }
      case 'arg': {
        const h = (val + Math.PI) / (2 * Math.PI);
        c.setHSL(h, 0.35, 0.48);
        break;
      }
      case 'dc': {
        // Domain coloring: vivid cyclical hue for phase
        const h = (val + Math.PI) / (2 * Math.PI);
        c.setHSL(h, 0.6, 0.52);
        break;
      }
      default:
        c.setRGB(0.4, 0.4, 0.4);
    }

    return [c.r, c.g, c.b];
  }

  /* ── Clear a Three.js group ── */

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
      }
    }
  }

  /* ── Resize handling ── */

  private onResize(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container || !this.camera || !this.renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /* ── Cleanup ── */

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.controls?.dispose();
    for (const key of Object.keys(this.scenes)) {
      const scene = this.scenes[key];
      scene.traverse((obj: THREE.Object3D) => {
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
      try {
        container.removeChild(this.renderer.domElement);
      } catch { /* already removed */ }
    }
    this.resizeObserver?.disconnect();
  }
}
