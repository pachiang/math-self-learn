import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { integrate, legendre, legendreLabel, samplePath } from './fourier-util';

@Component({
  selector: 'app-step-legendre',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="正交多項式：Legendre 的例子" subtitle="§12.4">
      <p>
        正交這件事不只發生在 sine 和 cosine。就算你只看多項式，也能找到一整組彼此正交的基底。
      </p>
      <p>
        在區間 [-1, 1] 上，一個經典例子就是 <strong>Legendre 多項式</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選兩個 Legendre 多項式，觀察它們的圖形與內積；下方矩陣會顯示整批正交關係">
      <div class="pickers">
        <div class="pk"><span class="lab">Pᵢ</span><input type="range" min="0" max="4" step="1" [value]="left()" (input)="left.set(+$any($event).target.value)" /><span class="val">{{ left() }}</span></div>
        <div class="pk"><span class="lab">Pⱼ</span><input type="range" min="0" max="4" step="1" [value]="right()" (input)="right.set(+$any($event).target.value)" /><span class="val">{{ right() }}</span></div>
      </div>

      <div class="graph-grid">
        <section class="graph-card">
          <div class="gc-title">多項式家族</div>
          <svg viewBox="-120 -90 240 180" class="viz">
            @for (n of orders; track n) {
              <path [attr.d]="paths[n]" fill="none" [attr.stroke]="color(n)" [attr.stroke-width]="left() === n || right() === n ? 3.4 : 1.9" [attr.opacity]="left() === n || right() === n ? 1 : 0.55" />
            }
            <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
          </svg>
        </section>
        <section class="graph-card">
          <div class="gc-title">{{ label(left()) }} 與 {{ label(right()) }}</div>
          <div class="measure" [class.zero]="isZero()">〈{{ label(left()) }}, {{ label(right()) }}〉 = {{ inner().toFixed(3) }}</div>
          <div class="formula mono">∫ from -1 to 1 {{ label(left()) }}(x) {{ label(right()) }}(x) dx</div>
        </section>
      </div>

      <div class="matrix-card">
        <div class="gc-title">Legendre 的 Gram Matrix</div>
        <div class="matrix">
          <div class="corner"></div>
          @for (n of orders; track n) { <div class="head">{{ label(n) }}</div> }
          @for (row of gram(); track $index; let i = $index) {
            <div class="head">{{ label(i) }}</div>
            @for (cell of row; track $index) {
              <div class="cell" [style.background]="cellColor(cell)">{{ cell.toFixed(2) }}</div>
            }
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這節的重點是把你的視野打開：<strong>正交基底不是傅立葉獨有的魔法，而是函數空間裡一個普遍的結構。</strong>
      </p>
    </app-prose-block>
  `,
  styles: `
    .pickers { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
    .pk { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; background: var(--bg); }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .pk input { width: 160px; accent-color: var(--accent); }
    .val { min-width: 20px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    .graph-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(220px, 1fr); gap: 12px; margin-bottom: 12px; }
    .graph-card, .matrix-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); }
    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; }
    .measure { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #aa6666; font-weight: 700; margin-bottom: 8px; }
    .measure.zero { color: #5a8a5a; }
    .formula { font-size: 12px; color: var(--text-secondary); }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .matrix { display: grid; grid-template-columns: 56px repeat(5, minmax(56px, 1fr)); gap: 1px; background: var(--border); border-radius: 8px; overflow: hidden; }
    .corner, .head, .cell { background: var(--bg-surface); padding: 9px 6px; text-align: center; font-size: 11px; }
    .head { font-weight: 700; color: var(--text); }
    .cell { font-family: 'JetBrains Mono', monospace; }
    @media (max-width: 820px) { .graph-grid { grid-template-columns: 1fr; } }
  `,
})
export class StepLegendreComponent {
  readonly orders = [0, 1, 2, 3, 4];
  readonly left = signal(1);
  readonly right = signal(2);
  readonly paths = this.orders.map((n) => samplePath((x) => legendre(n, x), { xMin: -1, xMax: 1, scaleX: 100, scaleY: 32 }));

  label(n: number): string {
    return legendreLabel(n);
  }

  color(n: number): string {
    return ['var(--v6)', 'var(--v0)', 'var(--v1)', 'var(--v4)', 'var(--accent)'][n] ?? 'var(--text)';
  }

  readonly inner = computed(() => integrate((x) => legendre(this.left(), x) * legendre(this.right(), x), -1, 1));
  readonly isZero = computed(() => Math.abs(this.inner()) < 0.01 && this.left() !== this.right());
  readonly gram = computed(() =>
    this.orders.map((i) => this.orders.map((j) => integrate((x) => legendre(i, x) * legendre(j, x), -1, 1))),
  );

  cellColor(value: number): string {
    const a = Math.min(1, Math.abs(value));
    return Math.abs(value) < 0.02
      ? 'rgba(90, 138, 90, 0.12)'
      : `rgba(199, 152, 59, ${0.12 + 0.25 * a})`;
  }
}
