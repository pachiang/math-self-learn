import { Component, computed, signal } from '@angular/core';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-step-minimum-norm',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Minimum-Norm Solution" subtitle="§16.6">
      <p>
        當未知數比方程還多時，Ax = b 常常不是沒解，而是
        <strong>有無限多解</strong>。這時 pseudoinverse 會選其中最短的那個。
      </p>
      <p>
        例如 x1 + x2 = 1 的所有解形成一條直線；A^+ b 選的是這條線上
        離原點最近的點。
      </p>
      <p class="formula">x^+ = A^T (A A^T)^(-1) b</p>
    </app-prose-block>

    <app-challenge-card prompt="沿著解集合移動，觀察哪一點的長度最短">
      <div class="plot-wrap">
        <svg viewBox="-150 -150 300 300" class="plot">
          @for (g of grid; track g) {
            <line x1="-130" [attr.y1]="g" x2="130" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" y1="-130" [attr.x2]="g" y2="130" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-140" y1="0" x2="140" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-140" x2="0" y2="140" stroke="var(--border-strong)" stroke-width="0.8" />

          <line x1="-100" y1="-150" x2="100" y2="50" stroke="var(--accent)" stroke-width="3" opacity="0.3" />

          <line x1="0" y1="0" [attr.x2]="svgX()" [attr.y2]="svgY()" stroke="#a05a5a" stroke-width="2.5" />
          <line x1="0" y1="0" x2="25" y2="-25" stroke="#5a8a5a" stroke-width="3.2" />

          <circle [attr.cx]="svgX()" [attr.cy]="svgY()" r="6" fill="#a05a5a" stroke="white" stroke-width="1.5" />
          <circle cx="25" cy="-25" r="6" fill="#5a8a5a" stroke="white" stroke-width="1.5" />

          <text [attr.x]="svgX() + 8" [attr.y]="svgY() - 8" class="lab" fill="#a05a5a">x</text>
          <text x="33" y="-33" class="lab" fill="#5a8a5a">x+</text>
        </svg>
      </div>

      <div class="slider-box">
        <div class="row">
          <span class="lab">t</span>
          <input type="range" min="-1.5" max="2.5" step="0.05" [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="val">{{ t().toFixed(2) }}</span>
        </div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">一般解</span>
          <span class="iv">x = (t, 1 - t)</span>
        </div>
        <div class="info-row">
          <span class="il">目前點</span>
          <span class="iv">({{ x1().toFixed(2) }}, {{ x2().toFixed(2) }}), ||x||^2 = {{ normSq().toFixed(3) }}</span>
        </div>
        <div class="info-row big">
          <span class="il">最短解</span>
          <span class="iv">x+ = (0.50, 0.50), ||x+||^2 = 0.500</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        幾何上，minimum-norm 解就是把原點垂直投影到解集合。
        所以 pseudoinverse 同時統一了兩種情況。
      </p>
      <ul>
        <li>解不存在時：找最接近的 Ax 約等於 b</li>
        <li>解太多時：找最短的那個 x</li>
      </ul>
      <p>
        這就是 least squares 與 pseudoinverse 這一章真正完成的地方。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 12px; background: var(--accent-10);
      border-radius: 8px; margin: 10px 0; }
    .plot-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .plot { width: 100%; max-width: 360px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .lab { font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .slider-box { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .row { display: grid; grid-template-columns: 28px 1fr 48px; gap: 10px; align-items: center; }
    .lab { color: var(--accent); }
    .val { text-align: right; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    input { accent-color: var(--accent); }
    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 76px 1fr; border-bottom: 1px solid var(--border); }
    .info-row:last-child { border-bottom: none; }
    .info-row.big { background: var(--accent-10); }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface); border-right: 1px solid var(--border); }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepMinimumNormComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly t = signal(-0.2);
  readonly x1 = computed(() => this.t());
  readonly x2 = computed(() => 1 - this.t());
  readonly normSq = computed(() => this.x1() ** 2 + this.x2() ** 2);

  svgX = computed(() => this.x1() * 50);
  svgY = computed(() => -this.x2() * 50);
}