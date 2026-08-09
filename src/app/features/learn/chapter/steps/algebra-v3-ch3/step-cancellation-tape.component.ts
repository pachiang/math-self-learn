import { Component, signal } from '@angular/core';

type Side = 'left' | 'right' | null;

@Component({
  selector: 'app-algebra-v3-cancellation-tape',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch3-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 3.3</p>
        <h2>Cancellation 是兩邊走同一條 return route</h2>
        <p class="lede">
          從 a·x=a·y 得到 x=y，不是把字母 a 擦掉。真正的操作是：對等式兩側做同一件合法的事，並讓 a⁻¹ 從正確的一側靠近共同 action a。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先決定 undo 從哪裡進場</p>
        <h3>已知 a·x=a·y。把 a⁻¹ 接在兩邊的右側，一定能消去左邊的 a 嗎？</h3>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不能保證</button><button type="button" (click)="prediction.set(true)">可以</button></div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{ prediction() ? '右接後是 a·x·a⁻¹；x 隔在 a 與 a⁻¹ 中間。除非另有交換性，兩者不能靠近。' : '對。共同 a 是 prefix，return route 必須從左側進場。' }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div><p class="kicker">Cancellation tape</p><h3>把同一個 a⁻¹ 接到兩條 paths</h3></div>
          <p>起始等式已知成立。你只選 undo 的作用側；兩條 tapes 永遠同步改變，因為等式兩側必須做同一個 operation。</p>
        </div>

        <div class="side-picker" role="group" aria-label="選擇 inverse 接入的側">
          <button type="button" [attr.aria-pressed]="side() === 'left'" (click)="chooseSide('left')">從左側接 a⁻¹</button>
          <button type="button" [attr.aria-pressed]="side() === 'right'" (click)="chooseSide('right')">從右側接 a⁻¹</button>
        </div>

        <div class="stage equation-board" aria-live="polite">
          <section class="equation-path">
            <h4>LEFT PATH</h4>
            <div class="symbol-tape">
              @for (token of tokens('x'); track $index) {
                @if ($index > 0) { <i>·</i> }
                <b [class.inverse-pair]="isInversePairIndex($index)">{{ token }}</b>
              }
            </div>
            <p class="tape-note">{{ tapeNote('x') }}</p>
          </section>
          <section class="equation-path">
            <h4>RIGHT PATH</h4>
            <div class="symbol-tape">
              @for (token of tokens('y'); track $index) {
                @if ($index > 0) { <i>·</i> }
                <b [class.inverse-pair]="isInversePairIndex($index)">{{ token }}</b>
              }
            </div>
            <p class="tape-note">{{ tapeNote('y') }}</p>
          </section>
        </div>

        <div class="control-row">
          <button type="button" class="primary" (click)="runReduction()" [disabled]="side() === null || reduced()">執行可見的折返</button>
          <button type="button" (click)="reset()" [disabled]="side() === null">重設</button>
        </div>

        @if (side() !== null) {
          <div class="readout" aria-live="polite">
            @if (!reduced()) {
              {{ side() === 'left' ? 'a⁻¹ 與共同 prefix a 已相鄰；可以開始折返。' : 'a⁻¹ 被 x、y 隔開；目前沒有 inverse pair 可折返。' }}
            } @else if (side() === 'left') {
              <div class="reduction-step"><span>a⁻¹·a·x = a⁻¹·a·y</span><i>→</i><span>e·x = e·y</span><i>→</i><strong>x = y</strong></div>
            } @else {
              <div class="reduction-step"><span>a·x·a⁻¹ = a·y·a⁻¹</span><i>→</i><strong>沒有可相鄰折返的 pair；推理停在這裡</strong></div>
            }
          </div>
        }

        <div class="proof-debt">
          <strong>Proof debt 留給第 4 章：</strong>把 a⁻¹·(a·x) 改寫成 (a⁻¹·a)·x，需要 associativity。這裡先看清楚 action path；下一章才正式授權移動括號。
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>same prefix</span><i>+</i><span>same undo</span><i>⇒</i><span>source equality</span></div>
        <p>
          <strong>Cancellation 的力量來自可逆性與作用側。</strong>
          inverse 不能穿過未知的 x、y，也不需要假設 commutativity；它只需要從共同 action 所在的那一側原路返回。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">矩陣世界</p>
        <h3>若可逆矩陣 A 滿足 AX=AY，應在兩側左乘 A⁻¹，還是右乘 A⁻¹？</h3>
        <div class="choice-row"><button type="button" (click)="transfer.set('left')">左乘</button><button type="button" (click)="transfer.set('right')">右乘</button></div>
        @if (transfer(); as answer) {
          <p class="feedback" [class.warning]="answer !== 'left'">{{ answer === 'left' ? '對。A⁻¹(AX) 讓 A⁻¹ 與 A 相鄰；matrix multiplication 不需交換順序。' : '(AX)A⁻¹ 中間隔著 X，通常不能化成 X。' }}</p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details><summary>正式命題：left 與 right cancellation</summary><div>在 group 中，ax=ay 可推出 x=y；xa=ya 也可推出 x=y。前者在左側接 a⁻¹，後者在右側接 a⁻¹。這兩個命題都不要求 group 是 abelian。</div></details>
        <details><summary>為什麼「兩邊做同一件事」仍保留 equality？</summary><div>若兩個 states 相同，把同一個 function 套到兩者上，outputs 必然相同。cancellation 額外使用 inverse，讓這個共同 function 能回溯原來源。</div></details>
      </section>
    </article>
  `,
})
export class AlgebraV3CancellationTapeComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<'left' | 'right' | null>(null);
  readonly side = signal<Side>(null);
  readonly reduced = signal(false);
  chooseSide(side: Exclude<Side, null>): void { this.side.set(side); this.reduced.set(false); }
  runReduction(): void { if (this.side() !== null) this.reduced.set(true); }
  reset(): void { this.side.set(null); this.reduced.set(false); }
  tokens(variable: 'x' | 'y'): string[] {
    if (this.side() === null) return ['a', variable];
    if (this.side() === 'left') return ['a⁻¹', 'a', variable];
    return ['a', variable, 'a⁻¹'];
  }
  isInversePairIndex(index: number): boolean { return this.side() === 'left' && (index === 0 || index === 1); }
  tapeNote(variable: 'x' | 'y'): string {
    if (this.side() === null) return `共同 prefix a 之後，接著未知 action ${variable}。`;
    if (this.side() === 'left') return `a⁻¹ 緊鄰 a；return route 不必穿過 ${variable}。`;
    return `a⁻¹ 與 a 中間隔著 ${variable}；不能把 ${variable} 擅自交換出去。`;
  }
}
