import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { toIEEE754, roundSig } from './numerical-util';

@Component({
  selector: 'app-step-floating-point',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="浮點數與誤差" subtitle="§15.1">
      <p>
        前面 14 章我們都假設計算是「精確」的。但電腦用<strong>有限位數</strong>來存數字——
        這叫 <strong>IEEE 754 浮點數</strong>。
      </p>
      <p>
        一個 64 位浮點數長這樣：
      </p>
      <ul>
        <li>1 位<strong>符號</strong>（正或負）</li>
        <li>11 位<strong>指數</strong>（大致決定「多大」）</li>
        <li>52 位<strong>尾數</strong>（有效數字）</li>
      </ul>
      <p>
        52 位尾數 ≈ 15–16 位十進位精度。超過這個精度的部分——被<strong>直接丟掉</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="輸入一個數字，看電腦怎麼存它">
      <div class="input-row">
        <span class="input-label">輸入：</span>
        <input type="text" [value]="inputStr()" (input)="onInput($event)"
               class="num-input" placeholder="例如 0.1" />
      </div>

      <div class="bits-block">
        <div class="bits-row">
          <span class="bit sign">{{ bits().sign }}</span>
          @for (b of expBits(); track $index) {
            <span class="bit exp">{{ b }}</span>
          }
          @for (b of mantBits(); track $index; let i = $index) {
            <span class="bit mant" [class.dim]="i >= 30">{{ b }}</span>
          }
        </div>
        <div class="bits-legend">
          <span class="leg sign-l">符號 (1)</span>
          <span class="leg exp-l">指數 (11)</span>
          <span class="leg mant-l">尾數 (52)</span>
        </div>
      </div>

      <div class="info-line">
        電腦存的值：<strong>{{ bits().stored }}</strong>
        @if (inputNum() === inputNum()) {
          <span class="err-note">（這就是 JavaScript 的 {{ inputNum() }}）</span>
        }
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="1 + ε = ? 當 ε 太小時會被「吃掉」">
      <div class="eps-row">
        <span class="eps-label">ε = 10^{{ epsExp() }}</span>
        <input type="range" [min]="-18" [max]="-1" step="1" [value]="epsExp()"
               (input)="onEps($event)" class="eps-slider" />
      </div>

      <div class="eps-result">
        <div class="er-line">
          <span class="er-label">1 + ε =</span>
          <span class="er-val" [class.swallowed]="epsSwallowed()">{{ epsResult() }}</span>
        </div>
        @if (epsSwallowed()) {
          <div class="swallowed-msg">ε 被吃掉了！結果跟 1 一模一樣</div>
        }
      </div>

      <svg viewBox="0 6 400 50" class="numberline">
        <!-- representable points near 1 -->
        @for (pt of gridPoints; track pt.x) {
          <line [attr.x1]="pt.x" y1="20" [attr.x2]="pt.x" y2="36" stroke="var(--border)" stroke-width="1" />
        }
        <line x1="0" y1="28" x2="400" y2="28" stroke="var(--border)" stroke-width="0.5" />
        <!-- 1.0 -->
        <circle [attr.cx]="oneX" cy="28" r="4" fill="var(--accent)" />
        <text [attr.x]="oneX" y="48" class="nl-label">1.0</text>
        <!-- result -->
        <circle [attr.cx]="resultX()" cy="28" r="4"
                [attr.fill]="epsSwallowed() ? '#a05a5a' : '#5a8a5a'" />
        <text [attr.x]="resultX()" y="14" class="nl-label" [class.red]="epsSwallowed()">1+ε</text>
      </svg>
    </app-challenge-card>

    <app-challenge-card prompt="災難性消去：兩個很接近的數相減">
      <div class="cancel-row">
        <span class="cancel-label">精度（有效位數）p = {{ sigDigits() }}</span>
        <input type="range" min="3" max="15" step="1" [value]="sigDigits()"
               (input)="onSig($event)" class="cancel-slider" />
      </div>

      <div class="cancel-demo">
        <div class="cd-row">
          <span class="cd-label">a =</span>
          <span class="cd-val">{{ cancelA }}</span>
        </div>
        <div class="cd-row">
          <span class="cd-label">b =</span>
          <span class="cd-val">{{ cancelB }}</span>
        </div>
        <div class="cd-row">
          <span class="cd-label">精確 a − b =</span>
          <span class="cd-val exact">{{ exactDiff }}</span>
        </div>
        <div class="cd-row">
          <span class="cd-label">有限精度 =</span>
          <span class="cd-val computed" [class.bad]="cancelRelErr() > 0.01">{{ cancelResult() }}</span>
        </div>
        <div class="cd-row">
          <span class="cd-label">相對誤差 =</span>
          <span class="cd-val" [class.bad]="cancelRelErr() > 0.01">{{ (cancelRelErr() * 100).toFixed(2) }}%</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這三個現象——<strong>捨入誤差</strong>、<strong>被吞沒</strong>、<strong>災難性消去</strong>——
        是數值計算的三大陷阱。後面幾節會看到他們怎麼影響解線性方程組。
      </p>
    </app-prose-block>
  `,
  styles: `
    .input-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .input-label { font-size: 13px; color: var(--text); font-weight: 600; }
    .num-input { flex: 1; max-width: 200px; padding: 6px 10px; border: 1px solid var(--border);
      border-radius: 6px; background: var(--bg); color: var(--text); font-size: 14px;
      font-family: 'JetBrains Mono', monospace; }

    .bits-block { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); overflow-x: auto; margin-bottom: 10px; }
    .bits-row { display: flex; gap: 1px; flex-wrap: wrap; }
    .bit { width: 16px; height: 22px; display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 700;
      border-radius: 2px;
      &.sign { background: rgba(160, 90, 90, 0.25); color: #a05a5a; }
      &.exp { background: rgba(90, 127, 170, 0.2); color: #5a7faa; }
      &.mant { background: rgba(90, 138, 90, 0.15); color: #5a8a5a; }
      &.dim { opacity: 0.4; } }
    .bits-legend { display: flex; gap: 14px; margin-top: 6px; font-size: 11px; color: var(--text-muted); }
    .leg { padding: 2px 6px; border-radius: 3px;
      &.sign-l { background: rgba(160, 90, 90, 0.1); }
      &.exp-l { background: rgba(90, 127, 170, 0.1); }
      &.mant-l { background: rgba(90, 138, 90, 0.08); } }

    .info-line { font-size: 13px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
      strong { color: var(--accent); } }
    .err-note { font-size: 11px; color: var(--text-muted); }

    .eps-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .eps-label { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 120px; }
    .eps-slider { flex: 1; accent-color: var(--accent); }

    .eps-result { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); margin-bottom: 10px; }
    .er-line { display: flex; align-items: baseline; gap: 8px; }
    .er-label { font-size: 13px; color: var(--text-secondary); }
    .er-val { font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      &.swallowed { color: #a05a5a; } }
    .swallowed-msg { margin-top: 6px; font-size: 12px; font-weight: 700; color: #a05a5a;
      padding: 4px 10px; background: rgba(160, 90, 90, 0.1); border-radius: 4px; display: inline-block; }

    .numberline { width: 100%; max-width: 400px; display: block; margin: 0 auto; }
    .nl-label { font-size: 10px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; &.red { fill: #a05a5a; } }

    .cancel-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .cancel-label { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 200px; }
    .cancel-slider { flex: 1; accent-color: var(--accent); }

    .cancel-demo { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .cd-row { display: flex; gap: 10px; margin: 4px 0; font-size: 13px;
      font-family: 'JetBrains Mono', monospace; }
    .cd-label { color: var(--text-muted); min-width: 130px; }
    .cd-val { color: var(--text); font-weight: 600;
      &.exact { color: #5a8a5a; }
      &.computed { color: var(--accent); }
      &.bad { color: #a05a5a; } }
  `,
})
export class StepFloatingPointComponent {
  readonly inputStr = signal('0.1');
  readonly inputNum = computed(() => parseFloat(this.inputStr()) || 0);
  readonly bits = computed(() => toIEEE754(this.inputNum()));
  readonly expBits = computed(() => this.bits().exponent.split(''));
  readonly mantBits = computed(() => this.bits().mantissa.split(''));

  // Epsilon demo
  readonly epsExp = signal(-10);
  readonly eps = computed(() => Math.pow(10, this.epsExp()));
  readonly epsResult = computed(() => String(1 + this.eps()));
  readonly epsSwallowed = computed(() => 1 + this.eps() === 1);

  // Number line
  readonly oneX = 200;
  readonly gridPoints = Array.from({ length: 21 }, (_, i) => ({
    x: 100 + i * 15,
  }));
  readonly resultX = computed(() => {
    const e = this.eps();
    // Map epsilon to pixel offset (log scale capped)
    if (this.epsSwallowed()) return this.oneX;
    const logE = Math.log10(e);
    const offset = Math.max(5, Math.min(180, (logE + 16) * 12));
    return this.oneX + offset;
  });

  // Catastrophic cancellation
  readonly cancelA = 1.0000001;
  readonly cancelB = 1.0000000;
  readonly exactDiff = '0.0000001';
  readonly sigDigits = signal(7);

  readonly cancelResult = computed(() => {
    const p = this.sigDigits();
    const a = roundSig(this.cancelA, p);
    const b = roundSig(this.cancelB, p);
    return roundSig(a - b, p);
  });

  readonly cancelRelErr = computed(() => {
    const exact = 1e-7;
    const computed = this.cancelResult();
    return Math.abs(computed - exact) / exact;
  });

  onInput(ev: Event): void {
    this.inputStr.set((ev.target as HTMLInputElement).value);
  }
  onEps(ev: Event): void {
    this.epsExp.set(+(ev.target as HTMLInputElement).value);
  }
  onSig(ev: Event): void {
    this.sigDigits.set(+(ev.target as HTMLInputElement).value);
  }
}
