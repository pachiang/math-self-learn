import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAbs, cArg, cExp, cSin, cFromPolar,
} from '../complex-ch1/complex-util';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Constants ── */
const COL_BG = 0x141418;
const RANGE = 4;
const SEGMENTS = 120;
const TWO_PI = 2 * Math.PI;

/* ── Preset functions ── */
interface LiouPreset {
  label: string;
  tex: string;
  fn: (z: C) => C;
  bounded: boolean;
  isConstant: boolean;
}

const PRESETS: LiouPreset[] = [
  {
    label: 'f=3 (\u5E38\u6578)',
    tex: 'f(z) = 3',
    fn: (_z: C): C => [3, 0],
    bounded: true,
    isConstant: true,
  },
  {
    label: 'f=z (\u7DDA\u6027)',
    tex: 'f(z) = z',
    fn: (z: C): C => z,
    bounded: false,
    isConstant: false,
  },
  {
    label: 'f=e\u1DBBz',
    tex: 'f(z) = e^z',
    fn: (z: C): C => cExp(z),
    bounded: false,
    isConstant: false,
  },
  {
    label: 'f=sin z',
    tex: 'f(z) = \\sin z',
    fn: (z: C): C => cSin(z),
    bounded: false,
    isConstant: false,
  },
];

const SAMPLE_RADII = [1, 2, 5];

function maxModOnCircle(f: (z: C) => C, R: number, N: number): number {
  let maxVal = 0;
  for (let k = 0; k < N; k++) {
    const theta = TWO_PI * k / N;
    const z = cFromPolar(R, theta);
    const val = cAbs(f(z));
    if (val > maxVal) maxVal = val;
  }
  return maxVal;
}

/* ── Aspect definitions ── */
interface Aspect {
  key: string;
  label: string;
  extract: (w: C) => number;
  clamp: [number, number];
}

