import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cMul, cConj, cFromPolar, cAbs, fmtC,
} from '../complex-ch1/complex-util';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Constants ── */
const COL_BG = 0x141418;
const RANGE = 2;
const SEGMENTS = 120;

const COL_BASE_PATH = 0x44aaff;
const COL_LIFTED_PATH = 0xffcc33;
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

/* ── Path presets ── */

interface PathPreset {
  label: string;
  closed: boolean;
  gamma: (t: number) => C;
  gammaPrime: (t: number) => C;
}

const PATHS: PathPreset[] = [
  {
    label: '直線 0→1+i',
    closed: false,
    gamma: (t: number): C => [t, t],
    gammaPrime: (_t: number): C => [1, 1],
  },
  {
    label: '半圓 0→1+i',
    closed: false,
    gamma: (t: number): C => {
      const cx = 0.5, cy = 0.5;
      const r = Math.SQRT1_2;
      const theta = 5 * Math.PI / 4 - t * Math.PI;
      return [cx + r * Math.cos(theta), cy + r * Math.sin(theta)];
    },
    gammaPrime: (t: number): C => {
      const r = Math.SQRT1_2;
      const theta = 5 * Math.PI / 4 - t * Math.PI;
      return [r * Math.PI * Math.sin(theta), -r * Math.PI * Math.cos(theta)];
    },
  },
  {
    label: '單位圓',
    closed: true,
    gamma: (t: number): C => cFromPolar(1, 2 * Math.PI * t),
    gammaPrime: (t: number): C => {
      const theta = 2 * Math.PI * t;
      return [-2 * Math.PI * Math.sin(theta), 2 * Math.PI * Math.cos(theta)];
    },
  },
];

/* ── Function presets ── */

interface FuncPreset {
  label: string;
  tex: string;
  fn: (z: C) => C;
  analytic: boolean;
}

const FUNCS: FuncPreset[] = [
  {
    label: 'z',
    tex: 'f(z) = z',
    fn: (z: C): C => z,
    analytic: true,
  },
  {
    label: 'z\u00B2',
    tex: 'f(z) = z^2',
    fn: (z: C): C => cMul(z, z),
    analytic: true,
  },
  {
    label: '1/z',
    tex: 'f(z) = 1/z',
    fn: (z: C): C => {
      const d = z[0] * z[0] + z[1] * z[1];
      if (d < 1e-12) return [1e6, 0];
      return [z[0] / d, -z[1] / d];
    },
    analytic: true,
  },
  {
    label: 'z\u0305 (共軛)',
    tex: 'f(z) = \\bar{z}',
    fn: (z: C): C => cConj(z),
    analytic: false,
  },
];

/** Numerically integrate f along path using trapezoidal rule with N steps. */
function numericalIntegral(
  f: (z: C) => C,
  gamma: (t: number) => C,
  gammaPrime: (t: number) => C,
  N = 200,
): C {
  let sumRe = 0, sumIm = 0;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const z = gamma(t);
    const fz = f(z);
    const gp = gammaPrime(t);
    const integrand = cMul(fz, gp);
    const w = (i === 0 || i === N) ? 0.5 : 1;
    sumRe += integrand[0] * w / N;
    sumIm += integrand[1] * w / N;
  }
  return [sumRe, sumIm];
}

