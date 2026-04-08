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

interface Example {
  name: string;
  A: number[][];
  rowBasis: [V3, V3];
  nullDir: V3;
  desc: string;
}

const EXAMPLES: Example[] = [
  {
    name: '\u6A19\u6E96',
    A: [[1, 0, 0], [0, 1, 0], [0, 0, 0]],
    rowBasis: [[1, 0, 0], [0, 1, 0]],
    nullDir: [0, 0, 1],
    desc: '\u884C\u7A7A\u9593 = xy \u5E73\u9762\uFF0C\u96F6\u7A7A\u9593 = z \u8EF8',
  },
  {
    name: '\u659C\u4E00',
    A: [[1, 0, 1], [0, 1, 1], [1, 1, 2]],
    rowBasis: [[1, 0, 1], [0, 1, 1]],
    nullDir: [-1, -1, 1],
    desc: 'R\u2083 = R\u2081 + R\u2082\uFF0C\u884C\u7A7A\u9593\u662F\u500B\u659C\u5E73\u9762',
  },
  {
    name: '\u659C\u4E8C',
    A: [[2, 1, 0], [0, 1, 1], [2, 2, 1]],
    rowBasis: [[2, 1, 0], [0, 1, 1]],
    nullDir: [1, -2, 2],
    desc: 'R\u2083 = R\u2081 + R\u2082\uFF0C\u53E6\u4E00\u500B\u4F8B\u5B50',
  },
];

const PLANE_COLOR = 0xbf9e93;     // ê₁ orange-brown
const PLANE_WIRE_COLOR = 0xa8806e;
const NULL_COLOR = 0xa05a5a;       // red
const ROW_VEC_COLOR = 0xbf9e93;
const NULL_VEC_COLOR = 0xa05a5a;

