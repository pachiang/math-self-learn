import {
  AfterViewInit, Component, ElementRef, OnDestroy, computed, effect, signal, viewChild,
} from '@angular/core';
import {
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, DoubleSide,
  GridHelper, Group, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial,
  PerspectiveCamera, Scene, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { SURFACES, Surface } from './analysis-ch16-util';

@Component({
  selector: 'app-step-parametric-surfaces',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="參數曲面" subtitle="§16.1">
      <p>
        <strong>參數曲面</strong>：S(u,v) = (x(u,v), y(u,v), z(u,v))，兩個參數掃出一張面。
      </p>
      <p>
        球面：S(θ,φ) = (sinθ cosφ, sinθ sinφ, cosθ)。<br>
        圓柱：S(θ,z) = (cosθ, sinθ, z)。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選曲面，在 3D 中旋轉觀察">
      <div class="fn-tabs">
        @for (s of surfaces; track s.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ s.name }}</button>
        }
      </div>

      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetView()">↺ 重置</button>
        <button class="ctrl-btn" [class.active]="showWire()" (click)="showWire.update(v => !v)">
          {{ showWire() ? '◉ 隱藏網格' : '◈ 顯示網格' }}
        </button>
        <button class="ctrl-btn" [class.active]="autoRotate()" (click)="autoRotate.update(v => !v)">
          {{ autoRotate() ? '⏸' : '▷' }}
        </button>
        <span class="ctrl-info">拖曳旋轉 · 滾輪縮放</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        參數曲面是曲線（一維）到二維的推廣。
        下一節看如何計算曲面的<strong>面積</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }
    .ctrl-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); color: var(--accent); border-color: var(--accent); } }
    .ctrl-info { font-size: 11px; color: var(--text-muted); margin-left: auto; }
  `,
})
export class StepParametricSurfacesComponent implements AfterViewInit, OnDestroy {
  readonly surfaces = SURFACES;
  readonly sel = signal(1);
  readonly showWire = signal(true);
  readonly autoRotate = signal(true);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private dynamicGroup!: Group;
  private wireGroup!: Group;
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => { this.sel(); if (this.scene) this.rebuild(); });
    effect(() => { if (this.controls) this.controls.autoRotate = this.autoRotate(); });
    effect(() => { if (this.wireGroup) this.wireGroup.visible = this.showWire(); });
  }

  ngAfterViewInit(): void { this.initScene(); this.rebuild(); this.animate(); }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.resizeObserver?.disconnect();
    this.scene?.traverse(obj => {
      if (obj instanceof Mesh || obj instanceof LineSegments) {
        obj.geometry.dispose();
        const m = obj.material; if (Array.isArray(m)) m.forEach(x => x.dispose()); else m.dispose();
      }
    });
    this.renderer?.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const wrap = this.wrapRef()?.nativeElement;
    if (!canvas || !wrap) return;
    this.scene = new Scene(); this.scene.background = null;
    this.camera = new PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(2.5, 2, 2.5);
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resizeRenderer();
    this.scene.add(new AmbientLight(0xffffff, 0.7));
    const dl = new DirectionalLight(0xffffff, 1.2); dl.position.set(4, 6, 4); this.scene.add(dl);
    const dl2 = new DirectionalLight(0xffffff, 0.4); dl2.position.set(-3, -2, -4); this.scene.add(dl2);
    const grid = new GridHelper(4, 8, 0x999999, 0xdddddd);
    (grid.material as LineBasicMaterial).transparent = true; (grid.material as LineBasicMaterial).opacity = 0.15;
    this.scene.add(grid);
    this.dynamicGroup = new Group(); this.wireGroup = new Group();
    this.scene.add(this.dynamicGroup); this.scene.add(this.wireGroup);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true; this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.5; this.controls.maxDistance = 8;
    this.controls.autoRotate = true; this.controls.autoRotateSpeed = 1.2;
    this.resizeObserver = new ResizeObserver(() => this.resizeRenderer());
    this.resizeObserver.observe(wrap);
  }

  private resizeRenderer(): void {
    const wrap = this.wrapRef()?.nativeElement;
    if (!wrap || !this.renderer) return;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  private rebuild(): void {
    this.clearGroup(this.dynamicGroup); this.clearGroup(this.wireGroup);
    const S = SURFACES[this.sel()];
    const N = 50;
    const [u0, u1] = S.uRange, [v0, v1] = S.vRange;
    const du = (u1 - u0) / N, dv = (v1 - v0) / N;

    // Mesh
    const verts: number[] = [], indices: number[] = [];
    for (let j = 0; j <= N; j++) {
      const v = v0 + j * dv;
      for (let i = 0; i <= N; i++) {
        const u = u0 + i * du;
        const [x, y, z] = S.r(u, v);
        verts.push(x, y, z);
      }
    }
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const a = j * (N + 1) + i, b = a + 1, c = a + (N + 1), d = c + 1;
        indices.push(a, b, c); indices.push(b, d, c);
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3));
    geo.setIndex(indices); geo.computeVertexNormals();
    const mat = new MeshStandardMaterial({ color: 0x6e9abf, transparent: true, opacity: 0.55, side: DoubleSide, roughness: 0.4 });
    this.dynamicGroup.add(new Mesh(geo, mat));

    // Wireframe
    const wireVerts: number[] = [];
    const wireN = 12;
    for (let j = 0; j <= wireN; j++) {
      const v = v0 + j * (v1 - v0) / wireN;
      for (let i = 0; i < N; i++) {
        const u = u0 + i * du; const u2 = u0 + (i + 1) * du;
        const p1 = S.r(u, v), p2 = S.r(u2, v);
        wireVerts.push(...p1, ...p2);
      }
    }
    for (let i = 0; i <= wireN; i++) {
      const u = u0 + i * (u1 - u0) / wireN;
      for (let j = 0; j < N; j++) {
        const v = v0 + j * dv; const v2 = v0 + (j + 1) * dv;
        const p1 = S.r(u, v), p2 = S.r(u, v2);
        wireVerts.push(...p1, ...p2);
      }
    }
    const wGeo = new BufferGeometry();
    wGeo.setAttribute('position', new BufferAttribute(new Float32Array(wireVerts), 3));
    const wMat = new LineBasicMaterial({ color: 0x4a7a9e, transparent: true, opacity: 0.3 });
    this.wireGroup.add(new LineSegments(wGeo, wMat));
    this.wireGroup.visible = this.showWire();
  }

  private clearGroup(g: Group): void {
    while (g.children.length) {
      const c = g.children[0]; g.remove(c);
      if (c instanceof Mesh || c instanceof LineSegments) {
        c.geometry.dispose();
        const m = c.material; if (Array.isArray(m)) m.forEach(x => x.dispose()); else m.dispose();
      }
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update(); this.renderer?.render(this.scene, this.camera);
  };

  resetView(): void {
    this.camera.position.set(2.5, 2, 2.5); this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0); this.controls.update();
  }
}
