import { Component, computed, signal } from '@angular/core';
import {
  FUNCTION_INPUTS,
  RingOperation,
  clampFunctionValue,
  combineFunctions,
} from './rings-ch1-model';

@Component({
  selector: 'app-rings-ch1-function-elements',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 1.3</p>
        <h2>一整張 function card，才是一個 ring element</h2>
        <p class="lede">Elements 不必是單一數字。這個 world 裡，每個 object 都是一個從 A、B、C 指向 integers 的完整 function；兩種 operations 都逐點合成整張 card。</p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>f + g 得到的一個 element，是某個高度，還是整張新 function？</h3>
        </div>
        <div class="choice-row">
          <button type="button" (click)="prediction.set('value')">某一個高度</button>
          <button type="button" (click)="prediction.set('function')">整張 function</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'value'">
            {{ prediction() === 'function'
              ? '對。每條 lane 是這個 element 的一個 value；三條 lanes 合起來才是完整 object。'
              : '單一高度只是 function 在一個 input 上的 value，還不是這個 world 裡的完整 element。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="Function operation controls">
        <span class="kicker">OPERATION</span>
        <button type="button" [class.active]="operation() === 'add'" (click)="operation.set('add')">＋ POINTWISE ADD</button>
        <button type="button" class="multiply" [class.active]="operation() === 'multiply'" (click)="operation.set('multiply')">× POINTWISE MULTIPLY</button>
        <span class="kicker">FOCUS LANE</span>
        @for (input of inputs; track input; let index = $index) {
          <button type="button" [class.active]="activeLane() === index" (click)="activeLane.set(index)">{{ input }}</button>
        }
        <button type="button" (click)="reset()">重設</button>
      </div>

      <section class="stage stage-grid">
        <div class="function-board" role="group" aria-label="兩張 function cards 逐點合成一張 output function card">
          <section class="function-card">
            <h4>element f</h4>
            @for (input of inputs; track input; let index = $index) {
              <div class="lane" [class.active]="activeLane() === index">
                <button type="button" [attr.aria-label]="'減少 f(' + input + ')'" (click)="adjust('f', index, -1)">−</button>
                <span class="value">{{ input }} ↦ {{ f()[index] }}</span>
                <button type="button" [attr.aria-label]="'增加 f(' + input + ')'" (click)="adjust('f', index, 1)">＋</button>
              </div>
            }
          </section>

          <span class="operation-port" [class.multiply]="operation() === 'multiply'" aria-hidden="true">{{ operation() === 'add' ? '+' : '×' }}</span>

          <section class="function-card">
            <h4>element g</h4>
            @for (input of inputs; track input; let index = $index) {
              <div class="lane" [class.active]="activeLane() === index">
                <button type="button" [attr.aria-label]="'減少 g(' + input + ')'" (click)="adjust('g', index, -1)">−</button>
                <span class="value">{{ input }} ↦ {{ g()[index] }}</span>
                <button type="button" [attr.aria-label]="'增加 g(' + input + ')'" (click)="adjust('g', index, 1)">＋</button>
              </div>
            }
          </section>

          <span class="operation-port" [class.multiply]="operation() === 'multiply'" aria-hidden="true">→</span>

          <section class="function-card output" aria-live="polite">
            <h4>element h</h4>
            @for (input of inputs; track input; let index = $index) {
              <div class="lane" [class.active]="activeLane() === index">
                <span aria-hidden="true">{{ input }}</span>
                <span class="value">↦ {{ output()[index] }}</span>
                <span aria-hidden="true">✓</span>
              </div>
            }
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">ACTIVE LANE · {{ inputs[activeLane()] }}</p>
          <h3>{{ laneEquation() }}</h3>
          <p>只修改這條 lane 時，其他 inputs 的 values 不變；但 output element 仍是右側整張 h card。</p>
          <div class="readout">f、g、h 都是 &#123;A, B, C&#125; → ℤ 的完整 functions</div>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">ƒ</span>
        <div>
          <strong>Ring 描述 operations 的結構，不限定 elements 的外觀</strong>
          <span>一個 value 是 function 的局部讀數；整張 function 才是這裡的一個 element。</span>
        </div>
      </section>

      <details>
        <summary>符號層：pointwise operations</summary>
        <p>對每個 input x，定義 <code>(f + g)(x) = f(x) + g(x)</code> 與 <code>(fg)(x) = f(x)g(x)</code>。這裡不使用 function composition；完整 ring laws 到 Ch3 再檢查。</p>
      </details>
    </article>
  `,
})
export class RingsCh1FunctionElementsComponent {
  readonly inputs = FUNCTION_INPUTS;
  readonly operation = signal<RingOperation>('add');
  readonly activeLane = signal(1);
  readonly prediction = signal<'value' | 'function' | null>(null);
  readonly f = signal<number[]>([1, -2, 2]);
  readonly g = signal<number[]>([2, 1, -1]);
  readonly output = computed(() => combineFunctions(this.f(), this.g(), this.operation()));
  readonly laneEquation = computed(() => {
    const index = this.activeLane();
    const symbol = this.operation() === 'add' ? '+' : '×';
    return `h(${this.inputs[index]}) = ${this.f()[index]} ${symbol} ${this.g()[index]} = ${this.output()[index]}`;
  });

  adjust(card: 'f' | 'g', index: number, delta: number): void {
    const source = card === 'f' ? this.f : this.g;
    source.update(values => values.map((value, current) =>
      current === index ? clampFunctionValue(value + delta) : value,
    ));
    this.activeLane.set(index);
  }

  reset(): void {
    this.f.set([1, -2, 2]);
    this.g.set([2, 1, -1]);
    this.operation.set('add');
    this.activeLane.set(1);
    this.prediction.set(null);
  }
}
