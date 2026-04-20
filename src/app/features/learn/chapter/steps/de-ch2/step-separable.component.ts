import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface SeparableExample {
  id: string;
  eq: string;
  g: string; // g(t)
  h: string; // h(y)
  separation: string; // dy/h(y) = g(t) dt
  lhsIntegral: string; // ∫ dy/h(y)
  rhsIntegral: string; // ∫ g(t) dt
  afterIntegration: string; // e.g., ln|y| = t + C
  generalForm: string; // solved for y
  specialFormWithIV: string; // after applying y(0) = y0
  f: (t: number, y: number) => number; // for slope field
  solution: (y0: number, t: number) => number;
  y0Default: number;
  tRange: [number, number];
  yRange: [number, number];
}

const EXAMPLES: SeparableExample[] = [
  {
    id: 'exp',
    eq: 'dy/dt = y',
    g: '1',
    h: 'y',
    separation: 'dy / y = dt',
    lhsIntegral: '∫ dy/y  =  ln|y|',
    rhsIntegral: '∫ dt  =  t + C',
    afterIntegration: 'ln|y| = t + C',
    generalForm: 'y(t) = A · e^t',
    specialFormWithIV: 'y(t) = y₀ · e^t',
    f: (_t, y) => y,
    solution: (y0, t) => y0 * Math.exp(t),
    y0Default: 0.5,
    tRange: [-2.5, 2.5],
    yRange: [-3, 3],
  },
  {
    id: 'decay',
    eq: 'dy/dt = −2y',
    g: '−2',
    h: 'y',
    separation: 'dy / y = −2 dt',
    lhsIntegral: '∫ dy/y  =  ln|y|',
    rhsIntegral: '∫ −2 dt  =  −2t + C',
    afterIntegration: 'ln|y| = −2t + C',
    generalForm: 'y(t) = A · e^(−2t)',
    specialFormWithIV: 'y(t) = y₀ · e^(−2t)',
    f: (_t, y) => -2 * y,
    solution: (y0, t) => y0 * Math.exp(-2 * t),
    y0Default: 2,
    tRange: [0, 3],
    yRange: [-0.5, 3.5],
  },
  {
    id: 'logistic',
    eq: 'dy/dt = y(1 − y)',
    g: '1',
    h: 'y(1 − y)',
    separation: 'dy / [y(1 − y)] = dt',
    lhsIntegral: '∫ dy/[y(1−y)]  =  ln|y/(1−y)|  (部分分式)',
    rhsIntegral: '∫ dt  =  t + C',
    afterIntegration: 'ln|y/(1−y)| = t + C',
    generalForm: 'y(t) = 1 / (1 + A · e^(−t))',
    specialFormWithIV: 'y(t) = 1 / (1 + ((1−y₀)/y₀) · e^(−t))',
    f: (_t, y) => y * (1 - y),
    solution: (y0, t) => {
      if (y0 < 0.0001) return 0;
      const c = (1 - y0) / y0;
      return 1 / (1 + c * Math.exp(-t));
    },
    y0Default: 0.15,
    tRange: [-3, 5],
    yRange: [-0.3, 1.8],
  },
  {
    id: 'gaussian',
    eq: 'dy/dt = −2t · y',
    g: '−2t',
    h: 'y',
    separation: 'dy / y = −2t dt',
    lhsIntegral: '∫ dy/y  =  ln|y|',
    rhsIntegral: '∫ −2t dt  =  −t² + C',
    afterIntegration: 'ln|y| = −t² + C',
    generalForm: 'y(t) = A · e^(−t²)',
    specialFormWithIV: 'y(t) = y₀ · e^(−t²)',
    f: (t, y) => -2 * t * y,
    solution: (y0, t) => y0 * Math.exp(-t * t),
    y0Default: 1.5,
    tRange: [-2.5, 2.5],
    yRange: [-0.5, 2],
  },
];

const STEP_LABELS = [
  '① 確認方程是可分離的',
  '② 分家：把 y 放左邊、t 放右邊',
  '③ 兩邊各自積分',
  '④ 合併、整理成通解',
  '⑤ 代入初值求 A',
  '⑥ 驗證：畫在斜率場上',
];

