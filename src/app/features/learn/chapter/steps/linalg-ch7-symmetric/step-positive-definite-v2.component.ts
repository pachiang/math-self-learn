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

type Verdict = 'positive definite' | 'positive semidefinite' | 'indefinite';
type V2 = [number, number];

interface Example {
  name: string;
  A: [[number, number], [number, number]];
  verdict: Verdict;
  color: number;
  desc: string;
}

const EXAMPLES: Example[] = [
  {
    name: '正定',
    A: [
      [2, 1],
      [1, 2],
    ],
    verdict: 'positive definite',
    color: 0x6e8aa8,
    desc: '所有非零方向都往上，曲面是真正的碗。',
  },
  {
    name: '半正定',
    A: [
      [1, 1],
      [1, 1],
    ],
    verdict: 'positive semidefinite',
    color: 0xc4a050,
    desc: '大部分方向往上，但有一條方向完全平坦。',
  },
  {
    name: '不定',
    A: [
      [1, 0],
      [0, -1],
    ],
    verdict: 'indefinite',
    color: 0xa05a5a,
    desc: '有些方向向上、有些方向向下，所以變成 saddle。',
  },
];

function quadratic(A: [[number, number], [number, number]], x: number, y: number): number {
  return A[0][0] * x * x + 2 * A[0][1] * x * y + A[1][1] * y * y;
}

function normalize(v: V2): V2 {
  const len = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / len, v[1] / len];
}

function eigenData(A: [[number, number], [number, number]]): {
  values: [number, number];
  vectors: [V2, V2];
} {
  const a = A[0][0];
  const b = A[0][1];
  const d = A[1][1];
  const mid = (a + d) / 2;
  const delta = Math.sqrt(((a - d) / 2) ** 2 + b ** 2);
  const l1 = mid + delta;
  const l2 = mid - delta;

  if (Math.abs(b) < 1e-9 && Math.abs(a - d) < 1e-9) {
    return {
      values: [l1, l2],
      vectors: [
        [1, 0],
        [0, 1],
      ],
    };
  }

  let v1: V2;
  if (Math.abs(b) > 1e-9) v1 = normalize([b, l1 - a]);
  else v1 = a >= d ? [1, 0] : [0, 1];

  const v2 = normalize([-v1[1], v1[0]]);
  return { values: [l1, l2], vectors: [v1, v2] };
}

