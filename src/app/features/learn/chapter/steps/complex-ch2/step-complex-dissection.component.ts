import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cMul, cExp, cSin, cCos,
} from '../complex-ch1/complex-util';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Constants ── */
const COL_BG = 0x141418;
const RANGE = 2;
const SEGMENTS = 120;

/* ── Preset functions ── */
interface FuncPreset {
  label: string;
  tex: string;
  fn: (z: C) => C;
}

const PRESETS: FuncPreset[] = [
  {
    label: 'z\u00B2',
    tex: 'f(z) = z^2',
    fn: (z: C): C => cMul(z, z),
  },
  {
    label: 'e\u1DBBz',
    tex: 'f(z) = e^z',
    fn: (z: C): C => cExp(z),
  },
  {
    label: 'sin z',
    tex: 'f(z) = \\sin z',
    fn: (z: C): C => cSin(z),
  },
  {
    label: 'cos z',
    tex: 'f(z) = \\cos z',
    fn: (z: C): C => cCos(z),
  },
  {
    label: '1/z',
    tex: 'f(z) = 1/z',
    fn: (z: C): C => {
      const d = z[0] * z[0] + z[1] * z[1];
      return d < 1e-10 ? [1e4, 0] : [z[0] / d, -z[1] / d];
    },
  },
];

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
  { key: 'abs', label: '|f|', extract: (w: C) => Math.sqrt(w[0] * w[0] + w[1] * w[1]), clamp: [0, 4] },
  { key: 'arg', label: 'arg(f)', extract: (w: C) => Math.atan2(w[1], w[0]), clamp: [-Math.PI, Math.PI] },
  { key: 'dc', label: '\u6A21+\u5E45\u89D2', extract: (w: C) => Math.sqrt(w[0] * w[0] + w[1] * w[1]), clamp: [0, 4] },
];

/* ── Viewport position mapping ── */
interface VPLayout { col: number; row: number; }
const VP_POSITIONS: VPLayout[] = [
  { col: 0, row: 0 }, // top-left
  { col: 1, row: 0 }, // top-right
  { col: 0, row: 1 }, // bottom-left
  { col: 1, row: 1 }, // bottom-right
];

