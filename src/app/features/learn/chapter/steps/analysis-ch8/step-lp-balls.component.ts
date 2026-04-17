import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/**
 * Generate a 3D Lp unit‑ball mesh (parametric surface via spherical-like coords).
 * |x|^p + |y|^p + |z|^p = 1
 *
 * For a given (θ, φ) direction we solve for r:
 *   r = 1 / (|cosθ sinφ|^p + |sinθ sinφ|^p + |cosφ|^p)^(1/p)
 */
function buildLpBallGeometry(p: number, resolution = 64): BufferGeometry {
  const N = resolution;
  const verts: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= N; j++) {
    const phi = (Math.PI * j) / N; // 0..π
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);
    for (let i = 0; i <= N; i++) {
      const theta = (2 * Math.PI * i) / N; // 0..2π
      const ct = Math.cos(theta);
      const st = Math.sin(theta);

      const dx = ct * sp;
      const dy = st * sp;
      const dz = cp;

      let r: number;
      if (p >= 50) {
        // L∞: cube
        r = 1 / Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
      } else {
        const denom =
          Math.pow(Math.abs(dx), p) +
          Math.pow(Math.abs(dy), p) +
          Math.pow(Math.abs(dz), p);
        r = Math.pow(1 / denom, 1 / p);
      }

      verts.push(r * dx, r * dy, r * dz);
    }
  }

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const a = j * (N + 1) + i;
      const b = a + 1;
      const c = a + (N + 1);
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Build wireframe edges for the Lp ball. */
function buildLpWireGeometry(p: number, rings = 3): BufferGeometry {
  const pts: number[] = [];
  const N = 128;

  // Latitude rings
  for (let r = 1; r <= rings; r++) {
    const phi = (Math.PI * r) / (rings + 1);
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);
    for (let i = 0; i <= N; i++) {
      const theta = (2 * Math.PI * i) / N;
      const dx = Math.cos(theta) * sp;
      const dy = Math.sin(theta) * sp;
      const dz = cp;
      let rv: number;
      if (p >= 50) {
        rv = 1 / Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
      } else {
        rv = Math.pow(
          1 / (Math.pow(Math.abs(dx), p) + Math.pow(Math.abs(dy), p) + Math.pow(Math.abs(dz), p)),
          1 / p,
        );
      }
      pts.push(rv * dx, rv * dy, rv * dz);
      if (i > 0) {
        const idx = pts.length / 3;
        // pair: previous point → current point (handled by LineSegments pairs)
      }
    }
  }

  // Longitude rings
  for (let r = 0; r < rings * 2; r++) {
    const theta = (Math.PI * r) / rings;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    for (let j = 0; j <= N; j++) {
      const phi = (Math.PI * j) / N;
      const sp = Math.sin(phi);
      const cp = Math.cos(phi);
      const dx = ct * sp;
      const dy = st * sp;
      const dz = cp;
      let rv: number;
      if (p >= 50) {
        rv = 1 / Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
      } else {
        rv = Math.pow(
          1 / (Math.pow(Math.abs(dx), p) + Math.pow(Math.abs(dy), p) + Math.pow(Math.abs(dz), p)),
          1 / p,
        );
      }
      pts.push(rv * dx, rv * dy, rv * dz);
    }
  }

  // Build line segments from polyline strips
  const segPts: number[] = [];
  const stride = N + 1;
  const totalStrips = rings + rings * 2;
  for (let s = 0; s < totalStrips; s++) {
    const base = s * stride;
    for (let i = 0; i < N; i++) {
      const i0 = (base + i) * 3;
      const i1 = (base + i + 1) * 3;
      segPts.push(pts[i0], pts[i0 + 1], pts[i0 + 2]);
      segPts.push(pts[i1], pts[i1 + 1], pts[i1 + 2]);
    }
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(segPts), 3));
  return geo;
}

