import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { COMMON_SEQUENCES, generateTerms, findMinN } from './analysis-ch2-util';

const CONVERGENT = COMMON_SEQUENCES.filter((s) => s.limit !== null);

@Component({
  selector: 'app-step-epsilon-n',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="收斂的 ε-N 定義" subtitle="§2.2">
      <p>
        這是整個分析最重要的定義：
      </p>
      <p class="formula axiom">
        數列 {{ '{' }}aₙ{{ '}' }} 收斂到 L，記作 lim aₙ = L，<br />
        若且唯若：對任意 ε > 0，存在 N ∈ ℕ，<br />
        使得 n > N 時 |aₙ − L| &lt; ε。
      </p>
      <p>
        直覺：<strong>不管你畫多薄的帶子</strong>（ε），
        從某個 N 之後的<strong>所有項</strong>都落在帶子裡。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 ε 看帶子收緊——N 跟著移動，但後面的項永遠在裡面">
      <div class="ctrl-row">
        <div class="presets">
          @for (s of seqs; track s.name; let i = $index) {
            <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ s.name }}</button>
          }
        </div>
        <div class="eps-ctrl">
          <span class="eps-label">ε = {{ epsilon().toFixed(3) }}</span>
          <input type="range" min="0.01" max="1.5" step="0.005" [value]="epsilon()"
                 (input)="epsilon.set(+($any($event.target)).value)" class="eps-slider" />
        </div>
      </div>

      <svg viewBox="0 0 520 240" class="en-svg">
        <!-- Axes -->
        <line x1="40" y1="200" x2="510" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <text x="510" y="215" class="ax-label">n</text>
        <text x="25" y="15" class="ax-label">aₙ</text>

        <!-- Epsilon band around L -->
        <rect x="40" [attr.y]="toY(limit() + epsilon())"
              width="470" [attr.height]="Math.max(1, toY(limit() - epsilon()) - toY(limit() + epsilon()))"
              fill="var(--accent)" fill-opacity="0.1" />
        <!-- L line -->
        <line x1="40" [attr.y1]="toY(limit())" x2="510" [attr.y2]="toY(limit())"
              stroke="#5a8a5a" stroke-width="1.5" />
        <text x="20" [attr.y]="toY(limit()) + 4" class="l-label">L</text>
        <!-- Band edges -->
        <line x1="40" [attr.y1]="toY(limit() + epsilon())" x2="510" [attr.y2]="toY(limit() + epsilon())"
              stroke="var(--accent)" stroke-width="0.8" stroke-dasharray="4 3" />
        <line x1="40" [attr.y1]="toY(limit() - epsilon())" x2="510" [attr.y2]="toY(limit() - epsilon())"
              stroke="var(--accent)" stroke-width="0.8" stroke-dasharray="4 3" />
        <!-- ε labels -->
        <text [attr.x]="505" [attr.y]="toY(limit() + epsilon()) - 3" class="eps-text">+ε</text>
        <text [attr.x]="505" [attr.y]="toY(limit() - epsilon()) + 10" class="eps-text">−ε</text>

        <!-- N threshold line -->
        <line [attr.x1]="toNx(computedN())" y1="10" [attr.x2]="toNx(computedN())" y2="200"
              stroke="#c8983b" stroke-width="1.5" stroke-dasharray="5 3" />
        <text [attr.x]="toNx(computedN())" y="218" class="n-label">N={{ computedN() }}</text>

        <!-- Dots -->
        @for (t of terms(); track t.n) {
          <circle [attr.cx]="toNx(t.n)" [attr.cy]="toY(t.val)" r="3.5"
                  [attr.fill]="t.n > computedN() ? (isInBand(t.val) ? '#5a8a5a' : '#a05a5a') : 'var(--text-muted)'"
                  [attr.fill-opacity]="t.n > computedN() ? 1 : 0.3" />
        }
      </svg>

      <div class="verdict" [class.ok]="computedN() < 50">
        ε = {{ epsilon().toFixed(3) }} → N = {{ computedN() }}
        → n > {{ computedN() }} 的<strong>每一項</strong>都在帶子裡 ✓
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意幾個關鍵：
      </p>
      <ul>
        <li>ε 越小，需要的 N 越大——你要求越嚴，就要等越久</li>
        <li>但不管 ε 多小，<strong>總存在</strong>一個足夠大的 N</li>
        <li>「所有 n > N」——不只是某些項，而是<strong>全部</strong>後面的項</li>
      </ul>
      <p>
        下一節看極限的基本性質：唯一性和運算律。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }

    .ctrl-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .presets { display: flex; gap: 4px; flex-wrap: wrap; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .eps-ctrl { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .eps-label { font-size: 13px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 100px; }
    .eps-slider { width: 140px; accent-color: var(--accent); }

    .en-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .ax-label { font-size: 10px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; }
    .l-label { font-size: 10px; fill: #5a8a5a; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .eps-text { font-size: 8px; fill: var(--accent);
      font-family: 'JetBrains Mono', monospace; }
    .n-label { font-size: 9px; fill: #c8983b; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }

    .verdict { padding: 12px; border-radius: 8px; text-align: center;
      font-size: 13px; color: var(--text-secondary);
      background: var(--bg-surface); border: 1px solid var(--border);
      &.ok { background: rgba(90, 138, 90, 0.08); color: #5a8a5a; }
      strong { color: var(--accent); } }
  `,
})
export class StepEpsilonNComponent {
  readonly Math = Math;
  readonly seqs = CONVERGENT;
  readonly selIdx = signal(0);
  readonly epsilon = signal(0.3);

  readonly currentSeq = computed(() => CONVERGENT[this.selIdx()]);
  readonly limit = computed(() => this.currentSeq().limit!);
  readonly terms = computed(() => generateTerms(this.currentSeq().fn, 50));
  readonly computedN = computed(() => findMinN(this.currentSeq().fn, this.limit(), this.epsilon()));

  // SVG coordinate mapping
  private readonly yRange = computed(() => {
    const vals = this.terms().map((t) => t.val);
    const L = this.limit();
    const mn = Math.min(...vals, L - 0.5);
    const mx = Math.max(...vals, L + 0.5);
    return { min: mn - 0.1, max: mx + 0.1 };
  });

  toY(v: number): number {
    const { min, max } = this.yRange();
    return 200 - ((v - min) / (max - min)) * 190 + 5;
  }

  toNx(n: number): number {
    return 40 + (n / 52) * 470;
  }

  isInBand(v: number): boolean {
    return Math.abs(v - this.limit()) < this.epsilon();
  }
}
