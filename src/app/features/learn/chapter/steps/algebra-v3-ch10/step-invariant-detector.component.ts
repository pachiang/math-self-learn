import { Component, computed, signal } from '@angular/core';

type PairMode='c4v4'|'z4roots'|'z6s3';
interface Fingerprint { name:string; size:string; abelian:string; orders:string; }

@Component({
  selector:'app-algebra-v3-invariant-detector',
  standalone:true,
  template:`
    <article class="algebra-v3-lesson alg-ch10-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 10.4</p><h2>別盲找翻譯表：先用不變量抓出不可能</h2><p class="lede">Isomorphism 會保留所有由 operation 決定的結構特徵。把這些特徵當成 fingerprint：只要一列不同，就不用再找 map；若目前都相同，也只能說候選者還活著。</p></header>
      <section class="prediction"><p class="kicker">先判斷</p><h3>兩個 groups 有相同 element 數量，就必定 isomorphic 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不必然</button><button type="button" (click)="prediction.set(true)">必然</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'C₄ 與 V₄ 都有四個 elements，但它們的 element-order fingerprint 不同。':'對。Group size 只是最粗的一列 fingerprint。'}}</p>}</section>
      <section class="lab">
        <div class="lab-heading"><div><p class="kicker">Invariant fingerprint detector</p><h3>逐列比對，直到找到不可修復的 mismatch</h3></div><p>Mismatch 是嚴格的 rejection certificate；全部已選 fingerprints 相同，只代表「尚未被這些測試排除」。</p></div>
        <div class="mode-picker" role="group" aria-label="選擇要比較的 groups"><button type="button" [attr.aria-pressed]="mode()==='c4v4'" (click)="select('c4v4')">C₄ vs V₄</button><button type="button" [attr.aria-pressed]="mode()==='z4roots'" (click)="select('z4roots')">ℤ₄ vs roots</button><button type="button" [attr.aria-pressed]="mode()==='z6s3'" (click)="select('z6s3')">ℤ₆ vs S₃</button></div>
        <div class="stage fingerprint-layout">
          <div class="fingerprint-table" role="table" aria-label="Group invariant 比較表">
            <div class="fingerprint-head" role="row"><span>INVARIANT</span><strong>{{pair().left.name}}</strong><strong>{{pair().right.name}}</strong><span>RESULT</span></div>
            @for(row of rows();track row.key;let index=$index){<div class="fingerprint-row" role="row" [class.unrevealed]="revealed()<=index" [class.mismatch]="revealed()>index&&!row.match"><span>{{row.label}}</span><strong>{{revealed()>index?row.left:'?'}}</strong><strong>{{revealed()>index?row.right:'?'}}</strong><b>{{revealed()>index?(row.match?'MATCH':'MISMATCH'):'LOCKED'}}</b></div>}
          </div>
          <section class="fingerprint-console" aria-live="polite"><p class="kicker">DETECTOR STATUS</p><div class="invariant-verdict" [class.fail]="rejected()">{{rejected()?'× REJECTED · NOT ISOMORPHIC':revealed()===3?'○ SURVIVES THESE TESTS · NOT YET A PROOF':'… REVEAL MORE FINGERPRINTS'}}</div><button type="button" class="primary" [disabled]="revealed()===3" (click)="revealNext()">Reveal next invariant</button><button type="button" (click)="revealed.set(0)">重設掃描</button><p>{{explanation()}}</p></section>
        </div>
      </section>
      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>one mismatch</span><i>→</i><span>impossible</span><i>but</i><span>all match ≠ proof</span></div><p><strong>Invariant detector 是單向篩選器。</strong>不同立即否決；相同只讓候選 map 繼續接受更細的檢查。這種不對稱，是解 isomorphism 問題最重要的策略。</p></aside>
      <section class="transfer"><p class="kicker">遷移問題</p><h3>一個 abelian group 與一個 non-abelian group 可能 isomorphic 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(false)">不可能</button><button type="button" (click)="transfer.set(true)">可能</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="transfer()">{{transfer()?'Commutativity 由 operation 決定，因此 isomorphism 必須保留。':'對。若 G 中 ab=ba，翻譯後 φ(a)φ(b)=φ(ab)=φ(ba)=φ(b)φ(a)。'}}</p>}</section>
      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>為何 element order 是 invariant？</summary><div>若 φ 是 isomorphism，則 φ(aⁿ)=φ(a)ⁿ。於是 aⁿ=e 若且唯若 φ(a)ⁿ=e；首次回到 identity 的步數不會改變。</div></details><details><summary>Matching fingerprints 為何不構成 proof？</summary><div>有限張摘要表可能漏掉更細的 operation 關係。要證明 isomorphic，仍需建造 isomorphism，或引用能涵蓋該類 groups 的分類結果。</div></details><details><summary>C₄ 與 V₄ 的關鍵差別</summary><div>C₄ 有兩個 order 4 elements；V₄ 除 identity 外三個 elements 都是 order 2。任何 isomorphism 都不能改變 order，因此兩者不可能 isomorphic。</div></details></section>
    </article>
  `,
})
export class AlgebraV3InvariantDetectorComponent{
  readonly prediction=signal<boolean|null>(null);readonly transfer=signal<boolean|null>(null);readonly mode=signal<PairMode>('c4v4');readonly revealed=signal(0);
  readonly pair=computed(()=>({
    c4v4:{left:{name:'C₄',size:'4',abelian:'yes',orders:'1, 2, 4, 4'},right:{name:'V₄',size:'4',abelian:'yes',orders:'1, 2, 2, 2'}},
    z4roots:{left:{name:'ℤ₄',size:'4',abelian:'yes',orders:'1, 2, 4, 4'},right:{name:'{1,i,−1,−i}',size:'4',abelian:'yes',orders:'1, 2, 4, 4'}},
    z6s3:{left:{name:'ℤ₆',size:'6',abelian:'yes',orders:'1, 2, 3, 3, 6, 6'},right:{name:'S₃',size:'6',abelian:'no',orders:'1, 2, 2, 2, 3, 3'}},
  })[this.mode()] as {left:Fingerprint;right:Fingerprint});
  readonly rows=computed(()=>[
    {key:'size',label:'GROUP SIZE',left:this.pair().left.size,right:this.pair().right.size,match:this.pair().left.size===this.pair().right.size},
    {key:'abelian',label:'COMMUTATIVE?',left:this.pair().left.abelian,right:this.pair().right.abelian,match:this.pair().left.abelian===this.pair().right.abelian},
    {key:'orders',label:'ELEMENT ORDERS',left:this.pair().left.orders,right:this.pair().right.orders,match:this.pair().left.orders===this.pair().right.orders},
  ]);
  readonly rejected=computed(()=>this.rows().some((row,index)=>index<this.revealed()&&!row.match));
  readonly explanation=computed(()=>{if(this.rejected()){const row=this.rows().find((item,index)=>index<this.revealed()&&!item.match);return `${row?.label} 不同；isomorphism 無法修復這個結構差異。`;}if(this.revealed()===3)return this.mode()==='z4roots'?'三列都相同，而且上一頁已建出 natural isomorphism；這一對確實通過。':'三列相同仍需建造 map 才能下結論。';return '目前沒有 mismatch；繼續 reveal，不能提早宣稱 isomorphic。';});
  select(mode:PairMode):void{this.mode.set(mode);this.revealed.set(0);}
  revealNext():void{this.revealed.update(value=>Math.min(3,value+1));}
}
