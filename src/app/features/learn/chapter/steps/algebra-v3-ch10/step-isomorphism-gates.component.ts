import { Component, computed, signal } from '@angular/core';

type Diagnostic = 'iso' | 'projection' | 'scrambled';

@Component({
  selector: 'app-algebra-v3-isomorphism-gates',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch10-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 10.3</p><h2>同構是一條可逆、無損、而且保運算的翻譯通道</h2><p class="lede">前兩頁刻意只測一件事。現在把條件接成三道 gate：不撞車、不漏 target、每個 operation square 都 commute。三道都過，才能在兩個 groups 間來回翻譯完整結構。</p></header>
      <section class="prediction"><p class="kicker">診斷題</p><h3>一個 surjective homomorphism 已足以成為 isomorphism 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">還不夠</button><button type="button" (click)="prediction.set(true)">足夠</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'它仍可能把多個 source 合併；projection preset 就是具體反例。':'對。還要 injective，才能讓翻譯可逆且不丟失 element identity。'}}</p>}</section>
      <section class="lab">
        <div class="lab-heading"><div><p class="kicker">Three-gate diagnostic</p><h3>逐道打開 map 的檢查報告</h3></div><p>先選 map，再按 reveal。每道 gate 都附具體 evidence，避免只背「bijective homomorphism」這串詞。</p></div>
        <div class="mode-picker" role="group" aria-label="選擇待診斷的 map"><button type="button" [attr.aria-pressed]="mode()==='iso'" (click)="select('iso')">ℤ₄ → roots</button><button type="button" [attr.aria-pressed]="mode()==='projection'" (click)="select('projection')">ℤ₄ → ℤ₂ projection</button><button type="button" [attr.aria-pressed]="mode()==='scrambled'" (click)="select('scrambled')">Scrambled ℤ₄</button></div>
        <div class="stage gate-layout">
          <div class="gate-map" aria-label="目前 map 的配對">
            @for (source of [0,1,2,3]; track source) {<div><span>{{source}}</span><b>→</b><span>{{targetLabel(source)}}</span></div>}
          </div>
          <div class="gate-list">
            @for (gate of gates(); track gate.name; let index=$index) {
              <div class="gate-item" [class.hidden-gate]="revealed()<=index" [class.pass]="gate.pass" [class.fail]="!gate.pass">
                <span>{{revealed()>index ? (gate.pass?'PASS':'FAIL') : 'LOCKED'}}</span><strong>{{gate.name}}</strong><small>{{revealed()>index ? gate.evidence : '按 reveal 才顯示 evidence'}}</small>
              </div>
            }
            <div class="control-row"><button type="button" class="primary" [disabled]="revealed()===3" (click)="revealNext()">Reveal next gate</button><button type="button" (click)="revealed.set(0)">重設</button></div>
            @if(revealed()===3){<div class="isomorphism-verdict" [class.fail]="!isIsomorphism()">{{isIsomorphism()?'✓ ISOMORPHISM · 可雙向搬運完整 group structure':'× NOT AN ISOMORPHISM · 翻譯在至少一道 gate 失真'}}</div>}
          </div>
        </div>
      </section>
      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>no collision</span><i>+</i><span>no omission</span><i>+</i><span>operation kept</span></div><p><strong>Isomorphism 的本質是可逆的結構翻譯。</strong>兩邊的材質、符號與故事都能不同；只要每個 element 與每條 operation 關係都能無損來回，它們就是同一種 group structure。</p></aside>
      <section class="transfer"><p class="kicker">語言壓縮</p><h3>「Bijective homomorphism」壓縮了哪三個可觀察條件？</h3><div class="transfer-answer"><span>injective → 不合併</span><span>surjective → 不遺漏</span><span>homomorphism → 不改運算</span></div></section>
      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Isomorphism 的正式定義</summary><div>若 φ:G→H 同時是 homomorphism 與 bijection，稱 φ 為 isomorphism，並寫 G≅H。其 inverse φ⁻¹ 也會是 homomorphism。</div></details><details><summary>三個 presets 的失敗原因</summary><div>Projection k↦k mod 2 保運算且覆蓋 ℤ₂，卻把 0/2 與 1/3 合併。Scrambled map 是 bijection，卻不保加法。Natural map 三關全過。</div></details><details><summary>為什麼 inverse 也保運算？</summary><div>對 x=φ(a)、y=φ(b)，φ⁻¹(xy)=φ⁻¹(φ(a)φ(b))=φ⁻¹(φ(ab))=ab=φ⁻¹(x)φ⁻¹(y)。</div></details></section>
    </article>
  `,
})
export class AlgebraV3IsomorphismGatesComponent {
  readonly prediction=signal<boolean|null>(null);
  readonly mode=signal<Diagnostic>('iso');
  readonly revealed=signal(0);
  readonly config=computed(()=>({
    iso:{map:[0,1,2,3],targets:4,label:['1','i','−1','−i']},
    projection:{map:[0,1,0,1],targets:2,label:['0','1']},
    scrambled:{map:[0,1,3,2],targets:4,label:['0','1','2','3']},
  })[this.mode()]);
  readonly injective=computed(()=>new Set(this.config().map).size===4);
  readonly surjective=computed(()=>new Set(this.config().map).size===this.config().targets);
  readonly operationKept=computed(()=>[0,1,2,3].every(a=>[0,1,2,3].every(b=>this.config().map[(a+b)%4]===(this.config().map[a]+this.config().map[b])%this.config().targets)));
  readonly isIsomorphism=computed(()=>this.injective()&&this.surjective()&&this.operationKept());
  readonly gates=computed(()=>[
    {name:'INJECTIVE · 不撞車',pass:this.injective(),evidence:this.injective()?'4 個 sources 落在 4 個不同 targets':'0 與 2、1 與 3 各自撞到同一 target'},
    {name:'SURJECTIVE · 不漏站',pass:this.surjective(),evidence:`target 的 ${this.config().targets} 個 elements 都被命中`},
    {name:'HOMOMORPHISM · 保運算',pass:this.operationKept(),evidence:this.operationKept()?'所有 input pairs 的兩條路都同終點':'例如 1+1 的翻譯與翻譯後相加不同'},
  ]);
  select(mode:Diagnostic):void{this.mode.set(mode);this.revealed.set(0);}
  revealNext():void{this.revealed.update(value=>Math.min(3,value+1));}
  targetLabel(source:number):string{return this.config().label[this.config().map[source]];}
}
