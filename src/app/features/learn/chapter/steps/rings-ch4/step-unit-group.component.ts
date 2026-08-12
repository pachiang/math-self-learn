import { Component, computed, signal } from '@angular/core';
import { inverseMod10, mod, UNITS_MOD_10 } from './rings-ch4-model';

@Component({
  selector: 'app-rings-ch4-unit-group',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 4.5</p><h2>把所有 units 收成一副牌，multiplication 在牌組內變成 group</h2><p class="lede">先看一般 ring：unit 與 unit 相乘仍是 unit，而且每張牌都有 inverse。再用 ℤ/10ℤ 的四張牌讀出這個封閉世界。</p></header>
      <div class="general-banner"><span>GENERAL · ANY UNITAL RING R</span><code>Rˣ = &#123; all units of R &#125;</code></div>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>若 u、v 都能倒帶，先乘 u 再乘 v 的 composite 還能倒帶嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(true)">一定可以</button><button type="button" (click)="prediction.set(false)">可能失去 inverse</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="!prediction()">{{prediction()?'對。把兩張inverse cards用相反次序接回去即可。':'兩段可逆machine串接仍可逆；undo順序會反過來。'}}</p>}</section>

      <section class="stage stage-grid">
        <div class="unit-tape">
          <div class="abstract-tape"><span class="unit-card">u</span><strong>·</strong><span class="unit-card">v</span><strong>→</strong><span class="unit-card composite">uv ∈ Rˣ</span><strong>undo</strong><span class="unit-card inverse">v⁻¹u⁻¹</span></div>
          <div class="general-banner"><span>INSTANCE · ℤ/10ℤ</span><code>(ℤ/10ℤ)ˣ = &#123;1,3,7,9&#125;</code></div>
          <div class="control-row"><span class="kicker">u</span>@for(x of units;track x){<button type="button" [class.active]="u()===x" (click)="u.set(x)">{{x}}</button>}<span class="kicker">v</span>@for(x of units;track x){<button type="button" class="multiply" [class.active]="v()===x" (click)="v.set(x)">{{x}}</button>}<button type="button" (click)="reset()">RESET</button></div>
          <div class="concrete-tape"><span class="unit-card">{{u()}}</span><strong>·</strong><span class="unit-card">{{v()}}</span><strong>→</strong><span class="unit-card composite">{{product()}}</span><strong>inverse</strong><span class="unit-card inverse">{{inverse()}}</span></div>
          <div class="unit-deck">@for(x of units;track x){<span>{{x}}</span>}<span class="outside">2 · OUTSIDE</span></div>
        </div>
        <aside class="console" aria-live="polite"><p class="kicker">UNIT DECK</p><h3>COMPOSITE STAYS INSIDE</h3><p>{{u()}}·{{v()}}≡{{product()}} mod 10，仍是四張 unit cards 之一。</p><p>Composite inverse 是 {{inverse()}}。</p><div class="readout">{{product()}}·{{inverse()}}≡1</div></aside>
      </section>
      <section class="insight"><span class="insight-icon">G</span><div><strong>Units 是 ring 內部真正擁有 multiplication group 結構的區域</strong><span>Ring 不要求每個 element 可逆；只把可逆者收集起來就得到 unit group。</span></div></section>
      <details><summary>為什麼 inverse 的順序反過來？</summary><p>在任何 unital ring 中，(uv)⁻¹=v⁻¹u⁻¹，因為 (uv)(v⁻¹u⁻¹)=1 且 (v⁻¹u⁻¹)(uv)=1。Commutative ring 中順序看似無關，但一般模型仍保留正確次序。</p></details>
    </article>
  `,
})
export class RingsCh4UnitGroupComponent {
  readonly units = UNITS_MOD_10;
  readonly u = signal(3);
  readonly v = signal(7);
  readonly prediction = signal<boolean|null>(null);
  readonly product = computed(() => mod(this.u()*this.v(),10));
  readonly inverse = computed(() => inverseMod10(this.product()));
  reset(){this.u.set(3);this.v.set(7);}
}