@Component({
  selector: 'app-step-contour-integral',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="什麼是路徑積分" subtitle="&sect;3.1">
      <p>
        在實分析中，我們沿著區間積分。在複分析中，我們沿著複數平面上的
        <strong>路徑</strong>（contour）積分。路徑是一條參數化曲線
        <app-math [e]="'\\\\gamma(t),\\\\; t \\\\in [a,b]'" />，
        積分定義為：
      </p>
      <app-math block [e]="integralDef" />
      <p>
        積分的值一般<strong>依賴路徑</strong>，不僅僅取決於起點和終點。
        但對解析函數，會有令人驚喜的事情發生......
      </p>
      <p>
        常見路徑：線段、圓弧、封閉迴路。
        封閉路徑滿足
        <app-math [e]="'\\\\gamma(a) = \\\\gamma(b)'" />。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇路徑和被積函數，觀察四個面向同時呈現路徑積分的幾何意義">
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

      <!-- Path selection -->
      <div class="control-group">
        <div class="control-label">積分路徑</div>
        <div class="preset-row">
          @for (p of paths; track p.label) {
            <button class="preset-btn"
                    [class.active]="pathIdx() === $index"
                    (click)="setPath($index)">
              {{ p.label }}
            </button>
          }
        </div>
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
        <div class="result-badge"
             [class.independent]="isPathIndependent()"
             [class.dependent]="!isPathIndependent()">
          {{ isPathIndependent()
            ? (activePath().closed ? '解析函數繞封閉路徑' : '路徑無關 (解析函數)')
            : (activeFunc().label === '1/z' && activePath().closed
              ? '繞原點一圈 = 2pi i'
              : '路徑相關 (非解析)')
          }}
        </div>
      </div>

      <!-- Comparison table: show all paths for this function -->
      <div class="compare-section">
        <div class="compare-title">各路徑比較</div>
        <div class="compare-grid">
          @for (entry of allResults(); track entry.label) {
            <div class="compare-cell"
                 [class.active-cell]="entry.active">
              <div class="cc-path">{{ entry.label }}</div>
              <div class="cc-val">{{ entry.valueStr }}</div>
            </div>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        z 和 z&#xB2; 的積分不依賴路徑——因為它們是解析的！
        <app-math [e]="'\\\\bar{z}'" /> 不解析，積分就依賴路徑。
        1/z 繞原點一圈得到
        <app-math [e]="'2\\\\pi i'" />，這是留數定理的預告。
        下一節看為什麼解析函數的積分是 0。
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
      background: var(--bg-surface); text-align: center; margin-bottom: 12px; }
    .result-header { margin-bottom: 4px; }
    .result-value { font-size: 18px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; }
    .result-badge { display: inline-block; padding: 4px 14px; border-radius: 6px;
      font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      &.independent { background: rgba(90, 138, 90, 0.12); color: #3a7a3a;
        border: 1px solid rgba(90, 138, 90, 0.3); }
      &.dependent { background: rgba(192, 130, 50, 0.12); color: #b07020;
        border: 1px solid rgba(192, 130, 50, 0.3); } }

    .compare-section { margin-top: 4px; }
    .compare-title { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace; font-weight: 600; }
    .compare-grid { display: flex; gap: 8px; flex-wrap: wrap; }
    .compare-cell { flex: 1; min-width: 120px; padding: 10px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface); text-align: center;
      &.active-cell { border-color: var(--accent); background: var(--accent-10); } }
    .cc-path { font-size: 11px; color: var(--text-muted); margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace; }
    .cc-val { font-size: 14px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepContourIntegralComponent implements OnDestroy {
  readonly funcs = FUNCS;
  readonly paths = PATHS;
  readonly aspects = ASPECTS;

  readonly integralDef = String.raw`\int_\gamma f(z)\,dz = \int_a^b f(\gamma(t))\,\gamma'(t)\,dt`;

  readonly funcIdx = signal(0);
  readonly pathIdx = signal(0);
  readonly aspectActive = signal([true, true, true, true]);

  readonly activeFunc = computed(() => FUNCS[this.funcIdx()]);
  readonly activePath = computed(() => PATHS[this.pathIdx()]);

  readonly visibleViewports = computed(() => {
    const flags = this.aspectActive();
    this.funcIdx();
    this.pathIdx();
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
  /** Dynamic groups per aspect (surface + overlays, for rebuilding) */
  private dynamicGroups: Record<string, THREE.Group> = {};

  constructor() {
    afterNextRender(() => {
      this.initThree();
      this.rebuildAllScenes();
      this.threeReady = true;
    });
  }

  setFunc(idx: number): void {
    this.funcIdx.set(idx);
    if (this.threeReady) {
      this.rebuildAllScenes();
    }
  }

  setPath(idx: number): void {
    this.pathIdx.set(idx);
    if (this.threeReady) {
      this.rebuildAllScenes();
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
    const path = this.activePath();
    return numericalIntegral(f, path.gamma, path.gammaPrime);
  });

  readonly resultTex = computed(() => {
    const fTex = this.activeFunc().tex;
    const symbol = this.activePath().closed ? '\\oint' : '\\int';
    return `${symbol}_{\\gamma} ${fTex.replace('f(z) = ', '')} \\, dz`;
  });

  readonly resultStr = computed(() => fmtC(this.integralValue(), 4));

  readonly isPathIndependent = computed(() => {
    const fn = this.activeFunc();
    if (fn.label === '1/z' && this.activePath().closed) return false;
    return fn.analytic;
  });

  readonly allResults = computed(() => {
    const f = this.activeFunc().fn;
    const activePathIdx = this.pathIdx();
    return PATHS.map((p, i) => {
      const val = numericalIntegral(f, p.gamma, p.gammaPrime);
      return {
        label: p.label,
        valueStr: fmtC(val, 4),
        active: i === activePathIdx,
      };
    });
  });

  /* ── Three.js initialization ── */

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Camera (aspect = 1 for square viewports)
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    this.camera.position.set(3, 3, 3);
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

      // Dynamic group (surface + overlays)
      const dynGroup = new THREE.Group();
      scene.add(dynGroup);
      this.dynamicGroups[aspect.key] = dynGroup;

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

      // WebGL y=0 is bottom: row 0 (top) = vpH, row 1 (bottom) = 0
      const x = vp.col * vpW;
      const vy = vp.row === 0 ? vpH : 0;

      this.renderer.setViewport(x, vy, vpW, vpH);
      this.renderer.setScissor(x, vy, vpW, vpH);
      this.renderer.render(scene, this.camera);
    }
  }

  /* ── Rebuild all scenes for current preset + path ── */

  private rebuildAllScenes(): void {
    const f = this.activeFunc().fn;
    const path = this.activePath();

    for (const aspect of ASPECTS) {
      const group = this.dynamicGroups[aspect.key];
      if (!group) continue;
      this.clearGroup(group);

      // 1. Build surface mesh with this aspect's height
      this.buildSurface(group, f, aspect);

      // 2. Build contour path on the base plane (y=0)
      this.buildBasePath(group, path);

      // 3. Build lifted path on the surface (at aspect height)
      this.buildLiftedPath(group, f, path, aspect);

      // 4. Build curtain lines connecting base to lifted
      this.buildCurtainLines(group, f, path, aspect);
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
      opacity: 0.75,
      roughness: 0.82,
      metalness: 0.0,
    });

    group.add(new THREE.Mesh(geo, mat));
  }

  /** Draw the contour path on the base plane (y=0). */
  private buildBasePath(group: THREE.Group, path: PathPreset): void {
    const N = 200;
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const z = path.gamma(t);
      pts.push(new THREE.Vector3(z[0], 0, z[1]));
    }

    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: COL_BASE_PATH, linewidth: 2 });
    group.add(new THREE.Line(geo, mat));

    // Start point sphere
    const startGeo = new THREE.SphereGeometry(0.06, 12, 8);
    const startMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const startMesh = new THREE.Mesh(startGeo, startMat);
    const s0 = path.gamma(0);
    startMesh.position.set(s0[0], 0, s0[1]);
    group.add(startMesh);

    // End point sphere (different color if not closed)
    if (!path.closed) {
      const endGeo = new THREE.SphereGeometry(0.06, 12, 8);
      const endMat = new THREE.MeshStandardMaterial({ color: COL_BASE_PATH });
      const endMesh = new THREE.Mesh(endGeo, endMat);
      const s1 = path.gamma(1);
      endMesh.position.set(s1[0], 0, s1[1]);
      group.add(endMesh);
    }

    // Direction arrow: cone at ~60% along the path
    const tA = 0.58, tB = 0.62;
    const zA = path.gamma(tA);
    const zB = path.gamma(tB);
    const dir = new THREE.Vector3(zB[0] - zA[0], 0, zB[1] - zA[1]).normalize();
    const coneGeo = new THREE.ConeGeometry(0.06, 0.18, 8);
    const coneMat = new THREE.MeshStandardMaterial({ color: COL_BASE_PATH });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    const mid = path.gamma(0.6);
    cone.position.set(mid[0], 0, mid[1]);
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    cone.quaternion.copy(quat);
    group.add(cone);
  }

  /** Draw the contour lifted onto the surface (at the aspect-specific height). */
  private buildLiftedPath(
    group: THREE.Group, fn: (z: C) => C,
    path: PathPreset, aspect: Aspect,
  ): void {
    const N = 200;
    const [clampMin, clampMax] = aspect.clamp;
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const z = path.gamma(t);
      const w = fn(z);
      let h = aspect.extract(w);
      h = Math.max(clampMin, Math.min(clampMax, h));
      if (!isFinite(h)) h = clampMax;
      pts.push(new THREE.Vector3(z[0], h, z[1]));
    }

    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: COL_LIFTED_PATH, linewidth: 2 });
    group.add(new THREE.Line(geo, mat));

    // Start sphere on surface
    const s0 = path.gamma(0);
    const w0 = fn(s0);
    let h0 = aspect.extract(w0);
    h0 = Math.max(clampMin, Math.min(clampMax, h0));
    if (!isFinite(h0)) h0 = clampMax;
    const dotGeo = new THREE.SphereGeometry(0.06, 12, 8);
    const dotMat = new THREE.MeshStandardMaterial({ color: COL_LIFTED_PATH });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(s0[0], h0, s0[1]);
    group.add(dot);
  }

  /** Draw vertical curtain lines connecting base path to lifted path. */
  private buildCurtainLines(
    group: THREE.Group, fn: (z: C) => C,
    path: PathPreset, aspect: Aspect,
  ): void {
    const total = 200;
    const step = 15;
    const [clampMin, clampMax] = aspect.clamp;

    const positions: number[] = [];
    for (let i = 0; i <= total; i += step) {
      const t = i / total;
      const z = path.gamma(t);
      const w = fn(z);
      let h = aspect.extract(w);
      h = Math.max(clampMin, Math.min(clampMax, h));
      if (!isFinite(h)) h = clampMax;

      positions.push(z[0], 0, z[1]);
      positions.push(z[0], h, z[1]);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',
      new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: COL_CURTAIN,
      transparent: true,
      opacity: 0.5,
    });
    group.add(new THREE.LineSegments(geo, mat));
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
