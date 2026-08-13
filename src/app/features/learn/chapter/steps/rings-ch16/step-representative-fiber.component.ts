import { Component, computed, signal } from '@angular/core';
import { allPairs, Pair, pairLabel, subtractPairs } from '../rings-ch10/rings-ch10-model';
import {
  candidateMembers,
  containsPair,
  growthDestination,
  inverseCertificate,
  MaximalCandidateId,
  quotientClasses,
  quotientClassIndex,
  quotientClassLabel,
  zeroClassIndex,
} from './rings-ch16-model';

@Component({
  selector: 'app-rings-ch16-representative-fiber',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch16-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 16.4</p>
        <h2>很多 outside cards，可能只是同一個 nonzero class 的不同 handles</h2>
        <p class="lede">Maximal detector量化ambient representatives；field detector量化quotient classes。Projection不是逐張配對，而是先把同一coset的handles收進一條fiber；certificate verdict也必須整束一致。</p>
      </header>
      <span class="map-convention">GENERAL ARGUMENT · SAME FIBER ⇒ SAME GENERATED IDEAL AND SAME INVERSE VERDICT</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>a與a+i位於同一quotient fiber。換handle後，growth destination可能改變嗎？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">可能，ambient cards不同</button><button type="button" (click)="prediction.set(true)">不會，差異i早已在I內</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對：兩張handles只差一個already-available ideal correction。' : 'Ambient名字雖不同，但projection與generated boundary都只看它們相差的I-element。' }}</p> }
      </section>

      <div class="control-row">
        <button type="button" (click)="switchWorld()">SWITCH TO R/{{ idealId()==='K' ? 'Q' : 'K' }}</button>
        <button type="button" (click)="nextFiber()">NEXT NONZERO FIBER</button>
        <button type="button" (click)="compare()">COMPARE REPRESENTATIVES</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="representative-fiber-lab">
          <section class="fiber-ambient-board">
            <div class="tray-heading"><p class="kicker">UPSTAIRS AMBIENT R</p><strong>16 distinct representatives</strong></div>
            <div class="fiber-card-grid">
              @for (card of cards; track label(card)) {
                <span [class.zero-fiber]="insideIdeal(card)" [class.active-fiber]="inActiveFiber(card)" [class.handle-a]="same(card, handleA())" [class.handle-b]="same(card, handleB())">
                  <strong>{{ label(card) }}</strong><small>{{ insideIdeal(card) ? 'INSIDE I' : same(card,handleA()) ? 'HANDLE a' : same(card,handleB()) ? 'HANDLE a+i' : inActiveFiber(card) ? 'SAME FIBER' : 'OTHER FIBER' }}</small>
                </span>
              }
            </div>
          </section>

          <section class="projection-sleeves" aria-label="Many representatives bundled into quotient fibers">
            <div class="projection-machine"><small>CANONICAL PROJECTION</small><strong>π</strong><span>MANY HANDLES → ONE CLASS</span></div>
            @for (bucket of classes(); track $index) {
              <div class="fiber-sleeve" [class.zero]="$index===zeroIndex()" [class.active]="$index===activeClass()">
                <small>{{ $index===zeroIndex() ? 'ZERO FIBER' : 'OUTSIDE FIBER' }}</small>
                <span>{{ bucket.members.length }} REPRESENTATIVES</span><b>→</b><strong>{{ shortLabel($index) }}</strong>
              </div>
            }
          </section>

          <section class="handle-comparison" [class.compared]="compared()">
            <div><small>HANDLE a</small><strong>{{ label(handleA()) }}</strong><span>GROW → {{ compared() ? destinationA() : '?' }}</span></div>
            <div class="difference-in-ideal"><small>DIFFERENCE CERTIFICATE</small><strong>{{ label(handleDifference()) }} ∈ {{ idealId() }}</strong><span>already available correction</span></div>
            <div><small>HANDLE a+i</small><strong>{{ label(handleB()) }}</strong><span>GROW → {{ compared() ? destinationB() : '?' }}</span></div>
            <div class="shared-verdict"><small>SAME QUOTIENT CLASS</small><strong>{{ shortLabel(activeClass()) }}</strong><span>{{ compared() ? sharedVerdict() : 'compare to reveal' }}</span></div>
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ compared() ? 'EXAMPLE + GENERAL REPRESENTATIVE ARGUMENT' : 'SAME-FIBER COMPARISON' }}</span>
          <h3>{{ compared() ? 'VERDICT STAYS CONSTANT ACROSS THE FIBER' : 'TWO HANDLES · ONE CLASS' }}</h3>
          <p>{{ compared() ? '兩張representatives只差I-element；加入其中任何一張所生成的ideal相同，inverse certificate status也相同。' : '先保留兩張ambient cards的不同名字，再檢查projection與growth是否真的依賴handle。' }}</p>
          <div class="readout">outside reps {{ outsideCount() }} · nonzero classes {{ nonzeroClassCount() }}</div>
        </aside>
      </section>

      @if (compared()) {
        <section class="transfer-strip">
          <div><p class="kicker">TRANSFER · Z/12Z / (4)</p><strong>1、5、9是三張ambient representatives，卻同屬哪一個quotient element？</strong></div>
          <div class="choice-row"><button type="button" (click)="transfer.set(true)">同一個class 1+(4)，growth verdict相同</button><button type="button" (click)="transfer.set(false)">三個不同classes，各有自己的verdict</button></div>
          @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對：5−1=4、9−1=8都在(4)，所以三張handles被同一fiber打包。' : '它們的differences都在(4)，projection不會保留handle差異。' }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">fiber</span><div><strong>Every outside representatives會被projection打包成every nonzero classes</strong><span>這不是一對一配對；同一fiber中的handles共享generated ideal與inverse verdict，所以只需在class層級保留一次判斷。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 16.5</strong><p>現在已有single certificate與fiber bundling；如何把兩邊的every statements接成一般定理？</p></div>
      <details><summary>Representative invariance 的一般理由</summary><p>若a'−a∈I，則a'=a+i。由於I+(a)已包含i與a，所以包含a'；反向a=a'−i也同理，因此I+(a)=I+(a')。而a+I=a'+I本來就是同一quotient class。</p></details>
    </article>
  `,
})
export class RingsCh16RepresentativeFiberComponent {
  readonly cards = allPairs();
  readonly idealId = signal<MaximalCandidateId>('K');
  readonly activeNonzeroIndex = signal(0);
  readonly compared = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly classes = computed(() => quotientClasses(this.idealId()));
  readonly nonzeroClasses = computed(() => this.classes().map((_, index) => index).filter(index => index !== zeroClassIndex(this.idealId())));
  readonly activeClass = computed(() => this.nonzeroClasses()[this.activeNonzeroIndex() % this.nonzeroClasses().length]);
  readonly activeBucket = computed(() => this.classes()[this.activeClass()]);
  readonly handleA = computed(() => this.activeBucket().members[0]);
  readonly handleB = computed(() => this.activeBucket().members[1]);
  readonly handleDifference = computed(() => subtractPairs(this.handleB(), this.handleA()));
  readonly destinationA = computed(() => growthDestination(this.idealId(), this.handleA()));
  readonly destinationB = computed(() => growthDestination(this.idealId(), this.handleB()));
  readonly zeroIndex = computed(() => zeroClassIndex(this.idealId()));
  readonly outsideCount = computed(() => this.cards.filter(card => !containsPair(candidateMembers(this.idealId()), card)).length);
  readonly nonzeroClassCount = computed(() => this.nonzeroClasses().length);
  label = pairLabel;

  switchWorld(): void { this.idealId.update(id => id === 'K' ? 'Q' : 'K'); this.activeNonzeroIndex.set(0); this.compared.set(false); this.transfer.set(null); }
  nextFiber(): void { this.activeNonzeroIndex.update(index => (index + 1) % this.nonzeroClasses().length); this.compared.set(false); this.transfer.set(null); }
  compare(): void { this.compared.set(true); }
  insideIdeal(card: Pair): boolean { return containsPair(candidateMembers(this.idealId()), card); }
  inActiveFiber(card: Pair): boolean { return quotientClassIndex(this.idealId(), card) === this.activeClass(); }
  same(left: Pair, right: Pair): boolean { return left[0] === right[0] && left[1] === right[1]; }
  shortLabel(index: number): string { return quotientClassLabel(this.idealId(), index).split(' · ')[0]; }
  sharedVerdict(): string {
    const inverse = inverseCertificate(this.idealId(), this.activeClass());
    return `${this.destinationA()} = ${this.destinationB()} · inverse ${inverse ? 'YES' : 'NO'}`;
  }
  reset(): void { this.idealId.set('K'); this.activeNonzeroIndex.set(0); this.compared.set(false); this.prediction.set(null); this.transfer.set(null); }
}
