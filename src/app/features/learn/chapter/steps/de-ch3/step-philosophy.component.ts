import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface UniversalPattern {
  id: string;
  name: string;
  shape: string;
  examples: { phenomenon: string; var: string; star: string }[];
}

const PATTERNS: UniversalPattern[] = [
  {
    id: 'attractor',
    name: '「被拉向穩態」',
    shape: 'dy/dt = -k (y - y*)',
    examples: [
      { phenomenon: '牛頓冷卻', var: 'T', star: 'T_env' },
      { phenomenon: 'RC 充電', var: 'V', star: 'V_0' },
      { phenomenon: '混合槽', var: 'c', star: 'c_in' },
      { phenomenon: '藥物消除', var: 'C', star: '0' },
      { phenomenon: '學習曲線', var: 'P', star: 'P_max' },
    ],
  },
  {
    id: 'exp',
    name: '「沒有天花板的成長／衰退」',
    shape: 'dy/dt = r y',
    examples: [
      { phenomenon: '指數成長', var: 'N', star: '—' },
      { phenomenon: '複利', var: 'M', star: '—' },
      { phenomenon: '輻射衰變', var: 'N', star: '—' },
      { phenomenon: '未封頂傳染', var: 'I', star: '—' },
    ],
  },
  {
    id: 'logistic',
    name: '「有承載量」',
    shape: 'dy/dt = r y (1 - y/K)',
    examples: [
      { phenomenon: 'Logistic 族群', var: 'N', star: 'K' },
      { phenomenon: '病毒飽和傳染', var: 'I', star: 'P' },
      { phenomenon: '技術採用', var: 'x', star: '1' },
      { phenomenon: '自催化反應', var: 'c', star: 'c_max' },
    ],
  },
  {
    id: 'gravity-drag',
    name: '「驅動力 + 阻力」',
    shape: 'dv/dt = F - k v',
    examples: [
      { phenomenon: '自由落體+阻力', var: 'v', star: 'g/k' },
      { phenomenon: '彈道 y 方向', var: 'v_y', star: '-g/k' },
      { phenomenon: '電阻 + 電池（RL）', var: 'I', star: 'V/R' },
    ],
  },
];

interface DimensionalExample {
  id: string;
  equation: string;
  yDim: string;
  rhs: string;
  kDim: string;
  tau: string;
}

const DIM_EXAMPLES: DimensionalExample[] = [
  {
    id: 'cooling',
    equation: 'dT/dt = -k(T - T_a)',
    yDim: '[T] = 溫度',
    rhs: '[dT/dt] = 溫度/時間',
    kDim: '[k] = 1/時間',
    tau: 'τ = 1/k (單位：時間)',
  },
  {
    id: 'rc',
    equation: 'RC · dV/dt + V = V_0',
    yDim: '[V] = 電壓',
    rhs: '[RC · dV/dt] = 電阻·電容·電壓/時間',
    kDim: '[RC] = 時間（因為 Ω·F = 秒）',
    tau: 'τ = RC',
  },
  {
    id: 'mixing',
    equation: 'V dc/dt = r(c_in - c)',
    yDim: '[c] = 質量/體積',
    rhs: '[V dc/dt] = 體積·質量/(體積·時間) = 質量/時間',
    kDim: '[r] = 體積/時間（流速）',
    tau: 'τ = V/r',
  },
];

