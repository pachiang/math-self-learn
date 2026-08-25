import { Component, computed, signal } from '@angular/core';

const N = 5;

@Component({
  selector: 'app-fields-ch1-char-and-fp',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 1.4</p>
        <h2>Field 不一定像 ℚ／ℝ／ℂ</h2>
        <p class="lede">
          Field 只約束「四則運算安全」，沒約束大小或型態。一直加 1，看兩個世界的差別：ℚ 永遠往右去，
          <code>F&#8325; = ℤ/5</code> 卻會<strong>繞回 0</strong>——而它照樣是個能除的 field。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>在 F&#8325; 裡從 0 一直加 1，會回到 0 嗎？要幾次？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'never'" (click)="prediction.set('never')">不會回到 0</button>
          <button type="button" [class.active]="prediction() === 'five'" (click)="prediction.set('five')">5 次</button>
          <button type="button" [class.active]="prediction() === 'six'" (click)="prediction.set('six')">6 次</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'five'">
            {{ prediction() === 'five'
              ? '對。按 +1 五次，F₅ 剛好繞回 0——這個「5」就是它的 characteristic。'
              : '按下面的 +1 自己數：F₅ 每 5 次繞回 0；ℚ 則永遠不會。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="加一計數器">
        <span class="kicker">加 1 計數器</span>
        <button type="button" class="big-add" (click)="add()">＋1</button>
        <button type="button" (click)="reset()">重設</button>
        <span class="count-readout">已加 1 共 <strong>{{ count() }}</strong> 次</span>
      </div>

      <section class="stage char-grid">
        <div class="char-panel">
          <p class="board-scope">ℚ · CHAR 0</p>
          <div class="q-line" role="list" aria-label="ℚ 上的 1 累加，永遠往右">
            @for (v of qStrip; track v) {
              <div class="slot" role="listitem" [class.in]="v <= shownCount()" [class.head]="v === shownCount()" [class.origin]="v === 0">
                <span>{{ v }}</span>
              </div>
            }
            @if (count() > qStrip.length - 1) { <span class="more">…{{ count() }}</span> }
          </div>
          <p class="equation muted">1 + 1 + … 永遠往右，永遠不回到 0 → <strong>char(ℚ) = 0</strong>。</p>
        </div>

        <div class="char-panel">
          <p class="board-scope is-field">F&#8325; = ℤ/5 · CHAR 5</p>
          <svg class="ring-svg" viewBox="0 0 220 220" role="img" [attr.aria-label]="ringAria()">
            <circle class="ring-track" cx="110" cy="110" r="78" />
            @for (v of residues; track v) {
              <g class="ring-node" [class.here]="v === position()" [attr.transform]="nodeTransform(v)">
                <circle r="21" />
                <text y="1">{{ v }}</text>
              </g>
            }
            <text class="ring-center" x="110" y="114">{{ position() }}</text>
          </svg>
          <p class="equation" [class.blocked]="wrapped()">
            目前落在 {{ position() }}。{{ wrapped() ? '剛好繞回 0！加 5 次回到起點 → char(F₅) = 5。' : '繼續加，看它幾次繞回 0。' }}
          </p>
        </div>
      </section>

      <section class="insight">
        <span class="insight-icon">∞≠</span>
        <div>
          <strong>有限的 F&#8323; 也是不折不扣的 field</strong>
          <span>——除法照樣通：在 F&#8325; 裡 2 · 3 = 1，所以 2⁻¹ = 3。char 只描述加法幾次歸零，不影響能不能除。</span>
        </div>
      </section>

      <section class="teaser">
        <p class="kicker">留給下一章的問題</p>
        <p class="teaser-body">
          即使 ℚ 的除法完全沒問題，<code>x² − 2</code> 在 ℚ 仍<strong>無解</strong>、<code>x² + 1</code> 在 ℝ 無解。
          缺的不是除法，是「對這個多項式的<strong>封閉性</strong>」。下一步不是加更多數，而是造一個
          <em>剛好裝下缺席根</em>的最小世界——這正是 field extension。
        </p>
      </section>

      <details>
        <summary>符號層：characteristic 是 0 或質數</summary>
        <p>
          <strong>characteristic</strong> 是使 <code>n · 1 = 0</code> 的最小正整數 <code>n</code>（沒有就是 0）。它只會是 0 或質數：若
          <code>n = a · b</code> 為合數，則 <code>(a·1)(b·1) = 0</code> 會造出兩個非零卻相乘為 0 的元素（zero divisor），與 field 矛盾。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh1CharAndFpComponent {
  readonly residues = [0, 1, 2, 3, 4];
  readonly qStrip = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  readonly count = signal(0);
  readonly prediction = signal<'never' | 'five' | 'six' | null>(null);

  readonly position = computed(() => this.count() % N);
  readonly shownCount = computed(() => Math.min(this.count(), this.qStrip.length - 1));
  readonly wrapped = computed(() => this.count() > 0 && this.count() % N === 0);
  readonly ringAria = computed(
    () => `F5 的加一環，加 ${this.count()} 次後落在 ${this.position()}`,
  );

  add(): void {
    this.count.set(this.count() + 1);
  }
  reset(): void {
    this.count.set(0);
  }
  nodeTransform(value: number): string {
    const angle = (value / N) * Math.PI * 2 - Math.PI / 2;
    const x = 110 + 78 * Math.cos(angle);
    const y = 110 + 78 * Math.sin(angle);
    return `translate(${x} ${y})`;
  }
}
