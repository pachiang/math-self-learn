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

const OMEGA0 = 2;      // natural frequency
const COL_BG = 0x141418;

/**
 * Normalized amplitude:
 *   A(r, ζ) = 1 / √((1 − r²)² + (2 ζ r)²)   where r = Ω / ω₀
 * Phase:
 *   φ(r, ζ) = atan2(2 ζ r, 1 − r²)
 */
function amplitudeNorm(r: number, zeta: number): number {
  const denom = Math.sqrt((1 - r * r) * (1 - r * r) + (2 * zeta * r) * (2 * zeta * r));
  return 1 / denom;
}

function phaseNorm(r: number, zeta: number): number {
  return Math.atan2(2 * zeta * r, 1 - r * r);
}

@Component({
  selector: 'app-de-ch6-freq-response',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="頻率響應：Bode 圖 + 3D 曲面" subtitle="§6.4">
      <p>
        上一節的無阻尼共振是「數學極限」——現實中阻尼會讓振幅停在一個<strong>有限的最大值</strong>。
        這一節要量化這個「最大值」與驅動頻率的關係。
      </p>
      <p>
        有阻尼、正弦外力的穩態特解：
      </p>
      <div class="centered-eq">
        y_p(t) = |A(Ω)| · F₀ · cos(Ω·t − φ(Ω))
      </div>
      <p>
        其中振幅與相位用正規化頻率 <strong>r = Ω/ω₀</strong> 與阻尼比 <strong>ζ = c/c_crit</strong> 表達：
      </p>
      <div class="centered-eq big">
        |A(r, ζ)| = 1 / √((1 − r²)² + (2·ζ·r)²)
      </div>
      <p class="key-idea">
        <strong>共振峰</strong>出現在 r ≈ 1（即 Ω ≈ ω₀）附近。
        阻尼越小峰越尖、越高；阻尼越大峰越平。
        ζ ≥ 1/√2 ≈ 0.707 時，峰完全消失（<strong>不再放大</strong>，只是衰減）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="3D 振幅曲面 |A(r, ζ)|：拖滑鼠旋轉看共振峰的形狀">
      <div #threeContainer class="three-stage"></div>

      <!-- 2D Bode plots -->
      <div class="bode-grid">
        <div class="bode-col">
          <div class="bode-head">振幅 |A| vs r（不同 ζ）</div>
          <svg viewBox="-20 -130 320 180" class="bode-svg">
            <line x1="0" y1="0" x2="290" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-120" x2="0" y2="20" stroke="var(--border-strong)" stroke-width="1" />
            <text x="294" y="4" class="ax">r = Ω/ω₀</text>
            <text x="-4" y="-122" class="ax">|A|</text>

            <!-- Tick marks -->
            @for (r of [1, 2, 3]; track r) {
              <line [attr.x1]="r * 90" y1="-3" [attr.x2]="r * 90" y2="3"
                stroke="var(--text-muted)" stroke-width="0.8" />
              <text [attr.x]="r * 90" y="14" class="tick">{{ r }}</text>
            }
            @for (a of [1, 2, 3, 4, 5]; track a) {
              <line x1="-3" [attr.y1]="-a * 20" x2="3" [attr.y2]="-a * 20"
                stroke="var(--text-muted)" stroke-width="0.8" />
              <text x="-6" [attr.y]="-a * 20 + 3" class="tick right">{{ a }}</text>
            }

            <!-- r = 1 vertical (resonance frequency) -->
            <line x1="90" y1="-120" x2="90" y2="0"
              stroke="var(--text-muted)" stroke-width="0.6" stroke-dasharray="3 2" opacity="0.5" />
            <text x="92" y="-110" class="rlab">r = 1</text>

            <!-- Highlighted current ζ curve -->
            <path [attr.d]="bodeAmpPath(zeta())" fill="none"
              stroke="var(--accent)" stroke-width="2.2" />

            <!-- Preset ζ curves (faded) -->
            @for (z of [0.05, 0.2, 0.5, 1]; track z) {
              <path [attr.d]="bodeAmpPath(z)" fill="none"
                [attr.stroke]="presetColor(z)" stroke-width="1.3" opacity="0.45" />
              <text [attr.x]="presetLabelX(z)" [attr.y]="presetLabelY(z)"
                class="zeta-lab" [attr.fill]="presetColor(z)">
                ζ={{ z }}
              </text>
            }

            <!-- Current point on curve -->
            <circle [attr.cx]="r() * 90"
              [attr.cy]="-Math.min(6, currentAmplitude()) * 20"
              r="4.5" fill="var(--accent)" stroke="white" stroke-width="1.5" />
          </svg>
        </div>

        <div class="bode-col">
          <div class="bode-head">相位 φ vs r</div>
          <svg viewBox="-20 -110 320 140" class="bode-svg">
            <line x1="0" y1="-50" x2="290" y2="-50" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-100" x2="0" y2="20" stroke="var(--border-strong)" stroke-width="1" />
            <text x="294" y="-46" class="ax">r</text>
            <text x="-4" y="-102" class="ax">φ</text>

            <!-- Phase tick: 0, π/2, π -->
            @for (p of [0, 1, 2]; track p) {
              <line x1="-3" [attr.y1]="-50 + p * -(25)" x2="3" [attr.y2]="-50 + p * -(25)"
                stroke="var(--text-muted)" stroke-width="0.8" />
            }
            <text x="-6" y="-47" class="tick right">0</text>
            <text x="-6" y="-72" class="tick right">π/2</text>
            <text x="-6" y="-97" class="tick right">π</text>

            @for (r of [1, 2, 3]; track r) {
              <text [attr.x]="r * 90" y="-34" class="tick">{{ r }}</text>
            }

            <line x1="90" y1="-100" x2="90" y2="-20"
              stroke="var(--text-muted)" stroke-width="0.6" stroke-dasharray="3 2" opacity="0.5" />

            <!-- Highlighted current phase curve -->
            <path [attr.d]="bodePhasePath(zeta())" fill="none"
              stroke="var(--accent)" stroke-width="2.2" />

            <!-- Preset ζ curves -->
            @for (z of [0.05, 0.2, 0.5, 1]; track z) {
              <path [attr.d]="bodePhasePath(z)" fill="none"
                [attr.stroke]="presetColor(z)" stroke-width="1.2" opacity="0.45" />
            }

            <circle [attr.cx]="r() * 90"
              [attr.cy]="-50 + -currentPhase() * 25 / (Math.PI / 2)"
              r="4.5" fill="var(--accent)" stroke="white" stroke-width="1.5" />
          </svg>
        </div>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="row">
          <button class="reset-btn" (click)="resetCamera()">↻ 3D 視角</button>
        </div>

        <div class="sl">
          <span class="sl-lab">r = Ω/ω₀</span>
          <input type="range" min="0.1" max="3" step="0.01"
            [value]="r()" (input)="r.set(+$any($event).target.value)" />
          <span class="sl-val">{{ r().toFixed(2) }}</span>
        </div>

        <div class="sl">
          <span class="sl-lab">阻尼比 ζ</span>
          <input type="range" min="0.02" max="1.2" step="0.01"
            [value]="zeta()" (input)="zeta.set(+$any($event).target.value)" />
          <span class="sl-val">{{ zeta().toFixed(3) }}</span>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">目前振幅放大</span>
            <strong [class.big]="currentAmplitude() > 3">
              {{ currentAmplitude().toFixed(3) }}×
            </strong>
          </div>
          <div class="ro">
            <span class="ro-k">目前相位落後</span>
            <strong>{{ (currentPhase() * 180 / Math.PI).toFixed(1) }}°</strong>
          </div>
          <div class="ro">
            <span class="ro-k">峰值位置 r_peak</span>
            <strong>{{ peakLocationR().toFixed(3) }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">峰值放大 Q</span>
            <strong>{{ peakValue().toFixed(2) }}×</strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意這幾個特徵：
      </p>
      <ul>
        <li><strong>低頻（r → 0）</strong>：|A| → 1，相位 → 0。外力慢，系統「跟得上」——輸入和輸出幾乎同相。</li>
        <li><strong>共振附近（r ≈ 1）</strong>：|A| 達峰值 Q = 1/(2ζ)（小阻尼極限）。相位穿過 π/2。</li>
        <li><strong>高頻（r → ∞）</strong>：|A| → 0，相位 → π。外力太快、質量來不及響應——輸出跟輸入<strong>反相</strong>且振幅變小。</li>
      </ul>
      <p>
        這個「低通 + 共振峰」結構是<strong>無處不在</strong>的：
        物理濾波器、電子濾波器、樂器共鳴腔、MRI 線圈、機械結構的頻率響應……
        每個都有一個<strong>Q 值</strong>來衡量峰的尖銳度。
      </p>
      <p>
        <strong>品質因數 Q = 1/(2ζ)</strong>：
      </p>
      <ul>
        <li>高 Q（低阻尼）：峰尖、共振強——選擇性高（收音機調台、樂器音色）。</li>
        <li>低 Q（高阻尼）：峰扁、反應鈍——抗共振（建築、地震阻尼器）。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        頻率響應 |A(Ω)| 是「系統 vs 頻率」的完整指紋。
        它濃縮成一張 Bode 圖（振幅 + 相位 vs 頻率），
        在工程領域是最常用的分析工具。Ch7 Laplace 會把這個觀點推廣到<strong>任何輸入</strong>，不只正弦。
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
    .centered-eq.big { font-size: 20px; padding: 16px; }

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

    .bode-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }

    @media (max-width: 640px) {
      .bode-grid { grid-template-columns: 1fr; }
    }

    .bode-col {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .bode-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }

    .bode-svg {
      width: 100%;
      display: block;
    }

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

    .tick.right { text-anchor: end; }

    .rlab {
      font-size: 9px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .zeta-lab {
      font-size: 9px;
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
    }

    .reset-btn {
      font: inherit;
      font-size: 13px;
      padding: 6px 14px;
      border: 1.5px solid var(--accent);
      background: transparent;
      color: var(--accent);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
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
      min-width: 60px;
      text-align: right;
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

    .ro strong.big {
      color: #c87b5e;
      font-size: 14px;
    }
  `,
})
export class DeCh6FreqResponseComponent implements OnDestroy {
  readonly Math = Math;
  readonly OMEGA0 = OMEGA0;

  readonly r = signal(1);
  readonly zeta = signal(0.15);

  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animId = 0;
  private resizeObserver: ResizeObserver | null = null;

  private surfaceMesh: THREE.Mesh | null = null;
  private currentDot: THREE.Mesh | null = null;
  private rAxisLine: THREE.Line | null = null;

  readonly currentAmplitude = computed(() => amplitudeNorm(this.r(), this.zeta()));
  readonly currentPhase = computed(() => phaseNorm(this.r(), this.zeta()));

  /**
   * Peak location: r_peak = sqrt(1 - 2ζ²), exists when ζ < 1/√2
   * Peak value: Q_max = 1/(2ζ·√(1-ζ²))
   */
  readonly peakLocationR = computed(() => {
    const z = this.zeta();
    if (z >= 1 / Math.sqrt(2)) return NaN;
    return Math.sqrt(1 - 2 * z * z);
  });

  readonly peakValue = computed(() => {
    const z = this.zeta();
    if (z >= 1 / Math.sqrt(2)) return 1;
    return 1 / (2 * z * Math.sqrt(1 - z * z));
  });

  presetColor(zeta: number): string {
    if (zeta < 0.1) return '#c87b5e';
    if (zeta < 0.3) return '#a89a5c';
    if (zeta < 0.7) return '#5ca878';
    return '#5a8aa8';
  }

  presetLabelX(zeta: number): number {
    // Rough: peak x for small ζ is near r=1
    return 96;
  }

  presetLabelY(zeta: number): number {
    const peak = 1 / (2 * zeta * Math.sqrt(1 - zeta * zeta + 0.001));
    return -Math.min(6, peak) * 20 - 4;
  }

  bodeAmpPath(zeta: number): string {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const r = (i / n) * 3.2;
      const amp = Math.min(6, amplitudeNorm(r, zeta));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(r * 90).toFixed(1)} ${(-amp * 20).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  bodePhasePath(zeta: number): string {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const r = (i / n) * 3.2;
      const phi = phaseNorm(r, zeta);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(r * 90).toFixed(1)} ${(-50 + -phi * 25 / (Math.PI / 2)).toFixed(1)}`);
    }
    return pts.join(' ');
  }

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

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(3, 3.5, 4);
    this.controls.target.set(1.2, 1, 0.6);
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
    this.camera.position.set(3, 3.5, 4);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
    this.controls.target.set(1.2, 1, 0.6);
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffeedd, 0.65);
    dir.position.set(4, 6, 4);
    this.scene.add(dir);

    // Build amplitude surface
    this.buildSurface();

    // Axes
    this.addAxis('r', 1, 0, 0, 3, 0xc87b5e);
    this.addAxis('ζ', 0, 0, 1, 1.2, 0x5a8aa8);
    this.addAxis('|A|', 0, 1, 0, 5, 0xffffff);

    this.addLabel('r (Ω/ω₀)', 3.1, 0, 0, '#c87b5e');
    this.addLabel('ζ', 0, 0, 1.3, '#5a8aa8');
    this.addLabel('|A|', 0, 5.3, 0, '#ffffff');

    // Current location dot
    this.currentDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xb58ac0, roughness: 0.25 }),
    );
    this.scene.add(this.currentDot);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    const animate = () => {
      this.animId = requestAnimationFrame(animate);
      if (this.currentDot) {
        const amp = Math.min(5.5, amplitudeNorm(this.r(), this.zeta()));
        this.currentDot.position.set(this.r(), amp, this.zeta());
      }
      this.controls!.update();
      this.renderer!.render(this.scene!, this.camera!);
    };
    this.animId = requestAnimationFrame(animate);
  }

  private buildSurface(): void {
    if (!this.scene) return;

    const rSegs = 60;
    const zSegs = 40;
    const rMax = 3;
    const zMax = 1.2;

    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i <= rSegs; i++) {
      for (let j = 0; j <= zSegs; j++) {
        const r = (i / rSegs) * rMax;
        const z = (j / zSegs) * zMax + 0.02;
        const amp = Math.min(5.5, amplitudeNorm(r, z));
        vertices.push(r, amp, z);

        // Color: low amp = cool, high amp = hot
        const t = Math.min(1, amp / 5);
        const hue = (0.65 - t * 0.65);
        const sat = 0.55;
        const light = 0.35 + t * 0.2;
        const col = new THREE.Color().setHSL(hue, sat, light);
        colors.push(col.r, col.g, col.b);
      }
    }

    for (let i = 0; i < rSegs; i++) {
      for (let j = 0; j < zSegs; j++) {
        const a = i * (zSegs + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (zSegs + 1) + j;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.78,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
    });

    this.surfaceMesh = new THREE.Mesh(geom, mat);
    this.scene.add(this.surfaceMesh);

    // Wireframe overlay
    const wire = new THREE.Mesh(
      geom.clone(),
      new THREE.MeshBasicMaterial({
        color: 0x444444,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
      }),
    );
    this.scene.add(wire);
  }

  private addAxis(
    _label: string,
    dx: number, dy: number, dz: number,
    length: number, color: number,
  ): void {
    const dir = new THREE.Vector3(dx, dy, dz).normalize();
    const arrow = new THREE.ArrowHelper(
      dir, new THREE.Vector3(0, 0, 0), length, color, 0.15, 0.08,
    );
    this.scene!.add(arrow);
  }

  private addLabel(text: string, x: number, y: number, z: number, color: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 36);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.set(0.7, 0.35, 1);
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
