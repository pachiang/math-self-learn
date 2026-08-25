import { Component, computed, signal } from '@angular/core';
import {
  FieldWorld,
  WORLD_Q,
  WORLD_Z,
  WORLD_Z4,
  WORLD_Z5,
  WORLD_Z6,
  blockedElems,
  isField,
} from './fields-ch1-model';

@Component({
  selector: 'app-fields-ch1-field-definition',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 1.2</p>
        <h2>Field 的定義，就是「非零元全是 unit」</h2>
        <p class="lede">
          1.1 看到「有沒有夥伴」由世界決定。現在替它命名：一個 commutative ring（且 <code>1 ≠ 0</code>）若
          <strong>每個非零元都有夥伴</strong>，就是一個 <strong>field（體）</strong>。判準只有一句——
          有沒有「非零卻沒有夥伴」的元素。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>ℤ/5 與 ℤ/6 長得都像時鐘。哪個是 field？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'z5'" (click)="prediction.set('z5')">ℤ/5</button>
          <button type="button" [class.active]="prediction() === 'z6'" (click)="prediction.set('z6')">ℤ/6</button>
          <button type="button" [class.active]="prediction() === 'both'" (click)="prediction.set('both')">兩個都是</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'z5'">
            {{ prediction() === 'z5'
              ? '對。外觀相同不代表結論相同——關鍵在 ℤ/6 裡 2、3、4 找不到夥伴。切到下面兩個世界比對。'
              : '外觀一樣會誤導。ℤ/5 每個非零元都有夥伴，ℤ/6 的 2、3、4 沒有——只有 ℤ/5 是 field。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選擇世界">
        <span class="kicker">WORLD</span>
        @for (w of worlds; track w.id) {
          <button type="button" [class.active]="world().id === w.id" (click)="world.set(w)">{{ w.label }}</button>
        }
      </div>

      <section class="stage detector-grid">
        <div class="detector-board">
          <p class="board-scope" [class.is-field]="field()">
            {{ world().label }} · {{ field() ? 'FIELD' : 'RING（非 field）' }}
          </p>
          <div class="chip-grid" role="list" [attr.aria-label]="world().label + ' 的元素狀態'">
            <div class="fchip zero" role="listitem"><span class="fchip-v">0</span><span class="fchip-tag">零元</span></div>
            @for (e of world().elems; track e.label) {
              <div
                class="fchip"
                role="listitem"
                [class.unit]="e.inverseLabel !== null"
                [class.blocked]="e.inverseLabel === null"
              >
                <span class="fchip-v">{{ e.label }}</span>
                @if (e.inverseLabel !== null) {
                  <span class="fchip-tag">夥伴 {{ e.inverseLabel }}</span>
                } @else {
                  <span class="fchip-tag">{{ e.note === 'zero divisor' ? 'zero divisor' : '無夥伴' }}</span>
                }
              </div>
            }
          </div>
          <div class="legend">
            <span><i class="sw unit"></i>unit（有夥伴）</span>
            <span><i class="sw blocked"></i>非零卻無夥伴</span>
            <span><i class="sw zero"></i>零元（不要求可逆）</span>
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">Field 判準</p>
          <h3>非零非-unit：{{ blocked().length }} 個</h3>
          @if (field()) {
            <p>沒有卡住的非零元 → <strong>{{ world().label }} 是 field</strong>。</p>
            <div class="readout">除法對每個非零元都安全。</div>
          } @else {
            <p>存在非零卻不能除的元素 → {{ world().label }} 只是 ring。</p>
            <div class="readout warn-readout">卡住的元素：{{ blocked().join('、') }}</div>
          }
          @if (world().modulus) {
            <p class="evidence-tag">
              判準（一般）：ℤ/n 是 field ⇔ n 是質數。此處 n = {{ world().modulus }}，{{ isPrimeModulus() ? '質數 → field' : '非質數 → 非 field' }}。
            </p>
          }
          @if (world().id === 'Z4') {
            <p class="evidence-tag">ℤ/4 的 2：2 · 2 = 0——它是 zero divisor，結構性地擋住除法，不是「剛好沒找到」。</p>
          }
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">∎</span>
        <div>
          <strong>Field 與「只是 ring」的界線</strong>
          <span>——就在有沒有非零卻不能除的元素。ℤ/5 有零個，ℤ/6 有三個。</span>
        </div>
      </section>

      <details>
        <summary>符號層：ℤ/n 何時是 field</summary>
        <p>
          在 ℤ/n 中，<code>a</code> 可逆 ⇔ <code>gcd(a, n) = 1</code>。因此「每個非零元都可逆」⇔ <code>n</code> 是質數。
          此時 <code>F&#215; = F ∖ &#123;0&#125;</code>：整個非零集合在乘法下成為一個 group。ℤ/4 的 2 與 6 的 2、3、4 之所以卡住，
          正是因為它們與 modulus 有共同因數，會變成 zero divisor。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh1FieldDefinitionComponent {
  readonly worlds: FieldWorld[] = [WORLD_Z5, WORLD_Z6, WORLD_Z4, WORLD_Q, WORLD_Z];
  readonly world = signal<FieldWorld>(WORLD_Z5);
  readonly prediction = signal<'z5' | 'z6' | 'both' | null>(null);

  readonly field = computed(() => isField(this.world()));
  readonly blocked = computed(() => blockedElems(this.world()));
  readonly isPrimeModulus = computed(() => {
    const n = this.world().modulus;
    if (!n) return false;
    if (n < 2) return false;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) return false;
    }
    return true;
  });
}
