import { Component, computed, signal } from '@angular/core';

type LaneId = 'a' | 'b';
type Move = 1 | 2 | -1;

@Component({
  selector: 'app-algebra-v3-word-effect-evaluator',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch7-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 7.3</p><h2>Word 保存走法；element 只保存總 effect</h2><p class="lede">兩條 action histories 可以長度不同、chips 不同，最後卻落在同一個 node。群元素比較的是 whole-world action 的總效果，不是產生它的路徑履歷。</p></header>

      <section class="prediction"><p class="kicker">先分清「相同」在哪一層</p><h3>在 ℤ₆ 中，六次 <code>+1</code> 與 empty word 是相同的 word 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">words 不同，effect 相同</button><button type="button" (click)="prediction.set(true)">完全相同</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'一條有六個 chips，一條沒有 chip；它們只在 evaluation 後同落到 0。':'對。歷史不同，但 1+1+1+1+1+1 ≡ 0 (mod 6)，兩者代表同一 group element。'}}</p>}</section>

      <section class="lab">
        <div class="lab-heading"><div><p class="kicker">Two-word evaluator</p><h3>分別編輯兩條 paths，再比較 effect docks</h3></div><p>先選正在編輯的 lane，再追加 action chips。每條 lane 都保留 prefix path；右側只把最後 endpoint 投影成 group element。</p></div>
        <div class="lane-tabs" role="group" aria-label="選擇要編輯的 action word"><button type="button" [attr.aria-pressed]="editing()==='a'" (click)="editing.set('a')">編輯 WORD A</button><button type="button" [attr.aria-pressed]="editing()==='b'" (click)="editing.set('b')">編輯 WORD B</button></div>
        <div class="control-row"><button type="button" class="primary" (click)="append(1)">追加 +1</button><button type="button" (click)="append(2)">追加 +2</button><button type="button" (click)="append(-1)">追加 −1</button><button type="button" (click)="removeLast()" [disabled]="activeWord().length===0">移除最後一步</button><button type="button" (click)="clearActive()" [disabled]="activeWord().length===0">清空此 word</button></div>
        <div class="control-row"><button type="button" (click)="loadPreset('loop')">preset：六次 +1 vs ε</button><button type="button" (click)="loadPreset('shortcut')">preset：+2−1 vs +1</button><button type="button" (click)="loadPreset('different')">preset：同起點、不同 effect</button></div>

        <div class="stage word-editor">
          <div class="word-lanes">
            <section class="word-lane" [class.editing]="editing()==='a'"><strong>WORD A</strong><div class="word-chips">@for(move of wordA();track $index){<span class="word-chip">{{moveLabel(move)}}</span>}@if(wordA().length===0){<span class="word-chip">ε · empty</span>}</div><b>→ {{effectA()}}</b><div class="word-path">path: {{pathLabel(wordA())}}</div></section>
            <section class="word-lane" [class.editing]="editing()==='b'"><strong>WORD B</strong><div class="word-chips">@for(move of wordB();track $index){<span class="word-chip">{{moveLabel(move)}}</span>}@if(wordB().length===0){<span class="word-chip">ε · empty</span>}</div><b>→ {{effectB()}}</b><div class="word-path">path: {{pathLabel(wordB())}}</div></section>
          </div>
          <section class="effect-dock" aria-live="polite"><p class="kicker">EFFECT DOCK · ℤ₆</p><div class="effect-slots">@for(value of residues;track value){<div class="effect-slot" [class.a]="effectA()===value" [class.b]="effectB()===value" [class.both]="effectA()===value&&effectB()===value"><strong>{{value}}</strong><span>{{dockLabel(value)}}</span></div>}</div><div class="effect-verdict">{{sameEffect()?'✓ SAME EFFECT — two words evaluate to one element':'≠ DIFFERENT EFFECTS — endpoints remain distinct'}}</div><p>{{comparisonReading()}}</p></section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>word = path</span><i>evaluate</i><span>element = effect</span><i>many → one</i><span>same endpoint</span></div><p><strong>Evaluation 會忘掉不影響總 action 的歷史細節。</strong>不同 words 可以代表同一 element；下一章的 relation，正是用來說明哪些 path differences 不改變 effect。</p></aside>

      <section class="transfer"><p class="kicker">回到 geometric action</p><h3><code>r r r</code> 與 empty word 在 triangle symmetry group 代表同一 element 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">同一 effect</button><button type="button" (click)="transfer.set(false)">不同 effect</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="!transfer()">{{transfer()?'對。三次 120° rotation 的總 transformation 對每個 state 都不動，因此 evaluation 是 e。':'執行歷史不同，但 group equality 比較 whole-world mapping；r³ 與 e 的 mapping 相同。'}}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Word evaluation 的正式版本</summary><div>給定 generating set S，由 S 與 formal inverse symbols S⁻¹ 排成的 finite string 稱為 word。把 symbols 依群運算解讀，得到 evaluation map：words → G。這個 map 通常不是 injective，因為多個 words 可得到同一 element。</div></details><details><summary>Empty word 為什麼對應 identity？</summary><div>Empty word ε 沒有 action chips，evaluation 是不改變任何 state 的 composite，也就是 e。它與 nonempty loops 可以代表同一 element，但仍是不同字串。</div></details><details><summary>邊界：何時 path history 不能丟？</summary><div>Group element 只編碼 net action。若問題在乎時間、能量、步數或途經位置，就必須把 path cost 或 history 當成額外資料；不能期待 element 自己保留它們。</div></details></section>
    </article>
  `,
})
export class AlgebraV3WordEffectEvaluatorComponent {
  readonly prediction=signal<boolean|null>(null);readonly transfer=signal<boolean|null>(null);readonly editing=signal<LaneId>('a');readonly wordA=signal<readonly Move[]>([1,1,1,1,1,1]);readonly wordB=signal<readonly Move[]>([]);readonly residues=[0,1,2,3,4,5] as const;
  readonly effectA=computed(()=>this.effect(this.wordA()));readonly effectB=computed(()=>this.effect(this.wordB()));readonly sameEffect=computed(()=>this.effectA()===this.effectB());
  readonly comparisonReading=computed(()=>this.sameEffect()?`A 有 ${this.wordA().length} steps，B 有 ${this.wordB().length} steps；history 不同，但 endpoint 都是 ${this.effectA()}。`:`A 落在 ${this.effectA()}，B 落在 ${this.effectB()}；此刻連總 effect 也不同。`);
  activeWord(){return this.editing()==='a'?this.wordA():this.wordB();}
  append(move:Move){this.updateActive(word=>[...word,move]);} removeLast(){this.updateActive(word=>word.slice(0,-1));} clearActive(){this.updateActive(()=>[]);}
  loadPreset(preset:'loop'|'shortcut'|'different'){if(preset==='loop'){this.wordA.set([1,1,1,1,1,1]);this.wordB.set([]);}else if(preset==='shortcut'){this.wordA.set([2,-1]);this.wordB.set([1]);}else{this.wordA.set([2,2]);this.wordB.set([1,1]);}this.editing.set('a');}
  effect(word:readonly Move[]){return ((word.reduce((sum,move)=>sum+move,0)%6)+6)%6;}
  pathLabel(word:readonly Move[]){const values=[0];for(const move of word)values.push(((values.at(-1)!+move)%6+6)%6);return values.join(' → ');}
  moveLabel(move:Move){return move>0?`+${move}`:`−${Math.abs(move)}`;}
  dockLabel(value:number){const a=this.effectA()===value;const b=this.effectB()===value;return a&&b?'A + B':a?'A endpoint':b?'B endpoint':'empty';}
  private updateActive(update:(word:readonly Move[])=>readonly Move[]){if(this.editing()==='a')this.wordA.update(update);else this.wordB.update(update);}
}
