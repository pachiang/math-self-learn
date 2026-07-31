import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-mutually-exclusive',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch4">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 4.4</p>
        <h2>Mutually exclusive，只問兩個 events 能不能一起發生</h2>
        <p class="lede">
          <strong>互斥（mutually exclusive）</strong>是一個幾何問題： 兩個 event 有沒有共同
          outcomes？把 B 左右移動，看 overlap 出現與消失。
        </p>
      </header>

      <section class="window-board">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">A 固定；B 是可移動的三格窗口</p>
            <h3>A = {{ '{3, 4, 5, 6, 7}' }}；B = {{ eventBLabel() }}</h3>
          </div>
          <div class="set-legend" aria-label="事件顏色圖例">
            <span><i></i>A</span>
            <span><i class="b"></i>B</span>
            <span><i class="both"></i>overlap</span>
          </div>
        </div>

        <div class="window-track" aria-label="A 和 B 在 1 到 12 的 outcomes 上的位置">
          @for (outcome of outcomes; track outcome) {
            <div class="window-cell" [class.in-a]="inA(outcome)" [class.in-b]="inB(outcome)">
              {{ outcome }}
              @if (inA(outcome) && inB(outcome)) {
                <small>A ∩ B</small>
              } @else if (inA(outcome)) {
                <small>A</small>
              } @else if (inB(outcome)) {
                <small>B</small>
              }
            </div>
          }
        </div>

        <div class="window-control">
          <label for="b-window">移動 event B</label>
          <input
            id="b-window"
            type="range"
            min="1"
            max="10"
            step="1"
            [value]="bStart()"
            (input)="bStart.set(+$any($event).target.value)"
          />
          <strong>start = {{ bStart() }}</strong>
        </div>
      </section>

      <section class="exclusivity-result">
        <div
          class="status-panel"
          [class.exclusive]="isExclusive()"
          [class.overlapping]="!isExclusive()"
          aria-live="polite"
        >
          <span>INTERSECTION · {{ intersectionLabel() }}</span>
          <strong>
            {{ isExclusive() ? '✓ Mutually exclusive' : '× 可以同時發生' }}
          </strong>
          <p>
            @if (isExclusive()) {
              A 與 B 沒有共同 outcome；一次抽取不可能同時落入兩個 events。
            } @else {
              抽到 {{ intersectionLabel() }} 時 A、B 會一起發生，因此它們不互斥。
            }
          </p>
        </div>

        <div class="concept-split">
          <div>
            <span>Mutually exclusive</span>
            <strong>能不能一起發生？</strong>
            <p>只查看 A 與 B 是否有 overlap。這一章已經能直接從 event geometry 判斷。</p>
          </div>
          <div>
            <span>Independent · 後續章節</span>
            <strong>知道一件事後，重量會不會改變？</strong>
            <p>這是資訊與 probability 的問題，不是看兩個圈是否分開。</p>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="logic-translation" aria-hidden="true">
          <div>
            <span>Mutually exclusive</span>
            <strong>沒有共同 outcomes</strong>
          </div>
          <i>≠</i>
          <div>
            <span>Independent</span>
            <strong>資訊不改變比例</strong>
          </div>
        </div>
        <div>
          <span class="card-label">先把兩個常混淆的問題分家</span>
          <p>
            <strong>互斥問「能不能一起發生」；independence 問「會不會互相影響重量」。</strong>
            本章只正式建立前者；independence 會在 conditional probability 之後完整處理。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：空交集、加法特例，以及為什麼互斥不等於獨立</summary>
        <div>
          <p>A、B mutually exclusive 的正式條件是：</p>
          <div class="math-line">
            <app-math e="A\\cap B=\\varnothing" />
          </div>
          <p>
            交集重量為 0，所以 general addition rule 簡化為
            <app-math e="P(A\\cup B)=P(A)+P(B)" />。
          </p>
          <p>
            如果 A、B 本身都有正 probability，知道 A 發生會讓 B 立刻變成不可能；資訊顯然改變了 B
            的重量。因此這類互斥事件不會 independent。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2MutuallyExclusiveComponent {
  readonly outcomes = Array.from({ length: 12 }, (_, index) => index + 1);
  readonly eventA = [3, 4, 5, 6, 7];
  readonly bStart = signal(8);
  readonly eventB = computed(() => [this.bStart(), this.bStart() + 1, this.bStart() + 2]);
  readonly intersection = computed(() =>
    this.eventA.filter((outcome) => this.eventB().includes(outcome)),
  );
  readonly isExclusive = computed(() => this.intersection().length === 0);
  readonly eventBLabel = computed(() => `{${this.eventB().join(', ')}}`);
  readonly intersectionLabel = computed(() =>
    this.intersection().length ? `{${this.intersection().join(', ')}}` : '∅',
  );

  inA(outcome: number): boolean {
    return this.eventA.includes(outcome);
  }

  inB(outcome: number): boolean {
    return this.eventB().includes(outcome);
  }
}
