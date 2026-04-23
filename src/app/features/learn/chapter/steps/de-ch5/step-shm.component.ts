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

const COL_BG = 0x141418;

@Component({
  selector: 'app-de-ch5-shm',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="簡諧振動（無阻尼）" subtitle="§5.3">
      <p>
        最純淨的二階 ODE——<strong>沒有阻尼、沒有外力</strong>的彈簧：
      </p>
      <div class="centered-eq big">m·y″ + k·y = 0</div>
      <p>
        整理成標準形式：
      </p>
      <div class="centered-eq">y″ + ω² · y = 0，&nbsp;&nbsp;其中 ω = √(k/m)</div>
      <p>
        特徵方程 r² + ω² = 0 的根是 <strong>±iω</strong>（純虛根），對應解：
      </p>
      <div class="centered-eq big">y(t) = A cos(ωt) + B sin(ωt)</div>
      <p class="key-idea">
        三個重要量：
      </p>
      <ul>
        <li><strong>角頻率 ω = √(k/m)</strong>：決定振盪快慢（rad/s）</li>
        <li><strong>週期 T = 2π/ω</strong>：一個完整振盪的時間</li>
        <li><strong>頻率 f = 1/T = ω/2π</strong>：每秒振盪幾次（Hz）</li>
      </ul>
      <p>
        注意一件奇妙的事：<strong>ω 只由彈簧硬度 k 跟質量 m 決定</strong>——
        跟振幅、初位置、初速度完全無關。拉得再開，彈簧的「節拍」還是一樣。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="3D 彈簧—質量系統：拉動滑桿、看振盪動畫">
      <div #threeContainer class="three-stage"></div>

      <!-- y(t) chart -->
      <div class="chart-wrap">
        <div class="chart-title">位移 y(t) = A cos(ωt) + B sin(ωt)</div>
        <svg viewBox="-10 -70 360 130" class="chart-svg">
          <line x1="0" y1="0" x2="340" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-60" x2="0" y2="60" stroke="var(--border-strong)" stroke-width="1" />
          <text x="344" y="4" class="ax">t</text>
          <text x="-4" y="-62" class="ax">y</text>

          <!-- Period markers -->
          @for (n of [1, 2, 3, 4]; track n) {
            <line [attr.x1]="n * period() * 30" y1="-60"
              [attr.x2]="n * period() * 30" y2="60"
              stroke="var(--text-muted)" stroke-width="0.6" stroke-dasharray="3 2" opacity="0.4" />
            <text [attr.x]="n * period() * 30" y="-62" class="tick" text-anchor="middle">
              T × {{ n }}
            </text>
          }

          <!-- Amplitude envelope -->
          <line x1="0" [attr.y1]="-amplitude() * 40" x2="340" [attr.y2]="-amplitude() * 40"
            stroke="#8b6aa8" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.6" />
          <line x1="0" [attr.y1]="amplitude() * 40" x2="340" [attr.y2]="amplitude() * 40"
            stroke="#8b6aa8" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.6" />
          <text x="336" [attr.y]="-amplitude() * 40 - 3" class="env-lab" text-anchor="end">
            振幅 A = {{ amplitude().toFixed(2) }}
          </text>

          <!-- Solution curve -->
          <path [attr.d]="curvePath()" fill="none"
            stroke="var(--accent)" stroke-width="2" />

          <!-- Playhead -->
          <line [attr.x1]="t() * 30" y1="-60" [attr.x2]="t() * 30" y2="60"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.6" />
          <circle [attr.cx]="t() * 30" [attr.cy]="-position() * 40" r="4"
            fill="var(--accent)" stroke="white" stroke-width="1.5" />
        </svg>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <button class="reset-btn" (click)="resetCamera()">↻ 視角</button>
        </div>

        <div class="sl">
          <span class="sl-lab">彈簧 k</span>
          <input type="range" min="0.5" max="8" step="0.1"
            [value]="k()" (input)="k.set(+$any($event).target.value)" />
          <span class="sl-val">{{ k().toFixed(1) }} N/m</span>
        </div>
        <div class="sl">
          <span class="sl-lab">質量 m</span>
          <input type="range" min="0.3" max="4" step="0.05"
            [value]="m()" (input)="m.set(+$any($event).target.value)" />
          <span class="sl-val">{{ m().toFixed(2) }} kg</span>
        </div>
        <div class="sl">
          <span class="sl-lab">初位置 y(0)</span>
          <input type="range" min="-1.5" max="1.5" step="0.05"
            [value]="y0()" (input)="y0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ y0().toFixed(2) }} m</span>
        </div>
        <div class="sl">
          <span class="sl-lab">初速 v(0)</span>
          <input type="range" min="-3" max="3" step="0.05"
            [value]="v0()" (input)="v0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ v0().toFixed(2) }} m/s</span>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">角頻率 ω = √(k/m)</span>
            <strong>{{ omega().toFixed(3) }} rad/s</strong>
          </div>
          <div class="ro">
            <span class="ro-k">週期 T = 2π/ω</span>
            <strong>{{ period().toFixed(3) }} s</strong>
          </div>
          <div class="ro">
            <span class="ro-k">振幅 A</span>
            <strong>{{ amplitude().toFixed(3) }} m</strong>
          </div>
          <div class="ro">
            <span class="ro-k">相位 φ</span>
            <strong>{{ phase().toFixed(3) }} rad</strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意幾個深刻的事實：
      </p>
      <ul>
        <li><strong>ω 跟振幅無關</strong>——這是線性振盪系統的特徵（非線性會破壞這點，例如真實的鐘擺大擺幅時週期會變長）。</li>
        <li><strong>A cos + B sin 可以重寫</strong>：A cos(ωt) + B sin(ωt) = R cos(ωt − φ)，其中 R = √(A² + B²) 是振幅，tan φ = B/A 是相位。
          換個初值只是改變 R 跟 φ，振盪的「節拍」不變。</li>
        <li><strong>能量完美守恆</strong>——沒有阻尼，動能與位能來回轉換但總和不變。§5.5 會細看這點。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        無阻尼彈簧是二階 ODE 最乾淨的樣本——<strong>純粹的週期振盪</strong>，
        頻率由物理常數決定、振幅與相位由初值決定。
        這個「頻率不變」的特性讓它成為衡量其他系統的「標準時鐘」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 18px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 22px; padding: 16px; }

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
      font-family: 'JetBrains Mono', monospace;
    }

    .env-lab {
      font-size: 10px;
      fill: #8b6aa8;
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
      min-width: 86px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 70px;
      text-align: right;
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
      font-size: 12px;
    }

    .ro-k { color: var(--text-muted); }

    .ro strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class DeCh5ShmComponent implements OnDestroy {
  readonly k = signal(2);
  readonly m = signal(1);
  readonly y0 = signal(1);
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

  private wall: THREE.Mesh | null = null;
  private mass: THREE.Mesh | null = null;
  private springLine: THREE.Line | null = null;
  private springMat: THREE.LineBasicMaterial | null = null;

  readonly omega = computed(() => Math.sqrt(this.k() / this.m()));
  readonly period = computed(() => (2 * Math.PI) / this.omega());
  readonly amplitude = computed(() => {
    const y0 = this.y0();
    const v0 = this.v0();
    const omega = this.omega();
    return Math.sqrt(y0 * y0 + (v0 / omega) * (v0 / omega));
  });
  readonly phase = computed(() => Math.atan2(this.v0() / this.omega(), this.y0()));

  readonly position = computed(() => {
    const omega = this.omega();
    return this.y0() * Math.cos(omega * this.t()) +
      (this.v0() / omega) * Math.sin(omega * this.t());
  });

  readonly velocity = computed(() => {
    const omega = this.omega();
    return -this.y0() * omega * Math.sin(omega * this.t()) +
      this.v0() * Math.cos(omega * this.t());
  });

  readonly curvePath = computed(() => {
    const omega = this.omega();
    const pts: string[] = [];
    const n = 250;
    const tMax = 12;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * tMax;
      const y = this.y0() * Math.cos(omega * tt) +
        (this.v0() / omega) * Math.sin(omega * tt);
      const yc = Math.max(-1.5, Math.min(1.5, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * 30).toFixed(1)} ${(-yc * 40).toFixed(1)}`);
    }
    return pts.join(' ');
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
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(2, 2, 5);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight || 320;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COL_BG);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(2, 2, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 15;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffeedd, 0.65);
    dir.position.set(4, 6, 3);
    this.scene.add(dir);
    const fill = new THREE.DirectionalLight(0xaaccee, 0.35);
    fill.position.set(-3, 4, -4);
    this.scene.add(fill);

    // Floor grid
    const grid = new THREE.GridHelper(8, 16, 0x3a3a42, 0x2a2a30);
    grid.position.y = -1.5;
    this.scene.add(grid);

    // Wall (left anchor)
    const wallGeom = new THREE.BoxGeometry(0.2, 2, 1.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.7 });
    this.wall = new THREE.Mesh(wallGeom, wallMat);
    this.wall.position.set(-2.5, 0, 0);
    this.scene.add(this.wall);

    // Mass block
    const massGeom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const massMat = new THREE.MeshStandardMaterial({
      color: 0xc87b5e,
      roughness: 0.35,
      metalness: 0.1,
    });
    this.mass = new THREE.Mesh(massGeom, massMat);
    this.mass.position.set(0, 0, 0);
    this.scene.add(this.mass);

    // Equilibrium marker (subtle vertical line on ground)
    const eqMarker = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.04, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x666666 }),
    );
    eqMarker.position.set(0, -1.48, 0);
    this.scene.add(eqMarker);

    // Spring as a helical tube
    this.rebuildSpring();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    const animate = (now: number) => {
      this.animId = requestAnimationFrame(animate);
      const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.06, (now - this.lastFrame) / 1000);
      this.lastFrame = now;

      if (this.playing()) {
        const newT = this.t() + dt * 1.0;
        if (newT >= 30) this.t.set(0);
        else this.t.set(newT);
      }

      // Update mass position
      if (this.mass) {
        this.mass.position.x = this.position();
      }
      this.rebuildSpring();

      this.controls!.update();
      this.renderer!.render(this.scene!, this.camera!);
    };
    this.animId = requestAnimationFrame(animate);
  }

  private rebuildSpring(): void {
    if (!this.scene) return;
    if (this.springLine) {
      this.scene.remove(this.springLine);
      this.springLine.geometry.dispose();
    }

    const xStart = -2.4;
    const xEnd = this.position() - 0.3;
    const length = xEnd - xStart;
    const coils = 10;
    const pointsPerCoil = 12;
    const totalPoints = coils * pointsPerCoil;

    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const x = xStart + t * length;
      // Ignore first/last short segment (attach to wall / mass center)
      const amplitude = (t > 0.05 && t < 0.95) ? 0.15 : 0.0;
      const angle = t * coils * 2 * Math.PI;
      const y = amplitude * Math.cos(angle);
      const z = amplitude * Math.sin(angle);
      pts.push(new THREE.Vector3(x, y, z));
    }

    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    if (!this.springMat) {
      this.springMat = new THREE.LineBasicMaterial({
        color: 0x888899,
        linewidth: 2,
      });
    }
    this.springLine = new THREE.Line(geom, this.springMat);
    this.scene.add(this.springLine);
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
