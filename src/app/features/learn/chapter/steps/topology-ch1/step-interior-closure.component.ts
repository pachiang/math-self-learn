import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface ICBExample {
  name: string; set: string; int: string; cl: string; bd: string;
  // Visual parameters on [0, 2] number line
  setDraw: { left: number; right: number; leftClosed: boolean; rightClosed: boolean };
  intDraw: { left: number; right: number } | null;
  clDraw: { left: number; right: number };
  bdPoints: number[];
}

const EXAMPLES: ICBExample[] = [
  { name: '(0, 1)', set: '(0, 1)', int: '(0, 1)', cl: '[0, 1]', bd: '(0, 1)',
    setDraw: { left: 0, right: 1, leftClosed: false, rightClosed: false },
    intDraw: { left: 0, right: 1 }, clDraw: { left: 0, right: 1 }, bdPoints: [0, 1] },
  { name: '[0, 1]', set: '[0, 1]', int: '(0, 1)', cl: '[0, 1]', bd: '(0, 1)',
    setDraw: { left: 0, right: 1, leftClosed: true, rightClosed: true },
    intDraw: { left: 0, right: 1 }, clDraw: { left: 0, right: 1 }, bdPoints: [0, 1] },
  { name: '[0, 1)', set: '[0, 1)', int: '(0, 1)', cl: '[0, 1]', bd: '(0, 1)',
    setDraw: { left: 0, right: 1, leftClosed: true, rightClosed: false },
    intDraw: { left: 0, right: 1 }, clDraw: { left: 0, right: 1 }, bdPoints: [0, 1] },
  { name: '(0,1) ∪ (1,2)', set: '(0,1) ∪ (1,2)', int: '(0,1) ∪ (1,2)', cl: '[0, 2]', bd: '(0, 1, 2)',
    setDraw: { left: 0, right: 2, leftClosed: false, rightClosed: false },
    intDraw: { left: 0, right: 2 }, clDraw: { left: 0, right: 2 }, bdPoints: [0, 1, 2] },
];

