import { Component, computed, signal } from '@angular/core';

interface StepCase {
  id: string;
  name: string;
  degree: number;
  algebra: string;
  note: string;
}

const CASES: StepCase[] = [
  {
    id: 'll',
    name: '線 ∩ 線',
    degree: 1,
    algebra: '解一次聯立方程',
    note: '兩條直線求交＝解一次方程組，座標只是有理運算 → degree 1，世界沒變大。',
  },
  {
    id: 'lc',
    name: '線 ∩ 圓',
    degree: 2,
    algebra: '直線代入圓 → 一條二次方程',
    note: '把直線代進圓方程，得到一條二次方程 → degree ≤ 2，最多開一個平方根。',
  },
  {
    id: 'cc',
    name: '圓 ∩ 圓',
    degree: 2,
    algebra: '兩圓相減消去 x²+y² → 直線 → 再與圓求交',
    note: '兩圓相減會消掉 x²+y²，剩一條直線（radical axis），再與圓求交 → 一樣 degree ≤ 2。',
  },
];

@Component({
  selector: 'app-fields-ch5-step-quadratic',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 5.1</p>
        <h2>一步尺規，只解到二次</h2>
        <p class="lede">
          Ch4 說尺規只造得出「2 的冪」的塔——為什麼是 2？因為<strong>一步作圖最多只解到二次方程</strong>。尺規只有兩種曲線：
          直線（一次）與圓（二次）。取它們的交點，代數上最多是一條二次方程。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>取兩個基本圖形的交點，最多會解到幾次方程？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'one'" (click)="prediction.set('one')">一次</button>
          <button type="button" [class.active]="prediction() === 'two'" (click)="prediction.set('two')">二次</button>
          <button type="button" [class.active]="prediction() === 'any'" (click)="prediction.set('any')">想多高有多高</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'two'">
            {{ prediction() === 'two'
              ? '對。直線一次、圓二次，交點最多解到二次。切下面三種步驟看它們的方程次數。'
              : '最多二次：直線是一次、圓是二次，取交點頂多開一個平方根。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選作圖步驟">
        <span class="kicker">STEP · STRAIGHTEDGE + COMPASS ONLY</span>
        @for (s of cases; track s.id) {
          <button type="button" [class.active]="step().id === s.id" (click)="step.set(s)">{{ s.name }}</button>
        }
      </div>

      <section class="stage geo-grid">
        <div class="geo-board">
          <p class="board-scope">左：幾何（只允許線與圓）</p>
          <svg class="geo-svg" viewBox="0 0 300 240" role="img" [attr.aria-label]="step().name + ' 的示意圖'">
            @switch (step().id) {
              @case ('ll') {
                <line class="geo-line" x1="30" y1="200" x2="270" y2="60" />
                <line class="geo-line" x1="30" y1="60" x2="270" y2="200" />
                <circle class="geo-pt" cx="150" cy="130" r="6" />
              }
              @case ('lc') {
                <circle class="geo-circle" cx="150" cy="130" r="78" />
                <line class="geo-line" x1="30" y1="165" x2="270" y2="95" />
                <circle class="geo-pt" cx="75" cy="152" r="6" />
                <circle class="geo-pt" cx="225" cy="108" r="6" />
              }
              @case ('cc') {
                <circle class="geo-circle" cx="115" cy="130" r="72" />
                <circle class="geo-circle" cx="185" cy="130" r="72" />
                <line class="geo-radical" x1="150" y1="45" x2="150" y2="215" />
                <circle class="geo-pt" cx="150" cy="67" r="6" />
                <circle class="geo-pt" cx="150" cy="193" r="6" />
              }
            }
          </svg>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">右：代數</p>
          <h3>{{ step().name }} → degree {{ step().degree }}</h3>
          <p class="algebra-line">{{ step().algebra }}</p>
          <p>{{ step().note }}</p>
          <div class="degree-badge" [class.deg1]="step().degree === 1">[Kᵢ : Kᵢ₋₁] = {{ step().degree }}</div>
          <p class="evidence-tag">證據強度：GENERAL ARGUMENT（線＝一次、圓＝二次）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">≤2</span>
        <div>
          <strong>尺規的極限：一步最多解到二次</strong>
          <span>——所以一步最多把世界擴大成一個二次擴張（線∩線那種只解到一次，世界不變大）。</span>
        </div>
      </section>

      <details>
        <summary>符號層：三種交點的方程</summary>
        <p>
          在目前座標 field 上，直線是 <code>ax + by = c</code>（一次），圓是 <code>(x−p)² + (y−q)² = r²</code>（二次）。線∩線解一次系統；
          線∩圓把線代入圓得二次；圓∩圓相減消去 <code>x²+y²</code> 化為線∩圓。所以每步 <code>[Kᵢ:Kᵢ₋₁] ∈ {{ '{' }}1, 2{{ '}' }}</code>。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh5StepQuadraticComponent {
  readonly cases = CASES;
  readonly step = signal<StepCase>(CASES[1]); // 預設「線∩圓」（二次，非退化）
  readonly prediction = signal<'one' | 'two' | 'any' | null>(null);
}
