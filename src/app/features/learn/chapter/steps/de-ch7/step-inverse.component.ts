import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface PartialExample {
  id: string;
  Fs: string;
  // Factored form of denominator
  denomFactored: string;
  // Decomposition
  decomp: string;
  // Coefficient calc (shown in body)
  coefCalc: string;
  // Resulting time-domain
  yt: string;
  // Numerical function for plotting
  func: (t: number) => number;
  description: string;
}

const EXAMPLES: PartialExample[] = [
  {
    id: 'distinct',
    Fs: 'F(s) = (2s + 3) / (s² + 3s + 2)',
    denomFactored: '(s + 1)(s + 2)',
    decomp: 'F(s) = A/(s + 1) + B/(s + 2)',
    coefCalc:
      'Cover-up：\n A = (2·(−1) + 3) / (−1 + 2) = 1\n B = (2·(−2) + 3) / (−2 + 1) = 1',
    yt: 'f(t) = e^(−t) + e^(−2t)',
    func: (t) => Math.exp(-t) + Math.exp(-2 * t),
    description: '兩個相異實根 → 兩個簡單指數的組合。',
  },
  {
    id: 'repeated',
    Fs: 'F(s) = (s + 5) / (s + 2)²',
    denomFactored: '(s + 2)²',
    decomp: 'F(s) = A/(s + 2) + B/(s + 2)²',
    coefCalc:
      '展開 s + 5 = A(s + 2) + B\n比對：A = 1, B = 3',
    yt: 'f(t) = e^(−2t) + 3·t·e^(−2t)',
    func: (t) => Math.exp(-2 * t) + 3 * t * Math.exp(-2 * t),
    description: '重根 → 多出一個 t 因子（跟 Ch5 的重根同源）。',
  },
  {
    id: 'complex',
    Fs: 'F(s) = (s + 2) / (s² + 2s + 5)',
    denomFactored: '(s + 1)² + 4',
    decomp: '配方：F(s) = (s + 1)/((s + 1)² + 2²) + (1/2)·(2)/((s + 1)² + 2²)',
    coefCalc:
      '分子 s + 2 = (s + 1) + 1\n對應 s-shift 的 cos + sin：\n ℒ⁻¹[(s+1)/((s+1)²+4)] = e^(−t)·cos(2t)\n ℒ⁻¹[2/((s+1)²+4)] = e^(−t)·sin(2t)',
    yt: 'f(t) = e^(−t)·cos(2t) + (1/2)·e^(−t)·sin(2t)',
    func: (t) => Math.exp(-t) * Math.cos(2 * t) + 0.5 * Math.exp(-t) * Math.sin(2 * t),
    description: '複根 → 衰退正弦組合（欠阻尼振盪）。',
  },
];

const PX_PER_T = 35;
const PX_PER_Y = 30;

