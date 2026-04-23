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

interface Scenario {
  id: string;
  name: string;
  cIn: number; // g/L
  c0: number;  // g/L
  description: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'salting',
    name: '純水加鹽',
    cIn: 10,
    c0: 0,
    description: '從純水開始，持續注入濃度 10 g/L 的鹽水。觀察濃度如何爬升到 c_in。',
  },
  {
    id: 'cleaning',
    name: '污染槽沖洗',
    cIn: 0,
    c0: 10,
    description: '槽內原有濃鹽水（10 g/L），持續注入純水沖洗。濃度慢慢降回 0。',
  },
  {
    id: 'dilution',
    name: '稀釋',
    cIn: 3,
    c0: 10,
    description: '用較淡的鹽水（3 g/L）稀釋原本的濃溶液（10 g/L）。收斂到 3 g/L。',
  },
];

const COL_BG = 0x141418;

@Component({
  selector: 'app-de-ch3-mixing',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="混合問題：鹽水槽" subtitle="§3.3">
      <p>
        一個經典的化工題目：一個容器裝了 <code>V</code> 公升的鹽水，濃度 <code>c(t)</code>（g/L）。
        從頂端注入濃度 <code>c_in</code> 的鹽水，流速 <code>r</code> L/s；同時從底部以相同流速排出。
        問：濃度會怎麼隨時間變化？
      </p>
      <p class="key-idea">
        <strong>建模的關鍵是「記帳」</strong>——每秒槽內的鹽量變化 = 流入的鹽量 − 流出的鹽量。
      </p>
      <ul>
        <li>流入鹽量 ＝ <code>r · c_in</code>（濃度 × 流速）</li>
        <li>流出鹽量 ＝ <code>r · c(t)</code>（假設槽內均勻混合，流出的濃度就是槽內濃度）</li>
      </ul>
      <p>
        所以總鹽量 <code>S = V · c</code> 滿足：
      </p>
      <div class="centered-eq big">dS/dt = r · c_in − r · c(t)</div>
      <p>
        除以 V，以濃度表達：
      </p>
      <div class="centered-eq">dc/dt = (r / V) · (c_in − c)</div>
      <p>
        <strong>跟牛頓冷卻一模一樣的結構！</strong>——「狀態被拉向穩態 c_in，速率由 r/V 決定」。
        時間常數 <code>τ = V / r</code>：大約這麼多秒，槽內的內容就會被「換」一次。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖滑鼠旋轉視角 → 看鹽水如何被稀釋或加鹽">
      <div class="scenario-picker">
        @for (s of scenarios; track s.id) {
          <button
            class="scn-btn"
            [class.active]="scenario().id === s.id"
            (click)="switchScenario(s)"
          >{{ s.name }}</button>
        }
      </div>

      <div class="scn-desc">{{ scenario().description }}</div>

      <!-- Three.js stage -->
      <div #threeContainer class="three-stage"></div>

      <!-- Concentration chart -->
      <div class="chart-wrap">
        <div class="chart-title">
          c(t) — 槽內濃度 (g/L)
        </div>
        <svg viewBox="-10 -100 380 130" class="chart-svg">
          <line x1="0" y1="20" x2="360" y2="20" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-100" x2="0" y2="30" stroke="var(--border-strong)" stroke-width="1" />
          <text x="362" y="24" class="ax">t</text>
          <text x="-4" y="-102" class="ax">c</text>

          <!-- Y ticks -->
          @for (y of [0, 2, 4, 6, 8, 10]; track y) {
            <text x="-4" [attr.y]="20 - y * 10 + 3" class="tick">{{ y }}</text>
            <line x1="0" [attr.y1]="20 - y * 10" x2="360" [attr.y2]="20 - y * 10"
              stroke="var(--border)" stroke-width="0.4" opacity="0.45" />
          }

          <!-- Steady-state line -->
          <line x1="0" [attr.y1]="20 - scenario().cIn * 10"
            x2="360" [attr.y2]="20 - scenario().cIn * 10"
            stroke="#c87b5e" stroke-width="1" stroke-dasharray="3 2" opacity="0.7" />
          <text x="340" [attr.y]="20 - scenario().cIn * 10 - 3" class="steady-lab">
            c_in = {{ scenario().cIn }}
          </text>

          <!-- Solution curve -->
          <path [attr.d]="curvePath()" fill="none"
            stroke="var(--accent)" stroke-width="2.2" />

          <!-- Current position -->
          <circle
            [attr.cx]="t() * 8"
            [attr.cy]="20 - concentration() * 10"
            r="4.5" fill="var(--accent)" stroke="white" stroke-width="1.5" />
        </svg>
      </div>

      <!-- Controls -->
      <div class="ctrl-panel">
        <div class="ctrl-line">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <button class="reset-btn" (click)="resetCamera()">↻ 視角</button>
        </div>

        <div class="sl-line">
          <span class="sl-lab">t</span>
          <input type="range" min="0" max="45" step="0.1"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(1) }}s</span>
        </div>

        <div class="sl-line">
          <span class="sl-lab">流速 r</span>
          <input type="range" min="0.3" max="3" step="0.05"
            [value]="r()" (input)="r.set(+$any($event).target.value)" />
          <span class="sl-val">{{ r().toFixed(2) }} L/s</span>
        </div>

        <div class="sl-line">
          <span class="sl-lab">容積 V</span>
          <input type="range" min="5" max="30" step="0.5"
            [value]="V()" (input)="V.set(+$any($event).target.value)" />
          <span class="sl-val">{{ V().toFixed(1) }} L</span>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">目前濃度 c</span>
            <strong>{{ concentration().toFixed(2) }} g/L</strong>
          </div>
          <div class="ro">
            <span class="ro-k">穩態濃度 c_∞</span>
            <strong>{{ scenario().cIn.toFixed(2) }} g/L</strong>
          </div>
          <div class="ro">
            <span class="ro-k">時間常數 τ = V/r</span>
            <strong>{{ tau().toFixed(2) }} s</strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        幾個觀察：
      </p>
      <ul>
        <li><strong>「均勻混合」是個大假設</strong>。真實的槽可能有死角——那裡的濃度落後幾拍。
          要處理這點就要把模型升級成「兩槽串聯」甚至偏微分方程（Ch11 的擴散方程）。</li>
        <li><strong>V 越大、r 越小，時間常數越大</strong>——稀釋或加鹽的過程越慢。
          這在化工程序控制上很重要：反應槽要設計多大，得先決定可接受的反應時間。</li>
        <li><strong>終值永遠是 c_in</strong>，不管你從什麼初值出發。這是「線性＋穩定吸引子」結構的通性。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        混合問題是牛頓冷卻的「液體版」——完全相同的方程結構。
        學會做這類「記帳式」建模（流入 − 流出），你可以套用到空氣污染、河流生態、物流庫存、人口流動——無所不包。
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
    .centered-eq.big { font-size: 20px; padding: 14px; }

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

    .scenario-picker {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .scn-btn {
      font: inherit;
      font-size: 13px;
      padding: 6px 12px;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      cursor: pointer;
      color: var(--text);
    }

    .scn-btn:hover { border-color: var(--accent); }
    .scn-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .scn-desc {
      padding: 10px 14px;
      font-size: 13px;
      color: var(--text-secondary);
      background: var(--bg-surface);
      border-left: 3px solid var(--accent);
      border-radius: 0 6px 6px 0;
      margin-bottom: 14px;
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

    .ax { font-size: 11px; fill: var(--text-muted); font-style: italic; }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: end;
      font-family: 'JetBrains Mono', monospace;
    }

    .steady-lab {
      font-size: 10px;
      fill: #c87b5e;
      font-family: 'JetBrains Mono', monospace;
      text-anchor: end;
    }

    .ctrl-panel {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .ctrl-line {
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

    .sl-line {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .sl-lab {
      font-size: 12px;
      font-weight: 600;
      color: var(--accent);
      min-width: 70px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl-line input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 66px;
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
  `,
})
export class DeCh3MixingComponent implements OnDestroy {
  readonly scenarios = SCENARIOS;
  readonly scenario = signal<Scenario>(SCENARIOS[0]);
  readonly t = signal(0);
  readonly playing = signal(false);
  readonly r = signal(1.0);
  readonly V = signal(10);

  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animId = 0;
  private lastFrame = 0;
  private resizeObserver: ResizeObserver | null = null;

  private tankGroup: THREE.Group | null = null;
  private waterMesh: THREE.Mesh | null = null;
  private waterMat: THREE.MeshPhysicalMaterial | null = null;
  private saltParticles: THREE.Points | null = null;

  // Drip animation state: each drip has position, velocity, fade
  private inDrips: Array<{ mesh: THREE.Mesh; y: number; vy: number }> = [];
  private outDrips: Array<{ mesh: THREE.Mesh; y: number; vy: number }> = [];
  private lastInSpawn = 0;
  private lastOutSpawn = 0;

  readonly tau = computed(() => this.V() / this.r());

  /**
   * Analytical solution: c(t) = c_in + (c0 - c_in) * e^(-(r/V) t)
   */
  readonly concentration = computed(() => {
    const sc = this.scenario();
    const rate = this.r() / this.V();
    return sc.cIn + (sc.c0 - sc.cIn) * Math.exp(-rate * this.t());
  });

  readonly curvePath = computed(() => {
    const sc = this.scenario();
    const rate = this.r() / this.V();
    const pts: string[] = [];
    const tMax = 45;
    const n = 150;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * tMax;
      const c = sc.cIn + (sc.c0 - sc.cIn) * Math.exp(-rate * tt);
      const x = tt * 8;
      const y = 20 - c * 10;
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
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

  switchScenario(s: Scenario): void {
    this.scenario.set(s);
    this.t.set(0);
    this.playing.set(false);
  }

  togglePlay(): void {
    if (this.t() >= 44.9) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(3.8, 2.6, 4.2);
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
  }

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight || 320;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COL_BG);

    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    this.camera.position.set(3.8, 2.6, 4.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.target.set(0, 0.5, 0);
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 12;
    this.controls.update();

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffeedd, 0.6);
    dir.position.set(4, 6, 3);
    this.scene.add(dir);
    const fill = new THREE.DirectionalLight(0xaaccee, 0.35);
    fill.position.set(-3, 4, -4);
    this.scene.add(fill);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0x2a2a32, roughness: 0.85 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    this.scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(8, 16, 0x3a3a42, 0x2a2a30);
    grid.position.y = 0;
    this.scene.add(grid);

    // Tank group
    this.tankGroup = new THREE.Group();
    this.scene.add(this.tankGroup);

    this.buildTank();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    const animate = (now: number) => {
      this.animId = requestAnimationFrame(animate);
      const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.06, (now - this.lastFrame) / 1000);
      this.lastFrame = now;

      // Advance time if playing
      if (this.playing()) {
        const newT = this.t() + dt * 1.5;
        if (newT >= 45) {
          this.t.set(45);
          this.playing.set(false);
        } else {
          this.t.set(newT);
        }
      }

      // Update water color
      this.updateWaterColor();
      // Update salt particles density
      this.updateSaltParticles();
      // Drip animation
      this.updateDrips(dt, now);

      this.controls!.update();
      this.renderer!.render(this.scene!, this.camera!);
    };
    this.animId = requestAnimationFrame(animate);
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

  private buildTank(): void {
    if (!this.tankGroup) return;

    // Glass tank (outer cylinder, transparent)
    const glassGeom = new THREE.CylinderGeometry(0.9, 0.9, 2.2, 48, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xccddee,
      transparent: true,
      opacity: 0.15,
      transmission: 0.9,
      roughness: 0.05,
      metalness: 0,
      side: THREE.DoubleSide,
      clearcoat: 1,
    });
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.position.y = 1.1;
    this.tankGroup.add(glass);

    // Glass rim (top and bottom circles)
    const rimGeom = new THREE.TorusGeometry(0.9, 0.03, 16, 48);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3 });
    const rimTop = new THREE.Mesh(rimGeom, rimMat);
    rimTop.position.y = 2.2;
    rimTop.rotation.x = Math.PI / 2;
    this.tankGroup.add(rimTop);
    const rimBot = new THREE.Mesh(rimGeom, rimMat);
    rimBot.position.y = 0;
    rimBot.rotation.x = Math.PI / 2;
    this.tankGroup.add(rimBot);

    // Water (inner slightly smaller cylinder, fills ~80% of the tank height)
    const waterGeom = new THREE.CylinderGeometry(0.87, 0.87, 1.75, 48);
    this.waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x88aadd,
      transparent: true,
      opacity: 0.75,
      transmission: 0.4,
      roughness: 0.08,
      metalness: 0,
    });
    this.waterMesh = new THREE.Mesh(waterGeom, this.waterMat);
    this.waterMesh.position.y = 0.9;
    this.tankGroup.add(this.waterMesh);

    // Input pipe (top)
    const pipeIn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4 }),
    );
    pipeIn.position.set(0, 2.6, 0);
    this.tankGroup.add(pipeIn);
    // Spout cap
    const spout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.08, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.5 }),
    );
    spout.position.set(0, 2.28, 0);
    this.tankGroup.add(spout);

    // Output pipe (bottom side)
    const pipeOut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4 }),
    );
    pipeOut.rotation.z = Math.PI / 2;
    pipeOut.position.set(1.1, 0.15, 0);
    this.tankGroup.add(pipeOut);

    // Salt particles inside water
    const partGeom = new THREE.BufferGeometry();
    const positions: number[] = [];
    const N_MAX_PARTS = 300;
    for (let i = 0; i < N_MAX_PARTS; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.82;
      positions.push(
        r * Math.cos(theta),
        0.1 + Math.random() * 1.55,
        r * Math.sin(theta),
      );
    }
    partGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    this.saltParticles = new THREE.Points(partGeom, partMat);
    this.saltParticles.position.y = 0;
    this.tankGroup.add(this.saltParticles);
  }

  private updateWaterColor(): void {
    if (!this.waterMat) return;
    const c = this.concentration();
    const pct = Math.max(0, Math.min(1, c / 10));
    // Pure water blue → saturated salty yellow-brown
    const r = 0x88 / 255 + (0xdd / 255 - 0x88 / 255) * pct;
    const g = 0xaa / 255 + (0xbb / 255 - 0xaa / 255) * pct;
    const b = 0xdd / 255 + (0x55 / 255 - 0xdd / 255) * pct;
    this.waterMat.color.setRGB(r, g, b);
  }

  private updateSaltParticles(): void {
    if (!this.saltParticles) return;
    const c = this.concentration();
    // Fewer particles visible at low concentration
    const geom = this.saltParticles.geometry as THREE.BufferGeometry;
    const total = 300;
    const visible = Math.round(total * Math.max(0, Math.min(1, c / 10)));
    geom.setDrawRange(0, visible);
    const mat = this.saltParticles.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + 0.5 * (c / 10);
  }

  /**
   * Animate input & output drips.
   */
  private updateDrips(dt: number, now: number): void {
    if (!this.tankGroup) return;

    // Spawn input drips at rate r (spawns per second scales with r)
    const sc = this.scenario();
    const spawnRate = this.r() * 4; // drops per second visual
    const inInterval = 1000 / spawnRate;

    if (this.playing() && now - this.lastInSpawn > inInterval) {
      this.lastInSpawn = now;
      const drip = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        new THREE.MeshStandardMaterial({
          color: this.cInColor(),
          roughness: 0.2,
        }),
      );
      drip.position.set(0, 2.22, 0);
      this.tankGroup.add(drip);
      this.inDrips.push({ mesh: drip, y: 2.22, vy: -0.02 });
    }

    // Update input drips
    for (let i = this.inDrips.length - 1; i >= 0; i--) {
      const d = this.inDrips[i];
      d.vy -= 0.008; // gravity
      d.y += d.vy;
      d.mesh.position.y = d.y;
      if (d.y < 1.78) {
        // hit water
        this.tankGroup.remove(d.mesh);
        d.mesh.geometry.dispose();
        (d.mesh.material as THREE.Material).dispose();
        this.inDrips.splice(i, 1);
      }
    }

    // Spawn output drips (only when there's water to push out)
    if (this.playing() && now - this.lastOutSpawn > inInterval) {
      this.lastOutSpawn = now;
      const drip = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshStandardMaterial({
          color: this.currentColor(),
          roughness: 0.2,
        }),
      );
      drip.position.set(1.42, 0.15, 0);
      this.tankGroup.add(drip);
      this.outDrips.push({ mesh: drip, y: 0.15, vy: -0.005 });
    }

    // Update output drips (fall from spout)
    for (let i = this.outDrips.length - 1; i >= 0; i--) {
      const d = this.outDrips[i];
      d.vy -= 0.008;
      d.y += d.vy;
      d.mesh.position.y = d.y;
      if (d.y < 0) {
        this.tankGroup.remove(d.mesh);
        d.mesh.geometry.dispose();
        (d.mesh.material as THREE.Material).dispose();
        this.outDrips.splice(i, 1);
      }
    }
  }

  private cInColor(): THREE.Color {
    const pct = Math.max(0, Math.min(1, this.scenario().cIn / 10));
    return new THREE.Color().setRGB(
      0x88 / 255 + (0xdd / 255 - 0x88 / 255) * pct,
      0xaa / 255 + (0xbb / 255 - 0xaa / 255) * pct,
      0xdd / 255 + (0x55 / 255 - 0xdd / 255) * pct,
    );
  }

  private currentColor(): THREE.Color {
    const pct = Math.max(0, Math.min(1, this.concentration() / 10));
    return new THREE.Color().setRGB(
      0x88 / 255 + (0xdd / 255 - 0x88 / 255) * pct,
      0xaa / 255 + (0xbb / 255 - 0xaa / 255) * pct,
      0xdd / 255 + (0x55 / 255 - 0xdd / 255) * pct,
    );
  }
}
