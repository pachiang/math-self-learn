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
  ArrowHelper,
  AxesHelper,
  BoxGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  Group,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type V3 = [number, number, number];

interface Example3D {
  name: string;
  A: number[][];
  rank: 0 | 1 | 2 | 3;
  desc: string;
}

const EXAMPLES: Example3D[] = [
  {
    name: 'rank 3',
    A: [
      [2, 0, 0],
      [0, 2, 0],
      [0, 0, 2],
    ],
    rank: 3,
    desc: '\u4E09\u500B\u6B04\u72E8\u7ACB \u2192 C(A) = \u6574\u500B \u211D\u00B3\u3002\u4EFB\u4F55 b \u90FD\u80FD\u9054\u5230\u3002',
  },
  {
    name: 'rank 2',
    A: [
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 2],
    ],
    rank: 2,
    desc: '\u7B2C\u4E09\u6B04 = \u524D\u5169\u500B\u52A0\u8D77\u4F86 \u2192 C(A) \u662F\u4E00\u500B\u5E73\u9762\u3002',
  },
  {
    name: 'rank 1',
    A: [
      [1, 2, 3],
      [2, 4, 6],
      [3, 6, 9],
    ],
    rank: 1,
    desc: '\u4E09\u500B\u6B04\u90FD\u662F (1, 2, 3) \u7684\u500D\u6578 \u2192 C(A) \u53EA\u662F\u4E00\u689D\u7DDA\u3002',
  },
  {
    name: 'rank 0',
    A: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    rank: 0,
    desc: '\u96F6\u77E9\u9663 \u2192 C(A) = {{ 0 }}\u3002',
  },
];

const COL1_COLOR = 0xbf6e6e;
const COL2_COLOR = 0x6e9a6e;
const COL3_COLOR = 0x6e8aa8;
const SPACE_COLOR = 0xa8806e;

function cross(a: V3, b: V3): V3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function vlen(v: V3): number {
  return Math.hypot(v[0], v[1], v[2]);
}
function vScale(v: V3, s: number): V3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

@Component({
  selector: 'app-step-column-space-3d',
  standalone: true,
  imports: [ChallengeCardComponent],
  template: `
    <app-challenge-card prompt="\u5728 3D \u88E1\u9078\u4E0D\u540C rank \u7684\u77E9\u9663\uFF0C\u770B C(A) \u662F\u9EDE / \u7DDA / \u9762 / \u6574\u500B\u7A7A\u9593">
      <div class="ex-tabs">
        @for (e of examples; track e.name; let i = $index) {
          <button class="et" [class.active]="sel() === i" (click)="sel.set(i)">{{ e.name }}</button>
        }
      </div>

      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetView()">\u21BA \u91CD\u7F6E\u8996\u89D2</button>
        <button class="ctrl-btn" [class.active]="autoRotate()" (click)="toggleAuto()">
          {{ autoRotate() ? '\u23F8 \u505C\u6B62\u81EA\u8F49' : '\u25B7 \u81EA\u52D5\u65CB\u8F49' }}
        </button>
        <span class="ctrl-info">\u62D6\u62FD\u65CB\u8F49 \u00B7 \u6EFE\u8F2A\u7E2E\u653E</span>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">\u77E9\u9663 A</span>
          <span class="iv">{{ matrixStr() }}</span>
        </div>
        <div class="info-row col1"><span class="il">\u6B04 1</span>
          <span class="iv">({{ current().A[0][0] }}, {{ current().A[1][0] }}, {{ current().A[2][0] }})</span></div>
        <div class="info-row col2"><span class="il">\u6B04 2</span>
          <span class="iv">({{ current().A[0][1] }}, {{ current().A[1][1] }}, {{ current().A[2][1] }})</span></div>
        <div class="info-row col3"><span class="il">\u6B04 3</span>
          <span class="iv">({{ current().A[0][2] }}, {{ current().A[1][2] }}, {{ current().A[2][2] }})</span></div>
        <div class="info-row big">
          <span class="il">C(A)</span>
          <span class="iv">
            <strong>
              @switch (current().rank) {
                @case (3) { \u6574\u500B \u211D\u00B3\uFF08\u7DAD\u5EA6 3\uFF09 }
                @case (2) { \u4E00\u500B\u5E73\u9762\uFF08\u7DAD\u5EA6 2\uFF09 }
                @case (1) { \u4E00\u689D\u7DDA\uFF08\u7DAD\u5EA6 1\uFF09 }
                @case (0) { \u53EA\u6709\u539F\u9EDE\uFF08\u7DAD\u5EA6 0\uFF09 }
              }
            </strong>
          </span>
        </div>
      </div>

      <div class="explain">{{ current().desc }}</div>
    </app-challenge-card>
  `,
  styles: `
    .ex-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .et { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

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

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .info-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.col1 { background: rgba(191, 110, 110, 0.08); }
      &.col2 { background: rgba(110, 154, 110, 0.08); }
      &.col3 { background: rgba(110, 138, 168, 0.08); }
      &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 13px; }

    .explain { padding: 10px 14px; border-radius: 8px; background: var(--bg-surface);
      font-size: 12px; color: var(--text-secondary); text-align: center; }
  `,
})
export class StepColumnSpace3DComponent implements AfterViewInit, OnDestroy {
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly autoRotate = signal(false);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private dynamicGroup!: Group;
  private resizeObserver?: ResizeObserver;

  readonly current = computed(() => this.examples[this.sel()]);
  readonly matrixStr = computed(() => {
    const A = this.current().A;
    return `[[${A[0].join(',')}], [${A[1].join(',')}], [${A[2].join(',')}]]`;
  });

