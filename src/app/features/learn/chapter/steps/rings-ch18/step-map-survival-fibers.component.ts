import { Component, signal } from '@angular/core';
import { descentHandles, descentOutputs, descentSafe, DescentIdeal } from './rings-ch18-model';

@Component({
  selector:'app-rings-ch18-map-survival-fibers',standalone:true,
  template:`
  <article class="algebra-v3-lesson rings-lesson rings-ch18-lesson">
    <header class="hero"><p class="eyebrow">Rings & Ideals · 18.3</p><h2>Quotient fiber 若跨過 map fibers，同一個 input 就會說出兩個答案</h2><p class="lede">固定parity map f(n)=n mod 2，只改compression。把同一quotient class的三張handles送進f；outputs一致才能讓map下降。</p></header>
    <span class="map-convention">CONTROLLED COMPARISON · FIX f:ℤ→ℤ/2ℤ · ONLY I CHANGES · DESCENT IFF I⊆ker f</span>
    <section class="prediction"><div><p class="kicker">先預測</p><h3>Parity map能讀ℤ/6ℤ與ℤ/3ℤ中的哪一個？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set('six')">只有ℤ/6ℤ</button><button type="button" (click)="prediction.set('three')">只有ℤ/3ℤ</button><button type="button" (click)="prediction.set('both')">兩個都可以</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()!=='six'">{{prediction()==='six'?'先保持map不變，跑兩束representatives核對。':'請比較相差6與相差3是否一定保持parity。'}}</p>}</section>
    <div class="control-row"><button type="button" (click)="run()">SEND BOTH FIBERS THROUGH f</button><button type="button" (click)="reset()">RESET</button></div>
    <section class="stage stage-grid"><div class="fiber-containment-lab"><div class="fiber-comparison">@for(id of worlds;track id){<section class="fiber-world" [class.active]="tested()" [class.safe]="tested()&&safe(id)" [class.blocked]="tested()&&!safe(id)"><span class="mini-label">QUOTIENT FIBER · {{id==='six'?'0+6ℤ':'0+3ℤ'}}</span><div class="fiber-sleeve18">@for(v of handles(id);track v){<div class="fiber-handle18"><strong>{{v}}</strong><span>same class handle</span></div>}</div><span class="mini-label">PARITY OUTPUTS</span><div class="fiber-output-row">@for(v of outputs(id);track $index){<span>{{tested()?v:'?'}}</span>}</div><div class="descent-verdict" [class.blocked]="tested()&&!safe(id)"><strong>{{tested()?(safe(id)?'ONE CLASS → ONE OUTPUT':'SAME CLASS → CONFLICTING OUTPUTS'):'WAITING'}}</strong><span>{{tested()?(safe(id)?'MAP CAN DESCEND':'MAP CANNOT DESCEND'):'send the fiber'}}</span></div></section>@if(!$last){<div class="boundary-switch">⇄</div>}}</div></div><aside class="console" aria-live="polite"><span class="evidence-badge">{{tested()?'EXACT FIBER WITNESS + GENERAL CONTAINMENT RULE':'MAP SURVIVAL TEST'}}</span><h3>{{tested()?'6ℤ FITS INSIDE ker f · 3ℤ DOES NOT':'KEEP f FIXED'}}</h3><p>{{tested()?'0與3在ℤ/3ℤ是同一class，parity卻分別為0與1；這一張witness已阻止descent。':'只改quotient ideal，直接觀察哪一束跨越map outputs。'}}</p><div class="readout">ker f=2ℤ · 6ℤ⊆2ℤ yes · 3ℤ⊆2ℤ no</div></aside></section>
    <section class="insight"><span class="insight-icon">I⊆ker</span><div><strong>Quotient 只能合併 map 本來就分不出的 differences</strong><span>每條quotient fiber都必須完整躺在某條map fiber內；否則induced map沒有唯一output。</span></div></section>
    <div class="next-question"><strong>NEXT QUESTION · 18.4</strong><p>若map本身已經存在，它的kernel quotient會對準整個target，還是只對準真正reachable的部分？</p></div>
    <details><summary>正式 factor-through criterion</summary><p>f可唯一地寫成R→R/I→S，恰好當I⊆ker f。若x−y∈I，containment會給f(x−y)=0，所以f(x)=f(y)；反之若map已下降，每個i∈I都和0同class，必須有f(i)=0。</p></details>
  </article>`,
})
export class RingsCh18MapSurvivalFibersComponent{
  readonly worlds:readonly DescentIdeal[]=['six','three'];readonly prediction=signal<'six'|'three'|'both'|null>(null);readonly tested=signal(false);
  handles=descentHandles;outputs=descentOutputs;safe=descentSafe;run():void{this.tested.set(true);}reset():void{this.prediction.set(null);this.tested.set(false);}
}
