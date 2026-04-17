import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAbs, cArg, cMul, cDiv, cInv, cExp, cSin,
} from '../complex-ch1/complex-util';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Constants ── */
const COL_BG = 0x141418;
const RANGE = 2;
const SEGMENTS = 120;

/* ── Singularity type definitions ── */

type SingularityKind = 'removable' | 'pole' | 'essential';

interface SingularityPreset {
  label: string;
  tex: string;
  kind: SingularityKind;
  kindLabel: string;
  principalTerms: string;
  fn: (z: C) => C;
  description: string;
}

const PRESETS: SingularityPreset[] = [
  {
    label: 'sin(z)/z (\u53EF\u53BB)',
    tex: String.raw`f(z) = \frac{\sin z}{z}`,
    kind: 'removable',
    kindLabel: '\u53EF\u53BB\u5947\u7570\u9EDE',
    principalTerms: '0 (\u4E3B\u90E8\u70BA\u7A7A)',
    fn: (z: C): C => {
      const r2 = z[0] * z[0] + z[1] * z[1];
      if (r2 < 1e-12) return [1, 0];
      return cDiv(cSin(z), z);
    },
    description: '\u5728 z=0 \u8655\uFF0Csin(z)/z \u7684\u6975\u9650\u70BA 1\u3002\u5947\u7570\u9EDE\u53EF\u4EE5\u88AB\u586B\u88DC\uFF0C\u66F2\u9762\u5728\u539F\u9EDE\u9644\u8FD1\u5E73\u6ED1\u3002Laurent \u5C55\u958B\u6C92\u6709\u8CA0\u51AA\u9805\u3002',
  },
  {
    label: '1/z\u00B2 (\u4E8C\u968E\u6975\u9EDE)',
    tex: String.raw`f(z) = \frac{1}{z^2}`,
    kind: 'pole',
    kindLabel: '\u6975\u9EDE (\u4E8C\u968E)',
    principalTerms: '\u6709\u9650 (1 \u9805: z\u207B\u00B2)',
    fn: (z: C): C => {
      const r2 = z[0] * z[0] + z[1] * z[1];
      if (r2 < 1e-12) return [1e4, 0];
      return cInv(cMul(z, z));
    },
    description: '\u5728 z=0 \u8655\uFF0C|1/z\u00B2| \u8D8B\u5411\u7121\u7AAE\u5927\u3002\u66F2\u9762\u5448\u73FE\u885D\u5929\u7684\u5C16\u523A\u3002Laurent \u4E3B\u90E8\u6709\u6709\u9650\u500B\u8CA0\u51AA\u9805\u3002',
  },
  {
    label: 'e^(1/z) (\u672C\u6027)',
    tex: String.raw`f(z) = e^{1/z}`,
    kind: 'essential',
    kindLabel: '\u672C\u6027\u5947\u7570\u9EDE',
    principalTerms: '\u7121\u7AAE (\u6240\u6709 z\u207B\u207F \u9805)',
    fn: (z: C): C => {
      const r2 = z[0] * z[0] + z[1] * z[1];
      if (r2 < 1e-12) return [1e4, 0];
      return cExp(cInv(z));
    },
    description: '\u5728 z=0 \u8655\uFF0Ce^(1/z) \u6CBF\u4E0D\u540C\u65B9\u5411\u8D8B\u5411\u5B8C\u5168\u4E0D\u540C\u7684\u503C\u3002\u6839\u64DA Casorati-Weierstrass \u5B9A\u7406\uFF0C\u51FD\u6578\u5728\u672C\u6027\u5947\u7570\u9EDE\u9644\u8FD1\u5E7E\u4E4E\u53D6\u904D\u6240\u6709\u8907\u6578\u503C\u3002',
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

@Component({
  selector: 'app-step-singularities',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="\u5947\u7570\u9EDE\u5206\u985E" subtitle="&sect;4.3">
      <p>
        \u5B64\u7ACB\u5947\u7570\u9EDE\u5206\u70BA\u4E09\u985E\uFF0C\u6BCF\u4E00\u985E\u90FD\u6709\u7368\u7279\u7684 Laurent \u5C55\u958B\u7D50\u69CB\u548C\u903C\u8FD1\u884C\u70BA\uFF1A
      </p>

      <p>
        <strong>1. \u53EF\u53BB\u5947\u7570\u9EDE (Removable Singularity)</strong><br />
        \u51FD\u6578\u53EF\u4EE5\u91CD\u65B0\u5B9A\u7FA9\u70BA\u89E3\u6790\u7684\u3002Laurent \u5C55\u958B\u7684\u4E3B\u90E8\u70BA\u7A7A (\u6C92\u6709\u8CA0\u51AA\u9805)\u3002
      </p>
      <app-math block [e]="exRemovable" />

      <p>
        <strong>2. \u6975\u9EDE (Pole)</strong><br />
        <app-math [e]="'f(z) \\to \\infty'" /> \u7576
        <app-math [e]="'z \\to z_0'" />\u3002
        Laurent \u4E3B\u90E8\u6709\u6709\u9650\u500B\u9805\u3002\u82E5\u6700\u4F4E\u51AA\u6B21\u70BA
        <app-math [e]="'(z-z_0)^{-m}'" />\uFF0C\u5247\u7A31\u70BA m \u968E\u6975\u9EDE\u3002
      </p>
      <app-math block [e]="exPole" />

      <p>
        <strong>3. \u672C\u6027\u5947\u7570\u9EDE (Essential Singularity)</strong><br />
        Laurent \u4E3B\u90E8\u6709\u7121\u7AAE\u591A\u9805\u3002\u51FD\u6578\u5728 z_0 \u9644\u8FD1\u7684\u884C\u70BA\u6975\u5176\u8907\u96DC\u3002
      </p>
      <app-math block [e]="exEssential" />

      <p class="hint">
        <strong>Casorati-Weierstrass \u5B9A\u7406\uFF1A</strong>\u82E5 z_0 \u662F f \u7684\u672C\u6027\u5947\u7570\u9EDE\uFF0C
        \u5247\u5C0D\u4EFB\u610F w (\u81F3\u591A\u9664\u4E00\u500B\u4F8B\u5916\u503C)\uFF0C\u5B58\u5728\u8D8B\u5411 z_0 \u7684\u5E8F\u5217\u4F7F
        <app-math [e]="'f(z_n) \\to w'" />\u3002
        \u63DB\u8A00\u4E4B\uFF0Cf \u5728\u672C\u6027\u5947\u7570\u9EDE\u9644\u8FD1\u5E7E\u4E4E\u53D6\u904D\u6240\u6709\u8907\u6578\u503C\u3002
      </p>
    </app-prose-block>

    <app-challenge-card
      prompt="\u65CB\u8F49 3D \u66F2\u9762\u540C\u6642\u89C0\u5BDF Re/Im/|f|/arg -- \u53EF\u53BB\u5947\u7570\u9EDE\u662F\u53EF\u586B\u7684\u5C0F\u6D1E\u3001\u6975\u9EDE\u662F\u885D\u5929\u7684\u5C16\u523A\u3001\u672C\u6027\u5947\u7570\u9EDE\u662F\u760B\u72C2\u7684\u9707\u76EA">

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
          <div class="info-label">\u5947\u7570\u9EDE\u985E\u578B</div>
          <div class="info-val accent">{{ activePreset().kindLabel }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">\u4E3B\u90E8\u9805\u6578</div>
          <div class="info-val">{{ activePreset().principalTerms }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Laurent \u5C55\u958B</div>
          <div class="info-val"><app-math [e]="activePreset().tex" /></div>
        </div>
      </div>

      <!-- Description -->
      <div class="desc-card">
        <p class="desc-text">{{ activePreset().description }}</p>
        @if (activePreset().kind === 'essential') {
          <div class="theorem-badge">
            <app-math [e]="casWeierstrassTeX" />
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        3D \u66F2\u9762\u8B93\u5947\u7570\u9EDE\u7684\u6027\u8CEA\u4E00\u76EE\u77AD\u7136\u3002\u4E0B\u4E00\u7BC0\u770B\u96F6\u9EDE\u548C\u6975\u9EDE\u7684\u968E\u5982\u4F55\u5F71\u97FF\u51FD\u6578\u7684\u5C40\u90E8\u884C\u70BA\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .preset-row {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .preset-btn {
      padding: 6px 14px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.2s, border-color 0.2s;

      &:hover {
        background: var(--accent-10);
      }

      &.active {
        background: var(--accent-18);
        border-color: var(--accent);
        color: var(--text);
        font-weight: 600;
      }
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

    .info-row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .info-card {
      flex: 1;
      min-width: 120px;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
    }

    .info-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .info-val {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);

      &.accent {
        color: var(--accent);
      }
    }

    .desc-card {
      padding: 14px 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      margin-bottom: 10px;
    }

    .desc-text {
      margin: 0;
      font-size: 14px;
      line-height: 1.7;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .theorem-badge {
      margin-top: 10px;
      padding: 10px 14px;
      background: rgba(192, 80, 80, 0.08);
      border-left: 3px solid #c06060;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
    }
  `,
})
export class StepSingularitiesComponent implements OnDestroy {
  readonly presets = PRESETS;
  readonly aspects = ASPECTS;

  /* ── KaTeX expressions ── */
  readonly exRemovable = String.raw`\frac{\sin z}{z} = 1 - \frac{z^2}{3!} + \frac{z^4}{5!} - \cdots \quad (\text{\u4E3B\u90E8\u70BA\u7A7A\uFF0C\u53EF\u5728 } z=0 \text{ \u5B9A\u7FA9 } f(0)=1)`;
  readonly exPole = String.raw`\frac{1}{z^2} = z^{-2} \quad (\text{\u4E3B\u90E8\u53EA\u6709 } z^{-2} \text{ \u4E00\u9805\uFF0C\u4E8C\u968E\u6975\u9EDE})`;
  readonly exEssential = String.raw`e^{1/z} = \sum_{n=0}^{\infty} \frac{1}{n!\, z^n} = 1 + \frac{1}{z} + \frac{1}{2!\,z^2} + \cdots \quad (\text{\u4E3B\u90E8\u6709\u7121\u7AAE\u591A\u9805})`;
  readonly casWeierstrassTeX = String.raw`\textbf{Casorati\text{-}Weierstrass:}\;\forall\,w\in\mathbb{C},\;\forall\,\varepsilon>0,\;\exists\,z:\;|z-z_0|<\varepsilon,\;|f(z)-w|<\varepsilon`;

  /* ── Signals ── */
  readonly activeIdx = signal(0);
  readonly activePreset = computed(() => PRESETS[this.activeIdx()]);

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

  /* ── Preset switching ── */

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
    this.camera.position.set(3.5, 4.5, 3.5);
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
      const axisLen = RANGE + 0.2;
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
