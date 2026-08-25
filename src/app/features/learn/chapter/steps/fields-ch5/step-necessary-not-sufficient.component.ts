import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-fields-ch5-necessary-not-sufficient',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 5.4</p>
        <h2>綠燈的陷阱：2 的冪是必要非充分</h2>
        <p class="lede">
          「次數是 2 的冪」這盞綠燈只能<strong>單向</strong>使用：它能<strong>反駁</strong>可作圖，卻不能<strong>證明</strong>可作圖。
          <code>constructible ⇒ 2ᵐ</code> 成立；反過來 <code>2ᵐ ⇒ constructible</code> <strong>不成立</strong>。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>一個數在 ℚ 上次數是 4 = 2²，它一定作得出來嗎？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'yes'" (click)="prediction.set('yes')">一定作得出來</button>
          <button type="button" [class.active]="prediction() === 'no'" (click)="prediction.set('no')">不一定</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'yes'">
            {{ prediction() === 'no'
              ? '對。次數是 2 的冪只是必要條件；有次數 4 卻不可作圖的數。看右下那張反例卡。'
              : '不一定：次數 4=2² 只是必要條件。x⁴−x−1 的根次數 4，卻不可作圖。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="想怎麼用這盞綠燈">
        <span class="kicker">我想用「次數是 2 的冪」來…</span>
        <button type="button" [class.active]="use() === 'refute'" (click)="use.set('refute')">反駁「可作圖」</button>
        <button type="button" [class.active]="use() === 'prove'" (click)="use.set('prove')">證明「可作圖」</button>
      </div>

      <section class="stage nns-grid">
        <div class="dir-card valid" [class.dim]="use() === 'prove'">
          <p class="dir-tag ok">有效方向</p>
          <h3>次數<strong>不是</strong> 2 的冪 ⇒ 不可作圖</h3>
          <p>這是 <code>constructible ⇒ 2ᵐ</code> 的逆否，成立。</p>
          <div class="dir-example ok">
            例：∛2 次數 3，3 不是 2 的冪 → <strong>反駁成功，不可作圖</strong>。（這正是 5.3 用的）
          </div>
          <span class="dir-mode">WITNESS · 有效反駁</span>
        </div>

        <div class="dir-card invalid" [class.dim]="use() === 'refute'">
          <p class="dir-tag no">無效方向</p>
          <h3>次數<strong>是</strong> 2 的冪 ⇏ 可作圖</h3>
          <p>反過來不成立——綠燈亮，不代表作得出來。</p>
          <div class="dir-example no">
            反例：<code>x⁴ − x − 1</code> 的根，次數 <strong>4 = 2²</strong>，卻<strong>不可作圖</strong>。（完整理由：它的對稱不是「二次塔」，留待對稱章）
          </div>
          <span class="dir-mode">NECESSARY CONDITION ONLY · 非 proof</span>
        </div>
      </section>

      <section class="verdict-banner" [class.good]="use() === 'refute'" [class.bad]="use() === 'prove'">
        {{ use() === 'refute'
          ? '✓ 這樣用有效：用「次數不是 2 的冪」反駁可作圖。'
          : '✗ 這樣用無效：綠燈亮≠可作圖；有 deg-4 的反例。' }}
      </section>

      <section class="insight">
        <span class="insight-icon">⇒?</span>
        <div>
          <strong>「次數是 2 的冪」能反駁可作圖，但不能證明可作圖</strong>
          <span>——implication 只有一個方向成立。綠燈是必要條件，不是充分條件。</span>
        </div>
      </section>

      <details>
        <summary>符號層：完整的充分條件</summary>
        <p>
          真正的充分刻畫是：<code>x</code> 可作圖 ⇔ 存在一串<strong>二次</strong>擴張的塔含住 <code>x</code>。「<code>[ℚ(x):ℚ] = 2ᵐ</code>」只是它的必要影子；
          有次數 4 的數，其 splitting field 的對稱不是 2-group，因此排不出全是二次的塔（<code>x⁴−x−1</code> 即是），故不可作圖。這個「對稱」的判準要到後面的 Galois 章才完整。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh5NecessaryNotSufficientComponent {
  readonly prediction = signal<'yes' | 'no' | null>(null);
  readonly use = signal<'refute' | 'prove'>('refute');
}
