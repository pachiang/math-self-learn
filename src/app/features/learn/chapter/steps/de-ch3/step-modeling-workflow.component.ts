import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type StageId = 'phenomenon' | 'assumptions' | 'variables' | 'ode' | 'solve' | 'validate';

interface Stage {
  id: StageId;
  n: number;
  title: string;
  subtitle: string;
  body: string;
  // angle on circle (degrees, 0 = top, clockwise)
  angle: number;
}

const STAGES: Stage[] = [
  {
    id: 'phenomenon',
    n: 1,
    title: '觀察現象',
    subtitle: '這裡有什麼在變？',
    body: '找出那個會隨時間變化的東西：溫度？數量？電壓？認清主角是誰，是建模的第一步。',
    angle: 0,
  },
  {
    id: 'assumptions',
    n: 2,
    title: '做假設',
    subtitle: '哪些東西我先不管',
    body: '每個模型都建立在簡化上——忽略摩擦、均勻混合、球對稱之類。清楚列出假設比裝作沒有重要。',
    angle: 60,
  },
  {
    id: 'variables',
    n: 3,
    title: '選變數',
    subtitle: '狀態是什麼、怎麼量',
    body: '挑一個（或幾個）變數代表「狀態」——它的單位、範圍、初值。變數選得好，後面方程就自然。',
    angle: 120,
  },
  {
    id: 'ode',
    n: 4,
    title: '寫方程',
    subtitle: '把因果翻譯成 dy/dt',
    body: '從物理／生物／經濟定律寫出 dy/dt = f(t, y)。這通常是最關鍵、也最需要創意的一步。',
    angle: 180,
  },
  {
    id: 'solve',
    n: 5,
    title: '求解',
    subtitle: '分析、解析、或數值',
    body: '用 Ch2 的技巧解析求解，或用斜率場做幾何分析，或用數值方法跑出來。目標是 y(t) 的具體行為。',
    angle: 240,
  },
  {
    id: 'validate',
    n: 6,
    title: '驗證 + 洞見',
    subtitle: '對嗎？告訴我們什麼？',
    body: '跟實驗／數據對照。模型預測對了哪些現象？不符合哪裡？需要改假設嗎？有沒有意外的洞見？',
    angle: 300,
  },
];

interface CaseExample {
  id: string;
  name: string;
  emoji: string;
  color: string;
  stages: Record<StageId, string>;
}

const CASES: CaseExample[] = [
  {
    id: 'cooling',
    name: '牛頓冷卻',
    emoji: '\u2615',
    color: '#c87b5e',
    stages: {
      phenomenon: '熱咖啡擺在桌上，溫度下降。',
      assumptions: '環境溫度穩定；散熱均勻（杯中各處同溫）；沒有蒸發。',
      variables: 'T(t) = 咖啡此刻溫度（°C）；初值 T(0) = 90°C。',
      ode: '降溫速度 ∝ 溫差 → dT/dt = -k (T - T\u2090)。',
      solve: '可分離 / 線性皆可。解為 T(t) = T\u2090 + (T\u2080 - T\u2090) e^(-kt)。',
      validate: '跟溫度計實測對照；發現假設「均勻」在大杯時失真——需細分表面 vs 中心。',
    },
  },
  {
    id: 'population',
    name: '族群成長',
    emoji: '\ud83d\udc07',
    color: '#a89a5c',
    stages: {
      phenomenon: '動物族群隨時間成長。',
      assumptions: '食物充裕；無天敵；資源無限（先這樣假設）。',
      variables: 'N(t) = 族群大小；r = 淨出生率。',
      ode: '出生速度 ∝ 族群大小 → dN/dt = rN。',
      solve: 'N(t) = N\u2080 e^(rt) —— 指數成長。',
      validate: '短期對；長期錯得離譜（N → ∞）。資源有限假設被打破 → 改成 Logistic（§3.6）。',
    },
  },
  {
    id: 'rc',
    name: 'RC 電路',
    emoji: '\u26a1',
    color: '#5a8aa8',
    stages: {
      phenomenon: '電容被電池充電，電壓慢慢爬升。',
      assumptions: '電阻、電容為理想元件；忽略線路電感。',
      variables: 'V(t) = 電容兩端電壓；R = 電阻；C = 電容。',
      ode: 'KVL：V(t) + RC · dV/dt = V\u2080 → dV/dt = (V\u2080 - V)/(RC)。',
      solve: '線性一階。解為 V(t) = V\u2080 (1 - e^(-t/RC))。',
      validate: '跟示波器讀值高度吻合；τ = RC 是「時間常數」——5τ 後約達穩態 99%。',
    },
  },
  {
    id: 'drug',
    name: '藥物動力學',
    emoji: '\ud83d\udc8a',
    color: '#8b6aa8',
    stages: {
      phenomenon: '吃藥後血液中藥物濃度先上升再下降。',
      assumptions: '胃吸收速率固定；肝臟消除為一階反應；單一隔室。',
      variables: 'C(t) = 血中藥物濃度；k\u2090 = 吸收率；k\u2091 = 消除率。',
      ode: 'dC/dt = k\u2090 · Dose · e^(-k\u2090 t) - k\u2091 · C。',
      solve: '線性一階（非齊次）。典型「上升—峰值—衰退」S 形。',
      validate: '藥廠用這模型決定劑量與間隔；多隔室模型（肝、腎）對真實血中濃度擬合更好。',
    },
  },
];

