import { Component, computed, signal } from '@angular/core';
import {
  CH14_EDGES,
  CH14_IDEALS,
  IdealKey,
  compareIdeals,
  idealRecord,
} from './rings-ch14-model';

@Component({
  selector: 'app-rings-ch14-ideal-lattice-correspondence',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 14.3</p><h2>Quotient 保存的不只是一張 ideal 清單，而是整張 inclusion lattice</h2><p class="lede">把 upstairs 中所有包含 K 的 ideals 排成 diamond，再逐一配對到 downstairs。選兩個節點比較；若它們在 R 中可包含、不可比較或相等，R/K 中的 shadows 會保留完全相同的 order relation。</p></header>
      <span class="map-convention">CORRESPONDENCE THEOREM · J₁⊆J₂ ⇔ J₁/K⊆J₂/K</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>(2) 與 (3) 都包含 K；它們之間必定有一個包含另一個嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set('incomparable')">不一定；兩者不可比較</button><button type="button" (click)="prediction.set('chain')">一定；ideals 會排成 chain</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()==='chain'">{{ prediction()==='incomparable' ? '對；2∉(3)，3∉(2)，所以 lattice 真的是 diamond。' : 'Ideals 不必排成一條線；用兩個中層節點實際測一次。' }}</p> }</section>

      <div class="control-row"><span class="kicker">TRACE</span><button type="button" (click)="matchNext()">MATCH NEXT NODE</button><button type="button" (click)="matchAll()">REVEAL BOTH LATTICES</button><span class="kicker">J₁</span>@for (ideal of ideals; track ideal.key) { <button type="button" [class.active]="leftKey()===ideal.key" (click)="leftKey.set(ideal.key)">{{ ideal.upstairsName }}</button> }<span class="kicker">J₂</span>@for (ideal of ideals; track ideal.key) { <button type="button" [class.active]="rightKey()===ideal.key" (click)="rightKey.set(ideal.key)">{{ ideal.upstairsName }}</button> }<button type="button" (click)="compare()">COMPARE INCLUSION</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="lattice-correspondence-lab">
          <section class="lattice-panel"><div class="tray-heading"><p class="kicker">UPSTAIRS INTERVAL [K,R]</p><strong>ideals J with K⊆J</strong></div><div class="diamond-lattice"><svg class="lattice-edges" viewBox="0 0 400 430" preserveAspectRatio="none" aria-hidden="true"><line x1="200" y1="82" x2="92" y2="215"/><line x1="200" y1="82" x2="308" y2="215"/><line x1="92" y1="215" x2="200" y2="348"/><line x1="308" y1="215" x2="200" y2="348"/></svg>@for (ideal of ideals; track ideal.key) { <button type="button" class="lattice-node" [class]="ideal.tier" [class.selected-a]="leftKey()===ideal.key" [class.selected-b]="rightKey()===ideal.key" (click)="leftKey.set(ideal.key)"><small>{{ ideal.tier }}</small><strong>{{ ideal.upstairsName }}</strong><span>|J|={{ ideal.upstairs.length }}</span></button> }</div></section>

          <div class="lattice-bridge"><span>J ↦ J/K</span><strong>{{ matched().length }}/4 NODES MATCHED</strong>@for (ideal of ideals; track ideal.key) { <i [class.visible]="isMatched(ideal.key)">{{ ideal.upstairsName }} ↔ {{ ideal.downstairsName }}</i> }</div>

          <section class="lattice-panel"><div class="tray-heading"><p class="kicker">DOWNSTAIRS IDEAL LATTICE</p><strong>ideals of R/K</strong></div><div class="diamond-lattice"><svg class="lattice-edges" viewBox="0 0 400 430" preserveAspectRatio="none" aria-hidden="true"><line x1="200" y1="82" x2="92" y2="215"/><line x1="200" y1="82" x2="308" y2="215"/><line x1="92" y1="215" x2="200" y2="348"/><line x1="308" y1="215" x2="200" y2="348"/></svg>@for (ideal of ideals; track ideal.key) { <div class="lattice-node" [class]="ideal.tier" [class.revealed]="isMatched(ideal.key)" [class.selected-a]="leftKey()===ideal.key" [class.selected-b]="rightKey()===ideal.key"><small>{{ isMatched(ideal.key) ? ideal.tier : 'UNMATCHED' }}</small><strong>{{ isMatched(ideal.key) ? ideal.downstairsName : '?' }}</strong><span>{{ isMatched(ideal.key) ? '|L|='+ideal.downstairs.length : 'waiting' }}</span></div> }</div></section>

          <section class="order-comparator" [class.checked]="compared()"><div><small>UPSTAIRS</small><strong>{{ left().upstairsName }} {{ compared() ? relationSymbol() : '?' }} {{ right().upstairsName }}</strong><span>{{ compared() ? relationWords() : 'select two nodes, then compare' }}</span></div><span>{{ compared() ? '⇔' : '?' }}</span><div><small>DOWNSTAIRS</small><strong>{{ left().downstairsName }} {{ compared() ? relationSymbol() : '?' }} {{ right().downstairsName }}</strong><span>{{ compared() ? relationWords() : 'waiting' }}</span></div></section>
        </div>

        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ compared() ? 'ORDER COMPARISON' : 'LATTICE MATCHER' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">J₁ {{ compared() ? relationSymbol() : '?' }} J₂ {{ compared() ? '⇔ J₁/K '+relationSymbol()+' J₂/K' : '· untested downstairs' }}</div></aside>
      </section>

      @if (allMatched() && compared()) { <section class="transfer-strip"><div><p class="kicker">ORDER ISOMORPHISM</p><strong>same four nodes · same four edges · same incomparability</strong></div><p>Correspondence 同時保留 equality、inclusion 與 incomparability；diamond 沒被 quotient 拉直，也沒有新增或刪除 edge。</p></section> }
      <section class="insight"><span class="insight-icon">◇</span><div><strong>R/K 完整保存所有「已同意 K=0」的後續 compression choices</strong><span>一個 downstairs ideal 就是一種可再壓縮的 zero region；整張 lattice 告訴我們這些壓縮彼此誰更強、誰互不相容。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 14.4</strong><p>若 K⊆J，先壓 K、再把 J/K 壓掉，和一開始直接把 J 壓掉，兩條 routes 是否真的產生同一組 final bundles？</p></div>
      <details><summary>正式層：Correspondence Theorem</summary><p>Maps L↦π⁻¹(L) 與 J↦J/K 在 ideals(R/K) 和 ideals(R) containing K 之間互為 inverse。Preimage 與 image 在這個 restricted domain 上都保留 inclusion，因此得到 lattice order isomorphism。</p></details>
    </article>
  `,
})
export class RingsCh14IdealLatticeCorrespondenceComponent {
  readonly ideals = CH14_IDEALS;
  readonly edges = CH14_EDGES;
  readonly matched = signal<readonly IdealKey[]>([]);
  readonly leftKey = signal<IdealKey>('two');
  readonly rightKey = signal<IdealKey>('three');
  readonly compared = signal(false);
  readonly prediction = signal<'incomparable' | 'chain' | null>(null);
  readonly left = computed(() => idealRecord(this.leftKey()));
  readonly right = computed(() => idealRecord(this.rightKey()));
  readonly relation = computed(() => compareIdeals(this.leftKey(), this.rightKey()));
  readonly allMatched = computed(() => this.matched().length === this.ideals.length);
  readonly verdictTitle = computed(() => this.compared()
    ? this.relation() === 'incomparable' ? 'INCOMPARABLE UPSTAIRS · INCOMPARABLE DOWNSTAIRS' : 'THE SAME INCLUSION SURVIVES THE QUOTIENT'
    : 'MATCH NODES · THEN TEST THE EDGES');
  readonly verdictReading = computed(() => this.compared()
    ? `${this.left().upstairsName} 與 ${this.right().upstairsName} 的 relation 是 ${this.relationWords()}；對應 shadows 完全相同。`
    : '逐一揭示四個 node pairs；diamond 的位置與 inclusion edges 都不會改變。');

  isMatched(key: IdealKey): boolean { return this.matched().includes(key); }
  relationWords(): string { return this.relation() === 'subset' ? 'J₁ is contained in J₂' : this.relation() === 'superset' ? 'J₁ contains J₂' : this.relation() === 'equal' ? 'same ideal' : 'neither contains the other'; }
  relationSymbol(): string { return this.relation() === 'subset' ? '⊆' : this.relation() === 'superset' ? '⊇' : this.relation() === 'equal' ? '=' : '∥'; }
  matchNext(): void { const next = this.ideals.find(ideal => !this.isMatched(ideal.key)); if (next) this.matched.update(keys => [...keys, next.key]); }
  matchAll(): void { this.matched.set(this.ideals.map(ideal => ideal.key)); }
  compare(): void { this.matchAll(); this.compared.set(true); }
  reset(): void { this.matched.set([]); this.leftKey.set('two'); this.rightKey.set('three'); this.compared.set(false); this.prediction.set(null); }
}
