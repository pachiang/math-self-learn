import {
  Component,
  OnDestroy,
  afterNextRender,
  ElementRef,
  viewChild,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const M = 1;
const K = 4;
const COL_BG = 0x141418;

function solve(c: number, t: number, y0: number, v0: number): { y: number; v: number } {
  const disc = c * c - 4 * M * K;
  if (Math.abs(disc) < 1e-6) {
    const r = -c / (2 * M);
    const C1 = y0;
    const C2 = v0 - r * y0;
    const exp = Math.exp(r * t);
    const y = (C1 + C2 * t) * exp;
    const v = C2 * exp + (C1 + C2 * t) * r * exp;
    return { y, v };
  } else if (disc > 0) {
    const s = Math.sqrt(disc);
    const r1 = (-c - s) / (2 * M);
    const r2 = (-c + s) / (2 * M);
    const C1 = (y0 * r2 - v0) / (r2 - r1);
    const C2 = y0 - C1;
    return {
      y: C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t),
      v: C1 * r1 * Math.exp(r1 * t) + C2 * r2 * Math.exp(r2 * t),
    };
  } else {
    const alpha = -c / (2 * M);
    const beta = Math.sqrt(-disc) / (2 * M);
    const C1 = y0;
    const C2 = (v0 - alpha * y0) / beta;
    const eAt = Math.exp(alpha * t);
    const cos = Math.cos(beta * t);
    const sin = Math.sin(beta * t);
    return {
      y: eAt * (C1 * cos + C2 * sin),
      v: eAt * (alpha * (C1 * cos + C2 * sin) + beta * (-C1 * sin + C2 * cos)),
    };
  }
}

const PX_PER_Y = 40;
const PX_PER_V = 20;