const ASPECTS: Aspect[] = [
  { key: 're', label: 'Re(f)', extract: (w: C) => w[0], clamp: [-6, 6] },
  { key: 'im', label: 'Im(f)', extract: (w: C) => w[1], clamp: [-6, 6] },
  { key: 'dc', label: '\u6A21+\u5E45\u89D2', extract: (w: C) => Math.sqrt(w[0] * w[0] + w[1] * w[1]), clamp: [0, 6] },
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

@Component({
  selector: 'app-step-liouville',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Liouville \u5B9A\u7406" subtitle="&sect;3.4">
      <p>
        Liouville \u5B9A\u7406\uFF1A\u4E00\u500B\u6709\u754C\u7684\u6574\u51FD\u6578\uFF08\u5728\u6574\u500B &#x2102; \u4E0A\u89E3\u6790\uFF09\u5FC5\u7136\u662F\u5E38\u6578\u3002
        \u9019\u6709\u4E00\u500B\u9A5A\u4EBA\u7684\u63A8\u8AD6\uFF1A\u4EE3\u6578\u57FA\u672C\u5B9A\u7406\u2014\u2014\u6BCF\u500B\u975E\u5E38\u6578\u591A\u9805\u5F0F\u5728 &#x2102; \u4E2D\u90FD\u6709\u6839\u3002
      </p>
      <app-math block [e]="liouvilleFormula" />
      <p>
        \u8B49\u660E\u601D\u8DEF\uFF1A\u5C0D f'(z&#x2080;) \u4F7F\u7528 Cauchy \u7A4D\u5206\u516C\u5F0F\uFF0C\u53D6\u534A\u5F91 R \u7684\u5713\u3002
        \u7531\u65BC f \u6709\u754C\uFF08\u8A2D |f| &#x2264; M\uFF09\uFF0C\u5F97 |f'(z&#x2080;)| &#x2264; M/R\u3002
        \u4EE4 R &#x2192; &#x221E;\uFF0Cf'(z&#x2080;) = 0\u3002\u6240\u4EE5 f \u662F\u5E38\u6578\u3002
      </p>
      <app-math block [e]="estimateFormula" />
      <p>
        \u63A8\u8AD6\uFF1A\u4EE3\u6578\u57FA\u672C\u5B9A\u7406\u3002\u82E5 p(z) \u7121\u6839\uFF0C\u5247 1/p(z) \u662F\u6574\u51FD\u6578\u4E14\u6709\u754C
        &#x2192; \u5E38\u6578 &#x2192; \u77DB\u76FE\u3002
      </p>
      <app-math block [e]="ftaFormula" />
    </app-prose-block>

    <app-challenge-card prompt="\u89C0\u5BDF\uFF1A\u6709\u754C\u7684\u89E3\u6790\u51FD\u6578\u6709\u591A\u300C\u7121\u804A\u300D\u2014\u2014\u62C9\u5927\u89C0\u5BDF\u7BC4\u570D\uFF0C\u5B83\u5C31\u662F\u5E38\u6578">
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
          <div class="info-label">max|f| on |z|=R</div>
          <div class="val-table">
            @for (entry of tableEntries(); track entry.R) {
              <div class="val-entry">
                <span class="val-r">R={{ entry.R }}</span>
                <span class="val-v">{{ entry.display }}</span>
              </div>
            }
          </div>
        </div>
        <div class="info-card badge-card">
          <div class="bound-badge" [class.bounded]="isBounded()" [class.unbounded]="!isBounded()">
            {{ isBounded() ? '\u6709\u754C' : '\u7121\u754C' }}
          </div>
          <div class="badge-sub">
            {{ isBounded()
              ? '\u6574\u51FD\u6578\u4E14\u6709\u754C \u2192 \u5FC5\u70BA\u5E38\u6578'
              : '\u96A8 R \u589E\u5927\uFF0Cmax|f| \u589E\u9577 \u2192 \u975E\u5E38\u6578' }}
          </div>
        </div>
      </div>

      <div class="func-info">
        <app-math [e]="activeTex()" />
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u770B\u4F3C\u7C21\u55AE\u7684 Liouville \u5B9A\u7406\u8586\u542B\u4E86\u4EE3\u6578\u57FA\u672C\u5B9A\u7406\u2014\u2014
        \u6BCF\u500B\u591A\u9805\u5F0F\u5728 &#x2102; \u4E2D\u90FD\u6709\u6839\u3002
        \u8907\u5206\u6790\u7684\u529B\u91CF\u5728\u65BC\uFF1A\u89E3\u6790\u6027\u52A0\u4E0A\u5168\u57DF\u6027\u8CEA\uFF08\u5982\u6709\u754C\uFF09\uFF0C
        \u5C31\u80FD\u63A8\u51FA\u6975\u5F37\u7684\u7D50\u8AD6\u3002\u4E0B\u4E00\u7BC0\u770B\u53E6\u4E00\u500B\u9A5A\u4EBA\u6027\u8CEA\u3002
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
    .info-card { flex: 1; min-width: 160px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
      font-family: 'JetBrains Mono', monospace; }
    .info-label { font-size: 11px; color: var(--text-muted); margin-bottom: 6px;
      text-align: center; }
    .val-table { display: flex; flex-direction: column; gap: 3px; }
    .val-entry { display: flex; justify-content: space-between; font-size: 12px; }
    .val-r { color: var(--text-muted); }
    .val-v { color: var(--text); font-weight: 600; }

    .badge-card { display: flex; flex-direction: column; align-items: center;
      justify-content: center; text-align: center; }
    .bound-badge { padding: 6px 16px; border-radius: 6px;
      font-size: 14px; font-weight: 700; margin-bottom: 6px;
      &.bounded { background: rgba(90, 138, 90, 0.12); color: #3a7a3a;
        border: 1px solid rgba(90, 138, 90, 0.3); }
      &.unbounded { background: rgba(200, 140, 60, 0.12); color: #b07830;
        border: 1px solid rgba(200, 140, 60, 0.3); } }
    .badge-sub { font-size: 11px; color: var(--text-secondary); }

    .func-info { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
  `,
})
export class StepLiouvilleComponent implements OnDestroy {
  readonly presets = PRESETS;
  readonly aspects = ASPECTS;

  readonly liouvilleFormula = String.raw`f : \mathbb{C} \to \mathbb{C} \text{ \u89E3\u6790\u4E14\u6709\u754C} \;\Longrightarrow\; f \text{ \u662F\u5E38\u6578}`;
  readonly estimateFormula = String.raw`|f'(z_0)| \le \frac{M}{R} \;\xrightarrow{R\to\infty}\; 0`;
  readonly ftaFormula = String.raw`\forall\, p(z) \in \mathbb{C}[z],\; \deg p \ge 1 \;\Longrightarrow\; \exists\, z_0 \in \mathbb{C},\; p(z_0) = 0`;

  readonly activeIdx = signal(0);
  readonly activePreset = computed(() => PRESETS[this.activeIdx()]);
  readonly activeTex = computed(() => this.activePreset().tex);
  readonly isBounded = computed(() => this.activePreset().bounded);

  /** Compute max|f| for sample radii */
  readonly tableEntries = computed(() => {
    const f = this.activePreset().fn;
    return SAMPLE_RADII.map(R => {
      const maxF = maxModOnCircle(f, R, 200);
      return {
        R,
        display: maxF > 1e6 ? maxF.toExponential(2) : maxF.toFixed(3),
      };
    });
  });

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

    // Camera (aspect = 1 since each viewport is square-ish)
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    this.camera.position.set(5, 5, 5);
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
    this.controls.maxDistance = 20;
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

    // Clear entire canvas
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
    const preset = this.activePreset();
    const f = preset.fn;

    for (const aspect of ASPECTS) {
      const group = this.surfaceGroups[aspect.key];
      if (!group) continue;
      this.clearGroup(group);

      // Build surface geometry
      const geo = new THREE.PlaneGeometry(RANGE * 2, RANGE * 2, SEGMENTS, SEGMENTS);
      geo.rotateX(-Math.PI / 2);

      const posAttr = geo.getAttribute('position');
      const vertexCount = posAttr.count;
      const colors = new Float32Array(vertexCount * 3);

      const [clampMin, clampMax] = aspect.clamp;

      for (let i = 0; i < vertexCount; i++) {
        const gx = posAttr.getX(i);
        const gz = posAttr.getZ(i);

        const w = f([gx, gz]);
        let val = aspect.extract(w);

        // Clamp
        val = Math.max(clampMin, Math.min(clampMax, val));
        if (!isFinite(val)) val = clampMax;

        // Set height
        posAttr.setY(i, val);

        // Vertex color
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
        roughness: 0.82,
        metalness: 0.0,
      });

      group.add(new THREE.Mesh(geo, mat));

      // For f=3 (constant): add translucent reference plane in dc scene
      if (preset.isConstant && aspect.key === 'dc') {
        const refGeo = new THREE.PlaneGeometry(RANGE * 2, RANGE * 2);
        refGeo.rotateX(-Math.PI / 2);
        refGeo.translate(0, 3, 0);
        const refMat = new THREE.MeshBasicMaterial({
          color: 0x44aa44,
          transparent: true,
          opacity: 0.12,
          side: THREE.DoubleSide,
        });
        group.add(new THREE.Mesh(refGeo, refMat));

        // Wire border for reference plane
        const edgeGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-RANGE, 3, -RANGE),
          new THREE.Vector3(RANGE, 3, -RANGE),
          new THREE.Vector3(RANGE, 3, RANGE),
          new THREE.Vector3(-RANGE, 3, RANGE),
          new THREE.Vector3(-RANGE, 3, -RANGE),
        ]);
        group.add(new THREE.Line(edgeGeo,
          new THREE.LineBasicMaterial({ color: 0x44aa44, transparent: true, opacity: 0.5 })));
      }
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
    // Keep aspect = 1 for square viewports
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
