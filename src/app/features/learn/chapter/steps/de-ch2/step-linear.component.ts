import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface LinearExample {
  id: string;
  eq: string; // full equation display
  pDisplay: string; // p(t) for display
  gDisplay: string; // g(t) for display
  muFormula: string; // μ(t) = e^{∫p dt}
  muClosed: string; // closed-form μ(t)
  afterMu: string; // μ·y' + μ·p·y = μ·g
  recognized: string; // d/dt(μy) = μg
  integratedForm: string; // μ·y = ∫μg dt + C
  solvedForY: string; // y = (1/μ)(∫μg + C)
  specialY: string; // solution with y(0)=y0
  p: (t: number) => number;
  g: (t: number) => number;
  mu: (t: number) => number;
  solution: (y0: number, t: number) => number;
  f: (t: number, y: number) => number;
  y0Default: number;
  tRange: [number, number];
  yRange: [number, number];
  muYRange: [number, number];
}

const EXAMPLES: LinearExample[] = [
  {
    id: 'linear-t',
    eq: "dy/dt + y = t",
    pDisplay: '1',
    gDisplay: 't',
    muFormula: 'μ(t) = e^{∫1 dt} = e^t',
    muClosed: 'e^t',
    afterMu: 'e^t · y′ + e^t · y = e^t · t',
    recognized: 'd/dt(e^t · y) = t · e^t',
    integratedForm: 'e^t · y = ∫ t·e^t dt = (t−1)·e^t + C',
    solvedForY: 'y = (t−1) + C · e^(−t)',
    specialY: 'y = (t−1) + (y₀ + 1) · e^(−t)',
    p: (_t) => 1,
    g: (t) => t,
    mu: (t) => Math.exp(t),
    solution: (y0, t) => (t - 1) + (y0 + 1) * Math.exp(-t),
    f: (t, y) => t - y,
    y0Default: 1,
    tRange: [0, 4],
    yRange: [-1.5, 3.5],
    muYRange: [0, 55],
  },
  {
    id: 'linear-damped',
    eq: "dy/dt + 2y = 4",
    pDisplay: '2',
    gDisplay: '4',
    muFormula: 'μ(t) = e^{∫2 dt} = e^(2t)',
    muClosed: 'e^(2t)',
    afterMu: 'e^(2t) · y′ + 2·e^(2t) · y = 4·e^(2t)',
    recognized: 'd/dt(e^(2t) · y) = 4·e^(2t)',
    integratedForm: 'e^(2t) · y = 2·e^(2t) + C',
    solvedForY: 'y = 2 + C · e^(−2t)',
    specialY: 'y = 2 + (y₀ − 2) · e^(−2t)',
    p: (_t) => 2,
    g: (_t) => 4,
    mu: (t) => Math.exp(2 * t),
    solution: (y0, t) => 2 + (y0 - 2) * Math.exp(-2 * t),
    f: (_t, y) => 4 - 2 * y,
    y0Default: 0,
    tRange: [0, 3],
    yRange: [-0.5, 3.5],
    muYRange: [0, 400],
  },
  {
    id: 'rc-like',
    eq: "dy/dt + (1/t)·y = 1   (t > 0)",
    pDisplay: '1/t',
    gDisplay: '1',
    muFormula: 'μ(t) = e^{∫(1/t) dt} = e^{ln|t|} = t',
    muClosed: 't',
    afterMu: 't · y′ + y = t',
    recognized: 'd/dt(t · y) = t',
    integratedForm: 't · y = t²/2 + C',
    solvedForY: 'y = t/2 + C/t',
    specialY: 'y = t/2 + (y₀·t₀ − t₀²/2)/t    (t₀ > 0)',
    p: (t) => 1 / t,
    g: (_t) => 1,
    mu: (t) => t,
    // Reference initial at t=1 with y(1)=y0 → C = y0 - 1/2, y = t/2 + (y0 - 1/2)/t
    solution: (y0, t) => t / 2 + (y0 - 0.5) / Math.max(0.05, t),
    f: (t, y) => 1 - y / Math.max(0.05, t),
    y0Default: 1.5,
    tRange: [0.3, 3.5],
    yRange: [-1, 3.5],
    muYRange: [0, 4],
  },
];

const STEP_LABELS = [
  '① 辨認為標準線性形式',
  '② 算積分因子 μ(t)',
  '③ 全式乘 μ(t)',
  '④ 認出完美導數 d/dt(μy)',
  '⑤ 兩邊對 t 積分',
  '⑥ 解 y，代入初值',
];

