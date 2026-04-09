import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
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

interface GateInfo {
  name: string;
  desc: string;
  axis: [number, number, number];
  angleDeg: number;
}

const GATES: GateInfo[] = [
  { name: 'X', desc: 'Pauli X (NOT)\uFF1A\u7E5E x \u8EF8\u8F49 180\u00B0', axis: [1, 0, 0], angleDeg: 180 },
  { name: 'Y', desc: 'Pauli Y\uFF1A\u7E5E y \u8EF8\u8F49 180\u00B0', axis: [0, 1, 0], angleDeg: 180 },
  { name: 'Z', desc: 'Pauli Z\uFF1A\u7E5E z \u8EF8\u8F49 180\u00B0', axis: [0, 0, 1], angleDeg: 180 },
  { name: 'H', desc: 'Hadamard\uFF1A\u7E5E (x+z)/\u221A2 \u8EF8\u8F49 180\u00B0', axis: [1 / Math.sqrt(2), 0, 1 / Math.sqrt(2)], angleDeg: 180 },
  { name: 'S', desc: 'S \u9598\uFF1A\u7E5E z \u8EF8\u8F49 90\u00B0', axis: [0, 0, 1], angleDeg: 90 },
  { name: 'T', desc: 'T \u9598\uFF1A\u7E5E z \u8EF8\u8F49 45\u00B0', axis: [0, 0, 1], angleDeg: 45 },
];

