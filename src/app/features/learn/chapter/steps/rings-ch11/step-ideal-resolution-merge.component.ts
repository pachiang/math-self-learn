import { Component, computed, signal } from '@angular/core';
import {
  functionResolutionBucketCount,
  IDEAL_2,
  IDEAL_4,
  partitionByIdeal,
  refinementTargets,
  sameUnderIdeal,
} from './rings-ch11-model';

@Component({
  selector: 'app-rings-ch11-ideal-resolution-merge',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 11.5</p>
        <h2>Zero class 越大，quotient elements 只會整個合併，不會再分裂</h2>
        <p class="lede">比較I=(4)⊆J=(2)。把更多differences壓成0會抹掉更多區別：R/I的每個coset必須完整落進某一個R/J coset，所以4個新elements壓成2個。</p>
      </header>
      <span class="map-convention">NESTED IDEALS · I⊆J · STRONGER COLLAPSE · R/I → R/J</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>從I=(4)換成較大的zero class J=(2)，舊quotient element最小可能怎麼變？</h3></div>
        <div class="choice-row">
          <button type="button" (click)="prediction.set('merge')">Whole cosets整個合併</button>
          <button type="button" (click)="prediction.set('split')">把舊coset拆成更細</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()==='split'">{{ prediction()==='merge' ? '對。追蹤一個R/I element，看它的所有representatives是否完整抵達同一個R/J element。' : '較大的J只新增被壓成0的differences，不會讓原本已合併的representatives重新分開。' }}</p>
        }
      </section>

      <div class="control-row">
        <span class="kicker">REFINEMENT TRACE</span>
        <button type="button" (click)="traceOne()">TRACE ONE R/I ELEMENT</button>
        <button type="button" (click)="mergeNext()">SEND NEXT COSET</button>
        <button type="button" (click)="mergeAll()">COMPLETE STRONGER COLLAPSE</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="resolution-merge-lab">
          <section class="fine-buckets">
            <div class="tray-heading"><p class="kicker">R/I · I=(4)</p><strong>4 quotient elements · 3 reps each</strong></div>
            @for (bucket of fine; track bucket.representative; let index=$index) {
              <div class="bucket-packet" [class.merged]="isMerged(index)" [class.traced]="index===lastMerged()">
                <small>R/I · C{{ index+1 }} → R/J · C{{ targets[index]+1 }}</small>
                <strong>{{ membersLabel(bucket.members) }}</strong>
                <span>{{ isMerged(index) ? 'WHOLE COSET SENT' : 'INTACT QUOTIENT ELEMENT' }}</span>
              </div>
            }
          </section>

          <div class="merge-lane" aria-hidden="true"><span>I⊆J</span><strong>MORE DIFFERENCES → 0</strong></div>

          <section class="coarse-buckets" aria-live="polite">
            <div class="tray-heading"><p class="kicker">R/J · J=(2)</p><strong>2 quotient elements remain</strong></div>
            @for (bucket of coarse; track bucket.representative; let index=$index) {
              <div class="coarse-dock" [class.complete]="coarseContents(index).length===bucket.members.length">
                <small>R/J · C{{ index+1 }} · whole coset {{ membersLabel(bucket.members) }}</small>
                <div class="bucket-members">
                  @for (member of coarseContents(index); track member) { <span>{{ member }}</span> }
                  @if (coarseContents(index).length===0) { <em>waiting for packets</em> }
                </div>
              </div>
            }
          </section>

          <div class="resolution-meter">
            <div><small>R/I</small><strong>4 distinguishable elements</strong></div>
            <div class="meter-arrow">→</div>
            <div><small>R/J</small><strong>{{ complete() ? '2 distinguishable elements' : 'collapsing…' }}</strong></div>
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">FINITE INSTANCE + GENERAL INCLUSION</span>
          <h3>{{ complete() ? 'STRONGER COMPRESSION · FEWER ELEMENTS' : 'OLD ELEMENTS MERGE WHOLE' }}</h3>
          <p>{{ consoleReading() }}</p>
          <div class="readout">[1] vs [3] · in R/I: {{ pairSameI ? 'same' : 'distinct' }} · in R/J: {{ pairSameJ ? 'same' : 'merged' }}</div>
        </aside>
      </section>

      @if (complete()) {
        <section class="transfer-match">
          <div><p class="kicker">EXTREME CHECK</p><strong>0⊆I⊆R</strong><p>壓掉zero ideal不新增identifications，所以R/0有12個elements；壓掉whole ring時，R/R只剩1個element。</p></div>
          <div><p class="kicker">TRANSFER · FUNCTION CARDS</p><strong>R=(Z/4Z)&#123;A,B&#125;</strong><p>R/0保留16個function elements；壓掉K=(1,2)後只剩{{ functionBucketCount }}個quotient elements。</p></div>
        </section>
      }

      <section class="insight"><span class="insight-icon">I⊆J</span><div><strong>Larger ideal代表更強的資訊壓縮</strong><span>若x−y∈I，因I⊆J也有x−y∈J；所以走向R/J時，既有elements只可能合併，永遠不會分裂。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · Ch12</strong><p>我們已從「想讓什麼歸零」建成完整quotient ring；接下來回頭放大well-definedness，看兩個representatives同時更換時noise如何傳遞。</p></div>
      <details><summary>一般理由：為什麼只能合併？</summary><p>對任意I⊆J，若x與y代表同一個R/I element，則x−y∈I⊆J，因此它們也代表同一個R/J element。故每個I-coset完整包含於唯一一個J-coset，並得到自然map R/I→R/J。較大的zero class抹掉更多differences，所以quotient解析度更低。</p></details>
    </article>
  `,
})
export class RingsCh11IdealResolutionMergeComponent {
  readonly fine = partitionByIdeal(IDEAL_4);
  readonly coarse = partitionByIdeal(IDEAL_2);
  readonly targets = refinementTargets(this.fine, this.coarse);
  readonly mergedFineIndices = signal<readonly number[]>([]);
  readonly lastMerged = signal<number | null>(null);
  readonly prediction = signal<'merge' | 'split' | null>(null);
  readonly pairSameI = sameUnderIdeal(1, 3, IDEAL_4);
  readonly pairSameJ = sameUnderIdeal(1, 3, IDEAL_2);
  readonly functionBucketCount = functionResolutionBucketCount();
  readonly complete = computed(() => this.mergedFineIndices().length === this.fine.length);
  readonly consoleReading = computed(() => {
    if (this.complete()) return 'R/I的C1與C3合成R/J的even element；C2與C4合成odd element。沒有任何舊quotient element被切開。';
    if (this.lastMerged() !== null) {
      const index = this.lastMerged()!;
      return `R/I的C${index+1}連同${this.fine[index].members.length}張representatives，一起進入R/J的C${this.targets[index]+1}。`;
    }
    return '選一個R/I element沿natural map追蹤；任一representative都會指向同一個R/J destination。';
  });

  isMerged(index: number): boolean { return this.mergedFineIndices().includes(index); }
  membersLabel(members: readonly number[]): string { return `{${members.join(', ')}}`; }

  coarseContents(coarseIndex: number): number[] {
    return this.mergedFineIndices()
      .filter(fineIndex => this.targets[fineIndex] === coarseIndex)
      .flatMap(fineIndex => [...this.fine[fineIndex].members])
      .sort((left, right) => left - right);
  }

  traceOne(): void {
    const next = this.fine.findIndex((_, index) => !this.isMerged(index));
    if (next !== -1) this.mergeIndex(next);
  }

  mergeNext(): void { this.traceOne(); }

  mergeAll(): void {
    this.mergedFineIndices.set(this.fine.map((_, index) => index));
    this.lastMerged.set(this.fine.length - 1);
  }

  reset(): void {
    this.mergedFineIndices.set([]);
    this.lastMerged.set(null);
    this.prediction.set(null);
  }

  private mergeIndex(index: number): void {
    this.mergedFineIndices.update(indices => [...indices, index].sort((a, b) => a - b));
    this.lastMerged.set(index);
  }
}
