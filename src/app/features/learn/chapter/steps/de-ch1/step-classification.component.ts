import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface ClassNode {
  id: string;
  axis: string;
  name: string;
  short: string;
  explain: string;
  example: string;
  exampleDesc: string;
  counterExample?: string;
  /**
   * Which visualization variant the mini preview should render.
   */
  miniKind:
    | 'slope-field'
    | 'sine'
    | 'beam'
    | 'damped'
    | 'pendulum-nonlinear'
    | 'resonance'
    | 'logistic-family'
    | 'y-cos-t';
  miniCaption: string;
}

const NODES: ClassNode[] = [
  // === ORDER ===
  {
    id: 'order-1',
    axis: 'order',
    name: '一階（first-order）',
    short: '一階',
    explain: '方程中最高階導數是 y\'（也就是 dy/dt）。這是最容易可視化、也最容易解的一類。',
    example: 'dy/dt = 2y - t',
    exampleDesc: '指數成長 + 線性擾動',
    counterExample: '',
    miniKind: 'slope-field',
    miniCaption: '只需一張 (t, y) 斜率場 + 一個起點 → 一條解',
  },
  {
    id: 'order-2',
    axis: 'order',
    name: '二階（second-order）',
    short: '二階',
    explain: '最高階導數是 y\'\'（加速度）。所有來自牛頓第二定律的物理方程都是二階：彈簧、鐘擺、行星。',
    example: 'y\'\' + \u03c9² y = 0',
    exampleDesc: '簡諧振動 (彈簧)',
    miniKind: 'sine',
    miniCaption: '二階 = 需要兩個初值（位置 + 速度）。解是正弦波。',
  },
  {
    id: 'order-n',
    axis: 'order',
    name: '高階（n-order）',
    short: '高階',
    explain: '出現 y\'\'\'、y⁽⁴⁾ 以上。例：橋樑彎曲方程 y⁽⁴⁾ = q/EI。高階 ODE 通常可以化成多個一階 ODE 組成的系統。',
    example: 'y\u207d\u2074\u207e = q/EI',
    exampleDesc: '橋樑彎曲',
    miniKind: 'beam',
    miniCaption: 'y(x) 是橋樑的撓曲——需要 4 個邊界條件才能定形狀。',
  },

  // === LINEARITY ===
  {
    id: 'lin-linear',
    axis: 'linearity',
    name: '線性（linear）',
    short: '線性',
    explain: 'y、y\' 等都只以一次方出現，沒有 y²、sin(y)、y·y\' 這種東西。線性 ODE 有完整的理論：疊加原理、指數解、Laplace 變換都成立。',
    example: 'y\'\' + p(t) y\' + q(t) y = g(t)',
    exampleDesc: '線性二階（本門課 Part II 主題）',
    miniKind: 'damped',
    miniCaption: '線性 → 解可寫成「特徵指數 × 三角函數」組合，乾淨。',
  },
  {
    id: 'lin-nonlinear',
    axis: 'linearity',
    name: '非線性（nonlinear）',
    short: '非線性',
    explain: '只要出現 y²、sin(y)、y·y\'、1/y 之類的項就算。非線性是通則，線性是特例。也是所有有趣的行為（極限環、混沌）的來源。',
    example: '\u03b8\'\' + sin(\u03b8) = 0',
    exampleDesc: '真正的鐘擺 (有 sin)',
    miniKind: 'pendulum-nonlinear',
    miniCaption: '小振幅 → 看起來像正弦；大振幅 → 週期被拉長、形狀變形。',
  },

  // === HOMOGENEITY ===
  {
    id: 'homo-yes',
    axis: 'homogeneity',
    name: '齊次（homogeneous）',
    short: '齊次',
    explain: '方程右側為 0。線性齊次方程的解會組成向量空間——解之間可以相加、可以乘常數仍然是解。',
    example: 'y\'\' + 4y = 0',
    exampleDesc: '無外力的彈簧',
    miniKind: 'sine',
    miniCaption: '齊次 → 解是自由振盪。三個初值選擇畫出三條同週期正弦。',
  },
  {
    id: 'homo-no',
    axis: 'homogeneity',
    name: '非齊次（non-homogeneous）',
    short: '非齊次',
    explain: '方程右側不為 0，可能是外部驅動。解 = 齊次通解 + 任一特解（這是一個很優雅的結構）。',
    example: 'y\'\' + 4y = sin(\u03c9 t)',
    exampleDesc: '受外力驅動的彈簧（會共振！）',
    miniKind: 'resonance',
    miniCaption: '當外力頻率 \u03c9 接近自然頻率 → 振幅隨時間<strong>線性放大</strong>（共振）。',
  },

  // === AUTONOMY ===
  {
    id: 'auto-yes',
    axis: 'autonomy',
    name: '自治（autonomous）',
    short: '自治',
    explain: '右側沒有 t 出現，只跟狀態 y 有關。這類方程的斜率場只沿 y 方向變化，相圖分析威力巨大。',
    example: 'dy/dt = y(1 - y)',
    exampleDesc: 'Logistic 方程',
    miniKind: 'logistic-family',
    miniCaption: '自治 → 斜率場每條水平線都相同。所有解都被拉向 y = 1。',
  },
  {
    id: 'auto-no',
    axis: 'autonomy',
    name: '非自治（non-autonomous）',
    short: '非自治',
    explain: '右側明確依賴 t（系統隨時間變化，例如外力、環境變動）。分析比較困難，但物理上常見。',
    example: 'dy/dt = y cos(t)',
    exampleDesc: '週期變動的環境',
    miniKind: 'y-cos-t',
    miniCaption: '斜率場隨 t 波動 → 解也隨環境週期地漲跌。',
  },
];

