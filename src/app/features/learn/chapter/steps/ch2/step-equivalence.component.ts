import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const NUM_COUNT = 12;
const COLORS = [
  'var(--v0)', 'var(--v1)', 'var(--v2)', 'var(--v3)',
  'var(--v4)', 'var(--v5)', 'var(--v6)', 'var(--v7)',
];
const CX_START = 35;
const CX_GAP = 52;
const CY = 130;
const R = 18;

@Component({
  selector: 'app-step-equivalence',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="等價關係：分類的藝術" subtitle="§2.4">
      <p>
        在學陪集之前，我們先學一個很核心的概念。
        不用怕，它其實是你每天都在做的事：<strong>分類</strong>。
      </p>
      <p>
        想像一排數字站在數線上。現在我給你一個規則：
        <strong>你只能跳固定的步數</strong>。
        如果你能從 a 跳到 b（不管跳幾次），那 a 和 b 就算「同一類」。
      </p>
    </app-prose-block>

    <!-- ═══ Interactive: Number line with jumps ═══ -->
    <app-challenge-card
      prompt="調整步長，看看數字怎樣被分成不同的組"
      [completed]="triedMultiple()"
    >
      <div class="step-controls">
        <span class="label">步長 =</span>
        @for (s of stepOptions; track s) {
          <button
            class="step-btn"
            [class.active]="stepSize() === s"
            (click)="setStep(s)"
          >{{ s }}</button>
        }
      </div>

      <!-- SVG Number line -->
      <div class="line-wrapper">
        <svg [attr.viewBox]="'0 0 ' + svgW + ' 170'" class="number-line-svg">
          <!-- Baseline -->
          <line
            [attr.x1]="CX_START - 12" [attr.y1]="CY"
            [attr.x2]="numX(NUM_COUNT - 1) + 12" [attr.y2]="CY"
            stroke="var(--border-strong)" stroke-width="1"
          />

          <!-- Jump arcs -->
          @for (arc of arcs(); track arc.key) {
            <path
              [attr.d]="arc.d"
              fill="none"
              [attr.stroke]="arc.color"
              stroke-width="2"
              stroke-opacity="0.5"
              class="arc"
              [class.arc-highlight]="hoveredClass() === arc.cls"
            />
          }

          <!-- Number circles -->
          @for (num of numbers; track num) {
            <g
              class="num-group"
              [class.dim]="hoveredClass() >= 0 && hoveredClass() !== numClass(num)"
              (mouseenter)="hoveredClass.set(numClass(num))"
              (mouseleave)="hoveredClass.set(-1)"
            >
              <circle
                [attr.cx]="numX(num)" [attr.cy]="CY" [attr.r]="R"
                [attr.fill]="numColor(num)"
                class="num-circle"
              />
              <text
                [attr.x]="numX(num)" [attr.y]="CY + 1"
                class="num-text"
              >{{ num }}</text>
            </g>
          }
        </svg>
      </div>

      <!-- Class summary -->
      <div class="class-summary">
        @for (cls of classes(); track cls.id) {
          <div
            class="class-row"
            [class.highlight]="hoveredClass() === cls.id"
            (mouseenter)="hoveredClass.set(cls.id)"
            (mouseleave)="hoveredClass.set(-1)"
          >
            <span class="class-badge" [style.background]="COLORS[cls.id]">
              第 {{ cls.id }} 組
            </span>
            <span class="class-members">
              {{ cls.members.join(', ') }}, ...
            </span>
          </div>
        }
      </div>

      <div class="insight-box">
        步長 {{ stepSize() }} 把數字分成了 <strong>{{ stepSize() }} 組</strong>。
        每組裡的數字都能互相「跳到」，不同組之間跳不到。
      </div>
    </app-challenge-card>

    <!-- ═══ Counter-example: broken relation ═══ -->
    <app-prose-block title="如果規則不乾淨呢？">
      <p>
        「跳固定步數」之所以能完美分組，是因為它滿足三個條件。
        如果換一個<strong>不滿足</strong>的規則，分組就會<strong>出問題</strong>。
      </p>
      <p>
        來看一個反例：改成<strong>「距離 ≤ 2 就算同類」</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="觀察：這個規則為什麼沒辦法把數字分好組？">
      <div class="counter-example">
        <svg viewBox="0 0 400 140" class="counter-svg">
          <!-- Three numbers: 0, 2, 4 -->
          <circle cx="80" cy="90" r="24" fill="var(--v0)" class="num-circle" />
          <text x="80" y="93" class="num-text big">0</text>

          <circle cx="200" cy="90" r="24" fill="var(--v1)" class="num-circle" />
          <text x="200" y="93" class="num-text big">2</text>

          <circle cx="320" cy="90" r="24" fill="var(--v2)" class="num-circle" />
          <text x="320" y="93" class="num-text big">4</text>

          <!-- Arc 0-2 (distance 2 ≤ 2 → related) -->
          <path d="M 80 66 C 80 25, 200 25, 200 66"
            fill="none" stroke="var(--v0)" stroke-width="2.5" />
          <text x="140" y="28" class="arc-label ok">|0−2| = 2 ✓</text>

          <!-- Arc 2-4 (distance 2 ≤ 2 → related) -->
          <path d="M 200 66 C 200 25, 320 25, 320 66"
            fill="none" stroke="var(--v1)" stroke-width="2.5" />
          <text x="260" y="28" class="arc-label ok">|2−4| = 2 ✓</text>

          <!-- Dashed line 0-4 (distance 4 > 2 → NOT related!) -->
          <path d="M 80 114 C 80 155, 320 155, 320 114"
            fill="none" stroke="var(--v5)" stroke-width="2.5"
            stroke-dasharray="6 4" />
          <text x="200" y="155" class="arc-label fail">|0−4| = 4 ✗</text>
        </svg>

        <div class="counter-explain">
          <div class="counter-line">
            0 和 2 同類（距離 2）。2 和 4 同類（距離 2）。
          </div>
          <div class="counter-line bad">
            但 0 和 4 <strong>不</strong>同類（距離 4 > 2）！
          </div>
          <div class="counter-line">
            → 0 和 4 到底要不要放同一組？<strong>矛盾了。</strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <!-- ═══ Three properties ═══ -->
    <app-prose-block title="完美分類的三個條件">
      <p>
        「跳格子」規則不會出這種矛盾，因為它滿足三條規則：
      </p>

      <div class="property-cards">
        <div class="prop-card">
          <div class="prop-icon">↻</div>
          <div class="prop-name">自反性</div>
          <div class="prop-desc">
            自己跟自己等價（跳 0 次 = 不動）
          </div>
          <div class="prop-check good">跳格子 ✓</div>
          <div class="prop-check good">距離 ≤ 2 ✓</div>
        </div>
        <div class="prop-card">
          <div class="prop-icon">⇄</div>
          <div class="prop-name">對稱性</div>
          <div class="prop-desc">
            如果 a 能跳到 b，b 也能跳到 a（反方向跳回來）
          </div>
          <div class="prop-check good">跳格子 ✓</div>
          <div class="prop-check good">距離 ≤ 2 ✓</div>
        </div>
        <div class="prop-card">
          <div class="prop-icon">→→</div>
          <div class="prop-name">遞移性</div>
          <div class="prop-desc">
            如果 a 能到 b，b 能到 c，那 a 也能到 c（接力跳）
          </div>
          <div class="prop-check good">跳格子 ✓</div>
          <div class="prop-check fail">距離 ≤ 2 ✗</div>
        </div>
      </div>

      <p>
        滿足這三條的關係叫做<strong>等價關係</strong>。
        它保證你可以把集合<strong>完美切割</strong>成不重疊、不遺漏的組，
        每一組叫一個<strong>等價類</strong>。
      </p>

      <span class="hint">
        記住這個圖像：等價關係就像在集合裡畫分隔線。
        下一節你會看到：子群在群裡做的事，和這裡的「步長」完全一樣 —
        子群 H 決定了「跳的方式」，陪集就是跳出來的每一組。
      </span>
    </app-prose-block>
  `,
  styles: `
    .step-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .step-btn {
      width: 40px;
      height: 36px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: transparent;
      color: var(--text);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); }
    }

    /* ── Number line SVG ── */
    .line-wrapper {
      overflow-x: auto;
      margin-bottom: 14px;
    }

    .number-line-svg {
      width: 100%;
      max-width: 640px;
      display: block;
    }

    .num-circle {
      stroke: var(--marker-stroke);
      stroke-width: 2;
      transition: opacity 0.2s;
    }

    .num-text {
      fill: white;
      font-size: 14px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      text-anchor: middle;
      dominant-baseline: central;
      pointer-events: none;
    }

    .num-text.big {
      font-size: 18px;
    }

    .num-group {
      cursor: pointer;
      transition: opacity 0.2s;
      &.dim { opacity: 0.25; }
    }

    .arc {
      transition: stroke-opacity 0.2s, stroke-width 0.2s;
      &.arc-highlight {
        stroke-opacity: 0.85;
        stroke-width: 3;
      }
    }

    /* ── Class summary ── */
    .class-summary {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 12px;
    }

    .class-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 5px 8px;
      border-radius: 6px;
      transition: background 0.15s;
      &.highlight { background: var(--accent-10); }
    }

    .class-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 52px;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .class-members {
      font-size: 14px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-secondary);
    }

    .insight-box {
      padding: 10px 14px;
      border-radius: 8px;
      background: var(--accent-10);
      font-size: 14px;
      color: var(--text-secondary);
      strong { color: var(--text); }
    }

    /* ── Counter-example ── */
    .counter-example {
      margin-bottom: 4px;
    }

    .counter-svg {
      width: 100%;
      max-width: 420px;
      display: block;
      margin: 0 auto 12px;
    }

    .arc-label {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      text-anchor: middle;
      dominant-baseline: central;
      &.ok { fill: var(--text-secondary); }
      &.fail { fill: var(--v5); font-weight: 700; }
    }

    .counter-explain {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .counter-line.bad {
      color: var(--v5, #c4908c);
      font-weight: 500;
    }

    /* ── Property cards ── */
    .property-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 16px 0;

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .prop-card {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg-surface);
      text-align: center;
    }

    .prop-icon {
      font-size: 20px;
      margin-bottom: 4px;
      color: var(--text-muted);
    }

    .prop-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 6px;
    }

    .prop-desc {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .prop-check {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 3px;
      display: inline-block;
      margin: 1px 0;

      &.good { color: #5a8a5a; background: rgba(90, 138, 90, 0.1); }
      &.fail { color: #a05a5a; background: rgba(160, 90, 90, 0.1); }
    }
  `,
})
export class StepEquivalenceComponent {
  readonly stepOptions = [2, 3, 4, 6];
  readonly numbers = Array.from({ length: NUM_COUNT }, (_, i) => i);
  readonly stepSize = signal(3);
  readonly hoveredClass = signal(-1);
  readonly COLORS = COLORS;
  readonly CX_START = CX_START;
  readonly CY = CY;
  readonly R = R;
  readonly NUM_COUNT = NUM_COUNT;
  readonly svgW = CX_START * 2 + (NUM_COUNT - 1) * CX_GAP;

  private readonly triedSteps = signal(new Set([3]));
  readonly triedMultiple = computed(() => this.triedSteps().size >= 3);

  readonly classes = computed(() => {
    const s = this.stepSize();
    return Array.from({ length: s }, (_, r) => ({
      id: r,
      members: this.numbers.filter((n) => n % s === r),
    }));
  });

  readonly arcs = computed(() => {
    const s = this.stepSize();
    const result: { key: string; d: string; color: string; cls: number }[] = [];

    for (let a = 0; a < NUM_COUNT; a++) {
      const b = a + s;
      if (b >= NUM_COUNT) continue;
      const cls = a % s;
      const x1 = this.numX(a);
      const x2 = this.numX(b);
      const h = 20 + s * 8; // arc height scales with step size
      result.push({
        key: `${a}-${b}`,
        d: `M ${x1} ${CY - R} C ${x1} ${CY - R - h}, ${x2} ${CY - R - h}, ${x2} ${CY - R}`,
        color: COLORS[cls],
        cls,
      });
    }
    return result;
  });

  setStep(s: number): void {
    this.stepSize.set(s);
    this.triedSteps.update((set) => new Set(set).add(s));
  }

  numX(i: number): number {
    return CX_START + i * CX_GAP;
  }

  numClass(num: number): number {
    return num % this.stepSize();
  }

  numColor(num: number): string {
    return COLORS[this.numClass(num)];
  }
}
