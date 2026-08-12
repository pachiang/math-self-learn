import { Component, computed, signal } from '@angular/core';
import {
  CH14_CLASSES,
  CH14_RESIDUES,
  directJClass,
  finalBundle,
  firstStageClass,
  secondStageClass,
  setLabel,
} from './rings-ch14-model';

@Component({
  selector: 'app-rings-ch14-two-stage-quotient',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 14.4</p><h2>先壓 K、再壓 J/K，等於一開始直接把 J 壓掉</h2><p class="lede">固定 K=(6)⊆J=(3)。把同一張 ambient card 同時送進兩條 routes：左邊先形成六個 K-cosets，再把相差 J/K 的 cards 合併；右邊直接形成三個 J-cosets。</p></header>
      <span class="map-convention">TWO-STAGE QUOTIENT · (R/K)/(J/K) ≅ R/J</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>兩段 compression 是否可能比直接除以 J 多留一些 distinctions？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set('same')">不會；final bundles 相同</button><button type="button" (click)="prediction.set('more')">會；第一段曾保留六個 classes</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()==='more'">{{ prediction()==='same' ? '關鍵不是 intermediate 有幾張 cards，而是第二段完成後哪些 ambient handles 仍被分開。' : 'Intermediate state 的確較細，但第二段會再合併；比較兩條 routes 的 final fibers。' }}</p> }</section>

      <div class="control-row"><span class="kicker">AMBIENT CARD x</span>@for (value of residues; track value) { <button type="button" [class.active]="selected()===value" (click)="select(value)">{{ value }}</button> }<button type="button" (click)="traceSelected()">TRACE BOTH ROUTES</button><button type="button" (click)="traceNext()">TRACE NEXT UNTESTED</button><button type="button" (click)="traceAll()">COMPARE ALL 12 CARDS</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="two-stage-lab">
          <section class="route-lane two-stage-route"><div class="route-heading"><p class="kicker">ROUTE A · TWO STAGES</p><strong>R → R/K → (R/K)/(J/K)</strong></div><div class="route-flow"><div class="route-node"><small>AMBIENT</small><strong>{{ selected() }}</strong><span>ℤ/12ℤ</span></div><b>→</b><div class="route-node intermediate"><small>AFTER ÷K</small><strong>{{ isTraced(selected()) ? 'C'+firstClass() : '?' }}</strong><span>{{ isTraced(selected()) ? classMembers() : 'six possible cards' }}</span></div><b>→</b><div class="route-node final"><small>AFTER ÷J/K</small><strong>{{ isTraced(selected()) ? 'B'+twoStageResult() : '?' }}</strong><span>{{ isTraced(selected()) ? finalLabel() : 'three final bundles' }}</span></div></div><div class="intermediate-pairs">@for (index of finalIndices; track index) { <span [class.active]="isTraced(selected()) && twoStageResult()===index"><small>SECOND-STAGE B{{ index }}</small><strong>{{ '{C'+index+',C'+(index+3)+'}' }}</strong></span> }</div></section>

          <section class="route-lane direct-route"><div class="route-heading"><p class="kicker">ROUTE B · DIRECT</p><strong>R → R/J</strong></div><div class="route-flow direct"><div class="route-node"><small>AMBIENT</small><strong>{{ selected() }}</strong><span>ℤ/12ℤ</span></div><b>→</b><div class="route-node final"><small>AFTER ÷J</small><strong>{{ isTraced(selected()) ? 'D'+directResult() : '?' }}</strong><span>{{ isTraced(selected()) ? finalLabel() : 'three direct bundles' }}</span></div></div><div class="route-equation" [class.verified]="isTraced(selected())"><span>{{ isTraced(selected()) ? 'B'+twoStageResult() : '?' }}</span><strong>{{ isTraced(selected()) ? '=' : '?' }}</strong><span>{{ isTraced(selected()) ? 'D'+directResult() : '?' }}</span></div></section>

          <section class="final-bundle-rack"><div class="tray-heading"><p class="kicker">FINAL PARTITION OF AMBIENT R</p><strong>{{ traced().length }}/12 cards compared</strong></div>@for (index of finalIndices; track index) { <div [class.complete]="bundleComplete(index)" [class.current]="directResult()===index"><small>TWO-STAGE B{{ index }} = DIRECT D{{ index }}</small><strong>{{ set(bundle(index)) }}</strong><span>@for (value of bundle(index); track value) { <i [class.traced]="isTraced(value)">{{ value }}</i> }</span></div> }</section>
        </div>

        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ allTraced() ? 'PARTITION EQUALITY VERIFIED' : 'TWO-ROUTE TRACE' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">x={{ selected() }} · C{{ firstClass() }} → B{{ twoStageResult() }} {{ isTraced(selected()) ? '= D'+directResult() : '? direct route' }}</div></aside>
      </section>

      @if (allTraced()) { <section class="transfer-strip"><div><p class="kicker">THIRD ISOMORPHISM</p><strong>(R/K)/(J/K) ≅ R/J</strong></div><p>兩條 routes 對所有 ambient inputs 產生相同三條 fibers；對應 Bᵢ↦Dᵢ 也保留 quotient operations，因此不只是同樣多，而是同一個 compression structure。</p></section> }
      <section class="insight"><span class="insight-icon">÷÷=÷</span><div><strong>Nested ideals 讓 compression 可以分段執行，final distinctions 完全不變</strong><span>第一次壓 K 只建立 intermediate handles；第二次壓 J/K 會精確補上從 K 擴到 J 所需的 identifications。</span></div></section>
      <div class="chapter-resolution"><strong>CH14 RESOLUTION</strong><p>Pull back 找到包含 K 的 upstairs ideals；push down 產生唯一 shadows；兩方向保存整張 lattice；nested compression 可分兩段或一次完成。</p></div>
      <details><summary>正式層：Third Isomorphism Theorem</summary><p>若 K⊆J 是 R 的 ideals，則 J/K 是 R/K 的 ideal。Map (r+K)+(J/K)↦r+J well-defined、bijective，並保留 addition 與 multiplication，因此 (R/K)/(J/K)≅R/J。</p></details>
    </article>
  `,
})
export class RingsCh14TwoStageQuotientComponent {
  readonly residues = CH14_RESIDUES;
  readonly classes = CH14_CLASSES;
  readonly finalIndices = [0, 1, 2] as const;
  readonly selected = signal(4);
  readonly traced = signal<readonly number[]>([]);
  readonly prediction = signal<'same' | 'more' | null>(null);
  readonly firstClass = computed(() => firstStageClass(this.selected()));
  readonly twoStageResult = computed(() => secondStageClass(this.firstClass()));
  readonly directResult = computed(() => directJClass(this.selected()));
  readonly allTraced = computed(() => this.traced().length === this.residues.length);
  readonly verdictTitle = computed(() => this.allTraced() ? 'TWO STAGES AND ONE STAGE CREATE THE SAME FIBERS' : this.isTraced(this.selected()) ? 'BOTH ROUTES LAND IN THE SAME FINAL BUNDLE' : 'SEND ONE CARD THROUGH BOTH COMPRESSION ROUTES');
  readonly verdictReading = computed(() => this.allTraced()
    ? '三個 final bundles 在兩條 routes 中逐 card 相同；沒有多留 distinction，也沒有多做 merge。'
    : this.isTraced(this.selected()) ? `${this.selected()} 先到 C${this.firstClass()} 再到 B${this.twoStageResult()}；直接 route 到 D${this.directResult()}，兩者代表同一組 ambient handles。` : 'Intermediate C-class 可能不同，但真正要比較的是第二段之後的 final fiber。');

  select(value: number): void { this.selected.set(value); }
  isTraced(value: number): boolean { return this.traced().includes(value); }
  classMembers(): string { return setLabel(this.classes[this.firstClass()].members); }
  bundle(index: number): readonly number[] { return finalBundle(index); }
  finalLabel(): string { return setLabel(this.bundle(this.directResult())); }
  set(values: readonly number[]): string { return setLabel(values); }
  bundleComplete(index: number): boolean { return this.bundle(index).every(value => this.isTraced(value)); }
  traceSelected(): void { if (!this.isTraced(this.selected())) this.traced.update(values => [...values, this.selected()]); }
  traceNext(): void { const next = this.residues.find(value => !this.isTraced(value)); if (next !== undefined) { this.selected.set(next); this.traceSelected(); } }
  traceAll(): void { this.traced.set(this.residues); }
  reset(): void { this.selected.set(4); this.traced.set([]); this.prediction.set(null); }
}
