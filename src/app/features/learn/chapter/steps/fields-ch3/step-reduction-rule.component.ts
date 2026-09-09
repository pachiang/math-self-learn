import { Component, computed, signal } from '@angular/core';
import { Coeffs, formatPolyHigh, reduceTrace, relationString } from './fields-ch3-model';

interface RedWorld {
  id: string;
  rootNote: string;
  m: Coeffs;
  inputs: { label: string; coeffs: Coeffs }[];
}

const WORLDS: RedWorld[] = [
  {
    id: 'sqrt2',
    rootNote: 'α = √2',
    m: [-2, 0, 1], // x² − 2
    inputs: [
      { label: 'α³', coeffs: [0, 0, 0, 1] },
      { label: 'α³ + α² − 1', coeffs: [-1, 0, 1, 1] },
      { label: 'α⁴ − α', coeffs: [0, -1, 0, 0, 1] },
    ],
  },
  {
    id: 'cbrt2',
    rootNote: 'α = ∛2',
    m: [-2, 0, 0, 1], // x³ − 2
    inputs: [
      { label: 'α³', coeffs: [0, 0, 0, 1] },
      { label: 'α⁴', coeffs: [0, 0, 0, 0, 1] },
      { label: 'α⁵ + α³', coeffs: [0, 0, 0, 1, 0, 1] },
    ],
  },
  {
    id: 'mixed',
    rootNote: 'α³ − α − 1 = 0',
    m: [-1, -1, 0, 1], // x³ − x − 1
    inputs: [
      { label: 'α³', coeffs: [0, 0, 0, 1] },
      { label: 'α⁴', coeffs: [0, 0, 0, 0, 1] },
      { label: 'α⁵ + α³', coeffs: [0, 0, 0, 1, 0, 1] },
    ],
  },
];

