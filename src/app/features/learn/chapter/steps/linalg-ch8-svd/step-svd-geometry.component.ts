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
  AxesHelper,
  DirectionalLight,
  DoubleSide,
  Group,
  LineBasicMaterial,
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

// Pre-computed example: A = U Σ V^T where:
//   V = rotation by π/6 around z-axis
//   Σ = diag(2.4, 1.3, 0.6)
//   U = rotation by π/4 around y-axis
const SIGMA: [number, number, number] = [2.4, 1.3, 0.6];

const IDENTITY_Q = new Quaternion();
const V_Q = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 6);
const V_T_Q = V_Q.clone().invert();
const U_Q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4);

const STEP_TITLES = [
  '\u521D\u59CB\uFF1A\u55AE\u4F4D\u7403\u9762',
  '\u5957\u7528 V\u1D40\uFF1A\u65CB\u8F49\uFF08\u4ECD\u662F\u7403\uFF09',
  '\u5957\u7528 \u03A3\uFF1A\u6CBF\u4E3B\u8EF8\u7E2E\u653E \u2192 \u6912\u5713',
  '\u5957\u7528 U\uFF1A\u518D\u65CB\u8F49 \u2192 A\u00B7\u7403\u9762',
];

const STEP_FORMULAS = [
  'I',
  'V\u1D40',
  '\u03A3 \u00B7 V\u1D40',
  'U \u00B7 \u03A3 \u00B7 V\u1D40 = A',
];

