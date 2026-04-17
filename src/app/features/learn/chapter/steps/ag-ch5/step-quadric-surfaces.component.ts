import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Quadric preset definitions ── */

interface QuadricPreset {
  name: string;
  tex: string;
  param: (u: number, v: number, s: number) => [number, number, number];
  uRange: [number, number];
  vRange: [number, number];
  sliderLabel: string;
  sliderRange: [number, number];
  sliderDefault: number;
  isSaddle?: boolean;
  hasTwoSheets?: boolean;
}

const PRESETS: QuadricPreset[] = [
  {
    name: '橢球面',
    tex: 'x^2/a^2 + y^2 + z^2 = 1',
    param: (u: number, v: number, s: number) => {
      const a = s;
      return [a * Math.sin(u) * Math.cos(v), Math.sin(u) * Math.sin(v), Math.cos(u)];
    },
    uRange: [0, Math.PI],
    vRange: [0, 2 * Math.PI],
    sliderLabel: 'a (x 軸)',
    sliderRange: [0.5, 3],
    sliderDefault: 1.5,
  },
  {
    name: '單葉雙曲面',
    tex: 'x^2 + y^2 - z^2/c^2 = 1',
    param: (u: number, v: number, c: number) => [
      Math.cosh(u) * Math.cos(v),
      Math.cosh(u) * Math.sin(v),
      c * Math.sinh(u),
    ],
    uRange: [-1.5, 1.5],
    vRange: [0, 2 * Math.PI],
    sliderLabel: 'c (z 縮放)',
    sliderRange: [0.3, 2],
    sliderDefault: 1,
  },
  {
    name: '圓錐面',
    tex: 'x^2 + y^2 = z^2',
    param: (u: number, v: number, _s: number) => [
      u * Math.cos(v),
      u * Math.sin(v),
      u,
    ],
    uRange: [-2, 2],
    vRange: [0, 2 * Math.PI],
    sliderLabel: '高度',
    sliderRange: [1, 3],
    sliderDefault: 2,
  },
  {
    name: '拋物面',
    tex: 'z = x^2/a + y^2',
    param: (u: number, v: number, a: number) => [
      a * u * Math.cos(v),
      u * Math.sin(v),
      u * u,
    ],
    uRange: [0, 1.8],
    vRange: [0, 2 * Math.PI],
    sliderLabel: 'a (扁平度)',
    sliderRange: [0.5, 2],
    sliderDefault: 1,
  },
  {
    name: '馬鞍面',
    tex: 'z = x^2 - a \\cdot y^2',
    param: (x: number, z: number, a: number) => [x, x * x - a * z * z, z],
    uRange: [-1.5, 1.5],
    vRange: [-1.5, 1.5],
    sliderLabel: 'a (曲率比)',
    sliderRange: [0.2, 2],
    sliderDefault: 1,
    isSaddle: true,
  },
  {
    name: '雙葉雙曲面',
    tex: '-x^2 - y^2 + z^2/c^2 = 1',
    param: (u: number, v: number, c: number) => [
      Math.sinh(u) * Math.cos(v),
      Math.sinh(u) * Math.sin(v),
      c * Math.cosh(u),
    ],
    uRange: [-1.5, 1.5],
    vRange: [0, 2 * Math.PI],
    sliderLabel: 'c (間距)',
    sliderRange: [0.5, 2],
    sliderDefault: 1,
    hasTwoSheets: true,
  },
];

/* ── Constants ── */
const RES = 80;
const COL_BG = 0x141418;

