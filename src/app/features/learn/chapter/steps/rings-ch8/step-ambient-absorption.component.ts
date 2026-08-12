import { Component, computed, signal } from '@angular/core';
import { isZeroPair, KernelPair, multiplyPairs, pairLabel } from './rings-ch8-model';

@Component({
  selector: 'app-rings-ch8-ambient-absorption',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 8.3</p><h2>Ambient multiplier 可以來自外面；product 仍留在看不見區域</h2><p class="lede">吸收性（absorption）不是把source product變成0。它要求任意r∈R作用於kernel element i後，product仍被map看成0。</p></header>
      <span class="map-convention">COURSE SCOPE · COMMUTATIVE RINGS</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>r=(2,3)在kernel外、i=(0,1)在kernel內。ri會逃出、變成0_R，還是成為另一張nonzero kernel card？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set('inside')">nonzero，但仍在kernel</button><button type="button" (click)="prediction.set('zero')">必定等於0_R</button><button type="button" (click)="prediction.set('escape')">逃出kernel</button></div>@if(prediction()){<p class="feedback" [class.warning]="prediction()!=='inside'">{{prediction()==='inside'?'對。預設product是(0,3)，membership與literal zero必須分開判斷。':'Kernel吸收ambient action，不等於每次都annihilate product。'}}</p>}</section>

      <div class="control-row"><span class="kicker">AMBIENT r(A)</span>@for(value of values;track value){<button type="button" [class.active]="rA()===value" (click)="setR('A',value)">{{value}}</button>}<span class="kicker">r(B)</span>@for(value of values;track value){<button type="button" [class.active]="rB()===value" (click)="setR('B',value)">{{value}}</button>}<button type="button" (click)="advance()">{{phase()<2?'STEP PRODUCT ROUTE':'REPLAY'}}</button>@if(transferUnlocked()){<button type="button" [class.active]="transfer()" (click)="toggleTransfer()">{{transfer()?'BACK · ev_A':'TRANSFER · q MOD 6'}}</button>}<button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="absorption-lab">
          <section class="ambient-zone">
            @if(!transfer()){
              <div class="role-card ambient"><span>ANY AMBIENT r · {{r()[0]===0?'INSIDE KERNEL':'OUTSIDE KERNEL'}}</span><strong>{{pairLabel(r())}}</strong></div>
              <div class="kernel-shell"><div class="role-card inside"><span>FIXED i · INSIDE KERNEL</span><strong>(0, 1)</strong><small>φ(i)=0</small></div></div>
            }@else{
              <div class="role-card ambient"><span>ANY AMBIENT r</span><strong>5</strong></div><div class="kernel-shell"><div class="role-card inside"><span>FIXED i · IN 6ℤ</span><strong>6</strong><small>q(6)=[0]₆</small></div></div>
            }
          </section>
          <div class="ambient-action-port"><span>×</span><small>AMBIENT ACTION</small></div>
          <section class="product-zone">
            <div class="kernel-shell"><div class="role-card product"><span>NEW PRODUCT ri</span><strong>{{phase()>=1?productLabel():'?'}}</strong><small>{{phase()>=1?'product card generated; r stays ambient':'waiting for multiplication'}}</small></div></div>
            <div class="dual-status"><div class="semantic-status" [class.true]="phase()>=1">{{phase()>=1?'✓ PRODUCT IN KERNEL':'? PRODUCT IN KERNEL'}}</div><div class="semantic-status" [class.true]="phase()>=1&&productIsZero()" [class.false]="phase()>=1&&!productIsZero()">{{phase()<1?'? PRODUCT = 0_R':productIsZero()?'✓ PRODUCT = 0_R':'× PRODUCT ≠ 0_R'}}</div></div>
            <div class="target-zero-reason" [class.proof-stage]="phase()<2">{{phase()>=2?targetReason():'φ(ri) = ?'}}</div>
          </section>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{phase()>=2?'GENERAL ARGUMENT':'EXAMPLE · STEP '+phase()}}</span><h3>{{phase()>=1?productLabel():'AMBIENT ACTION READY'}}</h3><p>{{reading()}}</p><div class="readout">{{phase()>=2?'r∈R, i∈kerφ ⇒ ri∈kerφ':'ambient r × invisible i → ?'}}</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">R·I</span><div><strong>Ideal absorption不是把product乘成source 0</strong><span>任意ambient action都無法把invisible difference推出boundary。</span></div></section>
      <details><summary>一般證明與noncommutative邊界</summary><p><code>φ(ri)=φ(r)φ(i)=φ(r)·0_S=0_S</code>，所以ri∈kerφ。主線ring是commutative；一般noncommutative ring會區分left、right與two-sided ideals，本頁不增加order controls。</p></details>
    </article>
  `,
})
export class RingsCh8AmbientAbsorptionComponent {
  readonly values = [0, 1, 2, 3] as const;
  readonly rA = signal(2);
  readonly rB = signal(3);
  readonly phase = signal(0);
  readonly transfer = signal(false);
  readonly transferUnlocked = signal(false);
  readonly prediction = signal<'inside' | 'zero' | 'escape' | null>(null);
  readonly i: KernelPair = [0, 1];
  readonly r = computed<KernelPair>(() => [this.rA(), this.rB()]);
  readonly product = computed(() => multiplyPairs(this.r(), this.i));
  readonly productIsZero = computed(() => this.transfer() ? false : isZeroPair(this.product()));
  readonly productLabel = computed(() => this.transfer() ? '5·6 = 30 ≠ 0_ℤ' : `${pairLabel(this.product())}${isZeroPair(this.product()) ? ' = 0_R' : ' ≠ 0_R'}`);
  readonly targetReason = computed(() => this.transfer() ? 'q(30)=[0]₆ because 30∈6ℤ' : `φ(ri)=φ(r)·φ(i)=${this.rA()}·0=0`);
  readonly reading = computed(() => this.phase() === 0 ? 'Multiplier r可以位於kernel外；i固定在kernel內。' : this.phase() === 1 ? `${this.productLabel()}，但它仍落在kernel boundary。` : 'Target route含有factor 0_S；這個reason涵蓋每個ambient r。');
  pairLabel = pairLabel;
  setR(lane: 'A' | 'B', value: number): void { lane === 'A' ? this.rA.set(value) : this.rB.set(value); this.phase.set(0); this.transfer.set(false); }
  advance(): void { this.phase.update(phase => phase >= 2 ? 0 : phase + 1); if (this.phase() === 2) this.transferUnlocked.set(true); }
  toggleTransfer(): void { this.transfer.update(value => !value); this.phase.set(0); }
  reset(): void { this.rA.set(2); this.rB.set(3); this.phase.set(0); this.transfer.set(false); this.transferUnlocked.set(false); this.prediction.set(null); }
}
