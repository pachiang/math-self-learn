import { Component, computed, signal } from '@angular/core';
import {
  ExtWorld,
  WORLD_CBRT2,
  WORLD_SQRT2,
  alphaPower,
  formatElement,
} from './fields-ch2-model';

@Component({
  selector: 'app-fields-ch2-dimension-varies',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 2.3</p>
        <h2>維度不是二：換一個根，就換一個維度</h2>
        <p class="lede">
          √2 只需要兩個方向，是因為 <code>(√2)² = 2</code> 摺回。但 <code>∛2</code> 呢？它的平方 <code>∛4</code> 是<strong>新</strong>方向，
          要到<strong>立方</strong> <code>(∛2)³ = 2</code> 才摺回——所以需要三個方向。維度＝摺回前的獨立方向數。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>ℚ(∛2) 需要幾個獨立方向（維度是多少）？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'two'" (click)="prediction.set('two')">2</button>
          <button type="button" [class.active]="prediction() === 'three'" (click)="prediction.set('three')">3</button>
          <button type="button" [class.active]="prediction() === 'inf'" (click)="prediction.set('inf')">無限多</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'three'">
            {{ prediction() === 'three'
              ? '對。1、∛2、∛4 三個方向，到 (∛2)³ 才摺回 → 維度 3。逐冪推推看。'
              : '推進下面的冪：∛2 的平方是新方向 ∛4，立方才摺回 2 → 需要 3 個方向。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選根">
        <span class="kicker">ROOT</span>
        @for (w of worlds; track w.id) {
          <button type="button" [class.active]="world().id === w.id" (click)="pick(w)">{{ w.rootLabel }}</button>
        }
        <button type="button" (click)="next()" [disabled]="k() >= world().n">推進到下一個冪 →</button>
        <button type="button" (click)="k.set(0)">重設</button>
      </div>

      <section class="stage dim-grid">
        <div class="dim-board">
          <p class="board-scope">基底方向（每開一個新方向，維度 +1）</p>
          <div class="slot-row">
            @for (label of world().basisLabels; track $index; let i = $index) {
              <div class="slot" [class.in]="i <= discovered()" [class.folded-target]="i === 0 && k() >= world().n">
                <span class="slot-power">{{ i === 0 ? 'α⁰' : 'α' + supers[i] }}</span>
                <span>{{ label }}</span>
              </div>
            }
          </div>
          <div class="power-readout" [class.folded]="folded()">
            <span class="pr-tag">目前冪</span>
            <strong>{{ world().rootLabel }}<sup>{{ k() }}</sup> = {{ currentValue() }}</strong>
            <span class="pr-note">
              {{ folded()
                ? 'α^' + world().n + ' = ' + world().c + ' 摺回 1 的方向——沒有開出新方向。'
                : (k() === 0 ? '從 1 開始。' : '第 ' + k() + ' 個新的獨立方向。') }}
            </span>
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">維度</p>
          <h3>[ℚ({{ world().rootLabel }}) : ℚ] = {{ world().n }}</h3>
          <p>摺回發生在第 {{ world().n }} 次冪；在那之前每個冪都是新的獨立方向。</p>
          <div class="readout">基底 {{ '{' }} {{ world().basisLabels.join('、 ') }} {{ '}' }} · 共 {{ world().n }} 個方向</div>
          <p class="evidence-tag">證據強度：FINITE EXHAUSTION（逐冪展示到摺回為止）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">dim</span>
        <div>
          <strong>維度隨根改變——√2 給兩個方向，∛2 給三個</strong>
          <span>——高次冪摺回，所以永遠只需要有限個方向。摺回發生在「根的次數」那一冪。</span>
        </div>
      </section>

      <details>
        <summary>埋下的伏筆：維度 = 根的次數</summary>
        <p>
          你看到的規律是「維度＝讓 α 摺回的那個次數」。那個次數正是 α 的 <strong>minimal polynomial</strong> 的次數：√2 滿足
          <code>x² − 2</code>（次數 2），∛2 滿足 <code>x³ − 2</code>（次數 3）。為什麼恰好在那一冪摺回、怎麼把「摺回」寫成一條規則——
          留給 Ch3 用「拿這條方程當時鐘」回答；本節只先看見數字不同。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh2DimensionVariesComponent {
  readonly supers = ['⁰', '¹', '²', '³', '⁴'];
  readonly worlds: ExtWorld[] = [WORLD_SQRT2, WORLD_CBRT2];
  readonly world = signal<ExtWorld>(WORLD_SQRT2);
  readonly k = signal(0);
  readonly prediction = signal<'two' | 'three' | 'inf' | null>(null);

  readonly folded = computed(() => this.k() >= this.world().n);
  readonly discovered = computed(() => Math.min(this.k(), this.world().n - 1));
  readonly currentValue = computed(() =>
    formatElement(alphaPower(this.k(), this.world().n, this.world().c), this.world().basisLabels),
  );

  pick(w: ExtWorld): void {
    this.world.set(w);
    this.k.set(0);
  }
  next(): void {
    this.k.set(Math.min(this.world().n, this.k() + 1));
  }
}
