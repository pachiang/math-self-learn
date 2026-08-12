import { Component, computed, signal } from '@angular/core';
import {
  classLabel,
  CompressionTarget,
  compressionTargetForClass,
  compressionTargetSize,
  quotientClasses,
  targetClassSources,
} from './rings-ch12-model';

@Component({
  selector: 'app-rings-ch12-minimum-loss-compression',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 12.4</p>
        <h2>所有合法壓縮都先經過 R/I；差別只在之後還要再忘掉多少</h2>
        <p class="lede">Projection π只做I→0強迫的四組identifications。Parity與zero map也都殺掉I，但它們會在R/I之後繼續合併quotient elements。比較三條routes，就能看見「保留最多資訊」的精確含義。</p>
      </header>
      <span class="map-convention">UNIVERSAL COMPRESSION · EVERY f WITH I⊆ker f FACTORS UNIQUELY AS R→R/I→TARGET</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>三張maps都讓I歸零；哪一張只做必要合併、保留最多distinct outputs？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set('quotient')">π:R→R/I</button><button type="button" (click)="prediction.set('parity')">parity:R→ℤ/2ℤ</button><button type="button" (click)="prediction.set('zero')">zero map</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()!=='quotient'">{{ prediction()==='quotient' ? '對。π留下四個forced cosets；另外兩張maps都能表示成π之後再合併。' : '它確實安全，但比I→0要求得更多。追蹤factor route，看哪些quotient elements被額外合併。' }}</p> }
      </section>

      <div class="control-row">
        <span class="kicker">SAFE COMPRESSION</span>
        <button type="button" [class.active]="target()==='quotient'" (click)="selectTarget('quotient')">R/I · 4 OUTPUTS</button>
        <button type="button" [class.active]="target()==='parity'" (click)="selectTarget('parity')">PARITY · 2 OUTPUTS</button>
        <button type="button" [class.active]="target()==='zero'" (click)="selectTarget('zero')">ZERO MAP · 1 OUTPUT</button>
        <button type="button" (click)="routeNext()">ROUTE NEXT QUOTIENT ELEMENT</button>
        <button type="button" (click)="routeAll()">COMPLETE FACTORIZATION</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="minimum-loss-lab">
          <section class="compression-source-layer">
            <div class="tray-heading"><p class="kicker">NECESSARY COLLAPSE · R/I</p><strong>4 quotient elements</strong></div>
            @for (quotientClass of classes; track quotientClass.index) {
              <div class="quotient-packet" [class.routed]="isRouted(quotientClass.index)" [class.current]="lastRouted()===quotientClass.index"><small>{{ classLabel(quotientClass.index) }}</small><strong>{{ membersLabel(quotientClass.index) }}</strong><span>{{ isRouted(quotientClass.index) ? 'sent through induced map' : 'distinct after π' }}</span></div>
            }
          </section>

          <div class="factor-machine"><span>f̄</span><strong>FURTHER COMPRESSION</strong><small>π already handled I→0</small></div>

          <section class="compression-target-layer" aria-live="polite">
            <div class="tray-heading"><p class="kicker">ACTIVE TARGET · {{ targetTitle() }}</p><strong>{{ targetSize() }} outputs</strong></div>
            @for (targetIndex of targetIndices(); track targetIndex) {
              <div class="compression-dock" [class.complete]="dockComplete(targetIndex)">
                <small>T{{ targetIndex }} · receives {{ sourceLabels(targetIndex) }}</small>
                <div>@for (source of arrivedSources(targetIndex); track source) { <span>{{ classLabel(source) }}</span> } @if (arrivedSources(targetIndex).length===0) { <em>waiting</em> }</div>
              </div>
            }
          </section>

          <section class="information-meter">
            <div><small>AMBIENT R</small><strong>12 identities</strong></div><span>π</span><div><small>REQUIRED BY I→0</small><strong>4 identities</strong></div><span>f̄</span><div><small>ACTIVE TARGET</small><strong>{{ complete() ? targetSize()+' identities' : 'routing…' }}</strong></div>
          </section>

          <section class="factorization-equation"><strong>f = f̄ ∘ π</strong><span>ambient card → its coset → optional further merge</span><b>{{ extraMerges()===0 ? 'NO UNFORCED LOSS' : extraMerges()+' EXTRA CLASS MERGES' }}</b></section>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ complete() ? 'FACTORIZATION COMPLETE' : 'SAFE COMPRESSION COMPARISON' }}</span>
          <h3>{{ verdictTitle() }}</h3>
          <p>{{ verdictReading() }}</p>
          <div class="readout">I→0 required: 4 classes · target keeps: {{ targetSize() }} · extra merges: {{ extraMerges() }}</div>
        </aside>
      </section>

      @if (allCompared().length===3) {
        <section class="transfer-match"><div><p class="kicker">COMPARISON COMPLETE</p><strong>R/I keeps 4 · parity keeps 2 · zero map keeps 1</strong></div><p>三者都合法，因為都不會重新分開I。Universal claim不是「其他maps比較差」，而是它們都必須先接受R/I的identifications，之後才能選擇進一步合併。</p></section>
      }

      <section class="insight"><span class="insight-icon">minimum loss</span><div><strong>R/I 是滿足 I→0 的最精細、最不浪費的 ring compression</strong><span>它只合併相差I的elements；任何同樣殺掉I的map，都唯一等於canonical projection後接一張更粗或同樣精細的reader。</span></div></section>
      <div class="chapter-resolution"><strong>CH12 RESOLUTION</strong><p>Ch10找出forced-zero region，Ch11把它壓成quotient elements，Ch12則證明這個新世界既沒有漏掉必要合併，也沒有預先替任何後續map多刪資訊。</p></div>
      <details><summary>正式層：quotient 的 universal property</summary><p>給定ring homomorphism f:R→S。只要I⊆ker f，就存在唯一ring homomorphism f̄:R/I→S使f=f̄∘π。存在性由f̄(x+I)=f(x)建立；唯一性來自π是surjective。這正是「R/I是在I=0限制下保留最多資訊」的精確版本。</p></details>
    </article>
  `,
})
export class RingsCh12MinimumLossCompressionComponent {
  readonly classes = quotientClasses();
  readonly target = signal<CompressionTarget>('parity');
  readonly routed = signal<readonly number[]>([]);
  readonly lastRouted = signal<number | null>(null);
  readonly prediction = signal<CompressionTarget | null>(null);
  readonly allCompared = signal<readonly CompressionTarget[]>([]);
  readonly targetSize = computed(() => compressionTargetSize(this.target()));
  readonly targetIndices = computed(() => Array.from({ length: this.targetSize() }, (_, index) => index));
  readonly complete = computed(() => this.routed().length === this.classes.length);
  readonly extraMerges = computed(() => this.classes.length - this.targetSize());
  readonly targetTitle = computed(() => this.target() === 'quotient' ? 'R/I' : this.target() === 'parity' ? 'ℤ/2ℤ · PARITY' : 'ZERO RING');
  readonly verdictTitle = computed(() => !this.complete()
    ? 'EVERY SAFE MAP STARTS FROM THE FOUR COSETS'
    : this.extraMerges() === 0 ? 'π STOPS AFTER NECESSARY COLLAPSE' : 'SAFE · BUT CONTINUES MERGING');
  readonly verdictReading = computed(() => !this.complete()
    ? `把R/I的四個elements逐一送進${this.targetTitle()}；觀察哪些classes在π之後才被進一步合併。`
    : this.extraMerges() === 0
      ? 'Active target仍分辨四個cosets；這條route沒有加入任何I→0未強迫的資訊損失。'
      : `${this.targetTitle()}只保留${this.targetSize()}個outputs；它合法，但可見為π後接${this.extraMerges()}次額外class merge。`);
  classLabel = classLabel;

  membersLabel(index: number): string { return `{${this.classes[index].members.join(',')}}`; }
  isRouted(index: number): boolean { return this.routed().includes(index); }
  targetFor(index: number): number { return compressionTargetForClass(this.target(), index); }
  sourcesFor(targetIndex: number): readonly number[] { return targetClassSources(this.target(), targetIndex); }
  arrivedSources(targetIndex: number): readonly number[] { return this.sourcesFor(targetIndex).filter(source => this.isRouted(source)); }
  sourceLabels(targetIndex: number): string { return this.sourcesFor(targetIndex).map(classLabel).join('+'); }
  dockComplete(targetIndex: number): boolean { return this.arrivedSources(targetIndex).length === this.sourcesFor(targetIndex).length; }
  selectTarget(target: CompressionTarget): void { this.target.set(target); this.routed.set([]); this.lastRouted.set(null); }
  routeNext(): void {
    const next = this.classes.find(item => !this.isRouted(item.index));
    if (!next) return;
    this.routed.update(indices => [...indices, next.index]); this.lastRouted.set(next.index); this.captureComparison();
  }
  routeAll(): void { this.routed.set(this.classes.map(item => item.index)); this.lastRouted.set(3); this.captureComparison(); }
  reset(): void { this.target.set('parity'); this.routed.set([]); this.lastRouted.set(null); this.prediction.set(null); this.allCompared.set([]); }
  private captureComparison(): void {
    if (!this.complete() || this.allCompared().includes(this.target())) return;
    this.allCompared.update(items => [...items, this.target()]);
  }
}