@Component({
  selector: 'app-fields-ch3-reduction-rule',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 3.1</p>
        <h2>高次冪不是繞回，而是重新分配到低次 directions</h2>
        <p class="lede">
          上一章的 <code>α²=2</code>、<code>α³=2</code> 都剛好落回單一方向，但那是 radical examples 的偶然外觀。
          一般 relation 可能像 <code>α³=α+1</code>，同時流入多個低次 directions。共同機制是<strong>反覆 reduce 到固定的低次 register</strong>，不是週期旋轉。
        </p>
      </header>

      <span class="map-convention">REDUCTION REGISTER · NOT A CYCLE · DEFAULT α³ = α + 1</span>

      <section class="prediction">
        <div>
          <p class="kicker">先用熟悉的 case 預測</p>
          <h3>在 α = √2 的世界裡，α³ 會被摺成什麼？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'a2'" (click)="prediction.set('a2')">2α</button>
          <button type="button" [class.active]="prediction() === 'four'" (click)="prediction.set('four')">4</button>
          <button type="button" [class.active]="prediction() === 'stuck'" (click)="prediction.set('stuck')">壓不回去</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'a2'">
            {{ prediction() === 'a2'
              ? '對：α³ = α·α² = α·2 = 2α。下面逐步套用同一條方程看看。'
              : 'α³ = α·α²，而 α² = 2，所以 α³ = 2α。用下面的還原引擎逐步驗證。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選根與輸入">
        <span class="kicker">ROOT</span>
        @for (w of worlds; track w.id) {
          <button type="button" [class.active]="world().id === w.id" (click)="pickWorld(w)">{{ w.rootNote }}</button>
        }
        <span class="kicker">要還原的式子</span>
        @for (inp of world().inputs; track inp.label; let i = $index) {
          <button type="button" [class.active]="inputIndex() === i" (click)="pickInput(i)">{{ inp.label }}</button>
        }
      </div>

      <section class="stage reduce-grid">
        <div class="reduce-board">
          <div class="relation-card">
            <span class="rc-tag">目前採用的 reduction rule</span>
            <strong>{{ relation() }}</strong>
            <span class="rc-note">{{ world().rootNote }}</span>
          </div>
          <p class="reduce-input">要還原：<strong>{{ inputLabel() }}</strong></p>
          <ol class="reduce-trace">
            @for (s of shownSteps(); track $index) {
              <li>
                <span class="rt-before">{{ s.before }}</span>
                <span class="rt-detail">用規則：{{ s.detail }}</span>
                <span class="rt-after">→ {{ s.after }}</span>
              </li>
            }
          </ol>
          <div class="reduce-controls">
            <button type="button" (click)="next()" [disabled]="stepShown() >= trace().steps.length">下一步還原 →</button>
            <button type="button" (click)="reset()">重播</button>
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">還原結果</p>
          @if (done()) {
            <h3>{{ trace().resultStr }}</h3>
            <p>次數已 &lt; {{ degM() }}，回到「{{ basisRange() }}」的元素——reduction 完成。</p>
          } @else {
            <h3>還在還原中…</h3>
            <p>每一步都只用同一條方程 {{ relation() }}。</p>
          }
          <div class="readout">共需 {{ trace().steps.length }} 步；每一步都是「取餘數 mod ({{ modLabel() }})」。</div>
          <div class="basis-register" [style.grid-template-columns]="'repeat(' + degM() + ', minmax(0, 1fr))'" aria-label="reduction 後的低次 coefficients">
            @for (slot of basisSlots(); track slot.label) {
              <div class="basis-slot" [class.active]="done() && slot.coeff !== 0">
                <span>{{ slot.label }}</span>
                <strong>{{ done() ? slot.coeff : '?' }}</strong>
              </div>
            }
          </div>
          <p class="register-note">{{ done() ? '餘式同時佔用哪些 directions，由 coefficients 直接看出。' : '完成 reduction 後才揭示各低次 direction 的 coefficient。' }}</p>
          <p class="evidence-tag">證據強度：GENERAL ARGUMENT（reduction 一定停在次數 &lt; {{ degM() }}）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">mod</span>
        <div>
          <strong>Relation 是 reduction rule，不是旋轉週期</strong>
          <span>——它把超出 register 的高次冪重新分配到 <code>1,α,…,αⁿ⁻¹</code>；下一節才判定哪條 relation 能證明這些 directions 真正獨立。</span>
        </div>
      </section>

      <details>
        <summary>為什麼一定停得下來</summary>
        <p>
          每套用一次規則，就把一個「次數 ≥ {{ degM() }}」的項換成更低次數的 linear combination，最高次數嚴格下降；有限步後一定落到次數 &lt;
          {{ degM() }}。這就是 polynomial division 的 remainder process——下一節會指認出哪一條最低次 relation 才是 minimal polynomial。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh3ReductionRuleComponent {
  readonly worlds = WORLDS;
  readonly world = signal<RedWorld>(WORLDS[2]);
  readonly inputIndex = signal(1);
  readonly stepShown = signal(0);
  readonly prediction = signal<'a2' | 'four' | 'stuck' | null>(null);

  readonly relation = computed(() => relationString(this.world().m, 'α'));
  readonly modLabel = computed(() => formatPolyHigh(this.world().m, 'x'));
  readonly degM = computed(() => this.world().m.length - 1);
  readonly inputLabel = computed(() => this.world().inputs[this.inputIndex()].label);
  readonly trace = computed(() =>
    reduceTrace(this.world().inputs[this.inputIndex()].coeffs, this.world().m, 'α'),
  );
  readonly shownSteps = computed(() => this.trace().steps.slice(0, this.stepShown()));
  readonly done = computed(() => this.stepShown() >= this.trace().steps.length);
  readonly basisRange = computed(() => {
    const n = this.degM();
    return n === 2 ? '1, α' : '1, α, α²';
  });
  readonly basisSlots = computed(() => {
    const result = this.trace().result;
    return Array.from({ length: this.degM() }, (_, i) => ({
      label: i === 0 ? '1' : i === 1 ? 'α' : `α${['⁰', '¹', '²', '³'][i] ?? '^' + i}`,
      coeff: result[i] ?? 0,
    }));
  });

  pickWorld(w: RedWorld): void {
    this.world.set(w);
    this.inputIndex.set(0);
    this.stepShown.set(0);
  }
  pickInput(i: number): void {
    this.inputIndex.set(i);
    this.stepShown.set(0);
  }
  next(): void {
    this.stepShown.set(Math.min(this.trace().steps.length, this.stepShown() + 1));
  }
  reset(): void {
    this.stepShown.set(0);
  }
}
