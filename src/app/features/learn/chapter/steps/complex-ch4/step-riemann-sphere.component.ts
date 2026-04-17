import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { type C } from '../complex-ch1/complex-util';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Display mode definitions ── */

type DisplayMode = 'grid' | 'circle' | 'line';

interface ModeOption {
  key: DisplayMode;
  label: string;
}

const MODES: ModeOption[] = [
  { key: 'grid', label: '座標格線' },
  { key: 'circle', label: '圓 |z|=r' },
  { key: 'line', label: '直線' },
];

/* ── Colors ── */

const COL_SPHERE = 0x4488aa;
const COL_BG = 0x141418;
const COL_EQUATOR = 0x66ccff;
const COL_SOUTH = 0x44cc88;
const COL_NORTH = 0xff6655;
const COL_CIRCLE = 0xffaa44;
const COL_MERIDIAN = 0x6688bb;
const COL_PARALLEL = 0x88aa66;
const COL_LINE_GREAT = 0xeebb55;

@Component({
  selector: 'app-step-riemann-sphere',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Riemann 球面" subtitle="&sect;4.5">
      <p>
        Riemann 球面的核心思想是在複數平面上增加一個「無窮遠點」，
        構成<strong>擴展複數平面</strong>
        <app-math [e]="'\\hat{\\mathbb{C}} = \\mathbb{C} \\cup \\{\\infty\\}'" />。
        透過<strong>立體投影</strong> (stereographic projection)，
        整個複數平面可以被一一映射到單位球面上：
      </p>
      <app-math block [e]="stereoFormula" />
      <p>
        其中 z = 0 對應<strong>南極</strong> (0, 0, &minus;1)，
        而 z = &infin; 對應<strong>北極</strong> (0, 0, 1)。
        這意味著極點在球面上不再是「爆炸的奇異點」，
        而只是函數值經過北極 -- 和經過任何其他點一樣自然。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="旋轉 Riemann 球面，看複數平面上的點如何映射到球面。拖動滑桿改變展示的集合。">
      <div class="mode-row">
        @for (m of modes; track m.key) {
          <button class="mode-btn"
                  [class.active]="displayMode() === m.key"
                  (click)="setMode(m.key)">
            {{ m.label }}
          </button>
        }
      </div>

      @if (displayMode() === 'circle') {
        <div class="slider-wrap">
          <span class="sl-label">r =</span>
          <input type="range" min="1" max="100" step="1"
                 [value]="rSlider()"
                 (input)="rSlider.set(+$any($event).target.value)" />
          <span class="sl-value">{{ rValue().toFixed(2) }}</span>
        </div>
      }

      <div #threeContainer class="three-container"></div>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card south">
          <div class="info-label">z = 0</div>
          <div class="info-val">南極 (0, 0, &minus;1)</div>
        </div>
        <div class="info-card north">
          <div class="info-label">z = &infin;</div>
          <div class="info-val">北極 (0, 0, 1)</div>
        </div>
        <div class="info-card equator">
          <div class="info-label">|z| = 1</div>
          <div class="info-val">赤道</div>
        </div>
        @if (displayMode() === 'circle') {
          <div class="info-card">
            <div class="info-label">|z| = {{ rValue().toFixed(2) }}</div>
            <div class="info-val accent">
              緯度 {{ latitudeDeg().toFixed(1) }}&deg;
            </div>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Riemann 球面把 &infin; 變成普通的一點。
        在球面上，極點不再是「爆炸」，
        而是函數值經過北極 -- 和經過任何其他點一樣自然。
        這個觀點是現代複分析和代數幾何的基礎。
      </p>
    </app-prose-block>
  `,
  styles: `
    .mode-row {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .mode-btn {
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

    .slider-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      margin-bottom: 10px;
    }

    .sl-label {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      min-width: 28px;
    }

    .slider-wrap input {
      flex: 1;
      accent-color: var(--accent);
    }

    .sl-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      min-width: 48px;
      text-align: right;
    }

    .three-container {
      width: 100%;
      height: 420px;
      border-radius: 10px;
      border: 1px solid var(--border);
      overflow: hidden;
      margin-bottom: 10px;
    }

    .info-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .info-card {
      flex: 1;
      min-width: 100px;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      text-align: center;
      font-family: 'JetBrains Mono', monospace;

      &.south { background: rgba(68, 204, 136, 0.08); }
      &.north { background: rgba(255, 102, 85, 0.08); }
      &.equator { background: rgba(102, 204, 255, 0.08); }
    }

    .info-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .info-val {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);

      &.accent {
        color: var(--accent);
      }
    }
  `,
})
export class StepRiemannSphereComponent implements OnDestroy {
  readonly modes = MODES;

  /* ── KaTeX ── */
  readonly stereoFormula = String.raw`\sigma(z) = \left(\frac{2\,\text{Re}(z)}{|z|^2+1},\; \frac{2\,\text{Im}(z)}{|z|^2+1},\; \frac{|z|^2-1}{|z|^2+1}\right)`;

  /* ── Signals ── */
  readonly displayMode = signal<DisplayMode>('grid');
  readonly rSlider = signal(10); // 1..100, mapped nonlinearly to 0.1..10
  readonly rValue = computed(() => {
    // Nonlinear mapping: slider 1..100 -> r 0.1..10
    const s = this.rSlider();
    return 0.1 * Math.pow(10, (s - 1) / 99 * 2);
  });
  readonly latitudeDeg = computed(() => {
    const r = this.rValue();
    const r2 = r * r;
    const zCoord = (r2 - 1) / (r2 + 1);
    return Math.asin(zCoord) * 180 / Math.PI;
  });

  /* ── Three.js refs ── */
  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId = 0;
  private resizeObserver: ResizeObserver | null = null;

  // Dynamic objects group (cleared & rebuilt on mode change)
  private dynamicGroup: THREE.Group | null = null;

  // Track previous state for rebuilding
  private lastMode: DisplayMode | null = null;
  private lastR = -1;

  constructor() {
    afterNextRender(() => {
      this.initThree();
      this.buildDynamicObjects();
    });
  }

  setMode(mode: DisplayMode): void {
    this.displayMode.set(mode);
    this.buildDynamicObjects();
  }

  /* ── Stereographic projection ── */

  private stereo(z: C): [number, number, number] {
    const r2 = z[0] * z[0] + z[1] * z[1];
    return [
      2 * z[0] / (r2 + 1),
      2 * z[1] / (r2 + 1),
      (r2 - 1) / (r2 + 1),
    ];
  }

  /* ── Three.js initialization ── */

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COL_BG);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(2.2, 1.6, 2.2);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.6;
    this.controls.maxDistance = 8;
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

    // ── Static objects ──

    // Sphere: solid semi-transparent
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const solidMat = new THREE.MeshStandardMaterial({
      color: COL_SPHERE,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    this.scene.add(new THREE.Mesh(sphereGeo, solidMat));

    // Sphere: wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: COL_SPHERE,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    this.scene.add(new THREE.Mesh(sphereGeo.clone(), wireMat));

    // Equator ring
    const equatorPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      equatorPts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
    }
    const equatorGeo = new THREE.BufferGeometry().setFromPoints(equatorPts);
    const equatorMat = new THREE.LineBasicMaterial({ color: COL_EQUATOR, linewidth: 2 });
    this.scene.add(new THREE.LineLoop(equatorGeo, equatorMat));

    // South pole marker (z=0)
    const southGeo = new THREE.SphereGeometry(0.05, 16, 12);
    const southMat = new THREE.MeshStandardMaterial({ color: COL_SOUTH });
    const southMesh = new THREE.Mesh(southGeo, southMat);
    southMesh.position.set(0, 0, -1);
    this.scene.add(southMesh);

    // North pole marker (z=infty)
    const northGeo = new THREE.SphereGeometry(0.05, 16, 12);
    const northMat = new THREE.MeshStandardMaterial({ color: COL_NORTH });
    const northMesh = new THREE.Mesh(northGeo, northMat);
    northMesh.position.set(0, 0, 1);
    this.scene.add(northMesh);

    // Dynamic group
    this.dynamicGroup = new THREE.Group();
    this.scene.add(this.dynamicGroup);

    // Animation loop
    const animate = (): void => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls!.update();

      // Check if dynamic objects need rebuilding
      const mode = this.displayMode();
      const r = this.rValue();
      if (mode !== this.lastMode || (mode === 'circle' && Math.abs(r - this.lastR) > 0.001)) {
        this.buildDynamicObjects();
      }

      this.renderer!.render(this.scene!, this.camera!);
    };
    animate();

    // Handle resize
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);
  }

  /* ── Build dynamic objects based on current mode ── */

  private buildDynamicObjects(): void {
    if (!this.dynamicGroup || !this.scene) return;

    // Clear previous dynamic objects
    this.clearGroup(this.dynamicGroup);

    const mode = this.displayMode();
    this.lastMode = mode;
    this.lastR = this.rValue();

    switch (mode) {
      case 'grid':
        this.buildGrid();
        break;
      case 'circle':
        this.buildCircle(this.rValue());
        break;
      case 'line':
        this.buildLine();
        break;
    }
  }

  /* ── Grid mode: circles |z|=r and rays arg(z)=theta mapped to sphere ── */

  private buildGrid(): void {
    const group = this.dynamicGroup!;

    // Map circles |z| = r for r = 0.25, 0.5, 1, 2, 4
    const radii = [0.25, 0.5, 1, 2, 4];
    for (const r of radii) {
      const pts = this.mapCircleToSphere(r, 128);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: COL_PARALLEL,
        transparent: true,
        opacity: r === 1 ? 1.0 : 0.7,
        linewidth: r === 1 ? 2 : 1,
      });
      group.add(new THREE.LineLoop(geo, mat));
    }

    // Map rays arg(z) = k*pi/4 for k = 0..7
    for (let k = 0; k < 8; k++) {
      const theta = k * Math.PI / 4;
      const pts = this.mapRayToSphere(theta, 200, 0.01, 20);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: COL_MERIDIAN,
        transparent: true,
        opacity: 0.6,
      });
      group.add(new THREE.Line(geo, mat));
    }
  }

  /* ── Circle mode: single circle |z|=r ── */

  private buildCircle(r: number): void {
    const group = this.dynamicGroup!;

    const pts = this.mapCircleToSphere(r, 200);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: COL_CIRCLE,
      linewidth: 2,
    });
    group.add(new THREE.LineLoop(geo, mat));

    // Show corresponding point on sphere for z = r (on real axis)
    const [sx, sy, sz] = this.stereo([r, 0]);
    const dotGeo = new THREE.SphereGeometry(0.04, 12, 8);
    const dotMat = new THREE.MeshStandardMaterial({ color: COL_CIRCLE });
    const dotMesh = new THREE.Mesh(dotGeo, dotMat);
    dotMesh.position.set(sx, sy, sz);
    group.add(dotMesh);
  }

  /* ── Line mode: line through origin mapped to great circle ── */

  private buildLine(): void {
    const group = this.dynamicGroup!;

    // Real axis (arg=0 and arg=pi) forms a great circle through poles
    const ptsReal = this.mapRayToSphere(0, 200, 0.001, 100);
    const ptsRealNeg = this.mapRayToSphere(Math.PI, 200, 0.001, 100);
    const allPts = [...ptsReal, ...ptsRealNeg.reverse()];
    const geo1 = new THREE.BufferGeometry().setFromPoints(allPts);
    const mat1 = new THREE.LineBasicMaterial({ color: COL_LINE_GREAT, linewidth: 2 });
    group.add(new THREE.Line(geo1, mat1));

    // Imaginary axis
    const ptsImag = this.mapRayToSphere(Math.PI / 2, 200, 0.001, 100);
    const ptsImagNeg = this.mapRayToSphere(-Math.PI / 2, 200, 0.001, 100);
    const allPts2 = [...ptsImag, ...ptsImagNeg.reverse()];
    const geo2 = new THREE.BufferGeometry().setFromPoints(allPts2);
    const mat2 = new THREE.LineBasicMaterial({
      color: 0xaa88ee,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
    group.add(new THREE.Line(geo2, mat2));

    // Diagonal line arg = pi/4
    const ptsDiag = this.mapRayToSphere(Math.PI / 4, 200, 0.001, 100);
    const ptsDiagNeg = this.mapRayToSphere(Math.PI / 4 + Math.PI, 200, 0.001, 100);
    const allPts3 = [...ptsDiag, ...ptsDiagNeg.reverse()];
    const geo3 = new THREE.BufferGeometry().setFromPoints(allPts3);
    const mat3 = new THREE.LineBasicMaterial({
      color: 0x66dd99,
      linewidth: 2,
      transparent: true,
      opacity: 0.7,
    });
    group.add(new THREE.Line(geo3, mat3));
  }

  /* ── Map a circle |z|=r to points on the sphere ── */

  private mapCircleToSphere(r: number, nPts: number): THREE.Vector3[] {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= nPts; i++) {
      const a = (i / nPts) * Math.PI * 2;
      const z: C = [r * Math.cos(a), r * Math.sin(a)];
      const [sx, sy, sz] = this.stereo(z);
      pts.push(new THREE.Vector3(sx, sy, sz));
    }
    return pts;
  }

  /* ── Map a ray arg(z)=theta to points on the sphere ── */

  private mapRayToSphere(theta: number, nPts: number, tMin: number, tMax: number): THREE.Vector3[] {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= nPts; i++) {
      // Use log-spaced sampling for better coverage near 0 and infinity
      const frac = i / nPts;
      const t = tMin * Math.pow(tMax / tMin, frac);
      const z: C = [t * Math.cos(theta), t * Math.sin(theta)];
      const [sx, sy, sz] = this.stereo(z);
      pts.push(new THREE.Vector3(sx, sy, sz));
    }
    return pts;
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
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /* ── Cleanup ── */

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
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
      try {
        container.removeChild(this.renderer.domElement);
      } catch { /* already removed */ }
    }

    this.resizeObserver?.disconnect();
  }
}
