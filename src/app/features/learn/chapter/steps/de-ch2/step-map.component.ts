import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type TechniqueId =
  | 'separable'
  | 'linear'
  | 'exact'
  | 'substitution'
  | 'numerical';

interface Preset {
  id: string;
  eq: string;
  separable: boolean;
  separableReason: string;
  linear: boolean;
  linearReason: string;
  exact: boolean;
  exactReason: string;
  substitution: boolean;
  substitutionReason: string;
  recommended: TechniqueId;
  path: TechniqueId[]; // ordered path: which checks "yes" in order; last one is recommended
}

const PRESETS: Preset[] = [
  {
    id: 'exp',
    eq: 'dy/dt = y',
    separable: true,
    separableReason: '可寫成 g(t)·h(y) = 1·y',
    linear: true,
    linearReason: '也可以寫成 dy/dt − y = 0',
    exact: false,
    exactReason: '',
    substitution: false,
    substitutionReason: '',
    recommended: 'separable',
    path: ['separable'],
  },
  {
    id: 'logistic',
    eq: 'dy/dt = y(1 − y)',
    separable: true,
    separableReason: '右側純粹是 y 的函數',
    linear: false,
    linearReason: 'y² 項讓它非線性',
    exact: false,
    exactReason: '',
    substitution: true,
    substitutionReason: 'Bernoulli (n = 2)',
    recommended: 'separable',
    path: ['separable'],
  },
  {
    id: 'linear-forced',
    eq: "dy/dt + 2y = t",
    separable: false,
    separableReason: 'y 跟 t 混在同一側無法分家',
    linear: true,
    linearReason: 'y、y′ 皆一次方；p(t) = 2、g(t) = t',
    exact: false,
    exactReason: '',
    substitution: false,
    substitutionReason: '',
    recommended: 'linear',
    path: ['linear'],
  },
  {
    id: 'exact',
    eq: '(2ty + 3) dt + (t² − 1) dy = 0',
    separable: false,
    separableReason: '是微分形式而非 y′ = f 的形式',
    linear: false,
    linearReason: '',
    exact: true,
    exactReason: '∂M/∂y = 2t = ∂N/∂t ✓',
    substitution: false,
    substitutionReason: '',
    recommended: 'exact',
    path: ['exact'],
  },
  {
    id: 'bernoulli',
    eq: "dy/dt + y = y²",
    separable: true,
    separableReason: '也可以，但用 Bernoulli 更直接',
    linear: false,
    linearReason: 'y² 讓它非線性',
    exact: false,
    exactReason: '',
    substitution: true,
    substitutionReason: 'Bernoulli (n = 2)，代換 u = y⁻¹ 變線性',
    recommended: 'substitution',
    path: ['substitution'],
  },
  {
    id: 'homogeneous',
    eq: "dy/dt = (y + t) / t",
    separable: false,
    separableReason: '混在一起',
    linear: false,
    linearReason: '',
    exact: false,
    exactReason: '',
    substitution: true,
    substitutionReason: '可寫成 F(y/t)：齊次型，代換 v = y/t 變可分離',
    recommended: 'substitution',
    path: ['substitution'],
  },
  {
    id: 'numerical',
    eq: 'dy/dt = sin(t·y)',
    separable: false,
    separableReason: 'sin(ty) 不能拆',
    linear: false,
    linearReason: '',
    exact: false,
    exactReason: '',
    substitution: false,
    substitutionReason: '',
    recommended: 'numerical',
    path: ['numerical'],
  },
];

interface CheckStep {
  id: TechniqueId;
  label: string;
  shortLabel: string;
  question: string;
  action: string;
}

const CHECKS: CheckStep[] = [
  {
    id: 'separable',
    label: '§2.2 可分離',
    shortLabel: '分離',
    question: '能寫成 dy/dt = g(t) · h(y) 嗎？',
    action: '分家兩邊積分',
  },
  {
    id: 'linear',
    label: '§2.3 線性 + 積分因子',
    shortLabel: '線性',
    question: '是 dy/dt + p(t)y = g(t) 的形狀嗎？',
    action: '乘積分因子 μ(t)',
  },
  {
    id: 'exact',
    label: '§2.4 精確方程',
    shortLabel: '精確',
    question: '寫成 M dt + N dy = 0 後，∂M/∂y = ∂N/∂t 嗎？',
    action: '找 F 使 dF = 0',
  },
  {
    id: 'substitution',
    label: '§2.5 代換法',
    shortLabel: '代換',
    question: '有 y^n 或 F(y/t) 形式？',
    action: 'Bernoulli / 齊次代換',
  },
  {
    id: 'numerical',
    label: 'Ch4 數值方法',
    shortLabel: '數值',
    question: '沒有公式解？',
    action: '用 RK4 跑數值',
  },
];

