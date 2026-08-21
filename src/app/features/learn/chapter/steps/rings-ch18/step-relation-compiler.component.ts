import { Component, computed, signal } from '@angular/core';
import { generatedIntegerIdealViewport, relationDifference } from './rings-ch18-model';

@Component({
  selector:'app-rings-ch18-relation-compiler',standalone:true,
  template:`
  <article class="algebra-v3-lesson rings-lesson rings-ch18-lesson">
    <header class="hero"><p class="eyebrow">Rings & Ideals · 18.2</p><h2>指定兩個 elements 相同，會先產生一個 zero difference</h2><p class="lede">不要直接把14與20黏成一張card。Ring operations會要求它們的difference歸零，ideal closure再算出所有不能拒絕的連帶collapse。</p></header>
    <span class="map-convention">INTEGER PRINCIPAL IDEAL CASE · RELATION → DIFFERENCE → GENERATED IDEAL → QUOTIENT</span>
    <section class="prediction"><div><p class="kicker">先預測compiler的第一個output</p><h3>要求14與20在新世界相同，哪個element必須先變成zero？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(6)">difference 20−14=6</button><button type="button" (click)="prediction.set(14)">只把14變zero</button><button type="button" (click)="prediction.set(20)">只把20變zero</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()!==6">{{prediction()===6?'對。Equality request在additive language中就是difference進入zero class。':'若只殺掉其中一張，兩者不會因此相等；要殺掉的是它們之差。'}}</p>}</section>
    <div class="control-row"><button type="button" [disabled]="prediction()===null||stage()>=4" (click)="next()">COMPILE NEXT STAGE</button><button type="button" (click)="replay()">REPLAY</button><button type="button" (click)="reset()">RESET</button></div>
    <section class="stage stage-grid"><div class="relation-compiler-lab"><div class="compiler-track">
      <div class="compiler-stage" [class.visible]="stage()>=1"><span class="mini-label">RELATION REQUEST</span><strong>14 ∼ 20</strong><span>make two handles equal</span></div><div class="compiler-arrow">→</div>
      <div class="compiler-stage" [class.visible]="stage()>=2"><span class="mini-label">ZERO DIFFERENCE</span><strong>20−14={{difference()}} → 0</strong><span>one forced seed</span></div><div class="compiler-arrow">→</div>
      <div class="compiler-stage" [class.visible]="stage()>=3"><span class="mini-label">IDEAL CLOSURE</span><strong>({{difference()}})={{difference()}}ℤ</strong><div class="ideal-viewport">@for(v of idealView;track v){<span>{{v}}</span>}</div></div><div class="compiler-arrow">→</div>
      <div class="compiler-stage" [class.visible]="stage()>=4"><span class="mini-label">SAFE NEW WORLD</span><strong>ℤ/{{difference()}}ℤ</strong><span>14+6ℤ = 20+6ℤ</span></div>
    </div></div><aside class="console" aria-live="polite"><span class="evidence-badge">{{complete()?'GENERAL PIPELINE · INTEGER INSTANCE':'RELATION COMPILER'}}</span><h3>{{complete()?'THE WHOLE FORCED IDEAL BECOMES ZERO':'STAGE '+stage()+' / 4'}}</h3><p>{{reading()}}</p><div class="readout">requested relation 14∼20 · forced seed {{stage()>=2?'6':'?'}}</div></aside></section>
    @if(complete()){<section class="transfer-strip"><div><p class="kicker">TRANSFER · FUNCTION RING</p><strong>要求f與g變成同一element，應把哪張function送進zero class？</strong></div><div class="choice-row"><button type="button" (click)="transfer.set(true)">f−g，以及它生成的ideal</button><button type="button" (click)="transfer.set(false)">只刪掉f的名字</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="!transfer()">{{transfer()?'對。Surface從integers換成functions，relation→difference→ideal機制不變。':'Equality由difference控制；只刪名字沒有保護operations。'}}</p>}</section>}
    <section class="insight"><span class="insight-icon">u−v</span><div><strong>Quotient 不只接受一句 relation；它壓掉 relation 所強迫的完整 ideal</strong><span>u∼v先翻成u−v→0，再由ideal closure保護所有addition與multiplication contexts。</span></div></section>
    <div class="next-question"><strong>NEXT QUESTION · 18.3</strong><p>如果還有一張既存map要保留，這個collapse會不會讓同一class得到互相衝突的outputs？</p></div>
    <details><summary>一般機制與integer detector</summary><p>在commutative unital ring中，要求u與v相等就是要求u−v進入quotient kernel，因此至少要壓掉generated ideal(u−v)。在ℤ中它是所有difference的integer multiples；這只是ℤ的principal detector。</p></details>
  </article>`,
})
export class RingsCh18RelationCompilerComponent{
  readonly prediction=signal<number|null>(null);readonly stage=signal(0);readonly transfer=signal<boolean|null>(null);readonly difference=computed(()=>relationDifference());readonly idealView=generatedIntegerIdealViewport();readonly complete=computed(()=>this.stage()===4);
  next():void{this.stage.update(v=>Math.min(4,v+1));} replay():void{this.stage.set(0);this.transfer.set(null);} reset():void{this.prediction.set(null);this.stage.set(0);this.transfer.set(null);}
  reading():string{return ['先保留一句需求，不預先猜quotient。','Relation已進compiler；接著改寫成additive difference。','Difference 6必須是zero seed；下一步讓ideal contract補齊連帶結果。','6ℤ是ℤ中由6生成的完整safe-collapse region；最後才wrap。','14與20相差6，所以在ℤ/6ℤ中成為同一class。'][this.stage()];}
}
