import {
  AfterViewInit, Component, ElementRef, OnDestroy, computed, effect, signal, viewChild,
} from '@angular/core';
import {
  AmbientLight, ArrowHelper, BufferAttribute, BufferGeometry, DirectionalLight, DoubleSide,
  Group, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial,
  PerspectiveCamera, Scene, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { FIELDS_3D, SURFACES, fluxIntegral, surfaceNormal, vecLen } from './analysis-ch16-util';

@Component({
  selector: 'app-step-flux-3d',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="通量（向量曲面積分）" subtitle="§16.4">
      <p>向量場穿過曲面的<strong>流量</strong>：</p>
      <p class="formula">Φ = ∬_S F · dS = ∬_S F · n dS</p>
      <p>F 沿法向量 n 的分量 → 穿過曲面的量。正 = 穿出，負 = 穿入。</p>
    </app-prose-block>

    <app-challenge-card prompt="選向量場和曲面，在 3D 中看法向量和通量">
      <div class="ctrl-grid">
        <div class="ctrl-col">
          <div class="ctrl-label">向量場</div>
          @for (f of fields; track f.name; let i = $index) {
            <button class="ft" [class.active]="fieldSel() === i" (click)="fieldSel.set(i)">{{ f.name }}</button>
          }
        </div>
        <div class="ctrl-col">
          <div class="ctrl-label">曲面</div>
          @for (s of surfaces; track s.name; let i = $index) {
            <button class="ft" [class.active]="surfSel() === i" (click)="surfSel.set(i)">{{ s.name }}</button>
          }
        </div>
      </div>

      <div class="three-wrap" #wrap>
        <canvas #canvas></canvas>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetView()">↺ 重置</button>
        <button class="ctrl-btn" [class.active]="autoRotate()" (click)="autoRotate.update(v => !v)">
          {{ autoRotate() ? '⏸' : '▷' }}
        </button>
        <span class="ctrl-info">{{ fields[fieldSel()].formula }}</span>
      </div>

      <div class="result">
        <span class="rl">Φ = ∬ F · dS =</span>
        <span class="rv">{{ flux().toFixed(4) }}</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        輻射場 (x,y,z) 穿過全球面的通量 = 4π（全部向外穿出）。
        旋轉場 (−y,x,0) 穿過球面的通量 ≈ 0（沿球面切線走，不穿過）。
        下一節��<strong>散度定理</strong>把這個面積分轉成體積分。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-grid { display: flex; gap: 14px; margin-bottom: 10px; }
    .ctrl-col { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .ctrl-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 2px; }
    .ft { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer; text-align: left;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .three-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    .three-wrap canvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }
    .ctrl-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); color: var(--accent); border-color: var(--accent); } }
    .ctrl-info { font-size: 11px; color: var(--text-muted); margin-left: auto; }
    .result { display: flex; justify-content: center; align-items: baseline; gap: 10px;
      padding: 14px; border-radius: 10px; background: var(--accent-10); border: 2px solid var(--accent);
      font-family: 'JetBrains Mono', monospace; }
    .rl { font-size: 13px; color: var(--text-muted); }
    .rv { font-size: 22px; font-weight: 700; color: var(--accent); }
  `,
})
export class StepFlux3dComponent implements AfterViewInit, OnDestroy {
  readonly fields = FIELDS_3D;
  readonly surfaces = SURFACES;
  readonly fieldSel = signal(0);
  readonly surfSel = signal(1);
  readonly autoRotate = signal(true);

  readonly flux = computed(() => fluxIntegral(FIELDS_3D[this.fieldSel()].F, SURFACES[this.surfSel()]));

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild<ElementRef<HTMLDivElement>>('wrap');
  private scene!: Scene; private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer; private controls!: OrbitControls;
  private animationId = 0; private dynamicGroup!: Group;
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => { this.fieldSel(); this.surfSel(); if (this.scene) this.rebuild(); });
    effect(() => { if (this.controls) this.controls.autoRotate = this.autoRotate(); });
  }

  ngAfterViewInit(): void { this.initScene(); this.rebuild(); this.animate(); }
  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId); this.controls?.dispose(); this.resizeObserver?.disconnect();
    this.scene?.traverse(o => { if (o instanceof Mesh || o instanceof LineSegments) { o.geometry.dispose(); const m = o.material; if (Array.isArray(m)) m.forEach(x => x.dispose()); else m.dispose(); } });
    this.renderer?.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement, wrap = this.wrapRef()?.nativeElement;
    if (!canvas || !wrap) return;
    this.scene = new Scene(); this.scene.background = null;
    this.camera = new PerspectiveCamera(40, 1, 0.1, 100); this.camera.position.set(2.5, 2, 2.5);
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); this.resizeRenderer();
    this.scene.add(new AmbientLight(0xffffff, 0.7));
    const dl = new DirectionalLight(0xffffff, 1.2); dl.position.set(4, 6, 4); this.scene.add(dl);
    this.dynamicGroup = new Group(); this.scene.add(this.dynamicGroup);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true; this.controls.autoRotate = true; this.controls.autoRotateSpeed = 1;
    this.resizeObserver = new ResizeObserver(() => this.resizeRenderer()); this.resizeObserver.observe(wrap);
  }

  private resizeRenderer(): void {
    const wrap = this.wrapRef()?.nativeElement; if (!wrap || !this.renderer) return;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  private rebuild(): void {
    while (this.dynamicGroup.children.length) {
      const c = this.dynamicGroup.children[0]; this.dynamicGroup.remove(c);
      if (c instanceof Mesh || c instanceof LineSegments) { c.geometry.dispose(); const m = c.material; if (Array.isArray(m)) m.forEach(x => x.dispose()); else m.dispose(); }
      if (c instanceof ArrowHelper) { c.dispose(); }
    }
    const S = SURFACES[this.surfSel()], F = FIELDS_3D[this.fieldSel()].F;
    const N = 40;
    const [u0, u1] = S.uRange, [v0, v1] = S.vRange;
    const du = (u1 - u0) / N, dv = (v1 - v0) / N;

    // Surface mesh
    const verts: number[] = [], idx: number[] = [];
    for (let j = 0; j <= N; j++) { const v = v0 + j * dv; for (let i = 0; i <= N; i++) { const u = u0 + i * du; verts.push(...S.r(u, v)); } }
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i; idx.push(a, a + 1, a + N + 1); idx.push(a + 1, a + N + 2, a + N + 1); }
    const geo = new BufferGeometry(); geo.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3)); geo.setIndex(idx); geo.computeVertexNormals();
    this.dynamicGroup.add(new Mesh(geo, new MeshStandardMaterial({ color: 0x6e9abf, transparent: true, opacity: 0.4, side: DoubleSide })));

    // Normal + field arrows at sample points
    const arrowN = 6;
    for (let j = 0; j < arrowN; j++) {
      const v = v0 + (j + 0.5) * (v1 - v0) / arrowN;
      for (let i = 0; i < arrowN; i++) {
        const u = u0 + (i + 0.5) * (u1 - u0) / arrowN;
        const [x, y, z] = S.r(u, v);
        const n = surfaceNormal(S, u, v);
        const nLen = vecLen(n);
        if (nLen < 1e-6) continue;
        const origin = new Vector3(x, y, z);
        // Normal arrow (blue)
        const nDir = new Vector3(n[0] / nLen, n[1] / nLen, n[2] / nLen);
        this.dynamicGroup.add(new ArrowHelper(nDir, origin, 0.25, 0x6e9abf, 0.06, 0.04));
        // Field arrow (orange)
        const fv = F(x, y, z);
        const fLen = Math.sqrt(fv[0] * fv[0] + fv[1] * fv[1] + fv[2] * fv[2]);
        if (fLen > 1e-6) {
          const fDir = new Vector3(fv[0] / fLen, fv[1] / fLen, fv[2] / fLen);
          this.dynamicGroup.add(new ArrowHelper(fDir, origin, Math.min(0.4, fLen * 0.2), 0xbf8a5a, 0.06, 0.04));
        }
      }
    }
  }

  private animate = (): void => { this.animationId = requestAnimationFrame(this.animate); this.controls?.update(); this.renderer?.render(this.scene, this.camera); };
  resetView(): void { this.camera.position.set(2.5, 2, 2.5); this.controls.target.set(0, 0, 0); this.controls.update(); }
}