@Component({
  selector: 'app-de-ch3-philosophy',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="建模的哲學 + 預告" subtitle="§3.7">
      <p>
        五個看似無關的情境——咖啡、混合槽、電路、彈道、族群——
        被我們用同一組工具處理完。這一節抽身一步，看這些例子告訴我們什麼關於「建模」這件事。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="模式一：同一個方程結構會反覆出現">
      <p class="intro-p">
        看過這麼多例子你會發現：<strong>物理界的多樣性背後，只有幾個重複出現的 ODE 結構</strong>。
        選一個模式，看它在不同領域的化身。
      </p>

      <div class="pattern-tabs">
        @for (p of patterns; track p.id) {
          <button
            class="pat-tab"
            [class.active]="selectedPattern().id === p.id"
            (click)="selectedPattern.set(p)"
          >{{ p.name }}</button>
        }
      </div>

      <div class="pattern-body">
        <div class="pattern-eq">
          <span class="eq-lab">共通形狀</span>
          <code class="eq-code">{{ selectedPattern().shape }}</code>
        </div>

        <div class="pattern-table">
          <div class="tbl-head">
            <span>現象</span>
            <span>狀態變數 y</span>
            <span>穩態 y*</span>
          </div>
          @for (ex of selectedPattern().examples; track ex.phenomenon) {
            <div class="tbl-row">
              <span class="ph">{{ ex.phenomenon }}</span>
              <code class="var">{{ ex.var }}</code>
              <code class="star">{{ ex.star }}</code>
            </div>
          }
        </div>
      </div>

      <div class="insight-line">
        <strong>洞見：</strong>
        會寫出 dy/dt = <em>f(y, 參數)</em> 很容易；會辨認「這個 f 屬於哪個<strong>通用模式</strong>」，
        才是建模的真功夫。認出模式，你就繼承了整個領域的智慧。
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="模式二：單位不會說謊（量綱分析）">
      <p class="intro-p">
        建模常會產生「這個係數代表什麼？」的疑問。
        答案常常就寫在<strong>單位</strong>裡——把每一項的量綱列出來，就能猜出它的意義。
      </p>

      <div class="dim-grid">
        @for (d of dimExamples; track d.id) {
          <div class="dim-card">
            <code class="dim-eq">{{ d.equation }}</code>
            <div class="dim-row"><span class="dim-k">y 單位</span><span class="dim-v">{{ d.yDim }}</span></div>
            <div class="dim-row"><span class="dim-k">兩邊單位</span><span class="dim-v">{{ d.rhs }}</span></div>
            <div class="dim-row"><span class="dim-k">關鍵常數單位</span><span class="dim-v">{{ d.kDim }}</span></div>
            <div class="dim-row highlight"><span class="dim-k">時間尺度</span><span class="dim-v">{{ d.tau }}</span></div>
          </div>
        }
      </div>

      <div class="insight-line">
        <strong>洞見：</strong>
        所有「線性有吸引子」方程都有一個唯一的<strong>時間尺度 τ</strong>——
        無論是 1/k、RC 還是 V/r，意義都一樣：<em>大約過這麼久，系統就會接近穩態</em>。
        這叫做「<strong>特徵時間</strong>」，是系統分析最重要的量。
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="模式三：模型在哪裡失效？">
      <div class="limits-grid">
        <div class="limit-card">
          <div class="limit-head">
            <span class="limit-tag">指數成長</span>
            <span class="limit-domain">小族群</span>
          </div>
          <p>細菌前幾個世代接近指數；但總會撞上食物上限。→ 換 <strong>Logistic</strong>。</p>
        </div>
        <div class="limit-card">
          <div class="limit-head">
            <span class="limit-tag">牛頓冷卻</span>
            <span class="limit-domain">高溫差</span>
          </div>
          <p>小溫差時正比例很準；高溫差時要考慮<strong>輻射（∝ T⁴）</strong>。就不再是線性。</p>
        </div>
        <div class="limit-card">
          <div class="limit-head">
            <span class="limit-tag">線性阻力</span>
            <span class="limit-domain">高速運動</span>
          </div>
          <p>低速時 F ∝ v 成立；高速時實際是 <strong>F ∝ v²</strong>。沒封閉解，需要數值方法。</p>
        </div>
        <div class="limit-card">
          <div class="limit-head">
            <span class="limit-tag">均勻混合假設</span>
            <span class="limit-domain">大容器</span>
          </div>
          <p>大槽內濃度其實<strong>不均勻</strong>——位置也是變數。從 ODE 升級成 <strong>PDE</strong>（擴散方程）。</p>
        </div>
      </div>

      <div class="insight-line">
        <strong>洞見：</strong>
        <strong>每個模型都有適用範圍</strong>——清楚它的假設，就清楚它會在哪裡失敗。
        負責任的建模者，會同時告訴你「這模型在哪管用」跟「它會在哪崩潰」。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        本章的終點是為後面幾章搭橋：
      </p>
      <div class="bridge-grid">
        <a class="bridge-card" href="/learn/de/ch4/1">
          <div class="bridge-arrow">→</div>
          <div class="bridge-body">
            <div class="bridge-lab">下一章 Ch4</div>
            <div class="bridge-title">數值方法 + 存在唯一性</div>
            <p>當方程沒有封閉解，或模型太複雜——Euler、RK4、adaptive step。
              順便回答：「為什麼解曲線永遠不會交叉？」</p>
          </div>
        </a>
        <a class="bridge-card" href="/learn/de/ch5/1">
          <div class="bridge-arrow">→</div>
          <div class="bridge-body">
            <div class="bridge-lab">Ch5 起 Part II</div>
            <div class="bridge-title">二階 ODE = 振動</div>
            <p>彈簧、單擺、LC 電路、受迫共振——
              一個變數、兩個初值（位置 + 速度）。線性二階有漂亮的理論。</p>
          </div>
        </a>
        <a class="bridge-card" href="/learn/de/ch8/1">
          <div class="bridge-arrow">→</div>
          <div class="bridge-body">
            <div class="bridge-lab">Ch8 起 Part III</div>
            <div class="bridge-title">ODE 系統：相平面</div>
            <p>本章的彈道已經是兩個耦合 ODE 了。
              Ch8 把這推廣：平衡點分類、Lotka-Volterra、混沌。</p>
          </div>
        </a>
      </div>

      <div class="takeaway">
        <p style="margin: 0 0 8px;"><strong>這一節的 take-away：</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          <li>建模是反覆循環：現象 → 假設 → 方程 → 解 → 驗證 → 改假設。</li>
          <li>背後只有少數通用模式（被拉向穩態、指數成長、有承載量、驅動＋阻力）。</li>
          <li>量綱分析與特徵時間 τ 是理解任何模型的第一把鑰匙。</li>
          <li>最好的建模者不只懂「模型怎麼用」，更懂「模型在哪裡失效」。</li>
        </ul>
      </div>
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

    .intro-p {
      margin: 0 0 14px;
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .pattern-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .pat-tab {
      font: inherit;
      font-size: 13px;
      padding: 7px 12px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
      flex: 1;
      min-width: 140px;
    }

    .pat-tab:hover { border-color: var(--accent); }
    .pat-tab.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .pattern-body {
      padding: 14px;
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      background: var(--bg);
    }

    .pattern-eq {
      text-align: center;
      padding-bottom: 10px;
      margin-bottom: 10px;
      border-bottom: 1px dashed var(--border);
    }

    .eq-lab {
      display: block;
      font-size: 10px;
      color: var(--text-muted);
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .eq-code {
      font-size: 17px;
      font-weight: 600;
      padding: 6px 14px;
    }

    .pattern-table {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tbl-head, .tbl-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 8px;
      padding: 6px 10px;
      align-items: center;
      font-size: 13px;
    }

    .tbl-head {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }

    .tbl-row {
      background: var(--bg-surface);
      border-radius: 4px;
    }

    .ph { color: var(--text); }

    .var, .star {
      font-size: 12px;
      padding: 2px 8px;
      text-align: center;
    }

    .star { background: color-mix(in srgb, #5ca878 15%, var(--bg-surface)); color: #5ca878; }

    .insight-line {
      margin-top: 14px;
      padding: 12px 14px;
      border-left: 3px solid var(--accent);
      background: var(--bg-surface);
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .insight-line strong { color: var(--accent); }

    .dim-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 10px;
    }

    .dim-card {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .dim-eq {
      display: block;
      text-align: center;
      font-size: 13px;
      padding: 6px 10px;
      margin-bottom: 8px;
      background: var(--accent-10);
      border-radius: 4px;
    }

    .dim-row {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 8px;
      padding: 4px 0;
      font-size: 12px;
      line-height: 1.5;
    }

    .dim-row.highlight {
      margin-top: 6px;
      padding-top: 8px;
      border-top: 1px dashed var(--border);
    }

    .dim-row.highlight .dim-v {
      color: var(--accent);
      font-weight: 700;
    }

    .dim-k {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .dim-v {
      color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }

    .limits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
    }

    .limit-card {
      padding: 12px;
      border: 1px solid rgba(200, 123, 94, 0.3);
      background: rgba(200, 123, 94, 0.05);
      border-radius: 10px;
    }

    .limit-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }

    .limit-tag {
      font-size: 12px;
      font-weight: 700;
      color: #c87b5e;
    }

    .limit-domain {
      font-size: 10px;
      padding: 2px 8px;
      background: rgba(200, 123, 94, 0.15);
      color: #c87b5e;
      border-radius: 10px;
    }

    .limit-card p {
      margin: 0;
      font-size: 12px;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .bridge-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin: 14px 0;
    }

    .bridge-card {
      display: flex;
      gap: 10px;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg-surface);
      text-decoration: none;
      color: inherit;
      transition: all 0.15s;
    }

    .bridge-card:hover {
      border-color: var(--accent);
      background: var(--accent-10);
    }

    .bridge-arrow {
      font-size: 24px;
      color: var(--accent);
      font-weight: 700;
      line-height: 1;
      padding-top: 4px;
    }

    .bridge-lab {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .bridge-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      margin: 2px 0 6px;
    }

    .bridge-body p {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  `,
})
export class DeCh3PhilosophyComponent {
  readonly patterns = PATTERNS;
  readonly dimExamples = DIM_EXAMPLES;
  readonly selectedPattern = signal<UniversalPattern>(PATTERNS[0]);
}