@Component({
  selector: 'app-de-ch3-workflow',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="建模的工作流" subtitle="§3.1">
      <p>
        前兩章學了「ODE 長怎樣」跟「怎麼解」。這一章要做的是最有趣的事：
        <strong>從真實世界出發，自己寫出一條 ODE，解它，然後檢驗它是否符合現實</strong>。
      </p>
      <p>
        這個過程叫<strong>數學建模</strong>。它不是公式題——是一個循環：觀察 → 假設 → 寫方程 → 解 → 驗證 →
        （發現模型不對）改假設再來一輪。
      </p>
      <p class="key-idea">
        <strong>建模的核心是「簡化」</strong>——你永遠不可能把所有細節都寫進方程。
        關鍵是<em>留下最重要的那幾個</em>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點六角上的任一階段 → 看它在實例裡怎麼落實">
      <!-- Cycle diagram + detail panel -->
      <div class="layout">
        <div class="cycle-wrap">
          <svg viewBox="-180 -180 360 360" class="cycle-svg">
            <!-- Circle path (dashed) -->
            <circle cx="0" cy="0" r="120" fill="none"
              stroke="var(--border)" stroke-width="1" stroke-dasharray="3 3" />

            <!-- Arrow markers between stages -->
            @for (arc of arcs; track arc.k) {
              <path [attr.d]="arc.path" fill="none"
                stroke="var(--text-muted)" stroke-width="1.5"
                marker-end="url(#flow-arrow)" opacity="0.55" />
            }

            <defs>
              <marker id="flow-arrow" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                <polygon points="0 0, 6 2.5, 0 5" fill="var(--text-muted)" />
              </marker>
            </defs>

            <!-- Center label -->
            <circle cx="0" cy="0" r="40" fill="var(--accent-10)"
              stroke="var(--accent)" stroke-width="1.5" />
            <text x="0" y="-4" class="center-title">建模</text>
            <text x="0" y="12" class="center-sub">循環</text>

            <!-- Stage nodes -->
            @for (s of stageNodes(); track s.id) {
              <g [attr.transform]="'translate(' + s.x + ', ' + s.y + ')'"
                 class="node"
                 [class.active]="selected() === s.id"
                 (click)="selectStage(s.id)">
                <circle r="30" [attr.fill]="selected() === s.id ? 'var(--accent)' : 'var(--bg-surface)'"
                  [attr.stroke]="selected() === s.id ? 'var(--accent)' : 'var(--border-strong)'"
                  stroke-width="2" />
                <text y="-2" class="node-n"
                  [attr.fill]="selected() === s.id ? 'white' : 'var(--accent)'">
                  {{ s.n }}
                </text>
                <text y="12" class="node-title"
                  [attr.fill]="selected() === s.id ? 'white' : 'var(--text)'">
                  {{ s.short }}
                </text>
              </g>
            }
          </svg>
        </div>

        <div class="detail">
          <div class="detail-head">
            <span class="detail-n">Stage {{ selectedStage().n }}</span>
            <h3 class="detail-title">{{ selectedStage().title }}</h3>
            <p class="detail-subtitle">{{ selectedStage().subtitle }}</p>
          </div>
          <p class="detail-body">{{ selectedStage().body }}</p>
        </div>
      </div>

      <!-- Case walk-through -->
      <div class="case-section">
        <div class="case-head">
          <span class="case-lab">實例走一輪</span>
          <div class="case-tabs">
            @for (c of cases; track c.id) {
              <button
                class="case-tab"
                [class.active]="caseId() === c.id"
                [style.--case-color]="c.color"
                (click)="caseId.set(c.id)"
              >
                <span class="case-emoji">{{ c.emoji }}</span>
                {{ c.name }}
              </button>
            }
          </div>
        </div>

        <div class="case-card" [style.--case-color]="selectedCase().color">
          <div class="case-stage" [class.focus]="selected() === 'phenomenon'">
            <span class="stage-dot">①</span>
            <span class="stage-label">現象</span>
            <span class="stage-text">{{ selectedCase().stages.phenomenon }}</span>
          </div>
          <div class="case-stage" [class.focus]="selected() === 'assumptions'">
            <span class="stage-dot">②</span>
            <span class="stage-label">假設</span>
            <span class="stage-text">{{ selectedCase().stages.assumptions }}</span>
          </div>
          <div class="case-stage" [class.focus]="selected() === 'variables'">
            <span class="stage-dot">③</span>
            <span class="stage-label">變數</span>
            <span class="stage-text">{{ selectedCase().stages.variables }}</span>
          </div>
          <div class="case-stage" [class.focus]="selected() === 'ode'">
            <span class="stage-dot">④</span>
            <span class="stage-label">方程</span>
            <span class="stage-text">{{ selectedCase().stages.ode }}</span>
          </div>
          <div class="case-stage" [class.focus]="selected() === 'solve'">
            <span class="stage-dot">⑤</span>
            <span class="stage-label">求解</span>
            <span class="stage-text">{{ selectedCase().stages.solve }}</span>
          </div>
          <div class="case-stage" [class.focus]="selected() === 'validate'">
            <span class="stage-dot">⑥</span>
            <span class="stage-label">驗證</span>
            <span class="stage-text">{{ selectedCase().stages.validate }}</span>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意幾件事：
      </p>
      <ul>
        <li><strong>建模是循環的</strong>。驗證失敗 → 回去改假設 → 新模型 → 再驗證。真實世界的模型都是這樣被打磨出來的。</li>
        <li><strong>同樣的方程，不同的世界</strong>。牛頓冷卻、RC 充電、藥物衰退——它們的 ODE 結構完全一樣。這是 §3.2 會再回來的主題。</li>
        <li><strong>假設才是靈魂</strong>。兩個工程師看同一個現象，可能因為假設不同寫出完全不同的方程。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        建模 = 把現實壓縮成一條微分方程的過程。
        它有六個階段，而且<strong>是一個循環而不是直線</strong>。
        本章接下來五節，每一節都是一個具體的建模旅程。
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

    .layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 18px;
    }

    @media (max-width: 620px) {
      .layout { grid-template-columns: 1fr; }
    }

    .cycle-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .cycle-svg {
      width: 100%;
      display: block;
      cursor: default;
    }

    .node {
      cursor: pointer;
      transition: all 0.2s;
    }

    .node:hover circle {
      stroke: var(--accent);
    }

    .node-n {
      font-size: 14px;
      font-weight: 700;
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }

    .node-title {
      font-size: 10px;
      text-anchor: middle;
      font-weight: 600;
    }

    .center-title {
      font-size: 14px;
      font-weight: 700;
      fill: var(--accent);
      text-anchor: middle;
    }

    .center-sub {
      font-size: 10px;
      fill: var(--accent);
      text-anchor: middle;
      opacity: 0.7;
    }

    .detail {
      padding: 14px 16px;
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      background: var(--bg);
    }

    .detail-n {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .detail-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--accent);
      margin: 4px 0 2px;
    }

    .detail-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      font-style: italic;
      margin: 0 0 12px;
    }

    .detail-body {
      margin: 0;
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .case-section {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg-surface);
    }

    .case-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .case-lab {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .case-tabs {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      flex: 1;
    }

    .case-tab {
      font: inherit;
      font-size: 12px;
      padding: 5px 10px;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      background: var(--bg);
      cursor: pointer;
      color: var(--text);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .case-tab:hover { border-color: var(--case-color); }
    .case-tab.active {
      border-color: var(--case-color);
      background: color-mix(in srgb, var(--case-color) 12%, var(--bg));
      color: var(--case-color);
      font-weight: 600;
    }

    .case-emoji { font-size: 14px; }

    .case-card {
      padding: 10px;
      border: 1px solid var(--case-color);
      border-radius: 8px;
      background: var(--bg);
    }

    .case-stage {
      display: grid;
      grid-template-columns: 24px 60px 1fr;
      gap: 10px;
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.6;
      align-items: baseline;
      transition: background 0.2s;
    }

    .case-stage.focus {
      background: color-mix(in srgb, var(--case-color) 15%, var(--bg));
    }

    .stage-dot {
      font-size: 14px;
      color: var(--case-color);
      font-weight: 700;
    }

    .stage-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.06em;
    }

    .stage-text {
      color: var(--text);
    }
  `,
})
export class DeCh3WorkflowComponent {
  readonly stages = STAGES;
  readonly cases = CASES;
  readonly selected = signal<StageId>('phenomenon');
  readonly caseId = signal<string>('cooling');

  selectStage(id: StageId): void {
    this.selected.set(id);
  }

  readonly selectedStage = computed(() => STAGES.find((s) => s.id === this.selected())!);
  readonly selectedCase = computed(() => CASES.find((c) => c.id === this.caseId())!);

  // Stage node positions on circle (radius 120)
  readonly stageNodes = computed(() => {
    return STAGES.map((s) => {
      const rad = ((s.angle - 90) * Math.PI) / 180; // 0 deg = top
      return {
        id: s.id,
        n: s.n,
        short: s.title,
        x: 120 * Math.cos(rad),
        y: 120 * Math.sin(rad),
      };
    });
  });

  // Arc arrows between consecutive stages
  readonly arcs = (() => {
    const n = STAGES.length;
    const out: { k: number; path: string }[] = [];
    for (let i = 0; i < n; i++) {
      const a1 = ((STAGES[i].angle - 90) * Math.PI) / 180;
      const a2 = ((STAGES[(i + 1) % n].angle - 90) * Math.PI) / 180;
      const r = 120;
      // Leave a gap at each end so arrow doesn't overlap nodes
      const gap = 0.28;
      const startA = a1 + gap;
      const endA = a2 - gap;
      const x1 = r * Math.cos(startA);
      const y1 = r * Math.sin(startA);
      const x2 = r * Math.cos(endA);
      const y2 = r * Math.sin(endA);
      // Small outward curve
      const midA = (startA + endA) / 2;
      const midR = r + 6;
      const mx = midR * Math.cos(midA);
      const my = midR * Math.sin(midA);
      out.push({
        k: i,
        path: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
      });
    }
    return out;
  })();
}
