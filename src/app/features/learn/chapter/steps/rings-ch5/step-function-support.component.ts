import { Component, computed, signal } from '@angular/core';
import { isNonzeroVector, isZeroVector, pointwiseProduct, support } from './rings-ch5-model';

@Component({
  selector: 'app-rings-ch5-function-support',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 5.4</p><h2>兩張非零 functions，也能在每一條 lane 彼此錯開</h2><p class="lede">Zero divisor 不是數字外觀。Pointwise multiplication 只要在每條 lane 至少遇到一個 0，整張 product card 就會成為 zero function。</p></header>
      <div class="general-banner"><span>TRANSFER · FUNCTION RING ℤ^X</span><code>VALUES SHOWN: 0 / 1 · X=&#123;A,B,C,D&#125;</code></div>
      <section class="prediction"><div><p class="kicker">建造前先預測</p><h3>f 只在 A、B 非零。能否建造一張非零 g，卻讓 fg 整張為 0？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(true)">可以，讓support錯開</button><button type="button" (click)="prediction.set(false)">不可能</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="!prediction()">{{prediction()?'試著只打開g的C或D lane。':'兩張cards各自非零，不代表它們在同一條lane相遇。'}}</p>}</section>
      <div class="control-row"><span class="kicker">CHALLENGE</span><span>固定 f，點擊 g 的 lanes</span><button type="button" (click)="test()">TEST WITNESS</button><button type="button" (click)="reset()">RESET</button>@if(transfersUnlocked()){<button type="button" (click)="oneOverlap()">ONE OVERLAP</button><button type="button" (click)="fullSupport()">FULL-SUPPORT f</button>}</div>

      <section class="stage stage-grid">
        <div class="support-lab">
          <div class="function-card" [class.nonzero]="isNonzero(f())"><p class="kicker">f · FIXED FIRST</p>@for(label of labels;track label;let i=$index){<div class="support-lane" [class.on]="f()[i]===1"><strong>{{label}}</strong><span class="support-token" [class.on]="f()[i]===1"></span><strong>{{f()[i]}}</strong></div>}<small>support = {{supportLabel(f())}}</small></div>
          <strong>·</strong>
          <div class="function-card" [class.nonzero]="isNonzero(g())"><p class="kicker">g · YOU BUILD</p>@for(label of labels;track label;let i=$index){<button type="button" class="support-lane" [class.on]="g()[i]===1" [class.overlap]="g()[i]===1&&f()[i]===1" (click)="toggleG(i)"><strong>{{label}}</strong><span class="support-token" [class.on]="g()[i]===1"></span><strong>{{g()[i]}}</strong></button>}<small>support = {{supportLabel(g())}}</small></div>
          <strong>→</strong>
          <div class="function-card" [class.nonzero]="isNonzero(product())" [class.zero]="isZero(product())"><p class="kicker">POINTWISE PRODUCT</p>@for(label of labels;track label;let i=$index){<div class="support-lane" [class.on]="product()[i]===1"><strong>{{label}}</strong><span>{{f()[i]}}·{{g()[i]}}</span><strong>{{product()[i]}}</strong></div>}<small>{{isZero(product())?'ZERO FUNCTION':'NONZERO FUNCTION'}}</small></div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">WITNESS CHALLENGE</span><h3>{{verdictTitle()}}</h3><p>{{verdictText()}}</p><div class="readout">supp(f) ∩ supp(g) = {{intersectionLabel()}}</div></aside>
      </section>
      <section class="insight"><span class="insight-icon">∅</span><div><strong>Zero divisor 描述 multiplication 如何壓掉資訊，不要求 elements 長得像 numbers</strong><span>兩張nonzero function cards的supports不重疊，pointwise product仍能處處為0。</span></div></section>
      <details><summary>這個 witness 能推廣到哪裡？</summary><p>若X至少有兩點，可取兩個互不重疊且非空的subsets，建立各自只在其中取1的functions。兩張functions都非零，但pointwise product是zero function。這是存在witness，不是所有function zero divisors的分類。</p></details>
    </article>
  `,
})
export class RingsCh5FunctionSupportComponent {
  readonly labels = ['A','B','C','D'] as const;
  readonly f = signal<number[]>([1,1,0,0]);
  readonly g = signal<number[]>([0,0,0,0]);
  readonly tested = signal(false);
  readonly transfersUnlocked = signal(false);
  readonly prediction = signal<boolean|null>(null);
  readonly product = computed(() => pointwiseProduct(this.f(),this.g()));
  readonly validWitness = computed(() => isNonzeroVector(this.f())&&isNonzeroVector(this.g())&&isZeroVector(this.product()));
  readonly isNonzero = isNonzeroVector;
  readonly isZero = isZeroVector;
  readonly verdictTitle = computed(() => !this.tested()?'BUILD A NONZERO g':!isNonzeroVector(this.g())?'g=0 IS NOT A LEGAL WITNESS':this.validWitness()?'ZERO-PRODUCT WITNESS BUILT':'OVERLAP LEAVES A TRACE');
  readonly verdictText = computed(() => !this.tested()?'至少打開g的一條lane，再測試整張product。':!isNonzeroVector(this.g())?'Zero divisor witness要求兩個factors都非零；不能讓g整張為0。':this.validWitness()?'f與g都非零，但每條lane至少有一個zero factor。':'至少一條lane同時開啟，因此product card仍非零。');
  readonly intersectionLabel = computed(() => {
    const shared=support(this.f()).filter(index=>this.g()[index]!==0).map(index=>this.labels[index]);
    return shared.length?`{${shared.join(',')}}`:'∅';
  });
  supportLabel(values:readonly number[]){const active=support(values).map(index=>this.labels[index]);return active.length?`{${active.join(',')}}`:'∅';}
  toggleG(index:number){this.g.update(values=>values.map((value,i)=>i===index?(value?0:1):value));this.tested.set(false);}
  test(){this.tested.set(true);if(this.validWitness())this.transfersUnlocked.set(true);}
  oneOverlap(){this.f.set([1,1,0,0]);this.g.set([1,0,0,1]);this.tested.set(true);}
  fullSupport(){this.f.set([1,1,1,1]);this.g.set([0,0,1,0]);this.tested.set(true);}
  reset(){this.f.set([1,1,0,0]);this.g.set([0,0,0,0]);this.tested.set(false);}
}
