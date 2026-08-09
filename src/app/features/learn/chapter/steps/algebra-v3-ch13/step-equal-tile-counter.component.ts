import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-algebra-v3-equal-tile-counter',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch13-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 13.1</p><h2>整除不是公式魔法：它是等大 tiles 鋪滿後的計數</h2><p class="lede">Ch12 已經證明 cosets 與 H 一樣大、彼此不重疊，而且覆蓋 G。現在只做一件事：把這三個結構事實逐塊數出來。</p></header>

      <section class="prediction"><p class="kicker">先預測</p><h3>12 個 actions 被大小 3 的 coset tiles 鋪滿，需要幾塊？</h3><div class="choice-row"><button type="button" (click)="prediction.set(4)">4 塊</button><button type="button" (click)="prediction.set(3)">3 塊</button><button type="button" (click)="prediction.set(9)">9 塊</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()!==4">{{prediction()===4?'對。3×4=12；商不是憑空算出的數，而是 distinct cosets 的數量。':'先固定每塊 3 點，再問多少個互斥 tiles 才能剛好覆蓋 12 點。'}}</p>}</section>

      <section class="lab"><div class="lab-heading"><div><p class="kicker">Equal-tile counter</p><h3>逐塊鋪滿，公式最後才出現</h3></div><p>模型使用 ℤ₁₂ 與 H=⟨4⟩。每次加入的是完整 coset，不允許只塞幾個散點。</p></div>
        <div class="stage lagrange-layout"><div class="equal-tile-board">@for(tile of tiles;track tile.label;let index=$index){<section [class.placed]="isPlaced(index)"><h4>{{tile.label}}</h4>@for(x of tile.items;track x){<span>{{tileValue(index,x)}}</span>}<small>{{tileStatus(index)}}</small></section>}</div><section class="count-console" aria-live="polite"><p class="kicker">TILES {{placed()}} / 4</p><div class="control-row"><button type="button" class="primary" [disabled]="placed()===4" (click)="placeNext()">鋪下一塊</button><button type="button" (click)="placed.set(0)">清空</button></div><div class="structure-checks"><span>✓ EQUAL SIZE · each tile has 3</span><span>✓ NO OVERLAP · distinct cosets</span><span>{{placed()===4?'✓':'…'}} NO LEFTOVERS · cover G</span></div>@if(placed()===4){<div class="count-equation"><span>|H|</span><strong>3</strong><i>×</i><span>[G:H]</span><strong>4</strong><i>=</i><span>|G|</span><strong>12</strong></div><div class="lagrange-verdict">✓ 3 DIVIDES 12 BECAUSE FOUR WHOLE TILES FIT</div>}<p>{{placed()===4?'三個結構事實現在可合法壓縮成一個 counting equation。':'尚未覆蓋全部，不能提前把目前點數當成 |G|。'}}</p></section></div>
      </section>
      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>tile size</span><i>×</i><span>tile count</span><i>=</i><span>whole group</span></div><p><strong>Lagrange theorem 是 coset partition 的計數版本。</strong>整除來自「完整 tiles 恰好鋪滿」，不是 group order 之間偶然的算術關係。</p></aside>
      <section class="transfer"><p class="kicker">逆向重建</p><h3>若 |G|=20、|H|=5，distinct cosets 有幾塊？</h3><div class="choice-row"><button type="button" (click)="transfer.set(4)">4</button><button type="button" (click)="transfer.set(5)">5</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="transfer()!==4">{{transfer()===4?'對。每塊 5，四塊覆蓋 20。':'不要把 subgroup size 與 tile count 混成同一個數。'}}</p>}</section>
      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Lagrange theorem</summary><div>若 G 是 finite group 且 H≤G，則 |G|=[G:H]|H|，所以 |H| divides |G|。</div></details><details><summary>Proof Lab：三個已知 lemma 如何組合？</summary><div>Left cosets partition G；每個 coset 由 h↦gh 與 H bijective；共有 [G:H] 個 distinct cosets。把 disjoint union 的大小相加，即得 |G|=[G:H]|H|。</div></details></section>
    </article>
  `,
})
export class AlgebraV3EqualTileCounterComponent {
  readonly prediction=signal<number|null>(null);readonly transfer=signal<number|null>(null);readonly placed=signal(0);
  readonly tiles=[{label:'0+H',items:[0,4,8]},{label:'1+H',items:[1,5,9]},{label:'2+H',items:[2,6,10]},{label:'3+H',items:[3,7,11]}];
  isPlaced(index:number):boolean{return index<this.placed();}
  tileValue(index:number,value:number):string{return this.isPlaced(index)?String(value):'·';}
  tileStatus(index:number):string{return this.isPlaced(index)?'PLACED · SIZE 3':'WAITING';}
  placeNext():void{this.placed.update(value=>Math.min(4,value+1));}
}
