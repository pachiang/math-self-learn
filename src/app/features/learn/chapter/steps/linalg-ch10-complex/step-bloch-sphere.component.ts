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
import { BLOCH_PRESETS, qubitFromBloch, qubitToBloch, cFormat } from './qubit-util';

@Component({
  selector: 'app-step-bloch-sphere',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u91CF\u5B50\u4F4D\u5143\u8207 Bloch \u7403\u9762" subtitle="\u00A710.6">
      <p>
        \u4E00\u500B\u91CF\u5B50\u4F4D\u5143\u662F\u4E00\u500B\u8907\u5411\u91CF\uFF1A
      </p>
      <p class="formula">|\u03C8\u27E9 = \u03B1|0\u27E9 + \u03B2|1\u27E9\uFF0C|\u03B1|\u00B2 + |\u03B2|\u00B2 = 1</p>
      <p>
        \u9019\u662F\u300C2 \u500B\u8907\u6578\u3001\u6EFF\u8DB3 1 \u500B\u9650\u5236\u300D\u2014\u8868\u9762\u4E0A\u770B\u8D77\u4F86\u662F 4\u22121 = 3 \u500B\u5BE6\u6578\u81EA\u7531\u5EA6\u3002
      </p>
      <p>
        \u4F46\u9084\u6709<strong>\u4E00\u500B\u500B\u4F4D</strong>\uFF1A\u4E58\u4E0A\u4E00\u500B\u5168\u5C40\u76F8\u4F4D e^(i\u03BB) \u7684\u72C0\u614B\u5728\u7269\u7406\u4E0A\u662F\u300C\u540C\u4E00\u500B\u72C0\u614B\u300D\u3002
        \u300C\u6574\u500B\u72C0\u614B\u7E5E\u8457 e^(i\u03BB) \u8F49\u300D\u4E0D\u53EF\u89C0\u6E2C\u3002
      </p>
      <p>
        \u6263\u639B\u9019\u500B\u5168\u5C40\u76F8\u4F4D\u4E4B\u5F8C\uFF0C\u91CF\u5B50\u4F4D\u5143\u9084\u9918 <strong>2 \u500B\u5BE6\u6578\u81EA\u7531\u5EA6</strong>\u3002\u9019\u80FD\u88AB\u4F55\u8005\u756B\u51FA\u4F86\uFF1F
      </p>
      <p>
        \u7B54\u6848\uFF1A\u4E00\u500B<strong>\u7403\u9762</strong>\u3002\u4E00\u822C\u53EB\u505A <strong>Bloch \u7403\u9762</strong>\u3002
      </p>
      <p>
        \u53EF\u4EE5\u5BEB\u6210\uFF1A
      </p>
      <p class="formula">|\u03C8\u27E9 = cos(\u03B8/2)|0\u27E9 + e^(i\u03C6) sin(\u03B8/2)|1\u27E9</p>
      <p>
        \u5176\u4E2D \u03B8 \u2208 [0, \u03C0]\u3001\u03C6 \u2208 [0, 2\u03C0)\u3002\u9019\u662F\u7403\u9762\u4E0A\u9EDE\u7684\u6975\u5750\u6A19\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u62FD\u65CB\u8F49\u770B Bloch \u7403\u9762\uFF0C\u4E5F\u53EF\u4EE5\u9078\u516D\u500B\u300C\u4E3B\u8981\u72C0\u614B\u300D">
      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="preset-btn" [class.active]="presetIdx() === i" (click)="setPreset(i)">{{ p.name }}</button>
        }
      </div>

      <div class="sliders">
        <div class="sl">
          <span class="sl-lab">\u03B8</span>
          <input type="range" min="0" max="180" step="1" [value]="thetaDeg()"
            (input)="thetaDeg.set(+$any($event).target.value); presetIdx.set(-1)" />
          <span class="sl-val">{{ thetaDeg() }}\u00B0</span>
        </div>
        <div class="sl">
          <span class="sl-lab">\u03C6</span>
          <input type="range" min="0" max="360" step="1" [value]="phiDeg()"
            (input)="phiDeg.set(+$any($event).target.value); presetIdx.set(-1)" />
          <span class="sl-val">{{ phiDeg() }}\u00B0</span>
        </div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">\u91CF\u5B50\u614B</span>
          <span class="iv">|\u03C8\u27E9 = <strong>{{ alphaStr() }}</strong>|0\u27E9 + <strong>{{ betaStr() }}</strong>|1\u27E9</span>
        </div>
        <div class="info-row">
          <span class="il">|\u03B1|\u00B2</span>
          <span class="iv">{{ alphaSq().toFixed(3) }}</span>
        </div>
        <div class="info-row">
          <span class="il">|\u03B2|\u00B2</span>
          <span class="iv">{{ betaSq().toFixed(3) }}</span>
        </div>
        <div class="info-row big">
          <span class="il">Bloch \u9EDE</span>
          <span class="iv">(<strong>{{ blochPt()[0].toFixed(2) }}</strong>, <strong>{{ blochPt()[1].toFixed(2) }}</strong>, <strong>{{ blochPt()[2].toFixed(2) }}</strong>)</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u8A18\u4F4F Bloch \u7403\u9762\u7684\u6982\u5FF5\u5C0D\u61C9\uFF1A
      </p>
      <ul>
        <li><strong>\u5317\u6975 (0, 0, 1)</strong> \u2194 |0\u27E9</li>
        <li><strong>\u5357\u6975 (0, 0, \u22121)</strong> \u2194 |1\u27E9</li>
        <li><strong>+x \u8EF8 (1, 0, 0)</strong> \u2194 |+\u27E9 = (|0\u27E9 + |1\u27E9)/\u221A2</li>
        <li><strong>\u2212x \u8EF8 (\u22121, 0, 0)</strong> \u2194 |\u2212\u27E9</li>
        <li><strong>+y \u8EF8 (0, 1, 0)</strong> \u2194 |+i\u27E9 = (|0\u27E9 + i|1\u27E9)/\u221A2</li>
        <li><strong>\u2212y \u8EF8 (0, \u22121, 0)</strong> \u2194 |\u2212i\u27E9</li>
      </ul>
      <p>
        \u9019\u662F\u91CF\u5B50\u8A08\u7B97\u91CC\u6700\u91CD\u8981\u7684\u8996\u89BA\u5316\u3002\u4E0B\u4E00\u7Bc0\u770B\u300C\u91CF\u5B50\u9598\u300D\u600E\u9EBC\u5728\u9019\u500B\u7403\u9762\u4E0A\u8868\u73FE\u70BA<strong>\u65CB\u8F49</strong>\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 17px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }

    .ctrl-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; justify-content: center; }
    .preset-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 14px; font-family: 'Noto Sans Math', serif;
      cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); font-weight: 700; } }

    .sliders { display: flex; flex-direction: column; gap: 6px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 16px; font-weight: 700; color: var(--accent); min-width: 24px;
      font-family: 'Noto Sans Math', serif; text-align: center; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      min-width: 48px; text-align: right; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 70px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); }
  `,
})
export class StepBlochSphereComponent implements AfterViewInit, OnDestroy {
  readonly presets = BLOCH_PRESETS;
  readonly presetIdx = signal(0);
  readonly thetaDeg = signal(0);
  readonly phiDeg = signal(0);

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

  // Computed qubit
  readonly theta = computed(() => (this.thetaDeg() * Math.PI) / 180);
  readonly phi = computed(() => (this.phiDeg() * Math.PI) / 180);
  readonly qubit = computed(() => qubitFromBloch(this.theta(), this.phi()));
  readonly blochPt = computed(() => qubitToBloch(this.qubit()));

  readonly alphaSq = computed(() => {
    const a = this.qubit().alpha;
    return a[0] * a[0] + a[1] * a[1];
  });
  readonly betaSq = computed(() => {
    const b = this.qubit().beta;
    return b[0] * b[0] + b[1] * b[1];
  });

  readonly alphaStr = computed(() => cFormat(this.qubit().alpha, 2));
  readonly betaStr = computed(() => cFormat(this.qubit().beta, 2));

  constructor() {
    effect(() => {
      const pt = this.blochPt();
      if (this.stateArrow) {
        const v = new Vector3(pt[0], pt[1], pt[2]);
        const len = v.length();
        if (len > 0.001) {
          this.stateArrow.setDirection(v.clone().normalize());
          this.stateArrow.setLength(len, 0.12, 0.08);
        }
        this.stateDot.position.copy(v);
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

  setPreset(i: number): void {
    this.presetIdx.set(i);
    const pt = BLOCH_PRESETS[i].point;
    // Convert (x, y, z) on the unit sphere back to (θ, φ)
    // z = cos θ → θ = acos(z)
    // x = sin θ cos φ, y = sin θ sin φ → φ = atan2(y, x)
    const theta = Math.acos(Math.max(-1, Math.min(1, pt[2])));
    let phi = Math.atan2(pt[1], pt[0]);
    if (phi < 0) phi += 2 * Math.PI;
    this.thetaDeg.set(Math.round((theta * 180) / Math.PI));
    this.phiDeg.set(Math.round((phi * 180) / Math.PI));
    // Restore preset index after the slider listeners reset it
    setTimeout(() => this.presetIdx.set(i));
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

    // Lights
    this.scene.add(new AmbientLight(0xffffff, 1.0));
    const dl = new DirectionalLight(0xffffff, 1.4);
    dl.position.set(5, 8, 5);
    this.scene.add(dl);
    const dl2 = new DirectionalLight(0xffffff, 0.5);
    dl2.position.set(-5, -3, -5);
    this.scene.add(dl2);

    // The Bloch sphere itself: translucent + wireframe
    const sphereGeo = new SphereGeometry(1, 32, 24);
    this.scene.add(new Mesh(sphereGeo, new MeshStandardMaterial({
      color: 0xa8b8c8, transparent: true, opacity: 0.12, side: DoubleSide,
    })));
    this.scene.add(new Mesh(sphereGeo, new MeshBasicMaterial({
      color: 0xa8b8c8, wireframe: true, transparent: true, opacity: 0.3,
    })));

    // Custom axes through the sphere
    const axColors = [0xbf6e6e, 0x6e9a6e, 0x6e8aa8];
    const axNames = ['+x |+\u27E9', '+y |+i\u27E9', '+z |0\u27E9'];
    const axDirs = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
    for (let i = 0; i < 3; i++) {
      const dir = axDirs[i];
      const cyl = new Mesh(
        new CylinderGeometry(0.01, 0.01, 2.4, 8),
        new MeshBasicMaterial({ color: axColors[i], transparent: true, opacity: 0.55 }),
      );
      const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir);
      cyl.quaternion.copy(q);
      this.scene.add(cyl);
    }

    // Pole markers and labels (small spheres at the cardinal points)
    const cardinalGeo = new SphereGeometry(0.04, 12, 8);
    const cardinalPoints = [
      { pt: [0, 0, 1], color: 0xffffff },
      { pt: [0, 0, -1], color: 0x333333 },
      { pt: [1, 0, 0], color: 0xbf6e6e },
      { pt: [-1, 0, 0], color: 0xbf6e6e },
      { pt: [0, 1, 0], color: 0x6e9a6e },
      { pt: [0, -1, 0], color: 0x6e9a6e },
    ];
    for (const c of cardinalPoints) {
      const m = new Mesh(cardinalGeo, new MeshStandardMaterial({ color: c.color }));
      m.position.set(c.pt[0], c.pt[1], c.pt[2]);
      this.scene.add(m);
    }

    // The state vector arrow (will be updated via effect)
    this.stateArrow = new ArrowHelper(
      new Vector3(0, 0, 1), new Vector3(0, 0, 0), 1, 0xc8983b, 0.12, 0.08,
    );
    this.scene.add(this.stateArrow);

    // The state "dot" at the tip
    this.stateDot = new Mesh(
      new SphereGeometry(0.06, 16, 12),
      new MeshStandardMaterial({ color: 0xc8983b }),
    );
    this.scene.add(this.stateDot);

    // OrbitControls
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

