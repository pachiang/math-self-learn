import { Component, computed, signal } from '@angular/core';
import { inverseMod10, isUnitMod10, mod } from './rings-ch4-model';

@Component({
  selector: 'app-rings-ch4-function-units',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 4.6</p><h2>Function 的 inverse 也逐點組裝；一條 lane 卡住，整張 function card 就不能倒帶</h2><p class="lede">在 pointwise function ring S^X 中，inverse 不是神祕的新公式：每個 input lane 都要各自找到 S 裡的 unit partner。</p></header>
      <div class="general-banner"><span>GENERAL TRANSFER · S^X</span><code>h is a unit ⇔ every h(x) ∈ Sˣ</code></div>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>三條 lanes 中有兩條可逆，足夠讓整張 function 成為 unit 嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不夠，每條都要</button><button type="button" (click)="prediction.set(true)">多數通過即可</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'Function equality逐點成立；一條lane回不到1，product就不是constant-1 function。':'對。Global undo要求所有inputs同時回到identity。'}}</p>}</section>

      <div class="control-row"><span class="case-badge">INSTANCE · S=ℤ/10ℤ, X=&#123;A,B,C&#125;</span><span class="kicker">EDIT LANE</span>@for(label of labels;track label;let i=$index){<button type="button" [class.active]="lane()===i" (click)="lane.set(i)">{{label}}</button>}<span class="kicker">VALUE</span>@for(v of values;track v){<button type="button" [class.active]="currentValue()===v" (click)="setValue(v)">{{v}}</button>}<button type="button" (click)="buildInverse()">BUILD / TEST INVERSE</button></div>

      <section class="stage stage-grid">
        <div class="inverse-functions">
          <div class="inverse-function"><p class="kicker">h</p>@for(label of labels;track label;let i=$index){<div class="inverse-lane" [class.focus]="lane()===i"><strong>{{label}}</strong><span>↦</span><strong>{{h()[i]}}</strong></div>}</div>
          <strong>·</strong>
          <div class="inverse-function" [class.complete]="tested()&&allUnits()" [class.incomplete]="tested()&&!allUnits()"><p class="kicker">h⁻¹</p>@for(label of labels;track label;let i=$index){<div class="inverse-lane" [class.focus]="lane()===i" [class.blocked]="tested()&&inverses()[i]===null"><strong>{{label}}</strong><span>↦</span><strong>{{tested() ? (inverses()[i] ?? 'NO DOCK') : '?'}}</strong></div>}</div>
          <strong>→</strong>
          <div class="inverse-function" [class.complete]="tested()&&allUnits()" [class.incomplete]="tested()&&!allUnits()"><p class="kicker">POINTWISE PRODUCT</p>@for(label of labels;track label;let i=$index){<div class="inverse-lane" [class.blocked]="tested()&&products()[i]===null"><strong>{{label}}</strong><span>↦</span><strong>{{tested() ? (products()[i] ?? 'BLOCKED') : '?'}}</strong></div>}</div>
        </div>
        <aside class="console" aria-live="polite"><p class="kicker">{{tested()?'TEST RESULT':'AWAITING TEST'}}</p><h3>{{!tested()?'BUILD THE INVERSE':allUnits()?'FUNCTION IS A UNIT':'WHOLE CARD IS BLOCKED'}}</h3><p>{{statusText()}}</p><div class="readout">inverse docks：{{dockCount()}} / {{labels.length}}</div></aside>
      </section>
      <section class="insight"><span class="insight-icon">∀</span><div><strong>Pointwise unit 是一個 every-lane condition</strong><span>局部 inverse cards 組成完整 inverse function；任何一個 blocker 都會阻止 global undo。</span></div></section>
      <details><summary>正式敘述與符號</summary><p>對任意 set X 與 unital ring S，function ring S^X 採 pointwise operations。h∈(S^X)ˣ 當且僅當對每個 x∈X，h(x)∈Sˣ；此時 h⁻¹(x)=h(x)⁻¹。</p></details>
    </article>
  `,
})
export class RingsCh4FunctionUnitsComponent {
  readonly labels = ['A','B','C'] as const;
  readonly values = [0,1,2,3,4,5,6,7,8,9] as const;
  readonly h = signal<number[]>([3,9,2]);
  readonly lane = signal(0);
  readonly tested = signal(false);
  readonly prediction = signal<boolean|null>(null);
  readonly currentValue = computed(() => this.h()[this.lane()]);
  readonly inverses = computed(() => this.h().map(value => inverseMod10(value)));
  readonly allUnits = computed(() => this.h().every(isUnitMod10));
  readonly dockCount = computed(() => this.h().filter(isUnitMod10).length);
  readonly products = computed(() => this.h().map((value,i) => this.inverses()[i]===null ? null : mod(value*this.inverses()[i]!,10)));
  readonly firstBlocker = computed(() => this.h().findIndex(value => !isUnitMod10(value)));
  readonly statusText = computed(() => !this.tested() ? '先建立每條lane的inverse dock，再判斷整張card。' : this.allUnits() ? '每條lane都回到1，因此右側是constant-1 function。' : `${this.labels[this.firstBlocker()]} lane 的值 ${this.h()[this.firstBlocker()]} 不是S中的unit；其餘lanes成功也不能補票。`);
  setValue(value:number){this.h.update(values=>values.map((old,i)=>i===this.lane()?value:old));this.tested.set(false);}
  buildInverse(){this.tested.set(true);}
}
