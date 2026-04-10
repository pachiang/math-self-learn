import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-outer-measure',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="長度的推廣：外測度" subtitle="§9.2">
      <p>
        怎麼量一個「任意」子集 E ⊂ R 的「大小」？
      </p>
      <p>
        用<strong>開區間覆蓋</strong>：找一列開區間 (aₖ, bₖ) 把 E 蓋住，
        算它們的總長度。取所有可能覆蓋的<strong>下確界</strong>：
      </p>
      <p class="formula">
        m*(E) = inf Σ(bₖ − aₖ)，取遍所有可數開區間覆蓋
      </p>
      <p>
        這叫 E 的<strong>Lebesgue 外測度</strong>。它對所有子集都有定義（包括 Dirichlet 那種怪集合）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="用開區間蓋住一個集合——總長度的下確界就是外測度">
      <div class="ctrl-row">
        <span class="cl">覆蓋精度 ε = {{ eps().toFixed(4) }}</span>
        <input type="range" min="-4" max="0" step="0.1" [value]="epsLog()"
               (input)="epsLog.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-10 -20 520 80" class="om-svg">
        <line x1="10" y1="30" x2="500" y2="30" stroke="var(--border)" stroke-width="0.8" />

        <!-- The set: a few points (simulating Q ∩ [0,1]) -->
        @for (p of points; track $index) {
          <circle [attr.cx]="toX(p)" cy="30" r="2" fill="var(--accent)" />
        }

        <!-- Covering intervals -->
        @for (iv of covers(); track $index; let i = $index) {
          <rect [attr.x]="toX(iv.center - iv.hw)" y="22"
                [attr.width]="Math.max(0.5, toX(iv.center + iv.hw) - toX(iv.center - iv.hw))"
                height="16" fill="#5a8a5a" fill-opacity="0.15" stroke="#5a8a5a" stroke-width="0.5" rx="2" />
        }
      </svg>

      <div class="result-row">
        <div class="r-card">點數：{{ points.length }}</div>
        <div class="r-card">覆蓋總長：{{ totalLength().toExponential(2) }}</div>
        <div class="r-card ok">外測度 = 0（可數集測度為零）</div>
      </div>

      <div class="insight">
        不管有多少個有理數（可數無限多），用 ε/2ⁿ 寬的區間蓋第 n 個，
        總長度 = ε → 可以任意小。所以 <strong>m*(Q ∩ [0,1]) = 0</strong>。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        外測度對「所有」子集都有定義，但它不滿足<strong>可數可加性</strong>——
        兩個不相交集合的外測度之和不一定等於聯集的外測度。
        需要篩選「好的」集合——這就是<strong>可測集</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 160px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .om-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
    .r-card { flex: 1; min-width: 80px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
    .insight { padding: 12px; font-size: 13px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      text-align: center;
      strong { color: var(--accent); } }
  `,
})
export class StepOuterMeasureComponent {
  readonly Math = Math;
  readonly epsLog = signal(-2);
  readonly eps = computed(() => Math.pow(10, this.epsLog()));

  // 15 rational points in [0,1]
  readonly points = [0, 0.1, 1/3, 0.25, 0.5, 0.6, 2/3, 0.75, 0.8, 1/7, 3/7, 5/7, 0.9, 0.95, 1];

  readonly covers = computed(() => {
    const e = this.eps();
    return this.points.map((p, i) => ({
      center: p,
      hw: e / Math.pow(2, i + 2),
    }));
  });

  readonly totalLength = computed(() => {
    return this.covers().reduce((s, c) => s + 2 * c.hw, 0);
  });

  toX(v: number): number { return 10 + v * 490; }
}
