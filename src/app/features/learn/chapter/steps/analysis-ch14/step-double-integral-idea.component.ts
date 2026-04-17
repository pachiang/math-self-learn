import {
  AfterViewInit, Component, ElementRef, OnDestroy, computed, effect, signal, viewChild,
} from '@angular/core';
import {
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, DoubleSide,
  GridHelper, Group, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial,
  PerspectiveCamera, Scene, Vector3, WebGLRenderer, BoxGeometry,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleSurface } from './analysis-ch14-util';

const FUNCTIONS: { name: string; fn: (x: number, y: number) => number; formula: string }[] = [
  { name: '拋物面', fn: (x, y) => 1 - x * x - y * y, formula: 'f(x,y) = 1 − x² − y²' },
  { name: '波浪', fn: (x, y) => Math.cos(x) * Math.sin(y), formula: 'f(x,y) = cos(x)·sin(y)' },
  { name: '鞍面', fn: (x, y) => x * x - y * y, formula: 'f(x,y) = x² − y²' },
];

@Component({
  selector: 'app-step-double-integral-idea',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="重積分的想法" subtitle="§14.1">
      <p>
        一維積分計算「曲線下面積」，<strong>二維積分</strong>計算「曲面下體積」。
      </p>
      <p class="formula">∬_D f(x,y) dA = lim Σ f(xᵢ, yⱼ) ΔA</p>
      <p>
        將區域 D 切成小矩形，每塊上方放一個「小方柱」，
        所有方柱的體積加起來就是積分。分割越細，近似越好。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動分割數 N 看方柱逼近曲面下方體積">
      <div class="fn-tabs">
        @for (f of functions; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.name }}</button>
        }
      </div>

      <div class="ctrl-row">
        <span class="cl">N = {{ n() }}</span>
        <input type="range" min="2" max="20" step="1" [value]="n()"
               (input)="n.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">{{ n() }}×{{ n() }} = {{ n() * n() }} 塊</span>
      </div>

      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetView()">↺ 重置視角</button>
        <button class="ctrl-btn" [class.active]="showSurface()" (click)="showSurface.update(v => !v)">
          {{ showSurface() ? '◉ 隱藏曲面' : '◈ 顯示曲面' }}
        </button>
        <button class="ctrl-btn" [class.active]="autoRotate()" (click)="autoRotate.update(v => !v)">
          {{ autoRotate() ? '⏸ 停止' : '▷ 自轉' }}
        </button>
        <span class="ctrl-info">拖曳旋轉 · 滾輪縮放</span>
      </div>

      <div class="result">
        <span class="rl">{{ currentFn().formula }}</span>
        <span class="rv">近似體積 ≈ {{ approxVol().toFixed(4) }}</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        N 越大，方柱越「薄」，逼近越精確。這就是 <strong>Riemann 和</strong>在二維的推廣。
        下一節我們看如何把雙重積分拆成兩個一維積分——Fubini 定理。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .cl { font-size: 13px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); color: var(--accent); border-color: var(--accent); } }
    .ctrl-info { font-size: 11px; color: var(--text-muted); margin-left: auto; }
    .result { display: flex; justify-content: space-between; padding: 10px 14px; border-radius: 8px;
      background: var(--bg-surface); border: 1px solid var(--border);
      font-family: 'JetBrains Mono', monospace; font-size: 13px; }
    .rl { color: var(--text-muted); }
    .rv { color: var(--accent); font-weight: 700; }
  `,
})
export class StepDoubleIntegralIdeaComponent implements AfterViewInit, OnDestroy {
  readonly functions = FUNCTIONS;
  readonly sel = signal(0);
  readonly n = signal(6);
  readonly showSurface = signal(true);
  readonly autoRotate = signal(true);
  readonly currentFn = computed(() => FUNCTIONS[this.sel()]);

  readonly approxVol = computed(() => {
    const f = this.currentFn().fn;
    const nn = this.n();
    const dx = 2 / nn, dy = 2 / nn;
    let sum = 0;
    for (let j = 0; j < nn; j++) {
      for (let i = 0; i < nn; i++) {
        const x = -1 + (i + 0.5) * dx;
        const y = -1 + (j + 0.5) * dy;
        sum += f(x, y) * dx * dy;
      }
    }
    return sum;
  });

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private dynamicGroup!: Group;
  private surfaceGroup!: Group;
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.sel(); this.n();
      if (this.scene) this.rebuild();
    });
    effect(() => {
      if (this.controls) this.controls.autoRotate = this.autoRotate();
    });
    effect(() => {
      if (this.surfaceGroup) this.surfaceGroup.visible = this.showSurface();
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.rebuild();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.resizeObserver?.disconnect();
    this.disposeScene();
    this.renderer?.dispose();
  }

  private disposeScene(): void {
    this.scene?.traverse((obj) => {
      if (obj instanceof Mesh || obj instanceof LineSegments) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose()); else mat.dispose();
      }
    });
  }

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const wrap = this.wrapRef()?.nativeElement;
    if (!canvas || !wrap) return;

    this.scene = new Scene();
    this.scene.background = null;
    this.camera = new PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(3, 2.5, 3);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resizeRenderer();

    this.scene.add(new AmbientLight(0xffffff, 0.7));
    const dl = new DirectionalLight(0xffffff, 1.2);
    dl.position.set(4, 6, 4);
    this.scene.add(dl);

    const grid = new GridHelper(4, 8, 0x999999, 0xdddddd);
    (grid.material as LineBasicMaterial).transparent = true;
    (grid.material as LineBasicMaterial).opacity = 0.2;
    this.scene.add(grid);

    this.dynamicGroup = new Group();
    this.surfaceGroup = new Group();
    this.scene.add(this.dynamicGroup);
    this.scene.add(this.surfaceGroup);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.2;

    this.resizeObserver = new ResizeObserver(() => this.resizeRenderer());
    this.resizeObserver.observe(wrap);
  }

  private resizeRenderer(): void {
    const wrap = this.wrapRef()?.nativeElement;
    if (!wrap || !this.renderer) return;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private rebuild(): void {
    this.clearGroup(this.dynamicGroup);
    this.clearGroup(this.surfaceGroup);

    const f = this.currentFn().fn;
    const nn = this.n();
    const dx = 2 / nn, dy = 2 / nn;

    // Riemann sum boxes
    for (let j = 0; j < nn; j++) {
      for (let i = 0; i < nn; i++) {
        const x = -1 + (i + 0.5) * dx;
        const y = -1 + (j + 0.5) * dy;
        const h = f(x, y);
        if (Math.abs(h) < 1e-6) continue;
        const geo = new BoxGeometry(dx * 0.95, Math.abs(h), dy * 0.95);
        const mat = new MeshStandardMaterial({
          color: h >= 0 ? 0x6e9abf : 0xbf6e6e,
          transparent: true,
          opacity: 0.5,
        });
        const mesh = new Mesh(geo, mat);
        mesh.position.set(x, h / 2, y);
        this.dynamicGroup.add(mesh);
      }
    }

    // Smooth surface
    const { positions, indices } = sampleSurface(f, [-1, 1], [-1, 1], 60, 60);
    const surfGeo = new BufferGeometry();
    surfGeo.setAttribute('position', new BufferAttribute(positions, 3));
    surfGeo.setIndex(indices);
    surfGeo.computeVertexNormals();
    const surfMat = new MeshStandardMaterial({
      color: 0x4a7a9e,
      transparent: true,
      opacity: 0.35,
      side: DoubleSide,
      roughness: 0.5,
    });
    this.surfaceGroup.add(new Mesh(surfGeo, surfMat));
    this.surfaceGroup.visible = this.showSurface();
  }

  private clearGroup(g: Group): void {
    while (g.children.length > 0) {
      const child = g.children[0];
      g.remove(child);
      if (child instanceof Mesh || child instanceof LineSegments) {
        child.geometry.dispose();
        const mat = child.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose()); else mat.dispose();
      }
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };

  resetView(): void {
    this.camera.position.set(3, 2.5, 3);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
}
