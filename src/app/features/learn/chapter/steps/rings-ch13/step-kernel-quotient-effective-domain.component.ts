import { Component, computed, signal } from '@angular/core';
import { CH13_CLASSES, KernelClass, targetLabel } from './rings-ch13-model';

@Component({
  selector: 'app-rings-ch13-kernel-quotient-effective-domain',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 13.3</p><h2>除以 kernel 會消掉剛好所有 collisions，卻不會把不同 outputs 誤合併</h2><p class="lede">Raw map 有 12 張 input cards，卻只有 4 種 reachable outputs。逐條把 kernel fibers 收成 quotient elements，再觀察 induced map 還剩多少重複 handles。</p></header>
      <span class="map-convention">EFFECTIVE DOMAIN · ℤ/12ℤ → (ℤ/12ℤ)/ker f → im f</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>四條 fibers 各壓成一張 card 後，induced map 還會有 collision 嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不會；不同 classes 有不同 outputs</button><button type="button" (click)="prediction.set(true)">會；quotient 本來就是壓縮</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '壓縮不代表任意合併；關鍵是 kernel 是否已經包含全部 collisions。' : '對；kernel quotient 把每一組同 output handles 合成一次，然後停止。' }}</p> }</section>

      <div class="control-row"><span class="kicker">COLLISION REMOVAL</span><button type="button" (click)="mergeNext()">MERGE NEXT FIBER</button><button type="button" (click)="compressAll()">COMPRESS ALL FIBERS</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="effective-domain-lab">
          <section class="raw-domain"><div class="tray-heading"><p class="kicker">RAW DOMAIN · 12 HANDLES</p><strong>{{ extraHandlesRemaining() }} redundant handles remain</strong></div>@for (quotientClass of classes; track quotientClass.index) { <div class="raw-fiber" [class.merged]="isMerged(quotientClass)"><small>fiber {{ quotientClass.index }}</small><div>@for (member of quotientClass.members; track member) { <span>{{ member }}</span> }</div><strong>→ {{ pointLabel(quotientClass) }}</strong></div> }</section>

          <div class="compression-machine"><span>÷ ker f</span><strong>ONE CARD PER FIBER</strong><small>{{ mergedCount() }}/4 merged</small></div>

          <section class="quotient-domain"><div class="tray-heading"><p class="kicker">EFFECTIVE DOMAIN</p><strong>(ℤ/12ℤ)/ker f</strong></div>@for (quotientClass of classes; track quotientClass.index) { <div class="quotient-reader" [class.created]="isMerged(quotientClass)"><span><small>QUOTIENT INPUT</small><strong>{{ isMerged(quotientClass) ? 'C'+quotientClass.index : '?' }}</strong></span><b>→</b><span><small>INDUCED OUTPUT</small><strong>{{ isMerged(quotientClass) ? pointLabel(quotientClass) : '?' }}</strong></span></div> }</section>

          <section class="information-ledger"><div><small>RAW INPUT HANDLES</small><strong>12</strong></div><span>−</span><div><small>PROVEN REDUNDANT</small><strong>{{ removedHandles() }}</strong></div><span>=</span><div><small>CURRENT INPUT HANDLES</small><strong>{{ 12 - removedHandles() }}</strong></div><span>{{ complete() ? '↔' : '→' }}</span><div><small>REACHABLE OUTPUTS</small><strong>4</strong></div></section>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ complete() ? 'KERNEL QUOTIENT COMPLETE' : 'FIBER-BY-FIBER COMPRESSION' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">12 inputs − {{ removedHandles() }} duplicate representatives = {{ 12 - removedHandles() }} effective inputs</div></aside>
      </section>

      @if (complete()) { <section class="transfer-strip"><div><p class="kicker">INJECTIVITY CERTIFICATE</p><strong>C0,C1,C2,C3 → four different image points</strong></div><p>若兩個 quotient classes 仍撞在一起，它們任取 representatives 就會是 f 的 collision，於是早該屬於同一個 kernel coset。矛盾。</p></section> }
      <section class="insight"><span class="insight-icon">R/K</span><div><strong>R/ker f 是這張 map 的 exact effective domain</strong><span>它刪除每條 fiber 裡重複的 handles，但保留不同 outputs 之間的每一道差異；induced map 因而變成 injective。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 13.4</strong><p>四個 quotient elements 對上四個 reachable outputs；但 target 明明有八個 points。真正與 quotient 同構的是哪一塊？</p></div>
      <details><summary>正式層：為什麼 induced map 是 injective？</summary><p>定義 f̄(x+ker f)=f(x)。若 f̄(x+ker f)=f̄(y+ker f)，則 f(x)=f(y)，所以 x−y∈ker f，於是 x+ker f=y+ker f。故 ker f̄ 只有 quotient zero，f̄ 為 injective。</p></details>
    </article>
  `,
})
export class RingsCh13KernelQuotientEffectiveDomainComponent {
  readonly classes = CH13_CLASSES;
  readonly mergedCount = signal(0);
  readonly prediction = signal<boolean | null>(null);
  readonly complete = computed(() => this.mergedCount() === this.classes.length);
  readonly removedHandles = computed(() => this.mergedCount() * 2);
  readonly extraHandlesRemaining = computed(() => 8 - this.removedHandles());
  readonly verdictTitle = computed(() => this.complete()
    ? 'NO COLLISIONS REMAIN · NOTHING EXTRA MERGED'
    : this.mergedCount() === 0 ? 'STACK EACH FIBER BEFORE READING OUTPUT' : `${this.mergedCount()}/4 FIBERS REPLACED BY SINGLE INPUTS`);
  readonly verdictReading = computed(() => this.complete()
    ? '四張 quotient cards 分別送往四個不同 image points；所有舊 collisions 消失，新的 collisions 一個也沒製造。'
    : `每合併一條 fiber，就移除兩個只會重複同一 output 的 representatives。`);

  isMerged(quotientClass: KernelClass): boolean { return quotientClass.index < this.mergedCount(); }
  pointLabel(quotientClass: KernelClass): string { return targetLabel(quotientClass.image); }
  mergeNext(): void { this.mergedCount.update(value => Math.min(this.classes.length, value + 1)); }
  compressAll(): void { this.mergedCount.set(this.classes.length); }
  reset(): void { this.mergedCount.set(0); this.prediction.set(null); }
}
