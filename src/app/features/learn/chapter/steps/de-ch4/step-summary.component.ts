import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type Leaf =
  | 'separable'
  | 'linear'
  | 'exact'
  | 'substitution'
  | 'adaptive-rk4'
  | 'implicit';

interface DecisionBranch {
  id: string;
  question: string;
  yes: string;
  no: string;
}

interface DecisionLeaf {
  id: Leaf;
  method: string;
  section: string;
  reason: string;
}

const LEAVES: Record<Leaf, DecisionLeaf> = {
  separable: { id: 'separable', method: '可分離', section: '§2.2', reason: '兩邊分家、各自積分' },
  linear: { id: 'linear', method: '線性 + μ', section: '§2.3', reason: '乘積分因子' },
  exact: { id: 'exact', method: '精確方程', section: '§2.4', reason: '找守恆量 F' },
  substitution: { id: 'substitution', method: '代換法', section: '§2.5', reason: 'Bernoulli 或齊次' },
  'adaptive-rk4': { id: 'adaptive-rk4', method: '自適應 RK4/5', section: '§4.4-5', reason: '顯式，精度與效率兼具' },
  implicit: { id: 'implicit', method: '隱式方法 (BDF)', section: '§4.6', reason: '對剛性穩定' },
};

interface ChapterCard {
  id: string;
  chapter: string;
  title: string;
  icon: string;
  bullets: string[];
  color: string;
}

const CH_CARDS: ChapterCard[] = [
  {
    id: 'ch1',
    chapter: 'Ch1',
    title: '什麼是微分方程？',
    icon: '\ud83d\uddfa\ufe0f',
    bullets: [
      '把現象翻譯成 dy/dt = f(t, y)',
      '斜率場 = 方程的地圖',
      '初值問題 = 從解族中選一條',
      '一階／二階、線性／非線性、自治／非自治',
    ],
    color: '#5ca878',
  },
  {
    id: 'ch2',
    chapter: 'Ch2',
    title: '一階 ODE 的解法',
    icon: '\ud83d\udd27',
    bullets: [
      '可分離：g(t)·h(y)',
      '線性：y′ + p(t)y = g(t)',
      '精確：M dt + N dy = 0, ∂M/∂y = ∂N/∂t',
      '代換：Bernoulli / 齊次',
    ],
    color: '#5a8aa8',
  },
  {
    id: 'ch3',
    chapter: 'Ch3',
    title: '建模應用',
    icon: '\ud83d\udd27',
    bullets: [
      '牛頓冷卻、RC 電路、藥物動力學 —— 同一族方程',
      '混合問題（3D 示範）',
      '彈道與阻力（3D 示範）',
      'Logistic + 捕撈：saddle-node 分岔',
    ],
    color: '#8b6aa8',
  },
  {
    id: 'ch4',
    chapter: 'Ch4',
    title: '存在唯一性 + 數值方法',
    icon: '\ud83d\udcbb',
    bullets: [
      'Picard-Lindelöf：Lipschitz 條件保證唯一解',
      'Euler 是 1 階；RK4 是 4 階',
      '自適應：密集取樣劇變區、跳過平緩區',
      '剛性問題：隱式方法才穩',
    ],
    color: '#c87b5e',
  },
];

