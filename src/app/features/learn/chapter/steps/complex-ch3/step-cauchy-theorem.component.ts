import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cMul, cFromPolar, cAbs, fmtC,
} from '../complex-ch1/complex-util';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Constants ── */
const COL_BG = 0x141418;
const RANGE = 3;
const SEGMENTS = 120;

const COL_CONTOUR_BASE = 0x44aaff;
const COL_CONTOUR_LIFTED = 0xffcc33;
const COL_DISK = 0x4488ff;
const COL_SING = 0xff4444;
const COL_CURTAIN = 0x888888;

/* ── Aspect definitions ── */
interface Aspect {
  key: string;
  label: string;
  extract: (w: C) => number;
  clamp: [number, number];
}

const ASPECTS: Aspect[] = [
  { key: 're', label: 'Re(f)', extract: (w: C) => w[0], clamp: [-3, 3] },
  { key: 'im', label: 'Im(f)', extract: (w: C) => w[1], clamp: [-3, 3] },
  { key: 'dc', label: '\u6A21+\u5E45\u89D2', extract: (w: C) => Math.sqrt(w[0] * w[0] + w[1] * w[1]), clamp: [0, 4] },
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

/* ── Function presets ── */

interface FuncPreset {
  label: string;
  tex: string;
  fn: (z: C) => C;
  singularities: C[];
  singLabels: string[];
}

const FUNCS: FuncPreset[] = [
  {
    label: 'z\u00B2 (無奇異點)',
    tex: 'z^2',
    fn: (z: C): C => cMul(z, z),
    singularities: [],
    singLabels: [],
  },
  {
    label: '1/z (奇異點在原點)',
    tex: '\\frac{1}{z}',
    fn: (z: C): C => {
      const d = z[0] * z[0] + z[1] * z[1];
      if (d < 1e-12) return [1e6, 0];
      return [z[0] / d, -z[1] / d];
    },
    singularities: [[0, 0]],
    singLabels: ['z=0'],
  },
  {
    label: '1/(z-1) (奇異點在 z=1)',
    tex: '\\frac{1}{z-1}',
    fn: (z: C): C => {
      const w: C = [z[0] - 1, z[1]];
      const d = w[0] * w[0] + w[1] * w[1];
      if (d < 1e-12) return [1e6, 0];
      return [w[0] / d, -w[1] / d];
    },
    singularities: [[1, 0]],
    singLabels: ['z=1'],
  },
];

/** Numerically integrate f around a circle |z|=R using trapezoidal rule. */
function circleIntegral(f: (z: C) => C, R: number, N = 300): C {
  let sumRe = 0, sumIm = 0;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const theta = 2 * Math.PI * t;
    const z = cFromPolar(R, theta);
    const fz = f(z);
    const gp: C = [-2 * Math.PI * R * Math.sin(theta), 2 * Math.PI * R * Math.cos(theta)];
    const integrand = cMul(fz, gp);
    const w = (i === 0 || i === N) ? 0.5 : 1;
    sumRe += integrand[0] * w / N;
    sumIm += integrand[1] * w / N;
  }
  return [sumRe, sumIm];
}

