import { Component, computed, signal } from '@angular/core';
import { mod, modInverse } from './fields-ch1-model';

const FIELD_N = 5;

@Component({
  selector: 'app-fields-ch1-two-ideals',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 1.3</p>
        <h2>從 ideal 看 field：中間地帶塌掉了</h2>
        <p class="lede">
          回到環課的語言。把一個非零元放進候選 ideal，ambient 乘法會把它的倍數一起拉進來。在 field 裡，
          可逆性會讓這個 ideal <strong>一路撐滿整個世界</strong>——停不下來。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>在 field ℤ/5 裡，能不能造出一個「不是 &#123;0&#125;、也不是整個世界」的中間 ideal？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'yes'" (click)="prediction.set('yes')">可以</button>
          <button type="button" [class.active]="prediction() === 'no'" (click)="prediction.set('no')">不行，會塌成全部</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'yes'">
            {{ prediction() === 'no'
              ? '對。下面選一個非零元，一步步看它如何把整個 ℤ/5 吸進來。'
              : '試試看：任何非零元都可逆，1 一旦進來就把所有元素拉進來——中間 ideal 撐不住。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選擇 ℤ/5 的非零元">
        <span class="kicker">FIELD ℤ/5 · 放入非零元</span>
        @for (v of nonzero; track v) {
          <button type="button" [class.active]="seed() === v" (click)="seed.set(v); step.set(0)">{{ v }}</button>
        }
        <button type="button" (click)="next()" [disabled]="step() >= 2">下一步吸收 →</button>
        <button type="button" (click)="step.set(0)">重設</button>
      </div>

      <section class="stage ideal-grid">
        <div class="ideal-panel field-panel">
          <p class="board-scope is-field">FIELD ℤ/5 · 只有 &#123;0&#125; 與整個世界兩個 ideal</p>
          <div class="slot-row" role="list" aria-label="ℤ/5 元素被吸收狀態">
            @for (v of residues; track v) {
              <div class="slot" role="listitem" [class.in]="fieldSet().includes(v)" [class.seed]="v === seed() && step() === 0">
                <span>{{ v }}</span>
              </div>
            }
          </div>
          <ol class="absorb-steps">
            <li [class.on]="step() >= 0">放入非零元 {{ seed() }}</li>
            <li [class.on]="step() >= 1">{{ seed() }} 可逆（夥伴 {{ inv() }}）：{{ seed() }} · {{ inv() }} = 1 被吸進來</li>
            <li [class.on]="step() >= 2">1 把每個元素都吸進來 → ideal 撐滿整個 ℤ/5</li>
          </ol>
          @if (step() >= 2) {
            <p class="equation">GENERAL ARGUMENT：非零元在 ideal 且可逆 ⇒ 1 ∈ ideal ⇒ ideal = 整個 ring。</p>
          }
        </div>

        <div class="ideal-panel ring-panel">
          <p class="board-scope">RING ℤ · 可以停在中間</p>
          <div class="int-line" role="list" aria-label="ℤ 視窗，(2) 生成的偶數 ideal">
            @for (v of intWindow; track v) {
              <div class="slot int" role="listitem" [class.in]="v % 2 === 0" [class.origin]="v === 0">
                <span>{{ v }}</span>
              </div>
            }
          </div>
          <p class="equation muted">
            把 2 放進 ideal 只長出偶數 <code>(2)</code>，停得下來——因為 2 在 ℤ 裡<strong>不可逆</strong>，拉不出 1。
            這是一個 proper、nontrivial 的 ideal。
          </p>
        </div>
      </section>

      <section class="insight">
        <span class="insight-icon">▣</span>
        <div>
          <strong>Field ＝ 沒有中間 ideal 的 ring</strong>
          <span>——非零元一旦進 ideal，可逆性就把整個世界拖進來，只剩 &#123;0&#125; 與 R 兩個 ideal。</span>
        </div>
      </section>

      <details>
        <summary>接回環課、預告本課</summary>
        <p>
          這正是環課「<code>R/M</code> 是 field ⇔ <code>M</code> 是 maximal ideal」回頭看得懂的原因：field 沒有中間 ideal，所以
          它的 preimage 是「最大的」proper ideal。本課 Ch3 會反過來用它：因為 <code>m(x)</code> irreducible 使
          <code>(m(x))</code> 成為 maximal，<code>K[x]/(m(x))</code> 才是一個 field。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh1TwoIdealsComponent {
  readonly residues = [0, 1, 2, 3, 4];
  readonly nonzero = [1, 2, 3, 4];
  readonly intWindow = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  readonly seed = signal(2);
  readonly step = signal(0);
  readonly prediction = signal<'yes' | 'no' | null>(null);

  readonly inv = computed(() => modInverse(this.seed(), FIELD_N) ?? 1);
  readonly fieldSet = computed<number[]>(() => {
    const a = this.seed();
    if (this.step() <= 0) return [a];
    if (this.step() === 1) return [a, mod(a * this.inv(), FIELD_N)];
    return this.residues;
  });

  next(): void {
    this.step.set(Math.min(2, this.step() + 1));
  }
}