@Component({
  selector: 'app-step-svd-geometry',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="SVD \u7684\u5E7E\u4F55\uFF1A\u65CB\u8F49 \u2192 \u7E2E\u653E \u2192 \u65CB\u8F49" subtitle="\u00A78.2">
      <p>
        SVD \u544A\u8A34\u6211\u5011\uFF1A<strong>\u4EFB\u4F55</strong>\u7DDA\u6027\u8B8A\u63DB\u90FD\u53EF\u4EE5\u62C6\u6210\u4E09\u500B\u7C21\u55AE\u52D5\u4F5C\uFF1A
      </p>
      <p class="formula">A = U \u00B7 \u03A3 \u00B7 V\u1D40</p>
      <ol>
        <li><strong>V\u1D40 \u65CB\u8F49</strong>\uFF1A\u5C07\u8F38\u5165\u7A7A\u9593\u8F49\u5230\u300C\u4E3B\u8EF8\u300D\u65B9\u5411</li>
        <li><strong>\u03A3 \u7E2E\u653E</strong>\uFF1A\u6CBF\u8457\u9019\u4E9B\u4E3B\u8EF8\u62C9\u9577\u6216\u7E2E\u77ED\uFF08\u500D\u6578\u662F\u5947\u7570\u503C \u03C3\u1D62\uFF09</li>
        <li><strong>U \u65CB\u8F49</strong>\uFF1A\u518D\u8F49\u5230\u8F38\u51FA\u7A7A\u9593\u7684\u6700\u7D42\u4F4D\u7F6E</li>
      </ol>
      <p>
        \u5E7E\u4F55\u4E0A\u9019\u610F\u5473\u8457\uFF1A\u8B8A\u63DB <strong>A \u628A\u4E00\u500B\u55AE\u4F4D\u7403\u9762\u8B8A\u6210\u4E00\u500B\u6912\u5713</strong>\u3002
        \u6912\u5713\u7684\u4E09\u500B\u4E3B\u8EF8\u9577\u5EA6\u5C31\u662F\u4E09\u500B\u5947\u7570\u503C\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9EDE\u6309\u9215\u770B SVD \u7684\u4E09\u500B\u6B65\u9A5F\u52D5\u756B \u2014 \u7403\u9762\u600E\u9EBC\u8B8A\u6912\u5713">
      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="step-row">
        @for (s of stepTitles; track s; let i = $index) {
          <button class="step-btn" [class.active]="step() === i" (click)="goTo(i)">
            <span class="step-num">{{ i }}</span>
            <span class="step-formula">{{ stepFormulas[i] }}</span>
          </button>
        }
      </div>

      <div class="step-info">
        <div class="step-title">{{ stepTitles[step()] }}</div>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="playAll()">\u25B7 \u4ECE\u982D\u64AD\u653E</button>
        <button class="ctrl-btn" (click)="resetView()">\u21BA \u91CD\u7F6E\u8996\u89D2</button>
        <span class="ctrl-info">\u62D6\u62FD\u65CB\u8F49 \u00B7 \u6EFE\u8F2A\u7E2E\u653E</span>
      </div>

      <div class="info">
        <div class="info-row sigma1">
          <span class="il">\u03C3\u2081</span>
          <span class="iv">{{ SIGMA[0] }}\uFF08\u6700\u9577\u7684\u4E3B\u8EF8\uFF09</span>
        </div>
        <div class="info-row sigma2">
          <span class="il">\u03C3\u2082</span>
          <span class="iv">{{ SIGMA[1] }}</span>
        </div>
        <div class="info-row sigma3">
          <span class="il">\u03C3\u2083</span>
          <span class="iv">{{ SIGMA[2] }}\uFF08\u6700\u77ED\u7684\u4E3B\u8EF8\uFF09</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u8A18\u4F4F\u9019\u500B\u5E7E\u4F55\uFF1A
      </p>
      <ul>
        <li>\u4E09\u500B\u8272\u7684\u7BAD\u982D\u662F\u6A19\u6E96\u57FA\u5E95 e\u2081, e\u2082, e\u2083\uFF0C\u4ED6\u5011\u8DDF\u8457\u7403\u9762\u4E00\u8D77\u52D5</li>
        <li>\u6700\u7D42\u4F4D\u7F6E\u662F A \u7684\u4E09\u500B\u6B04\u5411\u91CF\uFF08\u56E0\u70BA Ae\u1D62 = A \u7684\u7B2C i \u500B\u6B04\uFF09</li>
        <li>\u6912\u5713\u7684\u4E3B\u8EF8\u65B9\u5411\u662F U \u7684\u6B04\uFF0C\u9577\u5EA6\u662F \u03C3\u1D62</li>
      </ul>
      <p>
        \u9019\u500B\u300C\u7403 \u2192 \u6912\u5713\u300D\u7684\u756B\u9762\u662F SVD \u6700\u4E2D\u5FC3\u7684\u5E7E\u4F55\u76F4\u89BA\u3002
        \u4E0B\u4E00\u7BC0\u6211\u5011\u770B SVD \u600E\u9EBC<strong>\u7D71\u4E00\u4E86\u56DB\u500B\u5B50\u7A7A\u9593</strong>\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 22px; font-weight: 700; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block;
      touch-action: none; }

    .step-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .step-btn { flex: 1; min-width: 100px; display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
      background: transparent; color: var(--text); cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); border-color: var(--accent-30); }
      &.active { background: var(--accent-18); border-color: var(--accent); } }
    .step-num { font-size: 11px; color: var(--text-muted); font-weight: 700; }
    .step-btn.active .step-num { color: var(--accent); }
    .step-formula { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }

    .step-info { padding: 12px 16px; border-radius: 8px; background: var(--accent-10);
      text-align: center; margin-bottom: 12px; }
    .step-title { font-size: 14px; font-weight: 700; color: var(--accent); }

    .ctrl-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); } }
    .ctrl-info { font-size: 11px; color: var(--text-muted); margin-left: auto; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 60px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.sigma1 { background: rgba(191, 110, 110, 0.08); }
      &.sigma2 { background: rgba(110, 154, 110, 0.08); }
      &.sigma3 { background: rgba(110, 138, 168, 0.08); } }
    .il { padding: 7px 12px; font-size: 13px; color: var(--accent); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; font-weight: 700; }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepSvdGeometryComponent implements AfterViewInit, OnDestroy {
  readonly stepTitles = STEP_TITLES;
  readonly stepFormulas = STEP_FORMULAS;
  readonly SIGMA = SIGMA;
  readonly step = signal(0);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');

  private renderer!: WebGLRenderer;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private controls!: OrbitControls;
  private animationId = 0;
  private resizeObserver?: ResizeObserver;

  // Hierarchy:
  //   outerGroup (rotation U)
  //     middleGroup (scale Σ)
  //       sphereGroup (rotation V^T)
  //         sphere mesh
  //         test arrows (e₁, e₂, e₃ to be transformed along)
  private outerGroup!: Group;
  private middleGroup!: Group;
  private sphereGroup!: Group;

  // Animation tween from currentT to targetT
  private currentT = 0;
  private animFromT = 0;
  private animToT = 0;
  private animStartTime = 0;
  private readonly animDuration = 800; // ms per unit step

  ngAfterViewInit(): void {
    this.initScene();
    this.applyT(0);
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

    // Lights
    this.scene.add(new AmbientLight(0xffffff, 1.0));
    const dl = new DirectionalLight(0xffffff, 1.4);
    dl.position.set(5, 8, 5);
    this.scene.add(dl);
    const dl2 = new DirectionalLight(0xffffff, 0.5);
    dl2.position.set(-5, -3, -5);
    this.scene.add(dl2);

    // Axes (these stay fixed in world space — they're the "external" reference)
    this.scene.add(new AxesHelper(2.5));

    // Build hierarchy
    this.outerGroup = new Group();
    this.middleGroup = new Group();
    this.sphereGroup = new Group();
    this.outerGroup.add(this.middleGroup);
    this.middleGroup.add(this.sphereGroup);
    this.scene.add(this.outerGroup);

    // Wireframe sphere (semi-transparent)
    const sphereGeo = new SphereGeometry(1, 32, 16);
    const fillMat = new MeshStandardMaterial({
      color: 0xa8806e, transparent: true, opacity: 0.18, side: DoubleSide,
    });
    this.sphereGroup.add(new Mesh(sphereGeo, fillMat));
    const wireMat = new MeshBasicMaterial({
      color: 0xa8806e, wireframe: true, transparent: true, opacity: 0.55,
    });
    this.sphereGroup.add(new Mesh(sphereGeo, wireMat));

    // Test vectors: standard basis e₁ (red), e₂ (green), e₃ (blue)
    // We use Lines + tip spheres so they don't distort weirdly under non-uniform scale
    const colors = [0xbf6e6e, 0x6e9a6e, 0x6e8aa8];
    const dirs = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
    for (let i = 0; i < 3; i++) {
      const arrow = new ArrowHelper(dirs[i], new Vector3(0, 0, 0), 1, colors[i], 0.16, 0.1);
      this.sphereGroup.add(arrow);
    }

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 16;
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

  /** Apply the transformation hierarchy for the given continuous t in [0, 3]. */
  private applyT(t: number): void {
    // Step 1: V^T rotation on the inner sphere group
    const t1 = Math.max(0, Math.min(1, t));
    this.sphereGroup.quaternion.slerpQuaternions(IDENTITY_Q, V_T_Q, t1);

    // Step 2: Σ scaling on the middle group
    const t2 = Math.max(0, Math.min(1, t - 1));
    const sx = 1 + (SIGMA[0] - 1) * t2;
    const sy = 1 + (SIGMA[1] - 1) * t2;
    const sz = 1 + (SIGMA[2] - 1) * t2;
    this.middleGroup.scale.set(sx, sy, sz);

    // Step 3: U rotation on the outer group
    const t3 = Math.max(0, Math.min(1, t - 2));
    this.outerGroup.quaternion.slerpQuaternions(IDENTITY_Q, U_Q, t3);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Tween animation
    if (this.animStartTime > 0) {
      const elapsed = performance.now() - this.animStartTime;
      const dist = Math.abs(this.animToT - this.animFromT);
      const totalDuration = this.animDuration * Math.max(1, dist);
      const progress = Math.min(1, elapsed / totalDuration);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      this.currentT = this.animFromT + (this.animToT - this.animFromT) * eased;
      this.applyT(this.currentT);
      if (progress >= 1) {
        this.animStartTime = 0;
        this.currentT = this.animToT;
        this.applyT(this.currentT);
      }
    }

    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };

  goTo(target: number): void {
    this.step.set(target);
    this.animFromT = this.currentT;
    this.animToT = target;
    this.animStartTime = performance.now();
  }

  playAll(): void {
    // Reset to 0 instantly, then animate to 3
    this.currentT = 0;
    this.applyT(0);
    this.step.set(3);
    this.animFromT = 0;
    this.animToT = 3;
    this.animStartTime = performance.now();
  }

  resetView(): void {
    this.camera.position.set(5, 4, 5);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
}
