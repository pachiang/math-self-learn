import { Component, computed, signal } from '@angular/core';
import {
  bucketIndexFor,
  IDEAL_3,
  IDEAL_4,
  partitionByIdeal,
  ResidueBucket,
} from './rings-ch11-model';

type IdealChoice = 'i4' | 'i3';

@Component({
  selector: 'app-rings-ch11-resolution-partition-builder',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 11.2</p>
        <h2>新世界的一個 element 是整個 coset，不是你手上那張代表卡</h2>
        <p class="lede">以1為handle會抓到&#123;1,5,9&#125;；換成5或9仍抓到完全相同的一束。Quotient裡真正存在的是whole coset，representative只是用來操作它的把手。</p>
      </header>
      <span class="map-convention">NEW ELEMENT TYPE · x+I=&#123;x+i:i∈I&#125; · REPRESENTATIVE IS A HANDLE · OPERATIONS NOT YET DEFINED</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>先用1打開1+I=&#123;1,5,9&#125;後，再用5當代表，會得到另一個quotient element嗎？</h3></div>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(true)">不會，仍是同一個coset</button>
          <button type="button" (click)="prediction.set(false)">會，代表不同就是element不同</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對。依序點1、5再打開current coset；member set會完全相同。' : 'Representative只是handle；若兩個cosets共享一張card，difference rule會迫使它們整束相同。' }}</p>
        }
      </section>

      <div class="control-row">
        <span class="kicker">IDEAL</span>
        <button type="button" [class.active]="idealChoice()==='i4'" (click)="setIdeal('i4')">I=(4)</button>
        <button type="button" [disabled]="!primaryComplete()" [class.active]="idealChoice()==='i3'" (click)="setIdeal('i3')">TRANSFER · I=(3)</button>
        <button type="button" (click)="buildCurrent()">OPEN REPRESENTATIVE'S COSET</button>
        <button type="button" (click)="buildNext()">OPEN NEXT COSET</button>
        <button type="button" (click)="completePartition()">REVEAL QUOTIENT SET</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="partition-builder-lab">
          <section class="source-rack">
            <div class="tray-heading"><p class="kicker">AMBIENT REPRESENTATIVES · Z/12Z</p><strong>current handle：{{ representative() }}</strong></div>
            <div class="residue-source-board">
              @for (value of residues; track value) {
                @if (isAssigned(value)) {
                  <button type="button" class="resolution-card placeholder-card" [class.selected]="value===representative()" (click)="selectRepresentative(value)">
                    <strong>→ C{{ bucketNumber(value) }}</strong><small>{{ value }} is a handle</small>
                  </button>
                } @else {
                  <button type="button" class="resolution-card" [class.selected]="value===representative()" (click)="selectRepresentative(value)">
                    <strong>{{ value }}</strong><small>{{ value===representative() ? 'CURRENT REP' : 'AVAILABLE REP' }}</small>
                  </button>
                }
              }
            </div>
          </section>

          <div class="partition-flow">add invisible I-noise →<br>same whole coset</div>

          <section class="bucket-rack" aria-live="polite">
            <div class="tray-heading"><p class="kicker">QUOTIENT ELEMENTS · COSETS</p><strong>{{ builtIndices().length }} / {{ partition().length }} elements opened</strong></div>
            @for (bucket of partition(); track bucket.representative; let index=$index) {
              <div class="resolution-bucket" [class.built]="isBuilt(index)" [class.current]="index===currentBucketIndex()">
                <small>C{{ index+1 }} · {{ bucket.representative }}+I · rep {{ bucket.representative }}</small>
                <div class="bucket-members">
                  @for (member of bucket.members; track member) {
                    <span>{{ isBuilt(index) ? member : '?' }}</span>
                  }
                </div>
              </div>
            }
          </section>

          <div class="bucket-certificate" [class.confirmed]="currentAlreadyBuilt()">
            <small>REPRESENTATIVE-INDEPENDENT IDENTITY</small>
            <strong>{{ currentAlreadyBuilt() ? 'SAME WHOLE COSET · POINTS TO C' + (currentBucketIndex()+1) : 'READY TO OPEN C' + (currentBucketIndex()+1) }}</strong>
            <span>{{ membersLabel(currentBucket().members) }}</span>
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">FINITE INSTANCE · COSET IDENTITY</span>
          <h3>{{ partitionComplete() ? 'FOUR COSETS · FOUR NEW ELEMENTS' : 'REPRESENTATIVE OPENS A WHOLE COSET' }}</h3>
          <p>{{ consoleReading() }}</p>
          <div class="readout">ambient representatives assigned {{ assignedCount() }}/12 · quotient elements {{ builtIndices().length }}/{{ partition().length }}</div>
        </aside>
      </section>

      @if (partitionComplete()) {
        <section class="transfer-strip">
          <div><p class="kicker">QUOTIENT SET CERTIFICATE</p><strong>Z/12Z / {{ idealLabel() }} 有 {{ partition().length }} 個cosets；每個coset含 {{ currentBucket().members.length }} 個ambient representatives</strong></div>
          <p>每張ambient card恰好代表一個coset；任選coset內另一張card當handle，都不會改變quotient element。</p>
        </section>
      }

      <section class="insight"><span class="insight-icon">x+I</span><div><strong>Coset才是quotient element；representative只是handle</strong><span>[1]、[5]與[9]不是三個相等的elements，而是同一個element的三種ambient寫法。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 11.3</strong><p>既然handle可以任換，用不同representatives計算時，加法與乘法真的都會回到同一個output coset嗎？</p></div>
      <details><summary>為什麼換代表不會換coset？</summary><p>若y與x同coset，則y−x∈I。任何與y差在I裡的z，也滿足z−x=(z−y)+(y−x)∈I；反方向同理。因此兩個member sets完全相同。這裡只使用ideal的additive subgroup性質；operations是否能在cosets上定義是下一節的問題。</p></details>
    </article>
  `,
})
export class RingsCh11ResolutionPartitionBuilderComponent {
  readonly residues = Array.from({ length: 12 }, (_, value) => value);
  readonly idealChoice = signal<IdealChoice>('i4');
  readonly representative = signal(1);
  readonly builtIndices = signal<readonly number[]>([]);
  readonly prediction = signal<boolean | null>(null);
  readonly primaryComplete = signal(false);
  readonly activeIdeal = computed(() => this.idealChoice() === 'i4' ? IDEAL_4 : IDEAL_3);
  readonly idealLabel = computed(() => this.idealChoice() === 'i4' ? 'I=(4)' : 'I=(3)');
  readonly partition = computed(() => partitionByIdeal(this.activeIdeal()));
  readonly currentBucketIndex = computed(() => bucketIndexFor(this.representative(), this.partition()));
  readonly currentBucket = computed<ResidueBucket>(() => this.partition()[this.currentBucketIndex()]);
  readonly currentAlreadyBuilt = computed(() => this.builtIndices().includes(this.currentBucketIndex()));
  readonly assignedCount = computed(() => this.builtIndices()
    .reduce((total, index) => total + this.partition()[index].members.length, 0));
  readonly partitionComplete = computed(() => this.builtIndices().length === this.partition().length);
  readonly consoleReading = computed(() => this.partitionComplete()
    ? `這12張ambient cards只代表${this.partition().length}個quotient elements；representative只是替whole coset命名。`
    : this.currentAlreadyBuilt()
      ? `${this.representative()}只是C${this.currentBucketIndex()+1}的另一個handle；再次打開仍指回相同whole coset。`
      : `以${this.representative()}為handle，收集所有與它的差落進${this.idealLabel()}的ambient representatives。`);

  isBuilt(index: number): boolean { return this.builtIndices().includes(index); }
  isAssigned(value: number): boolean { return this.isBuilt(bucketIndexFor(value, this.partition())); }
  bucketNumber(value: number): number { return bucketIndexFor(value, this.partition()) + 1; }
  membersLabel(members: readonly number[]): string { return `{${members.join(', ')}}`; }

  selectRepresentative(value: number): void { this.representative.set(value); }

  buildCurrent(): void {
    const index = this.currentBucketIndex();
    if (!this.isBuilt(index)) this.builtIndices.update(indices => [...indices, index].sort((a, b) => a - b));
    this.capturePrimaryCompletion();
  }

  buildNext(): void {
    const next = this.partition().findIndex((_, index) => !this.isBuilt(index));
    if (next === -1) return;
    this.representative.set(this.partition()[next].representative);
    this.builtIndices.update(indices => [...indices, next].sort((a, b) => a - b));
    this.capturePrimaryCompletion();
  }

  completePartition(): void {
    this.builtIndices.set(this.partition().map((_, index) => index));
    this.capturePrimaryCompletion();
  }

  setIdeal(choice: IdealChoice): void {
    if (choice === 'i3' && !this.primaryComplete()) return;
    this.idealChoice.set(choice);
    this.representative.set(choice === 'i4' ? 1 : 0);
    this.builtIndices.set([]);
  }

  reset(): void {
    this.idealChoice.set('i4');
    this.representative.set(1);
    this.builtIndices.set([]);
    this.prediction.set(null);
    this.primaryComplete.set(false);
  }

  private capturePrimaryCompletion(): void {
    if (this.idealChoice() === 'i4' && this.partitionComplete()) this.primaryComplete.set(true);
  }
}