@Component({
  selector: 'app-step-quantum-gates',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u91CF\u5B50\u9598 = Bloch \u4E0A\u7684\u65CB\u8F49" subtitle="\u00A710.7">
      <p>
        \u4E00\u500B\u91CF\u5B50\u9598\u662F\u4E00\u500B 2\u00D72 Unitary \u77E9\u9663 \u2014 \u5C0D\u91CF\u5B50\u4F4D\u5143\u72C0\u614B\u7684\u4E00\u500B\u8B8A\u63DB\u3002
      </p>
      <p>
        \u91CD\u8981\u4E8B\u5BE6\uFF1A<strong>\u5728 Bloch \u7403\u9762\u4E0A\u770B\uFF0C\u91CF\u5B50\u9598\u5C31\u662F\u7403\u9762\u7684\u4E00\u500B\u65CB\u8F49</strong>\u3002
      </p>
      <p>
        \u4E00\u822C\u516C\u5F0F\uFF1A\u4EFB\u4F55\u91CF\u5B50\u9598\u90FD\u53EF\u4EE5\u5BEB\u6210
      </p>
      <p class="formula">U = e^(\u2212i\u03B8/2 \u00B7 (n\u2093\u03C3\u2093 + n\u1D67\u03C3\u1D67 + n_z\u03C3z))</p>
      <p>
        \u9019\u4EE3\u8868\u300C\u7E5E n = (n\u2093, n\u1D67, n_z) \u8EF8\u8F49 \u03B8 \u5EA6\u300D\u3002\u4F60\u53EF\u4EE5\u770B\u5230 Pauli \u77E9\u9663\u51FA\u73FE\u5728\u9019\u500B\u516C\u5F0F\u88E1 \u2014 \u4ED6\u5011\u662F\u300C\u65CB\u8F49\u8EF8\u300D\u7684\u751F\u6210\u5143\u3002
      </p>
      <p>
        \u4E0B\u9762\u662F\u5E7E\u500B\u91CD\u8981\u7684\u91CF\u5B50\u9598\uFF0C\u9EDE\u4ED6\u5011\u770B\u72C0\u614B\u600E\u9EBC\u88AB\u8F49\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E00\u500B\u521D\u59CB\u72C0\u614B\uFF0C\u7136\u5F8C\u6309\u9598\u770B Bloch \u4E0A\u7684\u72C0\u614B\u600E\u9EBC\u8F49">
      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <span class="lab">\u91CD\u7F6E\u70BA\uFF1A</span>
        <button class="preset-btn" (click)="resetState(0, 0)">|0\u27E9</button>
        <button class="preset-btn" (click)="resetState(180, 0)">|1\u27E9</button>
        <button class="preset-btn" (click)="resetState(90, 0)">|+\u27E9</button>
        <button class="preset-btn" (click)="resetState(90, 90)">|+i\u27E9</button>
      </div>

      <div class="gate-row">
        <span class="lab">\u5957\u7528\u9598\uFF1A</span>
        @for (g of gates; track g.name) {
          <button class="gate-btn" [disabled]="animating()" (click)="applyGate(g)">{{ g.name }}</button>
        }
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">\u4E0A\u4E00\u500B\u9598</span>
          <span class="iv plain">{{ lastGateName() ? gateDescOf(lastGateName()!) : '\u7121' }}</span>
        </div>
        <div class="info-row">
          <span class="il">\u72C0\u614B\u9EDE</span>
          <span class="iv">({{ statePoint()[0].toFixed(2) }}, {{ statePoint()[1].toFixed(2) }}, {{ statePoint()[2].toFixed(2) }})</span>
        </div>
      </div>

      <div class="hint-box">
        \u8A66\u8A66\u9019\uFF1A
        <ul>
          <li>\u5F9E |0\u27E9 \u958B\u59CB\uFF0C\u6309 X\uFF1A\u72C0\u614B\u8DD1\u5230 |1\u27E9</li>
          <li>\u518D\u6309 Z\uFF1A\u4ED6\u4ECD\u5728 |1\u27E9\uFF08Z \u4E0D\u6539\u8B8A z \u8EF8\u4E0A\u7684\u9EDE\uFF09</li>
          <li>\u5F9E |0\u27E9 \u958B\u59CB\uFF0C\u6309 H\uFF1A\u72C0\u614B\u8DD1\u5230 |+\u27E9</li>
          <li>\u518D\u6309 H\uFF1A\u4ED6\u8DD1\u56DE |0\u27E9 (H\u00B2 = I)</li>
          <li>\u9023\u7E8C\u6309 4 \u6B21 S\uFF1A\u4ED6\u56DE\u5230\u539F\u9EDE (S\u2074 = I)</li>
        </ul>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u4F60\u770B\u5230\u4E86\u91CF\u5B50\u8A08\u7B97\u7684\u300C\u610F\u8C61\u300D\uFF1A\u91CF\u5B50\u8A08\u7B97 = \u5728 Bloch \u7403\u9762\u4E0A\u9032\u884C\u4E00\u9023\u4E32\u7684\u65CB\u8F49\u3002
        \u8907\u96DC\u7684\u8A08\u7B97 = \u8907\u96DC\u7684\u65CB\u8F49\u5E8F\u5217\u3002
      </p>
      <p>
        \u4F46\u9019\u4E2D\u9593\u6709\u4E00\u500B\u8B8A\u91CF\u90A3\u500B\u4F60\u9084\u6C92\u770B\u5230\u7684\u95DC\u9375\u90E8\u5206\uFF1A<strong>\u6E2C\u91CF</strong>\u3002
      </p>
      <p>
        \u91CF\u5B50\u8A08\u7B97\u7684\u7D50\u5C3E\u5FC5\u9808\u6E2C\u91CF\uFF0C\u624D\u80FD\u7372\u5F97\u53E4\u5178\u7684\u8A08\u7B97\u7D50\u679C\u3002\u4F46\u6E2C\u91CF\u4F1A<strong>\u5D29\u6E83</strong>\u91CF\u5B50\u614B \u2014
        Bloch \u4E0A\u7684\u300C\u9023\u7E8C\u9EDE\u300D\u7A81\u7136\u5D29\u8E0B\u6210\u300C\u96E2\u6563\u7D50\u679C\u300D\u3002
      </p>
      <p>\u4E0B\u4E00\u7Bc0\u770B\u9019\u500B\u300C\u5D29\u8E0B\u300D\u600E\u9EBC\u767C\u751F\u3002</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }

    .ctrl-row, .gate-row { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .lab { font-size: 12px; color: var(--text-muted); margin-right: 6px; }
    .preset-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; font-family: 'Noto Sans Math', serif;
      cursor: pointer;
      &:hover { background: var(--accent-10); } }
    .gate-btn { padding: 8px 16px; border: 1px solid var(--accent-30); border-radius: 6px;
      background: var(--accent-10); color: var(--accent); font-size: 14px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; cursor: pointer; min-width: 40px;
      &:hover:not(:disabled) { background: var(--accent-18); }
      &:disabled { opacity: 0.5; cursor: default; } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .info-row { display: grid; grid-template-columns: 90px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      &.plain { font-family: inherit; } }

    .hint-box { padding: 12px 16px; border-radius: 8px; background: var(--accent-10);
      font-size: 12px; color: var(--text-secondary); line-height: 1.7;
      ul { margin: 6px 0; padding-left: 20px; } }
  `,
})
export class StepQuantumGatesComponent implements AfterViewInit, OnDestroy {
  readonly gates = GATES;
  readonly animating = signal(false);
  readonly lastGateName = signal<string | null>(null);
  readonly statePoint = signal<[number, number, number]>([0, 0, 1]);

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

  // Animation state
  private animFromQ = new Quaternion();
  private animToQ = new Quaternion();
  private animStartTime = 0;
  private animDuration = 800;
  private currentQ = new Quaternion();

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
    const dl2 = new DirectionalLight(0xffffff, 0.5);
    dl2.position.set(-5, -3, -5);
    this.scene.add(dl2);

    // Sphere
    const sphereGeo = new SphereGeometry(1, 32, 24);
    this.scene.add(new Mesh(sphereGeo, new MeshStandardMaterial({
      color: 0xa8b8c8, transparent: true, opacity: 0.12, side: DoubleSide,
    })));
    this.scene.add(new Mesh(sphereGeo, new MeshBasicMaterial({
      color: 0xa8b8c8, wireframe: true, transparent: true, opacity: 0.3,
    })));

    // Axes through sphere
    const axColors = [0xbf6e6e, 0x6e9a6e, 0x6e8aa8];
    const axDirs = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
    for (let i = 0; i < 3; i++) {
      const cyl = new Mesh(
        new CylinderGeometry(0.01, 0.01, 2.4, 8),
        new MeshBasicMaterial({ color: axColors[i], transparent: true, opacity: 0.55 }),
      );
      cyl.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), axDirs[i]));
      this.scene.add(cyl);
    }

    // Cardinal points
    const cardinalGeo = new SphereGeometry(0.04, 12, 8);
    [
      [0, 0, 1, 0xffffff], [0, 0, -1, 0x333333],
      [1, 0, 0, 0xbf6e6e], [-1, 0, 0, 0xbf6e6e],
      [0, 1, 0, 0x6e9a6e], [0, -1, 0, 0x6e9a6e],
    ].forEach((c) => {
      const m = new Mesh(cardinalGeo, new MeshStandardMaterial({ color: c[3] as number }));
      m.position.set(c[0] as number, c[1] as number, c[2] as number);
      this.scene.add(m);
    });

    // State vector arrow
    this.stateArrow = new ArrowHelper(
      new Vector3(0, 0, 1), new Vector3(0, 0, 0), 1, 0xc8983b, 0.12, 0.08,
    );
    this.scene.add(this.stateArrow);
    this.stateDot = new Mesh(
      new SphereGeometry(0.06, 16, 12),
      new MeshStandardMaterial({ color: 0xc8983b }),
    );
    this.stateDot.position.set(0, 0, 1);
    this.scene.add(this.stateDot);

    // Controls
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

  /** Convert (θ, φ) Bloch coords to a unit Vector3. */
  private blochVec(thetaDeg: number, phiDeg: number): Vector3 {
    const theta = (thetaDeg * Math.PI) / 180;
    const phi = (phiDeg * Math.PI) / 180;
    return new Vector3(
      Math.sin(theta) * Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
      Math.cos(theta),
    );
  }

  resetState(thetaDeg: number, phiDeg: number): void {
    const v = this.blochVec(thetaDeg, phiDeg);
    this.statePoint.set([v.x, v.y, v.z]);
    this.lastGateName.set(null);
    // Compute the quaternion that rotates +z to v
    this.currentQ = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), v);
    this.applyCurrentQ();
  }

  applyGate(g: GateInfo): void {
    if (this.animating()) return;
    this.lastGateName.set(g.name);
    // The gate's rotation as a quaternion
    const axis = new Vector3(g.axis[0], g.axis[1], g.axis[2]).normalize();
    const angle = (g.angleDeg * Math.PI) / 180;
    const gateQ = new Quaternion().setFromAxisAngle(axis, angle);

    // The new state quaternion is gateQ * currentQ (compose: apply current then gate)
    this.animFromQ.copy(this.currentQ);
    this.animToQ.copy(gateQ).multiply(this.currentQ);
    this.animStartTime = performance.now();
    this.animating.set(true);
  }

  private applyCurrentQ(): void {
    // Compute the state vector by rotating +z by currentQ
    const v = new Vector3(0, 0, 1).applyQuaternion(this.currentQ);
    this.statePoint.set([v.x, v.y, v.z]);
    if (this.stateArrow) {
      this.stateArrow.setDirection(v);
      this.stateArrow.setLength(1, 0.12, 0.08);
    }
    if (this.stateDot) {
      this.stateDot.position.copy(v);
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (this.animating()) {
      const elapsed = performance.now() - this.animStartTime;
      const progress = Math.min(1, elapsed / this.animDuration);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.currentQ.copy(this.animFromQ).slerp(this.animToQ, eased);
      this.applyCurrentQ();
      if (progress >= 1) {
        this.animating.set(false);
        this.currentQ.copy(this.animToQ);
        this.applyCurrentQ();
      }
    }

    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };

  gateDescOf(name: string): string {
    return GATES.find((g) => g.name === name)?.desc ?? '';
  }
}
