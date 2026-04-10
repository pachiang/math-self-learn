import { Component, computed, signal } from '@angular/core';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { LS_DEMO_A, Vec3, qrLeastSquares32 } from './lstsq-util';

@Component({
  selector: 'app-step-qr-least-squares',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="用 QR 解 Least Squares" subtitle="§16.4">
      <p>
        把 A 寫成 A = QR，其中 Q 的 column 是正交規一向量，R 是上三角矩陣。
        那麼 least squares 會變成一個更乾淨的問題。
      </p>
      <p class="formula">min ||QRx - b||^2 = min ||Rx - Q^T b||^2</p>
      <p>
        因為 Q 保長度，真正要解的是上三角系統 R xHat = Q^T b。
        這通常比先算 A^T A 更穩定。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="改變 b，觀察 Q^T b 的座標與解 xHat 如何同步變化">
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

      <div class="grid">
        <div class="panel">
          <div class="panel-title">Q 的兩個正交方向</div>
          <div class="mono">q1 = ({{ qr().q1[0].toFixed(3) }}, {{ qr().q1[1].toFixed(3) }}, {{ qr().q1[2].toFixed(3) }})</div>
          <div class="mono">q2 = ({{ qr().q2[0].toFixed(3) }}, {{ qr().q2[1].toFixed(3) }}, {{ qr().q2[2].toFixed(3) }})</div>
        </div>

        <div class="panel">
          <div class="panel-title">Q^T b</div>
          <div class="mono">[{{ qr().qtB[0].toFixed(3) }}, {{ qr().qtB[1].toFixed(3) }}]</div>
          <div class="sub">這是 b 在 q1, q2 方向上的座標</div>
        </div>

        <div class="panel">
          <div class="panel-title">R xHat = Q^T b</div>
          <div class="mono">R = [[{{ qr().R[0][0].toFixed(3) }}, {{ qr().R[0][1].toFixed(3) }}], [0, {{ qr().R[1][1].toFixed(3) }}]]</div>
          <div class="mono strong">xHat = ({{ qr().xHat[0].toFixed(3) }}, {{ qr().xHat[1].toFixed(3) }})</div>
        </div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">b</span>
          <span class="iv">({{ b()[0].toFixed(2) }}, {{ b()[1].toFixed(2) }}, {{ b()[2].toFixed(2) }})</span>
        </div>
        <div class="info-row">
          <span class="il">AxHat</span>
          <span class="iv">({{ qr().projection[0].toFixed(2) }}, {{ qr().projection[1].toFixed(2) }}, {{ qr().projection[2].toFixed(2) }})</span>
        </div>
        <div class="info-row big">
          <span class="il">||r||^2</span>
          <span class="iv">{{ residualNormSq().toFixed(4) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這裡其實做了兩件事：先把問題旋轉到正交座標系裡，再解一個上三角系統。
        這正是數值線性代數裡 QR 這麼重要的原因。
      </p>
      <span class="hint">
        下一節把解 least squares 包成一個算子，這就是 pseudoinverse。
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 12px; background: var(--accent-10);
      border-radius: 8px; margin: 10px 0; }
    .slider-box { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .row { display: grid; grid-template-columns: 28px 1fr 48px; gap: 10px; align-items: center; }
    .lab { font-size: 12px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .val { font-size: 12px; text-align: right; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    input { accent-color: var(--accent); }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
    .panel { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .panel-title { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
    .mono { font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .mono.strong { color: var(--accent); font-weight: 700; }
    .sub { margin-top: 8px; font-size: 12px; color: var(--text-secondary); }
    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 72px 1fr; border-bottom: 1px solid var(--border); }
    .info-row:last-child { border-bottom: none; }
    .info-row.big { background: var(--accent-10); }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface); border-right: 1px solid var(--border); }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class StepQrLeastSquaresComponent {
  readonly A = LS_DEMO_A;
  readonly b1 = signal(0.6);
  readonly b2 = signal(1.6);
  readonly b3 = signal(3.1);
  readonly b = computed<Vec3>(() => [this.b1(), this.b2(), this.b3()]);
  readonly qr = computed(() => qrLeastSquares32(this.A, this.b()));
  readonly residualNormSq = computed(
    () =>
      this.qr().residual[0] ** 2 +
      this.qr().residual[1] ** 2 +
      this.qr().residual[2] ** 2,
  );
}