@Component({
  selector: 'app-de-ch2-linear',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="線性一階 + 積分因子" subtitle="§2.3">
      <p>
        可分離這招雖然優雅，可惜只對付得了「<code>g(t)·h(y)</code> 形狀」。
        像 <code>dy/dt + y = t</code> 這種<strong>y 跟 t 混在一起</strong>的方程，分家分不了。
      </p>
      <p class="key-idea">
        但如果方程可以寫成「<strong>線性</strong>」形式：
      </p>
      <div class="centered-eq big">dy/dt + p(t) · y = g(t)</div>
      <p>
        那就有一招魔法：<strong>整條方程乘上一個神秘的 μ(t)</strong>，左邊立刻坍縮成一個完美的導數。
        這個 μ(t) 叫<strong>積分因子</strong>（integrating factor）。
      </p>
      <p>
        它怎麼來的？我們希望乘完 μ 之後：
      </p>
      <div class="centered-eq">μ·y′ + μ·p·y = d/dt(μ·y) = μ′·y + μ·y′</div>
      <p>
        對比兩邊：<code>μ·p = μ′</code>。這個條件迫使
      </p>
      <div class="centered-eq big">μ(t) = e<sup>∫ p(t) dt</sup></div>
      <p>
        就這樣，<strong>光是選一個特殊的 μ，就把原本糾結的線性方程轉化成可以直接積分的形式</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="挑一個範例 → 按下一步，看積分因子怎麼把方程化簡">
      <div class="ex-picker">
        @for (ex of examples; track ex.id) {
          <button
            class="ex-btn"
            [class.active]="selected().id === ex.id"
            (click)="switchExample(ex)"
          >{{ ex.eq }}</button>
        }
      </div>

      <div class="workbench">
        <!-- Left: derivation -->
        <div class="derivation">
          <div class="deriv-head">符號推導</div>

          <div class="step" [class.active]="step() >= 1">
            <div class="step-label">{{ stepLabels[0] }}</div>
            <div class="step-body">
              <div class="eq-line"><code>{{ selected().eq }}</code></div>
              <div class="kv-mini">
                <span class="kv-k">p(t) =</span><code>{{ selected().pDisplay }}</code>
                <span class="kv-k">g(t) =</span><code>{{ selected().gDisplay }}</code>
              </div>
            </div>
          </div>

          <div class="step" [class.active]="step() >= 2">
            <div class="step-label">{{ stepLabels[1] }}</div>
            <div class="step-body">
              <div class="eq-line"><code>{{ selected().muFormula }}</code></div>
              <div class="eq-line big-eq highlight">
                <code>μ(t) = {{ selected().muClosed }}</code>
              </div>
            </div>
          </div>

          <div class="step" [class.active]="step() >= 3">
            <div class="step-label">{{ stepLabels[2] }}</div>
            <div class="step-body">
              <div class="eq-line"><code>{{ selected().afterMu }}</code></div>
            </div>
          </div>

          <div class="step" [class.active]="step() >= 4">
            <div class="step-label">{{ stepLabels[3] }}</div>
            <div class="step-body">
              <div class="eq-line"><code>{{ selected().recognized }}</code></div>
              <div class="tip">左邊由三項崩潰成一個 d/dt(μy)——這是魔法核心。</div>
            </div>
          </div>

          <div class="step" [class.active]="step() >= 5">
            <div class="step-label">{{ stepLabels[4] }}</div>
            <div class="step-body">
              <div class="eq-line"><code>{{ selected().integratedForm }}</code></div>
            </div>
          </div>

          <div class="step" [class.active]="step() >= 6">
            <div class="step-label">{{ stepLabels[5] }}</div>
            <div class="step-body">
              <div class="eq-line"><code>{{ selected().solvedForY }}</code></div>
              <div class="eq-line big-eq special">
                <code>{{ selected().specialY }}</code>
              </div>
            </div>
          </div>

          <div class="step-nav">
            <button class="nav-btn" [disabled]="step() <= 1" (click)="prevStep()">← 上一步</button>
            <span class="step-counter">{{ step() }} / 6</span>
            <button class="nav-btn primary" [disabled]="step() >= 6" (click)="nextStep()">下一步 →</button>
          </div>
        </div>

        <!-- Right: viz -->
        <div class="viz">
          <div class="viz-head">μ(t) 與解</div>

          <!-- μ(t) plot -->
          <div class="subviz">
            <div class="subviz-title">積分因子 μ(t) = {{ selected().muClosed }}</div>
            <svg viewBox="-10 -90 260 110" class="mu-svg">
              <line x1="0" y1="0" x2="250" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
              <line x1="0" y1="-85" x2="0" y2="10" stroke="var(--border-strong)" stroke-width="0.8" />
              @if (step() >= 2) {
                <path [attr.d]="muPath()" fill="none"
                  stroke="#5ca878" stroke-width="2.2" />
              }
              <text x="246" y="12" class="axis-lab">t</text>
              <text x="-6" y="-86" class="axis-lab">μ</text>
            </svg>
          </div>

          <!-- Solution curve on slope field -->
          <div class="subviz">
            <div class="subviz-title">解曲線</div>
            <svg [attr.viewBox]="viewBox()" class="sol-svg">
              @for (a of arrows(); track a.k) {
                <line
                  [attr.x1]="a.x1" [attr.y1]="a.y1"
                  [attr.x2]="a.x2" [attr.y2]="a.y2"
                  stroke="var(--text-muted)" stroke-width="1"
                  stroke-linecap="round" opacity="0.55"
                />
              }
              <line [attr.x1]="ab().xMin" y1="0"
                [attr.x2]="ab().xMax" y2="0"
                stroke="var(--border-strong)" stroke-width="1" />
              <line [attr.x1]="ab().xMin" [attr.y1]="ab().yMin"
                [attr.x2]="ab().xMin" [attr.y2]="ab().yMax"
                stroke="var(--border-strong)" stroke-width="1" />

              @if (step() >= 6) {
                <path [attr.d]="solutionPath()" fill="none"
                  stroke="var(--accent)" stroke-width="2.5" />
                <circle [attr.cx]="selected().tRange[0] * pxPerT()"
                  [attr.cy]="-y0() * pxPerY()" r="4.5"
                  fill="var(--accent)" stroke="white" stroke-width="2" />
              }
            </svg>
          </div>

          <div class="slider-row">
            <span class="sl-lab">y(t₀) =</span>
            <input type="range"
              [min]="y0Min()" [max]="y0Max()" step="0.05"
              [value]="y0()"
              (input)="y0.set(+$any($event).target.value)" />
            <span class="sl-val">{{ y0().toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        幾個觀察：
      </p>
      <ul>
        <li><strong>為什麼叫「積分」因子</strong>？因為乘完 μ 之後，左邊變成一個全導數，一積分就消失——整個技巧就是為了讓你能積分。</li>
        <li><strong>p(t) 不一定要是常數</strong>。第三個例子 p = 1/t，算出來 μ = t，然後整條方程變得非常乾淨。</li>
        <li><strong>通解的結構</strong>：<code>y = (特解) + C·e^(−∫p dt)</code>。第一項是「穩態」，第二項是「初始條件的殘影」——隨時間衰退（如果 p > 0）。這個「穩態＋殘影」的結構會一路伴隨你到 Part II。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        線性一階的「殺手招」：先算 μ(t) = e^(∫p dt)，
        然後把整個方程乘上去，左邊自動變成 d/dt(μy)，
        剩下的只是積分 + 代初值。這招也是 Part II 線性二階 ODE 的直接前身。
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

    .ex-picker { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
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
    @media (max-width: 680px) { .workbench { grid-template-columns: 1fr; } }

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
    .step.active { opacity: 1; border-color: var(--accent-30); background: var(--bg); }

    .step-label {
      font-size: 12px; font-weight: 700; color: var(--accent); margin-bottom: 6px;
    }

    .eq-line { padding: 4px 0; font-size: 13px; color: var(--text); }
    .eq-line.big-eq code { font-size: 15px; font-weight: 600; padding: 6px 12px; }
    .eq-line.big-eq.special code { background: var(--accent); color: white; }
    .eq-line.big-eq.highlight code {
      background: rgba(92, 168, 120, 0.18);
      color: #5ca878;
      font-weight: 700;
    }

    .kv-mini {
      display: flex; gap: 6px; align-items: baseline; flex-wrap: wrap;
      font-size: 12px; padding: 4px 0;
    }
    .kv-k { color: var(--text-muted); font-size: 11px; }

    .tip { font-size: 11px; color: var(--text-muted); margin-top: 4px; font-style: italic; }

    .step-nav {
      display: flex; align-items: center; gap: 8px;
      margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border);
    }
    .nav-btn {
      font: inherit; font-size: 12px; padding: 6px 12px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      border-radius: 6px; cursor: pointer; color: var(--text);
    }
    .nav-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .nav-btn.primary {
      background: var(--accent); color: white;
      border-color: var(--accent); font-weight: 600;
    }
    .step-counter {
      flex: 1; text-align: center; font-size: 11px;
      color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
    }

    .subviz {
      padding: 8px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      margin-bottom: 10px;
    }

    .subviz-title {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .mu-svg, .sol-svg { width: 100%; display: block; }

    .axis-lab {
      font-size: 10px; fill: var(--text-muted);
      font-family: 'Noto Sans Math', serif; font-style: italic;
    }

    .slider-row {
      display: flex; align-items: center; gap: 8px;
      margin-top: 10px;
      padding: 8px; border-radius: 6px;
      background: var(--bg-surface);
    }
    .sl-lab {
      font-size: 13px; font-weight: 700; color: var(--accent);
      font-family: 'Noto Sans Math', serif;
    }
    .slider-row input { flex: 1; accent-color: var(--accent); }
    .sl-val {
      font-size: 12px; font-family: 'JetBrains Mono', monospace;
      color: var(--text); min-width: 44px; text-align: right;
    }
  `,
})
export class DeCh2LinearComponent {
  readonly examples = EXAMPLES;
  readonly stepLabels = STEP_LABELS;
  readonly selected = signal<LinearExample>(EXAMPLES[0]);
  readonly step = signal<number>(1);
  readonly y0 = signal(EXAMPLES[0].y0Default);

  switchExample(ex: LinearExample): void {
    this.selected.set(ex);
    this.step.set(1);
    this.y0.set(ex.y0Default);
  }

  nextStep(): void { if (this.step() < 6) this.step.set(this.step() + 1); }
  prevStep(): void { if (this.step() > 1) this.step.set(this.step() - 1); }

  pxPerT(): number { return 50; }
  pxPerY(): number {
    const [yMin, yMax] = this.selected().yRange;
    return Math.min(50, 130 / (yMax - yMin));
  }

  readonly ab = computed(() => {
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
    const b = this.ab();
    const pad = 14;
    return `${b.xMin - pad} ${b.yMin - pad} ${b.xMax - b.xMin + 2 * pad} ${b.yMax - b.yMin + 2 * pad}`;
  });

  readonly arrows = computed(() => {
    const ex = this.selected();
    const [tMin, tMax] = ex.tRange;
    const [yMin, yMax] = ex.yRange;
    const pxT = this.pxPerT(), pxY = this.pxPerY();
    const out: { k: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i <= 10; i++) {
      for (let j = 0; j <= 10; j++) {
        const t = tMin + (i / 10) * (tMax - tMin);
        const y = yMin + (j / 10) * (yMax - yMin);
        const slope = ex.f(t, y);
        const cx = t * pxT;
        const cy = -y * pxY;
        const dx = pxT;
        const dy = -pxY * slope;
        const len = Math.sqrt(dx * dx + dy * dy);
        const scale = 8 / len;
        out.push({
          k: `${i}_${j}`,
          x1: cx - dx * scale, y1: cy - dy * scale,
          x2: cx + dx * scale, y2: cy + dy * scale,
        });
      }
    }
    return out;
  });

  readonly muPath = computed(() => {
    const ex = this.selected();
    const [tMin, tMax] = ex.tRange;
    const [muMin, muMax] = ex.muYRange;
    const pxT = 60;
    const pxMu = 70 / (muMax - muMin);
    const pts: string[] = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const t = tMin + (i / n) * (tMax - tMin);
      const mu = ex.mu(t);
      if (!isFinite(mu)) continue;
      const muClamped = Math.max(muMin, Math.min(muMax, mu));
      const x = (t - tMin) * pxT;
      const y = -muClamped * pxMu;
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly solutionPath = computed(() => {
    const ex = this.selected();
    const [tMin, tMax] = ex.tRange;
    const pts: string[] = [];
    const n = 140;
    const pxT = this.pxPerT(), pxY = this.pxPerY();
    for (let i = 0; i <= n; i++) {
      const t = tMin + (i / n) * (tMax - tMin);
      const y = ex.solution(this.y0(), t);
      if (!isFinite(y)) continue;
      const yClamped = Math.max(ex.yRange[0] - 2, Math.min(ex.yRange[1] + 2, y));
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${(t * pxT).toFixed(1)} ${(-yClamped * pxY).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  y0Min(): number { return this.selected().yRange[0] + 0.2; }
  y0Max(): number { return this.selected().yRange[1] - 0.2; }
}