@Component({
  selector: 'app-de-ch2-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="解 ODE 的地圖" subtitle="§2.1">
      <p>
        上一章我們認識了微分方程這件事本身——斜率場、解族、初值問題。但我們幾乎沒「解」過任何方程——
        所有曲線都是電腦積分出來的。
      </p>
      <p>
        這一章要換個姿勢：<strong>給定一條方程，能不能直接寫出 y(t) 的公式</strong>？
      </p>
      <p class="key-idea">
        大部分 ODE 沒有封閉解。但有<strong>四招主力</strong>，專吃課本等級＋大量實際應用的題目。
        學會這四招，你會解掉約 90% 的一階 ODE。
      </p>
      <p>本章結構：</p>
      <ol>
        <li><strong>§2.2 可分離</strong>：兩邊分家、各自積分。最容易。</li>
        <li><strong>§2.3 線性 + 積分因子</strong>：y′ + p(t)y = g(t) 的標準攻法。</li>
        <li><strong>§2.4 精確方程</strong>：等高線的視角，連結能量守恆。</li>
        <li><strong>§2.5 代換法</strong>：Bernoulli 與齊次型，把難的變線性／可分離。</li>
      </ol>
      <p>
        做任何題目前，先要<strong>診斷它是哪一種</strong>。下面的互動工具就是在練這件事：
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選一條方程 → 看診斷樹如何走到對應的技巧">
      <div class="preset-picker">
        @for (p of presets; track p.id) {
          <button
            class="preset-btn"
            [class.active]="selected().id === p.id"
            (click)="switchPreset(p)"
          >
            {{ p.eq }}
          </button>
        }
      </div>

      <div class="trace-panel">
        <div class="trace-eq">
          <span class="trace-lead">輸入：</span>
          <code class="trace-code">{{ selected().eq }}</code>
        </div>

        <!-- Diagnostic tree -->
        <div class="tree">
          @for (check of checks; track check.id) {
            <div class="tree-node" [class.pass]="currentPasses(check.id)"
              [class.fail]="currentFailed(check.id)"
              [class.pending]="currentPending(check.id)">

              <div class="node-head">
                <span class="node-icon">
                  @if (currentPasses(check.id)) { ✓ }
                  @else if (currentFailed(check.id)) { ✗ }
                  @else { ? }
                </span>
                <span class="node-question">{{ check.question }}</span>
                <span class="node-method">→ {{ check.label }}</span>
              </div>

              @if (currentPasses(check.id) || currentFailed(check.id)) {
                <div class="node-reason">
                  <strong>{{ currentPasses(check.id) ? 'YES' : 'NO' }}</strong>
                  {{ reasonFor(check.id) }}
                </div>
              }
            </div>
          }
        </div>

        <div class="verdict" [attr.data-kind]="selected().recommended">
          <span class="verdict-lab">推薦技巧</span>
          <div class="verdict-big">{{ recommendedCheck().label }}</div>
          <div class="verdict-action">{{ recommendedCheck().action }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        幾個重點：
      </p>
      <ul>
        <li><strong>有些方程同時吃好幾招</strong>。例如 <code>dy/dt = y</code> 既可分離又是線性；Logistic <code>y′ = y(1−y)</code> 既可分離又能 Bernoulli。通常選最簡單那個。</li>
        <li><strong>診斷順序不是唯一的</strong>，但「先查可分離 → 再查線性 → 再查精確 → 再試代換」是一個省力的預設順序。</li>
        <li><strong>當四招都失敗</strong>，就不是「解不出」，而是「沒有初等閉式」。這時候就靠 Ch4 的數值方法。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        看到 ODE 先問四個問題——可分離？線性？精確？有代換機會？
        這一章接下來五節就是把這四招逐一學會。
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

    .preset-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
    }

    .preset-btn {
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

    .preset-btn:hover { border-color: var(--accent); }
    .preset-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .trace-panel {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .trace-eq {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px dashed var(--border);
      flex-wrap: wrap;
    }

    .trace-lead { font-size: 12px; color: var(--text-muted); }

    .trace-code {
      font-size: 16px;
      font-weight: 600;
      padding: 4px 12px;
    }

    .tree {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
    }

    .tree-node {
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      transition: all 0.2s;
    }

    .tree-node.pending {
      background: var(--bg-surface);
      opacity: 0.55;
    }

    .tree-node.fail {
      background: var(--bg-surface);
      opacity: 0.55;
    }

    .tree-node.pass {
      background: var(--accent-10);
      border-color: var(--accent);
    }

    .node-head {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      font-size: 13px;
    }

    .node-icon {
      display: inline-flex;
      width: 22px;
      height: 22px;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .tree-node.pass .node-icon {
      background: var(--accent);
      color: white;
    }
    .tree-node.fail .node-icon {
      background: var(--border-strong);
      color: var(--bg);
    }
    .tree-node.pending .node-icon {
      background: var(--border);
      color: var(--text-muted);
    }

    .node-question {
      color: var(--text);
      flex: 1;
      min-width: 0;
    }

    .node-method {
      font-size: 11px;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .tree-node.pass .node-method { color: var(--accent); font-weight: 600; }

    .node-reason {
      margin-top: 6px;
      font-size: 12px;
      color: var(--text-secondary);
      padding-left: 32px;
    }

    .node-reason strong {
      display: inline-block;
      font-size: 10px;
      letter-spacing: 0.08em;
      padding: 1px 6px;
      border-radius: 3px;
      margin-right: 6px;
    }

    .tree-node.pass .node-reason strong {
      background: var(--accent);
      color: white;
    }
    .tree-node.fail .node-reason strong {
      background: var(--border-strong);
      color: var(--bg);
    }

    .verdict {
      margin-top: 14px;
      padding: 14px 16px;
      border-radius: 10px;
      border: 1.5px solid var(--accent);
      background: color-mix(in srgb, var(--accent) 8%, var(--bg));
      text-align: center;
    }

    .verdict[data-kind='numerical'] {
      border-color: #c87b5e;
      background: rgba(200, 123, 94, 0.08);
    }

    .verdict-lab {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .verdict-big {
      font-size: 20px;
      font-weight: 700;
      color: var(--accent);
      margin: 4px 0 2px;
    }

    .verdict[data-kind='numerical'] .verdict-big {
      color: #c87b5e;
    }

    .verdict-action {
      font-size: 13px;
      color: var(--text-secondary);
    }
  `,
})
export class DeCh2MapComponent {
  readonly presets = PRESETS;
  readonly checks = CHECKS;
  readonly selected = signal<Preset>(PRESETS[2]);

  switchPreset(p: Preset): void {
    this.selected.set(p);
  }

  // In the diagnosis walk, checks are attempted in order: separable → linear → exact → substitution
  // The first YES is the recommended technique. If none, fall through to numerical.
  private readonly orderedChecks: TechniqueId[] = [
    'separable',
    'linear',
    'exact',
    'substitution',
  ];

  currentPasses(id: TechniqueId): boolean {
    return this.selected().recommended === id;
  }

  currentFailed(id: TechniqueId): boolean {
    const rec = this.selected().recommended;
    if (rec === 'numerical') {
      // all four checks failed
      return id !== 'numerical';
    }
    // check before rec is failed; check after rec is pending
    const recIdx = this.orderedChecks.indexOf(rec);
    const idIdx = this.orderedChecks.indexOf(id);
    if (idIdx === -1) return false;
    return idIdx < recIdx;
  }

  currentPending(id: TechniqueId): boolean {
    const rec = this.selected().recommended;
    if (rec === 'numerical') return id === 'numerical' ? false : false;
    const recIdx = this.orderedChecks.indexOf(rec);
    const idIdx = this.orderedChecks.indexOf(id);
    if (id === 'numerical') return true;
    return idIdx > recIdx;
  }

  reasonFor(id: TechniqueId): string {
    const p = this.selected();
    switch (id) {
      case 'separable':
        return p.separable ? p.separableReason : p.separableReason || '';
      case 'linear':
        return p.linear ? p.linearReason : p.linearReason || '';
      case 'exact':
        return p.exact ? p.exactReason : p.exactReason || '';
      case 'substitution':
        return p.substitution ? p.substitutionReason : p.substitutionReason || '';
      case 'numerical':
        return '四招都不適用——靠 RK4 之類的數值方法。';
    }
  }

  recommendedCheck(): CheckStep {
    const id = this.selected().recommended;
    return CHECKS.find((c) => c.id === id)!;
  }
}