@Component({
  selector: 'app-step-quadric-surfaces',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="二次曲面" subtitle="&sect;5.2">
      <p>
        <strong>二次曲面</strong>（quadric surface）是由二次多項式定義的曲面。
        雖然只比平面（一次）多了一個次數，它們卻展現出豐富的幾何：
        橢球面、雙曲面、圓錐面、拋物面、馬鞍面。
      </p>
      <p>
        二次曲面可以用矩陣的特徵值來分類。正定矩陣給出封閉的橢球面；
        一個負特徵值產生馬鞍形或雙曲面；退化（零特徵值）產生柱面或圓錐面。
        這是線性代數與代數幾何的直接聯繫。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇不同的二次曲面類型，拖動滑桿觀察形狀變化">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i"
                  (click)="selectPreset(i)">{{ p.name }}</button>
        }
      </div>

      <!-- Slider -->
      <div class="slider-row">
        <div class="slider-group">
          <span class="sl-label">{{ curPreset().sliderLabel }} = {{ sliderVal().toFixed(2) }}</span>
          <input type="range"
                 [min]="curPreset().sliderRange[0]"
                 [max]="curPreset().sliderRange[1]"
                 step="0.02"
                 [value]="sliderVal()"
                 (input)="sliderVal.set(+($any($event.target)).value)"
                 class="sl-input" />
        </div>
      </div>

      <!-- Three.js container -->
      <div #threeContainer class="three-container"></div>

      <!-- Controls -->
      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetCamera()">重置視角</button>
      </div>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">曲面類型</div>
          <div class="ic-body">{{ curPreset().name }}</div>
        </div>
        <div class="info-card eq-card">
          <div class="ic-title">方程</div>
          <div class="ic-body">
            <app-math [e]="curPreset().tex" />
          </div>
        </div>
        <div class="info-card">
          <div class="ic-title">{{ curPreset().sliderLabel }}</div>
          <div class="ic-body accent">{{ sliderVal().toFixed(2) }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        二次曲面的分類是一個完美的例子，說明代數（矩陣特徵值）如何完全決定幾何（曲面形狀）。
        在射影幾何中，二次曲面的分類更加簡潔——所有非退化二次曲面在射影等價下都是相同的。
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
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }
    .slider-row {
      display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .slider-group {
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 160px;
    }
    .sl-label {
      font-size: 12px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 130px;
    }
    .sl-input { flex: 1; accent-color: var(--accent); }

    .three-container {
      width: 100%; height: 420px;
      border-radius: 10px; border: 1px solid var(--border);
      overflow: hidden; margin-bottom: 10px;
    }

    .ctrl-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .ctrl-btn {
      padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px;
      cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
    }

    .info-row {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 100px; padding: 10px 12px; border: 1px solid var(--border);
      border-radius: 8px; text-align: center; background: var(--bg-surface);
    }
    .eq-card {
      flex: 2; min-width: 180px;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ic-body {
      font-size: 12px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 4px;
    }
    .ic-body.accent { color: var(--accent); font-size: 16px; }
  `,
})
export class StepQuadricSurfacesComponent implements OnDestroy {
  readonly presets = PRESETS;

  readonly selIdx = signal(0);
  readonly sliderVal = signal(PRESETS[0].sliderDefault);

  readonly curPreset = computed(() => PRESETS[this.selIdx()]);

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
  private lastSliderVal = -999;

  constructor() {
    afterNextRender(() => {
      this.initThree();
      this.rebuildMesh();
    });
  }

  selectPreset(idx: number): void {
    this.selIdx.set(idx);
    this.sliderVal.set(PRESETS[idx].sliderDefault);
    this.rebuildMesh();
  }

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(3.5, 2.8, 3.5);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /* ── Three.js initialization ── */

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COL_BG);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(3.5, 2.8, 3.5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 12;
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

    // Grid
    const grid = new THREE.GridHelper(6, 16, 0x2a2a30, 0x222228);
    this.scene.add(grid);

    // Dynamic group
    this.dynamicGroup = new THREE.Group();
    this.scene.add(this.dynamicGroup);

    // Animation loop
    const animate = (): void => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls!.update();

      // Check if mesh needs rebuilding
      const idx = this.selIdx();
      const sv = this.sliderVal();
      if (idx !== this.lastPresetIdx || Math.abs(sv - this.lastSliderVal) > 0.001) {
        this.rebuildMesh();
      }

      this.renderer!.render(this.scene!, this.camera!);
    };
    animate();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);
  }

  /* ── Build parametric surface mesh ── */

  private rebuildMesh(): void {
    if (!this.dynamicGroup || !this.scene) return;
    this.clearGroup(this.dynamicGroup);

    const idx = this.selIdx();
    const sv = this.sliderVal();
    this.lastPresetIdx = idx;
    this.lastSliderVal = sv;

    const preset = PRESETS[idx];

    // Build main sheet
    const mesh = this.buildSheet(preset, sv, false);
    this.dynamicGroup.add(mesh);

    // Wireframe overlay
    const wire = new THREE.Mesh(
      mesh.geometry.clone(),
      new THREE.MeshBasicMaterial({
        color: 0x444444,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      }),
    );
    this.dynamicGroup.add(wire);

    // Second sheet for two-sheet hyperboloid
    if (preset.hasTwoSheets) {
      const mesh2 = this.buildSheet(preset, sv, true);
      this.dynamicGroup.add(mesh2);
      const wire2 = new THREE.Mesh(
        mesh2.geometry.clone(),
        new THREE.MeshBasicMaterial({
          color: 0x444444,
          wireframe: true,
          transparent: true,
          opacity: 0.08,
        }),
      );
      this.dynamicGroup.add(wire2);
    }
  }

  private buildSheet(preset: QuadricPreset, sliderVal: number, negateHeight: boolean): THREE.Mesh {
    const [u0, u1] = preset.uRange;
    const [v0, v1] = preset.vRange;
    const uSegs = RES;
    const vSegs = RES;

    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    // Generate vertices
    for (let i = 0; i <= uSegs; i++) {
      for (let j = 0; j <= vSegs; j++) {
        const u = u0 + (i / uSegs) * (u1 - u0);
        const v = v0 + (j / vSegs) * (v1 - v0);
        const [px, py, pz] = preset.param(u, v, sliderVal);

        // In Three.js: x = px, y = pz (height), z = py
        const yVal = negateHeight ? -pz : pz;
        vertices.push(px, yVal, py);

        // Color by height (y in Three.js)
        const h = (yVal + 2) / 4; // normalize roughly to [0, 1]
        const hue = 0.55 + h * 0.3; // blue to teal range, muted
        const sat = 0.25;
        const light = 0.42 + h * 0.16;
        const col = new THREE.Color().setHSL(hue % 1, sat, light);
        colors.push(col.r, col.g, col.b);
      }
    }

    // Generate indices
    for (let i = 0; i < uSegs; i++) {
      for (let j = 0; j < vSegs; j++) {
        const a = i * (vSegs + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (vSegs + 1) + j;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.82,
      metalness: 0.0,
      transparent: true,
      opacity: 0.88,
    });

    return new THREE.Mesh(geometry, material);
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
      try { container.removeChild(this.renderer.domElement); } catch { /* already removed */ }
    }
    this.resizeObserver?.disconnect();
  }
}
