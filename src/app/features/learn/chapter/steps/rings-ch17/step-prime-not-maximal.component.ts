import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-rings-ch17-prime-not-maximal',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch17-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 17.5</p><h2>不讓 nonzero product 消失，仍不保證每個 element 都能回到 1</h2><p class="lede">有限examples常讓domain與field、prime與maximal一起出現。改用ℤ/(0)≅ℤ，兩個detectors終於給出不同答案。</p></header>
      <span class="map-convention">NON-DEGENERATE INFINITE EXAMPLE · R=ℤ · P=(0) · SAME QUOTIENT, TWO CONTRACTS</span>

      <section class="prediction"><div><p class="kicker">先判斷反方向</p><h3>已知(0)是prime，是否因此必定maximal？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不一定；兩份contracts不同</button><button type="button" (click)="prediction.set(true)">一定；prime已經足夠強</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'Prime只排除zero-product witness，沒有替2製造integer inverse。' : '對。按REVEAL同時從upstairs inclusion與downstairs behavior找反例。' }}</p>}</section>

      <div class="control-row"><button type="button" [disabled]="prediction()===null" (click)="revealed.set(true)">REVEAL BOTH LENSES</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="strictness-lab">
          <div class="contract-comparison">
            <section class="contract-panel"><small>DOWNSTAIRS CONTRACT A · DOMAIN</small><strong>ℤ/(0) ≅ ℤ</strong><div class="contract-test" [class.pass]="revealed()"><b>NONZERO PRODUCT TEST</b><span>{{ revealed() ? 'nonzero × nonzero ≠ 0 · PASS' : 'pending' }}</span></div><div class="contract-test"><b>WHAT IT PROMISES</b><span>multiplication不會把兩個nonzero factors一起消掉</span></div></section>
            <div class="boundary-switch">≠</div>
            <section class="contract-panel field"><small>DOWNSTAIRS CONTRACT B · FIELD</small><strong>同一個 ℤ</strong><div class="contract-test" [class.fail]="revealed()"><b>INVERSE DOCK FOR 2</b><span>{{ revealed() ? '沒有integer y使2y=1 · FAIL' : 'pending' }}</span></div><div class="contract-test"><b>WHAT IT WOULD NEED</b><span>every nonzero element都能回到1</span></div></section>
          </div>
          @if(revealed()) { <div class="ideal-chain"><small>UPSTAIRS INCLUSION WITNESS · NODE SIZE HAS NO CARDINALITY MEANING</small><span>(0)</span><b>⊊</b><span>2ℤ · PROPER INTERMEDIATE IDEAL</span><b>⊊</b><span>ℤ</span><strong>(0) IS PRIME, BUT NOT MAXIMAL</strong></div><div class="scope-correction"><small>ACCIDENTAL-PROPERTY AUDIT</small><strong>Finite commutative domain會自動成為field；那是finite scope shortcut，不是prime的定義。</strong></div> }
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ revealed() ? 'COUNTEREXAMPLE · CONVERSE REFUTED' : 'TWO-CONTRACT COMPARISON' }}</span><h3>{{ revealed() ? 'PRIME DOES NOT IMPLY MAXIMAL' : 'TEST THE SAME QUOTIENT TWICE' }}</h3><p>{{ revealed() ? 'ℤ沒有nonzero zero products，所以(0)是prime；但2沒有inverse，且(0)與ℤ之間有2ℤ，所以它不maximal。' : '保持quotient不變，分別問「會不會消失」與「能不能回到1」。' }}</p><div class="readout">domain yes · field no · prime yes · maximal no</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">P⇏M</span><div><strong>Prime 防止 nonzero products 消失；maximal 還要求每個 nonzero class 回到 1</strong><span>因此maximal⇒prime，但prime⇏maximal；ℤ中的zero ideal讓兩份contract真正分開。</span></div></section>
      <div class="next-question"><strong>NEXT CHAPTER · Ch18</strong><p>面對陌生quotient，如何先辨認要檢查zero-product trace、inverse dock，還是另一條map／compression路線？</p></div>
      <details><summary>為什麼 finite domain 一定是 field？</summary><p>若R是finite domain且a≠0，multiplication map x↦ax沒有collision，因此在finite set上injective就會surjective；特別地1有preimage，所以存在x使ax=1。這是finite commutative scope下的結果，不可反推所有domains都是fields。</p></details>
    </article>
  `,
})
export class RingsCh17PrimeNotMaximalComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly revealed = signal(false);
  reset(): void { this.prediction.set(null);this.revealed.set(false); }
}
