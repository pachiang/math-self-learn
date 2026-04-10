import { Component, computed, signal } from '@angular/core';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { LS_DEMO_A, Vec3, atb32, columns32, leastSquares32 } from './lstsq-util';

@Component({
  selector: 'app-step-normal-equations',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Normal Equations" subtitle="§16.3">
      <p>
        幾何上說殘差 r = b - AxHat 要和 column space 正交，
        代數上就等價於它和每一個 column 都內積為零。
      </p>
      <p class="formula">A^T (b - AxHat) = 0</p>
      <p>
        把式子整理一下，就得到 least squares 最重要的方程。
      </p>
      <p class="formula big">A^T A xHat = A^T b</p>
    </app-prose-block>

    <app-challenge-card
      prompt="調整目標向量 b，觀察解 xHat 如何讓殘差同時垂直於兩個 column"
      [completed]="Math.abs(dot1()) < 0.02 && Math.abs(dot2()) < 0.02"
    >
      <div class="slider-box">
        <div class="row">
          <span class="lab">b1</span>
          <input type="range" min="-1" max="4" step="0.1" [value]="b1()" (input)="b1.set(+$any($event).target.value)" />
          <span class="val">{{ b1().toFixed(1) }}</span>
        </div>
        <div class="row">
          <span class="lab">b2</span>
          <input type="range" min="-1" max="4" step="0.1" [value]="b2()" (input)="b2.set(+$any($event).target.value)" />
          <span class="val">{{ b2().toFixed(1) }}</span>
        </div>
        <div class="row">
          <span class="lab">b3</span>
          <input type="range" min="-1" max="4" step="0.1" [value]="b3()" (input)="b3.set(+$any($event).target.value)" />
          <span class="val">{{ b3().toFixed(1) }}</span>
        </div>
      </div>

      <div class="matrix-box">
        <div class="mat-row">
          <span class="mat-label">A</span>
          <span class="mat-code">[[1, 0], [1, 1], [1, 2]]</span>
        </div>
        <div class="mat-row">
          <span class="mat-label">A^T A</span>
          <span class="mat-code">[[{{ ls().ata[0][0] }}, {{ ls().ata[0][1] }}], [{{ ls().ata[1][0] }}, {{ ls().ata[1][1] }}]]</span>
        </div>
        <div class="mat-row">
          <span class="mat-label">A^T b</span>
          <span class="mat-code">[{{ atb()[0].toFixed(2) }}, {{ atb()[1].toFixed(2) }}]</span>
        </div>
        <div class="mat-row strong">
          <span class="mat-label">xHat</span>
          <span class="mat-code">[{{ ls().xHat[0].toFixed(3) }}, {{ ls().xHat[1].toFixed(3) }}]</span>
        </div>
      </div>

      <div class="residual-grid">
        <div class="card small">
          <div class="card-title">b</div>
          <div class="vec">({{ b()[0].toFixed(2) }}, {{ b()[1].toFixed(2) }}, {{ b()[2].toFixed(2) }})</div>
        </div>
        <div class="card small">
          <div class="card-title">AxHat</div>
          <div class="vec">({{ ls().projection[0].toFixed(2) }}, {{ ls().projection[1].toFixed(2) }}, {{ ls().projection[2].toFixed(2) }})</div>
        </div>
        <div class="card small">
          <div class="card-title">r = b - AxHat</div>
          <div class="vec">({{ ls().residual[0].toFixed(2) }}, {{ ls().residual[1].toFixed(2) }}, {{ ls().residual[2].toFixed(2) }})</div>
        </div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">a1 · r</span>
          <span class="iv">{{ dot1().toFixed(4) }}</span>
        </div>
        <div class="info-row">
          <span class="il">a2 · r</span>
          <span class="iv">{{ dot2().toFixed(4) }}</span>
        </div>
        <div class="info-row big">
          <span class="il">檢查</span>
          <span class="iv">A^T r = ({{ dot1().toFixed(4) }}, {{ dot2().toFixed(4) }})</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        A^T A 把原本沒有解的 3x2 問題，變成一個 2x2 的方程組。
        這就是 least squares 最常見的入口。
      </p>
      <p>
        但 A^T A 也有代價，它會放大條件數。下一節看 QR 分解，
        它能用更數值穩定的方式做同一件事。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 12px; background: var(--accent-10);
      border-radius: 8px; margin: 10px 0; }
    .formula.big { font-size: 24px; padding: 16px; }
    .slider-box { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .row { display: grid; grid-template-columns: 28px 1fr 48px; gap: 10px; align-items: center; }
    .lab { font-size: 12px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .val { font-size: 12px; text-align: right; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    input { accent-color: var(--accent); }
    .matrix-box { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); margin-bottom: 12px; }
    .mat-row { display: grid; grid-template-columns: 58px 1fr; gap: 10px; padding: 4px 0; }
    .mat-row.strong .mat-code { color: var(--accent); font-weight: 700; }
    .mat-label { font-size: 12px; color: var(--text-muted); }
    .mat-code { font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .residual-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
    .card.small { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .card-title { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; }
    .vec { font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 76px 1fr; border-bottom: 1px solid var(--border); }
    .info-row:last-child { border-bottom: none; }
    .info-row.big { background: var(--accent-10); }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface); border-right: 1px solid var(--border); }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    @media (max-width: 720px) { .residual-grid { grid-template-columns: 1fr; } }
  `,
})
export class StepNormalEquationsComponent {
  readonly Math = Math;
  readonly A = LS_DEMO_A;
  private readonly cols = columns32(this.A);
  readonly b1 = signal(0.9);
  readonly b2 = signal(1.8);
  readonly b3 = signal(2.6);
  readonly b = computed<Vec3>(() => [this.b1(), this.b2(), this.b3()]);
  readonly ls = computed(() => leastSquares32(this.A, this.b()));
  readonly atb = computed(() => atb32(this.A, this.b()));
  readonly dot1 = computed(() =>
    this.cols[0][0] * this.ls().residual[0] +
    this.cols[0][1] * this.ls().residual[1] +
    this.cols[0][2] * this.ls().residual[2],
  );
  readonly dot2 = computed(() =>
    this.cols[1][0] * this.ls().residual[0] +
    this.cols[1][1] * this.ls().residual[1] +
    this.cols[1][2] * this.ls().residual[2],
  );
}