import { Component, computed, signal } from '@angular/core';
import { allPairs, constantFunctions, containsPair, operatePair, pairKey, pairLabel, Pair, PairOperation } from './rings-ch6-model';

@Component({
  selector: 'app-rings-ch6-inherited-operations',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 6.1</p><h2>Subring 沿用 ambient operations，不另裝一套 machine</h2><p class="lede">Boundary 只能決定哪些function cards住在subset裡；它不能為了讓答案漂亮，偷偷改寫原本的pointwise output。</p></header>
      <div class="general-banner"><span>INSTANCE · R=(ℤ/4ℤ)^&#123;A,B&#125;</span><code>pair shorthand = (h(A), h(B))</code></div>
      <section class="prediction"><div><p class="kicker">先預測</p><h3>兩張 constant functions (1,1)、(3,3) 在 R 中相加為 (0,0)。Subset 能另訂一個不同答案嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不能，必須沿用</button><button type="button" (click)="prediction.set(true)">可以重寫subset規則</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'那會變成另一套operation，不再是ambient ring的subring。':'對。先由ambient machine算output，再做membership check。'}}</p>}</section>
      <div class="control-row"><span class="kicker">OPERATION</span><button type="button" [class.active]="operation()==='add'" (click)="setOperation('add')">ADD</button><button type="button" [class.active]="operation()==='difference'" (click)="setOperation('difference')">DIFFERENCE</button><button type="button" [class.active]="operation()==='multiply'" (click)="setOperation('multiply')">MULTIPLY</button><span class="kicker">LEFT</span>@for(pair of members;track key(pair)){<button type="button" [class.active]="key(left())===key(pair)" (click)="left.set(pair)">{{label(pair)}}</button>}<span class="kicker">RIGHT</span>@for(pair of members;track key(pair)){<button type="button" [class.active]="key(right())===key(pair)" (click)="right.set(pair)">{{label(pair)}}</button>}<button type="button" (click)="reveal.set(true)">SHOW AMBIENT ROUTE</button><button type="button" (click)="checked.set(true)">CHECK BOUNDARY</button><button type="button" (click)="reset()">RESET</button></div>
      <section class="stage stage-grid">
        <div class="function-world">
          <div class="candidate-label"><strong>D · CONSTANT FUNCTIONS</strong><span>boundary condition：h(A)=h(B)</span></div>
          <div class="operation-route"><span class="function-slot selected">{{label(left())}}</span><span class="op">{{symbol()}}</span><span class="function-slot selected">{{label(right())}}</span><strong>→</strong><span class="function-slot output" [class.escape]="checked()&&!inside()">{{reveal()?label(output()):'?'}}</span></div>
          <div class="function-board" style="--board-size:4">@for(pair of board;track key(pair)){<button type="button" class="function-slot" [class.member]="isMember(pair)" [class.output]="reveal()&&key(output())===key(pair)" [attr.aria-label]="ariaPair(pair)"><strong>{{label(pair)}}</strong><span class="lane-mini"><span>A→{{pair[0]}}</span><span>B→{{pair[1]}}</span></span></button>}</div>
          <div class="membership-gate" [class.inside]="checked()&&inside()"><strong>{{!checked()?'BOUNDARY NOT CHECKED':inside()?'OUTPUT ∈ D':'OUTPUT ∉ D'}}</strong></div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">EXAMPLE</span><h3>{{reveal()?'AMBIENT OUTPUT FIXED':'USE THE ORIGINAL MACHINE'}}</h3><p>{{statusText()}}</p><div class="readout">{{equation()}}</div></aside>
      </section>
      <section class="insight"><span class="insight-icon">⊂</span><div><strong>Subring 是 inherited operations 下的自足 subset</strong><span>先算ambient output，再問是否仍在boundary；不能反過來改答案。</span></div></section>
      <details><summary>Restriction of operations</summary><p>若S⊆R是subring，S上的addition與multiplication就是R之operations限制到S×S。這一個example只展示inheritance，尚未證明對所有pairs都closed。</p></details>
    </article>
  `,
})
export class RingsCh6InheritedOperationsComponent {
  readonly board=allPairs(4);readonly members=constantFunctions(4);
  readonly operation=signal<PairOperation>('add');readonly left=signal<Pair>([1,1]);readonly right=signal<Pair>([3,3]);readonly reveal=signal(false);readonly checked=signal(false);readonly prediction=signal<boolean|null>(null);
  readonly output=computed(()=>operatePair(this.left(),this.right(),this.operation(),4));readonly inside=computed(()=>containsPair(this.members,this.output()));
  readonly symbol=computed(()=>this.operation()==='add'?'+':this.operation()==='difference'?'−':'×');
  readonly equation=computed(()=>this.reveal()?`${pairLabel(this.left())} ${this.symbol()} ${pairLabel(this.right())} = ${pairLabel(this.output())} in R`:'Output hidden until ambient route is shown.');
  readonly statusText=computed(()=>!this.reveal()?'Boundary不參與計算；先讓pointwise machine決定output。':!this.checked()?'現在output已固定，下一步才檢查membership。':this.inside()?'這個example留在D，但尚未證明所有pairs。':'Output逃逸，candidate會失敗；ambient machine本身沒有壞。');
  key=pairKey;label=pairLabel;isMember(pair:Pair){return containsPair(this.members,pair);}ariaPair(pair:Pair){return `function card ${pairLabel(pair)}，A lane ${pair[0]}，B lane ${pair[1]}，${this.isMember(pair)?'屬於constant subset D':'不屬於D'}`;}
  setOperation(operation:PairOperation){this.operation.set(operation);this.reveal.set(false);this.checked.set(false);}reset(){this.operation.set('add');this.left.set([1,1]);this.right.set([3,3]);this.reveal.set(false);this.checked.set(false);}
}
