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
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  Group,
  LineBasicMaterial,
  LineDashedMaterial,
  Line,
  BufferGeometry,
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
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type V3 = [number, number, number];

// Fixed example: A is rank 2, non-symmetric, all four subspaces distinct.
//   A = [[1, 0, 1],
//        [0, 1, 1],
//        [2, 1, 3]]
// Row space  = span((1,0,1), (0,1,1))   in input ℝ³
// Null space = span((1, 1, -1))         in input ℝ³
// Col space  = span((1,0,2), (0,1,1))   in output ℝ³
// L-null     = span((2, 1, -1))         in output ℝ³
const A: number[][] = [
  [1, 0, 1],
  [0, 1, 1],
  [2, 1, 3],
];
const ROW_R1: V3 = [1, 0, 1];
const ROW_R2: V3 = [0, 1, 1];
const NULL_DIR: V3 = [1, 1, -1];
const COL_C1: V3 = [1, 0, 2];
const COL_C2: V3 = [0, 1, 1];
const LEFT_NULL_DIR: V3 = [2, 1, -1];

// Colours
const ROW_COLOR = 0xbf9e93;       // row space (input)
const NULL_COLOR = 0xa05a5a;      // null space (input)
const COL_COLOR = 0x6e8aa8;       // column space (output)
const LEFT_NULL_COLOR = 0xc4a050; // left null space (output)
const X_COLOR = 0x333333;         // input vector x
const AX_COLOR = 0x3b6b8a;        // output vector Ax

