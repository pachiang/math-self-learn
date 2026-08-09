import { Component, computed, signal } from '@angular/core';
import {
  D3_ELEMENTS,
  type D3Element,
  label,
} from '../algebra-v3-ch16/d3-model';
import { vertexAction } from './action-model';

@Component({
  selector: 'app-algebra-v3-action-translator',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch22-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 22.1</p><h2>Group action 是把 abstract actors 接到另一個 state world</h2><p class="lede">上一章讓 G 操作自己。現在把右側換成三角形的三個 vertices：群元素仍在左邊，但它們製造的是 <code>Sym(X)</code> 裡的 moves。</p></header>
      <section class="prediction"><p class="kicker">先預測</p><h3>只要替每個 g 隨便指定一個 vertex permutation，就一定是 group action 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不一定，乘法順序也要對得上</button><button type="button" (click)="prediction.set(true)">是，每張 card 可逆就夠</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'每張 card 可逆只保證落在 Sym(X)；還要讓 gh 對應到「先做 ρ(h)、再做 ρ(g)」的 composition。':'對。action 是一整份保持 multiplication 的翻譯字典。'}}</p>}</section>
      <section class="lab"><div class="lab-heading"><div><p class="kicker">Action translator</p><h3>選 actor g，再選一個不屬於 G 的 vertex x</h3></div><p>上方是 abstract group element；下方三角形才是被操作的 state world X。</p></div>
        <div class="translator-controls"><fieldset><legend>ACTOR g ∈ D₃</legend>@for(element of elements;track element){<button type="button" [attr.aria-pressed]="actor()===element" (click)="selectActor(element)">{{name(element)}}</button>}</fieldset><fieldset><legend>STATE x ∈ X</legend>@for(state of states;track state){<button type="button" [attr.aria-pressed]="probe()===state" (click)="selectProbe(state)">{{stateName(state)}}</button>}</fieldset></div>
        <div class="stage translator-stage"><section class="triangle-action"><div class="type-bridge"><span>D₃ actor <b>{{name(actor())}}</b></span><i>action dictionary</i><span>vertex permutation <b>{{signature()}}</b></span></div><svg viewBox="0 0 520 330" role="img" [attr.aria-label]="visualLabel()"><polygon points="260,40 445,275 75,275"/><path [attr.d]="motionPath()"/><g class="vertex" [class.selected]="probe()===0" [class.output]="applied()&&output()===0"><circle cx="260" cy="40" r="25"/><text x="260" y="47">▲</text></g><g class="vertex" [class.selected]="probe()===1" [class.output]="applied()&&output()===1"><circle cx="445" cy="275" r="25"/><text x="445" y="282">▶</text></g><g class="vertex" [class.selected]="probe()===2" [class.output]="applied()&&output()===2"><circle cx="75" cy="275" r="25"/><text x="75" y="282">◀</text></g></svg></section>
          <section class="action-console" aria-live="polite"><p class="kicker">TWO TYPES, ONE ACTION</p><div class="typed-input"><span>ACTOR</span><b>{{name(actor())}} ∈ D₃</b><span>STATE</span><b>{{stateName(probe())}} ∈ X</b></div><div class="action-result"><span>{{stateName(probe())}}</span><i>— {{name(actor())}} acts →</i><strong>{{applied()?stateName(output()):'?'}}</strong></div><button type="button" class="primary" [disabled]="applied()" (click)="applied.set(true)">執行 action</button><button type="button" (click)="applied.set(false)">重設 state</button></section></div>
      </section>
      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>g ∈ G</span><i>translated into</i><span>ρ(g) ∈ Sym(X)</span></div><p><strong>Group action 是一份 preserving-composition 的翻譯字典。</strong>它把 abstract multiplication 變成另一個世界 X 上可看見的 reversible moves。</p></aside>
      <section class="transfer"><p class="kicker">遷移</p><h3>同一個 D₃ 能不能改去操作「方向感」而不是 vertices？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">能，只要翻譯仍保持 composition</button><button type="button" (click)="transfer.set(false)">不能，一個群只能有一種 action</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="!transfer()">{{transfer()?'對。下一幕就把同一群接到三個不同 worlds。':'群固定的是 multiplication；它可以有許多不同 action dictionaries。'}}</p>}</section>
      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>正式定義</summary><div>一個 left action 是 map G×X→X，寫作 (g,x)↦g·x，滿足 e·x=x 與 (gh)·x=g·(h·x)。等價地，它是一個 homomorphism ρ:G→Sym(X)。</div></details></section>
    </article>
  `,
})
export class AlgebraV3ActionTranslatorComponent {
  readonly elements=D3_ELEMENTS; readonly states=[0,1,2]; readonly actor=signal<D3Element>(1); readonly probe=signal(0); readonly applied=signal(false); readonly prediction=signal<boolean|null>(null); readonly transfer=signal<boolean|null>(null);
  readonly output=computed(()=>vertexAction(this.actor(),this.probe())); readonly signature=computed(()=>this.states.map(state=>this.stateName(vertexAction(this.actor(),state))).join(' '));
  name=label; stateName(state:number):string{return ['▲','▶','◀'][state];} selectActor(actor:D3Element):void{this.actor.set(actor);this.applied.set(false);} selectProbe(state:number):void{this.probe.set(state);this.applied.set(false);}
  point(state:number):[number,number]{return [[260,40],[445,275],[75,275]][state] as [number,number];} motionPath():string{const[a,b]=[this.point(this.probe()),this.point(this.output())];return `M ${a[0]} ${a[1]} Q 260 165 ${b[0]} ${b[1]}`;} visualLabel():string{return `${label(this.actor())} sends vertex ${this.stateName(this.probe())} to ${this.stateName(this.output())}`;}
}
