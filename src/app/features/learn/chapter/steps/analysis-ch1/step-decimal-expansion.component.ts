import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { longDivision } from './analysis-util';

@Component({
  selector: 'app-step-decimal-expansion',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="十進位展開" subtitle="§1.7">
      <p>
        每個實數都能寫成十進位小數。這跟區間套定理直接相關：
        每寫一位數字，就是把區間<strong>縮小 10 倍</strong>。
      </p>
      <p>
        有理數的十進位展開<strong>最終週期</strong>（eventually periodic）：
        1/7 = 0.<span class="periodic">142857</span>142857…
      </p>
      <p>
        無理數的展開<strong>永不重複</strong>：√2 = 1.41421356…，π = 3.14159265…
      </p>
      <p>
        一個經典的等式：<strong>0.999… = 1</strong>。這不是「近似等於」，而是精確相等——
        它們是同一個實數的兩種寫法。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="輸入分數 p/q，看它的十進位展開和循環節">
      <div class="input-row">
        <div class="frac-input">
          <input type="number" [value]="numerator()" (input)="numerator.set(+($any($event.target)).value)"
                 class="num-inp" min="0" max="999" />
          <div class="frac-bar"></div>
          <input type="number" [value]="denominator()" (input)="onDenom($event)"
                 class="num-inp" min="1" max="999" />
        </div>
        <span class="eq">=</span>
        <div class="decimal-display">
          <span class="int-part">{{ result().intPart }}.</span>
          @if (result().periodStart >= 0) {
            <span class="non-periodic">{{ nonPeriodicStr() }}</span>
            <span class="periodic-part">{{ periodicStr() }}</span>
            <span class="dots">…</span>
          } @else {
            <span class="non-periodic">{{ allDigitsStr() }}</span>
            @if (result().digits.length > 0) {
              <span class="terminating">（有限小數）</span>
            }
          }
        </div>
      </div>

      @if (result().periodStart >= 0) {
        <div class="period-info">
          <span class="pi-label">循環節長度</span>
          <span class="pi-val">{{ result().periodLength }}</span>
          <span class="pi-label">循環節開始位置</span>
          <span class="pi-val">第 {{ result().periodStart + 1 }} 位</span>
        </div>
      }

      <div class="presets">
        <span class="pr-label">試試看：</span>
        @for (p of presets; track p.label) {
          <button class="pr-btn" (click)="numerator.set(p.num); denominator.set(p.den)">{{ p.label }}</button>
        }
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="0.999… = 1 的三種證明">
      <div class="proof-block">
        <div class="pb-item">
          <div class="pb-title">代數證明</div>
          <div class="pb-body">
            設 x = 0.999…<br />
            10x = 9.999…<br />
            10x − x = 9<br />
            9x = 9 → <strong>x = 1</strong>
          </div>
        </div>
        <div class="pb-item">
          <div class="pb-title">級數證明</div>
          <div class="pb-body">
            0.999… = 9/10 + 9/100 + 9/1000 + …<br />
            = 9 · Σ (1/10)ⁿ = 9 · (1/10)/(1 − 1/10)<br />
            = 9 · 1/9 = <strong>1</strong>
          </div>
        </div>
        <div class="pb-item">
          <div class="pb-title">完備性證明</div>
          <div class="pb-body">
            如果 0.999… ≠ 1，那 1 − 0.999… = ε > 0。<br />
            但 1 − 0.999…9（n 個 9）= 10⁻ⁿ。<br />
            由 Archimedean 性質，存在 n 使 10⁻ⁿ &lt; ε。矛盾。<br />
            所以 <strong>0.999… = 1</strong>。
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        十進位展開把「實數」變成了「無限字串」。
        有理數的字串有規律（循環），無理數的沒有。
      </p>
      <p>
        但這引出了一個驚人的問題：有多少個這樣的無限字串？
        下一節用 Cantor 的對角論證回答：<strong>不可數多</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .periodic { text-decoration: overline; color: var(--accent); font-weight: 700; }

    .input-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px;
      flex-wrap: wrap; }
    .frac-input { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .num-inp { width: 60px; padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px;
      text-align: center; font-size: 16px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; background: var(--bg); color: var(--text); }
    .frac-bar { width: 60px; height: 2px; background: var(--text); }
    .eq { font-size: 18px; color: var(--text-muted); }

    .decimal-display { font-size: 18px; font-family: 'JetBrains Mono', monospace;
      color: var(--text); font-weight: 600; }
    .int-part { color: var(--text); }
    .non-periodic { color: var(--text-secondary); }
    .periodic-part { text-decoration: overline; color: var(--accent); }
    .dots { color: var(--text-muted); }
    .terminating { font-size: 12px; color: #5a8a5a; font-weight: 400; margin-left: 8px; }

    .period-info { display: flex; gap: 16px; margin-bottom: 12px; padding: 10px;
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border); }
    .pi-label { font-size: 12px; color: var(--text-muted); }
    .pi-val { font-size: 14px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; }

    .presets { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
    .pr-label { font-size: 12px; color: var(--text-muted); }
    .pr-btn { padding: 3px 8px; border: 1px solid var(--border); border-radius: 4px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); } }

    .proof-block { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
    .pb-item { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .pb-title { font-size: 12px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .pb-body { font-size: 12px; color: var(--text-secondary); line-height: 1.8;
      font-family: 'JetBrains Mono', monospace;
      strong { color: #5a8a5a; } }
  `,
})
export class StepDecimalExpansionComponent {
  readonly numerator = signal(1);
  readonly denominator = signal(7);
  readonly presets = [
    { label: '1/3', num: 1, den: 3 },
    { label: '1/7', num: 1, den: 7 },
    { label: '22/7', num: 22, den: 7 },
    { label: '1/11', num: 1, den: 11 },
    { label: '1/4', num: 1, den: 4 },
    { label: '355/113', num: 355, den: 113 },
  ];

  readonly result = computed(() => longDivision(this.numerator(), this.denominator()));

  readonly nonPeriodicStr = computed(() => {
    const r = this.result();
    if (r.periodStart < 0) return '';
    return r.digits.slice(0, r.periodStart).join('');
  });

  readonly periodicStr = computed(() => {
    const r = this.result();
    if (r.periodStart < 0) return '';
    return r.digits.slice(r.periodStart, r.periodStart + r.periodLength).join('');
  });

  readonly allDigitsStr = computed(() => this.result().digits.join(''));

  onDenom(ev: Event): void {
    const v = +(ev.target as HTMLInputElement).value;
    if (v >= 1) this.denominator.set(v);
  }
}
