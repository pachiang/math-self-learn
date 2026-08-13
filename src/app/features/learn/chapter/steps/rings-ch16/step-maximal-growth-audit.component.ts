import { Component, computed, signal } from '@angular/core';
import { allPairs, Pair, pairLabel } from '../rings-ch10/rings-ch10-model';
import {
  candidateMembers,
  containsPair,
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
        <p class="eyebrow">Rings & Ideals · 16.3</p>
        <h2>Maximal 不是「最大」：outside seed 不能停在任何中間站</h2>
        <p class="lede">把一張outside seed交給ideal contract。若它只長成另一個proper ideal，就找到intermediate boundary；只有every outside seed都直達R，原ideal才沒有中間站。</p>
      </header>
      <span class="map-convention">DEFINITION SCOPE · PROPER IDEAL · MAXIMAL MEANS NO PROPER INTERMEDIATE IDEAL</span>

      <section class="prediction">
        <div><p class="kicker">先拆掉card-count直覺</p><h3>Q有4張cards、K有8張cards；K比較大是否足以證明它maximal？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">足夠，card較多</button><button type="button" (click)="prediction.set(true)">不夠，要找intermediate stop</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對：maximal描述inclusion gap，不是cardinality排名。' : 'Card數只能描述finite instance；是否存在proper intermediate ideal才是問題。' }}</p> }
      </section>

      <div class="control-row">
        <button type="button" (click)="switchWorld()">SWITCH TO {{ idealId()==='Q' ? 'K' : 'Q' }}</button>
        <button type="button" (click)="nextFocusedSeed()">NEXT OUTSIDE SEED</button>
        <button type="button" (click)="runGrowth()">RUN GROWTH</button>
        <button type="button" [disabled]="audited()" (click)="runAudit()">{{ audited() ? 'FINITE AUDIT COMPLETE' : 'AUDIT ALL OUTSIDE SEEDS' }}</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="maximal-growth-lab">
          <div class="growth-main-row">
            <section class="growth-board" aria-label="Exact card membership after generated enlargement">
              <small>FIXED AMBIENT BOARD · START {{ idealId() }} · SEED {{ label(selectedSeed()) }}</small>
              <div>
                @for (card of cards; track label(card)) {
                  <span [class.original]="original(card)" [class.forced]="grown() && forced(card)" [class.outside]="!original(card) && (!grown() || !forced(card))">
                    <strong>{{ label(card) }}</strong><small>{{ original(card) ? 'ORIGINAL I' : grown() && forced(card) ? 'NEWLY FORCED' : 'STILL OUTSIDE' }}</small>
                  </span>
                }
              </div>
            </section>

            <section class="inclusion-fork" aria-label="Equal-sized nodes showing ideal inclusion, not cardinality">
              <small>INCLUSION FORK · NODE SIZE HAS NO CARDINALITY MEANING</small>
              <div class="fork-node q" [class.active]="nodeActive('Q')">Q</div>
              <div class="fork-branches"><span [class.active]="pathActive('Q','K')">Q ⊂ K</span><span [class.active]="pathActive('Q','L')">Q ⊂ L</span></div>
              <div class="fork-middle"><div [class.active]="nodeActive('K')">K</div><div [class.active]="nodeActive('L')">L</div></div>
              <div class="fork-branches upper"><span [class.active]="pathActive('K','R')">K ⊂ R</span><span [class.active]="pathActive('L','R')">L ⊂ R</span></div>
              <div class="direct-growth" [class.active]="pathActive('Q','R')">DIRECT TO R · NO INTERMEDIATE STOP</div>
              <div class="fork-node whole" [class.active]="nodeActive('R')">R</div>
            </section>
          </div>

          @if (grown()) {
            <div class="growth-certificate"><small>{{ destination()==='R' ? 'EXAMPLE · EXACT GENERATED SET' : 'WITNESS · INTERMEDIATE IDEAL' }}</small><strong>GROW({{ idealId() }}; {{ label(selectedSeed()) }}) = {{ destination() }}</strong><span>{{ generatedLabel() }}</span></div>
          }

          @if (audited()) {
            <div class="seed-audit-grid">
              @for (record of audit(); track label(record.seed)) {
                <div [class.whole]="record.reachesWholeRing" [class.intermediate]="!record.reachesWholeRing"><strong>{{ label(record.seed) }}</strong><span>→ {{ record.destination }}</span></div>
              }
            </div>
          }
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ audited() ? 'FINITE EXHAUSTION · THIS IDEAL' : grown() ? destination()==='R' ? 'EXAMPLE · NOT YET UNIVERSAL' : 'WITNESS · CLAIM REFUTED' : 'FOCUSED SEED' }}</span>
          <h3>{{ audited() ? maximalVerdict() : grown() ? growthVerdict() : 'ADD ONE OUTSIDE SEED' }}</h3>
          <p>{{ audited() ? auditReading() : grown() ? growthReading() : 'Boundary、ambient board與ideal contract固定；growth只加入由I與seed被迫生成的cards。' }}</p>
          @if (audited()) { <div class="readout">outside seeds {{ audit().length }} · reach R {{ wholeCount() }} · stop intermediate {{ intermediateCount() }}</div> }
        </aside>
      </section>

      @if (audited()) {
        <section class="transfer-strip">
          <div><p class="kicker">TRANSFER · INFINITE INTEGER IDEALS</p><strong>6Z為什麼不maximal，而2Z通過同一個detector？</strong></div>
          <div class="choice-row"><button type="button" (click)="transfer.set(true)">6Z⊂2Z⊂Z；2Z加任一odd seed直達Z</button><button type="button" (click)="transfer.set(false)">因為2Z包含比較多integers</button></div>
          @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對：兩者都是infinite；真正差別是2Z與Z之間沒有proper ideal可停。' : 'Infinite sets不能靠card數排序；6Z⊂2Z⊂Z才是decisive witness。' }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">I⊊R</span><div><strong>Maximal ideal（極大理想）沒有proper intermediate boundary</strong><span>一張outside seed停在中間就足以否決；要肯定maximal，則every outside seed都必須被ideal contract推到whole ring。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 16.4</strong><p>Upstairs可能有很多outside cards，downstairs卻只有少數nonzero classes；這兩種every到底怎麼對齊？</p></div>
      <details><summary>Every-outside criterion 為什麼等價？</summary><p>若I⊊J⊊R，取a∈J\I，則I+(a)⊆J，所以不會到R。反向若某個outside a的generated ideal仍proper，它自己就是I與R之間的intermediate ideal。</p></details>
    </article>
  `,
})
export class RingsCh16MaximalGrowthAuditComponent {
  readonly cards = allPairs();
  readonly idealId = signal<MaximalCandidateId>('Q');
  readonly focusedIndex = signal(0);
  readonly grown = signal(false);
  readonly audited = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly focusedSeeds = computed<readonly Pair[]>(() => this.idealId() === 'Q' ? [[1, 0], [0, 1], [1, 1]] : [[0, 1], [2, 1], [3, 3]]);
  readonly selectedSeed = computed(() => this.focusedSeeds()[this.focusedIndex()]);
  readonly generated = computed(() => generatedEnlargement(this.idealId(), this.selectedSeed()));
  readonly destination = computed(() => growthDestination(this.idealId(), this.selectedSeed()));
  readonly audit = computed(() => enlargementAudit(this.idealId()));
  readonly wholeCount = computed(() => this.audit().filter(record => record.reachesWholeRing).length);
  readonly intermediateCount = computed(() => this.audit().length - this.wholeCount());
  label = pairLabel;

  original(card: Pair): boolean { return containsPair(candidateMembers(this.idealId()), card); }
  forced(card: Pair): boolean { return containsPair(this.generated(), card) && !this.original(card); }
  switchWorld(): void { this.idealId.update(id => id === 'Q' ? 'K' : 'Q'); this.focusedIndex.set(0); this.grown.set(false); this.audited.set(false); this.transfer.set(null); }
  nextFocusedSeed(): void { this.focusedIndex.update(index => (index + 1) % this.focusedSeeds().length); this.grown.set(false); this.transfer.set(null); }
  runGrowth(): void { this.grown.set(true); }
  runAudit(): void { this.audited.set(true); }
  nodeActive(id: NamedNode): boolean { return id === this.idealId() || (this.grown() && id === this.destination()); }
  pathActive(from: 'Q' | 'K' | 'L', to: 'K' | 'L' | 'R'): boolean { return this.grown() && this.idealId() === from && this.destination() === to; }
  generatedLabel(): string { return pairSetLabel(this.generated()); }
  growthVerdict(): string { return this.destination() === 'R' ? 'REACHES R · ONE SUCCESS IS NOT ENOUGH' : `STOPS AT PROPER ${this.destination()}`; }
  growthReading(): string { return this.destination() === 'R' ? '這張seed沒有中間站，但maximal是every-outside claim；仍需完整audit。' : `Growth停在${this.destination()}，這一張witness已足以推翻${this.idealId()} maximal。`; }
  maximalVerdict(): string { return idealIsMaximal(this.idealId()) ? 'MAXIMAL · NO OUTSIDE SEED STOPS MIDWAY' : 'NOT MAXIMAL · INTERMEDIATE IDEAL FOUND'; }
  auditReading(): string { return idealIsMaximal(this.idealId()) ? '所有outside seeds都直達R；此finite instance通過every-outside detector。' : '至少一張outside seed停在K或L；intermediate boundary確實存在。'; }
  reset(): void { this.idealId.set('Q'); this.focusedIndex.set(0); this.grown.set(false); this.audited.set(false); this.prediction.set(null); this.transfer.set(null); }
}

type NamedNode = 'Q' | 'K' | 'L' | 'R';
