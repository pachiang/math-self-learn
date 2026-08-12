import { Component, computed, signal } from '@angular/core';
import { CH15_RESIDUES, IDEAL_I, IDEAL_J, SHARED_KERNEL, address, addressLabel, difference, inIdeal, sameAddress } from './rings-ch15-model';

@Component({
  selector: 'app-rings-ch15-shared-blind-spot',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 15.2</p><h2>Paired reader 共同看不見的 differences，正是 I∩J</h2><p class="lede">任選 x、y。先看它們是否得到相同 paired address，再把 difference x−y 分別送進 I-view 與 J-view 的 zero gates；只有兩邊同時歸零，product address 才會 collision。</p></header>
      <span class="map-convention">SHARED BLIND SPOT · ker Φ = ker πᵢ ∩ ker πⱼ = I∩J</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>x=1、y=7 相差 6；哪一張 quotient view 看得見這個 difference？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set('neither')">兩邊都看不見</button><button type="button" (click)="prediction.set('one')">至少一邊看得見</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()==='one'">{{ prediction()==='neither' ? '6 同時屬於 (2) 與 (3)；用兩道 zero gate 驗證。' : 'Difference 是否為 ambient nonzero 不重要；要檢查它是否同時落進兩個 ideals。' }}</p> }</section>

      <div class="selector-stack"><div class="control-row"><span class="kicker">INPUT x</span>@for (value of residues; track value) { <button type="button" [class.active]="x()===value" (click)="selectX(value)">{{ value }}</button> }</div><div class="control-row"><span class="kicker">INPUT y</span>@for (value of residues; track value) { <button type="button" [class.active]="y()===value" (click)="selectY(value)">{{ value }}</button> }<button type="button" (click)="testDifference()">TEST SHARED DIFFERENCE</button><button type="button" (click)="tryContrast()">TRY ONE-VIEW COLLISION</button><button type="button" (click)="auditAll()">AUDIT ALL 144 PAIRS</button><button type="button" (click)="reset()">RESET</button></div></div>

      <section class="stage stage-grid"><div class="shared-blind-lab">
        <section class="pair-address-check"><div class="input-output-card"><small>INPUT x</small><strong>{{ x() }}</strong><span>Φ(x)={{ tested() ? addressText(x()) : '?' }}</span></div><div class="collision-indicator" [class.collision]="tested() && collides()"><small>PAIRED OUTPUT TEST</small><strong>{{ tested() ? (collides() ? 'SAME ADDRESS' : 'DIFFERENT ADDRESSES') : '?' }}</strong><span>{{ tested() ? (collides() ? 'collision' : 'separated') : 'waiting' }}</span></div><div class="input-output-card"><small>INPUT y</small><strong>{{ y() }}</strong><span>Φ(y)={{ tested() ? addressText(y()) : '?' }}</span></div></section>

        <section class="difference-core"><small>DIFFERENCE IN R</small><strong>x−y={{ diff() }}</strong><span>{{ x() }}−{{ y() }} mod 12</span></section>

        <section class="dual-zero-gates"><div class="zero-gate" [class.passed]="tested() && inI()" [class.blocked]="tested() && !inI()"><small>I=(2) ZERO GATE</small><strong>{{ tested() ? (inI() ? diff()+'∈I' : diff()+'∉I') : '?' }}</strong><span>πᵢ(x−y)={{ tested() ? diff()%2 : '?' }}</span></div><span class="intersection-symbol">∩</span><div class="zero-gate" [class.passed]="tested() && inJ()" [class.blocked]="tested() && !inJ()"><small>J=(3) ZERO GATE</small><strong>{{ tested() ? (inJ() ? diff()+'∈J' : diff()+'∉J') : '?' }}</strong><span>πⱼ(x−y)={{ tested() ? diff()%3 : '?' }}</span></div></section>

        <section class="blind-region-board"><div class="ideal-region i-region"><small>I={{ setI }}</small>@for (value of residues; track value) { <i [class.member]="isInI(value)" [class.shared]="(tested() || audited()) && isShared(value)">{{ value }}</i> }</div><div class="overlap-lens"><small>I∩J</small><strong>{{ tested() || audited() ? sharedSet : '?' }}</strong><span>{{ tested() ? (inI() && inJ() ? diff()+' lands here' : diff()+' stays outside overlap') : 'shared zero region' }}</span></div><div class="ideal-region j-region"><small>J={{ setJ }}</small>@for (value of residues; track value) { <i [class.member]="isInJ(value)" [class.shared]="(tested() || audited()) && isShared(value)">{{ value }}</i> }</div></section>

        <section class="kernel-equivalence" [class.verified]="tested()"><div><small>PAIRED COLLISION</small><strong>{{ tested() ? (collides() ? 'Φ(x)=Φ(y)' : 'Φ(x)≠Φ(y)') : '?' }}</strong></div><span>⇔</span><div><small>SHARED DIFFERENCE</small><strong>{{ tested() ? (inI() && inJ() ? 'x−y∈I∩J' : 'x−y∉I∩J') : '?' }}</strong></div></section>
      </div><aside class="console" aria-live="polite"><span class="evidence-badge">{{ audited() ? '144-PAIR EXHAUSTIVE AUDIT' : 'SHARED ZERO TEST' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">x−y={{ diff() }} · in I={{ tested() ? yesNo(inI()) : '?' }} · in J={{ tested() ? yesNo(inJ()) : '?' }} · ker Φ={{ sharedSet }}</div></aside></section>

      @if (audited()) { <section class="transfer-strip"><div><p class="kicker">FINITE AUDIT</p><strong>24 paired collisions · 24 intersection differences</strong></div><p>144 組 ordered pairs 全部吻合。Product map 的 zero 不需要新定義；它就是兩個 coordinate zeros 同時發生。</p></section> }
      <section class="insight"><span class="insight-icon">I∩J</span><div><strong>兩張 maps 都看不見時，difference 才會從 paired address 消失</strong><span>Intersection 是兩個 compression blind spots 的重疊，而不是把兩邊遺失的資訊相加；因此 ker Φ=I∩J=(6)。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 15.3</strong><p>知道 kernel 只能告訴我們 paired map 忘掉什麼；product grid 裡的每個 coordinate pair 都真的能被某張 ambient card 達到嗎？</p></div>
      <details><summary>正式層：為什麼 ker Φ=I∩J？</summary><p>x∈ker Φ iff Φ(x)=(0+I,0+J) iff x∈I and x∈J iff x∈I∩J。對任意 x,y，Φ(x)=Φ(y) iff x−y∈ker Φ，因此 paired collisions 也由同一 intersection 控制。</p></details>
    </article>
  `,
})
export class RingsCh15SharedBlindSpotComponent {
  readonly residues = CH15_RESIDUES;
  readonly setI = `{${IDEAL_I.join(',')}}`;
  readonly setJ = `{${IDEAL_J.join(',')}}`;
  readonly sharedSet = `{${SHARED_KERNEL.join(',')}}`;
  readonly x = signal(1);
  readonly y = signal(7);
  readonly tested = signal(false);
  readonly audited = signal(false);
  readonly prediction = signal<'neither' | 'one' | null>(null);
  readonly diff = computed(() => difference(this.x(), this.y()));
  readonly inI = computed(() => inIdeal(this.diff(), IDEAL_I));
  readonly inJ = computed(() => inIdeal(this.diff(), IDEAL_J));
  readonly collides = computed(() => sameAddress(this.x(), this.y()));
  readonly verdictTitle = computed(() => this.audited() ? 'ALL COLLISIONS ARE EXACTLY INTERSECTION DIFFERENCES' : !this.tested() ? 'SEND ONE DIFFERENCE THROUGH BOTH ZERO GATES' : this.collides() ? 'BOTH VIEWS MISS IT · PAIRED COLLISION' : this.inI() || this.inJ() ? 'ONE VIEW MISSES IT · THE OTHER STILL SEPARATES' : 'BOTH VIEWS SEE THE DIFFERENCE');
  readonly verdictReading = computed(() => this.audited() ? '每一組 same-address pair 都相差 0 或 6，反之亦然。' : !this.tested() ? '同一個 difference 必須同時通過 I 與 J，才會進入 product map 的 kernel。' : this.collides() ? `${this.diff()} 同時屬於 I 與 J，因此兩個 coordinates 都歸零。` : `${this.diff()} 沒有同時落進兩個 ideals，至少一張 view 仍能區分 x 與 y。`);

  addressText(value: number): string { return addressLabel(address(value)); }
  isInI(value: number): boolean { return inIdeal(value, IDEAL_I); }
  isInJ(value: number): boolean { return inIdeal(value, IDEAL_J); }
  isShared(value: number): boolean { return inIdeal(value, SHARED_KERNEL); }
  yesNo(value: boolean): string { return value ? 'YES' : 'NO'; }
  selectX(value: number): void { this.x.set(value); this.tested.set(false); }
  selectY(value: number): void { this.y.set(value); this.tested.set(false); }
  testDifference(): void { this.tested.set(true); }
  tryContrast(): void { this.x.set(1); this.y.set(3); this.tested.set(true); }
  auditAll(): void { this.tested.set(true); this.audited.set(true); }
  reset(): void { this.x.set(1); this.y.set(7); this.tested.set(false); this.audited.set(false); this.prediction.set(null); }
}
