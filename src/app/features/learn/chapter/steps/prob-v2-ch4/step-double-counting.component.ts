import { Component, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-double-counting',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch4">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 4.2</p>
        <h2>「A 或 B」不能總是直接把兩邊相加</h2>
        <p class="lede">
          加法沒有失效；真正的問題是 overlap 裡的同一份 probability mass
          被算了兩次。看見重複，修正方式就不必死背。
        </p>
      </header>

      <section class="scene">
        <div class="prediction-board">
          <div>
            <p class="eyebrow">公平抽出 1–12 中的一個數字</p>
            <h3>A = 偶數；B = 大於 6。P(A 或 B) 是多少？</h3>
            <p class="lede">A 有六格，B 也有六格。先別急著回答 6/12 + 6/12。</p>
          </div>
          <div class="choice-row" role="group" aria-label="預測 A 或 B 的機率">
            @for (choice of choices; track choice) {
              <button
                type="button"
                [class.selected]="prediction() === choice"
                (click)="prediction.set(choice)"
              >
                {{ choice }}
              </button>
            }
          </div>
        </div>
        @if (prediction()) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === '3 / 4') {
              <strong>對，union 有 9 個 outcomes，所以是 9/12 = 3/4。</strong>
              關鍵是找出兩張清單裡重複出現的 8、10、12。
            } @else {
              先保留你的答案，往下檢查「A 清單 + B 清單」裡是否有同一張票出現兩次。
            }
          </p>
        }
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Counting receipt</p>
            <h3>先把 A 與 B 的重量各自收進來</h3>
          </div>
          <p>
            紅框標記的 outcomes 已經在 A 清單付款一次，又在 B 清單付款一次； 但 union 裡每個 outcome
            只該出現一次。
          </p>
        </div>
        <div class="receipt">
          <div class="receipt-column">
            <span>A · 偶數 · 6 份 weight</span>
            <div class="receipt-items">
              @for (outcome of eventA; track outcome) {
                <div class="receipt-item" [class.duplicate]="isOverlap(outcome)">
                  {{ outcome }}
                  @if (isOverlap(outcome)) {
                    <small>copy 1</small>
                  }
                </div>
              }
            </div>
          </div>
          <div class="receipt-plus">+</div>
          <div class="receipt-column">
            <span>B · 大於 6 · 6 份 weight</span>
            <div class="receipt-items">
              @for (outcome of eventB; track outcome) {
                <div class="receipt-item" [class.duplicate]="isOverlap(outcome)">
                  {{ outcome }}
                  @if (isOverlap(outcome)) {
                    <small>copy 2</small>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <section class="counting-summary">
        <div>
          <span>A 的重量</span>
          <strong>6 / 12</strong>
        </div>
        <i>+</i>
        <div>
          <span>B 的重量</span>
          <strong>6 / 12</strong>
        </div>
        <i>−</i>
        <div class="subtract">
          <span>重複付款的 overlap</span>
          <strong>3 / 12</strong>
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Deduplicated union</p>
            <h3>每個 outcome 最後只保留一份重量</h3>
          </div>
          <p>A ∪ B = {{ '{2, 4, 6, 7, 8, 9, 10, 11, 12}' }}，共 9 份 1/12。</p>
        </div>
        <div class="union-strip" aria-label="A union B 的九個 outcomes">
          @for (outcome of union; track outcome) {
            <div>{{ outcome }}</div>
          }
        </div>
      </section>

      <aside class="insight-card">
        <div class="logic-translation" aria-hidden="true">
          <div>
            <span>先相加</span>
            <strong>overlap 出現兩份</strong>
          </div>
          <i>→ 扣回一次 →</i>
          <div>
            <span>Union</span>
            <strong>每份 mass 只留一次</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Double counting 才是要修的錯</span>
          <p>
            <strong>把 A 與 B 相加時，intersection 被收了兩次；扣回一次，才是 union。</strong>
            若兩事件完全不重疊，扣回的重量自然就是 0。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：general addition rule</summary>
        <div>
          <div class="math-line">
            <app-math e="P(A\\cup B)=P(A)+P(B)-P(A\\cap B)" />
          </div>
          <p>
            若 A、B mutually exclusive，<app-math e="A\\cap B=\\varnothing" />， 所以公式簡化成
            <app-math e="P(A\\cup B)=P(A)+P(B)" />。 這是一般規則的特例，不是另一套互不相關的公式。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2DoubleCountingComponent {
  readonly choices = ['1', '3 / 4', '1 / 2'];
  readonly prediction = signal<string | null>(null);
  readonly eventA = [2, 4, 6, 8, 10, 12];
  readonly eventB = [7, 8, 9, 10, 11, 12];
  readonly union = [2, 4, 6, 7, 8, 9, 10, 11, 12];

  isOverlap(outcome: number): boolean {
    return this.eventA.includes(outcome) && this.eventB.includes(outcome);
  }
}
