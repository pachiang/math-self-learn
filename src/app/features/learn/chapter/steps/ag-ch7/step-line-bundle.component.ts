import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy, effect,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Constants ── */

const COL_BG = 0x141418;
const COL_ACCENT = 0x66aaff;
const COL_SECTION = 0xffaa44;
const COL_ZERO = 0xcc4444;
const U_SEGS = 120;
const V_SEGS = 20;

/* ── Bundle presets ── */

interface BundlePreset {
  key: string;
  name: string;
  halfTwists: number;        // number of half-twists (0 = cylinder, 1 = Mobius, 2 = O(2))
  trivial: boolean;
  minZeros: string;          // label for minimum zeros
  param: (u: number, v: number) => [number, number, number];
  section?: (u: number) => number;    // section v-offset as function of u
  sectionLabel?: string;
}

const PRESETS: BundlePreset[] = [
  {
    key: 'cylinder',
    name: '平凡線叢 (圓柱)',
    halfTwists: 0,
    trivial: true,
    minZeros: '0',
    param: (u, v) => [
      Math.cos(u),
      Math.sin(u),
      v,
    ],
    section: (u) => 0.25 * Math.sin(3 * u),
    sectionLabel: 's(u) = 0.25 sin(3u)',
  },
  {
    key: 'mobius',
    name: 'Mobius 帶 (非平凡)',
    halfTwists: 1,
    trivial: false,
    minZeros: '\\geq 1',
    param: (u, v) => [
      (1 + v * Math.cos(u / 2)) * Math.cos(u),
      (1 + v * Math.cos(u / 2)) * Math.sin(u),
      v * Math.sin(u / 2),
    ],
    section: (u) => 0.25 * Math.cos(u / 2),
    sectionLabel: 's(u) = 0.25 cos(u/2)',
  },
  {
    key: 'o2',
    name: 'O(2) — 兩次扭轉',
    halfTwists: 2,
    trivial: false,
    minZeros: '\\geq 2',
    param: (u, v) => [
      (1 + v * Math.cos(u)) * Math.cos(u),
      (1 + v * Math.cos(u)) * Math.sin(u),
      v * Math.sin(u),
    ],
    section: (u) => 0.25 * Math.cos(u),
    sectionLabel: 's(u) = 0.25 cos(u)',
  },
  {
    key: 'section-demo',
    name: '截面 (section)',
    halfTwists: 0,
    trivial: true,
    minZeros: '0',
    param: (u, v) => [
      Math.cos(u),
      Math.sin(u),
      v,
    ],
    section: (u) => 0.3 * Math.sin(3 * u),
    sectionLabel: 's(u) = 0.3 sin(3u)',
  },
];