type Axis = 'order' | 'linearity' | 'homogeneity' | 'autonomy';

const AXIS_LABELS: Record<Axis, string> = {
  order: '階數',
  linearity: '線性 vs 非線性',
  homogeneity: '齊次 vs 非齊次',
  autonomy: '自治 vs 非自治',
};

@Component({
  selector: 'app-de-ch1-classification',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="ODE 的分類地圖" subtitle="§1.6">
      <p>
        「微分方程」這個詞太廣——就像「動物」太廣一樣。當我們說「這是一個 ODE」，通常還會緊接著說出四個標籤：
      </p>
      <ul>
        <li><strong>幾階？</strong>最高幾階導數？</li>
        <li><strong>線性還是非線性？</strong>y 是不是只以一次方出現？</li>
        <li><strong>齊次還是非齊次？</strong>右側是 0 還是有外力？</li>
        <li><strong>自治還是非自治？</strong>右側依不依賴 t？</li>
      </ul>
      <p>
        這四個標籤會決定你可以用哪些工具去攻這個方程。線性+一階很輕鬆，線性+二階+齊次有優雅的特徵方程，
        非線性幾乎沒有通用解法只能靠相圖跟數值。這一節我們把所有分類攤開來。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點任一個分類標籤，看它長什麼樣">
      <div class="axis-nav">
        @for (a of axes; track a) {
          <button
            class="axis-btn"
            [class.active]="axis() === a"
            (click)="axis.set(a)"
          >{{ axisLabel(a) }}</button>
        }
      </div>

      <div class="nodes-row">
        @for (n of currentAxisNodes(); track n.id) {
          <button
            class="node-btn"
            [class.active]="selectedId() === n.id"
            (click)="selectedId.set(n.id)"
          >
            <span class="node-short">{{ n.short }}</span>
            <span class="node-sub">{{ n.name }}</span>
          </button>
        }
      </div>

      @if (selectedNode(); as n) {
        <div class="detail-panel">
          <div class="panel-title">{{ n.name }}</div>
          <p class="panel-explain">{{ n.explain }}</p>

          <div class="example-block">
            <span class="ex-lead">範例</span>
            <code class="ex-eq">{{ n.example }}</code>
            <p class="ex-desc">{{ n.exampleDesc }}</p>

            <!-- Mini visualization of what this example looks like -->
            <div class="mini-viz">
              @switch (n.miniKind) {
                @case ('slope-field') {
                  <svg viewBox="-5 -45 220 90" class="mini-svg">
                    <!-- axes -->
                    <line x1="-2" y1="0" x2="215" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
                    <line x1="0" y1="-42" x2="0" y2="42" stroke="var(--border-strong)" stroke-width="0.8" />
                    <!-- slope field for dy/dt = 2y - t -->
                    @for (a of miniSlopeArrows; track a.k) {
                      <line [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"
                        stroke="var(--text-muted)" stroke-width="0.9" stroke-linecap="round" opacity="0.7" />
                    }
                    <!-- one trajectory -->
                    <path [attr.d]="miniSlopeFieldTraj" fill="none"
                      stroke="var(--accent)" stroke-width="1.8" />
                    <circle cx="10" cy="0" r="3" fill="var(--accent)" stroke="white" stroke-width="1.5" />
                    <text x="212" y="-2" class="mini-lab" text-anchor="end">t</text>
                    <text x="4" y="-38" class="mini-lab">y</text>
                  </svg>
                }
                @case ('sine') {
                  <svg viewBox="-5 -45 220 90" class="mini-svg">
                    <line x1="-2" y1="0" x2="215" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
                    <line x1="0" y1="-42" x2="0" y2="42" stroke="var(--border-strong)" stroke-width="0.8" />
                    <path [attr.d]="miniSineA" fill="none" stroke="var(--accent)" stroke-width="1.8" />
                    <path [attr.d]="miniSineB" fill="none" stroke="#5ca878" stroke-width="1.5" opacity="0.8" />
                    <path [attr.d]="miniSineC" fill="none" stroke="#c87b5e" stroke-width="1.5" opacity="0.8" />
                    <text x="212" y="-2" class="mini-lab" text-anchor="end">t</text>
                    <text x="4" y="-38" class="mini-lab">y</text>
                  </svg>
                }
                @case ('beam') {
                  <svg viewBox="-5 -45 220 90" class="mini-svg">
                    <!-- supports (triangles) at ends -->
                    <polygon points="0,25 -5,40 5,40" fill="var(--text-muted)" opacity="0.7" />
                    <polygon points="200,25 195,40 205,40" fill="var(--text-muted)" opacity="0.7" />
                    <!-- loading arrows from top -->
                    @for (x of [25, 75, 125, 175]; track x) {
                      <line [attr.x1]="x" y1="-38" [attr.x2]="x" y2="-24"
                        stroke="#c87b5e" stroke-width="1.3" marker-end="url(#beamArrow)" />
                    }
                    <defs>
                      <marker id="beamArrow" markerWidth="6" markerHeight="4" refX="4" refY="2" orient="auto">
                        <polygon points="0 0, 6 2, 0 4" fill="#c87b5e" />
                      </marker>
                    </defs>
                    <!-- beam (deflected) -->
                    <path [attr.d]="miniBeam" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" />
                    <!-- ghost straight beam for reference -->
                    <line x1="0" y1="25" x2="200" y2="25"
                      stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />
                    <text x="0" y="-36" class="mini-lab">q (均布荷重)</text>
                  </svg>
                }
                @case ('damped') {
                  <svg viewBox="-5 -45 220 90" class="mini-svg">
                    <line x1="-2" y1="0" x2="215" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
                    <line x1="0" y1="-42" x2="0" y2="42" stroke="var(--border-strong)" stroke-width="0.8" />
                    <!-- envelopes -->
                    <path [attr.d]="miniDampedEnvUp" fill="none"
                      stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />
                    <path [attr.d]="miniDampedEnvLo" fill="none"
                      stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />
                    <path [attr.d]="miniDamped" fill="none" stroke="var(--accent)" stroke-width="1.8" />
                    <text x="212" y="-2" class="mini-lab" text-anchor="end">t</text>
                    <text x="4" y="-38" class="mini-lab">y</text>
                  </svg>
                }
                @case ('pendulum-nonlinear') {
                  <svg viewBox="-5 -45 220 90" class="mini-svg">
                    <line x1="-2" y1="0" x2="215" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
                    <line x1="0" y1="-42" x2="0" y2="42" stroke="var(--border-strong)" stroke-width="0.8" />
                    <path [attr.d]="miniPendSmall" fill="none" stroke="#5ca878" stroke-width="1.6" opacity="0.85" />
                    <path [attr.d]="miniPendBig" fill="none" stroke="var(--accent)" stroke-width="2" />
                    <text x="60" y="-32" class="mini-lab" style="fill: var(--accent)">大振幅（非線性）</text>
                    <text x="60" y="-22" class="mini-lab" style="fill: #5ca878">小振幅（接近正弦）</text>
                  </svg>
                }
                @case ('resonance') {
                  <svg viewBox="-5 -45 220 90" class="mini-svg">
                    <line x1="-2" y1="0" x2="215" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
                    <line x1="0" y1="-42" x2="0" y2="42" stroke="var(--border-strong)" stroke-width="0.8" />
                    <path [attr.d]="miniResEnvUp" fill="none"
                      stroke="#c87b5e" stroke-width="1" stroke-dasharray="3 2" opacity="0.7" />
                    <path [attr.d]="miniResEnvLo" fill="none"
                      stroke="#c87b5e" stroke-width="1" stroke-dasharray="3 2" opacity="0.7" />
                    <path [attr.d]="miniResonance" fill="none" stroke="var(--accent)" stroke-width="1.8" />
                    <text x="100" y="-35" class="mini-lab" style="fill: #c87b5e">振幅線性成長</text>
                  </svg>
                }
                @case ('logistic-family') {
                  <svg viewBox="-5 -50 220 100" class="mini-svg">
                    <line x1="-2" y1="0" x2="215" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
                    <line x1="0" y1="-47" x2="0" y2="47" stroke="var(--border-strong)" stroke-width="0.8" />
                    <!-- equilibria -->
                    <line x1="0" y1="-32" x2="210" y2="-32"
                      stroke="var(--text-muted)" stroke-width="0.7" stroke-dasharray="2 2" />
                    <text x="212" y="-30" class="mini-lab">y=1</text>
                    <!-- Family -->
                    @for (p of miniLogisticFamily; track $index) {
                      <path [attr.d]="p" fill="none" stroke="var(--accent)" stroke-width="1.4" opacity="0.7" />
                    }
                  </svg>
                }
                @case ('y-cos-t') {
                  <svg viewBox="-5 -50 220 100" class="mini-svg">
                    <line x1="-2" y1="0" x2="215" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
                    <line x1="0" y1="-47" x2="0" y2="47" stroke="var(--border-strong)" stroke-width="0.8" />
                    <path [attr.d]="miniYcos" fill="none" stroke="var(--accent)" stroke-width="1.8" />
                    <text x="212" y="-2" class="mini-lab" text-anchor="end">t</text>
                    <text x="4" y="-42" class="mini-lab">y</text>
                  </svg>
                }
              }
              <p class="mini-caption" [innerHTML]="n.miniCaption"></p>
            </div>
          </div>
        </div>
      }
    </app-challenge-card>

    <app-challenge-card prompt="綜合題：猜猜這些方程的四個標籤">
      <div class="quiz">
        @for (q of quiz; track q.id) {
          <div class="quiz-row">
            <div class="q-head">
              <code class="q-eq">{{ q.eq }}</code>
              <button class="reveal-btn" (click)="toggleReveal(q.id)">
                {{ isRevealed(q.id) ? '隱藏' : '顯示標籤' }}
              </button>
            </div>
            @if (isRevealed(q.id)) {
              <div class="q-tags">
                @for (tag of q.tags; track tag) {
                  <span class="q-tag">{{ tag }}</span>
                }
              </div>
              <p class="q-hint">{{ q.hint }}</p>
            }
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        把標籤集合起來，就是一張「ODE 宇宙」的地圖。本門課的主線大致是這樣攻這片地圖的：
      </p>
      <ul>
        <li><strong>Ch2-3（Part I）</strong>：一階 ODE + 各種線性／非線性解法，從最簡單的可分離方程出發。</li>
        <li><strong>Ch5-7（Part II）</strong>：二階線性。齊次先解，再加外力；受迫振動、共振、Laplace 變換。</li>
        <li><strong>Ch8-10（Part III）</strong>：系統（向量 ODE）—— 把二階寫成兩個一階，進入相平面與非線性動力學。</li>
        <li><strong>Ch11-13（Part IV）</strong>：PDE，從 ODE 推廣到多變數（熱、波、Laplace）。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        拿到一個 ODE 先問自己：<em>「幾階？線性嗎？齊次嗎？自治嗎？」</em>
        這四題答完，你就知道要用什麼工具——這是整門課後面所有技巧背後的導航。
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

    .axis-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px;
      border-radius: 10px;
      background: var(--bg);
      border: 1px solid var(--border);
      margin-bottom: 12px;
    }

    .axis-btn {
      flex: 1;
      min-width: 100px;
      font: inherit;
      font-size: 13px;
      padding: 8px 10px;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      cursor: pointer;
      color: var(--text);
      transition: all 0.12s;
    }

    .axis-btn:hover { border-color: var(--accent); }
    .axis-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .nodes-row {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .node-btn {
      flex: 1;
      min-width: 100px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      padding: 10px 14px;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      cursor: pointer;
      font: inherit;
      color: var(--text);
      transition: all 0.12s;
      text-align: left;
    }

    .node-btn:hover { border-color: var(--accent); }
    .node-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
    }

    .node-short {
      font-size: 14px;
      font-weight: 700;
    }

    .node-sub {
      font-size: 11px;
      color: var(--text-muted);
    }

    .detail-panel {
      padding: 16px;
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      background: var(--bg);
    }

    .panel-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 8px;
    }

    .panel-explain {
      margin: 0 0 12px;
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .example-block {
      padding: 12px;
      background: var(--bg-surface);
      border-radius: 8px;
      border: 1px dashed var(--border);
    }

    .ex-lead {
      display: block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .ex-eq {
      display: block;
      text-align: center;
      font-size: 16px;
      font-family: 'JetBrains Mono', monospace;
      padding: 8px;
      color: var(--text);
      background: transparent;
    }

    .ex-desc {
      margin: 4px 0 0;
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
    }

    .mini-viz {
      margin-top: 12px;
      padding: 8px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    .mini-svg {
      width: 100%;
      max-width: 360px;
      display: block;
      margin: 0 auto;
    }

    .mini-lab {
      font-size: 9px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .mini-caption {
      margin: 6px 0 0;
      font-size: 11px;
      color: var(--text-secondary);
      text-align: center;
      line-height: 1.5;
    }

    .quiz {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .quiz-row {
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .q-head {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .q-eq {
      font-size: 14px;
      padding: 4px 10px;
      flex: 1;
      min-width: 0;
    }

    .reveal-btn {
      font: inherit;
      font-size: 11px;
      padding: 4px 10px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      border-radius: 6px;
      cursor: pointer;
      color: var(--text-muted);
    }

    .reveal-btn:hover { color: var(--accent); border-color: var(--accent); }

    .q-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 10px;
    }

    .q-tag {
      font-size: 11px;
      padding: 3px 10px;
      background: var(--accent-10);
      color: var(--accent);
      border-radius: 10px;
      font-weight: 600;
    }

    .q-hint {
      margin: 6px 0 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.6;
    }
  `,
})
export class DeCh1ClassificationComponent {
  readonly axes: Axis[] = ['order', 'linearity', 'homogeneity', 'autonomy'];
  readonly axis = signal<Axis>('order');
  readonly selectedId = signal<string>('order-1');
  readonly revealed = signal<Set<string>>(new Set());

  readonly quiz = [
    {
      id: 'q1',
      eq: "y' = 3y - 5",
      tags: ['一階', '線性', '非齊次', '自治'],
      hint: '右側 3y - 5 不是 0 所以非齊次；沒出現 t 所以自治。',
    },
    {
      id: 'q2',
      eq: "y'' + sin(y) = 0",
      tags: ['二階', '非線性', '齊次', '自治'],
      hint: 'sin(y) 讓它非線性；沒 t、右側是 0 所以自治且齊次。這是真的鐘擺方程。',
    },
    {
      id: 'q3',
      eq: "y'' + 2y' + 5y = cos(\u03c9 t)",
      tags: ['二階', '線性', '非齊次', '非自治'],
      hint: 'cos(\u03c9 t) 讓它非齊次而且非自治。阻尼受迫振動的標準方程。',
    },
    {
      id: 'q4',
      eq: "y' = y²",
      tags: ['一階', '非線性', '齊次', '自治'],
      hint: '右側不是 0 但這裡「齊次」意義是「0 是解」，y² 下 0 仍是解。另外 y² 讓它非線性——會有解在有限時間內爆炸！',
    },
  ];

  axisLabel(a: Axis): string {
    return AXIS_LABELS[a];
  }

  readonly currentAxisNodes = computed(() =>
    NODES.filter((n) => n.axis === this.axis()),
  );

  readonly selectedNode = computed(() => {
    const node = NODES.find((n) => n.id === this.selectedId());
    if (node && node.axis === this.axis()) return node;
    // When switching axis, default to first node of that axis
    const first = NODES.find((n) => n.axis === this.axis());
    if (first) {
      queueMicrotask(() => this.selectedId.set(first.id));
      return first;
    }
    return null;
  });

  toggleReveal(id: string): void {
    const next = new Set(this.revealed());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.revealed.set(next);
  }

  isRevealed(id: string): boolean {
    return this.revealed().has(id);
  }

  // ================ Mini-viz precomputed paths ================
  // SVG convention: x horizontal, y down. Plot bounds roughly x ∈ [0, 210], y ∈ [-40, 40].

  // Slope field for dy/dt = 2y - t, plus one trajectory from (0, 0.3)
  readonly miniSlopeArrows = (() => {
    const arrows: { k: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    // t from 0 to 2, y from -1.5 to 1.5
    for (let ti = 0; ti <= 5; ti++) {
      for (let yi = -3; yi <= 3; yi++) {
        const t = ti * 0.4;
        const y = yi * 0.5;
        const slope = 2 * y - t;
        const cx = t * 100;
        const cy = -y * 20;
        const dx = 8 / Math.sqrt(1 + (slope * 0.2) * (slope * 0.2));
        const dy = -8 * slope * 0.2 / Math.sqrt(1 + (slope * 0.2) * (slope * 0.2));
        arrows.push({
          k: `${ti}_${yi}`,
          x1: cx - dx, y1: cy - dy,
          x2: cx + dx, y2: cy + dy,
        });
      }
    }
    return arrows;
  })();

  readonly miniSlopeFieldTraj = (() => {
    // RK4 from (0, 0.3) for dy/dt = 2y - t
    const f = (t: number, y: number) => 2 * y - t;
    let t = 0.1, y = 0.3;
    const h = 0.01;
    const pts: string[] = [`M ${(t * 100).toFixed(1)} ${(-y * 20).toFixed(1)}`];
    while (t < 2.1) {
      const k1 = f(t, y);
      const k2 = f(t + h / 2, y + (h / 2) * k1);
      const k3 = f(t + h / 2, y + (h / 2) * k2);
      const k4 = f(t + h, y + h * k3);
      y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      t = t + h;
      if (Math.abs(y) > 2 || !isFinite(y)) break;
      pts.push(`L ${(t * 100).toFixed(1)} ${(-y * 20).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  // Sine waves (3 phases/amplitudes)
  readonly miniSineA = this.buildSine(1.0, 0);
  readonly miniSineB = this.buildSine(0.6, 0.4);
  readonly miniSineC = this.buildSine(0.8, -0.6);

  private buildSine(amp: number, phase: number): string {
    const pts: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = (i / 80) * 7;
      const y = amp * Math.cos(1.5 * t + phase);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 30).toFixed(1)} ${(-y * 26).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  // Beam deflection: y(x) = x²(L-x)² (scaled). Support ends go down at middle.
  readonly miniBeam = (() => {
    const L = 200;
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = (i / 60) * L;
      // w(x) ∝ x²(L-x)² — zero at ends, max at x=L/2
      const w = (x * x * (L - x) * (L - x)) / Math.pow(L, 4);
      const y = 25 + w * 14; // deflected downward from baseline y=25
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  // Damped oscillation: y = e^{-0.3 t} cos(2.5 t)
  readonly miniDamped = this.buildDamped(false);
  readonly miniDampedEnvUp = this.buildDamped(true, +1);
  readonly miniDampedEnvLo = this.buildDamped(true, -1);

  private buildDamped(envelope: boolean, sign: number = 1): string {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * 10;
      const env = Math.exp(-0.3 * t);
      const y = envelope ? sign * env : env * Math.cos(2.5 * t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 21).toFixed(1)} ${(-y * 28).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  // Nonlinear pendulum: exact solution (elliptic). Approx: small vs large amplitude
  readonly miniPendSmall = (() => {
    // θ'' + sin θ = 0, small amplitude 0.3 rad — nearly linear
    return this.integratePendulum(0.3, 10, 200, 1.0);
  })();

  readonly miniPendBig = (() => {
    // θ'' + sin θ = 0, large amplitude 2.5 rad — nonlinear distortion
    return this.integratePendulum(2.5, 10, 400, 0.4);
  })();

  private integratePendulum(theta0: number, tMax: number, steps: number, scale: number): string {
    // State: [θ, θ'], RHS = [θ', -sin(θ)]
    let theta = theta0, omega = 0;
    const h = tMax / steps;
    const pts: string[] = [`M 0 ${(-theta * 14 * scale).toFixed(1)}`];
    for (let i = 1; i <= steps; i++) {
      const f1 = (th: number, _om: number) => _om;
      const f2 = (th: number) => -Math.sin(th);
      const k1a = f1(theta, omega);
      const k1b = f2(theta);
      const k2a = f1(theta + h / 2 * k1a, omega + h / 2 * k1b);
      const k2b = f2(theta + h / 2 * k1a);
      const k3a = f1(theta + h / 2 * k2a, omega + h / 2 * k2b);
      const k3b = f2(theta + h / 2 * k2a);
      const k4a = f1(theta + h * k3a, omega + h * k3b);
      const k4b = f2(theta + h * k3a);
      theta += (h / 6) * (k1a + 2 * k2a + 2 * k3a + k4a);
      omega += (h / 6) * (k1b + 2 * k2b + 2 * k3b + k4b);
      const t = i * h;
      pts.push(`L ${(t * 21).toFixed(1)} ${(-theta * 14 * scale).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  // Resonance: y'' + 4y = sin(2t) → solution y = -t/4 cos(2t) (envelope grows linearly)
  readonly miniResonance = (() => {
    const pts: string[] = [];
    for (let i = 0; i <= 150; i++) {
      const t = (i / 150) * 10;
      const y = -(t / 4) * Math.cos(2 * t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 21).toFixed(1)} ${(-y * 15).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  readonly miniResEnvUp = this.buildResEnv(+1);
  readonly miniResEnvLo = this.buildResEnv(-1);

  private buildResEnv(sign: number): string {
    const pts: string[] = [];
    for (let i = 0; i <= 30; i++) {
      const t = (i / 30) * 10;
      const env = sign * (t / 4);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 21).toFixed(1)} ${(-env * 15).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  // Logistic family: dy/dt = y(1-y), multiple initial conditions
  readonly miniLogisticFamily = (() => {
    const y0s = [0.02, 0.1, 0.25, 0.5, 0.75, 1.3, 1.6];
    return y0s.map((y0) => {
      const pts: string[] = [];
      for (let i = 0; i <= 100; i++) {
        const t = (i / 100) * 8 - 1;
        // analytical: y(t) = 1/(1 + c e^{-t}), c = (1-y0)/y0
        const c = (1 - y0) / y0;
        const y = 1 / (1 + c * Math.exp(-t));
        const x = (t + 1) * 21;
        pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(-(y - 0.2) * 40).toFixed(1)}`);
      }
      return pts.join(' ');
    });
  })();

  // dy/dt = y cos(t), analytical y = y0 exp(sin t)
  readonly miniYcos = (() => {
    const pts: string[] = [];
    const y0 = 1;
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * 12;
      const y = y0 * Math.exp(Math.sin(t));
      // center by subtracting mean (e^sin ranges [1/e, e] ≈ [0.37, 2.72])
      const centered = y - 1.4;
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 17.5).toFixed(1)} ${(-centered * 20).toFixed(1)}`);
    }
    return pts.join(' ');
  })();
}
