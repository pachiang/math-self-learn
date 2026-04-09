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
  AxesHelper,
  BufferGeometry,
  DirectionalLight,
  GridHelper,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Example {
  name: string;
  A: [number, number, number];
  color: number;
  desc: string;
  shape: string;
}

const EXAMPLES: Example[] = [
  {
    name: '圓碗',
    A: [1, 0, 1],
    color: 0x6e8aa8,
    desc: '所有方向都往上彎，這是最標準的正定情況。',
    shape: 'bowl',
  },
  {
    name: '斜橢圓碗',
    A: [2, 1, 2],
    color: 0xa8806e,
    desc: '還是往上彎，但主方向被轉斜了。',
    shape: 'tilted bowl',
  },
  {
    name: '平坦谷',
    A: [1, 0, 0],
    color: 0xc4a050,
    desc: '有一個方向完全平，代表只半正定，不是嚴格的碗。',
    shape: 'valley',
  },
  {
    name: '鞍面',
    A: [1, 0, -1],
    color: 0xa05a5a,
    desc: '一個方向往上、另一個方向往下，所以會變成 saddle。',
    shape: 'saddle',
  },
];

@Component({
  selector: 'app-step-surface-shapes',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="曲面：bowl 與 saddle" subtitle="§7.3">
      <p>
        把二次型當成高度函數：
      </p>
      <p class="formula">z = xᵀAx</p>
      <p>
        你就會從平面上的一個數，得到空間中的一個曲面。這時候矩陣的性質不再只是代數運算，
        而是會直接長成<strong>碗、谷、或鞍</strong>。
      </p>
      <p>
        這也是為什麼對稱矩陣在幾何、最小化和機率裡這麼重要：它們常常真的在描述一個能量地形。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="切換不同矩陣，旋轉曲面，並拖動探針看 z = xᵀAx 的高度">
      <div class="ex-tabs">
        @for (e of examples; track e.name; let i = $index) {
          <button class="et" [class.active]="sel() === i" (click)="sel.set(i)">{{ e.name }}</button>
        }
      </div>

      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetView()">↺ 重置視角</button>
        <button class="ctrl-btn" [class.active]="autoRotate()" (click)="toggleAuto()">
          {{ autoRotate() ? '⏸ 停止自轉' : '▷ 自動旋轉' }}
        </button>
      </div>

      <div class="probe-grid">
        <div class="probe-row">
          <span class="lab">x</span>
          <input type="range" min="-1.8" max="1.8" step="0.1" [value]="probeX()" (input)="probeX.set(+$any($event).target.value)" />
          <span class="val">{{ probeX().toFixed(1) }}</span>
        </div>
        <div class="probe-row">
          <span class="lab">y</span>
          <input type="range" min="-1.8" max="1.8" step="0.1" [value]="probeY()" (input)="probeY.set(+$any($event).target.value)" />
          <span class="val">{{ probeY().toFixed(1) }}</span>
        </div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">A</span>
          <span class="iv">[[{{ a() }}, {{ b() }}], [{{ b() }}, {{ d() }}]]</span>
        </div>
        <div class="info-row">
          <span class="il">探針</span>
          <span class="iv">({{ probeX().toFixed(1) }}, {{ probeY().toFixed(1) }})</span>
        </div>
        <div class="info-row big">
          <span class="il">高度</span>
          <span class="iv"><strong>{{ qValue().toFixed(2) }}</strong>，曲面是 {{ current().shape }}</span>
        </div>
      </div>

      <div class="explain">{{ current().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        你現在看到的是這一章最重要的幾何轉換：
        <strong>矩陣 → 二次型 → 曲面</strong>。
      </p>
      <p>
        接下來我們要問一個更深的問題：如果這個曲面是由對稱矩陣產生的，
        它有沒有一組<strong>天然的正交方向</strong>，可以把整件事看得更乾淨？
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula {
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      padding: 10px 12px;
      background: var(--accent-10);
      border-radius: 8px;
      margin: 10px 0;
    }

    .ex-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .et {
      padding: 5px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;

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

    .three-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      background: var(--bg);
      margin-bottom: 12px;
    }

    .three-wrap canvas {
      width: 100% !important;
      height: 100% !important;
      display: block;
      touch-action: none;
    }

    .ctrl-row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .ctrl-btn {
      padding: 5px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text-muted);
      font-size: 12px;
      cursor: pointer;

      &:hover {
        background: var(--accent-10);
        color: var(--accent);
        border-color: var(--accent-30);
      }

      &.active {
        background: var(--accent-18);
        color: var(--accent);
        border-color: var(--accent);
      }
    }

    .probe-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
    }

    .probe-row {
      display: grid;
      grid-template-columns: 22px 1fr 40px;
      gap: 10px;
      align-items: center;
    }

    .lab {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .probe-row input {
      accent-color: var(--accent);
    }

    .val {
      font-size: 12px;
      text-align: right;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .info {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .info-row {
      display: grid;
      grid-template-columns: 72px 1fr;
      border-bottom: 1px solid var(--border);

      &:last-child {
        border-bottom: none;
      }

      &.big {
        background: var(--accent-10);
      }
    }

    .il {
      padding: 8px 12px;
      font-size: 12px;
      color: var(--text-muted);
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
    }

    .iv {
      padding: 8px 12px;
      font-size: 13px;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .iv strong {
      color: var(--accent);
      font-size: 16px;
    }

    .explain {
      padding: 10px 14px;
      border-radius: 8px;
      background: var(--bg-surface);
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
    }
  `,
})
export class StepSurfaceShapesComponent implements AfterViewInit, OnDestroy {
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly autoRotate = signal(false);
  readonly probeX = signal(0.9);
  readonly probeY = signal(0.6);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private resizeObserver?: ResizeObserver;
  private dynamicGroup!: Group;
  private probeSphere?: Mesh;
  private probeLine?: Line;

  readonly current = computed(() => this.examples[this.sel()]);
  readonly a = computed(() => this.current().A[0]);
  readonly b = computed(() => this.current().A[1]);
  readonly d = computed(() => this.current().A[2]);
  readonly qValue = computed(() =>
    this.quadratic(this.current().A, this.probeX(), this.probeY()),
  );

  constructor() {
    effect(() => {
      const ex = this.current();
      if (this.scene) this.rebuildSurface(ex);
    });

    effect(() => {
      this.probeX();
      this.probeY();
      this.current();
      if (this.scene) this.updateProbe();
    });

    effect(() => {
      const auto = this.autoRotate();
      if (this.controls) this.controls.autoRotate = auto;
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.rebuildSurface(this.current());
    this.updateProbe();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.resizeObserver?.disconnect();
    if (this.scene) this.disposeObject(this.scene);
    this.renderer?.dispose();
  }

  resetView(): void {
    this.camera.position.set(4.8, 3.7, 4.8);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
  }

  toggleAuto(): void {
    this.autoRotate.update((v) => !v);
  }

  private quadratic(A: [number, number, number], x: number, y: number): number {
    const [a, b, d] = A;
    return a * x * x + 2 * b * x * y + d * y * y;
  }

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const wrap = this.wrapRef()?.nativeElement;
    if (!canvas || !wrap) return;

    this.scene = new Scene();
    this.scene.background = null;

    this.camera = new PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(4.8, 3.7, 4.8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resizeRenderer();

    this.scene.add(new AmbientLight(0xffffff, 1.0));
    const dl = new DirectionalLight(0xffffff, 1.2);
    dl.position.set(5, 6, 4);
    this.scene.add(dl);
    const dl2 = new DirectionalLight(0xffffff, 0.5);
    dl2.position.set(-4, 3, -5);
    this.scene.add(dl2);

    const grid = new GridHelper(4, 8, 0x999999, 0xdddddd);
    const gridMat = grid.material as LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = 0.35;
    this.scene.add(grid);
    this.scene.add(new AxesHelper(2.5));

    this.dynamicGroup = new Group();
    this.scene.add(this.dynamicGroup);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 12;
    this.controls.target.set(0, 0.5, 0);
    this.controls.autoRotateSpeed = 1.0;

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

  private rebuildSurface(example: Example): void {
    while (this.dynamicGroup.children.length > 0) {
      const child = this.dynamicGroup.children[0];
      this.dynamicGroup.remove(child);
      this.disposeObject(child);
    }

    const surface = this.createSurfaceMesh(example);
    this.dynamicGroup.add(surface);

    const wire = new Mesh(
      surface.geometry.clone(),
      new MeshBasicMaterial({
        color: 0x444444,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      }),
    );
    this.dynamicGroup.add(wire);

    this.probeSphere = new Mesh(
      new SphereGeometry(0.08, 20, 20),
      new MeshStandardMaterial({ color: 0xbf6e6e }),
    );
    this.dynamicGroup.add(this.probeSphere);

    this.probeLine = new Line(
      new BufferGeometry(),
      new LineBasicMaterial({ color: 0xbf6e6e, transparent: true, opacity: 0.6 }),
    );
    this.dynamicGroup.add(this.probeLine);

    this.updateProbe();
  }

  private createSurfaceMesh(example: Example): Mesh {
    const geometry = new PlaneGeometry(4, 4, 48, 48);
    geometry.rotateX(-Math.PI / 2);
    const pos = geometry.attributes['position'];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = this.quadratic(example.A, x, z) * 0.35;
      pos.setY(i, y);
    }

    geometry.computeVertexNormals();

    return new Mesh(
      geometry,
      new MeshStandardMaterial({
        color: example.color,
        transparent: true,
        opacity: 0.82,
      }),
    );
  }

  private updateProbe(): void {
    if (!this.probeSphere || !this.probeLine) return;
    const x = this.probeX();
    const z = this.probeY();
    const y = this.qValue() * 0.35;

    this.probeSphere.position.set(x, y, z);

    const lineGeometry = this.probeLine.geometry as BufferGeometry;
    lineGeometry.setFromPoints([new Vector3(x, 0, z), new Vector3(x, y, z)]);
  }

  private disposeObject(obj: Object3D): void {
    obj.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        const material = child.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      } else if (child instanceof Line) {
        child.geometry.dispose();
        const material = child.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      }
    });
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };
}