@Component({
  selector: 'app-step-line-bundle',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="線叢：扭曲的線" subtitle="&sect;7.3">
      <p>
        <strong>線叢</strong>（line bundle）
        <app-math e="L \\to C" /> 在曲線
        <app-math e="C" /> 的每個點上附著一條「線」（一維向量空間）。
        線叢的<strong>截面</strong>（section）是在每條線上選一個向量——
        像沿著曲線畫一條「波浪」。
      </p>
      <p>
        最直觀的例子活在圓
        <app-math e="S^1" /> 上：
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        <strong>平凡線叢</strong>
        <app-math e="S^1 \\times \\mathbb{R}" /> 是一個圓柱。
        截面就是圓上的函數——可以處處非零。
      </p>
      <p>
        <strong>Mobius 帶</strong>是一個非平凡線叢。
        纖維在繞圓一周後「翻轉」了，所以任何連續截面
        <strong>必須</strong>至少穿過零一次！
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        在代數幾何中，線叢按<strong>度數</strong>（扭轉數）分類。
        在 <app-math e="\\mathbb{P}^1" /> 上：
      </p>
      <ul>
        <li>
          <app-math e="\\mathcal{O}(0)" /> = 平凡線叢（圓柱）
        </li>
        <li>
          <app-math e="\\mathcal{O}(1)" /> = 超平面叢（一次扭轉）
        </li>
        <li>
          <app-math e="\\mathcal{O}(n)" /> = <app-math e="n" /> 次扭轉
        </li>
      </ul>
      <app-math block [e]="formulaPic"></app-math>
    </app-prose-block>

    <app-prose-block>
      <p>
        因子與線叢的對應：每個因子
        <app-math e="D" /> 給出一個線叢
        <app-math e="\\mathcal{O}(D)" />，
        而這個對應是 Picard 群與線叢群之間的<strong>同構</strong>。
        因子和線叢是同一件事物的兩種描述。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="旋轉觀察線叢——圓柱 vs Mobius 帶，平凡 vs 非平凡">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.key; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i"
                  (click)="presetIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <!-- Controls -->
      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetCamera()">重置視角</button>
        <button class="ctrl-btn" [class.active]="showSection()"
                (click)="showSection.set(!showSection())">
          {{ showSection() ? '隱藏截面' : '顯示截面' }}
        </button>
      </div>

      <!-- Three.js container -->
      <div #threeContainer class="three-container"></div>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">類型</div>
          <div class="ic-body" [class.accent]="!activePreset().trivial">
            {{ activePreset().trivial ? '平凡 (trivial)' : '非平凡 (non-trivial)' }}
          </div>
        </div>
        <div class="info-card">
          <div class="ic-title">扭轉數</div>
          <div class="ic-body accent">{{ activePreset().halfTwists }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">截面必須的零點數</div>
          <div class="ic-body">
            <app-math [e]="activePreset().minZeros"></app-math>
          </div>
        </div>
      </div>

      @if (showSection() && activePreset().sectionLabel) {
        <div class="legend-row">
          <span class="legend-dot" style="background:#ffaa44"></span>
          <span class="legend-text">截面：{{ activePreset().sectionLabel }}</span>
          @if (!activePreset().trivial) {
            <span class="legend-dot" style="background:#cc4444"></span>
            <span class="legend-text">零點（必須存在）</span>
          }
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        線叢的扭轉程度（度數）決定了截面必須有多少零點。
        這個約束正是 Riemann-Roch 定理量化的核心。
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

    .ctrl-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .ctrl-btn {
      padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px;
      cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); }
    }

    .three-container {
      width: 100%; height: 440px;
      border-radius: 10px; border: 1px solid var(--border);
      overflow: hidden; margin-bottom: 10px;
    }

    .info-row {
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .info-card {
      flex: 1; min-width: 120px; padding: 10px 12px; border: 1px solid var(--border);
      border-radius: 8px; text-align: center; background: var(--bg-surface);
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ic-body {
      font-size: 12px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 4px;
    }
    .ic-body.accent { color: var(--accent); }

    .legend-row {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 12px; color: var(--text-secondary);
    }
    .legend-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
    .legend-text {
      font-family: 'JetBrains Mono', monospace; margin-right: 12px;
    }
  `,
})
export class StepLineBundleComponent implements OnDestroy {
  /* ── Formulae ── */

  readonly formulaPic =
    `\\text{Pic}(\\mathbb{P}^1) \\cong \\mathbb{Z} \\quad\\text{（度數 = 扭轉數）}`;

  /* ── Presets ── */

  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly showSection = signal(true);
  readonly activePreset = computed(() => PRESETS[this.presetIdx()]);

  /* ── Three.js refs ── */

  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId = 0;
  private resizeObserver: ResizeObserver | null = null;

  private surfaceGroup: THREE.Group | null = null;
  private sectionGroup: THREE.Group | null = null;

  constructor() {
    afterNextRender(() => {
      this.initThree();
    });

    effect(() => {
      const _idx = this.presetIdx();
      this.rebuildSurface();
    });

    effect(() => {
      const show = this.showSection();
      if (this.sectionGroup) {
        this.sectionGroup.visible = show;
      }
    });
  }

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(2.8, 1.8, 2.8);
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
    this.camera.position.set(2.8, 1.8, 2.8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.5;
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

    // Groups
    this.surfaceGroup = new THREE.Group();
    this.scene.add(this.surfaceGroup);
    this.sectionGroup = new THREE.Group();
    this.sectionGroup.visible = this.showSection();
    this.scene.add(this.sectionGroup);

    this.rebuildSurface();

    // Animation loop
    const animate = (): void => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls!.update();
      this.renderer!.render(this.scene!, this.camera!);
    };
    animate();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);
  }

  /* ── Build / rebuild ── */

  private rebuildSurface(): void {
    if (!this.surfaceGroup || !this.sectionGroup) return;

    this.clearGroup(this.surfaceGroup);
    this.clearGroup(this.sectionGroup);

    const preset = PRESETS[this.presetIdx()];

    this.buildParametricSurface(preset);
    this.buildBaseCircle();

    if (preset.section) {
      this.buildSection(preset);
    }
  }

  /* ── Parametric surface mesh ── */

  private buildParametricSurface(preset: BundlePreset): void {
    if (!this.surfaceGroup) return;

    const uMin = 0, uMax = 2 * Math.PI;
    const vMin = -0.35, vMax = 0.35;

    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i <= U_SEGS; i++) {
      for (let j = 0; j <= V_SEGS; j++) {
        const u = uMin + (i / U_SEGS) * (uMax - uMin);
        const v = vMin + (j / V_SEGS) * (vMax - vMin);
        const [px, py, pz] = preset.param(u, v);
        vertices.push(px, pz, py);   // swap y/z for Three.js convention

        // Color by height (z in our output = pz = Three.js y)
        const t = (pz - (-0.5)) / 1.0;   // normalized height
        const hue = 0.55 + t * 0.12;
        const sat = 0.35;
        const light = 0.32 + Math.abs(v) * 0.3;
        const col = new THREE.Color().setHSL(hue % 1, sat, Math.min(light, 0.55));
        colors.push(col.r, col.g, col.b);
      }
    }

    for (let i = 0; i < U_SEGS; i++) {
      for (let j = 0; j < V_SEGS; j++) {
        const a = i * (V_SEGS + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (V_SEGS + 1) + j;
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
      opacity: 0.72,
    });

    this.surfaceGroup.add(new THREE.Mesh(geometry, material));

    // Wireframe overlay
    const wire = new THREE.Mesh(
      geometry.clone(),
      new THREE.MeshBasicMaterial({
        color: 0x444444,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
      }),
    );
    this.surfaceGroup.add(wire);
  }

  /* ── Base circle (the curve S^1) ── */

  private buildBaseCircle(): void {
    if (!this.surfaceGroup) return;

    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const u = (i / 100) * 2 * Math.PI;
      pts.push(new THREE.Vector3(Math.cos(u), 0, Math.sin(u)));
    }

    const curve = new THREE.CatmullRomCurve3(pts, true);
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.018, 8, true);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: COL_ACCENT,
      emissive: COL_ACCENT,
      emissiveIntensity: 0.3,
      roughness: 0.82,
      metalness: 0.0,
    });
    this.surfaceGroup.add(new THREE.Mesh(tubeGeo, tubeMat));
  }

  /* ── Section curve on the surface ── */

  private buildSection(preset: BundlePreset): void {
    if (!this.sectionGroup || !preset.section) return;

    const sectionFn = preset.section;
    const pts: THREE.Vector3[] = [];
    const zeroCrossings: THREE.Vector3[] = [];
    const steps = 200;

    let prevV = sectionFn(0);
    for (let i = 0; i <= steps; i++) {
      const u = (i / steps) * 2 * Math.PI;
      const v = sectionFn(u);
      const [px, py, pz] = preset.param(u, v);
      pts.push(new THREE.Vector3(px, pz, py));

      // Detect zero crossings
      if (i > 0 && prevV * v < 0) {
        // Linear interpolation to find approximate zero
        const t = prevV / (prevV - v);
        const uZero = ((i - 1 + t) / steps) * 2 * Math.PI;
        const [zx, zy, zz] = preset.param(uZero, 0);
        zeroCrossings.push(new THREE.Vector3(zx, zz, zy));
      }
      prevV = v;
    }

    // Check wrap-around zero crossing
    const lastV = sectionFn(2 * Math.PI - 0.001);
    const firstV = sectionFn(0.001);
    if (lastV * firstV < 0) {
      const [zx, zy, zz] = preset.param(0, 0);
      zeroCrossings.push(new THREE.Vector3(zx, zz, zy));
    }

    // Section tube
    const curve = new THREE.CatmullRomCurve3(pts, false);
    const tubeGeo = new THREE.TubeGeometry(curve, steps, 0.022, 6, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: COL_SECTION,
      emissive: COL_SECTION,
      emissiveIntensity: 0.4,
      roughness: 0.82,
      metalness: 0.0,
    });
    this.sectionGroup.add(new THREE.Mesh(tubeGeo, tubeMat));

    // Mark zero crossings with red spheres
    for (const zp of zeroCrossings) {
      const dotGeo = new THREE.SphereGeometry(0.05, 16, 16);
      const dotMat = new THREE.MeshStandardMaterial({
        color: COL_ZERO,
        emissive: COL_ZERO,
        emissiveIntensity: 0.5,
        roughness: 0.82,
        metalness: 0.0,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(zp);
      this.sectionGroup.add(dot);
    }
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
        } else if (obj instanceof THREE.Sprite) {
          obj.material.map?.dispose();
          obj.material.dispose();
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
