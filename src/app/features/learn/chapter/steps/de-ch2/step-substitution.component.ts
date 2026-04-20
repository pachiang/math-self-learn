import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type TrickId = 'bernoulli' | 'homogeneous';

interface SubExample {
  id: string;
  trick: TrickId;
  label: string;
  // Original equation
  eqOrig: string;
  shapeNote: string;
  // The substitution
  substitution: string;
  substitutionInverse: string;
  // After substitution
  eqAfter: string;
  afterKind: string; // "線性" or "可分離"
  // Solution of transformed equation
  solutionForU: string;
  // Back-substitute to get y
  finalY: string;
  // For side-by-side viz
  f: (t: number, y: number) => number; // for slope field of original
  solution: (y0: number, t: number) => number;
  y0Default: number;
  tRange: [number, number];
  yRange: [number, number];
}

const EXAMPLES: SubExample[] = [
  {
    id: 'bern-logistic',
    trick: 'bernoulli',
    label: "dy/dt + y = y²  (Bernoulli, n = 2)",
    eqOrig: 'dy/dt + y = y²',
    shapeNote: '標準 Bernoulli：y\u2032 + p(t)y = g(t)·yⁿ，這裡 p = 1, g = 1, n = 2。',
    substitution: 'u = y^{1−n} = y^{−1} = 1/y',
    substitutionInverse: 'y = 1/u',
    eqAfter: 'du/dt − u = −1',
    afterKind: '線性（§2.3 可解）',
    solutionForU: 'u(t) = 1 + A·e^t',
    finalY: 'y(t) = 1 / (1 + A·e^t),  A = 1/y₀ − 1',
    f: (_t, y) => y * (y - 1),
    solution: (y0, t) => {
      if (Math.abs(y0) < 0.001) return 0;
      const A = 1 / y0 - 1;
      return 1 / (1 + A * Math.exp(t));
    },
    y0Default: 0.5,
    tRange: [-2, 3],
    yRange: [-0.3, 2.2],
  },
  {
    id: 'bern-sq',
    trick: 'bernoulli',
    label: "dy/dt = y + t·y²  (Bernoulli, n = 2)",
    eqOrig: 'dy/dt − y = t·y²',
    shapeNote: 'p = −1, g = t, n = 2。',
    substitution: 'u = 1/y',
    substitutionInverse: 'y = 1/u',
    eqAfter: 'du/dt + u = −t',
    afterKind: '線性（§2.3 可解）',
    solutionForU: 'u(t) = 1 − t + A·e^{−t}',
    finalY: 'y(t) = 1 / (1 − t + A·e^{−t})',
    f: (t, y) => y + t * y * y,
    solution: (y0, t) => {
      const A = 1 / y0 - 1;
      const u = 1 - t + A * Math.exp(-t);
      return 1 / u;
    },
    y0Default: 0.5,
    tRange: [-1, 2.5],
    yRange: [-0.3, 3],
  },
  {
    id: 'hom-1',
    trick: 'homogeneous',
    label: "dy/dt = (y + t) / t  (齊次)",
    eqOrig: 'dy/dt = (y + t) / t = y/t + 1',
    shapeNote: '右側只依賴比值 y/t，是齊次型。',
    substitution: 'v = y/t,  故 y = t·v',
    substitutionInverse: 'y = t · v',
    eqAfter: 't · dv/dt = 1',
    afterKind: '可分離（§2.2 可解）',
    solutionForU: 'v(t) = ln|t| + C',
    finalY: 'y(t) = t · ln|t| + C · t',
    f: (t, y) => (y + t) / Math.max(0.01, t),
    solution: (y0, t) => {
      // y(1) = y0 → C = y0
      if (t <= 0) return NaN;
      return t * Math.log(t) + y0 * t;
    },
    y0Default: 1,
    tRange: [0.2, 3],
    yRange: [-0.5, 4],
  },
  {
    id: 'hom-2',
    trick: 'homogeneous',
    label: "dy/dt = (y² + t²) / (t·y)  (齊次)",
    eqOrig: 'dy/dt = (y² + t²) / (t·y) = (y/t) + (t/y)',
    shapeNote: '右側是 (y/t) 與 (t/y) 的組合——只依賴比值 → 齊次型。',
    substitution: 'v = y/t',
    substitutionInverse: 'y = t · v',
    eqAfter: 't · dv/dt = 1/v',
    afterKind: '可分離（§2.2 可解）',
    solutionForU: 'v² = 2·ln|t| + C',
    finalY: 'y² = t²(2·ln|t| + C)',
    f: (t, y) => (y * y + t * t) / Math.max(0.01, t * y),
    solution: (y0, t) => {
      // y(1) = y0 → v(1) = y0, C = y0²
      if (t <= 0) return NaN;
      const v2 = 2 * Math.log(t) + y0 * y0;
      return t * Math.sqrt(Math.max(0, v2));
    },
    y0Default: 1,
    tRange: [0.3, 3],
    yRange: [-0.5, 4],
  },
];

