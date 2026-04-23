import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface ForcingType {
  id: string;
  label: string;
  forceExpr: string;
  guessForm: string;
  description: string;
}

const TYPES: ForcingType[] = [
  {
    id: 'exp',
    label: '指數',
    forceExpr: 'F(t) = F₀ · e^(αt)',
    guessForm: 'y_p = A · e^(αt)',
    description: '對指數函數微分仍是指數（同 α）。假設 y_p 也是指數形式，係數 A 由代入決定。',
  },
  {
    id: 'sincos',
    label: '正弦／餘弦',
    forceExpr: 'F(t) = F₀ · cos(Ωt) 或 F₀ · sin(Ωt)',
    guessForm: 'y_p = A·cos(Ωt) + B·sin(Ωt)',
    description:
      '微分 cos 變 −sin，兩個一起猜才能匹配。A, B 由代入後同類項係數比較求得。',
  },
  {
    id: 'poly',
    label: '多項式',
    forceExpr: 'F(t) = 多項式  (例 t² + 2t + 1)',
    guessForm: 'y_p = A·t² + B·t + C',
    description:
      '多項式的導數還是多項式（次數降 1）。假設 y_p 為相同次數多項式，解出所有係數。',
  },
  {
    id: 'product',
    label: '組合／乘積',
    forceExpr: 'F(t) = e^(αt) · cos(Ωt)',
    guessForm: 'y_p = e^(αt)·(A·cos(Ωt) + B·sin(Ωt))',
    description: '乘積也是乘積——把指數提出來，內部用 cos + sin 的線性組合。',
  },
  {
    id: 'resonance',
    label: '共振情況（猜的要改）',
    forceExpr: 'F(t) = cos(ω₀·t)  (驅動頻率 = 自然頻率)',
    guessForm: 'y_p = t·(A·cos(ω₀ t) + B·sin(ω₀ t))',
    description:
      '當外力頻率剛好等於齊次解的自然頻率，原本的「cos + sin」被齊次解吸收了——要多乘一個 t 才行。',
  },
];

/**
 * Example: solve y'' + y = 3 cos(2t). y_p = A cos 2t + B sin 2t, plug in:
 *   y_p'' = -4A cos 2t - 4B sin 2t
 *   y_p'' + y_p = (-4A + A) cos 2t + (-4B + B) sin 2t = -3A cos 2t -3B sin 2t = 3 cos 2t
 *   so -3A = 3 → A = -1; B = 0. y_p = -cos 2t.
 */

const EXAMPLE_STEPS = [
  {
    n: 1,
    title: '寫下方程與外力',
    body: '方程：y″ + y = 3·cos(2t)',
    explain: '齊次方程 y″ + y = 0 的特徵方程 r² + 1 = 0，根 ±i。齊次解 y_h = C₁·cos(t) + C₂·sin(t)。',
  },
  {
    n: 2,
    title: '猜特解形式',
    body: 'y_p = A·cos(2t) + B·sin(2t)',
    explain: '外力是 cos(2t)，頻率 2 ≠ 1（自然頻率）——不是共振。用標準「cos + sin」猜。',
  },
  {
    n: 3,
    title: '算 y_p″',
    body: 'y_p″ = −4A·cos(2t) − 4B·sin(2t)',
    explain: '對 cos(2t) 微分兩次，係數變為 −(2)² = −4。sin(2t) 同理。',
  },
  {
    n: 4,
    title: '代入方程、合併同類項',
    body: 'y_p″ + y_p = (−4A + A)·cos(2t) + (−4B + B)·sin(2t) = −3A·cos(2t) − 3B·sin(2t)',
    explain: '左邊變成 cos(2t) 項 × 係數 + sin(2t) 項 × 係數。',
  },
  {
    n: 5,
    title: '比較係數',
    body: '−3A = 3  →  A = −1\n−3B = 0  →  B = 0',
    explain: '右邊是 3·cos(2t)，所以 cos 項係數要等於 3、sin 項係數要等於 0。',
  },
  {
    n: 6,
    title: '寫出特解',
    body: 'y_p(t) = −cos(2t)',
    explain: '通解：y(t) = C₁·cos(t) + C₂·sin(t) − cos(2t)。由初值鎖定 C₁, C₂。',
  },
];