  constructor() {
    effect(() => {
      const ex = this.current();
      if (this.scene) this.rebuildDynamic(ex);
    });
    effect(() => {
      const auto = this.autoRotate();
      if (this.controls) this.controls.autoRotate = auto;
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.rebuildDynamic(this.current());
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.resizeObserver?.disconnect();
    if (this.scene) {
      this.scene.traverse((obj: Object3D) => {
        if (obj instanceof Mesh) {
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

    this.camera = new PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(5, 4, 5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resizeRenderer();

    this.scene.add(new AmbientLight(0xffffff, 1.0));
    const dl = new DirectionalLight(0xffffff, 1.4);
    dl.position.set(5, 8, 5);
    this.scene.add(dl);
    const dl2 = new DirectionalLight(0xffffff, 0.5);
    dl2.position.set(-5, -3, -5);
    this.scene.add(dl2);

    const grid = new GridHelper(6, 12, 0x999999, 0xdddddd);
    const gridMat = grid.material as LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = 0.35;
    this.scene.add(grid);

    this.scene.add(new AxesHelper(2.5));

    const originGeo = new SphereGeometry(0.06, 16, 16);
    const originMat = new MeshStandardMaterial({ color: 0x333333 });
    this.scene.add(new Mesh(originGeo, originMat));

    this.dynamicGroup = new Group();
    this.scene.add(this.dynamicGroup);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 16;
    this.controls.autoRotateSpeed = 1.0;
    this.controls.target.set(0, 0, 0);

    this.resizeObserver = new ResizeObserver(() => this.resizeRenderer());
    this.resizeObserver.observe(wrap);
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

  private rebuildDynamic(ex: Example3D): void {
    while (this.dynamicGroup.children.length > 0) {
      const child = this.dynamicGroup.children[0];
      this.dynamicGroup.remove(child);
      if (child instanceof Mesh) {
        child.geometry.dispose();
        const mat = child.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    }

    // Get column vectors
    const cols: V3[] = [
      [ex.A[0][0], ex.A[1][0], ex.A[2][0]],
      [ex.A[0][1], ex.A[1][1], ex.A[2][1]],
      [ex.A[0][2], ex.A[1][2], ex.A[2][2]],
    ];
    const colColors = [COL1_COLOR, COL2_COLOR, COL3_COLOR];

    // Draw column-space backdrop based on rank
    if (ex.rank === 3) {
      // Translucent box: "fills ℝ³"
      const boxGeo = new BoxGeometry(4, 4, 4);
      const boxMat = new MeshBasicMaterial({
        color: SPACE_COLOR, transparent: true, opacity: 0.05, side: DoubleSide,
      });
      this.dynamicGroup.add(new Mesh(boxGeo, boxMat));
      const wireMat = new MeshBasicMaterial({
        color: SPACE_COLOR, wireframe: true, transparent: true, opacity: 0.3,
      });
      this.dynamicGroup.add(new Mesh(boxGeo, wireMat));
    } else if (ex.rank === 2) {
      // Plane: find normal from cross product of two independent cols
      let normal: V3 = [0, 0, 1];
      outer: for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
          const n = cross(cols[i], cols[j]);
          if (vlen(n) > 1e-9) {
            normal = n;
            break outer;
          }
        }
      }
      const nVec = new Vector3(...normal).normalize();
      const planeQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), nVec);

      const planeGeo = new PlaneGeometry(3.5, 3.5, 7, 7);
      const planeMat = new MeshStandardMaterial({
        color: SPACE_COLOR, transparent: true, opacity: 0.32, side: DoubleSide,
      });
      const planeMesh = new Mesh(planeGeo, planeMat);
      planeMesh.quaternion.copy(planeQuat);
      this.dynamicGroup.add(planeMesh);

      const wireMat = new MeshBasicMaterial({
        color: SPACE_COLOR, wireframe: true, transparent: true, opacity: 0.5,
      });
      const wireMesh = new Mesh(planeGeo, wireMat);
      wireMesh.quaternion.copy(planeQuat);
      this.dynamicGroup.add(wireMesh);
    } else if (ex.rank === 1) {
      // Line: find first non-zero column as direction
      let dir: V3 = [1, 0, 0];
      for (const c of cols) {
        if (vlen(c) > 1e-9) { dir = c; break; }
      }
      const dVec = new Vector3(...dir).normalize();
      const lineLen = 5;
      const cylGeo = new CylinderGeometry(0.06, 0.06, lineLen, 16);
      const cylMat = new MeshStandardMaterial({ color: SPACE_COLOR, transparent: true, opacity: 0.6 });
      const cyl = new Mesh(cylGeo, cylMat);
      const cylQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dVec);
      cyl.quaternion.copy(cylQuat);
      this.dynamicGroup.add(cyl);
    }
    // rank 0: nothing extra (just the origin sphere already in scene)

    // Draw each column vector as ArrowHelper (skip zero columns)
    for (let i = 0; i < 3; i++) {
      const c = cols[i];
      const len = vlen(c);
      if (len < 1e-9) continue;
      const dir = new Vector3(...c).normalize();
      const arrow = new ArrowHelper(dir, new Vector3(0, 0, 0), len, colColors[i], 0.18, 0.12);
      this.dynamicGroup.add(arrow);
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };

  resetView(): void {
    this.camera.position.set(5, 4, 5);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  toggleAuto(): void {
    this.autoRotate.update((v) => !v);
  }
}