@Component({
  selector: 'app-de-ch7-inverse',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="反變換：部分分式" subtitle="§7.3">
      <p>
        上一節解完 Y(s) 後，剩下最後一步：把有理函數 <code>Y(s) = 分子 / 分母</code> 拆成<strong>簡單的碎片</strong>，
        再用變換表把每片變回時域。
      </p>
      <p class="key-idea">
        核心技巧是<strong>部分分式分解</strong>（partial fraction decomposition）——
        把分母因式分解，然後把大分式寫成一堆小分式的和。
      </p>
      <p>
        分母的三種根對應三種碎片：
      </p>
      <div class="cases-grid">
        <div class="case" [style.--col]="'#5ca878'">
          <div class="c-tag">相異實根</div>
          <div class="c-denom">(s − a)(s − b)</div>
          <div class="c-decomp">A/(s−a) + B/(s−b)</div>
          <div class="c-time">→ A·e^(at) + B·e^(bt)</div>
        </div>
        <div class="case" [style.--col]="'#c87b5e'">
          <div class="c-tag">重根</div>
          <div class="c-denom">(s − a)²</div>
          <div class="c-decomp">A/(s−a) + B/(s−a)²</div>
          <div class="c-time">→ A·e^(at) + B·t·e^(at)</div>
        </div>
        <div class="case" [style.--col]="'#5a8aa8'">
          <div class="c-tag">複根</div>
          <div class="c-denom">(s − α)² + β²</div>
          <div class="c-decomp">(s−α)/·· + β/··</div>
          <div class="c-time">→ e^(αt)·(A·cosβt + B·sinβt)</div>
        </div>
      </div>
      <p>
        這三種碎片合起來，就能反變換出任何<strong>有理函數</strong>的 Y(s)——
        也就是任何線性常係數 ODE 的解（不管有無外力，只要 F(t) 也是有理函數的 Laplace）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="挑一個分式，看完整的部分分式 → 反變換流程">
      <div class="picker">
        @for (ex of examples; track ex.id) {
          <button
            class="pick-btn"
            [class.active]="selected().id === ex.id"
            (click)="switchExample(ex)"
          >{{ ex.description }}</button>
        }
      </div>

      <div class="workflow">
        <div class="wf-stage">
          <span class="wf-tag">① 原本的 F(s)</span>
          <code class="wf-eq">{{ selected().Fs }}</code>
        </div>

        <div class="wf-arrow">↓ 分母因式分解</div>

        <div class="wf-stage">
          <span class="wf-tag">② 因式分解後</span>
          <code class="wf-eq">分母 = {{ selected().denomFactored }}</code>
        </div>

        <div class="wf-arrow">↓ 部分分式</div>

        <div class="wf-stage">
          <span class="wf-tag">③ 部分分式形式</span>
          <code class="wf-eq">{{ selected().decomp }}</code>
        </div>

        <div class="wf-arrow">↓ 求係數（cover-up 或比對）</div>

        <div class="wf-stage">
          <span class="wf-tag">④ 係數計算</span>
          <code class="wf-eq pre">{{ selected().coefCalc }}</code>
        </div>

        <div class="wf-arrow">↓ 查表反變換</div>

        <div class="wf-stage final">
          <span class="wf-tag">⑤ 時域解</span>
          <code class="wf-eq final-eq">{{ selected().yt }}</code>
        </div>
      </div>

      <!-- Verify plot -->
      <div class="verify">
        <div class="v-head">f(t) 的圖像</div>
        <svg viewBox="-10 -80 340 160" class="v-svg">
          <line x1="0" y1="0" x2="320" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-70" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="1" />
          <text x="324" y="4" class="ax">t</text>
          <text x="-4" y="-72" class="ax">f(t)</text>

          @for (g of [-1, 1, 2]; track g) {
            <line x1="0" [attr.y1]="-g * PX_PER_Y" x2="320" [attr.y2]="-g * PX_PER_Y"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            <text x="-4" [attr.y]="-g * PX_PER_Y + 3" class="tick">{{ g }}</text>
          }

          <path [attr.d]="solutionPath()" fill="none"
            stroke="var(--accent)" stroke-width="2.2" />
        </svg>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        幾個關鍵技巧：
      </p>
      <ul>
        <li><strong>Cover-up 法</strong>：對相異實根最快——要求 A = 分子(s=a) / 其他因式(s=a)。只要蓋住 (s−a) 就能讀出 A。</li>
        <li><strong>比較係數法</strong>：對重根或複根要小心展開後比對每個 s 冪次的係數。</li>
        <li><strong>配方</strong>：分母是 s² + bs + c 無實根時，寫成 (s + b/2)² + (c − b²/4)，配出 s-shift 的形式。</li>
      </ul>
      <p>
        如果你熟悉「<strong>特徵多項式的根</strong>」（Ch5），反變換就特別直觀——
        它的根決定了時域的指數／振盪模式。
        這跟 Ch5 的 ar² + br + c = 0 的三種根是<strong>同一個故事</strong>，只是語言不同。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        反變換 = 因式分解分母 + 部分分式 + 查表。
        三種碎片（實根 / 重根 / 複根）對應三種時域行為（e^(at) / t·e^(at) / e^(αt)·sin, cos）。
        下一節看 Laplace 對付非平滑輸入（階梯、衝擊）的威力。
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

    .cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }

    .case {
      padding: 14px;
      border: 1.5px solid var(--col);
      border-radius: 10px;
      background: color-mix(in srgb, var(--col) 5%, var(--bg));
    }

    .c-tag {
      font-size: 11px;
      font-weight: 700;
      color: var(--col);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .c-denom, .c-decomp, .c-time {
      display: block;
      margin: 4px 0;
      padding: 4px 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      background: var(--bg-surface);
      border-radius: 4px;
    }

    .c-denom { color: var(--text); }
    .c-decomp { color: var(--text-secondary); }
    .c-time {
      color: var(--col);
      font-weight: 600;
      border: 1px dashed var(--col);
      background: transparent;
    }

    .picker {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .pick-btn {
      font: inherit;
      font-size: 12px;
      padding: 6px 12px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
    }

    .pick-btn:hover { border-color: var(--accent); }
    .pick-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .workflow {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 14px;
    }

    .wf-stage {
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .wf-stage.final {
      border-color: var(--accent);
      background: var(--accent-10);
    }

    .wf-tag {
      display: block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .wf-stage.final .wf-tag { color: var(--accent); }

    .wf-eq {
      display: block;
      text-align: center;
      font-size: 14px;
      padding: 6px 10px;
    }

    .wf-eq.pre {
      white-space: pre-wrap;
      text-align: left;
      line-height: 1.8;
    }

    .wf-eq.final-eq {
      font-size: 16px;
      font-weight: 700;
      background: transparent;
    }

    .wf-arrow {
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      padding: 2px 0;
    }

    .verify {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .v-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .v-svg { width: 100%; display: block; }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: end;
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class DeCh7InverseComponent {
  readonly examples = EXAMPLES;
  readonly selected = signal<PartialExample>(EXAMPLES[0]);
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;

  switchExample(ex: PartialExample): void {
    this.selected.set(ex);
  }

  readonly solutionPath = computed(() => {
    const pts: string[] = [];
    const n = 200;
    const tMax = 8;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * tMax;
      const y = this.selected().func(t);
      const yc = Math.max(-2.5, Math.min(2.5, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-yc * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });
}