@Component({
  selector: 'app-de-ch2-substitution',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="代換法：把非線性變線性／可分離" subtitle="§2.5">
      <p>
        有些方程<strong>看起來</strong>不在前三招的攻擊範圍，但只要「<strong>換個變數</strong>」就掉進其中一種了。
        兩個經典的代換技巧：
      </p>
      <div class="mini-grid">
        <div class="mini-card">
          <div class="mini-tag">I</div>
          <div class="mini-title">Bernoulli 方程</div>
          <code class="mini-eq">y′ + p(t)y = g(t)·yⁿ</code>
          <p class="mini-note">代換 <code>u = y^(1−n)</code> → 變線性</p>
        </div>
        <div class="mini-card">
          <div class="mini-tag">II</div>
          <div class="mini-title">齊次方程</div>
          <code class="mini-eq">dy/dt = F(y/t)</code>
          <p class="mini-note">代換 <code>v = y/t</code> → 變可分離</p>
        </div>
      </div>
      <p>
        <strong>共同精神</strong>：辨認一個「亂源」（yⁿ 或 y/t），然後把它<em>當成新變數</em>，方程在新變數裡就會變乾淨。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="挑一個範例 → 看代換如何「清洗」方程">
      <div class="trick-tabs">
        <button class="tab" [class.active]="trick() === 'bernoulli'" (click)="switchTrick('bernoulli')">
          Bernoulli 方程
        </button>
        <button class="tab" [class.active]="trick() === 'homogeneous'" (click)="switchTrick('homogeneous')">
          齊次方程
        </button>
      </div>

      <div class="ex-picker">
        @for (ex of currentExamples(); track ex.id) {
          <button
            class="ex-btn"
            [class.active]="selected().id === ex.id"
            (click)="switchExample(ex)"
          >{{ ex.label }}</button>
        }
      </div>

      <!-- Transformation flow -->
      <div class="transform">
        <div class="tr-stage before">
          <div class="tr-tag">原方程</div>
          <code class="tr-eq">{{ selected().eqOrig }}</code>
          <p class="tr-note">{{ selected().shapeNote }}</p>
        </div>

        <div class="tr-arrow">
          <div class="arrow-body">
            <span class="arrow-lab">代換</span>
            <code class="arrow-code">{{ selected().substitution }}</code>
          </div>
          <div class="arrow-tip">↓</div>
        </div>

        <div class="tr-stage after">
          <div class="tr-tag">新方程</div>
          <code class="tr-eq">{{ selected().eqAfter }}</code>
          <p class="tr-note">
            這是 <strong>{{ selected().afterKind }}</strong>——回到熟悉的技巧。
          </p>
        </div>

        <div class="tr-arrow">
          <div class="arrow-body">
            <span class="arrow-lab">解</span>
          </div>
          <div class="arrow-tip">↓</div>
        </div>

        <div class="tr-stage solved">
          <div class="tr-tag">新變數的解</div>
          <code class="tr-eq">{{ selected().solutionForU }}</code>
        </div>

        <div class="tr-arrow">
          <div class="arrow-body">
            <span class="arrow-lab">代回原變數</span>
            <code class="arrow-code">{{ selected().substitutionInverse }}</code>
          </div>
          <div class="arrow-tip">↓</div>
        </div>

        <div class="tr-stage final">
          <div class="tr-tag">最終 y(t)</div>
          <code class="tr-eq final-eq">{{ selected().finalY }}</code>
        </div>
      </div>

      <!-- Verification: slope field with solution -->
      <div class="verify">
        <div class="verify-head">幾何驗證（拉滑桿改變初值 y₀）</div>
        <svg [attr.viewBox]="viewBox()" class="verify-svg">
          @for (a of arrows(); track a.k) {
            <line
              [attr.x1]="a.x1" [attr.y1]="a.y1"
              [attr.x2]="a.x2" [attr.y2]="a.y2"
              stroke="var(--text-muted)" stroke-width="1"
              stroke-linecap="round" opacity="0.5"
            />
          }
          <line [attr.x1]="ab().xMin" y1="0"
            [attr.x2]="ab().xMax" y2="0"
            stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" [attr.y1]="ab().yMin" x2="0" [attr.y2]="ab().yMax"
            stroke="var(--border-strong)" stroke-width="1" />
          <path [attr.d]="solPath()" fill="none"
            stroke="var(--accent)" stroke-width="2.5" />
          <circle [attr.cx]="refT() * pxPerT()" [attr.cy]="-y0() * pxPerY()"
            r="5" fill="var(--accent)" stroke="white" stroke-width="2" />
        </svg>
        <div class="verify-controls">
          <span class="sl-lab">y({{ refT() }}) =</span>
          <input type="range"
            [min]="y0Min()" [max]="y0Max()" step="0.05"
            [value]="y0()"
            (input)="y0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ y0().toFixed(2) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這一節的精神，跟前三節截然不同：
      </p>
      <ul>
        <li><strong>前三招告訴你「方程長什麼樣就用什麼招」</strong>——可分離、線性、精確各有固定形狀。</li>
        <li><strong>這一招告訴你「方程可以被改造」</strong>——變數換對了，方程自然變簡單。</li>
      </ul>
      <p>
        代換這個想法會在整個數學物理裡一再出現：Fourier 變換、Laplace 變換、正規座標、保形映射——
        本質都是「找對變數，難題就變簡單」。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        遇到長得「怪」的方程不要慌——先看是不是 Bernoulli (y^n) 或齊次 (F(y/t))，
        能代換就代換。代換成功後，整條方程就回到前三招的範圍。
      </p>
    </app-prose-block>
  `,
  styles: `
    .mini-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 12px 0;
    }

    @media (max-width: 560px) {
      .mini-grid { grid-template-columns: 1fr; }
    }

    .mini-card {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg-surface);
      text-align: center;
    }

    .mini-tag {
      display: inline-block;
      width: 24px; height: 24px;
      line-height: 24px;
      background: var(--accent);
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .mini-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 8px; }

    .mini-eq {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      padding: 6px 10px;
      background: var(--accent-10);
      color: var(--accent);
      border-radius: 4px;
      margin-bottom: 6px;
    }

    .mini-note {
      margin: 0;
      font-size: 11px;
      color: var(--text-secondary);
    }

    .mini-note code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
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

    .trick-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }

    .tab {
      font: inherit;
      font-size: 13px;
      padding: 8px 16px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
      flex: 1;
      font-weight: 600;
    }

    .tab:hover { border-color: var(--accent); }
    .tab.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
    }

    .ex-picker { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .ex-btn {
      font: inherit;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      padding: 6px 10px;
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

    .transform {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 18px;
    }

    .tr-stage {
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .tr-stage.before { border-color: rgba(200, 123, 94, 0.35); }
    .tr-stage.after { border-color: rgba(92, 168, 120, 0.35); }
    .tr-stage.solved { border-color: var(--accent-30); }
    .tr-stage.final {
      border-color: var(--accent);
      background: var(--accent-10);
    }

    .tr-tag {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .tr-stage.final .tr-tag { color: var(--accent); }

    .tr-eq {
      display: block;
      text-align: center;
      font-size: 15px;
      padding: 6px 12px;
      margin-bottom: 4px;
    }

    .tr-eq.final-eq {
      font-size: 17px;
      font-weight: 700;
      background: transparent;
    }

    .tr-note {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
      line-height: 1.5;
    }

    .tr-note code { font-size: 12px; }

    .tr-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2px 0;
    }

    .arrow-body {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 3px 10px;
      border: 1px dashed var(--border);
      border-radius: 14px;
      background: var(--bg);
    }

    .arrow-lab {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    .arrow-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      background: transparent;
      padding: 0;
    }

    .arrow-tip {
      font-size: 14px;
      color: var(--accent);
      line-height: 1;
      margin-top: 2px;
    }

    .verify {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .verify-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }

    .verify-svg { width: 100%; display: block; max-width: 420px; margin: 0 auto; }

    .verify-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 8px;
      border-radius: 6px;
      background: var(--bg-surface);
    }

    .sl-lab {
      font-size: 12px;
      font-weight: 700;
      color: var(--accent);
      font-family: 'Noto Sans Math', serif;
      white-space: nowrap;
    }

    .verify-controls input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 44px;
      text-align: right;
    }
  `,
})
export class DeCh2SubstitutionComponent {
  readonly examples = EXAMPLES;
  readonly trick = signal<TrickId>('bernoulli');
  readonly selected = signal<SubExample>(EXAMPLES[0]);
  readonly y0 = signal(EXAMPLES[0].y0Default);

  readonly currentExamples = computed(() =>
    EXAMPLES.filter((e) => e.trick === this.trick()),
  );

  switchTrick(t: TrickId): void {
    this.trick.set(t);
    const first = EXAMPLES.find((e) => e.trick === t)!;
    this.selected.set(first);
    this.y0.set(first.y0Default);
  }

  switchExample(ex: SubExample): void {
    this.selected.set(ex);
    this.y0.set(ex.y0Default);
  }

  refT(): number { return this.selected().trick === 'homogeneous' ? 1 : 0; }

  pxPerT(): number { return 45; }
  pxPerY(): number {
    const [yMin, yMax] = this.selected().yRange;
    return Math.min(50, 120 / (yMax - yMin));
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
    const pad = 18;
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
        let slope = 0;
        try { slope = ex.f(t, y); } catch { continue; }
        if (!isFinite(slope)) continue;
        const clamped = Math.max(-10, Math.min(10, slope));
        const cx = t * pxT, cy = -y * pxY;
        const dx = pxT, dy = -pxY * clamped;
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

  readonly solPath = computed(() => {
    const ex = this.selected();
    const [tMin, tMax] = ex.tRange;
    const pxT = this.pxPerT(), pxY = this.pxPerY();
    const pts: string[] = [];
    const n = 140;
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
