import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-rings-ch16-maximal-prime-boundary',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch16-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 16.4</p>
        <h2>Maximal 一定 prime；prime 不必 maximal</h2>
        <p class="lede">Field能undo每個nonzero multiplier，所以不可能有nonzero zero product。反方向只知道product不塌成zero，仍可能有nonzero elements永遠碰不到1。</p>
      </header>
      <span class="map-convention">COURSE SCOPE · COMMUTATIVE UNITAL RINGS · GENERAL IMPLICATION + CONTROLLED COUNTEREXAMPLE</span>

      <section class="prediction">
        <div><p class="kicker">先預測 converse</p><h3>若R/P是integral domain，P是否一定maximal？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">一定，domain就是field</button><button type="button" (click)="prediction.set(true)">一般不一定</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對：infinite domain可能有nonzero nonunits；Z會提供exact counterexample。' : 'Finite commutative rings有額外shortcut，但不能把它推廣成一般定理。' }}</p> }
      </section>

      <div class="control-row">
        <button type="button" [disabled]="stage()>=2" (click)="traceForward()">{{ stage()===0 ? 'REVEAL FIELD TOOL' : 'DERIVE DOMAIN' }}</button>
        <button type="button" [disabled]="stage()!==2" (click)="testConverse()">TEST CONVERSE</button>
        <button type="button" (click)="replay()">REPLAY</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="strength-boundary-lab">
          <section class="behavior-implication-row">
            <small>QUOTIENT BEHAVIOR</small>
            <div class="strength-node" [class.revealed]="stage()>=1"><span>EVERY NONZERO HAS INVERSE</span><strong>FIELD</strong></div>
            <div class="one-way-arrow" [class.revealed]="stage()>=2"><strong>→</strong><span>multiply uv=0 by u⁻¹</span></div>
            <div class="strength-node" [class.revealed]="stage()>=2"><span>NO NONZERO ZERO PRODUCT</span><strong>DOMAIN</strong></div>
            <div class="blocked-converse" [class.revealed]="stage()>=3"><strong>↛</strong><span>NO GENERAL CONVERSE</span></div>
          </section>

          <section class="ideal-implication-row">
            <small>IDEAL STATUS</small>
            <div class="strength-node" [class.revealed]="stage()>=1"><span>NO PROPER INTERMEDIATE</span><strong>MAXIMAL</strong><b>K · INSTANCE</b></div>
            <div class="one-way-arrow" [class.revealed]="stage()>=2"><strong>→</strong><span>translate through quotient</span></div>
            <div class="strength-node" [class.revealed]="stage()>=2"><span>PRODUCT TRACE HOLDS</span><strong>PRIME</strong><b>K · INSTANCE</b></div>
            <div class="blocked-converse" [class.revealed]="stage()>=3"><strong>↛</strong><span>INTEGER COUNTEREXAMPLE</span></div>
          </section>

          @if (stage() >= 3) {
            <section class="integer-counterexample">
              <div><small>AMBIENT WORLD</small><strong>Z</strong><span>commutative unital · infinite</span></div>
              <div><small>ZERO IDEAL</small><strong>(0)</strong><span>Z/(0)=Z is a domain → PRIME</span></div>
              <div><small>INVERSE FAILURE</small><strong>2·? = 1 has no integer solution</strong><span>2 is nonzero nonunit</span></div>
              <div><small>INTERMEDIATE IDEAL</small><strong>(0) ⊂ 2Z ⊂ Z</strong><span>NOT MAXIMAL</span></div>
            </section>
          }
          @if (stage() >= 3) {
            <div class="strength-final-seal"><strong>MAXIMAL ⇒ PRIME</strong><span>converse fails in general · finite commutative rings are a special scope</span></div>
          }
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ stage()>=3 ? 'COUNTEREXAMPLE + GENERAL IMPLICATION' : stage()>=2 ? 'GENERAL ARGUMENT' : 'TRACE PENDING' }}</span>
          <h3>{{ stageHeading() }}</h3>
          <p>{{ stageReading() }}</p>
          <div class="readout">MAXIMAL {{ stage()>=2 ? '⇒ PRIME' : '?' }} · PRIME {{ stage()>=3 ? '⇏ MAXIMAL' : '?' }}</div>
        </aside>
      </section>

      @if (stage() >= 3) {
        <section class="transfer-strip">
          <div><p class="kicker">EVIDENCE CHECK</p><strong>在16-card finite function ring找不到prime-not-maximal，能否證明一般converse？</strong></div>
          <div class="choice-row"><button type="button" (click)="transfer.set(false)">可以，complete scan就是general proof</button><button type="button" (click)="transfer.set(true)">不行，finite scope改變結論</button></div>
          @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對：finite commutative domain必為field，所以此scope中prime確實maximal；Z反例證明一般converse失敗。' : 'Finite exhaustion只證明那個finite ring；不能越權推翻infinite counterexample。' }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">⇒</span><div><strong>Field behavior比domain behavior更強</strong><span>因此maximal ideal一定prime；prime只防止zero-product collapse，沒有承諾每個nonzero class能回到1。</span></div></section>
      <div class="next-question"><strong>NEXT CHAPTER · Ch17</strong><p>當兩個ideal同時出現時，「容納兩方」「同時屬於兩方」「由乘法互動生成」會產生哪三種不同boundaries？</p></div>
      <details><summary>Forward proof與finite special case</summary><p>在field中若uv=0且u≠0，乘u⁻¹得v=0，所以field是domain。由Ch15、Ch16 correspondence即得maximal⇒prime。若ring finite commutative，finite domain中的nonzero multiplication maps injective故surjective，因此domain是field；這只是有限scope。</p></details>
    </article>
  `,
})
export class RingsCh16MaximalPrimeBoundaryComponent {
  readonly stage = signal(0);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);

  traceForward(): void { this.stage.update(stage => Math.min(2, stage + 1)); }
  testConverse(): void { this.stage.set(3); }
  replay(): void { this.stage.set(0); this.transfer.set(null); }
  stageHeading(): string { return ['COMPARE TWO STRENGTH LEVELS', 'FIELD INVERSE AVAILABLE', 'FORWARD IMPLICATION COMPLETE', 'CONVERSE BLOCKED BY Z'][this.stage()]; }
  stageReading(): string {
    return [
      '先沿quotient behavior證明field必為domain，再垂直翻回ideal status。',
      '若u≠0，field提供u⁻¹；這是domain本身沒有承諾的extra tool。',
      '由uv=0左乘u⁻¹便得v=0，所以field沒有zero divisors；maximal因此prime。',
      'Z是domain卻不是field：2沒有inverse；對應zero ideal prime卻被2Z隔在whole ring之前。',
    ][this.stage()];
  }
  reset(): void { this.stage.set(0); this.prediction.set(null); this.transfer.set(null); }
}
