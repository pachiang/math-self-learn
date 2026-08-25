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
];

@Component({
  selector: 'app-fields-ch3-reduction-rule',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 3.1</p>
        <h2>「摺回」到底依據哪一條規則？</h2>
        <p class="lede">
          上一章一直看到 <code>√2·√2 = 2</code>、<code>(∛2)³ = 2</code> 摺回。其實背後只有<strong>一條方程</strong>：α 滿足的
          <code>α² = 2</code>（或 <code>α³ = 2</code>）。把它當成還原規則，反覆套用，任何高次都能壓回低次——就像整數「算完取餘數」。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
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
            <span class="rc-tag">唯一還原規則</span>
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
            <p>次數已 &lt; {{ degM() }}，回到「{{ basisRange() }}」的元素——摺回完成。</p>
          } @else {
            <h3>還在還原中…</h3>
            <p>每一步都只用同一條方程 {{ relation() }}。</p>
          }
          <div class="readout">共需 {{ trace().steps.length }} 步；每一步都是「取餘數 mod ({{ modLabel() }})」。</div>
          <p class="evidence-tag">證據強度：GENERAL ARGUMENT（reduction 一定停在次數 &lt; {{ degM() }}）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">mod</span>
        <div>
          <strong>摺回不是巧合——是把「根滿足的那條方程」當還原規則，重複套用</strong>
          <span>——和 ℤ/n「算完取餘數 mod n」同一件事，只是 modulus 換成一條方程。</span>
        </div>
      </section>

      <details>
        <summary>為什麼一定停得下來</summary>
        <p>
          每套用一次規則，就把一個「次數 ≥ {{ degM() }}」的項換成更低次數的組合，最高次數嚴格下降；有限步後一定落到次數 &lt;
          {{ degM() }}。這就是「除以 m 取餘數」的過程——下一節會指認出這條 m 是誰。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh3ReductionRuleComponent {
  readonly worlds = WORLDS;
  readonly world = signal<RedWorld>(WORLDS[0]);
  readonly inputIndex = signal(0);
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
