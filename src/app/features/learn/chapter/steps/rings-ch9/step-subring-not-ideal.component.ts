import { Component, computed, signal } from '@angular/core';
import { KernelPair } from '../rings-ch8/rings-ch8-model';
import { isConstant, multiply, pairLabel } from './rings-ch9-model';

@Component({
  selector: 'app-rings-ch9-subring-not-ideal',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 9.2</p><h2>Constant functions 能在內部生活，卻擋不住外部 multiplier</h2><p class="lede">D中的inside×inside永遠仍是constant。Ideal test卻允許r從D外進來；一組完整escape witness就足以拆開兩份contracts。</p></header>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>D對internal product closed，能否保證任意ambient r乘c∈D後仍constant？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不能，outside input未受控制</button><button type="button" (click)="prediction.set(true)">能，multiplication closure已足夠</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'Internal closure只量化D內的兩個inputs；現在讓r從ambient outside進來。':'對。固定inside c，只改變input scope。'}}</p>}</section>

      <div class="control-row"><span class="kicker">AMBIENT r(A)</span>@for(value of values;track value){<button type="button" [class.active]="rA()===value" [disabled]="phase()<2" (click)="setR('A',value)">{{value}}</button>}<span class="kicker">r(B)</span>@for(value of values;track value){<button type="button" [class.active]="rB()===value" [disabled]="phase()<2" (click)="setR('B',value)">{{value}}</button>}<button type="button" (click)="advance()">{{phase()<2?'RUN AMBIENT WITNESS':'REPLAY WITNESS'}}</button>@if(transferUnlocked()){<button type="button" [class.active]="transfer()" (click)="transfer.set(!transfer())">{{transfer()?'BACK · FUNCTIONS':'TRANSFER · ℤ⊂ℚ'}}</button>}<button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="constant-witness-lab">
          <section><div class="seal-row"><div class="mini-seal">✓ DIFFERENCE</div><div class="mini-seal">✓ INTERNAL PRODUCT</div><div class="mini-seal">✓ SAME 1_R</div></div><div class="constant-boundary">@for(value of values;track value){<div class="constant-card" [class.selected]="value===2"><strong>({{value}}, {{value}})</strong><small>{{value===2?'inside c':'constant function'}}</small></div>}</div></section>
          <div><div class="scope-op">×</div>@if(phase()>=1){<div class="escape-route"></div>}</div>
          <section class="ambient-witness-stack" aria-live="polite">
            @if(!transfer()){
              <div class="role-card ambient"><span>AMBIENT r · {{isConstant(r())?'INSIDE D':'OUTSIDE D'}}</span><strong>{{pairLabel(r())}}</strong></div><div class="role-card inside"><span>INSIDE c</span><strong>(2, 2)</strong></div><div class="escape-product"><span>PRODUCT rc</span><strong>{{phase()>=1?pairLabel(product()):'?'}}</strong><small>{{phase()>=1?(productInside()?'IN D · this sample stays':'OUTSIDE D · ESCAPE WITNESS'):'waiting for operation'}}</small></div>
            }@else{
              <div class="role-card ambient"><span>AMBIENT ℚ</span><strong>r=1/2</strong></div><div class="role-card inside"><span>INSIDE ℤ</span><strong>c=1</strong></div><div class="escape-product"><strong>(1/2)·1=1/2∉ℤ</strong></div>
            }
          </section>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{phase()>=1&&!productInside()?'WITNESS · AMBIENT ESCAPE':'EXAMPLE · CURRENT INPUT'}}</span><h3>SUBRING ✓ · IDEAL {{witnessFound()?'×':'?'}}</h3><p>{{reading()}}</p><div class="readout">inside×inside PASS  does not control  ambient×inside</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">↗</span><div><strong>Internal product closure只管理inside×inside</strong><span>Boundary外的multiplier沒有簽這份合約。</span></div></section>
      <details><summary>D為什麼是subring，但不是ideal？</summary><p>Constant functions對pointwise subtraction與multiplication closed，並包含ambient identity (1,1)。但<code>(1,0)(2,2)=(2,0)</code>不是constant，所以一個ambient witness已否決absorption。</p></details>
    </article>
  `,
})
export class RingsCh9SubringNotIdealComponent {
  readonly values = [0, 1, 2, 3] as const;
  readonly rA = signal(1);
  readonly rB = signal(0);
  readonly phase = signal(0);
  readonly witnessFound = signal(false);
  readonly transferUnlocked = computed(() => this.witnessFound());
  readonly transfer = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly r = computed<KernelPair>(() => [this.rA(), this.rB()]);
  readonly c: KernelPair = [2, 2];
  readonly product = computed(() => multiply(this.r(), this.c));
  readonly productInside = computed(() => isConstant(this.product()));
  readonly reading = computed(() => this.phase() === 0 ? 'D的subring evidence已保留；現在只新增ambient input。' : this.productInside() ? '這一組r碰巧讓product留在D，但先前escape witness仍然有效。' : `${pairLabel(this.r())}·(2,2)=${pairLabel(this.product())}逃出constant boundary。`);
  pairLabel = pairLabel;
  isConstant = isConstant;
  advance(): void { if (this.phase() >= 2) { this.phase.set(0); this.rA.set(1); this.rB.set(0); return; } this.phase.update(value => value + 1); if (this.phase() >= 1 && !this.productInside()) this.witnessFound.set(true); }
  setR(lane: 'A'|'B', value: number): void { lane === 'A' ? this.rA.set(value) : this.rB.set(value); if (this.phase() >= 1 && !isConstant(multiply(this.r(), this.c))) this.witnessFound.set(true); }
  reset(): void { this.rA.set(1); this.rB.set(0); this.phase.set(0); this.witnessFound.set(false); this.transfer.set(false); this.prediction.set(null); }
}