@Component({
  selector: 'app-step-fundamental-thm',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u6B63\u4EA4\u88DC\u8207\u57FA\u672C\u5B9A\u7406" subtitle="\u00A75.6">
      <p>
        \u4E0A\u4E00\u7BC0\u7684\u300C\u5927\u5716\u300D\u7684\u6700\u6F02\u4EAE\u7684\u6027\u8CEA\uFF0C\u662F\u540C\u908A\u7684\u5169\u500B\u5B50\u7A7A\u9593<strong>\u4E92\u76F8\u5782\u76F4</strong>\uFF1A
      </p>
      <p class="big-formula">
        \u884C\u7A7A\u9593 \u22A5 \u96F6\u7A7A\u9593\uFF08\u5728 \u211D\u207F \u88E1\uFF09<br/>
        \u5217\u7A7A\u9593 \u22A5 \u5DE6\u96F6\u7A7A\u9593\uFF08\u5728 \u211D\u1D50 \u88E1\uFF09
      </p>
      <p>
        \u9019\u88E1\u300C\u5782\u76F4\u300D\u7684\u610F\u601D\uFF1A\u4E00\u500B\u7A7A\u9593\u88E1\u4EFB\u4F55\u5411\u91CF\u8DDF\u53E6\u4E00\u500B\u7A7A\u9593\u88E1\u4EFB\u4F55\u5411\u91CF\u7684\u9EDE\u7A4D\u90FD\u662F\u96F6\u3002
      </p>
      <p>
        \u9019\u500B\u4E8B\u5BE6\u53EB\u505A\u300C<strong>\u7DDA\u6027\u4EE3\u6578\u57FA\u672C\u5B9A\u7406</strong>\u300D\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u62FD 3D \u5716\u4F86\u770B\u884C\u7A7A\u9593\uFF08\u5E73\u9762\uFF09\u8DDF\u96F6\u7A7A\u9593\uFF08\u7DDA\uFF09\u600E\u9EBC\u5782\u76F4">
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
        <button class="ctrl-btn" (click)="toggleAuto()" [class.active]="autoRotate()">
          {{ autoRotate() ? '\u23F8 \u505C\u6B62\u81EA\u8F49' : '\u25B7 \u81EA\u52D5\u65CB\u8F49' }}
        </button>
        <span class="ctrl-info">\u62D6\u62FD\u65CB\u8F49 \u00B7 \u6EFE\u8F2A\u7E2E\u653E</span>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">\u77E9\u9663 A</span>
          <span class="iv">{{ matrixStr() }}</span>
        </div>
        <div class="info-row row-color">
          <span class="il">\u884C\u7A7A\u9593\u57FA\u5E95</span>
          <span class="iv">r\u2081 = ({{ current().rowBasis[0].join(', ') }}), r\u2082 = ({{ current().rowBasis[1].join(', ') }})</span>
        </div>
        <div class="info-row null-color">
          <span class="il">\u96F6\u7A7A\u9593\u65B9\u5411</span>
          <span class="iv">n = ({{ current().nullDir.join(', ') }})</span>
        </div>
        <div class="info-row big">
          <span class="il">\u9A57\u8B49\u6B63\u4EA4</span>
          <span class="iv">
            r\u2081\u00B7n = <strong>{{ dotR1N() }}</strong>\u3001
            r\u2082\u00B7n = <strong>{{ dotR2N() }}</strong> \u2713
          </span>
        </div>
      </div>

      <div class="explain">{{ current().desc }}</div>
    </app-challenge-card>

    <app-prose-block title="\u70BA\u4EC0\u9EBC\u9019\u500B\u5B9A\u7406\u91CD\u8981\uFF1F">
      <p>\u56E0\u70BA\u5B83\u8B93\u4F60\u80FD\u300C<strong>\u62C6\u89E3\u4EFB\u610F\u5411\u91CF</strong>\u300D\uFF1A</p>
      <p class="formula">\u4EFB\u4F55 x \u2208 \u211D\u207F = (x \u5728\u884C\u7A7A\u9593\u7684\u90E8\u5206) + (x \u5728\u96F6\u7A7A\u9593\u7684\u90E8\u5206)</p>
      <p>
        \u9019\u500B\u62C6\u89E3\u662F<strong>\u552F\u4E00\u7684</strong>\u3002A \u53EA\u300C\u770B\u898B\u300D\u884C\u7A7A\u9593\u7684\u90E8\u5206\uFF0C\u96F6\u7A7A\u9593\u7684\u90E8\u5206\u88AB\u934A\u6389\u3002
      </p>
      <span class="hint">
        \u9019\u4E9B\u6B63\u4EA4\u95DC\u4FC2\u5728 SVD \u88E1\u9054\u5230\u5DD4\u5CF0\u3002\u4E0B\u4E00\u7AE0\u898B\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .big-formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; line-height: 2; margin: 10px 0; }
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 10px; font-family: 'JetBrains Mono', monospace; }

    .ex-tabs { display: flex; gap: 4px; margin-bottom: 12px; }
    .et { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .three-wrap {
      position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px;
    }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block;
      touch-action: none; }

    .ctrl-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
      &.active { background: var(--accent-18); color: var(--accent); border-color: var(--accent); } }
    .ctrl-info { font-size: 11px; color: var(--text-muted); margin-left: auto; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .info-row { display: grid; grid-template-columns: 110px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.row-color { background: rgba(191, 158, 147, 0.08); }
      &.null-color { background: rgba(160, 90, 90, 0.06); }
      &.big { background: rgba(90,138,90,0.08); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: #5a8a5a; font-size: 14px; }

    .explain { padding: 10px 14px; border-radius: 8px; background: var(--bg-surface);
      font-size: 12px; color: var(--text-secondary); text-align: center; }
  `,
})
export class StepFundamentalThmComponent implements AfterViewInit, OnDestroy {
  readonly examples = EXAMPLES;
  readonly sel = signal(1);
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
  readonly dotR1N = computed(() => {
    const r = this.current().rowBasis[0], n = this.current().nullDir;
    return r[0] * n[0] + r[1] * n[1] + r[2] * n[2];
  });
  readonly dotR2N = computed(() => {
    const r = this.current().rowBasis[1], n = this.current().nullDir;
    return r[0] * n[0] + r[1] * n[1] + r[2] * n[2];
  });

  constructor() {
    // React to example changes by rebuilding the dynamic geometry
    effect(() => {
      const ex = this.current();
      if (this.scene) this.rebuildDynamic(ex);
    });
    // React to auto-rotate toggle
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

    // Scene
    this.scene = new Scene();
    this.scene.background = null; // transparent

    // Camera
    this.camera = new PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(4.5, 3.5, 4.5);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resizeRenderer();

    // Lights
    this.scene.add(new AmbientLight(0xffffff, 1.0));
    const dl = new DirectionalLight(0xffffff, 1.4);
    dl.position.set(5, 8, 5);
    this.scene.add(dl);
    const dl2 = new DirectionalLight(0xffffff, 0.5);
    dl2.position.set(-5, -3, -5);
    this.scene.add(dl2);

    // Static helpers
    const grid = new GridHelper(6, 12, 0x999999, 0xdddddd);
    const gridMat = grid.material as LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = 0.35;
    this.scene.add(grid);

    const axes = new AxesHelper(2.5);
    this.scene.add(axes);

    // Origin marker
    const originGeo = new SphereGeometry(0.06, 16, 16);
    const originMat = new MeshStandardMaterial({ color: 0x333333 });
    this.scene.add(new Mesh(originGeo, originMat));

    // Container for things that change with the example
    this.dynamicGroup = new Group();
    this.scene.add(this.dynamicGroup);

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 15;
    this.controls.autoRotateSpeed = 1.0;
    this.controls.target.set(0, 0, 0);

    // Resize observer
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

  private rebuildDynamic(ex: Example): void {
    // Dispose old children
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

    // Plane normal = null direction (normalised)
    const nullVec = new Vector3(...ex.nullDir).normalize();
    const planeQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), nullVec);

    // Filled translucent plane
    const planeGeo = new PlaneGeometry(3, 3, 6, 6);
    const planeMat = new MeshStandardMaterial({
      color: PLANE_COLOR,
      transparent: true,
      opacity: 0.35,
      side: DoubleSide,
      flatShading: false,
    });
    const planeMesh = new Mesh(planeGeo, planeMat);
    planeMesh.quaternion.copy(planeQuat);
    this.dynamicGroup.add(planeMesh);

    // Wireframe overlay (subdivided grid lines on the plane)
    const wireGeo = new PlaneGeometry(3, 3, 6, 6);
    const wireMat = new MeshBasicMaterial({
      color: PLANE_WIRE_COLOR,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const wireMesh = new Mesh(wireGeo, wireMat);
    wireMesh.quaternion.copy(planeQuat);
    this.dynamicGroup.add(wireMesh);

    // Null space line — a thin cylinder
    const nullLen = 4.5;
    const cylGeo = new CylinderGeometry(0.04, 0.04, nullLen, 12);
    const cylMat = new MeshStandardMaterial({ color: NULL_COLOR });
    const cyl = new Mesh(cylGeo, cylMat);
    // Cylinder default points along +y; rotate so it points along nullVec
    const cylQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), nullVec);
    cyl.quaternion.copy(cylQuat);
    this.dynamicGroup.add(cyl);

    // Sample row vector (= r1)
    const r1 = new Vector3(...ex.rowBasis[0]);
    const r1Len = r1.length();
    const r1Arrow = new ArrowHelper(r1.clone().normalize(), new Vector3(0, 0, 0), r1Len, ROW_VEC_COLOR, 0.18, 0.12);
    this.dynamicGroup.add(r1Arrow);

    // Sample null vector
    const nullArrow = new ArrowHelper(nullVec.clone(), new Vector3(0, 0, 0), 1.4, NULL_VEC_COLOR, 0.18, 0.12);
    this.dynamicGroup.add(nullArrow);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };

  resetView(): void {
    this.camera.position.set(4.5, 3.5, 4.5);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  toggleAuto(): void {
    this.autoRotate.update((v) => !v);
  }
}
