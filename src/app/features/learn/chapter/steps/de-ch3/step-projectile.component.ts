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

const G = 9.8;
const COL_BG = 0x141418;

/**
 * Simulate projectile with linear drag: dv/dt = -g j - k·v
 * Returns trajectory points (x, y) sampled at dt.
 */
function simulate(
  v0: number,
  angleDeg: number,
  k: number,
  dt = 0.02,
  maxSteps = 1500,
): Array<[number, number]> {
  const angle = (angleDeg * Math.PI) / 180;
  let vx = v0 * Math.cos(angle);
  let vy = v0 * Math.sin(angle);
  let x = 0;
  let y = 0;
  const pts: Array<[number, number]> = [[x, y]];
  for (let i = 0; i < maxSteps; i++) {
    // RK4 on (x, y, vx, vy)
    const f = (_x: number, _y: number, vx: number, vy: number) => {
      const speed = Math.sqrt(vx * vx + vy * vy);
      return {
        dx: vx,
        dy: vy,
        dvx: -k * vx,
        dvy: -G - k * vy,
      };
    };
    const a = f(x, y, vx, vy);
    const b = f(x + (dt / 2) * a.dx, y + (dt / 2) * a.dy, vx + (dt / 2) * a.dvx, vy + (dt / 2) * a.dvy);
    const c = f(x + (dt / 2) * b.dx, y + (dt / 2) * b.dy, vx + (dt / 2) * b.dvx, vy + (dt / 2) * b.dvy);
    const d = f(x + dt * c.dx, y + dt * c.dy, vx + dt * c.dvx, vy + dt * c.dvy);
    x = x + (dt / 6) * (a.dx + 2 * b.dx + 2 * c.dx + d.dx);
    y = y + (dt / 6) * (a.dy + 2 * b.dy + 2 * c.dy + d.dy);
    vx = vx + (dt / 6) * (a.dvx + 2 * b.dvx + 2 * c.dvx + d.dvx);
    vy = vy + (dt / 6) * (a.dvy + 2 * b.dvy + 2 * c.dvy + d.dvy);
    if (y < 0) {
      // linear interpolate landing point with previous
      const prev = pts[pts.length - 1];
      const frac = prev[1] / (prev[1] - y);
      const xLand = prev[0] + (x - prev[0]) * frac;
      pts.push([xLand, 0]);
      break;
    }
    pts.push([x, y]);
  }
  return pts;
}

function trajectoryRange(pts: Array<[number, number]>): number {
  return pts[pts.length - 1][0];
}

function maxHeight(pts: Array<[number, number]>): number {
  return pts.reduce((m, p) => Math.max(m, p[1]), 0);
}

function flightTime(pts: Array<[number, number]>, dt = 0.02): number {
  return pts.length * dt;
}