@Component({
  selector: 'app-de-ch5-phase',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="相平面：狀態空間視角" subtitle="§5.6">
      <p>
        到目前我們都把 y(t) 畫在<strong>時間軸</strong>上——橫軸 t、縱軸位置。但還有另一個視角：
      </p>
      <p class="key-idea">
        把<strong>位置 y 跟速度 v = y′</strong>當兩個座標畫在 2D 平面上。
        這個平面叫<strong>相平面</strong>（phase plane），上面的軌跡展示了「狀態如何演化」。
      </p>
      <p>
        為什麼要這樣看？因為二階 ODE <code>m·y″ + c·y′ + k·y = 0</code> 可以改寫成<strong>兩個一階 ODE 的系統</strong>：
      </p>
      <div class="centered-eq big">
        dy/dt = v<br>
        dv/dt = −(k·y + c·v) / m
      </div>
      <p>
        狀態是 (y, v) 這個二維向量，演化軌跡就是相平面上的一條曲線。
        不同阻尼給出不同形狀的軌跡：
      </p>
      <ul>
        <li><strong>無阻尼</strong>：能量守恆 → 軌跡是<strong>橢圓</strong>（繞原點）</li>
        <li><strong>欠阻尼</strong>：能量衰退 → 軌跡是<strong>螺旋</strong>（向原點內旋）</li>
        <li><strong>臨界／過阻尼</strong>：軌跡<strong>直接趨近原點</strong>（無螺旋）</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="2D 相平面 + 3D (t, y, v) 螺旋：看同一件事的兩種視角">
      <!-- 3D trajectory in (t, y, v) space -->
      <div #threeContainer class="three-stage"></div>

      <div class="chart-grid">
        <!-- 2D phase portrait -->
        <div class="chart-col">
          <div class="chart-head">2D 相平面（橫軸 y、縱軸 v）</div>
          <svg viewBox="-100 -100 200 200" class="pp-svg">
            <!-- Grid -->
            @for (g of [-3, -2, -1, 1, 2, 3]; track g) {
              <line [attr.x1]="g * 25" y1="-90" [attr.x2]="g * 25" y2="90"
                stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
              <line x1="-90" [attr.y1]="-g * 25" x2="90" [attr.y2]="-g * 25"
                stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            }

            <!-- Axes -->
            <line x1="-90" y1="0" x2="90" y2="0"
              stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-90" x2="0" y2="90"
              stroke="var(--border-strong)" stroke-width="1" />
            <text x="94" y="3" class="ax">y</text>
            <text x="3" y="-94" class="ax">v</text>

            <!-- Vector field (arrows showing dy/dt, dv/dt) -->
            @for (a of phaseArrows(); track a.k) {
              <line [attr.x1]="a.x1" [attr.y1]="a.y1"
                [attr.x2]="a.x2" [attr.y2]="a.y2"
                stroke="var(--text-muted)" stroke-width="0.8"
                stroke-linecap="round" opacity="0.5" />
            }

            <!-- Trajectory from initial condition -->
            <path [attr.d]="phaseTrajPath()" fill="none"
              stroke="var(--accent)" stroke-width="2" />

            <!-- Current (y, v) -->
            <circle [attr.cx]="currentState().y * 25"
              [attr.cy]="-currentState().v * 12"
              r="5" fill="var(--accent)" stroke="white" stroke-width="1.5" />

            <!-- Origin (equilibrium) -->
            <circle cx="0" cy="0" r="3"
              fill="#5ca878" stroke="white" stroke-width="1" />
          </svg>
        </div>

        <!-- y(t) and v(t) -->
        <div class="chart-col">
          <div class="chart-head">時域：y(t)、v(t)</div>
          <svg viewBox="-10 -100 280 180" class="ts-svg">
            <line x1="0" y1="0" x2="260" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-90" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="1" />
            <text x="264" y="4" class="ax">t</text>

            @for (g of [-2, -1, 1, 2]; track g) {
              <line x1="0" [attr.y1]="-g * 25" x2="260" [attr.y2]="-g * 25"
                stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
            }

            <!-- y(t) -->
            <path [attr.d]="yTimePath()" fill="none"
              stroke="#c87b5e" stroke-width="1.8" />
            <!-- v(t) -->
            <path [attr.d]="vTimePath()" fill="none"
              stroke="#5a8aa8" stroke-width="1.8" />

            <!-- Playhead -->
            <line [attr.x1]="t() * 26" y1="-90" [attr.x2]="t() * 26" y2="70"
              stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.4" />
            <circle [attr.cx]="t() * 26" [attr.cy]="-currentState().y * 25" r="3.5"
              fill="#c87b5e" stroke="white" stroke-width="1" />
            <circle [attr.cx]="t() * 26" [attr.cy]="-currentState().v * 25" r="3.5"
              fill="#5a8aa8" stroke="white" stroke-width="1" />

            <!-- Legend -->
            <rect x="180" y="-96" width="76" height="28" fill="var(--bg-surface)"
              stroke="var(--border)" rx="3" />
            <line x1="184" y1="-88" x2="196" y2="-88"
              stroke="#c87b5e" stroke-width="2" />
            <text x="200" y="-85" class="leg">y(t)</text>
            <line x1="184" y1="-76" x2="196" y2="-76"
              stroke="#5a8aa8" stroke-width="2" />
            <text x="200" y="-73" class="leg">v(t)</text>
          </svg>
        </div>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <button class="reset-btn" (click)="resetCamera()">↻ 3D 視角</button>
        </div>

        <div class="sl">
          <span class="sl-lab">阻尼 c</span>
          <input type="range" min="0" max="4" step="0.02"
            [value]="c()" (input)="c.set(+$any($event).target.value)" />
          <span class="sl-val">{{ c().toFixed(2) }}</span>
        </div>

        <div class="presets">
          <button class="pre" (click)="c.set(0)">c=0 橢圓</button>
          <button class="pre" (click)="c.set(0.3)">c=0.3 螺旋</button>
          <button class="pre" (click)="c.set(1)">c=1</button>
          <button class="pre" (click)="c.set(4)">c=4 臨界</button>
        </div>

        <div class="sl">
          <span class="sl-lab">y(0)</span>
          <input type="range" min="-2" max="2" step="0.05"
            [value]="y0()" (input)="y0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ y0().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">v(0)</span>
          <input type="range" min="-4" max="4" step="0.05"
            [value]="v0()" (input)="v0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ v0().toFixed(2) }}</span>
        </div>

        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" max="10" step="0.02"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這個視角的好處：
      </p>
      <ul>
        <li><strong>不需要知道 y(t) 的公式</strong>就能看出系統走向。原點是「吸引子」（有阻尼）或「中心」（無阻尼）。</li>
        <li><strong>幾何形狀暴露物理</strong>：能量守恆 ↔ 閉合軌跡；能量耗散 ↔ 向原點的螺旋／直線。</li>
        <li><strong>可推廣到 n 維</strong>：狀態可以是 n 個變數；相空間就是 n 維。高維動力系統（多擺、多自由度系統）都用這套語言。</li>
      </ul>
      <p>
        3D 視圖把時間加進來——你看到的是 <strong>(t, y, v)</strong> 空間的螺旋。
        投影到 (y, v) 就是 2D 相平面；投影到 (t, y) 就是普通的時間序列。
        <strong>同一條曲線，不同視角看。</strong>
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        相平面讓二階 ODE 變成 2D 平面上的「流」。這個語言是 Part III（Ch8）處理非線性系統的主力工具——
        但你在 Ch5 就已經學會了閱讀它，只是從一個特殊情況（線性、有限自由度）開始。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 17px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 18px; padding: 16px; line-height: 1.6; }

    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }

    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .three-stage {
      width: 100%;
      height: 340px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border);
      margin-bottom: 14px;
      background: #141418;
    }

    .chart-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 10px;
      margin-bottom: 14px;
    }

    @media (max-width: 640px) {
      .chart-grid { grid-template-columns: 1fr; }
    }

    .chart-col {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .chart-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }

    .pp-svg, .ts-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .leg {
      font-size: 10px;
      fill: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .play-btn, .reset-btn {
      font: inherit;
      font-size: 13px;
      padding: 6px 14px;
      border: 1.5px solid var(--accent);
      background: var(--accent);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .reset-btn { background: transparent; color: var(--accent); }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 60px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 52px;
      text-align: right;
    }

    .presets {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .pre {
      font: inherit;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 5px 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      border-radius: 14px;
      cursor: pointer;
      color: var(--text-muted);
    }

    .pre:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
  `,
})
export class DeCh5PhaseComponent implements OnDestroy {
  readonly c = signal(0.3);
  readonly y0 = signal(1.5);
  readonly v0 = signal(0);
  readonly t = signal(0);
  readonly playing = signal(false);

  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animId = 0;
  private lastFrame = 0;
  private resizeObserver: ResizeObserver | null = null;

  private trajectoryLine: THREE.Line | null = null;
  private dot: THREE.Mesh | null = null;
  private yProjLine: THREE.Line | null = null;
  private vProjLine: THREE.Line | null = null;

  readonly currentState = computed(() =>
    solve(this.c(), this.t(), this.y0(), this.v0())
  );

  readonly phaseTrajPath = computed(() => {
    const pts: string[] = [];
    const n = 300;
    const tMax = 10;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * tMax;
      const { y, v } = solve(this.c(), tt, this.y0(), this.v0());
      const yc = Math.max(-3.5, Math.min(3.5, y));
      const vc = Math.max(-7, Math.min(7, v));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(yc * 25).toFixed(1)} ${(-vc * 12).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly yTimePath = computed(() => this.timePath('y'));
  readonly vTimePath = computed(() => this.timePath('v'));

  private timePath(kind: 'y' | 'v'): string {
    const pts: string[] = [];
    const n = 200;
    const tMax = 10;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * tMax;
      const s = solve(this.c(), tt, this.y0(), this.v0());
      const val = kind === 'y' ? s.y : s.v;
      const clamp = Math.max(-3, Math.min(3, val));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * 26).toFixed(1)} ${(-clamp * 25).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  readonly phaseArrows = computed(() => {
    const c = this.c();
    const out: { k: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = -3; i <= 3; i++) {
      for (let j = -6; j <= 6; j += 2) {
        const y = i;
        const v = j;
        // dy/dt = v, dv/dt = -(k y + c v) / m
        const dy = v;
        const dv = -(K * y + c * v) / M;
        const cx = y * 25;
        const cy = -v * 12;
        const len = Math.sqrt(dy * dy * 25 * 25 + dv * dv * 12 * 12);
        if (len < 1e-6) continue;
        const sx = (dy * 25) / len * 5;
        const sy = -(dv * 12) / len * 5;
        out.push({
          k: `${i}_${j}`,
          x1: cx - sx, y1: cy - sy,
          x2: cx + sx, y2: cy + sy,
        });
      }
    }
    return out;
  });

  constructor() {
    afterNextRender(() => this.initThree());
  }

  ngOnDestroy(): void {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.renderer) {
      this.renderer.dispose();
      const canvas = this.renderer.domElement;
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
    }
  }

  togglePlay(): void {
    if (this.t() >= 9.95) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(6, 4, 8);
    this.controls.target.set(3, 0, 0);
    this.controls.update();
  }

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight || 340;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COL_BG);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(6, 4, 8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 30;
    this.controls.target.set(3, 0, 0);
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffeedd, 0.5);
    dir.position.set(4, 6, 3);
    this.scene.add(dir);

    // Axes (t is x in three.js, y is y-axis, v is z)
    const tAxis = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 10, 0xffffff, 0.2, 0.1,
    );
    this.scene.add(tAxis);
    const yAxis = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 3, 0xc87b5e, 0.2, 0.1,
    );
    this.scene.add(yAxis);
    const vAxis = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 3, 0x5a8aa8, 0.2, 0.1,
    );
    this.scene.add(vAxis);

    // Axis labels via sprites
    this.addLabel('t', 10.5, 0, 0, '#aaaaaa');
    this.addLabel('y', 0, 3.3, 0, '#c87b5e');
    this.addLabel('v', 0, 0, 3.3, '#5a8aa8');

    // (y, v) plane indicator at t=0 (wireframe plane)
    const planeGeom = new THREE.PlaneGeometry(5, 7);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeom, planeMat);
    plane.rotation.y = Math.PI / 2;
    plane.position.x = 0;
    this.scene.add(plane);

    // Current dot
    this.dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xc87b5e, roughness: 0.3 }),
    );
    this.scene.add(this.dot);

    this.rebuildTrajectory();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    const animate = (now: number) => {
      this.animId = requestAnimationFrame(animate);
      const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.06, (now - this.lastFrame) / 1000);
      this.lastFrame = now;

      if (this.playing()) {
        const newT = this.t() + dt * 1.2;
        if (newT >= 10) this.t.set(10);
        else this.t.set(newT);
      }

      if (this.dot) {
        const { y, v } = this.currentState();
        this.dot.position.set(this.t(), y, v);
      }

      // Only rebuild trajectory if params changed (simple: every frame, cheap enough for 200 pts)
      this.rebuildTrajectory();

      this.controls!.update();
      this.renderer!.render(this.scene!, this.camera!);
    };
    this.animId = requestAnimationFrame(animate);
  }

  private lastTrajKey = '';
  private rebuildTrajectory(): void {
    if (!this.scene) return;
    const key = `${this.c()}_${this.y0()}_${this.v0()}`;
    if (key === this.lastTrajKey) return;
    this.lastTrajKey = key;

    // Remove old
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine);
      this.trajectoryLine.geometry.dispose();
    }
    if (this.yProjLine) {
      this.scene.remove(this.yProjLine);
      this.yProjLine.geometry.dispose();
    }
    if (this.vProjLine) {
      this.scene.remove(this.vProjLine);
      this.vProjLine.geometry.dispose();
    }

    const n = 300;
    const tMax = 10;
    const trajPts: THREE.Vector3[] = [];
    const yProjPts: THREE.Vector3[] = [];
    const vProjPts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * tMax;
      const { y, v } = solve(this.c(), tt, this.y0(), this.v0());
      trajPts.push(new THREE.Vector3(tt, y, v));
      yProjPts.push(new THREE.Vector3(tt, y, -3));      // y(t) shadow on v=-3 plane
      vProjPts.push(new THREE.Vector3(tt, -3, v));      // v(t) shadow on y=-3 plane
    }

    const trajGeom = new THREE.BufferGeometry().setFromPoints(trajPts);
    const trajMat = new THREE.LineBasicMaterial({ color: 0xb58ac0 });
    this.trajectoryLine = new THREE.Line(trajGeom, trajMat);
    this.scene.add(this.trajectoryLine);

    const yProjGeom = new THREE.BufferGeometry().setFromPoints(yProjPts);
    const yProjMat = new THREE.LineBasicMaterial({ color: 0xc87b5e, transparent: true, opacity: 0.5 });
    this.yProjLine = new THREE.Line(yProjGeom, yProjMat);
    this.scene.add(this.yProjLine);

    const vProjGeom = new THREE.BufferGeometry().setFromPoints(vProjPts);
    const vProjMat = new THREE.LineBasicMaterial({ color: 0x5a8aa8, transparent: true, opacity: 0.5 });
    this.vProjLine = new THREE.Line(vProjGeom, vProjMat);
    this.scene.add(this.vProjLine);
  }

  private addLabel(text: string, x: number, y: number, z: number, color: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 36);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.set(0.5, 0.5, 0.5);
    this.scene!.add(sprite);
  }

  private onResize(): void {
    const c = this.containerRef()?.nativeElement;
    if (!c || !this.renderer || !this.camera) return;
    const w = c.clientWidth;
    const h = c.clientHeight || 340;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}
