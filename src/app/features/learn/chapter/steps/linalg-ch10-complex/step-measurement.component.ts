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
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface BasisInfo {
  name: string;
  axis: [number, number, number]; // The axis the basis is along
  upLabel: string;
  downLabel: string;
}

const BASES: BasisInfo[] = [
  { name: 'Z (\u6A19\u6E96)', axis: [0, 0, 1], upLabel: '|0\u27E9', downLabel: '|1\u27E9' },
  { name: 'X', axis: [1, 0, 0], upLabel: '|+\u27E9', downLabel: '|\u2212\u27E9' },
  { name: 'Y', axis: [0, 1, 0], upLabel: '|+i\u27E9', downLabel: '|\u2212i\u27E9' },
];

@Component({
  selector: 'app-step-measurement',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u91CF\u5B50\u6E2C\u91CF" subtitle="\u00A710.8">
      <p>
        \u91CF\u5B50\u6E2C\u91CF\u662F\u91CF\u5B50\u529B\u5B78\u88E1\u6700\u5947\u602A\u7684\u90E8\u5206\u3002\u4ED6\u8DDF\u53E4\u5178\u6E2C\u91CF\u4E0D\u4E00\u6A23\u3002
      </p>
      <p>
        \u53E4\u5178\u6E2C\u91CF\uFF1A\u4F60\u300C\u8B80\u5230\u300D\u6BD4\u8F03\u672C\u8EAB\u672C\u4F86\u5C31\u6709\u7684\u8CC7\u8A0A\u3002
      </p>
      <p>
        \u91CF\u5B50\u6E2C\u91CF\uFF1A\u4F60\u300C\u9078\u500B\u88FD\u9020\u300D\u4E00\u500B\u53EF\u6E2C\u91CF\u91CF\u8DDF\u4ED6\u4E92\u52D5\u3002\u672A\u88AB\u6E2C\u91CF\u4E4B\u524D\uFF0C\u72C0\u614B\u662F\u4E00\u500B\u8907\u632F\u5E45\u7684\u91CD\u758A\uFF1B
        \u88AB\u6E2C\u91CF\u4E4B\u5F8C\uFF0C\u72C0\u614B<strong>\u5D29\u8E0B\u300C\u9078\u4E00\u500B\u300D</strong>\u53EF\u80FD\u7684\u7D50\u679C\u3002
      </p>
      <p>
        \u4E78\u300CBorn \u898F\u5247\u300D\u3002\u8A2D A \u662F\u4E00\u500B Hermitian \u53EF\u89C0\u6E2C\u91CF\uFF0C\u4E26\u8A2D A \u7684\u7279\u5FB5\u5411\u91CF\u662F |v\u1D62\u27E9\uFF0C\u7279\u5FB5\u503C \u03BB\u1D62\u3002\u90A3\u9EBC\uFF1A
      </p>
      <p class="formula">\u6E2C\u91CF\u72C0\u614B |\u03C8\u27E9 \u5F97\u5230 \u03BB\u1D62 \u7684\u6A5F\u7387 = |\u27E8v\u1D62|\u03C8\u27E9|\u00B2</p>
      <p>
        \u9019\u53EB\u300C\u91CD\u758A\u632F\u5E45\u7684\u5E73\u65B9\u300D\u3002\u6CE8\u610F\u4ED6\u8B93\u300C\u8907\u6578\u53D8\u70BA\u300C\u5BE6\u6A5F\u7387\u300D\u3002
      </p>
      <p>
        \u6E2C\u91CF\u4E4B\u5F8C\u72C0\u614B\u88AB<strong>\u6295\u5F71</strong>\u5230 |v\u1D62\u27E9 \u4E26\u91CD\u65B0\u6B78\u4E00\u5316 \u2014 \u9019\u662F\u300C\u5D29\u6E83\u300D\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E00\u500B\u72C0\u614B\u3001\u9078\u4E00\u500B\u6E2C\u91CF\u57FA\u5E95\uFF0C\u770B\u6A5F\u7387\u8DDF\u5D29\u6E83">
      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <span class="lab">\u521D\u59CB\u72C0\u614B\uFF1A</span>
        <button class="preset-btn" (click)="setState(0, 0)">|0\u27E9</button>
        <button class="preset-btn" (click)="setState(60, 30)">\u4EFB\u610F</button>
        <button class="preset-btn" (click)="setState(90, 45)">|+\u27E9 \u9644\u8FD1</button>
        <button class="preset-btn" (click)="setState(120, 90)">|+i\u27E9 \u9644\u8FD1</button>
      </div>

      <div class="basis-row">
        <span class="lab">\u9078\u6E2C\u91CF\u57FA\u5E95\uFF1A</span>
        @for (b of bases; track b.name; let i = $index) {
          <button class="basis-btn" [class.active]="basisIdx() === i" (click)="basisIdx.set(i)">{{ b.name }}</button>
        }
      </div>

      <div class="prob-display">
        <div class="prob-row">
          <span class="prob-lab">{{ currentBasis().upLabel }}</span>
          <div class="prob-bar-track">
            <div class="prob-bar up" [style.width.%]="probUp() * 100"></div>
          </div>
          <span class="prob-val">{{ (probUp() * 100).toFixed(1) }}%</span>
        </div>
        <div class="prob-row">
          <span class="prob-lab">{{ currentBasis().downLabel }}</span>
          <div class="prob-bar-track">
            <div class="prob-bar down" [style.width.%]="probDown() * 100"></div>
          </div>
          <span class="prob-val">{{ (probDown() * 100).toFixed(1) }}%</span>
        </div>
      </div>

      <div class="measure-row">
        <button class="meas-btn" (click)="measure()">\u6E2C\u91CF\uFF01</button>
        @if (lastResult()) {
          <div class="result">\u7D50\u679C\uFF1A<strong>{{ lastResult() }}</strong></div>
        }
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">\u72C0\u614B\u9EDE</span>
          <span class="iv">({{ statePt()[0].toFixed(2) }}, {{ statePt()[1].toFixed(2) }}, {{ statePt()[2].toFixed(2) }})</span>
        </div>
        <div class="info-row">
          <span class="il">\u6E2C\u91CF\u8EF8</span>
          <span class="iv">{{ currentBasis().name }}</span>
        </div>
        <div class="info-row big">
          <span class="il">\u8AAA\u660E</span>
          <span class="iv plain">
            \u72C0\u614B\u8DDF\u6E2C\u91CF\u8EF8\u7684<strong>\u9EDE\u7A4D = cos\u03B8</strong>\u3002
            \u4E0A\u9EDE\u6A5F\u7387 = (1+cos\u03B8)/2\u3001\u4E0B\u9EDE\u6A5F\u7387 = (1\u2212cos\u03B8)/2\u3002
          </span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block title="\u672C\u7AE0\u7E3D\u7D50">
      <p>
        \u606D\u559C\u4F60\uFF0C\u4F60\u770B\u5230\u4E86\u7DDA\u6027\u4EE3\u6578\u8DDF\u91CF\u5B50\u529B\u5B78\u7684\u63A5\u8ED2\u3002\u91CF\u5B50\u529B\u5B78\u4E0D\u662F\u300C\u570B\u9678\u8C50\u5BCC\u7684\u7269\u7406\u300D\u2014\u4ED6\u662F\u8907\u5411\u91CF\u3001Hermitian \u77E9\u9663\u3001\u4EE5\u53CA Unitary \u6F14\u5316\u7684\u6578\u5B78\u3002
      </p>
      <ul>
        <li><strong>\u72C0\u614B</strong> = \u8907\u5411\u91CF |\u03C8\u27E9</li>
        <li><strong>\u53EF\u89C0\u6E2C\u91CF</strong> = Hermitian \u77E9\u9663\uFF08\u8B57\u4F60\u5BE6\u7279\u5FB5\u503C\uFF09</li>
        <li><strong>\u6642\u9593\u6F14\u5316</strong> = Unitary \u77E9\u9663\uFF08\u4FDD\u6301\u6A5F\u7387\u7E3D\u548C\uFF09</li>
        <li><strong>\u6E2C\u91CF</strong> = \u6295\u5F71\u5230\u7279\u5FB5\u5411\u91CF\uFF08Born \u898F\u5247\u7D66\u4F60\u6A5F\u7387\uFF09</li>
        <li><strong>\u91CF\u5B50\u4F4D\u5143</strong> = 2\u00D72 \u7684\u72C0\u614B\u3001Bloch \u7403\u9762\u4E0A\u4E00\u500B\u9EDE</li>
        <li><strong>\u91CF\u5B50\u9598</strong> = Bloch \u7403\u9762\u4E0A\u7684\u65CB\u8F49</li>
      </ul>
      <p>
        \u4E0B\u4E00\u7AE0\uFF0C\u6211\u5011\u8D77\u88FD\u53E6\u4E00\u500B\u62BD\u8C61\u8DF3\u8E8D\uFF1A\u300C<strong>\u51FD\u6578\u4E5F\u662F\u5411\u91CF</strong>\u300D\u3002\u9019\u500B\u660E\u986F\u8B93\u4F60\u80FD\u770B\u5230\u300C\u5411\u91CF\u300D\u9019\u500B\u6982\u5FF5\u591A\u9EBC\u8C50\u5BCC\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }

    .ctrl-row, .basis-row { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .lab { font-size: 12px; color: var(--text-muted); margin-right: 6px; }
    .preset-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; font-family: 'Noto Sans Math', serif;
      cursor: pointer;
      &:hover { background: var(--accent-10); } }
    .basis-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); font-weight: 600; } }

    .prob-display { padding: 14px 18px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px; }
    .prob-row { display: flex; align-items: center; gap: 10px; }
    .prob-lab { font-size: 14px; font-weight: 700; min-width: 50px; font-family: 'Noto Sans Math', serif;
      color: var(--text); }
    .prob-bar-track { flex: 1; height: 22px; background: var(--bg); border-radius: 4px; overflow: hidden;
      border: 1px solid var(--border); }
    .prob-bar { height: 100%; transition: width 0.4s ease;
      &.up { background: linear-gradient(90deg, var(--accent), #c8983b); }
      &.down { background: linear-gradient(90deg, #6e8aa8, #a05a8a); } }
    .prob-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      min-width: 56px; text-align: right; }

    .measure-row { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
    .meas-btn { padding: 8px 24px; border: 2px solid var(--accent); border-radius: 8px;
      background: var(--accent-18); color: var(--accent); font-size: 14px; font-weight: 700; cursor: pointer;
      &:hover { background: var(--accent); color: white; } }
    .result { font-size: 14px; color: var(--text-secondary);
      strong { color: var(--accent); font-size: 16px; font-family: 'Noto Sans Math', serif; } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      &.plain { font-family: inherit; line-height: 1.6; } }
    .iv strong { color: var(--accent); }
  `,
})
export class StepMeasurementComponent implements AfterViewInit, OnDestroy {
  readonly bases = BASES;
  readonly basisIdx = signal(0);
  readonly statePt = signal<[number, number, number]>([0.5, 0.3, 0.812]);
  readonly lastResult = signal<string | null>(null);

  readonly currentBasis = computed(() => this.bases[this.basisIdx()]);

  // Probability of "up" (eigenvalue +1) basis state.
  // For Bloch state with vector r and basis along axis n:
  //   prob_up = (1 + n·r) / 2
  readonly probUp = computed(() => {
    const r = this.statePt();
    const n = this.currentBasis().axis;
    const dot = n[0] * r[0] + n[1] * r[1] + n[2] * r[2];
    return (1 + dot) / 2;
  });
  readonly probDown = computed(() => 1 - this.probUp());

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');

  private renderer!: WebGLRenderer;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private controls!: OrbitControls;
  private animationId = 0;
  private resizeObserver?: ResizeObserver;
  private stateArrow!: ArrowHelper;
  private stateDot!: Mesh;
  private basisHighlight!: Mesh;

  constructor() {
    effect(() => {
      const pt = this.statePt();
      if (this.stateArrow) {
        const v = new Vector3(pt[0], pt[1], pt[2]);
        this.stateArrow.setDirection(v.clone().normalize());
        this.stateArrow.setLength(v.length(), 0.12, 0.08);
        this.stateDot.position.copy(v);
      }
    });
    effect(() => {
      const b = this.currentBasis();
      if (this.basisHighlight) {
        const dir = new Vector3(b.axis[0], b.axis[1], b.axis[2]);
        const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir);
        this.basisHighlight.quaternion.copy(q);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
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

  setState(thetaDeg: number, phiDeg: number): void {
    const theta = (thetaDeg * Math.PI) / 180;
    const phi = (phiDeg * Math.PI) / 180;
    this.statePt.set([
      Math.sin(theta) * Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
      Math.cos(theta),
    ]);
    this.lastResult.set(null);
  }

  measure(): void {
    const p = this.probUp();
    const isUp = Math.random() < p;
    const b = this.currentBasis();
    if (isUp) {
      this.statePt.set([b.axis[0], b.axis[1], b.axis[2]]);
      this.lastResult.set(b.upLabel);
    } else {
      this.statePt.set([-b.axis[0], -b.axis[1], -b.axis[2]]);
      this.lastResult.set(b.downLabel);
    }
  }

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const wrap = this.wrapRef()?.nativeElement;
    if (!canvas || !wrap) return;

    this.scene = new Scene();
    this.scene.background = null;
    this.camera = new PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(2.4, 1.8, 2.4);
    this.camera.lookAt(0, 0, 0);
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resizeRenderer();

    this.scene.add(new AmbientLight(0xffffff, 1.0));
    const dl = new DirectionalLight(0xffffff, 1.4);
    dl.position.set(5, 8, 5);
    this.scene.add(dl);

    const sphereGeo = new SphereGeometry(1, 32, 24);
    this.scene.add(new Mesh(sphereGeo, new MeshStandardMaterial({
      color: 0xa8b8c8, transparent: true, opacity: 0.12, side: DoubleSide,
    })));
    this.scene.add(new Mesh(sphereGeo, new MeshBasicMaterial({
      color: 0xa8b8c8, wireframe: true, transparent: true, opacity: 0.3,
    })));

    // Faint axes
    const axColors = [0xbf6e6e, 0x6e9a6e, 0x6e8aa8];
    const axDirs = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
    for (let i = 0; i < 3; i++) {
      const cyl = new Mesh(
        new CylinderGeometry(0.008, 0.008, 2.4, 8),
        new MeshBasicMaterial({ color: axColors[i], transparent: true, opacity: 0.4 }),
      );
      cyl.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), axDirs[i]));
      this.scene.add(cyl);
    }

    // Highlighted measurement basis (a thicker cylinder along the basis axis)
    this.basisHighlight = new Mesh(
      new CylinderGeometry(0.025, 0.025, 2.6, 12),
      new MeshStandardMaterial({ color: 0xc8983b, transparent: true, opacity: 0.7 }),
    );
    this.scene.add(this.basisHighlight);

    // State vector arrow
    this.stateArrow = new ArrowHelper(
      new Vector3(0, 0, 1), new Vector3(0, 0, 0), 1, 0xc8983b, 0.12, 0.08,
    );
    this.scene.add(this.stateArrow);
    this.stateDot = new Mesh(
      new SphereGeometry(0.06, 16, 12),
      new MeshStandardMaterial({ color: 0xc8983b }),
    );
    this.scene.add(this.stateDot);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.6;
    this.controls.maxDistance = 6;
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

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };
}