@Component({
  selector: 'app-de-ch4-summary',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Part I 總結 + Part II 預告" subtitle="§4.7">
      <p>
        你已經走完了 <strong>Part I：一階 ODE 與幾何直覺</strong>——28 節內容、四章主題。
        這節停下來回顧整段旅程，然後跨過第一個分水嶺，前往 <strong>Part II：振動</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Part I 四章的核心精華">
      <div class="chapter-grid">
        @for (c of chapters; track c.id) {
          <div class="ch-card" [style.--col]="c.color">
            <div class="ch-head">
              <span class="ch-icon">{{ c.icon }}</span>
              <div>
                <span class="ch-label">{{ c.chapter }}</span>
                <div class="ch-title">{{ c.title }}</div>
              </div>
            </div>
            <ul class="ch-bullets">
              @for (b of c.bullets; track b) {
                <li>{{ b }}</li>
              }
            </ul>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="面對一條 ODE 該用哪一招？互動決策樹">
      <div class="tree-wrap">
        <div class="tree-stage" [class.hidden]="decision() !== 0">
          <div class="question">Q1: 方程有沒有<strong>封閉形式</strong>可解？（符號可以寫出答案）</div>
          <div class="answers">
            <button class="ans yes" (click)="answer(1)">有 →</button>
            <button class="ans no" (click)="answer(-1)">沒有 / 太複雜 →</button>
          </div>
        </div>

        <div class="tree-stage" [class.hidden]="decision() !== 1">
          <div class="question">Q2: 方程能寫成 <code>dy/dt = g(t)·h(y)</code>？</div>
          <div class="answers">
            <button class="ans yes" (click)="chooseMethod('separable')">能 → §2.2</button>
            <button class="ans no" (click)="answer(2)">不能 →</button>
          </div>
        </div>

        <div class="tree-stage" [class.hidden]="decision() !== 2">
          <div class="question">Q3: 方程能寫成 <code>y′ + p(t)y = g(t)</code>？</div>
          <div class="answers">
            <button class="ans yes" (click)="chooseMethod('linear')">能 → §2.3</button>
            <button class="ans no" (click)="answer(3)">不能 →</button>
          </div>
        </div>

        <div class="tree-stage" [class.hidden]="decision() !== 3">
          <div class="question">Q4: 寫成 <code>M dt + N dy = 0</code> 後，<code>∂M/∂y = ∂N/∂t</code>？</div>
          <div class="answers">
            <button class="ans yes" (click)="chooseMethod('exact')">相等 → §2.4</button>
            <button class="ans no" (click)="chooseMethod('substitution')">不相等 → §2.5 代換法</button>
          </div>
        </div>

        <div class="tree-stage" [class.hidden]="decision() !== -1">
          <div class="question">Q2′: 方程是「<strong>剛性</strong>」嗎？（有很快的時間尺度 λ 讓顯式法不穩）</div>
          <div class="answers">
            <button class="ans yes" (click)="chooseMethod('implicit')">剛性 → §4.6 隱式方法</button>
            <button class="ans no" (click)="chooseMethod('adaptive-rk4')">不剛性 → §4.4-5 自適應 RK4/5</button>
          </div>
        </div>

        @if (chosenLeaf(); as leaf) {
          <div class="leaf-result">
            <div class="leaf-head">推薦技巧</div>
            <div class="leaf-method">{{ leaves[leaf].method }}</div>
            <div class="leaf-sec">{{ leaves[leaf].section }}</div>
            <p class="leaf-reason">{{ leaves[leaf].reason }}</p>
            <button class="restart" (click)="reset()">↻ 再問一題</button>
          </div>
        }

        @if (decision() !== null && chosenLeaf() === null) {
          <button class="back-btn" (click)="reset()">← 重新開始</button>
        }
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="Part II 預告：振動的語言">
      <div class="preview-grid">
        <div class="preview-card">
          <h4>Ch5: 二階線性齊次</h4>
          <p>彈簧—質量—阻尼系統。特徵方程、過阻尼／臨界／欠阻尼、指數 × 正弦 的解。</p>
          <div class="preview-anim">
            <svg viewBox="-100 -40 200 80" class="tiny-svg">
              <!-- Wall -->
              <line x1="-90" y1="-30" x2="-90" y2="30" stroke="var(--text)" stroke-width="2" />
              <!-- Spring -->
              <polyline points="-90,0 -70,-6 -60,6 -50,-6 -40,6 -30,-6 -20,6 -10,0"
                fill="none" stroke="var(--text-muted)" stroke-width="1.2" />
              <!-- Mass -->
              <rect x="-8" y="-12" width="24" height="24" rx="3" fill="var(--accent)" opacity="0.8" />
            </svg>
          </div>
        </div>

        <div class="preview-card">
          <h4>Ch6: 受迫振動 + 共振</h4>
          <p>外力驅動系統。當外力頻率接近自然頻率 → 振幅線性放大。這就是「共振」——物理工程都要小心的現象。</p>
        </div>

        <div class="preview-card">
          <h4>Ch7: Laplace 變換</h4>
          <p>把時域 ODE 變成頻域代數方程。階躍、衝擊響應、延遲訊號——全部化為多項式除法。</p>
        </div>
      </div>

      <div class="next-link">
        <a class="next-cta" href="/learn/de/ch5/1">
          開始 Part II — Ch5 §5.1 →
        </a>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>整個 Part I 的 take-away：</strong>
        <strong>一階 ODE</strong> 是數學與應用科學交界最濃密的區域。
        從幾何看、用符號解、替真實現象建模、用電腦數值跑——同一條方程四種觀點。
        接下來的 Part II 把「一個變數的狀態」升級成「位置 + 速度」——這就是振動。
      </p>
    </app-prose-block>
  `,
  styles: `
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

    .chapter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 10px;
    }

    .ch-card {
      padding: 14px;
      border: 1.5px solid var(--col);
      border-radius: 10px;
      background: color-mix(in srgb, var(--col) 6%, var(--bg));
    }

    .ch-head {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
    }

    .ch-icon {
      font-size: 28px;
    }

    .ch-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--col);
      text-transform: uppercase;
    }

    .ch-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
    }

    .ch-bullets {
      margin: 0;
      padding-left: 18px;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .ch-bullets li { margin-bottom: 4px; }

    .tree-wrap {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      min-height: 160px;
      position: relative;
    }

    .tree-stage {
      transition: all 0.25s;
    }

    .tree-stage.hidden { display: none; }

    .question {
      font-size: 15px;
      text-align: center;
      padding: 14px;
      background: var(--accent-10);
      border-radius: 8px;
      margin-bottom: 14px;
      line-height: 1.6;
      color: var(--text);
    }

    .question strong { color: var(--accent); }

    .answers {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .ans {
      font: inherit;
      font-size: 13px;
      padding: 10px 20px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
      min-width: 140px;
      font-weight: 600;
    }

    .ans.yes:hover {
      border-color: #5ca878;
      background: rgba(92, 168, 120, 0.1);
      color: #5ca878;
    }

    .ans.no:hover {
      border-color: #c87b5e;
      background: rgba(200, 123, 94, 0.1);
      color: #c87b5e;
    }

    .leaf-result {
      text-align: center;
      padding: 20px;
      border: 1.5px solid var(--accent);
      background: var(--accent-10);
      border-radius: 10px;
    }

    .leaf-head {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .leaf-method {
      font-size: 24px;
      font-weight: 700;
      color: var(--accent);
      margin: 6px 0;
    }

    .leaf-sec {
      font-size: 13px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .leaf-reason {
      margin: 10px 0 14px;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .restart, .back-btn {
      font: inherit;
      font-size: 12px;
      padding: 6px 14px;
      border: 1px solid var(--accent);
      background: transparent;
      color: var(--accent);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .back-btn {
      position: absolute;
      top: 12px;
      right: 12px;
    }

    .restart:hover, .back-btn:hover {
      background: var(--accent);
      color: white;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }

    .preview-card {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .preview-card h4 {
      margin: 0 0 8px;
      font-size: 14px;
      color: var(--accent);
    }

    .preview-card p {
      margin: 0 0 10px;
      font-size: 12px;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .preview-anim {
      padding: 6px;
      background: var(--bg-surface);
      border-radius: 6px;
    }

    .tiny-svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .next-link {
      text-align: center;
      padding-top: 14px;
      border-top: 1px dashed var(--border);
    }

    .next-cta {
      display: inline-block;
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 700;
      background: var(--accent);
      color: white;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.15s;
    }

    .next-cta:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px var(--accent-30);
    }
  `,
})
export class DeCh4SummaryComponent {
  readonly chapters = CH_CARDS;
  readonly leaves = LEAVES;

  /**
   * decision state: null = initial, 0 = Q1 shown, 1..3 = Q2-Q4, -1 = numerical branch
   */
  readonly decision = signal<number | null>(0);
  readonly chosenLeaf = signal<Leaf | null>(null);

  answer(next: number): void {
    this.decision.set(next);
  }

  chooseMethod(leaf: Leaf): void {
    this.chosenLeaf.set(leaf);
  }

  reset(): void {
    this.decision.set(0);
    this.chosenLeaf.set(null);
  }
}
