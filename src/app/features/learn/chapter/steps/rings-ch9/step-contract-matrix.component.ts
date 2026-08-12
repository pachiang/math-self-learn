import { Component, computed, signal } from '@angular/core';
import { ContractCell } from './rings-ch9-model';

type Candidate = 'D' | 'K';

@Component({
  selector: 'app-rings-ch9-contract-matrix',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 9.4</p><h2>兩種contracts形成二軸分類，不是一條強弱階梯</h2><p class="lede">R與C先固定both／neither兩個anchors。你只需根據已建立的evidence放入D與K；沒有哪個cell代表比較高級。</p></header>

      <section class="prediction"><div><p class="kicker">先拆掉階梯</p><h3>若排列成subset → subring → ideal，哪兩張已知cards會互相矛盾？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(true)">D與K會落在相反方向</button><button type="button" (click)="prediction.set(false)">不會矛盾</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="!prediction()">{{prediction()?'對。D是subring-only，K在本課是ideal-only；一條線放不下兩個方向。':'9.2與9.3已各自給出相反方向的counterexample。'}}</p>}</section>

      <div class="control-row"><span class="kicker">CANDIDATE</span><button type="button" [class.active]="candidate()==='D'" [disabled]="dPlaced()" (click)="candidate.set('D')">D · CONSTANTS</button><button type="button" [class.active]="candidate()==='K'" [disabled]="kPlaced()" (click)="candidate.set('K')">K · KERNEL</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="contract-matrix-lab">
          <div class="contract-matrix">
            <button type="button" class="matrix-cell" [class.active]="chosenCell()==='both'" (click)="place('both')"><span class="cell-scope">SUBRING ✓ · IDEAL ✓</span><div class="candidate-token anchor">R · ANCHOR</div></button>
            <button type="button" class="matrix-cell" [class.active]="chosenCell()==='subring-only'" (click)="place('subring-only')"><span class="cell-scope">SUBRING ✓ · IDEAL ×</span>@if(dPlaced()){<div class="candidate-token">D · CONSTANTS</div>}@else{<small>DROP SUBRING-ONLY HERE?</small>}</button>
            <button type="button" class="matrix-cell" [class.active]="chosenCell()==='ideal-only'" (click)="place('ideal-only')"><span class="cell-scope">SUBRING × · IDEAL ✓</span>@if(kPlaced()){<div class="candidate-token">K · KERNEL</div>}@else{<small>DROP IDEAL-ONLY HERE?</small>}</button>
            <button type="button" class="matrix-cell" [class.active]="chosenCell()==='neither'" (click)="place('neither')"><span class="cell-scope">SUBRING × · IDEAL ×</span><div class="candidate-token anchor">C · ANCHOR</div></button>
          </div>
          <aside class="matrix-drawer" aria-live="polite"><p class="kicker">ACTIVE EVIDENCE · {{candidate()}}</p><div class="axis-evidence" [class.pass]="candidate()==='D'" [class.fail]="candidate()==='K'"><strong>SUBRING CONTRACT · {{candidate()==='D'?'PASS':'FAIL'}}</strong><span>{{candidate()==='D'?'internal closure + same 1_R':'identity (1,1) lies outside K'}}</span></div><div class="axis-evidence" [class.fail]="candidate()==='D'" [class.pass]="candidate()==='K'"><strong>IDEAL CONTRACT · {{candidate()==='K'?'PASS':'FAIL'}}</strong><span>{{candidate()==='K'?'Ch8 ambient absorption':'witness (1,0)(2,2)=(2,0) escapes D'}}</span></div><div class="readout">{{feedback()}}</div>@if(complete()){<div class="ideal-nameplate">NO LINEAR RANKING</div>}</aside>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">CLASSIFICATION · ESTABLISHED EVIDENCE</span><h3>{{complete()?'TWO QUESTIONS · FOUR CELLS':'PLACE D AND K'}}</h3><p>{{complete()?'不要問哪個比較強；先選擇你真正需要的boundary behavior。':'每次只判斷active card；anchors不需要再次作答。'}}</p><div class="readout">internal autonomy + same 1  |  ambient stability</div></aside>
      </section>

      @if(complete()){<section class="transfer-match"><div><p class="kicker">TRANSFER A · ℤ⊂ℚ</p><strong>1/2·1=1/2∉ℤ</strong><div class="choice-row"><button type="button" (click)="transferA.set(true)">SUBRING-ONLY</button><button type="button" (click)="transferA.set(false)">IDEAL-ONLY</button></div>@if(transferA()!==null){<p class="feedback" [class.warning]="!transferA()">{{transferA()?'對；共用1且internal operations留在ℤ，但ambient rational可推出去。':'Ambient witness否決ideal，不是否決subring。'}}</p>}</div><div><p class="kicker">TRANSFER B · 2ℤ⊂ℤ</p><strong>r·2k=2(rk)，但1∉2ℤ</strong><div class="choice-row"><button type="button" (click)="transferB.set(true)">IDEAL-ONLY</button><button type="button" (click)="transferB.set(false)">SUBRING-ONLY</button></div>@if(transferB()!==null){<p class="feedback" [class.warning]="!transferB()">{{transferB()?'對，限本課same-identity convention。':'它通過ambient absorption，失敗的是subring identity gate。'}}</p>}</div></section>}
      <section class="insight"><span class="insight-icon">2×2</span><div><strong>不要問哪個比較強</strong><span>先問你要的是internal world，還是ambient-stable difference region。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · Ch10</strong><p>Ideal 是ambient-stable difference region；若指定一張seed未來必須算作0，這份contract還會強迫哪些cards一起歸零？</p></div>
    </article>
  `,
})
export class RingsCh9ContractMatrixComponent {
  readonly candidate = signal<Candidate>('D');
  readonly chosenCell = signal<ContractCell | null>(null);
  readonly dPlaced = signal(false);
  readonly kPlaced = signal(false);
  readonly feedback = signal('先替D選一個cell。');
  readonly prediction = signal<boolean | null>(null);
  readonly transferA = signal<boolean | null>(null);
  readonly transferB = signal<boolean | null>(null);
  readonly complete = computed(() => this.dPlaced() && this.kPlaced());
  place(cell: ContractCell): void {
    this.chosenCell.set(cell);
    const correct = this.candidate() === 'D' ? 'subring-only' : 'ideal-only';
    if (cell !== correct) { this.feedback.set(this.candidate() === 'D' ? 'D的ambient escape witness否決ideal；再找subring PASS、ideal FAIL的cell。' : 'K只缺same identity；再找subring FAIL、ideal PASS的cell。'); return; }
    if (this.candidate() === 'D') { this.dPlaced.set(true); this.feedback.set('D placed · 現在判斷K。'); this.candidate.set('K'); }
    else { this.kPlaced.set(true); this.feedback.set('K placed · 兩個方向都已建立。'); }
  }
  reset(): void { this.candidate.set('D'); this.chosenCell.set(null); this.dPlaced.set(false); this.kPlaced.set(false); this.feedback.set('先替D選一個cell。'); this.prediction.set(null); this.transferA.set(null); this.transferB.set(null); }
}
