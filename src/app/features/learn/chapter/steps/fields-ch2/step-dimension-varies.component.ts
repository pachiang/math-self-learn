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
        <h2>維度不是二：最低次 relation 不同，方向數可能不同</h2>
        <p class="lede">
          先只比較兩個受控的 radical cases：<code>α²=2</code> 與 <code>α³=2</code>。√2 需要 <code>1,√2</code> 兩個方向；
          ∛2 的平方 <code>∛4</code> 仍是新方向，所以需要三個。這頁要看見的是<strong>維度會隨代數關係改變</strong>，不是先猜一條「根號次數」公式。
        </p>
      </header>

      <span class="map-convention">CONTROLLED RADICAL CASES · αⁿ=2 · OBSERVATION + EXPLICIT PROOF DEBT</span>

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
              ? '對。在這個case中，1、∛2、∛4是三個方向，而(∛2)³=2回到舊方向。下面會同時標出「看到什麼」與「還欠什麼證明」。'
              : '這個case需要3個：∛4不是1與∛2的rational combination，到(∛2)³=2才出現關係。這個獨立性的理由會在下面明確記帳。' }}
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
                : (k() === 0 ? '從 1 開始。' : '目前case的第 ' + (k() + 1) + ' 張direction card。') }}
            </span>
          </div>
          <div class="evidence-split">
            <div class="evidence-cell observed">
              <span>VISIBLE RELATION</span>
              <strong>α{{ supers[world().n] }} = {{ world().c }}</strong>
              <p>第 {{ world().n }} 次冪已能用舊方向表示，所以不需再開一槽。</p>
            </div>
            <div class="evidence-cell debt">
              <span>PROOF DEBT</span>
              <strong>為什麼之前沒有更早的 relation？</strong>
              <p>下一章用 minimal polynomial 的 irreducibility 保證這些 cards 真的獨立。</p>
            </div>
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">維度</p>
          <h3>[ℚ({{ world().rootLabel }}) : ℚ] = {{ world().n }}</h3>
          <p>在目前 <code>α{{ supers[world().n] }}=2</code> case中，需要 {{ world().n }} 張direction cards。這是受控實例，不是所有elements的根號公式。</p>
          <div class="readout">基底 {{ '{' }} {{ world().basisLabels.join('、 ') }} {{ '}' }} · 共 {{ world().n }} 個方向</div>
          <p class="evidence-tag">證據強度：EXAMPLE + PROOF DEBT（逐冪動畫不獨自證明independence）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">dim</span>
        <div>
          <strong>不是每個擴張都是二維；方向數由 α 滿足的最低次 exact polynomial relation 控制</strong>
          <span>——在這兩個 radical cases 中，分別是 <code>α²=2</code> 與 <code>α³=2</code>；下一章才替一般控制物命名。</span>
        </div>
      </section>

      <details>
        <summary>補上獨立性證書：真正控制物是 minimal polynomial</summary>
        <p>
          在 ℚ 上，<code>x²−2</code> 與 <code>x³−2</code> 都 irreducible，所以√2、∛2不會滿足更低次的rational-coefficient relation。
          因此 <code>{{ '{' }}1,√2{{ '}' }}</code> 與 <code>{{ '{' }}1,∛2,∛4{{ '}' }}</code> 真的分別獨立。一般地，若 α 是 algebraic，
          最低次的 monic polynomial relation 稱為 <strong>minimal polynomial</strong>；它的degree才是 <code>[K(α):K]</code>。Ch3 會把這份證書放進主流程。
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