@Component({
  selector: 'app-step-complex-dissection',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="\u8907\u8B8A\u51FD\u6578\u7684 3D \u89E3\u5256" subtitle="&sect;2.5">
      <p>
        \u8907\u8B8A\u51FD\u6578 f(z) = u + iv \u628A\u5E73\u9762\u6620\u5C04\u5230\u5E73\u9762\u3002
        \u6211\u5011\u53EF\u4EE5\u5206\u5225\u628A Re(f)\u3001Im(f)\u3001|f|\u3001arg(f) \u756B\u6210 3D \u66F2\u9762\u2014\u2014\u5F9E\u4E0D\u540C\u89D2\u5EA6\u300C\u89E3\u5256\u300D\u540C\u4E00\u500B\u51FD\u6578\u3002
      </p>
      <app-math block [e]="mainFormula" />
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u64C7\u51FD\u6578\uFF0C\u65CB\u8F49 3D \u8996\u5716\uFF0C\u540C\u6642\u89C0\u5BDF\u5BE6\u90E8\u3001\u865B\u90E8\u3001\u6A21\u548C\u5E45\u89D2\u7684\u66F2\u9762\u5F62\u72C0">
      <div class="ctrl-row">
        @for (p of presets; track p.label) {
          <button class="preset-btn"
                  [class.active]="activeIdx() === $index"
                  (click)="selectPreset($index)">
            {{ p.label }}
          </button>
        }
      </div>

      <div class="toggle-row">
        @for (a of aspects; track a.key) {
          <button class="toggle-btn"
                  [class.active]="aspectActive()[$index]"
                  (click)="toggleAspect($index)">
            {{ a.label }}
          </button>
        }
      </div>

      <!-- Color legend for arg / domain coloring -->
      <div class="color-legend">
        <svg viewBox="0 0 240 32" class="legend-bar">
          <defs>
            <linearGradient id="argGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="hsl(0,60%,52%)" />
              <stop offset="16.7%" stop-color="hsl(60,60%,52%)" />
              <stop offset="33.3%" stop-color="hsl(120,60%,52%)" />
              <stop offset="50%" stop-color="hsl(180,60%,52%)" />
              <stop offset="66.7%" stop-color="hsl(240,60%,52%)" />
              <stop offset="83.3%" stop-color="hsl(300,60%,52%)" />
              <stop offset="100%" stop-color="hsl(360,60%,52%)" />
            </linearGradient>
          </defs>
          <rect x="8" y="2" width="224" height="10" rx="2" fill="url(#argGrad)" opacity="0.85" />
          <text x="8" y="26" class="leg-tick">-\u03C0</text>
          <text x="64" y="26" class="leg-tick">-\u03C0/2</text>
          <text x="120" y="26" class="leg-tick">0</text>
          <text x="176" y="26" class="leg-tick">\u03C0/2</text>
          <text x="232" y="26" class="leg-tick">\u03C0</text>
        </svg>
        <span class="legend-caption">arg(f) \u2192 \u984F\u8272</span>
      </div>

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

      <!-- Cross-section -->
      <div class="slice-ctrl">
        <span class="slice-label">\u622A\u9762 Im = {{ sliceY().toFixed(2) }}</span>
        <input type="range" class="slice-slider" min="-2" max="2" step="0.05"
               [value]="sliceY()"
               (input)="onSliceChange($event)" />
      </div>

      <svg viewBox="0 0 520 150" class="slice-svg">
        <!-- axes -->
        <line x1="40" y1="130" x2="490" y2="130" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="130" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" [attr.y1]="sliceFy(0)" x2="490" [attr.y2]="sliceFy(0)"
              stroke="var(--text-muted)" stroke-width="0.5" stroke-dasharray="3 3" />
        <text x="495" y="134" class="slice-ax-lbl">Re</text>
        <!-- tick labels -->
        @for (t of sliceTicks; track t.key) {
          <text [attr.x]="t.x" [attr.y]="t.y" class="slice-tick">{{ t.label }}</text>
        }
        <!-- aspect curves -->
        @for (c of sliceCurves(); track c.key) {
          <path [attr.d]="c.d" fill="none" [attr.stroke]="c.color" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round" />
          <text [attr.x]="c.labelX" [attr.y]="c.labelY" [attr.fill]="c.color"
                class="slice-curve-lbl">{{ c.label }}</text>
        }
      </svg>

      <div class="func-info">
        <app-math [e]="activeTex()" />
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u5F9E 3D \u66F2\u9762\u53EF\u4EE5\u76F4\u89C0\u770B\u51FA\uFF1Az\u00B2 \u7684\u5BE6\u90E8\u662F\u99AC\u978D\u5F62\uFF0C\u865B\u90E8\u4E5F\u662F\u99AC\u978D\u5F62\u4F46\u65CB\u8F49\u4E86 45 \u5EA6\u3002
        e\u1DBBz \u7684\u6A21\u6CBF\u5BE6\u8EF8\u6307\u6578\u589E\u9577\u3002sin z \u7684\u6A21\u6CBF\u865B\u8EF8\u7206\u70B8\u3002
        \u6BCF\u500B\u66F2\u9762\u90FD\u63ED\u793A\u4E86\u51FD\u6578\u7684\u4E00\u500B\u9762\u5411\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .preset-btn {
      padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.2s, border-color 0.2s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent);
        color: var(--text); font-weight: 600; }
    }

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

    .color-legend {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
      padding: 6px 10px; background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: 6px;
    }
    .legend-bar { width: 220px; height: 32px; flex-shrink: 0; }
    .leg-tick { font-size: 8px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .legend-caption { font-size: 10px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; white-space: nowrap; }

    .slice-ctrl {
      display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
      padding: 6px 10px; background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: 6px;
    }
    .slice-label { font-size: 11px; font-weight: 600; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
    .slice-slider { flex: 1; accent-color: var(--accent); }

    .slice-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg); margin-bottom: 10px; }
    .slice-ax-lbl { font-size: 9px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; }
    .slice-tick { font-size: 8px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .slice-curve-lbl { font-size: 9px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; }

    .func-info {
      padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center;
    }
  `,
})
export class StepComplexDissectionComponent implements OnDestroy {
  readonly presets = PRESETS;
  readonly aspects = ASPECTS;

  readonly mainFormula = String.raw`f(z) = \underbrace{u(x,y)}_{\text{實部}} + i\underbrace{v(x,y)}_{\text{虛部}}, \quad |f| = \sqrt{u^2+v^2}, \quad \arg f = \arctan(v/u)`;

  readonly activeIdx = signal(0);
  readonly activePreset = computed(() => PRESETS[this.activeIdx()]);
  readonly activeTex = computed(() => this.activePreset().tex);

  readonly aspectActive = signal([true, true, false, true, true]);
  readonly sliceY = signal(0);

  readonly visibleViewports = computed(() => {
    const flags = this.aspectActive();
    // Trigger recompute on preset change too (we read activeIdx for reactivity)
    this.activeIdx();
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
  /** Surface groups per aspect (for rebuilding) */
  private surfaceGroups: Record<string, THREE.Group> = {};
  /** Slice line groups per aspect */
  private sliceGroups: Record<string, THREE.Group> = {};

  constructor() {
    afterNextRender(() => {
      this.initThree();
      this.buildAllSurfaces();
      this.buildSliceLines();
      this.threeReady = true;
    });
  }

  selectPreset(idx: number): void {
    this.activeIdx.set(idx);
    if (this.threeReady) {
      this.buildAllSurfaces();
      this.buildSliceLines();
    }
  }

  onSliceChange(ev: Event): void {
    this.sliceY.set(parseFloat((ev.target as HTMLInputElement).value));
    if (this.threeReady) this.buildSliceLines();
  }

  toggleAspect(idx: number): void {
    const current = [...this.aspectActive()];
    // Ensure at least one stays active
    const activeCount = current.filter(Boolean).length;
    if (current[idx] && activeCount <= 1) return;
    current[idx] = !current[idx];
    this.aspectActive.set(current);
  }

  /* ── Three.js initialization ── */

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Camera (aspect = 1 since each viewport is square-ish)
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

      // Lights — soft, diffuse
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const dirLight = new THREE.DirectionalLight(0xffeedd, 0.55);
      dirLight.position.set(5, 8, 4);
      scene.add(dirLight);
      const fillLight = new THREE.DirectionalLight(0xccddff, 0.2);
      fillLight.position.set(-3, 5, -3);
      scene.add(fillLight);

      // Grid — fine, very subtle
      const grid = new THREE.GridHelper(RANGE * 2, 16, 0x2a2a30, 0x222228);
      scene.add(grid);

      // Re-axis (muted warm)
      const reAxisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-RANGE, 0.005, 0),
        new THREE.Vector3(RANGE, 0.005, 0),
      ]);
      scene.add(new THREE.Line(reAxisGeo, new THREE.LineBasicMaterial({ color: 0x886655 })));

      // Im-axis (muted cool)
      const imAxisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.005, -RANGE),
        new THREE.Vector3(0, 0.005, RANGE),
      ]);
      scene.add(new THREE.Line(imAxisGeo, new THREE.LineBasicMaterial({ color: 0x556688 })));

      // Surface group (will be rebuilt on preset change)
      const surfGroup = new THREE.Group();
      scene.add(surfGroup);
      this.surfaceGroups[aspect.key] = surfGroup;

      const sliceGroup = new THREE.Group();
      scene.add(sliceGroup);
      this.sliceGroups[aspect.key] = sliceGroup;

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

  /* ── Build all surfaces for current preset ── */

  private buildAllSurfaces(): void {
    const f = this.activePreset().fn;

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

        // Set height (Y)
        posAttr.setY(i, val);

        // Vertex color — for 'dc', color by arg(f) instead of height
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
    }
  }

  /* ── Color schemes per aspect ── */

  private aspectColor(key: string, val: number, lo: number, hi: number): [number, number, number] {
    const c = new THREE.Color();
    const t = (val - lo) / (hi - lo); // 0..1

    switch (key) {
      case 're': {
        // Diverging muted teal → warm gray → sage
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
        // Diverging warm clay → warm gray → muted lavender
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
        // Sequential deep indigo → warm ivory → deep amber
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
        // Muted cyclical — desaturated hue wheel
        const h = (val + Math.PI) / (2 * Math.PI);
        c.setHSL(h, 0.35, 0.48);
        break;
      }
      case 'dc': {
        // Domain coloring — vivid cyclical hue for phase, slightly richer
        const h = (val + Math.PI) / (2 * Math.PI);
        c.setHSL(h, 0.6, 0.52);
        break;
      }
      default:
        c.setRGB(0.4, 0.4, 0.4);
    }

    return [c.r, c.g, c.b];
  }

  /* ── Build slice highlight lines in 3D ── */

  private buildSliceLines(): void {
    const f = this.activePreset().fn;
    const y0 = this.sliceY();

    for (const aspect of ASPECTS) {
      const group = this.sliceGroups[aspect.key];
      if (!group) continue;
      this.clearGroup(group);

      // Base reference line (thin, on y=0 plane)
      const basePts = [new THREE.Vector3(-RANGE, 0.003, y0), new THREE.Vector3(RANGE, 0.003, y0)];
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(basePts),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }),
      ));

      // Lifted line on the surface
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 200; i++) {
        const x = -RANGE + (i / 200) * RANGE * 2;
        const w = f([x, y0]);
        let h = aspect.extract(w);
        h = Math.max(aspect.clamp[0], Math.min(aspect.clamp[1], h));
        if (!isFinite(h)) h = aspect.clamp[1];
        pts.push(new THREE.Vector3(x, h + 0.015, y0));
      }
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
      ));
    }
  }

  /* ── 2D cross-section SVG data ── */

  private static readonly SLICE_COLORS: Record<string, string> = {
    re: '#6a9a8a', im: '#9a7a6a', abs: '#6a7a9a', arg: '#8a6a9a', dc: '#9a8a6a',
  };

  /** Map Re value to SVG x */
  private sliceFxVal(x: number): number { return 40 + ((x + RANGE) / (RANGE * 2)) * 450; }
  /** Map aspect value to SVG y */
  sliceFy(v: number): number { return 70 - v * 18; }

  readonly sliceTicks = (() => {
    const ticks: { key: string; x: number; y: number; label: string }[] = [];
    for (let k = -2; k <= 2; k++) {
      ticks.push({ key: `sx${k}`, x: this.sliceFxVal(k), y: 143, label: `${k}` });
    }
    return ticks;
  })();

  readonly sliceCurves = computed(() => {
    const f = this.activePreset().fn;
    const y0 = this.sliceY();
    const flags = this.aspectActive();
    const curves: { key: string; label: string; color: string; d: string; labelX: number; labelY: number }[] = [];

    for (let ai = 0; ai < ASPECTS.length; ai++) {
      if (!flags[ai]) continue;
      const asp = ASPECTS[ai];
      if (asp.key === 'dc') continue; // skip dc in 2D (same height as abs)
      let d = '';
      let lastY = 0;
      for (let i = 0; i <= 200; i++) {
        const x = -RANGE + (i / 200) * RANGE * 2;
        const w = f([x, y0]);
        let v = asp.extract(w);
        v = Math.max(asp.clamp[0], Math.min(asp.clamp[1], v));
        if (!isFinite(v)) v = 0;
        const sx = this.sliceFxVal(x);
        const sy = this.sliceFy(v);
        d += (i === 0 ? 'M' : 'L') + `${sx.toFixed(1)},${sy.toFixed(1)}`;
        if (i === 180) lastY = sy;
      }
      curves.push({
        key: asp.key, label: asp.label,
        color: StepComplexDissectionComponent.SLICE_COLORS[asp.key] || '#888',
        d, labelX: 460, labelY: lastY - 4,
      });
    }
    return curves;
  });

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
