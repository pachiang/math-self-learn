import { Component, computed, signal } from '@angular/core';
import { allPairs, Pair, pairLabel } from '../rings-ch10/rings-ch10-model';
import { containsPair } from '../rings-ch12/rings-ch12-model';
import {
  candidateMembers,
  enlargementAudit,
  generatedEnlargement,
  growthDestination,
  idealIsMaximal,
  MaximalCandidateId,
  pairSetLabel,
} from './rings-ch16-model';

@Component({
  selector: 'app-rings-ch16-maximal-growth-audit',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch16-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 16.1</p>
        <h2>Maximal 不是「最大」：每張 outside card 都不能停在中間</h2>
        <p class="lede">把一張outside seed交給ideal contract。若它只長成另一個proper ideal，就找到了intermediate boundary；若每張outside seed都直達R，原ideal才是maximal。</p>
      </header>
      <span class="map-convention">INSTANCE · R=(Z/4Z)^(A,B) · GROW(I; a)=SMALLEST IDEAL CONTAINING I AND a</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>Q有4張cards、K有8張cards；card數較多是否足以證明K maximal？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">足夠，K較大</button><button type="button" (click)="prediction.set(true)">不夠，要測每個outside seed</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對：maximal是inclusion gap，不是cardinality排名。' : '大小只能描述這個finite instance；真正問題是有沒有proper intermediate ideal。' }}</p> }
      </section>

      <div class="control-row">
        <button type="button" [class.active]="idealId()==='Q'" [attr.aria-pressed]="idealId()==='Q'" (click)="chooseIdeal('Q')">START Q</button>
        <button type="button" [class.active]="idealId()==='K'" [attr.aria-pressed]="idealId()==='K'" (click)="chooseIdeal('K')">START K</button>
        @for (seed of focusedSeeds(); track label(seed)) { <button type="button" [class.active]="label(seed)===label(selectedSeed())" [attr.aria-pressed]="label(seed)===label(selectedSeed())" (click)="selectSeed(seed)">ADD {{ label(seed) }}</button> }
        <button type="button" (click)="grown.set(true)">RUN GROWTH</button>
        <button type="button" [disabled]="audited()" (click)="runAudit()">{{ audited() ? 'ALL-OUTSIDE AUDIT COMPLETE' : 'AUDIT ALL OUTSIDE SEEDS' }}</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="maximal-growth-lab">
          <div class="growth-main-row">
            <section class="growth-board" aria-label="Exact card membership after generated enlargement">
              <small>FIXED AMBIENT BOARD · {{ idealId() }} + SEED {{ label(selectedSeed()) }}</small>
              <div>
                @for (card of cards; track label(card)) {
                  <span [class.original]="original(card)" [class.forced]="grown() && forced(card)" [class.outside]="!original(card) && (!grown() || !forced(card))">
                    <strong>{{ label(card) }}</strong><small>{{ original(card) ? 'ORIGINAL I' : grown() && forced(card) ? 'NEWLY FORCED' : 'STILL OUTSIDE' }}</small>
                  </span>
                }
              </div>
            </section>

            <section class="inclusion-fork" aria-label="Ideal inclusion fork Q to K or L to R">
              <div class="fork-node q" [class.active]="nodeActive('Q')">Q · 4</div>
              <div class="fork-branches"><span [class.active]="pathActive('Q', 'K')">Q ⊂ K</span><span [class.active]="pathActive('Q', 'L')">Q ⊂ L</span></div>
              <div class="fork-middle"><div [class.active]="nodeActive('K')">K · 8</div><div [class.active]="nodeActive('L')">L · 8</div></div>
              <div class="fork-branches upper"><span [class.active]="pathActive('K', 'R')">K ⊂ R</span><span [class.active]="pathActive('L', 'R')">L ⊂ R</span></div>
              <div class="direct-growth" [class.active]="pathActive('Q', 'R')">Q + seed ⇒ R · NO INTERMEDIATE STOP</div>
              <div class="fork-node whole" [class.active]="nodeActive('R')">R · 16</div>
            </section>
          </div>

          @if (grown()) {
            <div class="growth-certificate"><small>GENERATED CERTIFICATE</small><strong>GROW({{ idealId() }}; {{ label(selectedSeed()) }}) = {{ destination() }}</strong><span>{{ generatedLabel() }}</span></div>
          }

          @if (audited()) {
            <div class="seed-audit-grid">
              @for (record of audit(); track label(record.seed)) {
                <button type="button" [class.whole]="record.reachesWholeRing" [class.intermediate]="!record.reachesWholeRing" [attr.aria-label]="label(record.seed) + ' grows to ' + record.destination" (click)="inspectAuditSeed(record.seed)">
                  <strong>{{ label(record.seed) }}</strong><span>→ {{ record.destination }}</span>
                </button>
              }
            </div>
          }
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ audited() ? 'FINITE EXHAUSTION' : grown() ? 'EXAMPLE + GENERATED CERTIFICATE' : 'FOCUSED SEED' }}</span>
          <h3>{{ audited() ? maximalVerdict() : grown() ? growthVerdict() : 'CHOOSE ONE OUTSIDE SEED' }}</h3>
          <p>{{ audited() ? auditReading() : grown() ? growthReading() : 'Seed、ambient ring與ideal contract固定可見；growth只加入由I與seed強迫的cards。' }}</p>
          @if (audited()) { <div class="readout">outside seeds {{ audit().length }} · reach R {{ wholeCount() }} · stop intermediate {{ intermediateCount() }}</div> }
        </aside>
      </section>

      @if (audited()) {
        <section class="transfer-strip">
          <div><p class="kicker">TRANSFER · INTEGER IDEALS</p><strong>6Z為什麼不maximal，而2Z通過同一detector？</strong></div>
          <div class="choice-row"><button type="button" (click)="transfer.set(true)">6Z⊂2Z⊂Z；2Z加odd seed直達Z</button><button type="button" (click)="transfer.set(false)">因2Z含比較多integers</button></div>
          @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對：改成infinite world，判準仍是intermediate ideal，不是可見card數。' : '兩個sets都是infinite；card數根本無法承擔maximal判斷。' }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">I⊊R</span><div><strong>Maximal ideal 沒有 proper intermediate boundary</strong><span>等價地，每一張outside seed一加入，就由ideal contract強迫長成whole ring。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 16.2</strong><p>Seed能否把growth推到R，為什麼會和它的quotient class能否找到inverse完全同步？</p></div>
      <details><summary>為什麼 every-outside criterion 等價於 maximal？</summary><p>若I⊊J⊊R，取a∈J\I，則GROW(I;a)仍包含於J，所以不會到R。反向若某個outside a的growth仍proper，它本身就是I與R之間的intermediate ideal。正式地GROW(I;a)=I+(a)，但two-ideal sum留到Ch17主線。</p></details>
    </article>
  `,
})
export class RingsCh16MaximalGrowthAuditComponent {
  readonly cards = allPairs();
  readonly idealId = signal<MaximalCandidateId>('Q');
  readonly selectedSeed = signal<Pair>([1, 0]);
  readonly grown = signal(false);
  readonly audited = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly focusedSeeds = computed<readonly Pair[]>(() => this.idealId() === 'Q' ? [[1, 0], [0, 1], [1, 1]] : [[0, 1], [2, 1], [3, 3]]);
  readonly generated = computed(() => generatedEnlargement(this.idealId(), this.selectedSeed()));
  readonly destination = computed(() => growthDestination(this.idealId(), this.selectedSeed()));
  readonly audit = computed(() => enlargementAudit(this.idealId()));
  readonly wholeCount = computed(() => this.audit().filter(record => record.reachesWholeRing).length);
  readonly intermediateCount = computed(() => this.audit().length - this.wholeCount());
  label = pairLabel;

  original(card: Pair): boolean { return containsPair(candidateMembers(this.idealId()), card); }
  forced(card: Pair): boolean { return containsPair(this.generated(), card) && !this.original(card); }
  selectSeed(seed: Pair): void { this.selectedSeed.set(seed); this.grown.set(false); this.transfer.set(null); }
  chooseIdeal(id: MaximalCandidateId): void { this.idealId.set(id); this.selectedSeed.set(id === 'Q' ? [1, 0] : [0, 1]); this.grown.set(false); this.audited.set(false); this.transfer.set(null); }
  runAudit(): void { this.audited.set(true); }
  inspectAuditSeed(seed: Pair): void { this.selectedSeed.set(seed); this.grown.set(true); }
  nodeActive(id: 'Q' | 'K' | 'L' | 'R'): boolean {
    return id === this.idealId() || (this.grown() && id === this.destination());
  }
  pathActive(from: 'Q' | 'K' | 'L', to: 'K' | 'L' | 'R'): boolean {
    return this.grown() && this.idealId() === from && this.destination() === to;
  }
  generatedLabel(): string { return pairSetLabel(this.generated()); }
  growthVerdict(): string { return this.destination() === 'R' ? 'NO INTERMEDIATE · REACHES WHOLE R' : `STOPS AT PROPER ${this.destination()}`; }
  growthReading(): string { return this.destination() === 'R' ? '這張outside seed迫使identity與所有ambient cards加入；但single success還不能證明every outside seed。' : `Growth停在${this.destination()}，已找到${this.idealId()}與R之間的proper ideal，足以推翻maximal claim。`; }
  maximalVerdict(): string { return idealIsMaximal(this.idealId()) ? 'MAXIMAL IDEAL（極大理想）' : 'NOT MAXIMAL · INTERMEDIATE IDEALS EXIST'; }
  auditReading(): string { return idealIsMaximal(this.idealId()) ? '所有8張outside seeds都直達R；這個finite instance通過every-outside detector。' : '8張outside seeds會停在K或L；任何一張都是decisive intermediate witness。'; }
  reset(): void { this.idealId.set('Q'); this.selectedSeed.set([1, 0]); this.grown.set(false); this.audited.set(false); this.prediction.set(null); this.transfer.set(null); }
}
