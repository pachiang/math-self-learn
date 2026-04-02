import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Permutation } from '../../../../../core/math/permutation';

const COLORS = ['var(--v0)', 'var(--v1)', 'var(--v2)', 'var(--v3)', 'var(--v4)'];
const R = 55;
const CX = 80;
const CY = 80;

interface CycleExample {
  label: string;
  perm: number[];
  n: number;
}

const EXAMPLES: CycleExample[] = [
  { label: '(1 2 3)',     perm: [1, 2, 0],       n: 3 },
  { label: '(1 3 2)',     perm: [2, 0, 1],       n: 3 },
  { label: '(1 2)',       perm: [1, 0, 2],       n: 3 },
  { label: '(1 2)(3 4)',  perm: [1, 0, 3, 2],    n: 4 },
  { label: '(1 2 3 4)',   perm: [1, 2, 3, 0],    n: 4 },
  { label: '(1 3)(2 4)',  perm: [2, 3, 0, 1],    n: 4 },
];

@Component({
  selector: 'app-step-cycles',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="循環記號" subtitle="\u00A74.2">
      <p>
        二行記號寫起來太冗長。<strong>循環記號</strong>更簡潔，而且直接告訴你
        「誰去了哪裡」。
      </p>
      <p>
        (1 2 3) 的意思是：1\u21922, 2\u21923, 3\u21921 — 像一個圓圈一樣轉。
        而 (1 2)(3 4) 表示兩個<strong>不相交的循環</strong>同時發生。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選一個置換，觀察循環的流動方向">
      <div class="example-selector">
        @for (ex of examples; track ex.label; let i = $index) {
          <button class="ex-btn" [class.active]="selectedIdx() === i"
            (click)="selectedIdx.set(i)">{{ ex.label }}</button>
        }
      </div>

      <div class="cycle-display">
        <!-- Two-line notation -->
        <div class="two-line-box">
          <div class="tl-label">二行記號</div>
          <div class="tl-row">{{ topRow() }}</div>
          <div class="tl-row bot">{{ botRow() }}</div>
        </div>

        <!-- Cycle diagram SVG -->
        <div class="cycle-svg-wrap">
          <svg [attr.viewBox]="'0 0 ' + (current().n <= 3 ? 160 : 200) + ' 160'" class="cycle-svg">
            <!-- Arrows between nodes -->
            @for (arrow of arrows(); track arrow.from) {
              <path [attr.d]="arrow.d" fill="none" [attr.stroke]="arrow.color"
                stroke-width="2" marker-end="url(#arrowhead)" />
            }
            <!-- Arrow marker -->
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" />
              </marker>
            </defs>
            <!-- Nodes -->
            @for (node of nodes(); track node.idx) {
              <circle [attr.cx]="node.x" [attr.cy]="node.y" r="20"
                [attr.fill]="node.color" class="node-circle" />
              <text [attr.x]="node.x" [attr.y]="node.y" class="node-text">
                {{ node.idx + 1 }}
              </text>
            }
          </svg>
        </div>

        <!-- Cycle notation -->
        <div class="cycle-box">
          <div class="cb-label">循環記號</div>
          <div class="cb-value">{{ current().label }}</div>
        </div>
      </div>

      <div class="reading-guide">
        <div class="rg-title">怎麼讀：</div>
        <div class="rg-steps">
          @for (step of readingSteps(); track step) {
            <span class="rg-step">{{ step }}</span>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        循環記號的規則：
      </p>
      <div class="rules">
        <div class="rule">\u2460 括號裡的元素「追著前一個走」：(a b c) 表示 a\u2192b\u2192c\u2192a</div>
        <div class="rule">\u2461 不動的元素不寫：如果 3 不動，就不會出現 3</div>
        <div class="rule">\u2462 不相交的循環可以分開寫：(1 2)(3 4) 表示兩個獨立的交換</div>
        <div class="rule">\u2463 長度為 2 的循環叫<strong>對換</strong>（transposition）：(1 2) 就是交換 1 和 2</div>
      </div>
      <span class="hint">
        對換是最簡單的置換。下一節你會看到一個驚人的事實：
        <strong>任何置換都能拆成對換的組合</strong>。
      </span>
    </app-prose-block>
  `,
  styles: `
    .example-selector { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .ex-btn {
      padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); font-weight: 600; }
    }

    .cycle-display {
      display: flex; align-items: center; justify-content: center; gap: 20px;
      flex-wrap: wrap; margin-bottom: 16px;
      padding: 16px; background: var(--bg); border-radius: 12px; border: 1px solid var(--border);
    }

    .two-line-box, .cycle-box { text-align: center; }
    .tl-label, .cb-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
    .tl-row { font-size: 16px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); letter-spacing: 0.2em;
      &.bot { color: var(--text); font-weight: 600; }
    }
    .cb-value { font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }

    .cycle-svg-wrap { flex-shrink: 0; }
    .cycle-svg { width: 160px; height: 160px; }
    .node-circle { stroke: var(--marker-stroke); stroke-width: 2; }
    .node-text {
      fill: white; font-size: 16px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      text-anchor: middle; dominant-baseline: central;
    }

    .reading-guide {
      padding: 10px 14px; background: var(--accent-10); border-radius: 8px; margin-bottom: 4px;
    }
    .rg-title { font-size: 12px; font-weight: 600; color: var(--accent); margin-bottom: 6px; }
    .rg-steps { display: flex; flex-wrap: wrap; gap: 6px; }
    .rg-step {
      font-size: 13px; font-family: 'JetBrains Mono', monospace;
      color: var(--text-secondary); padding: 2px 8px; background: var(--bg-surface);
      border-radius: 4px;
    }

    .rules { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
    .rule {
      font-size: 13px; color: var(--text-secondary); padding: 8px 12px;
      border: 1px solid var(--border); border-radius: 6px; background: var(--bg-surface);
      strong { color: var(--text); }
    }
  `,
})
export class StepCyclesComponent {
  readonly examples = EXAMPLES;
  readonly selectedIdx = signal(0);

  readonly current = computed(() => this.examples[this.selectedIdx()]);

  readonly topRow = computed(() =>
    Array.from({ length: this.current().n }, (_, i) => i + 1).join(' '),
  );
  readonly botRow = computed(() =>
    this.current().perm.map((v) => v + 1).join(' '),
  );

  readonly nodes = computed(() => {
    const n = this.current().n;
    const cx = n <= 3 ? 80 : 100;
    const r = n <= 3 ? 50 : 60;
    return Array.from({ length: n }, (_, i) => {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      return {
        idx: i,
        x: cx + r * Math.cos(angle),
        y: 80 + r * Math.sin(angle),
        color: COLORS[i],
      };
    });
  });

  readonly arrows = computed(() => {
    const perm = this.current().perm;
    const ns = this.nodes();
    return perm
      .map((to, from) => {
        if (to === from) return null; // skip fixed points
        const dx = ns[to].x - ns[from].x;
        const dy = ns[to].y - ns[from].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len;
        const uy = dy / len;
        // Shorten to avoid overlap with circles
        const x1 = ns[from].x + ux * 22;
        const y1 = ns[from].y + uy * 22;
        const x2 = ns[to].x - ux * 22;
        const y2 = ns[to].y - uy * 22;
        // Slight curve
        const mx = (x1 + x2) / 2 - uy * 15;
        const my = (y1 + y2) / 2 + ux * 15;
        return {
          from,
          d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`,
          color: COLORS[from],
        };
      })
      .filter(Boolean) as { from: number; d: string; color: string }[];
  });

  readonly readingSteps = computed(() => {
    const perm = this.current().perm;
    const steps: string[] = [];
    for (let i = 0; i < perm.length; i++) {
      if (perm[i] === i) {
        steps.push(`${i + 1} \u2192 ${i + 1}（不動）`);
      } else {
        steps.push(`${i + 1} \u2192 ${perm[i] + 1}`);
      }
    }
    return steps;
  });
}