@Component({
  selector: 'app-de-ch3-projectile',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="彈道與阻力" subtitle="§3.5">
      <p>
        丟出一顆球，忽略空氣——牛頓運動定律給你一個優美的拋物線，45° 時射程最遠。
        但<strong>真實世界有空氣</strong>：阻力讓彈道不再對稱，最佳發射角也不再是 45°。
      </p>
      <p>
        以位置 (x, y) 跟速度 (v_x, v_y) 為狀態，牛頓第二定律 + 線性阻力 <code>F = −k·v</code>：
      </p>
      <div class="centered-eq big">
        dv_x/dt = −k v_x  &nbsp;&nbsp;
        dv_y/dt = −g − k v_y
      </div>
      <p>
        這是一組<strong>耦合的一階 ODE 系統</strong>（Ch8 會正式處理系統）。
        x 方向只受阻力（沒重力），y 方向阻力 + 重力。兩個方向都是線性一階，分別可解：
      </p>
      <div class="centered-eq">
        v_x(t) = v_x(0) · e^(−kt)
      </div>
      <div class="centered-eq">
        v_y(t) = (v_y(0) + g/k) · e^(−kt) − g/k
      </div>
      <p>
        再積分一次得到位置。有阻力時最佳發射角<strong>低於 45°</strong>——因為高角度的球滯空久、阻力削得更多。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖滑鼠旋轉視角 → 兩顆球同時發射，一顆有阻力一顆沒有">
      <!-- Three.js stage -->
      <div #threeContainer class="three-stage"></div>

      <!-- Trajectories chart -->
      <div class="chart-wrap">
        <div class="chart-title">軌跡（side view）</div>
        <svg viewBox="-10 -120 380 150" class="chart-svg">
          <line x1="0" y1="20" x2="360" y2="20" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-110" x2="0" y2="30" stroke="var(--border-strong)" stroke-width="1" />
          <text x="362" y="24" class="ax">x (m)</text>
          <text x="-4" y="-112" class="ax">y</text>

          <!-- Range markers -->
          @for (k of [10, 20, 30, 40]; track k) {
            <line [attr.x1]="k * scale()" y1="17" [attr.x2]="k * scale()" y2="23"
              stroke="var(--text-muted)" stroke-width="0.8" />
            <text [attr.x]="k * scale()" y="32" class="tick">{{ k }}</text>
          }

          <!-- No drag trajectory -->
          <path [attr.d]="noDragPath()" fill="none"
            stroke="#8a9aa8" stroke-width="2" stroke-dasharray="5 3" />
          <!-- Drag trajectory -->
          <path [attr.d]="dragPath()" fill="none"
            stroke="var(--accent)" stroke-width="2.2" />

          <!-- Current position markers -->
          @if (currentNoDragPos(); as p) {
            <circle [attr.cx]="p.x * scale()" [attr.cy]="20 - p.y * scale()"
              r="4" fill="#8a9aa8" stroke="white" stroke-width="1.5" />
          }
          @if (currentDragPos(); as p) {
            <circle [attr.cx]="p.x * scale()" [attr.cy]="20 - p.y * scale()"
              r="4" fill="var(--accent)" stroke="white" stroke-width="1.5" />
          }

          <!-- Legend -->
          <rect x="270" y="-108" width="94" height="32" fill="var(--bg-surface)"
            stroke="var(--border)" rx="3" />
          <line x1="274" y1="-100" x2="290" y2="-100"
            stroke="#8a9aa8" stroke-width="2" stroke-dasharray="4 2" />
          <text x="294" y="-97" class="leg">無阻力</text>
          <line x1="274" y1="-86" x2="290" y2="-86"
            stroke="var(--accent)" stroke-width="2" />
          <text x="294" y="-83" class="leg">有阻力</text>
        </svg>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 發射' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <button class="reset-btn" (click)="resetCamera()">↻ 視角</button>
        </div>

        <div class="sl">
          <span class="sl-lab">發射角 θ</span>
          <input type="range" min="10" max="85" step="1"
            [value]="angle()" (input)="onAngle($event)" />
          <span class="sl-val">{{ angle() }}°</span>
        </div>

        <div class="sl">
          <span class="sl-lab">初速 v₀</span>
          <input type="range" min="10" max="30" step="0.5"
            [value]="v0()" (input)="onV0($event)" />
          <span class="sl-val">{{ v0().toFixed(1) }} m/s</span>
        </div>

        <div class="sl">
          <span class="sl-lab">阻力 k</span>
          <input type="range" min="0" max="0.6" step="0.01"
            [value]="k()" (input)="onK($event)" />
          <span class="sl-val">{{ k().toFixed(2) }} 1/s</span>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">有阻力射程</span>
            <strong>{{ dragRange().toFixed(1) }} m</strong>
          </div>
          <div class="ro">
            <span class="ro-k">無阻力射程</span>
            <strong style="color: #8a9aa8">{{ noDragRange().toFixed(1) }} m</strong>
          </div>
          <div class="ro">
            <span class="ro-k">有阻力最高</span>
            <strong>{{ dragApex().toFixed(2) }} m</strong>
          </div>
          <div class="ro">
            <span class="ro-k">最佳發射角（數值）</span>
            <strong>{{ optimalAngle().toFixed(1) }}°</strong>
          </div>
        </div>

        <div class="insight-line">
          @if (k() < 0.01) {
            ✓ 沒阻力，最佳 45°（純數學的拋物線）。
          } @else if (k() < 0.15) {
            ⚠ 輕微阻力，最佳角略低於 45°。射程縮減有限。
          } @else if (k() < 0.35) {
            ⚠ 中度阻力（像中度強的球類運動），最佳角顯著低於 45°。
          } @else {
            ✗ 強阻力（像水中或重空氣），最佳角遠低於 45°——要低平射才有射程。
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        幾個洞察：
      </p>
      <ul>
        <li><strong>阻力破壞對稱</strong>。沒阻力時上行下行鏡像對稱；有阻力時下行段的 x 速度已衰退，落點在拋物線落點之前。</li>
        <li><strong>最佳角 &lt; 45°</strong>。滑桿調大阻力，最佳角會從 45° 降到 30°、甚至更低（砲彈遠射常用約 35°–40°）。</li>
        <li><strong>終端速度再現身</strong>。阻力系統中 y 方向會趨近 −g/k（垂直向下的終端速度）——這就是 §1.7 自由落體的連結。</li>
      </ul>
      <p>
        真實空氣阻力其實是二次的（F ∝ v²），不是我們用的線性。線性阻力是個好起點——它有封閉解，還算合理逼近低速情況。
        二次阻力要用 Ch4 的數值方法才方便處理。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        真實的彈道從來不是書本的完美拋物線。
        加入一個 <code>−k v</code> 的阻力項，整個數學故事就變了——最佳角、對稱性、射程全都改變。
        而這只是兩個一階 ODE 的耦合，就已經展現這麼豐富的行為。
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
    .centered-eq.big { font-size: 19px; padding: 16px; }

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
      height: 320px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border);
      margin-bottom: 14px;
      background: #141418;
    }

    .chart-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .chart-title {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .chart-svg { width: 100%; display: block; }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
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
    .play-btn:hover, .reset-btn:hover { opacity: 0.85; }

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
      min-width: 80px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 64px;
      text-align: right;
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 6px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed var(--border);
    }

    .ro {
      padding: 6px 10px;
      background: var(--bg);
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 12px;
    }

    .ro-k { color: var(--text-muted); }

    .ro strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .insight-line {
      margin-top: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      background: var(--bg);
      border: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-secondary);
    }
  `,
})
export class DeCh3ProjectileComponent implements OnDestroy {
  readonly angle = signal(45);
  readonly v0 = signal(20);
  readonly k = signal(0.15);
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

  private dragBallMesh: THREE.Mesh | null = null;
  private noDragBallMesh: THREE.Mesh | null = null;
  private dragTrailLine: THREE.Line | null = null;
  private noDragTrailLine: THREE.Line | null = null;

  // Precomputed trajectories
  readonly dragTraj = computed(() => simulate(this.v0(), this.angle(), this.k()));
  readonly noDragTraj = computed(() => simulate(this.v0(), this.angle(), 0));

  readonly dragRange = computed(() => trajectoryRange(this.dragTraj()));
  readonly noDragRange = computed(() => trajectoryRange(this.noDragTraj()));
  readonly dragApex = computed(() => maxHeight(this.dragTraj()));
  readonly flightTimeDrag = computed(() => flightTime(this.dragTraj()));
  readonly flightTimeNoDrag = computed(() => flightTime(this.noDragTraj()));

  readonly scale = computed(() => {
    const maxRange = Math.max(this.noDragRange(), this.dragRange(), 20);
    return 340 / maxRange;
  });

  readonly optimalAngle = computed(() => {
    const k = this.k();
    const v0 = this.v0();
    let bestAng = 45;
    let bestRange = 0;
    for (let ang = 10; ang <= 85; ang += 0.5) {
      const r = trajectoryRange(simulate(v0, ang, k));
      if (r > bestRange) {
        bestRange = r;
        bestAng = ang;
      }
    }
    return bestAng;
  });

  readonly dragPath = computed(() => {
    const pts = this.dragTraj();
    const s = this.scale();
    return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${(x * s).toFixed(1)} ${(20 - y * s).toFixed(1)}`).join(' ');
  });

  readonly noDragPath = computed(() => {
    const pts = this.noDragTraj();
    const s = this.scale();
    return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${(x * s).toFixed(1)} ${(20 - y * s).toFixed(1)}`).join(' ');
  });

  readonly currentDragPos = computed(() => {
    const pts = this.dragTraj();
    const tTotal = this.flightTimeDrag();
    const tt = Math.min(this.t(), tTotal);
    const idx = Math.min(pts.length - 1, Math.floor((tt / 0.02)));
    const p = pts[idx];
    return { x: p[0], y: p[1] };
  });

  readonly currentNoDragPos = computed(() => {
    const pts = this.noDragTraj();
    const tTotal = this.flightTimeNoDrag();
    const tt = Math.min(this.t(), tTotal);
    const idx = Math.min(pts.length - 1, Math.floor(tt / 0.02));
    const p = pts[idx];
    return { x: p[0], y: p[1] };
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
    const tMax = Math.max(this.flightTimeDrag(), this.flightTimeNoDrag());
    if (this.t() >= tMax - 0.05) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  onAngle(ev: Event): void {
    this.angle.set(+(ev.target as HTMLInputElement).value);
    this.t.set(0);
    this.rebuildTrails();
  }

  onV0(ev: Event): void {
    this.v0.set(+(ev.target as HTMLInputElement).value);
    this.t.set(0);
    this.rebuildTrails();
  }

  onK(ev: Event): void {
    this.k.set(+(ev.target as HTMLInputElement).value);
    this.t.set(0);
    this.rebuildTrails();
  }

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(-8, 6, 18);
    this.controls.target.set(15, 2, 0);
    this.controls.update();
  }

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight || 320;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COL_BG);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);
    this.camera.position.set(-8, 6, 18);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(15, 2, 0);
    this.controls.minDistance = 5;
    this.controls.maxDistance = 80;
    this.controls.update();

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffeedd, 0.7);
    dir.position.set(10, 20, 15);
    this.scene.add(dir);
    const fill = new THREE.DirectionalLight(0xaaccee, 0.3);
    fill.position.set(-5, 10, -10);
    this.scene.add(fill);

    // Ground plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 40),
      new THREE.MeshStandardMaterial({
        color: 0x3a4a3a,
        roughness: 0.9,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.position.x = 30;
    this.scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(80, 40, 0x4a5a4a, 0x2a3a2a);
    grid.position.x = 30;
    this.scene.add(grid);

    // Distance markers every 10m
    for (let d = 10; d <= 60; d += 10) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 2, 8),
        new THREE.MeshStandardMaterial({ color: 0xccaa66 }),
      );
      pole.position.set(d, 1, -5);
      this.scene.add(pole);
    }

    // Launch pad
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.7, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x666666 }),
    );
    pad.position.y = 0.1;
    this.scene.add(pad);

    // Drag ball
    this.dragBallMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0xc87b5e, roughness: 0.35 }),
    );
    this.scene.add(this.dragBallMesh);

    // No-drag ball
    this.noDragBallMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0x8a9aa8, roughness: 0.35 }),
    );
    this.scene.add(this.noDragBallMesh);

    // Build initial trails
    this.rebuildTrails();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    const animate = (now: number) => {
      this.animId = requestAnimationFrame(animate);
      const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.06, (now - this.lastFrame) / 1000);
      this.lastFrame = now;

      if (this.playing()) {
        const tMax = Math.max(this.flightTimeDrag(), this.flightTimeNoDrag());
        const newT = this.t() + dt * 1.0;
        if (newT >= tMax) {
          this.t.set(tMax);
          this.playing.set(false);
        } else {
          this.t.set(newT);
        }
      }

      // Update ball positions
      const dpos = this.currentDragPos();
      const npos = this.currentNoDragPos();
      if (this.dragBallMesh) this.dragBallMesh.position.set(dpos.x, dpos.y + 0.35, 0);
      if (this.noDragBallMesh) this.noDragBallMesh.position.set(npos.x, npos.y + 0.35, 0.6);

      this.controls!.update();
      this.renderer!.render(this.scene!, this.camera!);
    };
    this.animId = requestAnimationFrame(animate);
  }

  private rebuildTrails(): void {
    if (!this.scene) return;

    // Remove old trails
    if (this.dragTrailLine) {
      this.scene.remove(this.dragTrailLine);
      this.dragTrailLine.geometry.dispose();
    }
    if (this.noDragTrailLine) {
      this.scene.remove(this.noDragTrailLine);
      this.noDragTrailLine.geometry.dispose();
    }

    // Drag trail
    const dragPts = this.dragTraj();
    const dragGeom = new THREE.BufferGeometry().setFromPoints(
      dragPts.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    );
    const dragMat = new THREE.LineBasicMaterial({ color: 0xc87b5e, linewidth: 2 });
    this.dragTrailLine = new THREE.Line(dragGeom, dragMat);
    this.scene.add(this.dragTrailLine);

    // No drag trail
    const noDragPts = this.noDragTraj();
    const noDragGeom = new THREE.BufferGeometry().setFromPoints(
      noDragPts.map(([x, y]) => new THREE.Vector3(x, y, 0.6)),
    );
    const noDragMat = new THREE.LineDashedMaterial({
      color: 0x8a9aa8,
      dashSize: 0.4,
      gapSize: 0.25,
    });
    this.noDragTrailLine = new THREE.Line(noDragGeom, noDragMat);
    this.noDragTrailLine.computeLineDistances();
    this.scene.add(this.noDragTrailLine);
  }

  private onResize(): void {
    const c = this.containerRef()?.nativeElement;
    if (!c || !this.renderer || !this.camera) return;
    const w = c.clientWidth;
    const h = c.clientHeight || 320;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}