@Component({
  selector: 'app-step-lp-balls',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Lᵖ 範數的超級球" subtitle="§8.2">
      <p>
        R³ 上的 <strong>Lᵖ 範數</strong>：
      </p>
      <p class="formula">||(x, y, z)||ₚ = (|x|ᵖ + |y|ᵖ + |z|ᵖ)^(1/p)</p>
      <p>
        p = 1 → 八面體。p = 2 → 球。p → ∞ → 立方體。
        拖動滑桿看三維單位球如何<strong>連續變形</strong>。
      </p>
      <p>
        p &lt; 1 時形狀「凹進去」——不再滿足三角不等式，所以<strong>不是範數</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 p 看 3D 單位球怎麼從八面體 → 球 → 立方體連續變形">
      <div class="p-ctrl">
        <span class="pl">p = {{ pDisplay() }}</span>
        <input type="range" min="0.3" max="20" step="0.05" [value]="p()"
               (input)="p.set(+($any($event.target)).value)" class="p-slider" />
      </div>
      <div class="presets">
        <button class="pre-btn" (click)="p.set(0.5)">p = 0.5</button>
        <button class="pre-btn" (click)="p.set(1)">p = 1</button>
        <button class="pre-btn" (click)="p.set(1.5)">p = 1.5</button>
        <button class="pre-btn" (click)="p.set(2)">p = 2</button>
        <button class="pre-btn" (click)="p.set(4)">p = 4</button>
        <button class="pre-btn" (click)="p.set(20)">p = ∞</button>
      </div>

      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetView()">↺ 重置視角</button>
        <button class="ctrl-btn" [class.active]="autoRotate()" (click)="toggleAuto()">
          {{ autoRotate() ? '⏸ 停止自轉' : '▷ 自動旋轉' }}
        </button>
        <button class="ctrl-btn" [class.active]="showWire()" (click)="showWire.update(v => !v)">
          {{ showWire() ? '◉ 隱藏線框' : '◈ 顯示線框' }}
        </button>
        <span class="ctrl-info">拖曳旋轉 · 滾輪縮放</span>
      </div>

      <div class="info-row">
        <div class="i-card" [class.bad]="p() < 1" [class.ok]="p() >= 1">
          @if (p() < 1) {
            p &lt; 1：不是範數（三角不等式不成立）
          } @else if (p() >= 20) {
            p = ∞：立方體（Chebyshev 距離）
          } @else if (p() === 1) {
            p = 1：八面體（Manhattan 距離）
          } @else if (p() === 2) {
            p = 2：球（歐幾里得距離）
          } @else {
            p = {{ p().toFixed(2) }}：合法的範數 ✓
          }
        </div>
        <div class="i-card">||(1,1,1)||ₚ = {{ norm111().toFixed(4) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這個 3D 連續變形揭示了「距離」的多樣性——從八面體的尖銳稜角，
        經過球的圓潤，到立方體的平坦面。數學不偏心，每個 p 都定義了一種合法的「距離」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .p-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .pl { font-size: 18px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 100px; }
    .p-slider { flex: 1; accent-color: var(--accent); height: 24px; }
    .presets { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); } }

    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block;
      touch-action: none; }

    .ctrl-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
      &.active { background: var(--accent-18); color: var(--accent); border-color: var(--accent); } }
    .ctrl-info { font-size: 11px; color: var(--text-muted); margin-left: auto; }

    .info-row { display: flex; gap: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
  `,
})
export class StepLpBallsComponent implements AfterViewInit, OnDestroy {
  readonly p = signal(2);
  readonly autoRotate = signal(true);
  readonly showWire = signal(true);

  readonly pDisplay = computed(() => this.p() >= 20 ? '∞' : this.p().toFixed(2));
  readonly norm111 = computed(() => {
    const pp = this.p();
    return pp >= 50 ? 1 : Math.pow(3, 1 / pp);
  });

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private dynamicGroup!: Group;
  private resizeObserver?: ResizeObserver;
  private ballMesh!: Mesh;
  private wireMesh!: LineSegments;

  constructor() {
    effect(() => {
      const pVal = this.p();
      if (this.scene) this.rebuildBall(pVal);
    });
    effect(() => {
      const auto = this.autoRotate();
      if (this.controls) this.controls.autoRotate = auto;
    });
    effect(() => {
      const show = this.showWire();
      if (this.wireMesh) this.wireMesh.visible = show;
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.rebuildBall(this.p());
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.resizeObserver?.disconnect();
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj instanceof Mesh || obj instanceof LineSegments) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
    }
    this.renderer?.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const wrap = this.wrapRef()?.nativeElement;
    if (!canvas || !wrap) return;

    this.scene = new Scene();
    this.scene.background = null;

    this.camera = new PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(2.8, 2.2, 2.8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resizeRenderer();

    this.scene.add(new AmbientLight(0xffffff, 0.7));
    const dl = new DirectionalLight(0xffffff, 1.2);
    dl.position.set(4, 6, 4);
    this.scene.add(dl);
    const dl2 = new DirectionalLight(0xffffff, 0.4);
    dl2.position.set(-3, -2, -4);
    this.scene.add(dl2);

    // Subtle grid
    const grid = new GridHelper(4, 8, 0x999999, 0xdddddd);
    const gridMat = grid.material as LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = 0.2;
    this.scene.add(grid);

    // Axis lines
    this.addAxis(new Vector3(1.5, 0, 0), 0xbf6e6e, 'x');
    this.addAxis(new Vector3(0, 1.5, 0), 0x6e9a6e, 'y');
    this.addAxis(new Vector3(0, 0, 1.5), 0x6e8aa8, 'z');

    this.dynamicGroup = new Group();
    this.scene.add(this.dynamicGroup);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.autoRotate = this.autoRotate();
    this.controls.autoRotateSpeed = 1.5;
    this.controls.target.set(0, 0, 0);

    this.resizeObserver = new ResizeObserver(() => this.resizeRenderer());
    this.resizeObserver.observe(wrap);
  }

  private addAxis(dir: Vector3, color: number, _label: string): void {
    const pts = [new Vector3(0, 0, 0), dir];
    const geo = new BufferGeometry().setFromPoints(pts);
    const mat = new LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    this.scene.add(new LineSegments(geo, mat));
  }

  private resizeRenderer(): void {
    const wrap = this.wrapRef()?.nativeElement;
    if (!wrap || !this.renderer) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private rebuildBall(p: number): void {
    // Dispose old meshes
    while (this.dynamicGroup.children.length > 0) {
      const child = this.dynamicGroup.children[0];
      this.dynamicGroup.remove(child);
      if (child instanceof Mesh || child instanceof LineSegments) {
        child.geometry.dispose();
        const mat = child.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    }

    const isInvalid = p < 1;

    // Solid ball
    const ballGeo = buildLpBallGeometry(p, 80);
    const ballMat = new MeshStandardMaterial({
      color: isInvalid ? 0xa05a5a : 0x6e9abf,
      transparent: true,
      opacity: 0.55,
      side: DoubleSide,
      roughness: 0.4,
      metalness: 0.1,
    });
    this.ballMesh = new Mesh(ballGeo, ballMat);
    this.dynamicGroup.add(this.ballMesh);

    // Wireframe overlay
    const wireGeo = buildLpWireGeometry(p, 4);
    const wireMat = new LineBasicMaterial({
      color: isInvalid ? 0xa05a5a : 0x4a7a9e,
      transparent: true,
      opacity: 0.35,
    });
    this.wireMesh = new LineSegments(wireGeo, wireMat);
    this.wireMesh.visible = this.showWire();
    this.dynamicGroup.add(this.wireMesh);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };

  resetView(): void {
    this.camera.position.set(2.8, 2.2, 2.8);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  toggleAuto(): void {
    this.autoRotate.update((v) => !v);
  }
}