@Component({
  selector: 'app-de-ch6-undetermined',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="未定係數法" subtitle="§6.2">
      <p>
        上一節講到<strong>特解 y_p</strong> 的存在。但怎麼找到它？
        對於<strong>特定類別的外力</strong>——指數、正弦、多項式——有個簡單到驚人的方法：
      </p>
      <p class="key-idea">
        <strong>觀察 F(t) 的形式 → 假設 y_p 是「類似形式」 → 代入求係數</strong>。
      </p>
      <p>
        這叫「<strong>未定係數法</strong>」（method of undetermined coefficients）。
        它之所以有效，是因為這三類函數在微分下<strong>保持自己的形式</strong>：指數還是指數、sin / cos 互換、多項式的導數還是多項式。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="依外力 F(t) 的形式選對的「猜」">
      <div class="types-grid">
        @for (ty of types; track ty.id) {
          <button
            class="type-card"
            [class.active]="selectedType().id === ty.id"
            (click)="selectedType.set(ty)"
          >
            <div class="t-label">{{ ty.label }}</div>
            <code class="t-force">{{ ty.forceExpr }}</code>
          </button>
        }
      </div>

      <div class="type-detail">
        <div class="td-row">
          <span class="td-k">外力</span>
          <code class="td-v force">{{ selectedType().forceExpr }}</code>
        </div>
        <div class="td-row">
          <span class="td-k">猜 y_p 為</span>
          <code class="td-v guess">{{ selectedType().guessForm }}</code>
        </div>
        <p class="td-desc">{{ selectedType().description }}</p>
      </div>

      <div class="resonance-warn">
        ⚠ <strong>特殊情況</strong>：如果「猜的形式」恰好是齊次解的一部分（例如 F(t) = cos(ω₀t)），
        要在猜的式子前<strong>乘一個 t</strong>（或 t²，若重根）才行。這就是「共振」的數學訊號——§6.3 會細看。
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="完整範例：y″ + y = 3·cos(2t)。六步解完">
      <div class="example-steps">
        @for (s of exampleSteps; track s.n) {
          <div class="ex-step" [class.visible]="step() >= s.n">
            <div class="ex-head">
              <span class="step-num">{{ s.n }}</span>
              <div class="step-title">{{ s.title }}</div>
            </div>
            @if (step() >= s.n) {
              <code class="step-body">{{ s.body }}</code>
              <p class="step-explain">{{ s.explain }}</p>
            }
          </div>
        }
      </div>

      <div class="step-nav">
        <button class="nav-btn" [disabled]="step() <= 1" (click)="prevStep()">← 上一步</button>
        <span class="step-counter">{{ step() }} / {{ exampleSteps.length }}</span>
        <button class="nav-btn primary" [disabled]="step() >= exampleSteps.length" (click)="nextStep()">下一步 →</button>
      </div>

      @if (step() >= exampleSteps.length) {
        <!-- Verification -->
        <div class="verify-wrap">
          <div class="verify-head">驗證：y_p(t) = −cos(2t) 與完整解的圖像</div>
          <svg viewBox="-10 -80 340 150" class="verify-svg">
            <line x1="0" y1="0" x2="320" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-70" x2="0" y2="60" stroke="var(--border-strong)" stroke-width="1" />

            @for (g of [-2, -1, 1, 2]; track g) {
              <line x1="0" [attr.y1]="-g * 25" x2="320" [attr.y2]="-g * 25"
                stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            }

            <path [attr.d]="verifyForcePath" fill="none"
              stroke="#c87b5e" stroke-width="1.5" opacity="0.7" />
            <path [attr.d]="verifyYpPath" fill="none"
              stroke="#5ca878" stroke-width="1.8" />
            <path [attr.d]="verifyYPath" fill="none"
              stroke="var(--accent)" stroke-width="2.2" />
          </svg>
          <div class="verify-legend">
            <span class="leg"><span class="leg-dot" style="background:#c87b5e"></span>F(t) = 3cos(2t)</span>
            <span class="leg"><span class="leg-dot" style="background:#5ca878"></span>y_p = −cos(2t)</span>
            <span class="leg"><span class="leg-dot" style="background:var(--accent)"></span>完整解（y(0)=0, y′(0)=0）</span>
          </div>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        未定係數法的限制：
      </p>
      <ul>
        <li>外力必須是<strong>指數、正弦／餘弦、多項式、或這些的乘積／和</strong>。</li>
        <li>如果 F(t) 是 1/t、ln(t)、tan(t) 這類「奇怪」函數，這招就失效——得用<strong>變異參數法</strong>（Variation of Parameters），大學高年級教材會深入。</li>
        <li><strong>完全任意的 F(t)</strong>（衝擊、方波、階躍）→ 需要 <strong>Laplace 變換</strong>（Ch7 主題）。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        未定係數法：看 F(t) 長相 → 猜 y_p 相似形式 → 代入解係數。
        只對指數／正弦／多項式類型有效，但這類外力幾乎涵蓋了課本題目的 90%。
        下一節要看當「猜」失效的那一刻——共振。
      </p>
    </app-prose-block>
  `,
  styles: `
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

    .types-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
      margin-bottom: 14px;
    }

    .type-card {
      font: inherit;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px 12px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 10px;
      cursor: pointer;
      color: var(--text);
      text-align: left;
    }

    .type-card:hover { border-color: var(--accent); }
    .type-card.active {
      border-color: var(--accent);
      background: var(--accent-10);
    }

    .t-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
    }

    .t-force {
      font-size: 11px;
      padding: 3px 6px;
    }

    .type-detail {
      padding: 14px;
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .td-row {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 10px;
      padding: 6px 0;
      align-items: baseline;
    }

    .td-k {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .td-v {
      font-size: 14px;
      padding: 4px 10px;
    }

    .td-v.force { color: #c87b5e; background: rgba(200, 123, 94, 0.1); }
    .td-v.guess { color: #5ca878; background: rgba(92, 168, 120, 0.1); }

    .td-desc {
      margin: 8px 0 0;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .resonance-warn {
      padding: 12px 14px;
      background: rgba(200, 123, 94, 0.08);
      border: 1px solid rgba(200, 123, 94, 0.3);
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .resonance-warn strong { color: #c87b5e; }

    .example-steps {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .ex-step {
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      opacity: 0.3;
      transition: all 0.2s;
    }

    .ex-step.visible {
      opacity: 1;
      border-color: var(--accent-30);
      background: var(--bg);
    }

    .ex-head {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .step-num {
      display: inline-flex;
      width: 22px;
      height: 22px;
      background: var(--accent);
      color: white;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 700;
      justify-content: center;
      align-items: center;
    }

    .step-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
    }

    .step-body {
      display: block;
      padding: 8px 12px;
      margin: 8px 0 4px;
      font-size: 14px;
      font-weight: 600;
      white-space: pre-wrap;
    }

    .step-explain {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .step-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 0;
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

    .step-counter {
      flex: 1;
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .verify-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-top: 12px;
    }

    .verify-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .verify-svg {
      width: 100%;
      display: block;
    }

    .verify-legend {
      display: flex;
      gap: 12px;
      margin-top: 6px;
      font-size: 11px;
      color: var(--text-muted);
      justify-content: center;
      flex-wrap: wrap;
    }

    .leg {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .leg-dot {
      display: inline-block;
      width: 12px;
      height: 3px;
      border-radius: 2px;
    }
  `,
})
export class DeCh6UndeterminedComponent {
  readonly types = TYPES;
  readonly selectedType = signal<ForcingType>(TYPES[1]);
  readonly step = signal(1);
  readonly exampleSteps = EXAMPLE_STEPS;

  nextStep(): void {
    if (this.step() < EXAMPLE_STEPS.length) this.step.set(this.step() + 1);
  }

  prevStep(): void {
    if (this.step() > 1) this.step.set(this.step() - 1);
  }

  // Verify plot: F(t) = 3 cos(2t), y_p = -cos(2t)
  // Full solution with y(0)=0, y'(0)=0:
  //   y_h = C1 cos t + C2 sin t, so y(0) = C1 - 1 = 0 → C1 = 1;
  //   y'(0) = C2 + 0 = 0 → C2 = 0.
  //   y = cos t - cos 2t
  readonly verifyForcePath = (() => {
    const pts: string[] = [];
    const n = 160;
    const tMax = 10;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * tMax;
      const val = 3 * Math.cos(2 * t);
      const clamp = Math.max(-2.5, Math.min(2.5, val));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 32).toFixed(1)} ${(-clamp * 25).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  readonly verifyYpPath = (() => {
    const pts: string[] = [];
    const n = 160;
    const tMax = 10;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * tMax;
      const val = -Math.cos(2 * t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 32).toFixed(1)} ${(-val * 25).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  readonly verifyYPath = (() => {
    const pts: string[] = [];
    const n = 160;
    const tMax = 10;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * tMax;
      const val = Math.cos(t) - Math.cos(2 * t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 32).toFixed(1)} ${(-val * 25).toFixed(1)}`);
    }
    return pts.join(' ');
  })();
}
