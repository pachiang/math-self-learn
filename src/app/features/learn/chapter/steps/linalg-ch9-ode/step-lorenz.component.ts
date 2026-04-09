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
  AxesHelper,
  BufferAttribute,
  BufferGeometry,
  DirectionalLight,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

// Lorenz parameters: classic chaotic regime
const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const DT = 0.005;
const TRAIL_MAX = 6000;

@Component({
  selector: 'app-step-lorenz',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u5F9E\u7DDA\u6027\u5230\u6DF7\u6C8C\uFF1A\u52DE\u4F96\u8332\u5438\u5F15\u5B50" subtitle="\u00A79.7">
      <p>
        \u672C\u7AE0\u524D\u9762\u770B\u7684\u90FD\u662F<strong>\u7DDA\u6027</strong>\u7CFB\u7D71 dx/dt = Ax\u3002\u4ED6\u5011\u7684\u884C\u70BA\u53EA\u6709\u4E09\u7A2E\uFF1A\u8DD1\u5230\u5E73\u8861\u9EDE\u3001\u8DD1\u5230\u7121\u7A77\u3001\u6216\u7E5E\u8457\u5708\u8DD1\u3002
      </p>
      <p>
        \u4F46\u5982\u679C\u52A0\u4E00\u9EDE\u9EDE<strong>\u975E\u7DDA\u6027</strong>\uFF0C\u4E00\u5207\u90FD\u8B8A\u4E86\u3002
      </p>
      <p>1963 \u5E74\uFF0C\u6C23\u8C61\u5B78\u5BB6 Edward Lorenz \u7814\u7A76\u5927\u6C23\u5C0D\u6D41\u7C21\u5316\u51FA\u9019\u500B\u7CFB\u7D71\uFF1A</p>
      <p class="formula">
        dx/dt = \u03C3(y \u2212 x)<br/>
        dy/dt = x(\u03C1 \u2212 z) \u2212 y<br/>
        dz/dt = xy \u2212 \u03B2z
      </p>
      <p>
        \u6CE8\u610F xz \u8DDF xy \u662F\u4E58\u7A4D \u2014 \u9019\u4E9B\u662F<strong>\u975E\u7DDA\u6027</strong>\u9805\u3002\u9019\u500B\u4E0D\u662F\u7DDA\u6027 ODE\uFF0C\u4F46\u5C0D\u6BD4\u4E0B\u540C\u6A23\u91CD\u8981\u3002
      </p>
      <p>
        \u8B93\u9019\u500B\u7CFB\u7D71\u8DD1\uFF0C\u4F60\u6703\u770B\u5230\u4E00\u500B<strong>\u8776\u8776\u72C0</strong>\u7684\u5438\u5F15\u5B50 \u2014 \u8ECC\u9053\u4ECE\u4E0D\u91CD\u8907\uFF0C\u4F46\u59CB\u7D42\u5728\u4E00\u500B\u6709\u9650\u7684\u533A\u57DF\u6709\u9650\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u770B\u52DE\u4F96\u8332\u5438\u5F15\u5B50\u968F\u6642\u9593\u756B\u51FA\u8776\u8776 \u00B7 \u62D6\u62FD\u65CB\u8F49 3D \u8996\u89D2">
      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn primary" (click)="togglePlay()">{{ playing() ? '\u23F8 \u6691\u505C' : '\u25B7 \u64AD\u653E' }}</button>
        <button class="ctrl-btn" (click)="reset()">\u21BB \u91CD\u7F6E</button>
        <button class="ctrl-btn" (click)="resetView()">\u21BA \u91CD\u7F6E\u8996\u89D2</button>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">\u53C3\u6578</span>
          <span class="iv">\u03C3 = {{ SIGMA }}, \u03C1 = {{ RHO }}, \u03B2 = {{ BETA.toFixed(3) }}</span>
        </div>
        <div class="info-row">
          <span class="il">\u8D77\u59CB\u9EDE</span>
          <span class="iv">\u85CD\u9EDE\uFF1A(0.1, 0, 0)\u3001\u7DA0\u9EDE\uFF1A(0.10001, 0, 0)</span>
        </div>
        <div class="info-row big">
          <span class="il">\u5DEE\u8DDD</span>
          <span class="iv">|x\u2081 \u2212 x\u2082| = <strong>{{ separation().toExponential(2) }}</strong></span>
        </div>
      </div>

      <div class="key-insight">
        \u26A1 \u5169\u689D\u8ECC\u8DE1\u4E00\u958B\u59CB\u53EA\u5DEE 0.00001\uFF0C\u4F46\u96A8\u8457\u6642\u9593\u63A8\u9032\uFF0C\u5DEE\u8DDD\u6307\u6578\u5730\u589E\u5927 \u2014 \u9019\u5C31\u662F<strong>\u521D\u503C\u654F\u611F\u6027</strong>\uFF0C\u300C\u8776\u8776\u6548\u61C9\u300D\u7684\u4F86\u6E90\u3002
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u8776\u8776\u6548\u61C9\u8AAA\uFF1A\u300C\u4E00\u96BB\u8776\u8776\u5728\u5DF4\u897F\u62CD\u62CD\u7FC5\u8180\uFF0C\u53EF\u80FD\u5728\u5FB7\u5DDE\u5F15\u8D77\u9F8D\u6372\u98A8\u3002\u300D\u9019\u500B\u8AAA\u6CD5\u5C31\u662F\u5F9E Lorenz \u7CFB\u7D71\u4F86\u7684\u3002
      </p>
      <p>
        \u9019\u662F\u5C0D\u6F14\u7F8E\u300C\u9577\u671F\u5929\u6C23\u9810\u5831\u300D\u4E0D\u53EF\u80FD\u7684\u6839\u672C\u539F\u56E0\u2014 \u4E0D\u662F\u8A08\u7B97\u80FD\u529B\u4E0D\u8DB3\uFF0C\u662F\u521D\u59CB\u689D\u4EF6\u53EA\u8981\u6709\u5FAE\u5C0F\u8AA4\u5DEE\uFF0C\u9810\u6E2C\u5C31\u6703\u5728\u6709\u9650\u7684\u6642\u9593\u5167\u5B8C\u5168\u504F\u96E2\u4E8B\u5BE6\u3002
      </p>
      <p>
        \u4F46\u8ECC\u9053\u4F9D\u7136\u88AB\u9650\u5236\u5728\u5438\u5F15\u5B50\u4E0A\u3002\u9019\u662F\u300C\u78BA\u5B9A\u6027\u4E2D\u7684\u968F\u6A5F\u300D\u2014\u4E00\u500B\u5C0D\u300C\u8AB0\u80FD\u9810\u6E2C\u300D\u8DDF\u300C\u8AB0\u4E0D\u80FD\u300D\u7684\u91CD\u65B0\u601D\u8003\u3002
      </p>
      <p>
        \u9019\u4E5F\u6B63\u5F0F\u5BA3\u544A\u4E86\u7DDA\u6027\u4EE3\u6578\u7AE0\u7BC0\u7684\u7D50\u675F\u3002\u4F60\u770B\u5230\u4E86\u7DDA\u6027\u7CFB\u7D71\u80FD\u8AAA\u4EC0\u9EBC\uFF0C\u4E5F\u770B\u5230\u4E86\u300C\u4E00\u9EDE\u70B9\u975E\u7DDA\u6027\u300D\u80FD\u5728\u300C\u7DDA\u6027\u4E16\u754C\u300D\u4E0A\u96D5\u51FA\u591A\u7522\u751F\u7684\u8C50\u5BCC\u3002\u9019\u5C31\u662F\u73FE\u4EE3\u6578\u5B78\u7684\u4E00\u500B\u9000\u5E03\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 12px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 2; }

    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block;
      touch-action: none; }

    .ctrl-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
      &.primary { background: var(--accent-10); border-color: var(--accent-30); color: var(--accent); font-weight: 600; } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .info-row { display: grid; grid-template-columns: 90px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: rgba(160, 90, 90, 0.06); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: #a05a5a; font-size: 13px; }

    .key-insight { padding: 12px 16px; border-radius: 8px;
      background: rgba(160, 90, 90, 0.06); border: 1px dashed rgba(160, 90, 90, 0.3);
      font-size: 13px; color: var(--text-secondary); line-height: 1.6;
      strong { color: #a05a5a; } }
  `,
})
export class StepLorenzComponent implements AfterViewInit, OnDestroy {
  readonly SIGMA = SIGMA;
  readonly RHO = RHO;
  readonly BETA = BETA;
  readonly playing = signal(false);
  readonly separation = signal(1e-5);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');

  private renderer!: WebGLRenderer;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private controls!: OrbitControls;
  private animationId = 0;
  private resizeObserver?: ResizeObserver;

  // Two trajectories with slightly different starting points
  private state1: [number, number, number] = [0.1, 0, 0];
  private state2: [number, number, number] = [0.10001, 0, 0];
  private trail1: number[] = [];
  private trail2: number[] = [];
  private line1!: Line;
  private line2!: Line;
  private head1!: Mesh;
  private head2!: Mesh;

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
        if (obj instanceof Mesh || obj instanceof Line) {
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

    this.camera = new PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.set(60, 40, 60);
    this.camera.lookAt(0, 0, 25);

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resizeRenderer();

    this.scene.add(new AmbientLight(0xffffff, 1.0));
    const dl = new DirectionalLight(0xffffff, 1.4);
    dl.position.set(50, 50, 50);
    this.scene.add(dl);

    // Faint axes for orientation
    const axes = new AxesHelper(15);
    this.scene.add(axes);

    // Two trajectory lines (initially empty)
    const buf1 = new BufferGeometry();
    buf1.setAttribute('position', new BufferAttribute(new Float32Array(TRAIL_MAX * 3), 3));
    buf1.setDrawRange(0, 0);
    const mat1 = new LineBasicMaterial({ color: 0x6e8aa8 });
    this.line1 = new Line(buf1, mat1);
    this.scene.add(this.line1);

    const buf2 = new BufferGeometry();
    buf2.setAttribute('position', new BufferAttribute(new Float32Array(TRAIL_MAX * 3), 3));
    buf2.setDrawRange(0, 0);
    const mat2 = new LineBasicMaterial({ color: 0x6e9a6e });
    this.line2 = new Line(buf2, mat2);
    this.scene.add(this.line2);

    // Spheres marking the current head positions
    const headGeo = new SphereGeometry(0.6, 12, 8);
    this.head1 = new Mesh(headGeo, new MeshStandardMaterial({ color: 0x6e8aa8 }));
    this.scene.add(this.head1);
    this.head2 = new Mesh(headGeo, new MeshStandardMaterial({ color: 0x6e9a6e }));
    this.scene.add(this.head2);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 30;
    this.controls.maxDistance = 200;
    this.controls.target.set(0, 0, 25);

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

  /** Lorenz RHS. */
  private lorenzStep(s: [number, number, number]): [number, number, number] {
    const [x, y, z] = s;
    return [
      SIGMA * (y - x),
      x * (RHO - z) - y,
      x * y - BETA * z,
    ];
  }

  /** RK4 single step. */
  private rk4(s: [number, number, number], dt: number): [number, number, number] {
    const k1 = this.lorenzStep(s);
    const s2: [number, number, number] = [s[0] + dt / 2 * k1[0], s[1] + dt / 2 * k1[1], s[2] + dt / 2 * k1[2]];
    const k2 = this.lorenzStep(s2);
    const s3: [number, number, number] = [s[0] + dt / 2 * k2[0], s[1] + dt / 2 * k2[1], s[2] + dt / 2 * k2[2]];
    const k3 = this.lorenzStep(s3);
    const s4: [number, number, number] = [s[0] + dt * k3[0], s[1] + dt * k3[1], s[2] + dt * k3[2]];
    const k4 = this.lorenzStep(s4);
    return [
      s[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      s[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      s[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    ];
  }

  private appendPoint(trail: number[], buf: BufferGeometry, pt: [number, number, number]): void {
    trail.push(pt[0], pt[1], pt[2]);
    if (trail.length > TRAIL_MAX * 3) trail.splice(0, 3);
    const positions = buf.attributes['position'] as BufferAttribute;
    const arr = positions.array as Float32Array;
    for (let i = 0; i < trail.length; i++) arr[i] = trail[i];
    buf.setDrawRange(0, trail.length / 3);
    positions.needsUpdate = true;
    buf.computeBoundingSphere();
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (this.playing()) {
      // Run several integration steps per frame for smoothness
      for (let i = 0; i < 6; i++) {
        this.state1 = this.rk4(this.state1, DT);
        this.state2 = this.rk4(this.state2, DT);
        this.appendPoint(this.trail1, this.line1.geometry as BufferGeometry, this.state1);
        this.appendPoint(this.trail2, this.line2.geometry as BufferGeometry, this.state2);
      }
      this.head1.position.set(this.state1[0], this.state1[1], this.state1[2]);
      this.head2.position.set(this.state2[0], this.state2[1], this.state2[2]);
      // Update separation
      const dx = this.state1[0] - this.state2[0];
      const dy = this.state1[1] - this.state2[1];
      const dz = this.state1[2] - this.state2[2];
      this.separation.set(Math.hypot(dx, dy, dz));
    }

    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };

  togglePlay(): void {
    this.playing.update((p) => !p);
  }

  reset(): void {
    this.state1 = [0.1, 0, 0];
    this.state2 = [0.10001, 0, 0];
    this.trail1 = [];
    this.trail2 = [];
    (this.line1.geometry as BufferGeometry).setDrawRange(0, 0);
    (this.line2.geometry as BufferGeometry).setDrawRange(0, 0);
    this.separation.set(1e-5);
  }

  resetView(): void {
    this.camera.position.set(60, 40, 60);
    this.camera.lookAt(0, 0, 25);
    this.controls.target.set(0, 0, 25);
    this.controls.update();
  }
}
