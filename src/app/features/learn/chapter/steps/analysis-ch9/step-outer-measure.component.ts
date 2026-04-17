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
      <div class="ctrl-row">
        <span class="cl">顯示前 {{ showCount() }} 個點</span>
        <input type="range" min="1" max="25" step="1" [value]="showCount()"
               (input)="showCount.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-10 -40 520 120" class="om-svg">
        <!-- Number line -->
        <line x1="10" y1="30" x2="500" y2="30" stroke="var(--border)" stroke-width="0.8" />
        @for (tick of [0, 0.25, 0.5, 0.75, 1]; track tick) {
          <line [attr.x1]="toX(tick)" y1="26" [attr.x2]="toX(tick)" y2="34" stroke="var(--text-muted)" stroke-width="0.6" />
          <text [attr.x]="toX(tick)" y="45" text-anchor="middle" fill="var(--text-muted)" font-size="8">{{ tick }}</text>
        }

        <!-- Covering intervals (drawn first so points appear on top) -->
        @for (iv of visibleCovers(); track $index) {
          <rect [attr.x]="toX(iv.center - iv.hw)" y="18"
                [attr.width]="Math.max(0.5, toX(iv.center + iv.hw) - toX(iv.center - iv.hw))"
                height="24" rx="3"
                [attr.fill]="'hsla(' + (iv.hue) + ', 55%, 60%, 0.12)'"
                [attr.stroke]="'hsla(' + (iv.hue) + ', 55%, 50%, 0.5)'" stroke-width="0.6" />
        }

        <!-- The rational points -->
        @for (p of visiblePoints(); track $index) {
          <circle [attr.cx]="toX(p)" cy="30" r="2.5" fill="var(--accent)" />
        }

        <!-- Width label for first interval -->
        @if (visibleCovers().length > 0) {
          <text [attr.x]="toX(visibleCovers()[0].center)" y="-5" text-anchor="middle"
                fill="var(--text-muted)" font-size="7">ε/4</text>
          @if (visibleCovers().length > 1) {
            <text [attr.x]="toX(visibleCovers()[1].center)" y="-5" text-anchor="middle"
                  fill="var(--text-muted)" font-size="7">ε/8</text>
          }
        }

        <!-- Total length bar -->
        <rect x="10" y="58" [attr.width]="Math.min(490, totalLength() * 490)" height="8"
              fill="var(--accent)" fill-opacity="0.3" rx="2" />
        <rect x="10" y="58" width="490" height="8" fill="none" stroke="var(--border)" stroke-width="0.5" rx="2" />
        <text x="255" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="7">
          總覆蓋長度 = {{ totalLength().toFixed(4) }}
        </text>
      </svg>

      <div class="result-row">
        <div class="r-card">點數：{{ showCount() }}</div>
        <div class="r-card">第 n 個寬度：ε/2ⁿ⁺¹</div>
        <div class="r-card">覆蓋總長：{{ totalLength().toExponential(2) }}</div>
        <div class="r-card ok">外測度 = 0</div>
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
  readonly showCount = signal(15);

  // 25 rational points in [0,1] (sorted for visual clarity)
  private readonly allPoints = [
    0, 1/7, 0.1, 1/5, 0.25, 2/7, 1/3, 3/8, 2/5, 3/7,
    0.5, 4/7, 3/5, 5/8, 2/3, 5/7, 0.75, 4/5, 5/6, 6/7,
    0.8, 0.85, 0.9, 0.95, 1,
  ].sort((a, b) => a - b);

  readonly visiblePoints = computed(() => this.allPoints.slice(0, this.showCount()));

  readonly visibleCovers = computed(() => {
    const e = this.eps();
    return this.visiblePoints().map((p, i) => ({
      center: p,
      hw: e / Math.pow(2, i + 2),
      hue: (i * 137) % 360,
    }));
  });

  readonly totalLength = computed(() => {
    return this.visibleCovers().reduce((s, c) => s + 2 * c.hw, 0);
  });

  toX(v: number): number { return 10 + v * 490; }
}
