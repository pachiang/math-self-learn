import {
  AfterViewInit, Component, ElementRef, OnDestroy, computed, effect, signal, viewChild,
} from '@angular/core';
import {
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight,
  GridHelper, Group, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial,
  PerspectiveCamera, Scene, Vector3, WebGLRenderer, DoubleSide,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Transform {
  name: string;
  desc: string;
  u: (x: number, y: number) => number;
  v: (x: number, y: number) => number;
  invX: (u: number, v: number) => number;
  invY: (u: number, v: number) => number;
  jacAbs: (u: number, v: number) => number;
  formula: string;
}

const TRANSFORMS: Transform[] = [
  {
    name: '極座標',
    desc: 'x = r cos θ, y = r sin θ',
    u: (x, y) => Math.sqrt(x * x + y * y),
    v: (x, y) => Math.atan2(y, x),
    invX: (r, th) => r * Math.cos(th),
    invY: (r, th) => r * Math.sin(th),
    jacAbs: (r, _th) => r,
    formula: '|J| = r',
  },
  {
    name: '仿射',
    desc: 'u = x+y, v = x−y → x = (u+v)/2, y = (u−v)/2',
    u: (x, y) => x + y,
    v: (x, y) => x - y,
    invX: (u, v) => (u + v) / 2,
    invY: (u, v) => (u - v) / 2,
    jacAbs: () => 0.5,
    formula: '|J| = 1/2',
  },
  {
    name: '平方映射',
    desc: 'x = u², y = v² (u,v > 0)',
    u: (x, _y) => Math.sqrt(Math.max(0, x)),
    v: (_x, y) => Math.sqrt(Math.max(0, y)),
    invX: (u, _v) => u * u,
    invY: (_u, v) => v * v,
    jacAbs: (u, v) => 4 * u * v,
    formula: '|J| = 4uv',
  },
];

@Component({
  selector: 'app-step-change-of-variables',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="換元公式與 Jacobian" subtitle="§14.7">
      <p>
        一般的座標變換 (u,v) → (x,y)：
      </p>
      <p class="formula">∬ f(x,y) dx dy = ∬ f(x(u,v), y(u,v)) |det J| du dv</p>
      <p>
        <strong>Jacobian 行列式</strong>衡量座標變換對面積的「拉伸因子」。
        極座標的 r dr dθ 就是 |det J| = r 的特例。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選變換，在 3D 中看網格如何被拉伸和扭曲">
      <div class="fn-tabs">
        @for (t of transforms; track t.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ t.name }}</button>
        }
      </div>

      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetView()">↺ 重置</button>
        <button class="ctrl-btn" [class.active]="showTarget()" (click)="showTarget.update(v => !v)">
          {{ showTarget() ? '◉ 隱藏變換後' : '◈ 顯示變換後' }}
        </button>
        <button class="ctrl-btn" [class.active]="autoRotate()" (click)="autoRotate.update(v => !v)">
          {{ autoRotate() ? '⏸' : '▷' }}
        </button>
        <span class="ctrl-info">{{ currentTransform().desc }}</span>
      </div>

      <div class="info-row">
        <div class="i-card">{{ currentTransform().formula }}</div>
        <div class="i-card accent">面積拉伸 = |det J|</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        換元公式的靈魂：<strong>面積不是不變的</strong>——座標變換會拉伸或壓縮。
        |det J| 正是修正這個拉伸的因子，保證積分值不變。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }
    .ctrl-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); color: var(--accent); border-color: var(--accent); } }
    .ctrl-info { font-size: 11px; color: var(--text-muted); margin-left: auto; }
    .info-row { display: flex; gap: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
  `,
})
export class StepChangeOfVariablesComponent implements AfterViewInit, OnDestroy {
  readonly transforms = TRANSFORMS;
  readonly sel = signal(0);
  readonly showTarget = signal(true);
  readonly autoRotate = signal(true);
  readonly currentTransform = computed(() => TRANSFORMS[this.sel()]);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private sourceGroup!: Group;
  private targetGroup!: Group;
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.sel();
      if (this.scene) this.rebuild();
    });
    effect(() => {
      if (this.controls) this.controls.autoRotate = this.autoRotate();
    });
    effect(() => {
      if (this.targetGroup) this.targetGroup.visible = this.showTarget();
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
    this.scene?.traverse((obj) => {
      if (obj instanceof Mesh || obj instanceof LineSegments) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose()); else mat.dispose();
      }
    });
    this.renderer?.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const wrap = this.wrapRef()?.nativeElement;
    if (!canvas || !wrap) return;

    this.scene = new Scene();
    this.scene.background = null;
    this.camera = new PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(3, 2, 3);
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

    this.sourceGroup = new Group();
    this.targetGroup = new Group();
    this.scene.add(this.sourceGroup);
    this.scene.add(this.targetGroup);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.0;

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
    this.clearGroup(this.sourceGroup);
    this.clearGroup(this.targetGroup);

    const t = this.currentTransform();
    const N = 10;

    // Source grid (flat, on y=0 plane, blue)
    this.buildGrid(this.sourceGroup, 0x6e9abf, 0.3, N,
      (u, v) => new Vector3(u, 0, v));

    // Target grid (transformed, elevated slightly, orange)
    this.buildGrid(this.targetGroup, 0xbf8a5a, 0.5, N,
      (u, v) => {
        const x = t.invX(u, v);
        const y = t.invY(u, v);
        const jac = t.jacAbs(u, v);
        return new Vector3(x, jac * 0.3, y);
      });
    this.targetGroup.visible = this.showTarget();
  }

  private buildGrid(group: Group, color: number, opacity: number, N: number,
    mapFn: (u: number, v: number) => Vector3): void {
    const pts: Vector3[] = [];
    // Horizontal lines (constant v)
    for (let j = 0; j <= N; j++) {
      const v = j / N * 2;
      for (let i = 0; i <= N * 4; i++) {
        const u = i / (N * 4) * 2;
        pts.push(mapFn(u, v));
        if (i > 0) {
          pts.push(mapFn(u, v));  // dup for pair
        }
      }
    }
    // Vertical lines (constant u)
    for (let i = 0; i <= N; i++) {
      const u = i / N * 2;
      for (let j = 0; j <= N * 4; j++) {
        const v = j / (N * 4) * 2;
        pts.push(mapFn(u, v));
        if (j > 0) {
          pts.push(mapFn(u, v));
        }
      }
    }

    // Build proper line segments
    const segments: number[] = [];
    const stride = N * 4 + 1;
    const totalHLines = N + 1;

    // H lines
    for (let j = 0; j <= N; j++) {
      const v = j / N * 2;
      for (let i = 0; i < N * 4; i++) {
        const u1 = i / (N * 4) * 2;
        const u2 = (i + 1) / (N * 4) * 2;
        const p1 = mapFn(u1, v);
        const p2 = mapFn(u2, v);
        if (isFinite(p1.x) && isFinite(p1.y) && isFinite(p1.z) &&
            isFinite(p2.x) && isFinite(p2.y) && isFinite(p2.z)) {
          segments.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }
    // V lines
    for (let i = 0; i <= N; i++) {
      const u = i / N * 2;
      for (let j = 0; j < N * 4; j++) {
        const v1 = j / (N * 4) * 2;
        const v2 = (j + 1) / (N * 4) * 2;
        const p1 = mapFn(u, v1);
        const p2 = mapFn(u, v2);
        if (isFinite(p1.x) && isFinite(p1.y) && isFinite(p1.z) &&
            isFinite(p2.x) && isFinite(p2.y) && isFinite(p2.z)) {
          segments.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }

    if (segments.length > 0) {
      const geo = new BufferGeometry();
      geo.setAttribute('position', new BufferAttribute(new Float32Array(segments), 3));
      const mat = new LineBasicMaterial({ color, transparent: true, opacity });
      group.add(new LineSegments(geo, mat));
    }
  }

  private clearGroup(g: Group): void {
    while (g.children.length > 0) {
      const c = g.children[0];
      g.remove(c);
      if (c instanceof Mesh || c instanceof LineSegments) {
        c.geometry.dispose();
        const mat = c.material;
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
    this.camera.position.set(3, 2, 3);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
}
