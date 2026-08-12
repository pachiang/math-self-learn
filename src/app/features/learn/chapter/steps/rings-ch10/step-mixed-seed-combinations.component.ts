import { Component, computed, signal } from '@angular/core';
import {
  generatedResidues,
  mod,
  principalResidues,
  RESIDUE_MODULUS,
  residueCombination,
} from './rings-ch10-model';

@Component({
  selector: 'app-rings-ch10-mixed-seed-combinations',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 10.3</p>
        <h2>指定兩個 seeds 歸零，會強迫 mixed combinations 一起消失</h2>
        <p class="lede">把(4)與(6)各自標成future zero仍不夠：既然4與6都將代表0，它們跨region的difference也必須代表0。Union漏掉的card，正是相容性新增的collapse obligation。</p>
      </header>
      <span class="map-convention">PRE-QUOTIENT AUDIT · ℤ/12ℤ CASE · (4,6)=(2) IS NOT THE GENERAL DEFINITION</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>若4→0且6→0，card 10=4−6能否保持非零？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不能，10也被迫歸零</button><button type="button" (click)="prediction.set(true)">可以，10不在任一multiple cloud</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '若4與6都代表0，4−6必須和0−0相容。它不在任一cloud，正好揭露union漏了forced zero。' : '對。用這張mixed witness找出union的collapse缺口，再收集所有4r+6s。' }}</p> }
      </section>

      <div class="control-row">
        <button type="button" (click)="runWitness()">TRACE FORCED ZERO · 4−6</button>
        <span class="kicker">r={{ r() }}</span><button type="button" [disabled]="!witnessRun()" (click)="cycleR()">NEXT r</button>
        <span class="kicker">s={{ s() }}</span><button type="button" [disabled]="!witnessRun()" (click)="cycleS()">NEXT s</button>
        <button type="button" class="multiply" [disabled]="!witnessRun()" (click)="collectCurrent()">ADD ZERO OBLIGATION · 4r+6s</button>
        <button type="button" [disabled]="!witnessRun()" (click)="completeScan()">REVEAL ALL FORCED ZEROS</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="mixed-seed-lab">
          <section class="cloud-pair">
            <div class="seed-cloud zero-requested"><p class="kicker">MUST ZERO FROM 4 · (4)</p><div class="residue-list">@for (value of cloud4; track value) { <span>{{ value }}</span> }</div></div>
            <div class="union-mark">∪<small>SET UNION</small></div>
            <div class="seed-cloud zero-requested"><p class="kicker">MUST ZERO FROM 6 · (6)</p><div class="residue-list">@for (value of cloud6; track value) { <span>{{ value }}</span> }</div></div>
          </section>

          <section class="residue-rail" aria-label="mod 12 residue membership">
            @for (value of residues; track value) {
              <div class="residue-slot" [class.union-member]="inUnion(value)" [class.generated]="isCollected(value)" [class.witness]="witnessRun() && value===10">
                <strong>{{ value }}</strong>
                <small>{{ isCollected(value) ? 'MUST → 0 · 4r+6s' : inUnion(value) ? 'KNOWN → 0' : value===10 && witnessRun() ? 'FORCED · MISSING' : 'NOT YET FORCED' }}</small>
              </div>
            }
          </section>

          @if (!witnessRun()) {
            <section class="witness-route muted"><strong>4→0 and 6→0</strong><span>它們的difference必須去哪裡？</span></section>
          } @else {
            <section class="witness-route"><div><small>FUTURE ZERO</small><strong>4</strong></div><span>−</span><div><small>FUTURE ZERO</small><strong>6</strong></div><span>→</span><div class="escaped forced-zero"><strong>10 → 0</strong><small>FORCED · OUTSIDE UNION</small></div></section>
          }

          @if (witnessRun()) {
            <section class="combination-mixer" aria-live="polite">
              <div class="coefficient-box"><small>FORCED BY 4→0</small><strong>{{ r() }}·4</strong></div><span>+</span><div class="coefficient-box"><small>FORCED BY 6→0</small><strong>{{ s() }}·6</strong></div><span>→</span><div class="coefficient-box output forced-zero"><small>MUST ALSO → 0</small><strong>{{ currentOutput() }}</strong></div>
            </section>
          }
        </div>
        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ scanComplete() ? 'FINITE EXHAUSTION · ℤ/12ℤ' : witnessRun() ? 'WITNESS · UNION FAILURE' : 'PREDICTION · UNTESTED' }}</span>
          <h3>{{ scanComplete() ? 'SIX CARDS ARE FORCED TO ZERO' : witnessRun() ? 'UNION MISSES A FORCED ZERO' : 'TEST A MIXED PAIR' }}</h3>
          <p>{{ statusText() }}</p>
          <div class="readout">{{ witnessRun() ? '4r+6s = ' + currentOutput() + ' → 0 (mod 12)' : '(4)∪(6) = {0,4,6,8} · incomplete collapse plan' }}</div>
        </aside>
      </section>

      @if (scanComplete()) {
        <section class="transfer-strip"><div><p class="kicker">TRANSFER · ℤ</p><strong>request 6→0 and 10→0</strong><p>2是否也被迫歸零？</p></div><div class="choice-row"><button type="button" (click)="transferAnswer.set(true)">是，2·6−1·10=2</button><button type="button" (click)="transferAnswer.set(false)">否，2不是任一seed的multiple</button></div>@if (transferAnswer() !== null) { <p class="feedback" [class.warning]="!transferAnswer()">{{ transferAnswer() ? '對。多seed允許mixed coefficients；這是integer instance，不是一般gcd定義。' : '單獨不是任一seed的multiple，仍可能因mixed combination而被迫歸零。' }}</p> }</section>
      }

      <section class="insight"><span class="insight-icon">Σ→0</span><div><strong>指定多個 seeds 歸零，會強迫所有 mixed coefficient combinations 歸零</strong><span>各自的principal regions取union不夠；跨region的additive relation會新增不能拒絕的cards。</span></div></section>
      <details><summary>一般公式與 evidence 強度</summary><p>在commutative ring中，若a與b都要歸零，任何ra+sb都必須歸零，因此candidate是(a,b)=&#123;ra+sb:r,s∈R&#125;。一個witness已足以否決union；144組finite scan只列完目前ℤ/12ℤ instance。這個combination set通過ideal contract仍需要general coefficient argument。</p></details>
    </article>
  `,
})
export class RingsCh10MixedSeedCombinationsComponent {
  readonly residues = Array.from({ length: RESIDUE_MODULUS }, (_, value) => value);
  readonly cloud4 = principalResidues(4);
  readonly cloud6 = principalResidues(6);
  readonly union = [...new Set([...this.cloud4, ...this.cloud6])].sort((left, right) => left - right);
  readonly prediction = signal<boolean | null>(null);
  readonly witnessRun = signal(false);
  readonly r = signal(2);
  readonly s = signal(1);
  readonly collected = signal<number[]>([]);
  readonly transferAnswer = signal<boolean | null>(null);
  readonly currentOutput = computed(() => residueCombination(this.r(), this.s()));
  readonly scanComplete = computed(() => this.collected().length === generatedResidues().length);
  readonly statusText = computed(() => this.scanComplete()
    ? '144組coefficient pairs壓成六個distinct outputs：0,2,4,6,8,10；若4與6歸零，這六張都不能保持非零。這是目前case study的finite fact。'
    : this.witnessRun()
      ? '4−6=10不在union，卻必須跟0−0得到相同結果。現在用4r+6s補齊所有mixed collapse obligations。'
      : '兩塊principal zero regions各自安全，卻沒有替跨region的input pair提供相容性保證。');

  inUnion(value: number): boolean { return this.union.includes(value); }
  isCollected(value: number): boolean { return this.collected().includes(value); }
  runWitness(): void { this.witnessRun.set(true); }
  cycleR(): void { this.r.update(value => mod(value + 1, RESIDUE_MODULUS)); }
  cycleS(): void { this.s.update(value => mod(value + 1, RESIDUE_MODULUS)); }
  collectCurrent(): void {
    const output = this.currentOutput();
    if (!this.collected().includes(output)) this.collected.update(values => [...values, output].sort((left, right) => left - right));
  }
  completeScan(): void { this.collected.set(generatedResidues()); }
  reset(): void {
    this.prediction.set(null); this.witnessRun.set(false); this.r.set(2); this.s.set(1); this.collected.set([]); this.transferAnswer.set(null);
  }
}
