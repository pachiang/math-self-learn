import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { generateTerms } from './analysis-ch2-util';

const CAUCHY_SEQS = [
  { name: '1/n', fn: (n: number) => 1 / n, isCauchy: true },
  { name: 'Σ1/k²', fn: (n: number) => { let s = 0; for (let k = 1; k <= n; k++) s += 1 / (k * k); return s; }, isCauchy: true },
];

const NON_CAUCHY_SEQS = [
  { name: '(-1)ⁿ', fn: (n: number) => (-1) ** n, isCauchy: false },
  { name: 'sin(n)', fn: (n: number) => Math.sin(n), isCauchy: false },
];

@Component({
  selector: 'app-step-cauchy',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Cauchy 列" subtitle="§2.6">
      <p>
        <strong>Cauchy 列</strong>：對任意 ε > 0，存在 N 使得 m, n > N 時 |aₘ − aₙ| &lt; ε。
      </p>
      <p>
        直覺：項之間的距離越來越小——它們<strong>擠在一起</strong>。
        關鍵是你<strong>不需要知道極限是什麼</strong>！
      </p>
      <p class="formula">
        在 R 中：Cauchy 列 ⟺ 收斂列<br />
        （這等價於完備性！）
      </p>
      <p>
        在 Q 中：1, 1.4, 1.41, 1.414, … 是 Cauchy 列，但不收斂於 Q 中的任何數。
        R 的完備性 = 「Cauchy 列一定有極限」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="比較 Cauchy 列和非 Cauchy 列——項之間的距離">
      <div class="eps-ctrl">
        <span class="eps-label">ε = {{ epsilon().toFixed(3) }}</span>
        <input type="range" min="0.05" max="1.5" step="0.01" [value]="epsilon()"
               (input)="epsilon.set(+($any($event.target)).value)" class="eps-slider" />
      </div>

      <div class="dual-panel">
        <div class="panel">
          <div class="p-title good">Cauchy 列：{{ cauchySeqs[cauchyIdx()].name }}</div>
          <div class="p-toggle">
            @for (s of cauchySeqs; track s.name; let i = $index) {
              <button class="mini-btn" [class.active]="cauchyIdx() === i" (click)="cauchyIdx.set(i)">{{ s.name }}</button>
            }
          </div>
          <svg viewBox="0 0 250 140" class="c-svg">
            @for (t of cauchyTerms(); track t.n) {
              <circle [attr.cx]="10 + t.n * 5.5" [attr.cy]="cty(t.val, 'c')" r="3"
                      fill="#5a8a5a" fill-opacity="0.7" />
            }
            <!-- ε band at tail -->
            @if (cauchyTerms().length > 20) {
              <rect [attr.x]="10 + 25 * 5.5" [attr.y]="cty(tailCenter('c') + epsilon(), 'c')"
                    width="120" [attr.height]="Math.max(1, cty(tailCenter('c') - epsilon(), 'c') - cty(tailCenter('c') + epsilon(), 'c'))"
                    fill="#5a8a5a" fill-opacity="0.08" stroke="#5a8a5a" stroke-width="0.5" rx="2" />
            }
          </svg>
          <div class="p-verdict ok">項擠在 ε 帶子裡 ✓</div>
        </div>

        <div class="panel">
          <div class="p-title bad">非 Cauchy 列：{{ nonCauchySeqs[nonCauchyIdx()].name }}</div>
          <div class="p-toggle">
            @for (s of nonCauchySeqs; track s.name; let i = $index) {
              <button class="mini-btn" [class.active]="nonCauchyIdx() === i" (click)="nonCauchyIdx.set(i)">{{ s.name }}</button>
            }
          </div>
          <svg viewBox="0 0 250 140" class="c-svg">
            @for (t of nonCauchyTerms(); track t.n) {
              <circle [attr.cx]="10 + t.n * 5.5" [attr.cy]="cty(t.val, 'nc')" r="3"
                      fill="#a05a5a" fill-opacity="0.7" />
            }
          </svg>
          <div class="p-verdict bad">項之間距離不趨向 0 ✗</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Cauchy 列是實分析裡的<strong>通用收斂判準</strong>——
        不管你能不能猜出極限，只要驗證項之間的距離。
      </p>
      <p>
        下一節看幾個具體的重要極限。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8; }

    .eps-ctrl { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .eps-label { font-size: 13px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 100px; }
    .eps-slider { flex: 1; accent-color: var(--accent); }

    .dual-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 600px) { .dual-panel { grid-template-columns: 1fr; } }
    .panel { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .p-title { padding: 8px 10px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      &.good { background: rgba(90, 138, 90, 0.08); color: #5a8a5a; }
      &.bad { background: rgba(160, 90, 90, 0.08); color: #a05a5a; } }
    .p-toggle { padding: 4px 10px; display: flex; gap: 4px; }
    .mini-btn { padding: 2px 6px; border: 1px solid var(--border); border-radius: 4px;
      background: transparent; color: var(--text-muted); font-size: 10px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &.active { background: var(--accent-10); border-color: var(--accent); } }
    .c-svg { width: 100%; display: block; background: var(--bg); }
    .p-verdict { padding: 6px 10px; font-size: 11px; font-weight: 600; text-align: center;
      &.ok { color: #5a8a5a; } &.bad { color: #a05a5a; } }
  `,
})
export class StepCauchyComponent {
  readonly Math = Math;
  readonly cauchySeqs = CAUCHY_SEQS;
  readonly nonCauchySeqs = NON_CAUCHY_SEQS;
  readonly cauchyIdx = signal(0);
  readonly nonCauchyIdx = signal(0);
  readonly epsilon = signal(0.3);

  readonly cauchyTerms = computed(() => generateTerms(CAUCHY_SEQS[this.cauchyIdx()].fn, 40));
  readonly nonCauchyTerms = computed(() => generateTerms(NON_CAUCHY_SEQS[this.nonCauchyIdx()].fn, 40));

  tailCenter(type: 'c' | 'nc'): number {
    const terms = type === 'c' ? this.cauchyTerms() : this.nonCauchyTerms();
    const tail = terms.slice(-10);
    return tail.reduce((s, t) => s + t.val, 0) / (tail.length || 1);
  }

  cty(v: number, type: 'c' | 'nc'): number {
    const terms = type === 'c' ? this.cauchyTerms() : this.nonCauchyTerms();
    const vals = terms.map((t) => t.val);
    const mn = Math.min(...vals) - 0.2, mx = Math.max(...vals) + 0.2;
    return 130 - ((v - mn) / (mx - mn || 1)) * 120;
  }
}
