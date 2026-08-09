import { Component, computed, signal } from '@angular/core';

interface ReachabilityResult { reached: readonly number[]; witnesses: ReadonlyMap<number, readonly number[]>; }

@Component({
  selector: 'app-algebra-v3-generating-set-mixer',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch7-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 7.2</p><h2>按鈕多不等於走得遠；要看它們能否補足彼此</h2><p class="lede">同一個 ℤ₆ world 裡，一顆 <code>+1</code> 已能走遍；兩顆 <code>+2</code>、<code>+4</code> 卻仍困在 even residues。Generating set 的能力是 connectivity，不是按鈕數量。</p></header>

      <section class="prediction"><p class="kicker">先拒絕數量直覺</p><h3>兩顆 buttons <code>{{'{+2,+4}'}}</code> 一定比單獨 <code>{{'{+1}'}}</code> 能抵達更多 ℤ₆ elements 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不一定</button><button type="button" (click)="prediction.set(true)">一定</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'2 與 4 的任何整數組合仍是 even；兩顆 buttons 共享同一個盲點。':'對。+2 與 +4 只能到 0、2、4；單獨 +1 就能到齊六點。'}}</p>}</section>

      <section class="lab">
        <div class="lab-heading"><div><p class="kicker">Generating-set mixer</p><h3>切換基本 moves，系統即時尋找 shortest witness word</h3></div><p>每顆 button 都可重複，inverse 也自動允許。每個已抵達 tile 會顯示一條實際 path；因此「生成」不是由高亮宣告，而是有可回放的 witness。</p></div>
        <div class="move-mixer" role="group" aria-label="切換模六加法的 generating set">@for(move of availableMoves;track move){<button type="button" [attr.aria-pressed]="selectedMoves().includes(move)" (click)="toggle(move)">允許 +{{move}} <small>（含 −{{move}}）</small></button>}</div>
        <div class="control-row"><button type="button" (click)="usePreset([1])">preset {{'{+1}'}}</button><button type="button" (click)="usePreset([2])">preset {{'{+2}'}}</button><button type="button" class="primary" (click)="usePreset([2,3])">preset {{'{+2,+3}'}}</button><button type="button" (click)="usePreset([])">清空 vocabulary</button></div>

        <div class="stage coverage-stage">
          <div class="residue-ring" aria-label="模六 residues 的可達狀態">@for(value of residues;track value){<div class="residue-tile" [class.reached]="isReached(value)"><strong>{{isReached(value)?'✓':'×'}} {{value}}</strong><span>{{isReached(value)?'witness: '+witness(value):'UNREACHABLE with current buttons'}}</span></div>}</div>
          <section class="coverage-console" aria-live="polite"><p class="kicker">CURRENT VOCABULARY</p><h4>{{setLabel()}}</h4><div class="button-equation">reachable = {{'{'}}{{result().reached.join(', ')}}{{'}'}}</div><p>{{coverageReading()}}</p><div class="reach-verdict">{{result().reached.length===6?'✓ GENERATING SET — coverage 6 / 6':'○ PARTIAL COVERAGE — '+result().reached.length+' / 6 nodes'}}</div></section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>button count</span><i>≠</i><span>coverage</span><i>but</i><span>joint connectivity</span></div><p><strong>一組 generators 的價值，在於它們共同消除哪些不可達區域。</strong>多顆 moves 若保留同一個 invariant，仍會一起受困；一顆 move 若連通全圖，已經足夠。</p></aside>

      <section class="transfer"><p class="kicker">Triangle symmetry world</p><h3>只用 rotations 能生成包含 reflections 的全部六個 symmetries 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(false)">不能</button><button type="button" (click)="transfer.set(true)">能</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="transfer()">{{transfer()?'rotations 的 composites 仍是 rotations；這個 vocabulary 保留 orientation，永遠碰不到 reflection nodes。':'對。需要再加入至少一個 reflection move；rotation 與 reflection 合用才連通六個 effects。'}}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Generating set 的正式讀法</summary><div>若 ⟨S⟩=G，稱 S generates G，也稱 S 是 G 的 generating set。這只表示 S 的 finite words 覆蓋 G；同一個 G 可以有許多不同 generating sets。</div></details><details><summary>Proof Lab：為什麼 {{'{2,3}'}} 生成 ℤ₆？</summary><div>本頁 shortest witnesses 已逐點給出：0=ε、2=+2、3=+3、4=+2+2、1=+3−2、5=+2+3。六個 residues 都有一條由 ±2、±3 組成的 path，因此 coverage 是全部 ℤ₆。</div></details><details><summary>Minimal 不等於 minimum</summary><div>若移除 S 中任一 element 都不再生成 G，S 稱 inclusion-minimal generating set；這不自動保證它在所有 generating sets 中 cardinality 最小。本章不需要記這個區分，只避免把「多一顆」當成能力排序。</div></details></section>
    </article>
  `,
})
export class AlgebraV3GeneratingSetMixerComponent {
  readonly prediction=signal<boolean|null>(null);readonly transfer=signal<boolean|null>(null);readonly selectedMoves=signal<readonly number[]>([2]);readonly availableMoves=[1,2,3] as const;readonly residues=[0,1,2,3,4,5] as const;
  readonly result=computed(()=>this.computeReachability(this.selectedMoves()));
  readonly setLabel=computed(()=>this.selectedMoves().length?`S = {${this.selectedMoves().map(value=>`+${value}`).join(', ')}} and inverses`:'S = ∅ · no moves allowed');
  readonly coverageReading=computed(()=>{const count=this.result().reached.length;if(count===6)return '每個 residue 都有 witness path；這組 buttons 共同連通整個 world。';if(count===1)return '只有 empty word，因而只能停在 identity 0。';return `仍有 ${6-count} 個 residues 沒有任何合法 word 能抵達；重複再多次也不會改變。`;});
  toggle(move:number){this.selectedMoves.update(values=>values.includes(move)?values.filter(value=>value!==move):[...values,move].sort());}
  usePreset(moves:readonly number[]){this.selectedMoves.set([...moves]);}
  isReached(value:number){return this.result().reached.includes(value);}
  witness(value:number){const path=this.result().witnesses.get(value)??[];return path.length?path.map(step=>step>0?`+${step}`:`−${Math.abs(step)}`).join(' '):'ε (empty word)';}
  private computeReachability(moves:readonly number[]):ReachabilityResult{const witnesses=new Map<number,readonly number[]>([[0,[]]]);const queue=[0];while(queue.length){const current=queue.shift()!;const path=witnesses.get(current)!;for(const move of moves){for(const step of [move,-move]){const target=((current+step)%6+6)%6;if(!witnesses.has(target)){witnesses.set(target,[...path,step]);queue.push(target);}}}}return {reached:[...witnesses.keys()].sort((a,b)=>a-b),witnesses};}
}