@Component({
  selector: 'app-step-positive-definite',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="正定矩陣" subtitle="§7.6">
      <p>
        對稱矩陣 A 如果滿足
        <strong>對所有非零 x，都有 xᵀAx > 0</strong>，
        就叫做正定矩陣。
      </p>
      <p class="formula">A 正定 ⇔ 對所有 x ≠ 0，都有 xᵀAx > 0</p>
      <p>
        這句話其實可以同時用三種語言理解：
      </p>
      <ul>
        <li><strong>二次型</strong>：任何非零方向都得到正值</li>
        <li><strong>幾何曲面</strong>：z = xᵀAx 是完整的 bowl</li>
        <li><strong>特徵值</strong>：所有特徵值都大於 0</li>
      </ul>
      <p>
        第七章最後一節，就是把這三句話接成同一件事。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="先從幾何直覺看：切換正定 / 半正定 / 不定，觀察曲面與方向掃描">
      <div class="ex-tabs">
        @for (e of examples; track e.name; let i = $index) {
          <button class="et" [class.active]="sel() === i" (click)="sel.set(i)">{{ e.name }}</button>
        }
      </div>

      <div class="surface-wrap" #wrap>
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

      <div class="scan-grid">
        <div class="scan-plot">
          <svg viewBox="-130 -130 260 260" class="scan-svg">
            <circle cx="0" cy="0" r="56" fill="none" stroke="var(--border-strong)" stroke-width="1.2" />

            @for (sample of samples(); track sample.theta) {
              <circle [attr.cx]="sample.x" [attr.cy]="sample.y" r="4.6" [attr.fill]="sample.color" stroke="white" stroke-width="1.1" />
            }

            <line x1="0" y1="0" [attr.x2]="rayX()" [attr.y2]="rayY()" stroke="var(--accent)" stroke-width="2.6" marker-end="url(#tip-pd)" />
            <circle [attr.cx]="rayX()" [attr.cy]="rayY()" r="5.2" fill="var(--accent)" />

            <defs>
              <marker id="tip-pd" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0,6 2,0 4" fill="var(--accent)" />
              </marker>
            </defs>
          </svg>
        </div>

        <div class="scan-side">
          <div class="angle-row">
            <span class="angle-lab">方向 θ</span>
            <input type="range" min="0" max="360" step="1" [value]="theta()" (input)="theta.set(+$any($event).target.value)" />
            <span class="angle-val">{{ theta() }}°</span>
          </div>

          <div class="status" [class.good]="current().verdict === 'positive definite'" [class.warn]="current().verdict === 'positive semidefinite'" [class.bad]="current().verdict === 'indefinite'">
            <strong>{{ current().name }}</strong>：
            {{ current().desc }}
          </div>

          <div class="mini-note">
            單位圓掃過所有方向時，最小值其實就是最小特徵值的幾何影子。
          </div>
        </div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">A</span>
          <span class="iv">[[{{ a().toFixed(1) }}, {{ b().toFixed(1) }}], [{{ b().toFixed(1) }}, {{ d().toFixed(1) }}]]</span>
        </div>
        <div class="info-row">
          <span class="il">探針高度</span>
          <span class="iv">{{ qProbe().toFixed(2) }} at ({{ probeX().toFixed(1) }}, {{ probeY().toFixed(1) }})</span>
        </div>
        <div class="info-row">
          <span class="il">方向值</span>
          <span class="iv">uᵀAu = {{ qDirection().toFixed(2) }}</span>
        </div>
        <div class="info-row big">
          <span class="il">特徵值</span>
          <span class="iv">λ₁ = <strong>{{ lambda1().toFixed(2) }}</strong>，λ₂ = <strong>{{ lambda2().toFixed(2) }}</strong></span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block title="從特徵值來看，為什麼正定這麼透明？">
      <p>
        因為對稱矩陣可以正交對角化，所以任何向量都能寫成
      </p>
      <p class="formula">x = c₁v₁ + c₂v₂</p>
      <p>
        然後二次型會直接變成
      </p>
      <p class="formula">xᵀAx = λ₁c₁² + λ₂c₂²</p>
      <p>
        這個公式威力很大，因為平方永遠不會是負的。於是
        <strong>正負號全部交給特徵值決定</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="把 x 展開在特徵向量基底下，直接看 λ₁c₁² 與 λ₂c₂² 怎麼決定結果">
      <div class="eig-layout">
        <div class="eig-plot">
          <svg viewBox="-130 -130 260 260" class="scan-svg">
            <line [attr.x1]="-eig1Px()" [attr.y1]="eig1Py()" [attr.x2]="eig1Px()" [attr.y2]="-eig1Py()" stroke="#5a8a5a" stroke-width="2.1" stroke-dasharray="4 4" />
            <line [attr.x1]="-eig2Px()" [attr.y1]="eig2Py()" [attr.x2]="eig2Px()" [attr.y2]="-eig2Py()" stroke="#8a6b5a" stroke-width="2.1" stroke-dasharray="4 4" />

            <line x1="0" y1="0" [attr.x2]="comp1X()" [attr.y2]="comp1Y()" stroke="#5a8a5a" stroke-width="2.4" />
            <line [attr.x1]="comp1X()" [attr.y1]="comp1Y()" [attr.x2]="xPx()" [attr.y2]="xPy()" stroke="#8a6b5a" stroke-width="2.4" />
            <line x1="0" y1="0" [attr.x2]="xPx()" [attr.y2]="xPy()" stroke="var(--accent)" stroke-width="3.1" />

            <text [attr.x]="eig1Px() + 6" [attr.y]="-eig1Py() - 6" class="plot-lab" fill="#5a8a5a">v₁</text>
            <text [attr.x]="eig2Px() + 6" [attr.y]="-eig2Py() - 6" class="plot-lab" fill="#8a6b5a">v₂</text>
            <text [attr.x]="xPx() + 8" [attr.y]="xPy() - 8" class="plot-lab" fill="var(--accent)">x</text>
          </svg>
        </div>

        <div class="eig-side">
          <div class="sliders">
            <div class="sl">
              <span class="sl-lab eig1">c₁</span>
              <input type="range" min="-2" max="2" step="0.1" [value]="c1()" (input)="c1.set(+$any($event).target.value)" />
              <span class="sl-val">{{ c1().toFixed(1) }}</span>
            </div>
            <div class="sl">
              <span class="sl-lab eig2">c₂</span>
              <input type="range" min="-2" max="2" step="0.1" [value]="c2()" (input)="c2.set(+$any($event).target.value)" />
              <span class="sl-val">{{ c2().toFixed(1) }}</span>
            </div>
          </div>

          <div class="term-box pos">
            λ₁c₁² = {{ lambda1().toFixed(2) }} × {{ (c1() * c1()).toFixed(2) }} = <strong>{{ term1().toFixed(2) }}</strong>
          </div>
          <div class="term-box" [class.neg]="term2() < -0.05" [class.zero]="Math.abs(term2()) <= 0.05">
            λ₂c₂² = {{ lambda2().toFixed(2) }} × {{ (c2() * c2()).toFixed(2) }} = <strong>{{ term2().toFixed(2) }}</strong>
          </div>
          <div class="term-box total">
            xᵀAx = λ₁c₁² + λ₂c₂² = <strong>{{ qFromEigen().toFixed(2) }}</strong>
          </div>
        </div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">分解</span>
          <span class="iv">x = {{ c1().toFixed(1) }}v₁ + {{ c2().toFixed(1) }}v₂</span>
        </div>
        <div class="info-row">
          <span class="il">v₁, v₂</span>
          <span class="iv">({{ v1()[0].toFixed(2) }}, {{ v1()[1].toFixed(2) }})，({{ v2()[0].toFixed(2) }}, {{ v2()[1].toFixed(2) }})</span>
        </div>
        <div class="info-row big">
          <span class="il">重點</span>
          <span class="iv">{{ verdictMessage() }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block title="為什麼正定很重要？">
      <p>
        <strong>1. 最小化問題：</strong>
        如果某個函數的 Hessian 是正定的，代表那個點附近像穩定碗面，對應嚴格局部最低點。
      </p>
      <p>
        <strong>2. 幾何與統計：</strong>
        正定矩陣會定義橢圓、橢球與 Mahalanobis 距離；covariance matrix 和 Gram matrix 至少是半正定。
      </p>
      <p>
        <strong>3. 數值計算：</strong>
        對稱正定系統通常最好解，會有唯一解，也能使用 Cholesky 這類特別穩定的演算法。
      </p>
      <span class="hint">
        所以「正定」不是一個抽象標籤，而是在告訴你：這個二次型代表穩定能量、乾淨幾何，和好處理的線性系統。
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; padding: 10px 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0; }
    .ex-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .et { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer; }
    .et:hover { background: var(--accent-10); }
    .et.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; }
    .surface-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--bg); margin-bottom: 12px; }
    .surface-wrap canvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }
    .ctrl-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; }
    .ctrl-btn:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
    .ctrl-btn.active { background: var(--accent-18); color: var(--accent); border-color: var(--accent); }
    .probe-grid, .sliders { display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .probe-row, .sl { display: grid; grid-template-columns: 22px 1fr 40px; gap: 10px; align-items: center; }
    .lab, .angle-lab { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .probe-row input, .angle-row input, .sl input { accent-color: var(--accent); }
    .val, .angle-val, .sl-val { font-size: 12px; text-align: right; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .scan-grid, .eig-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .scan-plot, .eig-plot { border: 1px solid var(--border); border-radius: 10px; background: var(--bg); padding: 10px; }
    .scan-svg { width: 100%; height: auto; }
    .scan-side, .eig-side { display: flex; flex-direction: column; gap: 10px; }
    .angle-row { display: grid; grid-template-columns: 72px 1fr 44px; gap: 10px; align-items: center; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .status, .mini-note, .term-box { padding: 12px 14px; border-radius: 8px; font-size: 13px; color: var(--text-secondary); }
    .status { background: rgba(191, 158, 147, 0.08); border: 1px solid rgba(191, 158, 147, 0.25); }
    .status.good { background: rgba(90, 138, 90, 0.08); border-color: rgba(90, 138, 90, 0.25); }
    .status.warn { background: rgba(196, 160, 80, 0.10); border-color: rgba(196, 160, 80, 0.25); }
    .status.bad { background: rgba(160, 90, 90, 0.08); border-color: rgba(160, 90, 90, 0.25); }
    .mini-note { background: var(--bg-surface); border: 1px dashed var(--border); }
    .plot-lab { font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .sl-lab { font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
    .sl-lab.eig1 { color: #5a8a5a; background: rgba(90, 138, 90, 0.12); }
    .sl-lab.eig2 { color: #8a6b5a; background: rgba(191, 158, 147, 0.12); }
    .term-box { border: 1px solid var(--border); background: var(--bg-surface); }
    .term-box.pos { background: rgba(90, 138, 90, 0.08); border-color: rgba(90, 138, 90, 0.25); }
    .term-box.neg { background: rgba(160, 90, 90, 0.08); border-color: rgba(160, 90, 90, 0.25); }
    .term-box.zero { background: rgba(196, 160, 80, 0.10); border-color: rgba(196, 160, 80, 0.25); }
    .term-box.total { background: var(--accent-10); }
    .term-box strong { color: var(--text); font-size: 15px; font-family: 'JetBrains Mono', monospace; }
    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .info-row { display: grid; grid-template-columns: 88px 1fr; border-bottom: 1px solid var(--border); }
    .info-row:last-child { border-bottom: none; }
    .info-row.big { background: var(--accent-10); }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface); border-right: 1px solid var(--border); }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 16px; }
    @media (max-width: 640px) { .scan-grid, .eig-layout { grid-template-columns: 1fr; } }
  `,
})
export class StepPositiveDefiniteComponent implements AfterViewInit, OnDestroy {
  readonly Math = Math;
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly autoRotate = signal(false);
  readonly probeX = signal(0.9);
  readonly probeY = signal(0.7);
  readonly theta = signal(35);
  readonly c1 = signal(1.0);
  readonly c2 = signal(0.7);

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
  readonly eig = computed(() => eigenData(this.current().A));
  readonly lambda1 = computed(() => this.eig().values[0]);
  readonly lambda2 = computed(() => this.eig().values[1]);
  readonly v1 = computed(() => this.eig().vectors[0]);
  readonly v2 = computed(() => this.eig().vectors[1]);
  readonly a = computed(() => this.current().A[0][0]);
  readonly b = computed(() => this.current().A[0][1]);
  readonly d = computed(() => this.current().A[1][1]);

  readonly qProbe = computed(() =>
    quadratic(this.current().A, this.probeX(), this.probeY()),
  );
  readonly ux = computed(() => Math.cos((this.theta() * Math.PI) / 180));
  readonly uy = computed(() => Math.sin((this.theta() * Math.PI) / 180));
  readonly rayX = computed(() => this.ux() * 56);
  readonly rayY = computed(() => -this.uy() * 56);
  readonly qDirection = computed(() =>
    quadratic(this.current().A, this.ux(), this.uy()),
  );

  readonly samples = computed(() =>
    Array.from({ length: 36 }, (_, i) => {
      const theta = i * 10;
      const rad = (theta * Math.PI) / 180;
      const ux = Math.cos(rad);
      const uy = Math.sin(rad);
      return {
        theta,
        x: ux * 80,
        y: -uy * 80,
        color: this.colorFor(quadratic(this.current().A, ux, uy)),
      };
    }),
  );

  readonly term1 = computed(() => this.lambda1() * this.c1() * this.c1());
  readonly term2 = computed(() => this.lambda2() * this.c2() * this.c2());
  readonly qFromEigen = computed(() => this.term1() + this.term2());
  readonly xVec = computed<V2>(() => [
    this.c1() * this.v1()[0] + this.c2() * this.v2()[0],
    this.c1() * this.v1()[1] + this.c2() * this.v2()[1],
  ]);
  readonly eig1Px = computed(() => this.v1()[0] * 90);
  readonly eig1Py = computed(() => this.v1()[1] * 90);
  readonly eig2Px = computed(() => this.v2()[0] * 90);
  readonly eig2Py = computed(() => this.v2()[1] * 90);
  readonly comp1X = computed(() => this.c1() * this.v1()[0] * 45);
  readonly comp1Y = computed(() => -this.c1() * this.v1()[1] * 45);
  readonly xPx = computed(() => this.xVec()[0] * 45);
  readonly xPy = computed(() => -this.xVec()[1] * 45);

  readonly verdictMessage = computed(() => {
    switch (this.current().verdict) {
      case 'positive definite':
        return '兩個特徵值都正，所以除了 x = 0 之外，xᵀAx 一定大於 0。';
      case 'positive semidefinite':
        return '第二個特徵值等於 0，所以沿著那條特徵方向移動時，xᵀAx 可能剛好等於 0。';
      default:
        return '一個特徵值正、一個負，所以正負兩種方向會互相競爭，xᵀAx 可以變成負。';
    }
  });

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
    this.camera.position.set(4.8, 3.8, 4.8);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
  }

  toggleAuto(): void {
    this.autoRotate.update((v) => !v);
  }

  private colorFor(value: number): string {
    if (value > 0.15) return '#5a8a5a';
    if (value < -0.15) return '#a05a5a';
    return '#c4a050';
  }

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const wrap = this.wrapRef()?.nativeElement;
    if (!canvas || !wrap) return;

    this.scene = new Scene();
    this.scene.background = null;

    this.camera = new PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(4.8, 3.8, 4.8);
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
      pos.setY(i, quadratic(example.A, x, z) * 0.35);
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
    const y = this.qProbe() * 0.35;

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
