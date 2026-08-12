import { Component, computed, signal } from '@angular/core';
import {
  CH13_KERNEL,
  CH13_RESIDUES,
  fiberOf,
  mapToTarget,
  targetLabel,
  translateKernel,
} from './rings-ch13-model';

@Component({
  selector: 'app-rings-ch13-fibers-kernel-translates',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 13.2</p><h2>一條 fiber 不是任意群組；它是整個 kernel 平移後的形狀</h2><p class="lede">先把 kernel 當成三孔 stencil：{{ kernelLabel }}。選一張 anchor card x，把 stencil 的每一孔都加上 x；所得三張 cards，正好就是所有與 x 撞在同一 output 的 inputs。</p></header>
      <span class="map-convention">FIBER GEOMETRY · f⁻¹(f(x)) = x + ker f</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>把 anchor 從 1 換成同一條 fiber 裡的 5，平移出的集合會改變嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不會，5 只換了一個 handle</button><button type="button" (click)="prediction.set(true)">會，anchor 已經不同</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '先實際滑動 stencil；集合可能比代表它的 anchor 更穩定。' : '對；同一條 fiber 內換 anchor，不會換掉整條 fiber。' }}</p> }</section>

      <div class="control-row"><span class="kicker">ANCHOR x</span>@for (value of residues; track value) { <button type="button" [class.active]="anchor()===value" (click)="selectAnchor(value)">{{ value }}</button> }<button type="button" (click)="slideStencil()">SLIDE KERNEL STENCIL</button><button type="button" (click)="trySameFiberHandle()">TRY SAME-FIBER HANDLE</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="fiber-translate-lab">
          <section class="stencil-card"><div class="tray-heading"><p class="kicker">KERNEL STENCIL</p><strong>ker f</strong></div><div class="stencil-slots">@for (value of kernel; track value) { <span><small>k</small><strong>{{ value }}</strong></span> }</div></section>
          <div class="translate-machine"><span>+ {{ anchor() }}</span><strong>TRANSLATE EVERY SLOT</strong><small>mod 12</small></div>
          <section class="translated-card" [class.revealed]="revealed()"><div class="tray-heading"><p class="kicker">x + ker f</p><strong>{{ revealed() ? translatedLabel() : '{?, ?, ?}' }}</strong></div><div class="stencil-slots">@for (value of translated(); track value) { <span><small>{{ anchor() }}+k</small><strong>{{ revealed() ? value : '?' }}</strong></span> }</div></section>

          <section class="fiber-orbit" aria-live="polite"><div class="tray-heading"><p class="kicker">ALL 12 AMBIENT INPUTS</p><strong>output {{ anchorOutput() }}</strong></div><div class="orbit-grid">@for (value of residues; track value) { <button type="button" [class.anchor]="value===anchor()" [class.in-fiber]="revealed() && isInFiber(value)" (click)="selectAnchor(value)"><strong>{{ value }}</strong><small>{{ revealed() && isInFiber(value) ? anchorOutput() : 'ambient' }}</small></button> }</div></section>

          <section class="fiber-equality" [class.verified]="revealed()"><div><small>TRANSLATED STENCIL</small><strong>{{ revealed() ? translatedLabel() : '?' }}</strong></div><span>=</span><div><small>ACTUAL PREIMAGE FIBER</small><strong>{{ revealed() ? fiberLabel() : '?' }}</strong></div></section>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ triedAlternate() ? 'REPRESENTATIVE SWAP' : 'KERNEL TRANSLATION' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">f⁻¹({{ anchorOutput() }}) = {{ anchor() }}+ker f {{ revealed() ? '= ' + fiberLabel() : '' }}</div></aside>
      </section>

      @if (triedAlternate()) { <section class="transfer-strip"><div><p class="kicker">SAME FIBER · NEW HANDLE</p><strong>{{ previousAnchor() }}+ker f = {{ anchor() }}+ker f</strong></div><p>Anchor 換了，但三孔 stencil 落在完全相同的位置。Fiber 是整個 coset，不依賴拿哪一張 card 當代表。</p></section> }
      <section class="insight"><span class="insight-icon">x+K</span><div><strong>所有 fibers 都是同一個 kernel shape 的平移 copies</strong><span>Kernel 不只判斷 pairwise collisions；把它沿著 ring 平移，就一次生成 map 的整個 fiber partition。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 13.3</strong><p>既然每條 fiber 都是 map 無法區分的一整組 inputs，把每組換成一張 quotient card 後，還會剩下任何 collision 嗎？</p></div>
      <details><summary>正式層：為什麼 fiber 等於 x+ker f？</summary><p>y∈f⁻¹(f(x)) ⇔ f(y)=f(x) ⇔ f(y−x)=0 ⇔ y−x∈ker f ⇔ y∈x+ker f。這正是上一節 collision law 的 set-level 版本。</p></details>
    </article>
  `,
})
export class RingsCh13FibersKernelTranslatesComponent {
  readonly residues = CH13_RESIDUES;
  readonly kernel = CH13_KERNEL;
  readonly kernelLabel = `{${CH13_KERNEL.join(',')}}`;
  readonly anchor = signal(1);
  readonly previousAnchor = signal(1);
  readonly revealed = signal(false);
  readonly triedAlternate = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly translated = computed(() => translateKernel(this.anchor()));
  readonly fiber = computed(() => fiberOf(this.anchor()));
  readonly anchorOutput = computed(() => targetLabel(mapToTarget(this.anchor())));
  readonly verdictTitle = computed(() => !this.revealed() ? 'MOVE THE WHOLE KERNEL · NOT ONE POINT' : 'TRANSLATED KERNEL = COMPLETE FIBER');
  readonly verdictReading = computed(() => !this.revealed()
    ? `選定 anchor ${this.anchor()}，再把 kernel 的三個 elements 一起加上它。`
    : `${this.anchor()}+ker f 產生 ${this.translatedLabel()}，正好抓到所有送往 ${this.anchorOutput()} 的 inputs。`);

  translatedLabel(): string { return `{${this.translated().join(',')}}`; }
  fiberLabel(): string { return `{${this.fiber().join(',')}}`; }
  isInFiber(value: number): boolean { return this.fiber().includes(value); }
  selectAnchor(value: number): void { this.anchor.set(value); this.revealed.set(false); this.triedAlternate.set(false); }
  slideStencil(): void { this.revealed.set(true); }
  trySameFiberHandle(): void {
    const members = this.fiber();
    const currentIndex = members.indexOf(this.anchor());
    this.previousAnchor.set(this.anchor());
    this.anchor.set(members[(currentIndex + 1) % members.length]);
    this.revealed.set(true);
    this.triedAlternate.set(true);
  }
  reset(): void { this.anchor.set(1); this.previousAnchor.set(1); this.revealed.set(false); this.triedAlternate.set(false); this.prediction.set(null); }
}