function vAdd(a: V3, b: V3): V3 { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function vScale(v: V3, s: number): V3 { return [v[0] * s, v[1] * s, v[2] * s]; }
function vSub(a: V3, b: V3): V3 { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vLen(v: V3): number { return Math.hypot(v[0], v[1], v[2]); }
function dot(a: V3, b: V3): number { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function applyA(x: V3): V3 {
  return [
    A[0][0] * x[0] + A[0][1] * x[1] + A[0][2] * x[2],
    A[1][0] * x[0] + A[1][1] * x[1] + A[1][2] * x[2],
    A[2][0] * x[0] + A[2][1] * x[1] + A[2][2] * x[2],
  ];
}

@Component({
  selector: 'app-step-four-subspaces',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u56DB\u500B\u5B50\u7A7A\u9593\u7684\u5168\u8C8C" subtitle="\u00A75.5">
      <p>
        \u4E00\u500B m\u00D7n \u77E9\u9663 A \u5176\u5BE6\u5B9A\u7FA9\u4E86<strong>\u56DB\u500B</strong>\u91CD\u8981\u7684\u5B50\u7A7A\u9593\uFF1A
      </p>
      <ul>
        <li><strong>\u884C\u7A7A\u9593 C(A\u1D40)</strong> \u5728 \u211D\u207F\uFF08\u8F38\u5165\u7AEF\uFF09\u3002\u7DAD\u5EA6 = rank</li>
        <li><strong>\u96F6\u7A7A\u9593 N(A)</strong> \u5728 \u211D\u207F\uFF08\u8F38\u5165\u7AEF\uFF09\u3002\u7DAD\u5EA6 = n \u2212 rank</li>
        <li><strong>\u5217\u7A7A\u9593 C(A)</strong> \u5728 \u211D\u1D50\uFF08\u8F38\u51FA\u7AEF\uFF09\u3002\u7DAD\u5EA6 = rank</li>
        <li><strong>\u5DE6\u96F6\u7A7A\u9593 N(A\u1D40)</strong> \u5728 \u211D\u1D50\uFF08\u8F38\u51FA\u7AEF\uFF09\u3002\u7DAD\u5EA6 = m \u2212 rank</li>
      </ul>
      <p>
        \u8981\u771F\u6B63\u770B\u61C2\u300C\u9019\u56DB\u500B\u5B50\u7A7A\u9593\u300D\u7684\u610F\u601D\uFF0C\u5FC5\u9808\u770B\u5230 A <strong>\u5982\u4F55\u4F5C\u7528</strong>\u4E00\u500B\u5411\u91CF\uFF1A
      </p>
      <ul>
        <li>x \u5728\u884C\u7A7A\u9593\u7684\u90E8\u5206 \u2192 A \u300C\u770B\u898B\u300D\u4E26\u96D9\u5C04\u5230\u5217\u7A7A\u9593</li>
        <li>x \u5728\u96F6\u7A7A\u9593\u7684\u90E8\u5206 \u2192 A <strong>\u5B8C\u5168\u770B\u4E0D\u898B</strong>\uFF0C\u88AB\u58D3\u6210 0</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u4E0B\u9762\u4E09\u500B\u6ED1\u6876 \u2014 \u7279\u5225\u662F\u300C\u96F6\u7A7A\u9593\u5206\u91CF\u300D\u90A3\u500B\uFF0C\u770B\u4F60\u662F\u5426\u80FD\u8B93 x \u52D5\u4F46 Ax \u4E0D\u52D5">
      <div class="dual-wrap" #wrap>
        <canvas #canvas></canvas>
        <div class="scene-label left-label">\u8F38\u5165\u7A7A\u9593 \u211D\u00B3</div>
        <div class="scene-label right-label">\u8F38\u51FA\u7A7A\u9593 \u211D\u00B3</div>
        <div class="arrow-mid">A \u2192</div>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetView()">\u21BA \u91CD\u7F6E\u8996\u89D2</button>
        <button class="ctrl-btn" (click)="presetRow()">\u8A2D\u70BA\u300C\u7D14\u884C\u7A7A\u9593\u300D</button>
        <button class="ctrl-btn" (click)="presetNull()">\u8A2D\u70BA\u300C\u7D14\u96F6\u7A7A\u9593\u300D</button>
      </div>

      <div class="sliders">
        <div class="sl">
          <span class="sl-lab row">\u884C\u7A7A\u9593 a</span>
          <input type="range" min="-1.5" max="1.5" step="0.1" [value]="a()"
            (input)="a.set(+$any($event).target.value)" />
          <span class="sl-val">{{ a().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab row">\u884C\u7A7A\u9593 b</span>
          <input type="range" min="-1.5" max="1.5" step="0.1" [value]="b()"
            (input)="b.set(+$any($event).target.value)" />
          <span class="sl-val">{{ b().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab null-c">\u96F6\u7A7A\u9593 c</span>
          <input type="range" min="-1.5" max="1.5" step="0.1" [value]="c()"
            (input)="c.set(+$any($event).target.value)" />
          <span class="sl-val">{{ c().toFixed(2) }}</span>
        </div>
      </div>

      <div class="key-insight" [class.shown]="cChanged()">
        \u26A1 \u62D6 c \u6ED1\u6876 \u2192 x \u5728\u5DE6\u908A\u660E\u986F\u504F\u96E2\u884C\u7A7A\u9593\u5E73\u9762\uFF0C
        \u4F46\u53F3\u908A\u7684 Ax <strong>\u5B8C\u5168\u4E0D\u52D5</strong>\u3002
        \u9019\u5C31\u662F\u300C\u96F6\u7A7A\u9593\u88AB A \u934A\u6389\u300D\u7684\u610F\u601D\u3002
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">x</span>
          <span class="iv">({{ x()[0].toFixed(2) }}, {{ x()[1].toFixed(2) }}, {{ x()[2].toFixed(2) }})</span>
        </div>
        <div class="info-row">
          <span class="il">Ax</span>
          <span class="iv">({{ Ax()[0].toFixed(2) }}, {{ Ax()[1].toFixed(2) }}, {{ Ax()[2].toFixed(2) }})</span>
        </div>
        <div class="info-row big">
          <span class="il">\u9A57\u8B49</span>
          <span class="iv">Ax = a\u00B7Ar\u2081 + b\u00B7Ar\u2082 + <s>c\u00B7An</s>\uFF08c \u9805\u70BA\u96F6\uFF09</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u770B\u5230\u4E86\u55CE\uFF1F\u300C<strong>A \u53EA\u770B\u898B\u884C\u7A7A\u9593</strong>\u300D\u662F\u4E00\u500B\u6975\u70BA\u5F37\u5927\u7684\u8A8D\u77E5\u8DF3\u8E8D\uFF1A
      </p>
      <ul>
        <li>\u8981\u89E3 Ax = b\uFF0C\u4F60\u53EA\u9700\u8981\u627E\u884C\u7A7A\u9593\u88E1\u7684 x</li>
        <li>\u4EFB\u4F55 N(A) \u88E1\u7684 \u52A0\u9805 \u90FD\u4E0D\u6539\u8B8A\u7B54\u6848 \u2192 \u9019\u5C31\u662F\u300C\u89E3\u7A7A\u9593\u662F x_p + N(A)\u300D\u7684\u4F86\u6E90</li>
        <li>A \u662F\u884C\u7A7A\u9593\u8DDF\u5217\u7A7A\u9593\u4E4B\u9593\u7684<strong>\u96D9\u5C04</strong>\uFF1A\u540C\u7DAD\u5EA6\u3001\u4E92\u76F8\u5C0D\u61C9</li>
      </ul>
      <p>
        \u4E0B\u4E00\u7BC0\u6211\u5011\u8B49\u660E\u4E00\u500B\u95DC\u9375\u4E8B\u5BE6\uFF1A\u884C\u7A7A\u9593 \u8DDF \u96F6\u7A7A\u9593 \u662F\u6B63\u4EA4\u7684\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .dual-wrap { position: relative; width: 100%; aspect-ratio: 2 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .dual-wrap canvas { width: 100% !important; height: 100% !important; display: block;
      touch-action: none; }
    .scene-label { position: absolute; top: 8px; font-size: 11px; font-weight: 700;
      color: var(--text-muted); padding: 3px 8px; background: var(--bg-surface);
      border-radius: 4px; pointer-events: none; }
    .left-label { left: 12px; }
    .right-label { right: 12px; }
    .arrow-mid { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      font-size: 14px; font-weight: 700; color: var(--accent); background: var(--bg);
      padding: 4px 10px; border-radius: 6px; border: 1px solid var(--accent-30);
      pointer-events: none; font-family: 'Noto Sans Math', serif; }

    .ctrl-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); } }

    .sliders { display: flex; flex-direction: column; gap: 6px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; font-weight: 700; min-width: 95px; padding: 2px 8px; border-radius: 4px;
      &.row { background: rgba(191, 158, 147, 0.18); color: var(--v0); }
      &.null-c { background: rgba(160, 90, 90, 0.18); color: #a05a5a; } }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      min-width: 44px; text-align: right; }

    .key-insight { padding: 12px 16px; border-radius: 8px;
      background: rgba(160, 90, 90, 0.06); border: 1px dashed rgba(160, 90, 90, 0.3);
      font-size: 13px; color: var(--text-secondary); line-height: 1.6;
      transition: background 0.3s, border 0.3s;
      strong { color: #a05a5a; }
      &.shown { background: rgba(160, 90, 90, 0.12); border-style: solid; } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-top: 12px; }
    .info-row { display: grid; grid-template-columns: 60px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      s { color: var(--text-muted); text-decoration: line-through; } }
  `,
})
export class StepFourSubspacesComponent implements AfterViewInit, OnDestroy {
  // Sliders: x = a·r1 + b·r2 + c·n  (decomposition into row + null components)
  readonly a = signal(0.5);
  readonly b = signal(0.5);
  readonly c = signal(0);

  // Track whether c has been moved (for the "shown" highlight on the key insight box)
  readonly cChanged = computed(() => Math.abs(this.c()) > 0.01);

  readonly x = computed<V3>(() => {
    const a = this.a(), b = this.b(), c = this.c();
    return [
      a * ROW_R1[0] + b * ROW_R2[0] + c * NULL_DIR[0],
      a * ROW_R1[1] + b * ROW_R2[1] + c * NULL_DIR[1],
      a * ROW_R1[2] + b * ROW_R2[2] + c * NULL_DIR[2],
    ];
  });
  readonly Ax = computed<V3>(() => applyA(this.x()));

  // Three.js state
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');

  private renderer!: WebGLRenderer;
  private sceneIn!: Scene;
  private sceneOut!: Scene;
  private cameraIn!: PerspectiveCamera;
  private cameraOut!: PerspectiveCamera;
  private controls!: OrbitControls;
  private animationId = 0;
  private resizeObserver?: ResizeObserver;

  // Dynamic objects we update on slider changes
  private xArrow!: ArrowHelper;
  private dropLine!: Line; // perpendicular drop from x to row plane
  private axArrow!: ArrowHelper;

  constructor() {
    effect(() => {
      // Read x and Ax to register dependency
      const x = this.x();
      const ax = this.Ax();
      if (this.xArrow) this.updateProbe(x, ax);
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.updateProbe(this.x(), this.Ax());
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.resizeObserver?.disconnect();
    if (this.sceneIn) this.disposeScene(this.sceneIn);
    if (this.sceneOut) this.disposeScene(this.sceneOut);
    this.renderer?.dispose();
  }

  private disposeScene(scene: Scene): void {
    scene.traverse((obj: Object3D) => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      } else if (obj instanceof Line) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
  }

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const wrap = this.wrapRef()?.nativeElement;
    if (!canvas || !wrap) return;

    // Renderer (single canvas, will use scissor test for split rendering)
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Two scenes
    this.sceneIn = new Scene();
    this.sceneOut = new Scene();

    // Two cameras
    this.cameraIn = new PerspectiveCamera(45, 1, 0.1, 100);
    this.cameraOut = new PerspectiveCamera(45, 1, 0.1, 100);
    this.cameraIn.position.set(5, 4, 5);
    this.cameraOut.position.set(5, 4, 5);
    this.cameraIn.lookAt(0, 0, 0);
    this.cameraOut.lookAt(0, 0, 0);

    // Lights for both scenes
    this.addLights(this.sceneIn);
    this.addLights(this.sceneOut);

    // Common helpers
    this.addCommonHelpers(this.sceneIn);
    this.addCommonHelpers(this.sceneOut);

    // Build the input scene (row space + null space + draggable probe x)
    this.buildInputScene();

    // Build the output scene (column space + left null space + Ax)
    this.buildOutputScene();

    // Single OrbitControls on the canvas, drives cameraIn; we copy to cameraOut each frame
    this.controls = new OrbitControls(this.cameraIn, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 16;
    this.controls.target.set(0, 0, 0);

    // Resize handling
    this.resizeObserver = new ResizeObserver(() => this.resizeRenderer());
    this.resizeObserver.observe(wrap);
    this.resizeRenderer();
  }

  private addLights(scene: Scene): void {
    scene.add(new AmbientLight(0xffffff, 1.0));
    const dl = new DirectionalLight(0xffffff, 1.4);
    dl.position.set(5, 8, 5);
    scene.add(dl);
    const dl2 = new DirectionalLight(0xffffff, 0.5);
    dl2.position.set(-5, -3, -5);
    scene.add(dl2);
  }

  private addCommonHelpers(scene: Scene): void {
    const grid = new GridHelper(6, 12, 0x999999, 0xdddddd);
    const gridMat = grid.material as LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = 0.3;
    scene.add(grid);

    scene.add(new AxesHelper(2.2));

    const originGeo = new SphereGeometry(0.06, 16, 16);
    const originMat = new MeshStandardMaterial({ color: 0x333333 });
    scene.add(new Mesh(originGeo, originMat));
  }

  private buildInputScene(): void {
    // Row space plane
    const rowNormal = new Vector3(...NULL_DIR).normalize(); // normal of plane = null direction
    const planeQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), rowNormal);

    const planeGeo = new PlaneGeometry(3, 3, 6, 6);
    const planeMat = new MeshStandardMaterial({
      color: ROW_COLOR, transparent: true, opacity: 0.3, side: DoubleSide,
    });
    const plane = new Mesh(planeGeo, planeMat);
    plane.quaternion.copy(planeQuat);
    this.sceneIn.add(plane);

    const wireMat = new MeshBasicMaterial({
      color: ROW_COLOR, wireframe: true, transparent: true, opacity: 0.5,
    });
    const wireMesh = new Mesh(planeGeo, wireMat);
    wireMesh.quaternion.copy(planeQuat);
    this.sceneIn.add(wireMesh);

    // Null space line
    const nullVec = new Vector3(...NULL_DIR).normalize();
    const cylGeo = new CylinderGeometry(0.04, 0.04, 4.2, 12);
    const cylMat = new MeshStandardMaterial({ color: NULL_COLOR });
    const cyl = new Mesh(cylGeo, cylMat);
    cyl.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), nullVec));
    this.sceneIn.add(cyl);

    // Probe vector x — created once with a placeholder, will be updated
    this.xArrow = new ArrowHelper(
      new Vector3(1, 0, 0), new Vector3(0, 0, 0), 1, X_COLOR, 0.18, 0.12,
    );
    this.sceneIn.add(this.xArrow);

    // Perpendicular drop line from x's tip to its projection on the row plane
    const dropGeo = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 0),
    ]);
    const dropMat = new LineDashedMaterial({
      color: NULL_COLOR, dashSize: 0.08, gapSize: 0.06, transparent: true, opacity: 0.6,
    });
    this.dropLine = new Line(dropGeo, dropMat);
    this.sceneIn.add(this.dropLine);
  }

  private buildOutputScene(): void {
    // Column space plane (normal = left null direction)
    const colNormal = new Vector3(...LEFT_NULL_DIR).normalize();
    const planeQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), colNormal);

    const planeGeo = new PlaneGeometry(3, 3, 6, 6);
    const planeMat = new MeshStandardMaterial({
      color: COL_COLOR, transparent: true, opacity: 0.3, side: DoubleSide,
    });
    const plane = new Mesh(planeGeo, planeMat);
    plane.quaternion.copy(planeQuat);
    this.sceneOut.add(plane);

    const wireMat = new MeshBasicMaterial({
      color: COL_COLOR, wireframe: true, transparent: true, opacity: 0.5,
    });
    const wireMesh = new Mesh(planeGeo, wireMat);
    wireMesh.quaternion.copy(planeQuat);
    this.sceneOut.add(wireMesh);

    // Left null space line
    const lnVec = new Vector3(...LEFT_NULL_DIR).normalize();
    const cylGeo = new CylinderGeometry(0.04, 0.04, 4.2, 12);
    const cylMat = new MeshStandardMaterial({ color: LEFT_NULL_COLOR });
    const cyl = new Mesh(cylGeo, cylMat);
    cyl.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), lnVec));
    this.sceneOut.add(cyl);

    // Ax arrow — created once, updated later
    this.axArrow = new ArrowHelper(
      new Vector3(1, 0, 0), new Vector3(0, 0, 0), 1, AX_COLOR, 0.18, 0.12,
    );
    this.sceneOut.add(this.axArrow);
  }

  private updateProbe(x: V3, ax: V3): void {
    // Update x arrow
    const xLen = Math.max(0.001, vLen(x));
    this.xArrow.position.set(0, 0, 0);
    this.xArrow.setDirection(new Vector3(x[0], x[1], x[2]).normalize());
    this.xArrow.setLength(xLen, 0.18, 0.12);

    // Compute projection of x onto null direction (the perpendicular drop)
    const n = NULL_DIR;
    const nLen2 = dot(n, n);
    const xn: V3 = vScale(n, dot(x, n) / nLen2); // x's null component (perp drop from row plane)
    const xr: V3 = vSub(x, xn); // x's row component (projection onto plane)

    // Update drop line: from x's tip back to its projection xr
    const dropGeo = this.dropLine.geometry as BufferGeometry;
    dropGeo.setFromPoints([
      new Vector3(x[0], x[1], x[2]),
      new Vector3(xr[0], xr[1], xr[2]),
    ]);
    this.dropLine.computeLineDistances(); // required for dashed lines
    dropGeo.attributes['position'].needsUpdate = true;

    // Update Ax arrow
    const axLen = Math.max(0.001, vLen(ax));
    this.axArrow.position.set(0, 0, 0);
    this.axArrow.setDirection(new Vector3(ax[0], ax[1], ax[2]).normalize());
    this.axArrow.setLength(axLen, 0.18, 0.12);
  }

  private resizeRenderer(): void {
    const wrap = this.wrapRef()?.nativeElement;
    if (!wrap || !this.renderer) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    this.renderer.setSize(w, h, false);
    // Each viewport is half the canvas width but full height
    const halfW = w / 2;
    this.cameraIn.aspect = halfW / h;
    this.cameraOut.aspect = halfW / h;
    this.cameraIn.updateProjectionMatrix();
    this.cameraOut.updateProjectionMatrix();
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();

    // Sync cameraOut to cameraIn (so both viewports rotate together)
    if (this.cameraOut && this.cameraIn) {
      this.cameraOut.position.copy(this.cameraIn.position);
      this.cameraOut.quaternion.copy(this.cameraIn.quaternion);
    }

    // Split render: left viewport = sceneIn with cameraIn, right viewport = sceneOut with cameraOut
    if (this.renderer) {
      const w = this.renderer.domElement.width;
      const h = this.renderer.domElement.height;
      const halfW = w / 2;
      const pr = this.renderer.getPixelRatio();

      this.renderer.setScissorTest(true);

      // Left
      this.renderer.setViewport(0, 0, halfW / pr, h / pr);
      this.renderer.setScissor(0, 0, halfW / pr, h / pr);
      this.renderer.render(this.sceneIn, this.cameraIn);

      // Right
      this.renderer.setViewport(halfW / pr, 0, halfW / pr, h / pr);
      this.renderer.setScissor(halfW / pr, 0, halfW / pr, h / pr);
      this.renderer.render(this.sceneOut, this.cameraOut);

      this.renderer.setScissorTest(false);
    }
  };

  resetView(): void {
    this.cameraIn.position.set(5, 4, 5);
    this.cameraIn.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  presetRow(): void {
    this.a.set(0.8);
    this.b.set(0.6);
    this.c.set(0);
  }

  presetNull(): void {
    this.a.set(0);
    this.b.set(0);
    this.c.set(1);
  }
}
