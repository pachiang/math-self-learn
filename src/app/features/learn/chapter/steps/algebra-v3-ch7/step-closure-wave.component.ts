import { Component, computed, signal } from '@angular/core';

interface ClosureStage { values: readonly number[]; added: number; rule: 'SEED'|'IDENTITY'|'INVERSE'|'COMPOSITION'; reason: string; }

@Component({
  selector: 'app-algebra-v3-closure-wave',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch7-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 7.4</p><h2>放入 seed 後，group contract 會強迫世界長大</h2><p class="lede">只說「我要保留 2」還不是一個能自行運作的 group world。Identity、missing inverses 與 missing composites 會逐項提出加入要求；直到再也沒有 contract debt，closure wave 才停止。</p></header>

      <section class="prediction"><p class="kicker">先找被迫加入的 element</p><h3>在 ℤ₈ 中，任何包含 2 的 subgroup 都必須也包含 6 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(true)">必須</button><button type="button" (click)="prediction.set(false)">不必</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="!prediction()">{{prediction()?'對。6 是 2 的 additive inverse；缺少它就無法履行 inverse contract。':'若保留 2 卻排除 6，2 沒有 inverse，這個 subset 不能自行成群。'}}</p>}</section>

      <section class="lab">
        <div class="lab-heading"><div><p class="kicker">Contract closure wave</p><h3>每一步只償還一筆明確的 contract debt</h3></div><p>選 seed 後逐步執行。新 node 以粗框和文字標出；右側 ledger 說明它是被 identity、inverse 還是 composition 強迫加入。</p></div>
        <div class="generator-picker" role="group" aria-label="選擇模八中的 seed"><button type="button" [attr.aria-pressed]="seed()===2" (click)="selectSeed(2)">seed 2</button><button type="button" [attr.aria-pressed]="seed()===3" (click)="selectSeed(3)">seed 3</button></div>
        <div class="control-row"><button type="button" class="primary" (click)="next()" [disabled]="stageIndex()>=stages().length-1">執行下一筆要求</button><button type="button" (click)="finish()" [disabled]="stageIndex()>=stages().length-1">補到穩定</button><button type="button" (click)="stageIndex.set(0)" [disabled]="stageIndex()===0">只留 seed</button></div>

        <div class="stage closure-layout">
          <div class="closure-world" [attr.aria-label]="worldLabel()">@for(value of residues;track value){<div class="closure-node" [class.included]="included(value)" [class.new]="current().added===value"><strong>{{included(value)?'✓':'×'}} {{value}}</strong><span>{{nodeStatus(value)}}</span></div>}</div>
          <section class="closure-console" aria-live="polite"><p class="kicker">STAGE {{stageIndex()+1}} / {{stages().length}}</p><h4>{{current().rule}} forced {{current().added}}</h4><p>{{current().reason}}</p><div class="button-equation">current world = {{'{'}}{{current().values.join(', ')}}{{'}'}}</div><div class="reason-ledger">@for(stage of visibleStages();track $index){<div class="reason-row" [class.current]="$index===stageIndex()"><span>{{stage.rule}}</span><strong>add {{stage.added}} · {{stage.reason}}</strong></div>}</div><div class="reach-verdict">{{stable()?'✓ STABLE — no missing identity, inverse, or composite':'○ CONTRACT DEBT REMAINS — world must still expand'}}</div></section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>seeds S</span><i>+ forced repairs</i><span>contract stable</span><i>→</i><span>smallest world ⟨S⟩</span></div><p><strong>Generated subgroup 是包含 seeds 的最小穩定世界。</strong>它不隨意多收 elements；每個新增者都有 identity、inverse 或 composition 的必要理由，停止時又剛好能自行履行 group contract。</p></aside>

      <section class="transfer"><p class="kicker">比較兩個 seeds</p><h3>在 ℤ₈ 中，因為 3 比 2 大，所以 ⟨3⟩ 會比 ⟨2⟩ 小嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(false)">不會</button><button type="button" (click)="transfer.set(true)">會</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="transfer()">{{transfer()?'seed 的數值大小和 coverage 沒有單調關係；3 的 repeated sums 反而到齊八點。':'對。⟨2⟩ 只有 0、2、4、6，但 ⟨3⟩=ℤ₈；生成大小由 connectivity 決定。'}}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>兩種等價讀法：words 與 smallest subgroup</summary><div>⟨S⟩ 一方面是所有 S∪S⁻¹ finite words 的 effects；另一方面是所有包含 S 的 subgroups 的 intersection。第一種讀法給出如何抵達，第二種讀法表達 inclusion 意義下的最小性。</div></details><details><summary>Proof Lab：為什麼它真的最小？</summary><div>任一包含 S 的 subgroup H 都必須包含 e、S 中 elements 的 inverses，以及這些 elements 的所有 finite composites。所以每個由 S 形成的 word 都落在 H，亦即 ⟨S⟩⊆H。這對每個候選 H 都成立，因此沒有更小的 stable candidate。</div></details><details><summary>Ch11 才會一般化 subgroup detector</summary><div>本頁知道母群是 ℤ₈，只觀察 seeds 強迫出的最小 subworld。如何對任意 subset 快速判斷是否為 subgroup、subgroups 彼此如何排列，會在 Ch11 另開主流程處理。</div></details></section>
    </article>
  `,
})
export class AlgebraV3ClosureWaveComponent {
  readonly prediction=signal<boolean|null>(null);readonly transfer=signal<boolean|null>(null);readonly seed=signal<2|3>(2);readonly stageIndex=signal(0);readonly residues=[0,1,2,3,4,5,6,7] as const;
  readonly stages=computed(()=>this.buildStages(this.seed()));readonly current=computed(()=>this.stages()[this.stageIndex()]);readonly visibleStages=computed(()=>this.stages().slice(0,this.stageIndex()+1));readonly stable=computed(()=>this.stageIndex()===this.stages().length-1);
  selectSeed(value:2|3){this.seed.set(value);this.stageIndex.set(0);}next(){this.stageIndex.update(index=>Math.min(this.stages().length-1,index+1));}finish(){this.stageIndex.set(this.stages().length-1);}
  included(value:number){return this.current().values.includes(value);}nodeStatus(value:number){if(!this.included(value))return 'outside';if(this.current().added===value)return this.current().rule;return value===this.seed()?'SEED':'included';}
  worldLabel(){return `模八中 seed ${this.seed()} 的 closure wave，目前包含 ${this.current().values.join('、')}`;}
  private buildStages(seed:number):ClosureStage[]{const values=new Set<number>([seed]);const stages:ClosureStage[]=[{values:[seed],added:seed,rule:'SEED',reason:`先要求 world 包含 seed ${seed}。`}];const add=(value:number,rule:ClosureStage['rule'],reason:string)=>{values.add(value);stages.push({values:[...values].sort((a,b)=>a-b),added:value,rule,reason});};if(!values.has(0))add(0,'IDENTITY','0 是 addition 的 universal no-op。');while(true){const sorted=[...values].sort((a,b)=>a-b);const missingInverse=sorted.find(value=>!values.has(((8-value)%8)));if(missingInverse!==undefined){const inverse=(8-missingInverse)%8;add(inverse,'INVERSE',`${inverse} 是 ${missingInverse} 的 additive inverse，兩者相加回到 0。`);continue;}let debt:{a:number;b:number;output:number}|null=null;for(const a of sorted){for(const b of sorted){const output=(a+b)%8;if(!values.has(output)){debt={a,b,output};break;}}if(debt)break;}if(debt){add(debt.output,'COMPOSITION',`${debt.a}+${debt.b}≡${debt.output} (mod 8)，合法 inputs 的 composite 也必須留在 world。`);continue;}break;}return stages;}
}