@Component({
  selector: 'app-step-interior-closure',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="內部、閉包、邊界" subtitle="§1.9">
      <p>三個基本運算，只用開集/閉集就能定義：</p>
      <ul>
        <li><strong class="c-int">內部</strong> int(A) = A 裡最大的開集 = 「確定在 A 裡面」的點</li>
        <li><strong class="c-cl">閉包</strong> cl(A) = 包含 A 的最小閉集 = 「靠近 A」的所有點</li>
        <li><strong class="c-bd">邊界</strong> ∂A = cl(A) ∖ int(A) = 「不確定在裡面還是外面」的點</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="選集合，看三層結構：內部 ⊂ 集合 ⊂ 閉包，邊界 = 差">
      <div class="fn-tabs">
        @for (e of examples; track e.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ e.name }}</button>
        }
      </div>

      <!-- Visual number line with three layers -->
      <svg viewBox="-20 -10 540 140" class="icb-svg">
        <!-- Number line -->
        <line x1="30" y1="70" x2="510" y2="70" stroke="var(--border)" stroke-width="1" />
        @for (t of [0, 0.5, 1, 1.5, 2]; track t) {
          <line [attr.x1]="lx(t)" y1="66" [attr.x2]="lx(t)" y2="74" stroke="var(--border)" stroke-width="0.8" />
          <text [attr.x]="lx(t)" y="86" class="tick-label">{{ t }}</text>
        }

        <!-- Layer 1: Closure (outermost, blue dashed) -->
        <rect [attr.x]="lx(curEx().clDraw.left) - 3" y="15"
              [attr.width]="lx(curEx().clDraw.right) - lx(curEx().clDraw.left) + 6" height="50"
              fill="rgba(90,127,170,0.08)" stroke="#5a7faa" stroke-width="1.5" stroke-dasharray="5 3" rx="6" />
        <text [attr.x]="lx(curEx().clDraw.left) - 8" y="35" class="layer-label cl-color" text-anchor="end">cl(A)</text>

        <!-- Layer 2: Set A itself -->
        <rect [attr.x]="lx(curEx().setDraw.left)" y="28"
              [attr.width]="lx(curEx().setDraw.right) - lx(curEx().setDraw.left)" height="24"
              fill="rgba(var(--accent-rgb), 0.1)" stroke="var(--accent)" stroke-width="1.5" rx="4" />

        <!-- Layer 3: Interior (innermost, green solid) -->
        @if (curEx().intDraw) {
          <rect [attr.x]="lx(curEx().intDraw!.left) + 6" y="33"
                [attr.width]="Math.max(0, lx(curEx().intDraw!.right) - lx(curEx().intDraw!.left) - 12)" height="14"
                fill="rgba(90,138,90,0.15)" stroke="#5a8a5a" stroke-width="1.5" rx="3" />
          <text [attr.x]="lx(curEx().intDraw!.right) + 10" y="44" class="layer-label int-color">int(A)</text>
        }

        <!-- Boundary points (red circles) -->
        @for (bp of curEx().bdPoints; track bp) {
          <circle [attr.cx]="lx(bp)" cy="40" r="6" fill="none" stroke="#a05a5a" stroke-width="2.5" />
        }

        <!-- Endpoint markers for A -->
        <circle [attr.cx]="lx(curEx().setDraw.left)" cy="40" r="4"
                [attr.fill]="curEx().setDraw.leftClosed ? 'var(--accent)' : 'var(--bg)'"
                stroke="var(--accent)" stroke-width="1.5" />
        <circle [attr.cx]="lx(curEx().setDraw.right)" cy="40" r="4"
                [attr.fill]="curEx().setDraw.rightClosed ? 'var(--accent)' : 'var(--bg)'"
                stroke="var(--accent)" stroke-width="1.5" />

        <!-- Legend -->
        <rect x="30" y="100" width="12" height="8" fill="rgba(90,138,90,0.3)" stroke="#5a8a5a" stroke-width="0.8" rx="2" />
        <text x="48" y="108" class="legend-text">int(A)</text>
        <rect x="120" y="100" width="12" height="8" fill="rgba(var(--accent-rgb), 0.15)" stroke="var(--accent)" stroke-width="0.8" rx="2" />
        <text x="138" y="108" class="legend-text">A</text>
        <rect x="190" y="100" width="12" height="8" fill="rgba(90,127,170,0.1)" stroke="#5a7faa" stroke-width="0.8" rx="2" stroke-dasharray="3 2" />
        <text x="208" y="108" class="legend-text">cl(A)</text>
        <circle cx="286" cy="104" r="5" fill="none" stroke="#a05a5a" stroke-width="2" />
        <text x="298" y="108" class="legend-text">∂A</text>
      </svg>

      <!-- Results table -->
      <div class="result-table">
        <div class="rt-row"><span class="rt-label">A =</span><span class="rt-val">{{ curEx().set }}</span></div>
        <div class="rt-row int-bg"><span class="rt-label c-int">int(A) =</span><span class="rt-val">{{ curEx().int }}</span></div>
        <div class="rt-row cl-bg"><span class="rt-label c-cl">cl(A) =</span><span class="rt-val">{{ curEx().cl }}</span></div>
        <div class="rt-row bd-bg"><span class="rt-label c-bd">∂A =</span><span class="rt-val">{{ curEx().bd }}</span></div>
      </div>

      <div class="rules">
        <div class="rule">A 是<strong>開集</strong> ⟺ A = int(A)（沒有邊界點在裡面）</div>
        <div class="rule">A 是<strong>閉集</strong> ⟺ A = cl(A)（所有極限點都在裡面）</div>
        <div class="rule">A 既開又閉（clopen）⟺ ∂A = ∅</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這些概念在度量空間裡需要 ε-球，在一般拓撲空間裡只需要開集族 τ。
        它們是拓撲學最基本的「語彙」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .c-int { color: #5a8a5a; } .c-cl { color: #5a7faa; } .c-bd { color: #a05a5a; }
    .int-color { fill: #5a8a5a; } .cl-color { fill: #5a7faa; }

    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .icb-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 12px; }
    .tick-label { font-size: 8px; fill: var(--text-muted); text-anchor: middle; font-family: 'JetBrains Mono', monospace; }
    .layer-label { font-size: 9px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .legend-text { font-size: 8px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .result-table { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .rt-row { display: grid; grid-template-columns: 70px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.int-bg { background: rgba(90,138,90,0.04); }
      &.cl-bg { background: rgba(90,127,170,0.04); }
      &.bd-bg { background: rgba(160,90,90,0.04); } }
    .rt-label { padding: 8px 10px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; background: var(--bg-surface); border-right: 1px solid var(--border); }
    .rt-val { padding: 8px 10px; font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }

    .rules { display: flex; flex-direction: column; gap: 6px; }
    .rule { padding: 8px 12px; border-radius: 6px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-secondary); }
    .rule strong { color: var(--accent); }
  `,
})
export class StepInteriorClosureComponent {
  readonly Math = Math;
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly curEx = computed(() => EXAMPLES[this.sel()]);

  lx(v: number): number { return 30 + (v / 2) * 480; }
}
