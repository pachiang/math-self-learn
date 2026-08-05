import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-no-compensation',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch18">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 18.5</p>
        <h2>平均回到中心，不需要未來替過去還債</h2>
        <p class="lede">
          公平硬幣連續出現 H，不會讓下一次 T 的 chance 增加。舊 streak 對平均的影響會下降，是因為
          denominator 持續增長，而不是 future outcomes 被迫補償。
        </p>
      </header>
      <section class="lln-controls dual">
        <label
          >Existing heads streak<input
            type="range"
            min="1"
            max="20"
            step="1"
            [value]="streak()"
            (input)="streak.set(+$any($event).target.value)"
          /><strong>{{ streak() }}</strong></label
        ><label
          >Future observations<input
            type="range"
            min="0"
            max="200"
            step="10"
            [value]="future()"
            (input)="future.set(+$any($event).target.value)"
          /><strong>{{ future() }}</strong></label
        >
      </section>
      <section class="compensation-board">
        <div class="streak-tape">
          @for (item of tape(); track $index) {
            <i [class.future]="$index >= streak()">{{ item }}</i>
          }
        </div>
        <div class="next-chance">
          <span>NEXT FLIP AFTER {{ streak() }} HEADS</span>
          <div><i style="width:50%">H 50%</i><i style="width:50%">T 50%</i></div>
          <strong>mechanism unchanged</strong>
        </div>
        <div class="dilution-meter">
          <span>Initial streak's share of all data</span
          ><i><b [style.width.%]="streakShare() * 100"></b></i
          ><strong>{{ (streakShare() * 100).toFixed(1) }}%</strong>
          <p>{{ reading() }}</p>
        </div>
      </section>
      <aside class="insight-card">
        <div class="lln-core">
          <span>future stays fair</span><i>+</i><strong>past imbalance gets diluted</strong>
        </div>
        <div>
          <span class="card-label">Dilution, not compensation</span>
          <p><strong>LLN 與 independent trials 相容：每次仍用相同 p，沒有欠債帳本。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>條件機率層：streak 為何不改下一次？</summary>
        <div class="lln-formulas">
          <app-math e="P(X_{n+1}=H\\mid X_1=\\cdots=X_n=H)=P(X_{n+1}=H)=\\frac12" />
          <p>
            這是 independence，不是 LLN 本身。LLN 解釋 long-run average；independence 解釋下一次
            chance 不因 history 改變。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2NoCompensationComponent {
  readonly streak = signal(8);
  readonly future = signal(80);
  readonly tape = computed(() =>
    Array.from({ length: Math.min(60, this.streak() + this.future()) }, (_, i) =>
      i < this.streak() ? 'H' : (i * 17 + 3) % 2 ? 'H' : 'T',
    ),
  );
  readonly streakShare = computed(() => this.streak() / (this.streak() + this.future() || 1));
  readonly reading = computed(() =>
    this.future() === 0
      ? '目前 average 是 1；但下一次仍是公平硬幣。'
      : this.streakShare() < 0.1
        ? '舊 streak 現在只占全部資料的一小部分，不需要 future 刻意多出 T。'
        : '增加 future data，看固定 streak 的 share 如何被 denominator 稀釋。',
  );
}