@Component({
  selector: 'app-de-ch2-separable',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="可分離方程" subtitle="§2.2">
      <p>
        最簡單的一招。如果方程可以寫成
      </p>
      <div class="centered-eq big">dy/dt = g(t) · h(y)</div>
      <p>
        ——也就是右側可以「<strong>拆成純 t 函數 × 純 y 函數</strong>」——
        那你就可以把兩邊分家，再各自積分。
      </p>
      <p class="key-idea">
        <strong>核心操作</strong>：
        <br><code>dy / h(y) = g(t) dt</code>
        <br>然後 <code>∫ dy/h(y) = ∫ g(t) dt + C</code>。
      </p>
      <p>
        左邊只對 y 積，右邊只對 t 積，兩邊互不干擾。這就是「<strong>分離變數</strong>」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="挑一個範例 → 按下一步，看公式怎麼一步步推出來">
      <div class="example-picker">
        @for (ex of examples; track ex.id) {
          <button
            class="ex-btn"
            [class.active]="selected().id === ex.id"
            (click)="switchExample(ex)"
          >{{ ex.eq }}</button>
        }
      </div>

      <div class="workbench">
        <!-- Left: symbolic derivation -->
        <div class="derivation">
          <div class="deriv-head">符號推導</div>

          <div class="step" [class.active]="step() >= 1">
            <div class="step-label">{{ stepLabels[0] }}</div>
            <div class="step-body">
              <div class="eq-line">
                <code>{{ selected().eq }}</code>
              </div>
              <div class="kv-mini">
                <span class="kv-k">g(t) =</span><code>{{ selected().g }}</code>
                <span class="kv-k">h(y) =</span><code>{{ selected().h }}</code>
              </div>
            </div>
          </div>

          <div class="step" [class.active]="step() >= 2">
            <div class="step-label">{{ stepLabels[1] }}</div>
            <div class="step-body">
              <div class="eq-line"><code>{{ selected().separation }}</code></div>
            </div>
          </div>

          <div class="step" [class.active]="step() >= 3">
            <div class="step-label">{{ stepLabels[2] }}</div>
            <div class="step-body">
              <div class="eq-line"><code>{{ selected().lhsIntegral }}</code></div>
              <div class="eq-line"><code>{{ selected().rhsIntegral }}</code></div>
            </div>
          </div>

          <div class="step" [class.active]="step() >= 4">
            <div class="step-label">{{ stepLabels[3] }}</div>
            <div class="step-body">
              <div class="eq-line"><code>{{ selected().afterIntegration }}</code></div>
              <div class="eq-line big-eq"><code>{{ selected().generalForm }}</code></div>
              <div class="tip">通解裡有一個自由常數 A。</div>
            </div>
          </div>

          <div class="step" [class.active]="step() >= 5">
            <div class="step-label">{{ stepLabels[4] }}</div>
            <div class="step-body">
              <div class="eq-line">代入 y(0) = y₀：</div>
              <div class="eq-line big-eq special">
                <code>{{ selected().specialFormWithIV }}</code>
              </div>
            </div>
          </div>

          <div class="step" [class.active]="step() >= 6">
            <div class="step-label">{{ stepLabels[5] }}</div>
            <div class="step-body">
              <div class="tip">右側的斜率場會跟解曲線<strong>完美相切</strong>——這就是驗證。</div>
            </div>
          </div>

          <div class="step-nav">
            <button class="nav-btn" [disabled]="step() <= 1" (click)="prevStep()">← 上一步</button>
            <span class="step-counter">{{ step() }} / 6</span>
            <button class="nav-btn primary" [disabled]="step() >= 6" (click)="nextStep()">下一步 →</button>
          </div>
        </div>

        <!-- Right: slope field + solution -->
        <div class="viz">
          <div class="viz-head">幾何驗證</div>
          <svg [attr.viewBox]="viewBox()" class="viz-svg">
            <!-- Grid -->
            @for (g of gridT(); track g) {
              <line
                [attr.x1]="g.x" [attr.y1]="g.y1"
                [attr.x2]="g.x" [attr.y2]="g.y2"
                stroke="var(--border)" stroke-width="0.5"
              />
            }
            @for (g of gridY(); track g) {
              <line
                [attr.x1]="g.x1" [attr.y1]="g.y"
                [attr.x2]="g.x2" [attr.y2]="g.y"
                stroke="var(--border)" stroke-width="0.5"
              />
            }
            <!-- Axes -->
            <line [attr.x1]="axisBounds().xMin" y1="0"
              [attr.x2]="axisBounds().xMax" y2="0"
              stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" [attr.y1]="axisBounds().yMin"
              x2="0" [attr.y2]="axisBounds().yMax"
              stroke="var(--border-strong)" stroke-width="1" />

            <text [attr.x]="axisBounds().xMax - 2" y="12" class="axis">t</text>
            <text x="-6" [attr.y]="axisBounds().yMin + 12" class="axis">y</text>

            <!-- Slope field arrows -->
            @for (a of arrows(); track a.k) {
              <line
                [attr.x1]="a.x1" [attr.y1]="a.y1"
                [attr.x2]="a.x2" [attr.y2]="a.y2"
                stroke="var(--text-muted)" stroke-width="1"
                stroke-linecap="round" opacity="0.65"
              />
            }

            <!-- Solution curve - only visible once step >= 6 -->
            @if (step() >= 6) {
              <path [attr.d]="solutionPath()" fill="none"
                stroke="var(--accent)" stroke-width="2.5" />
              <circle cx="0" [attr.cy]="-y0() * pxPerY()" r="5"
                fill="var(--accent)" stroke="white" stroke-width="2" />
            }
          </svg>

          <div class="slider-row">
            <span class="sl-lab">y₀ =</span>
            <input type="range"
              [min]="y0Min()" [max]="y0Max()" step="0.05"
              [value]="y0()"
              (input)="y0.set(+$any($event).target.value)" />
            <span class="sl-val">{{ y0().toFixed(2) }}</span>
          </div>

          @if (step() >= 6) {
            <div class="verify-line">
              y({{ verifyT.toFixed(1) }}) = <strong>{{ verifyValue().toFixed(3) }}</strong>
            </div>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        三個觀察：
      </p>
      <ul>
        <li><strong>常數 A 不會消失</strong>——它對應「你可以從哪個初值出發」，也就是 Ch1 §1.4 那個解族。每個初值挑出其中一條。</li>
        <li><strong>Logistic 方程</strong>稍微麻煩，因為 <code>1/[y(1-y)]</code> 要用部分分式拆成 <code>1/y + 1/(1-y)</code>。這是典型的「不乖的可分離」，Ch3 會再細看。</li>
        <li><strong>這一招的限制</strong>：如果右側混著 y 跟 t（例如 <code>dy/dt = y + t</code>），就不能分家。下一節的線性方法就是對付這種。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        可分離方程是 ODE 的「第一招」——看到 <code>dy/dt = g(t)h(y)</code> 就丟到兩邊各自積分。
        解會有一個自由常數 A，由初值決定。
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

    .example-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
    }

    .ex-btn {
      font: inherit;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      padding: 6px 11px;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      cursor: pointer;
      color: var(--text);
      transition: all 0.12s;
    }

    .ex-btn:hover { border-color: var(--accent); }
    .ex-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .workbench {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 12px;
    }

    @media (max-width: 680px) {
      .workbench { grid-template-columns: 1fr; }
    }

    .derivation, .viz {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .deriv-head, .viz-head {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 10px;
      text-align: center;
    }

    .step {
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 8px;
      opacity: 0.35;
      transition: all 0.25s;
      background: var(--bg-surface);
    }

    .step.active {
      opacity: 1;
      border-color: var(--accent-30);
      background: var(--bg);
    }

    .step-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 6px;
    }

    .eq-line {
      padding: 4px 0;
      font-size: 13px;
      color: var(--text);
    }

    .eq-line code {
      font-size: 13px;
    }

    .eq-line.big-eq code {
      font-size: 15px;
      font-weight: 600;
      padding: 6px 12px;
    }

    .eq-line.big-eq.special code {
      background: var(--accent);
      color: white;
    }

    .kv-mini {
      display: flex;
      gap: 4px;
      align-items: baseline;
      flex-wrap: wrap;
      font-size: 12px;
      padding: 4px 0;
    }

    .kv-k { color: var(--text-muted); font-size: 11px; }

    .tip {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
      font-style: italic;
    }

    .step-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed var(--border);
    }

    .nav-btn {
      font: inherit;
      font-size: 12px;
      padding: 6px 12px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      border-radius: 6px;
      cursor: pointer;
      color: var(--text);
    }

    .nav-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .nav-btn.primary {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
      font-weight: 600;
    }

    .nav-btn.primary:disabled { opacity: 0.4; }

    .step-counter {
      flex: 1;
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .viz-svg {
      width: 100%;
      display: block;
    }

    .axis {
      font-size: 11px;
      fill: var(--text-muted);
      font-family: 'Noto Sans Math', serif;
      font-style: italic;
    }

    .slider-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      padding: 8px;
      border-radius: 6px;
      background: var(--bg-surface);
    }

    .sl-lab {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
      font-family: 'Noto Sans Math', serif;
    }

    .slider-row input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 44px;
      text-align: right;
    }

    .verify-line {
      margin-top: 8px;
      padding: 8px 12px;
      border: 1px dashed var(--accent);
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
      color: var(--text-secondary);
    }

    .verify-line strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
    }
  `,
})
export class DeCh2SeparableComponent {
  readonly examples = EXAMPLES;
  readonly stepLabels = STEP_LABELS;
  readonly selected = signal<SeparableExample>(EXAMPLES[0]);
  readonly step = signal<number>(1);
  readonly y0 = signal(EXAMPLES[0].y0Default);

  // Fixed verify t (middle of range)
  readonly verifyT = 1;

  switchExample(ex: SeparableExample): void {
    this.selected.set(ex);
    this.step.set(1);
    this.y0.set(ex.y0Default);
  }

  nextStep(): void {
    if (this.step() < 6) this.step.set(this.step() + 1);
  }

  prevStep(): void {
    if (this.step() > 1) this.step.set(this.step() - 1);
  }

  // ===== Plot geometry =====
  // Use an absolute viewBox based on tRange, yRange. 40 px per t unit, varies for y.
  pxPerT(): number { return 40; }
  pxPerY(): number {
    const [yMin, yMax] = this.selected().yRange;
    const span = yMax - yMin;
    return Math.min(60, 160 / span);
  }

  readonly axisBounds = computed(() => {
    const [tMin, tMax] = this.selected().tRange;
    const [yMin, yMax] = this.selected().yRange;
    return {
      xMin: tMin * this.pxPerT(),
      xMax: tMax * this.pxPerT(),
      yMin: -yMax * this.pxPerY(),
      yMax: -yMin * this.pxPerY(),
    };
  });

  readonly viewBox = computed(() => {
    const b = this.axisBounds();
    const pad = 20;
    const w = b.xMax - b.xMin + 2 * pad;
    const h = b.yMax - b.yMin + 2 * pad;
    return `${b.xMin - pad} ${b.yMin - pad} ${w} ${h}`;
  });

  readonly gridT = computed(() => {
    const [tMin, tMax] = this.selected().tRange;
    const lines: { x: number; y1: number; y2: number }[] = [];
    for (let t = Math.ceil(tMin); t <= Math.floor(tMax); t++) {
      if (t === 0) continue;
      lines.push({ x: t * this.pxPerT(), y1: this.axisBounds().yMin, y2: this.axisBounds().yMax });
    }
    return lines;
  });

  readonly gridY = computed(() => {
    const [yMin, yMax] = this.selected().yRange;
    const lines: { y: number; x1: number; x2: number }[] = [];
    for (let yi = Math.ceil(yMin); yi <= Math.floor(yMax); yi++) {
      if (yi === 0) continue;
      lines.push({ y: -yi * this.pxPerY(), x1: this.axisBounds().xMin, x2: this.axisBounds().xMax });
    }
    return lines;
  });

  readonly arrows = computed(() => {
    const [tMin, tMax] = this.selected().tRange;
    const [yMin, yMax] = this.selected().yRange;
    const f = this.selected().f;
    const out: { k: string; x1: number; y1: number; x2: number; y2: number }[] = [];

    const tStep = (tMax - tMin) / 10;
    const yStep = (yMax - yMin) / 10;
    const pxT = this.pxPerT();
    const pxY = this.pxPerY();

    for (let i = 0; i <= 10; i++) {
      for (let j = 0; j <= 10; j++) {
        const t = tMin + i * tStep;
        const y = yMin + j * yStep;
        const slope = f(t, y);
        const cx = t * pxT;
        const cy = -y * pxY;
        const vsSlope = (pxY / pxT) * slope;
        const norm = Math.sqrt(1 + vsSlope * vsSlope);
        const dx = (pxT / norm);
        const dy = -(pxY * slope) / norm;
        const len = Math.sqrt(dx * dx + dy * dy);
        const scale = 9 / len;
        out.push({
          k: `${i}_${j}`,
          x1: cx - dx * scale, y1: cy - dy * scale,
          x2: cx + dx * scale, y2: cy + dy * scale,
        });
      }
    }
    return out;
  });

  readonly solutionPath = computed(() => {
    const ex = this.selected();
    const [tMin, tMax] = ex.tRange;
    const pts: string[] = [];
    const n = 160;
    const pxT = this.pxPerT();
    const pxY = this.pxPerY();
    for (let i = 0; i <= n; i++) {
      const t = tMin + (i / n) * (tMax - tMin);
      const y = ex.solution(this.y0(), t);
      if (!isFinite(y)) continue;
      const yClamped = Math.max(ex.yRange[0] - 2, Math.min(ex.yRange[1] + 2, y));
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${(t * pxT).toFixed(1)} ${(-yClamped * pxY).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly verifyValue = computed(() =>
    this.selected().solution(this.y0(), this.verifyT),
  );

  y0Min(): number { return this.selected().yRange[0] + 0.1; }
  y0Max(): number { return this.selected().yRange[1] - 0.1; }
}
