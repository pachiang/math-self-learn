import { Component, computed, signal } from '@angular/core';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { Pt, lineFit } from './lstsq-util';

const POINTS: Pt[] = [
  { x: -3, y: -1.9 },
  { x: -2, y: -1.0 },
  { x: -1, y: -0.2 },
  { x: 0, y: 0.6 },
  { x: 1, y: 1.2 },
  { x: 2, y: 2.4 },
  { x: 3, y: 2.8 },
];

@Component({
  selector: 'app-step-why-least-squares',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="為什麼需要 Least Squares" subtitle="§16.1">
      <p>
        到了這裡，<code>Ax = b</code> 不再總是剛好有解。資料通常比未知數多，
        所以方程會變成<strong>過度決定</strong>。
      </p>
      <p>
        你想找一條直線穿過所有點，但真實資料帶著雜訊；既然無法讓殘差完全為零，
        合理目標就是讓殘差的平方和最小。
      </p>
      <p class="formula">min ||Ax - b||^2</p>
      <p>
        這就是 least squares。它不是隨便找近似，而是用代數和幾何定義出
        <strong>最好的近似</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card
      prompt="先手動調斜率和截距，感受沒有一條線能通過所有點，再按最佳擬合"
      [completed]="manualSse() <= best().sse + 0.25"
    >
      <div class="plot-wrap">
        <svg viewBox="-160 -120 320 240" class="plot">
          @for (g of grid; track g) {
            <line x1="-140" [attr.y1]="g" x2="140" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" y1="-100" [attr.x2]="g" y2="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-145" y1="0" x2="145" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-105" x2="0" y2="105" stroke="var(--border-strong)" stroke-width="0.8" />

          <line
            x1="-140"
            [attr.y1]="toSvgY(manualSlope() * -5.6 + manualIntercept())"
            x2="140"
            [attr.y2]="toSvgY(manualSlope() * 5.6 + manualIntercept())"
            stroke="#a05a5a"
            stroke-width="2"
          />

          <line
            x1="-140"
            [attr.y1]="toSvgY(best().solution[0] * -5.6 + best().solution[1])"
            x2="140"
            [attr.y2]="toSvgY(best().solution[0] * 5.6 + best().solution[1])"
            stroke="var(--accent)"
            stroke-width="2.6"
            stroke-dasharray="7 4"
          />

          @for (pt of points; track pt.x) {
            <line
              [attr.x1]="toSvgX(pt.x)"
              [attr.y1]="toSvgY(pt.y)"
              [attr.x2]="toSvgX(pt.x)"
              [attr.y2]="toSvgY(manualSlope() * pt.x + manualIntercept())"
              stroke="#a05a5a"
              stroke-width="1.2"
              stroke-dasharray="3 3"
            />
            <circle [attr.cx]="toSvgX(pt.x)" [attr.cy]="toSvgY(pt.y)" r="5.6" fill="var(--v1)" stroke="white" stroke-width="1.5" />
          }
        </svg>
      </div>

      <div class="slider-box">
        <div class="row">
          <span class="lab">slope</span>
          <input type="range" min="-1" max="2" step="0.05" [value]="manualSlope()" (input)="manualSlope.set(+$any($event).target.value)" />
          <span class="val">{{ manualSlope().toFixed(2) }}</span>
        </div>
        <div class="row">
          <span class="lab">intercept</span>
          <input type="range" min="-1" max="2" step="0.05" [value]="manualIntercept()" (input)="manualIntercept.set(+$any($event).target.value)" />
          <span class="val">{{ manualIntercept().toFixed(2) }}</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn" (click)="snapToBest()">套用最佳擬合</button>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">你目前的線</span>
          <span class="iv">y = {{ manualSlope().toFixed(2) }}x + {{ manualIntercept().toFixed(2) }}</span>
        </div>
        <div class="info-row">
          <span class="il">目前 SSE</span>
          <span class="iv">{{ manualSse().toFixed(3) }}</span>
        </div>
        <div class="info-row big">
          <span class="il">最佳 SSE</span>
          <span class="iv">{{ best().sse.toFixed(3) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這裡的平方不是裝飾。它讓大誤差更貴、讓公式可微，也讓整個問題能寫成漂亮的矩陣形式。
      </p>
      <span class="hint">
        下一節把 least squares 重新翻譯成幾何語言，其實它就是把向量 b 投影到 A 的 column space。
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 12px; background: var(--accent-10);
      border-radius: 8px; margin: 10px 0; }
    .plot-wrap { display: flex; justify-content: center; margin-bottom: 14px; }
    .plot { width: 100%; max-width: 380px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .slider-box { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .row { display: grid; grid-template-columns: 72px 1fr 48px; gap: 10px; align-items: center; }
    .lab, .val { font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .val { text-align: right; }
    input { accent-color: var(--accent); }
    .actions { margin-bottom: 12px; }
    .btn { padding: 6px 14px; border: 1px solid var(--accent); border-radius: 6px; background: var(--accent);
      color: white; font-size: 12px; font-weight: 600; cursor: pointer; }
    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 92px 1fr; border-bottom: 1px solid var(--border); }
    .info-row:last-child { border-bottom: none; }
    .info-row.big { background: var(--accent-10); }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface); border-right: 1px solid var(--border); }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepWhyLeastSquaresComponent {
  readonly points = POINTS;
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly manualSlope = signal(0.4);
  readonly manualIntercept = signal(0.1);
  readonly best = computed(() => lineFit(this.points));
  readonly manualSse = computed(() =>
    this.points.reduce(
      (sum, pt) =>
        sum + (pt.y - this.manualSlope() * pt.x - this.manualIntercept()) ** 2,
      0,
    ),
  );

  toSvgX(x: number): number {
    return x * 25;
  }

  toSvgY(y: number): number {
    return -y * 25;
  }

  snapToBest(): void {
    this.manualSlope.set(this.best().solution[0]);
    this.manualIntercept.set(this.best().solution[1]);
  }
}