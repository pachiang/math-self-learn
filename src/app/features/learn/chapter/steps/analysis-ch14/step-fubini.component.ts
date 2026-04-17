import {
  AfterViewInit, Component, ElementRef, OnDestroy, computed, effect, signal, viewChild,
} from '@angular/core';
import {
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, DoubleSide,
  GridHelper, Group, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial,
  PerspectiveCamera, PlaneGeometry, Scene, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleSurface } from './analysis-ch14-util';

@Component({
  selector: 'app-step-fubini',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Fubini 定理" subtitle="§14.2">
      <p>
        <strong>Fubini 定理</strong>：若 f 在 D = [a,b]×[c,d] 上可積，則
      </p>
      <p class="formula">∬_D f dA = ∫ₐᵇ [ ∫_c^d f(x,y) dy ] dx = ∫_c^d [ ∫ₐᵇ f(x,y) dx ] dy</p>
      <p>
        雙重積分可以拆成<strong>兩次</strong>一維積分，而且<strong>順序可以交換</strong>。
        3D 視覺化：固定 x（或 y），用一個「掃描平面」切過曲面，切出的截面面積就是內層積分。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動切片位置，觀察 Fubini 如何把雙重積分拆成切片面積的積分">
      <div class="mode-tabs">
        <button class="ft" [class.active]="mode() === 'dx-dy'" (click)="mode.set('dx-dy')">先積 dy 再積 dx</button>
        <button class="ft" [class.active]="mode() === 'dy-dx'" (click)="mode.set('dy-dx')">先積 dx 再積 dy</button>
      </div>

      <div class="ctrl-row">
        <span class="cl">{{ mode() === 'dx-dy' ? 'x₀' : 'y₀' }} = {{ slicePos().toFixed(2) }}</span>
        <input type="range" min="-1" max="1" step="0.02" [value]="slicePos()"
               (input)="slicePos.set(+($any($event.target)).value)" class="sl" />
      </div>

      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetView()">↺ 重置視角</button>
        <button class="ctrl-btn" [class.active]="autoRotate()" (click)="autoRotate.update(v => !v)">
          {{ autoRotate() ? '⏸ 停止' : '▷ 自轉' }}
        </button>
        <span class="ctrl-info">拖曳旋轉 · 滾輪縮放</span>
      </div>

      <div class="info-row">
        <div class="i-card">切片面積 = {{ sliceArea().toFixed(4) }}</div>
        <div class="i-card accent">∬ f dA ≈ {{ totalVol().toFixed(4) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意兩種順序算出相同結果——這正是 Fubini 定理的威力。
        但條件很重要：如果 f 不可積（例如不可測），交換順序可能得到<strong>不同答案</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .mode-tabs { display: flex; gap: 4px; margin-bottom: 10px; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .cl { font-size: 13px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); color: var(--accent); border-color: var(--accent); } }
    .ctrl-info { font-size: 11px; color: var(--text-muted); margin-left: auto; }
    .info-row { display: flex; gap: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
  `,
})
export class StepFubiniComponent implements AfterViewInit, OnDestroy {
  readonly mode = signal<'dx-dy' | 'dy-dx'>('dx-dy');
  readonly slicePos = signal(0);
  readonly autoRotate = signal(true);

  private readonly f = (x: number, y: number) => 1 - x * x - y * y;

  readonly sliceArea = computed(() => {
    const pos = this.slicePos();
    const fn = this.f;
    const n = 200;
    const dt = 2 / n;
    let sum = 0;
    if (this.mode() === 'dx-dy') {
      for (let i = 0; i < n; i++) {
        const y = -1 + (i + 0.5) * dt;
        sum += Math.max(0, fn(pos, y)) * dt;
      }
    } else {
      for (let i = 0; i < n; i++) {
        const x = -1 + (i + 0.5) * dt;
        sum += Math.max(0, fn(x, pos)) * dt;
      }
    }
    return sum;
  });

  readonly totalVol = computed(() => {
    const fn = this.f;
    const n = 100;
    const dx = 2 / n;
    let sum = 0;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const x = -1 + (i + 0.5) * dx;
        const y = -1 + (j + 0.5) * dx;
        sum += Math.max(0, fn(x, y)) * dx * dx;
      }
    }
    return sum;
  });

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private sliceGroup!: Group;
  private surfaceGroup!: Group;
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.mode(); this.slicePos();
      if (this.scene) this.rebuildSlice();
    });
    effect(() => {
      if (this.controls) this.controls.autoRotate = this.autoRotate();
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.buildSurface();
    this.rebuildSlice();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.resizeObserver?.disconnect();
    this.scene?.traverse((obj) => {
      if (obj instanceof Mesh || obj instanceof LineSegments) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose()); else mat.dispose();
      }
    });
    this.renderer?.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const wrap = this.wrapRef()?.nativeElement;
    if (!canvas || !wrap) return;

    this.scene = new Scene();
    this.scene.background = null;
    this.camera = new PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(3, 2.5, 3);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resizeRenderer();

    this.scene.add(new AmbientLight(0xffffff, 0.7));
    const dl = new DirectionalLight(0xffffff, 1.2);
    dl.position.set(4, 6, 4);
    this.scene.add(dl);

    const grid = new GridHelper(4, 8, 0x999999, 0xdddddd);
    (grid.material as LineBasicMaterial).transparent = true;
    (grid.material as LineBasicMaterial).opacity = 0.2;
    this.scene.add(grid);

    this.surfaceGroup = new Group();
    this.sliceGroup = new Group();
    this.scene.add(this.surfaceGroup);
    this.scene.add(this.sliceGroup);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.0;

    this.resizeObserver = new ResizeObserver(() => this.resizeRenderer());
    this.resizeObserver.observe(wrap);
  }

  private resizeRenderer(): void {
    const wrap = this.wrapRef()?.nativeElement;
    if (!wrap || !this.renderer) return;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private buildSurface(): void {
    const { positions, indices } = sampleSurface(this.f, [-1, 1], [-1, 1], 60, 60);
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mat = new MeshStandardMaterial({
      color: 0x6e9abf, transparent: true, opacity: 0.3, side: DoubleSide, roughness: 0.5,
    });
    this.surfaceGroup.add(new Mesh(geo, mat));
  }

  private rebuildSlice(): void {
    while (this.sliceGroup.children.length > 0) {
      const c = this.sliceGroup.children[0];
      this.sliceGroup.remove(c);
      if (c instanceof Mesh || c instanceof LineSegments) {
        c.geometry.dispose();
        const mat = c.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose()); else mat.dispose();
      }
    }

    const pos = this.slicePos();
    const fn = this.f;
    const N = 80;

    // Slice plane (semi-transparent)
    const planeGeo = new PlaneGeometry(2, 2);
    const planeMat = new MeshStandardMaterial({
      color: 0xbf6e6e, transparent: true, opacity: 0.15, side: DoubleSide,
    });
    const plane = new Mesh(planeGeo, planeMat);
    if (this.mode() === 'dx-dy') {
      plane.rotation.y = Math.PI / 2;
      plane.position.set(pos, 0.5, 0);
    } else {
      plane.rotation.x = Math.PI / 2;
      plane.position.set(0, 0.5, pos);
    }
    this.sliceGroup.add(plane);

    // Slice curve (the cross-section of the surface)
    const pts: Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const t = -1 + (2 * i) / N;
      let val: number;
      if (this.mode() === 'dx-dy') {
        val = Math.max(0, fn(pos, t));
        pts.push(new Vector3(pos, val, t));
      } else {
        val = Math.max(0, fn(t, pos));
        pts.push(new Vector3(t, val, pos));
      }
    }
    const lineGeo = new BufferGeometry().setFromPoints(pts);
    const lineMat = new LineBasicMaterial({ color: 0xbf6e6e, linewidth: 2 });
    const segments: Vector3[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      segments.push(pts[i], pts[i + 1]);
    }
    const segGeo = new BufferGeometry().setFromPoints(segments);
    this.sliceGroup.add(new LineSegments(segGeo, lineMat));

    // Filled cross-section (triangle strip to base)
    const fillVerts: number[] = [];
    const fillIdx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const t = -1 + (2 * i) / N;
      if (this.mode() === 'dx-dy') {
        const val = Math.max(0, fn(pos, t));
        fillVerts.push(pos, val, t);
        fillVerts.push(pos, 0, t);
      } else {
        const val = Math.max(0, fn(t, pos));
        fillVerts.push(t, val, pos);
        fillVerts.push(t, 0, pos);
      }
    }
    for (let i = 0; i < N; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      fillIdx.push(a, b, c);
      fillIdx.push(b, d, c);
    }
    const fillGeo = new BufferGeometry();
    fillGeo.setAttribute('position', new BufferAttribute(new Float32Array(fillVerts), 3));
    fillGeo.setIndex(fillIdx);
    fillGeo.computeVertexNormals();
    const fillMat = new MeshStandardMaterial({
      color: 0xbf6e6e, transparent: true, opacity: 0.4, side: DoubleSide,
    });
    this.sliceGroup.add(new Mesh(fillGeo, fillMat));
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };

  resetView(): void {
    this.camera.position.set(3, 2.5, 3);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
}
