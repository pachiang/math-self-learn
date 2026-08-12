import { Component, computed, signal } from '@angular/core';
import { KernelPair, pairLabel, subtractPairs } from './rings-ch8-model';

@Component({
  selector: 'app-rings-ch8-additive-stability',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 8.2</p><h2>看不見的 differences，相減後仍然看不見</h2><p class="lede">這和Ch6使用同一個difference operation，理由卻不同：kernel的穩定性來自map在target端把0−0仍送回0。</p></header>
      <span class="map-convention">CALLBACK · SAME OPERATION, NEW REASON</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>i=(0,1)、j=(0,3)都在ker(ev_A)。i−j會逃出kernel嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不會，仍在kernel</button><button type="button" (click)="prediction.set(true)">會逃出去</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'完整difference不一定是zero function，但target只會看到0−0。':'對。接著用source與target兩條routes說明一般原因。'}}</p>}</section>

      <div class="control-row"><span class="kicker">i(B)</span>@for(value of values;track value){<button type="button" [class.active]="iB()===value" (click)="setIB(value)">{{value}}</button>}<span class="kicker">j(B)</span>@for(value of values;track value){<button type="button" [class.active]="jB()===value" (click)="setJB(value)">{{value}}</button>}<button type="button" (click)="advance()">{{phase()<2?'STEP TWO ROUTES':'REPLAY'}}</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="kernel-difference-lab">
          <div class="kernel-shell"><div class="kernel-members"><section class="kernel-member"><span>INSIDE · i</span><strong>{{pairLabel(i())}}</strong><small>φ(i)=0</small></section><section class="kernel-member"><span>INSIDE · j</span><strong>{{pairLabel(j())}}</strong><small>φ(j)=0</small></section><section class="kernel-member output" [class.proof-stage]="phase()<1"><span>OUTPUT · i−j</span><strong>{{phase()>=1?pairLabel(difference()):'?'}}</strong><small>{{phase()>=1?'still a complete source function':'waiting for source route'}}</small></section></div></div>
          <div class="difference-port-large"><span>−</span><small>SOURCE DIFFERENCE</small></div>
          <div class="target-proof"><div class="proof-stage" [class.active]="phase()>=1"><strong>SOURCE ROUTE</strong><span>i−j={{pairLabel(difference())}}</span></div><div class="proof-stage" [class.active]="phase()>=2"><strong>TARGET ROUTE</strong><span>φ(i)−φ(j)=0−0=0</span></div><div class="target-dock zero" [class.active]="phase()>=2"><strong>0_S</strong></div></div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{phase()>=2?'GENERAL ARGUMENT':'EXAMPLE · STEP '+phase()}}</span><h3>{{phase()>=2?'DIFFERENCE STAYS INVISIBLE':'BUILD BOTH ROUTES'}}</h3><p>{{reading()}}</p><div class="readout">{{phase()>=2?'i,j∈kerφ ⇒ i−j∈kerφ':'source membership  ⇄  target reason'}}</div></aside>
      </section>

      @if(phase()>=2){<section class="assumption-card"><p class="kicker">BROKEN ASSUMPTION</p><strong>若j改成outside card (1,3)，哪個前提消失？</strong><div class="choice-row"><button type="button" (click)="challenge.set(true)">φ(j)=0不再成立</button><button type="button" (click)="challenge.set(false)">Difference operation失效</button></div>@if(challenge()!==null){<p class="feedback" [class.warning]="!challenge()">{{challenge()?'對。Theorem沒有被反駁；只是j∈kernel的前提已破壞。':'Difference仍可做，消失的是target route中的第二個0。'}}</p>}</section>}
      <section class="insight"><span class="insight-icon">−</span><div><strong>Kernel內的invisible differences可以再相減</strong><span>Target仍只看見0。</span></div></section>
      <details><summary>一般證明與additive subgroup</summary><p>若i,j∈kerφ，則<code>φ(i−j)=φ(i)−φ(j)=0−0=0</code>，所以i−j∈kerφ。Kernel非空且對subtraction closed，因此形成R的additive subgroup。</p></details>
    </article>
  `,
})
export class RingsCh8AdditiveStabilityComponent {
  readonly values = [0, 1, 2, 3] as const;
  readonly iB = signal(1);
  readonly jB = signal(3);
  readonly phase = signal(0);
  readonly prediction = signal<boolean | null>(null);
  readonly challenge = signal<boolean | null>(null);
  readonly i = computed<KernelPair>(() => [0, this.iB()]);
  readonly j = computed<KernelPair>(() => [0, this.jB()]);
  readonly difference = computed(() => subtractPairs(this.i(), this.j()));
  readonly reading = computed(() => this.phase() === 0 ? '先保留預測；兩條routes尚未展開。' : this.phase() === 1 ? `Source得到${pairLabel(this.difference())}，它不必是zero function。` : 'Target route對任意kernel inputs都固定為0−0，因此這不是有限sample巧合。');
  pairLabel = pairLabel;
  setIB(value: number): void { this.iB.set(value); this.phase.set(0); this.challenge.set(null); }
  setJB(value: number): void { this.jB.set(value); this.phase.set(0); this.challenge.set(null); }
  advance(): void { this.phase.update(phase => phase >= 2 ? 0 : phase + 1); if (this.phase() === 0) this.challenge.set(null); }
  reset(): void { this.iB.set(1); this.jB.set(3); this.phase.set(0); this.prediction.set(null); this.challenge.set(null); }
}
