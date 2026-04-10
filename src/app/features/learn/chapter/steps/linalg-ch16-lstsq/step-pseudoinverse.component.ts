import { Component, computed, signal } from '@angular/core';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { LS_DEMO_A, Vec3, applyMat23, mat32Vec2, pseudoinverse32 } from './lstsq-util';

const EXAMPLES: Array<{ name: string; b: Vec3; note: string }> = [
  { name: '接近可解', b: [1.0, 1.8, 2.9], note: '這個 b 幾乎落在 column space 上。' },
  { name: '偏離較多', b: [2.6, 0.8, 2.5], note: '這個 b 離 column space 比較遠。' },
  { name: '帶有雜訊', b: [0.4, 2.0, 1.5], note: '可以把它想成測量誤差污染過的資料。' },
];

@Component({
  selector: 'app-step-pseudoinverse',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Pseudoinverse A^+" subtitle="§16.5">
      <p>
        normal equations 給了我們一種每次解一次的方法。
        pseudoinverse 則把這件事包成一個算子。
      </p>
      <p class="formula">xHat = A^+ b</p>
      <p>
        當 A 滿 column rank 時，<strong>A^+ = (A^T A)^(-1) A^T</strong>。
        它直接把任意 b 送到 least-squares 解。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="換不同的 b，觀察 A^+ 如何一鍵產生 xHat 和投影 AxHat">
      <div class="tabs">
        @for (example of examples; track example.name; let i = $index) {
          <button class="tab" [class.active]="sel() === i" (click)="sel.set(i)">{{ example.name }}</button>
        }
      </div>

      <div class="note">{{ current().note }}</div>

      <div class="matrix-box">
        <div class="mat-row">
          <span class="mat-label">A^+</span>
          <span class="mat-code">[[{{ aPlus()[0][0].toFixed(2) }}, {{ aPlus()[0][1].toFixed(2) }}, {{ aPlus()[0][2].toFixed(2) }}], [{{ aPlus()[1][0].toFixed(2) }}, {{ aPlus()[1][1].toFixed(2) }}, {{ aPlus()[1][2].toFixed(2) }}]]</span>
        </div>
        <div class="mat-row">
          <span class="mat-label">b</span>
          <span class="mat-code">[{{ current().b[0].toFixed(2) }}, {{ current().b[1].toFixed(2) }}, {{ current().b[2].toFixed(2) }}]</span>
        </div>
        <div class="mat-row strong">
          <span class="mat-label">xHat</span>
          <span class="mat-code">[{{ xHat()[0].toFixed(3) }}, {{ xHat()[1].toFixed(3) }}]</span>
        </div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">AxHat</span>
          <span class="iv">({{ projection()[0].toFixed(2) }}, {{ projection()[1].toFixed(2) }}, {{ projection()[2].toFixed(2) }})</span>
        </div>
        <div class="info-row">
          <span class="il">殘差</span>
          <span class="iv">({{ residual()[0].toFixed(2) }}, {{ residual()[1].toFixed(2) }}, {{ residual()[2].toFixed(2) }})</span>
        </div>
        <div class="info-row big">
          <span class="il">解釋</span>
          <span class="iv">A^+ 先把 b 壓回 column space，再讀出對應的係數 xHat</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        所以 pseudoinverse 不是假的 inverse，而是 inverse 在不可逆情況下最自然的延伸。
      </p>
      <ul>
        <li><strong>過度決定</strong>時，它給 least-squares 解</li>
        <li><strong>不足決定</strong>時，它會選 minimum-norm 解</li>
      </ul>
      <span class="hint">
        下一節看第二件事：當解有無限多個時，為什麼 A^+ 會挑最短的那個。
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 12px; background: var(--accent-10);
      border-radius: 8px; margin: 10px 0; }
    .tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .tab { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent;
      color: var(--text-muted); font-size: 13px; cursor: pointer; }
    .tab.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; }
    .note { padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 12px;
      font-size: 13px; color: var(--text-secondary); }
    .matrix-box { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); margin-bottom: 12px; }
    .mat-row { display: grid; grid-template-columns: 88px 1fr; gap: 10px; padding: 4px 0; }
    .mat-row.strong .mat-code { color: var(--accent); font-weight: 700; }
    .mat-label { font-size: 12px; color: var(--text-muted); }
    .mat-code { font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 76px 1fr; border-bottom: 1px solid var(--border); }
    .info-row:last-child { border-bottom: none; }
    .info-row.big { background: var(--accent-10); }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface); border-right: 1px solid var(--border); }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepPseudoinverseComponent {
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly A = LS_DEMO_A;
  readonly aPlus = computed(() => pseudoinverse32(this.A));
  readonly current = computed(() => this.examples[this.sel()]);
  readonly xHat = computed(() => applyMat23(this.aPlus(), this.current().b));
  readonly projection = computed(() => mat32Vec2(this.A, this.xHat()));
  readonly residual = computed<Vec3>(() => [
    this.current().b[0] - this.projection()[0],
    this.current().b[1] - this.projection()[1],
    this.current().b[2] - this.projection()[2],
  ]);
}