@Component({
  selector: 'app-step-cauchy-theorem',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Cauchy 積分定理" subtitle="&sect;3.2">
      <p>
        複分析的基石：若 f 在簡單封閉路徑
        <app-math [e]="'\\\\gamma'" />
        的內部和邊界上都解析，則：
      </p>
      <app-math block [e]="cauchyFormula" />
      <p>
        這表示對解析函數，積分是<strong>路徑無關</strong>的。
        可以在解析區域內自由變形路徑而不改變積分值。
      </p>
      <p>
        <strong>重要但書</strong>：若路徑<em>內部</em>有奇異點，
        定理就不適用！
      </p>
    </app-prose-block>

    <app-challenge-card prompt="旋轉 3D 曲面，觀察奇異點如何「刺穿」曲面。拖動半徑看路徑圈住奇異點時積分的變化。">
      <!-- Function selection -->
      <div class="control-group">
        <div class="control-label">被積函數</div>
        <div class="preset-row">
          @for (f of funcs; track f.label) {
            <button class="preset-btn"
                    [class.active]="funcIdx() === $index"
                    (click)="setFunc($index)">
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      <!-- Radius slider -->
      <div class="control-group">
        <div class="control-label">
          圓的半徑 R = {{ radius().toFixed(2) }}
        </div>
        <input type="range" class="slider" min="0.3" max="2.5" step="0.01"
               [value]="radius()"
               (input)="onRadiusChange($event)" />
      </div>

      <!-- Aspect toggles -->
      <div class="toggle-row">
        @for (a of aspects; track a.key) {
          <button class="toggle-btn"
                  [class.active]="aspectActive()[$index]"
                  (click)="toggleAspect($index)">
            {{ a.label }}
          </button>
        }
      </div>

      <!-- Three.js multi-viewport -->
      <div class="three-wrapper">
        <div #threeContainer class="three-container"></div>
        <div class="vp-divider-h"></div>
        <div class="vp-divider-v"></div>
        @for (vp of visibleViewports(); track vp.key) {
          <div class="vp-label"
               [style.left.%]="vp.col * 50"
               [style.top.%]="vp.row * 50">
            {{ vp.label }}
          </div>
        }
      </div>

      <!-- Integral result -->
      <div class="result-card">
        <div class="result-header">
          <app-math [e]="resultTex()" />
        </div>
        <div class="result-value">
          = {{ resultStr() }}
        </div>
      </div>

      <!-- Status badge -->
      <div class="status-row">
        <div class="status-badge"
             [class.zero-badge]="isZero()"
             [class.nonzero-badge]="!isZero()">
          @if (singInside().length === 0) {
            無奇異點在路徑內 → 積分 = 0
          } @else {
            奇異點在路徑內 → 積分 &#x2260; 0
          }
        </div>
      </div>

      <!-- For functions with singularities: show location info -->
      @if (activeFunc().singularities.length > 0) {
        <div class="location-info">
          @for (info of singLocationInfo(); track info.label) {
            <span class="loc-item">
              奇異點 {{ info.label }} 在圓<strong>{{ info.inside ? '內' : '外' }}</strong>
            </span>
          }
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        Cauchy 定理告訴我們：解析函數的路徑積分只「看到」被圈住的奇異點。
        這是留數定理的根源。下一節看 Cauchy 定理的驚人推論——積分公式。
      </p>
    </app-prose-block>
  `,
  styles: `
    .control-group { margin-bottom: 10px; }
    .control-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace; font-weight: 600; }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .preset-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.2s, border-color 0.2s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent);
        color: var(--text); font-weight: 600; } }

    .slider { width: 100%; margin: 4px 0 6px; accent-color: var(--accent); }

    .toggle-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .toggle-btn {
      padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
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

    .result-card { padding: 14px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; margin-bottom: 10px; }
    .result-header { margin-bottom: 4px; }
    .result-value { font-size: 18px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }

    .status-row { display: flex; justify-content: center; margin-bottom: 10px; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 6px;
      font-size: 13px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      &.zero-badge { background: rgba(90, 138, 90, 0.12); color: #3a7a3a;
        border: 1px solid rgba(90, 138, 90, 0.3); }
      &.nonzero-badge { background: rgba(192, 80, 80, 0.10); color: #c05050;
        border: 1px solid rgba(192, 80, 80, 0.25); } }

    .location-info { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
      font-size: 13px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; }
    .loc-item { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); }
  `,
})
export class StepCauchyTheoremComponent implements OnDestroy {
  readonly funcs = FUNCS;
  readonly aspects = ASPECTS;

  readonly cauchyFormula = String.raw`\oint_\gamma f(z)\,dz = 0 \qquad (f \text{ 在 } \gamma \text{ 內部解析})`;

  readonly funcIdx = signal(0);
  readonly radius = signal(1.2);
  readonly aspectActive = signal([true, true, true, true]);

  readonly activeFunc = computed(() => FUNCS[this.funcIdx()]);

  readonly visibleViewports = computed(() => {
    const flags = this.aspectActive();
    this.funcIdx();
    this.radius();
    const active: { key: string; label: string; col: number; row: number }[] = [];
    let slotIdx = 0;
    for (let i = 0; i < ASPECTS.length; i++) {
      if (flags[i]) {
        const pos = VP_POSITIONS[slotIdx];
        active.push({
          key: ASPECTS[i].key,
          label: ASPECTS[i].label,
          col: pos.col,
          row: pos.row,
        });
        slotIdx++;
        if (slotIdx >= 4) break;
      }
    }
    return active;
  });

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
  /** Surface groups per aspect (rebuilt on func change) */
  private surfaceGroups: Record<string, THREE.Group> = {};
  /** Contour groups per aspect (rebuilt on func or radius change) */
  private contourGroups: Record<string, THREE.Group> = {};

  constructor() {
    afterNextRender(() => {
      this.initThree();
      this.rebuildAll();
      this.threeReady = true;
    });
  }

  setFunc(idx: number): void {
    this.funcIdx.set(idx);
    if (this.threeReady) {
      this.rebuildAll();
    }
  }

  onRadiusChange(ev: Event): void {
    const val = parseFloat((ev.target as HTMLInputElement).value);
    this.radius.set(val);
    if (this.threeReady) {
      this.rebuildContours();
    }
  }

  toggleAspect(idx: number): void {
    const current = [...this.aspectActive()];
    const activeCount = current.filter(Boolean).length;
    if (current[idx] && activeCount <= 1) return;
    current[idx] = !current[idx];
    this.aspectActive.set(current);
  }

  /* ── Computed signals for integral results ── */

  readonly integralValue = computed((): C => {
    const f = this.activeFunc().fn;
    const R = this.radius();
    return circleIntegral(f, R);
  });

  readonly resultTex = computed(() => {
    const fTex = this.activeFunc().tex;
    return `\\oint_{|z|=${this.radius().toFixed(2)}} ${fTex} \\, dz`;
  });

  readonly resultStr = computed(() => fmtC(this.integralValue(), 4));

  readonly isZero = computed(() => cAbs(this.integralValue()) < 0.05);

  readonly singInside = computed(() => {
    const R = this.radius();
    return this.activeFunc().singularities.filter(s => cAbs(s) < R);
  });

  readonly singLocationInfo = computed(() => {
    const fn = this.activeFunc();
    const R = this.radius();
    return fn.singularities.map((s, i) => ({
      label: fn.singLabels[i],
      inside: cAbs(s) < R,
    }));
  });

  /* ── Three.js initialization ── */

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Camera (aspect = 1 for square viewports)
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    this.camera.position.set(4, 4, 4);
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
      const grid = new THREE.GridHelper(RANGE * 2, 16, 0x2a2a30, 0x222228);
      scene.add(grid);

      // Re-axis
      const reAxisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-RANGE, 0.005, 0),
        new THREE.Vector3(RANGE, 0.005, 0),
      ]);
      scene.add(new THREE.Line(reAxisGeo, new THREE.LineBasicMaterial({ color: 0x886655 })));

      // Im-axis
      const imAxisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.005, -RANGE),
        new THREE.Vector3(0, 0.005, RANGE),
      ]);
      scene.add(new THREE.Line(imAxisGeo, new THREE.LineBasicMaterial({ color: 0x556688 })));

      // Surface group (rebuilt on func change)
      const surfGroup = new THREE.Group();
      scene.add(surfGroup);
      this.surfaceGroups[aspect.key] = surfGroup;

      // Contour group (rebuilt on func or radius change)
      const contGroup = new THREE.Group();
      scene.add(contGroup);
      this.contourGroups[aspect.key] = contGroup;

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

    // Clear entire canvas
    this.renderer.setViewport(0, 0, cw, ch);
    this.renderer.setScissor(0, 0, cw, ch);
    this.renderer.clear();

    const vps = this.visibleViewports();

    for (const vp of vps) {
      const scene = this.scenes[vp.key];
      if (!scene) continue;

      const x = vp.col * vpW;
      const vy = vp.row === 0 ? vpH : 0;

      this.renderer.setViewport(x, vy, vpW, vpH);
      this.renderer.setScissor(x, vy, vpW, vpH);
      this.renderer.render(scene, this.camera);
    }
  }

  /* ── Rebuild everything (surface + contour) ── */

  private rebuildAll(): void {
    const func = this.activeFunc();

    for (const aspect of ASPECTS) {
      const surfGroup = this.surfaceGroups[aspect.key];
      const contGroup = this.contourGroups[aspect.key];
      if (!surfGroup || !contGroup) continue;

      // Rebuild surface
      this.clearGroup(surfGroup);
      this.buildSurface(surfGroup, func.fn, aspect);
      this.buildSingularityMarkers(surfGroup, func);

      // Rebuild contour
      this.clearGroup(contGroup);
      this.buildContour(contGroup, func.fn, this.radius(), aspect);
    }
  }

  /* ── Rebuild only the contour (on radius change) ── */

  private rebuildContours(): void {
    const func = this.activeFunc();
    const R = this.radius();

    for (const aspect of ASPECTS) {
      const contGroup = this.contourGroups[aspect.key];
      if (!contGroup) continue;
      this.clearGroup(contGroup);
      this.buildContour(contGroup, func.fn, R, aspect);
    }
  }

  /** Build the surface mesh for a given aspect. */
  private buildSurface(group: THREE.Group, fn: (z: C) => C, aspect: Aspect): void {
    const geo = new THREE.PlaneGeometry(RANGE * 2, RANGE * 2, SEGMENTS, SEGMENTS);
    geo.rotateX(-Math.PI / 2);

    const posAttr = geo.getAttribute('position');
    const vertexCount = posAttr.count;
    const colors = new Float32Array(vertexCount * 3);
    const [clampMin, clampMax] = aspect.clamp;

    for (let i = 0; i < vertexCount; i++) {
      const gx = posAttr.getX(i);
      const gz = posAttr.getZ(i);

      const w = fn([gx, gz]);
      let val = aspect.extract(w);
      val = Math.max(clampMin, Math.min(clampMax, val));
      if (!isFinite(val)) val = clampMax;

      posAttr.setY(i, val);

      let rgb: [number, number, number];
      if (aspect.key === 'dc') {
        const argVal = Math.atan2(w[1], w[0]);
        rgb = this.aspectColor('dc', argVal, -Math.PI, Math.PI);
      } else {
        rgb = this.aspectColor(aspect.key, val, clampMin, clampMax);
      }
      colors[i * 3] = rgb[0];
      colors[i * 3 + 1] = rgb[1];
      colors[i * 3 + 2] = rgb[2];
    }

    posAttr.needsUpdate = true;
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72,
      roughness: 0.82,
      metalness: 0.0,
    });

    group.add(new THREE.Mesh(geo, mat));
  }

  /** Place red spheres at singularity positions on the base plane. */
  private buildSingularityMarkers(group: THREE.Group, func: FuncPreset): void {
    for (const s of func.singularities) {
      const sGeo = new THREE.SphereGeometry(0.1, 16, 12);
      const sMat = new THREE.MeshStandardMaterial({
        color: COL_SING,
        emissive: COL_SING,
        emissiveIntensity: 0.4,
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.position.set(s[0], 0, s[1]);
      group.add(sMesh);

      // Vertical line from base to max height to mark the spike
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(s[0], 0, s[1]),
        new THREE.Vector3(s[0], 5, s[1]),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: COL_SING,
        transparent: true,
        opacity: 0.35,
      });
      group.add(new THREE.Line(lineGeo, lineMat));
    }
  }

  /** Build the contour circle (base + lifted) and shaded disk for a given aspect. */
  private buildContour(group: THREE.Group, fn: (z: C) => C, R: number, aspect: Aspect): void {
    const N = 256;
    const [clampMin, clampMax] = aspect.clamp;

    // 1. Translucent disk on the base plane showing the contour interior
    const diskGeo = new THREE.CircleGeometry(R, 64);
    const diskMat = new THREE.MeshBasicMaterial({
      color: COL_DISK,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    diskMesh.rotation.x = -Math.PI / 2;
    diskMesh.position.y = 0.001;
    group.add(diskMesh);

    // 2. Base contour circle (on y=0 plane)
    const basePts: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const theta = (i / N) * 2 * Math.PI;
      basePts.push(new THREE.Vector3(
        R * Math.cos(theta), 0, R * Math.sin(theta),
      ));
    }
    const baseGeo = new THREE.BufferGeometry().setFromPoints(basePts);
    const baseMat = new THREE.LineBasicMaterial({ color: COL_CONTOUR_BASE, linewidth: 2 });
    group.add(new THREE.Line(baseGeo, baseMat));

    // 3. Lifted contour on the surface (at aspect-specific height)
    const liftedPts: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const theta = (i / N) * 2 * Math.PI;
      const z: C = [R * Math.cos(theta), R * Math.sin(theta)];
      const w = fn(z);
      let h = aspect.extract(w);
      h = Math.max(clampMin, Math.min(clampMax, h));
      if (!isFinite(h)) h = clampMax;
      liftedPts.push(new THREE.Vector3(z[0], h, z[1]));
    }
    const liftedGeo = new THREE.BufferGeometry().setFromPoints(liftedPts);
    const liftedMat = new THREE.LineBasicMaterial({ color: COL_CONTOUR_LIFTED, linewidth: 2 });
    group.add(new THREE.Line(liftedGeo, liftedMat));

    // 4. Direction arrow on the base contour
    const arrowAngle = Math.PI / 2 + 0.3;
    const arrowPos = new THREE.Vector3(
      R * Math.cos(arrowAngle), 0, R * Math.sin(arrowAngle),
    );
    const tangent = new THREE.Vector3(
      -Math.sin(arrowAngle), 0, Math.cos(arrowAngle),
    ).normalize();
    const coneGeo = new THREE.ConeGeometry(0.07, 0.2, 8);
    const coneMat = new THREE.MeshStandardMaterial({ color: COL_CONTOUR_BASE });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.copy(arrowPos);
    const up = new THREE.Vector3(0, 1, 0);
    cone.quaternion.setFromUnitVectors(up, tangent);
    group.add(cone);

    // 5. Curtain lines: connect base to lifted at intervals
    const curtainStep = 16;
    const curtainPositions: number[] = [];
    for (let i = 0; i < N; i += curtainStep) {
      const theta = (i / N) * 2 * Math.PI;
      const z: C = [R * Math.cos(theta), R * Math.sin(theta)];
      const w = fn(z);
      let h = aspect.extract(w);
      h = Math.max(clampMin, Math.min(clampMax, h));
      if (!isFinite(h)) h = clampMax;
      curtainPositions.push(z[0], 0, z[1]);
      curtainPositions.push(z[0], h, z[1]);
    }
    const curtainGeo = new THREE.BufferGeometry();
    curtainGeo.setAttribute('position',
      new THREE.Float32BufferAttribute(curtainPositions, 3));
    const curtainMat = new THREE.LineBasicMaterial({
      color: COL_CURTAIN,
      transparent: true,
      opacity: 0.4,
    });
    group.add(new THREE.LineSegments(curtainGeo, curtainMat));
  }

  /* ── Color schemes per aspect ── */

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
      } else if (child instanceof THREE.Line || child instanceof THREE.LineLoop
        || child instanceof THREE.LineSegments) {
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
        } else if (obj instanceof THREE.Line || obj instanceof THREE.LineLoop
          || obj instanceof THREE.LineSegments) {
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
