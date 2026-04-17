import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { cantorSegments, cantorTotalLength } from './analysis-ch9-util';

@Component({
  selector: 'app-step-measure-zero',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="測度零集" subtitle="§9.5">
      <p>
        <strong>測度零</strong>：m(E) = 0。可以用任意小的總長度覆蓋。
      </p>
      <ul>
        <li>有限集：測度零</li>
        <li>可數集（如 Q）：測度零（§9.2 看過）</li>
        <li>Cantor 集：<strong>不可數但測度零</strong>（Ch1 見過，現在有嚴格定義了）</li>
      </ul>
      <p>
        測度零的意思是「在積分裡可以忽略」。函數在測度零集上改值不影響 Lebesgue 積分。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Cantor 集的測度：每一步刪掉 1/3，刪完之後「長度」= 0">
      <div class="n-ctrl">
        <span class="nl">迭代 k = {{ kVal() }}</span>
        <input type="range" min="0" max="8" step="1" [value]="kVal()"
               (input)="kVal.set(+($any($event.target)).value)" class="k-slider" />
      </div>

      <svg viewBox="-10 -10 520 210" class="mz-svg">
        <!-- Show each iteration as a row -->
        @for (row of allRows(); track row.k) {
          <text x="4" [attr.y]="row.k * 22 + 16" fill="var(--text-muted)" font-size="7"
                font-family="JetBrains Mono, monospace">k={{ row.k }}</text>
          @for (seg of row.segs; track $index) {
            <rect [attr.x]="25 + seg[0] * 485" [attr.y]="row.k * 22 + 4"
                  [attr.width]="Math.max(0.3, (seg[1] - seg[0]) * 485)" height="14"
                  [attr.fill]="row.k <= kVal() ? 'var(--accent)' : 'var(--border)'"
                  [attr.fill-opacity]="row.k <= kVal() ? 0.35 : 0.08"
                  [attr.stroke]="row.k <= kVal() ? 'var(--accent)' : 'var(--border)'"
                  stroke-width="0.4" rx="1" />
          }
        }
        <!-- Highlight current level -->
        <rect x="22" [attr.y]="kVal() * 22 + 2" width="490" height="18"
              fill="none" stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" rx="3" />
      </svg>

      <!-- Length convergence bar chart -->
      <div class="bar-chart">
        @for (row of allRows(); track row.k) {
          <div class="bar-row" [class.active]="row.k <= kVal()">
            <span class="bar-label">k={{ row.k }}</span>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="row.length * 100"></div>
            </div>
            <span class="bar-val">{{ row.length.toFixed(4) }}</span>
          </div>
        }
      </div>

      <div class="result-row">
        <div class="r-card">2ᵏ = {{ segments().length }} 區間</div>
        <div class="r-card">剩餘長度：{{ remainingLength().toFixed(6) }}</div>
        <div class="r-card">已刪除：{{ (1 - remainingLength()).toFixed(6) }}</div>
      </div>

      <div class="limit-box">
        <div class="lb-title">k → ∞</div>
        <div class="lb-body">
          剩餘長度 = (2/3)ᵏ → <strong>0</strong>。
          但剩下的點<strong>不可數多</strong>（Ch1 三進位論證）。<br />
          不可數 ≠ 正測度。Cantor 集打破了「大 = 多」的直覺。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看測度理論最驚人的結果——<strong>不可測集</strong>的存在。</p>
    </app-prose-block>
  `,
  styles: `
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .k-slider { flex: 1; accent-color: var(--accent); }
    .mz-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .bar-chart { display: flex; flex-direction: column; gap: 3px; margin-bottom: 10px; }
    .bar-row { display: flex; align-items: center; gap: 6px; opacity: 0.3; transition: opacity 0.2s;
      &.active { opacity: 1; } }
    .bar-label { font-size: 10px; font-weight: 600; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; min-width: 30px; }
    .bar-track { flex: 1; height: 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--accent); opacity: 0.5; transition: width 0.3s; }
    .bar-val { font-size: 10px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 50px; text-align: right; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
    .r-card { flex: 1; min-width: 80px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text); }
    .limit-box { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); }
    .lb-title { font-size: 16px; font-weight: 700; color: var(--accent); margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace; }
    .lb-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--accent); } }
  `,
})
export class StepMeasureZeroComponent {
  readonly Math = Math;
  readonly kVal = signal(3);
  readonly segments = computed(() => cantorSegments(this.kVal()));
  readonly remainingLength = computed(() => cantorTotalLength(this.kVal()));

  readonly allRows = computed(() => {
    const rows: { k: number; segs: [number, number][]; length: number }[] = [];
    for (let k = 0; k <= 8; k++) {
      rows.push({ k, segs: cantorSegments(k), length: cantorTotalLength(k) });
    }
    return rows;
  });
}
