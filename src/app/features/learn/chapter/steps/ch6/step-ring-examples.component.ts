import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { zAdd, zMul } from './ring-utils';

interface RingCalc { a: number; b: number; }

@Component({
  selector: 'app-step-ring-examples',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="環的例子" subtitle="\u00A76.2">
      <p>
        整數 Z 只是環的冰山一角。來認識幾個有趣的環：
      </p>
    </app-prose-block>

    <app-challenge-card prompt="在不同的環裡做運算，感受它們的差異">
      <!-- Z_n calculator -->
      <div class="calc-section">
        <div class="calc-title">Z\u2099 計算器（模 n 的整數環）</div>
        <div class="calc-controls">
          <span class="cl">n =</span>
          @for (n of nOptions; track n) {
            <button class="n-btn" [class.active]="modN() === n" (click)="modN.set(n)">{{ n }}</button>
          }
        </div>
        <div class="calc-inputs">
          <div class="input-group">
            <label>a =</label>
            <input type="number" [value]="calcA()" (input)="calcA.set(+$any($event).target.value)" min="0" [max]="modN()-1" />
          </div>
          <div class="input-group">
            <label>b =</label>
            <input type="number" [value]="calcB()" (input)="calcB.set(+$any($event).target.value)" min="0" [max]="modN()-1" />
          </div>
        </div>
        <div class="calc-results">
          <div class="result">a + b = {{ addResult() }} <span class="mod">(mod {{ modN() }})</span></div>
          <div class="result">a \u00D7 b = {{ mulResult() }} <span class="mod">(mod {{ modN() }})</span></div>
        </div>
      </div>

      <!-- Matrix example -->
      <div class="matrix-section">
        <div class="calc-title">2\u00D72 矩陣環 M\u2082(R) — 乘法不交換！</div>
        <div class="matrix-demo">
          <div class="matrix">[1 1]<br/>[0 1]</div>
          <span class="op">\u00D7</span>
          <div class="matrix">[1 0]<br/>[1 1]</div>
          <span class="op">=</span>
          <div class="matrix">[2 1]<br/>[1 1]</div>
        </div>
        <div class="matrix-demo">
          <div class="matrix">[1 0]<br/>[1 1]</div>
          <span class="op">\u00D7</span>
          <div class="matrix">[1 1]<br/>[0 1]</div>
          <span class="op">=</span>
          <div class="matrix">[1 1]<br/>[1 2]</div>
        </div>
        <div class="matrix-verdict">
          AB \u2260 BA — 矩陣環的乘法<strong>不交換</strong>！
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>環的世界非常多樣：</p>
      <div class="ring-zoo">
        <div class="zoo-item"><strong>Z</strong> — 整數環（無限、交換、沒有零因子）</div>
        <div class="zoo-item"><strong>Z\u2099</strong> — 模 n 環（有限、交換、可能有零因子）</div>
        <div class="zoo-item"><strong>R[x]</strong> — 多項式環（無限、交換、沒有零因子）</div>
        <div class="zoo-item"><strong>M\u2082(R)</strong> — 矩陣環（不交換！有零因子！）</div>
      </div>
      <span class="hint">
        Z₆ 裡有一件奇怪的事：2 \u00D7 3 = 0，但 2 \u2260 0 且 3 \u2260 0。
        兩個非零的東西乘出零？下一節我們正式研究這個現象。
      </span>
    </app-prose-block>
  `,
  styles: `
    .calc-section, .matrix-section {
      padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 14px;
    }
    .calc-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
    .calc-controls { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
    .cl { font-size: 13px; color: var(--text-secondary); }
    .n-btn {
      width: 36px; height: 30px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 14px; font-weight: 600; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); }
    }
    .calc-inputs { display: flex; gap: 12px; margin-bottom: 10px; }
    .input-group { display: flex; align-items: center; gap: 6px; }
    .input-group label { font-size: 14px; font-weight: 500; color: var(--text-secondary); }
    .input-group input {
      width: 60px; padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px;
      background: var(--bg-surface); color: var(--text); font-size: 16px; font-family: 'JetBrains Mono', monospace;
    }
    .calc-results { display: flex; gap: 20px; }
    .result { font-size: 16px; font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--text); }
    .mod { font-size: 12px; color: var(--text-muted); font-weight: 400; }

    .matrix-demo { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .matrix {
      padding: 6px 10px; border: 1px solid var(--border); border-radius: 4px;
      font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--text);
      background: var(--bg-surface); line-height: 1.4; white-space: pre;
    }
    .op { font-size: 16px; color: var(--text-muted); }
    .matrix-verdict {
      font-size: 13px; color: var(--accent); font-weight: 600; margin-top: 4px;
      strong { color: var(--text); }
    }

    .ring-zoo { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
    .zoo-item {
      padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;
      font-size: 13px; color: var(--text-secondary); background: var(--bg-surface);
      strong { color: var(--text); font-family: 'JetBrains Mono', monospace; }
    }
  `,
})
export class StepRingExamplesComponent {
  readonly nOptions = [4, 5, 6, 7, 8, 12];
  readonly modN = signal(6);
  readonly calcA = signal(2);
  readonly calcB = signal(3);

  readonly addResult = computed(() => zAdd(this.calcA(), this.calcB(), this.modN()));
  readonly mulResult = computed(() => zMul(this.calcA(), this.calcB(), this.modN()));
}
