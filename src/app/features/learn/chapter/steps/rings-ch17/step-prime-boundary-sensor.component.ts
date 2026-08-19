import { Component, computed, signal } from '@angular/core';
import { FACTOR_PAIRS, FactorPair, sensorReading } from './rings-ch17-model';

@Component({
  selector: 'app-rings-ch17-prime-boundary-sensor',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch17-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 17.2</p><h2>Prime 不阻止 products 進 boundary；它要求至少抓住一個 factor</h2><p class="lede">固定P=6ℤ，依序測三種product。真正的contract breach不是「ab在裡面」，而是a、b都在外面，ab卻被boundary收走。</p></header>
      <span class="map-convention">INTEGER IDEAL CASE · P=6ℤ · GENERAL PRIME RULE APPEARS AFTER THE SENSORS</span>

      <section class="prediction"><div><p class="kicker">先拆掉過強直覺</p><h3>只要ab∈P，就能判定prime contract失敗嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不能，還要看factors</button><button type="button" (click)="prediction.set(true)">能，product進去就失敗</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{ prediction() ? '若a本來就在P，absorption本來就會讓ab留在P；那不是prime failure。' : '對。只有兩個factors都在外面、product卻進P，才形成decisive breach。' }}</p>}</section>

      <div class="control-row"><span class="kicker">SELECT FACTOR PAIR</span>@for(pair of pairs;track pair.a+'-'+pair.b){<button type="button" [class.active]="selected()===pair" [attr.aria-pressed]="selected()===pair" (click)="select(pair)">{{ pair.a }} × {{ pair.b }}</button>}<button type="button" (click)="scan()">RUN THREE SENSORS</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="prime-sensor-lab">
          <div class="sensor-rig">
            <div class="sensor-card" [class.on]="scanned()"><small>FACTOR a</small><strong>{{ selected().a }} {{ reading().aInside ? '∈' : '∉' }} 6ℤ</strong><span>{{ reading().aInside ? 'BOUNDARY ALREADY CAUGHT a' : 'a IS OUTSIDE' }}</span></div>
            <div class="sensor-card" [class.on]="scanned()"><small>FACTOR b</small><strong>{{ selected().b }} {{ reading().bInside ? '∈' : '∉' }} 6ℤ</strong><span>{{ reading().bInside ? 'BOUNDARY ALREADY CAUGHT b' : 'b IS OUTSIDE' }}</span></div>
            <div class="sensor-card inside" [class.on]="scanned()"><small>PRODUCT ab</small><strong>{{ reading().product }} {{ reading().productInside ? '∈' : '∉' }} 6ℤ</strong><span>{{ reading().productInside ? 'PRODUCT INSIDE' : 'PRODUCT STAYS OUTSIDE' }}</span></div>
          </div>
          <div class="breach-gate" [class.breach]="scanned()&&reading().breach" [class.safe]="scanned()&&!reading().breach"><small>PRIME CONTRACT SENSOR</small><strong>{{ scanned() ? gateHeading() : 'WAITING FOR ALL THREE READINGS' }}</strong><span>{{ scanned() ? gateReading() : 'outside a · outside b · inside ab must all be true' }}</span></div>
          <div class="pair-purpose-grid">
            <div><strong>2×3=6</strong><span>two outsiders → inside</span></div><div><strong>2×4=8</strong><span>product stays outside</span></div><div><strong>6×5=30</strong><span>factor already inside</span></div>
          </div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ scanned() ? (reading().breach ? 'WITNESS · UNIVERSAL CLAIM REFUTED' : 'EXAMPLE · NO BREACH IN THIS PAIR') : 'THREE-SENSOR TEST' }}</span><h3>{{ scanned() ? gateHeading() : 'PRIME CHECK NEEDS THREE FACTS' }}</h3><p>{{ scanned() ? gateReading() : '只看product membership會把ordinary ideal absorption誤認為failure。' }}</p><div class="readout">P=6ℤ · pair {{ selected().a }},{{ selected().b }}</div></aside>
      </section>

      <section class="transfer-strip"><div><p class="kicker">GENERAL ARGUMENT · ZERO IDEAL IN ℤ</p><strong>若ab∈(0)，也就是ab=0，第5章的domain promise告訴我們什麼？</strong></div><div class="choice-row"><button type="button" (click)="transfer.set(true)">a=0或b=0，所以至少一個factor在(0)</button><button type="button" (click)="transfer.set(false)">a、b仍可能都非零</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。這是ℤ的general zero-product argument，因此(0)是prime，不是有限抽查。' : 'ℤ在第5章已建立domain behavior；非零×非零不會等於0。' }}</p>}</section>

      <section class="insight"><span class="insight-icon">P</span><div><strong>Prime ideal（質理想）不允許兩個 outsiders 的 product 偷渡進 boundary</strong><span>等價地，若ab∈P，boundary必須已經包含a或b至少一個。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 17.3</strong><p>這張upstairs breach經過projection後，會變成downstairs哪一種熟悉的witness？</p></div>
      <details><summary>正式定義與 scope</summary><p>在本課的commutative unital scope中，proper ideal P稱為prime，若對所有a,b∈R，ab∈P都推出a∈P或b∈P。Proper條件排除P=R；prime element與irreducible element不是本章主題。</p></details>
    </article>
  `,
})
export class RingsCh17PrimeBoundarySensorComponent {
  readonly pairs = FACTOR_PAIRS;
  readonly selected = signal<FactorPair>(FACTOR_PAIRS[0]);
  readonly scanned = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly reading = computed(() => sensorReading(this.selected(), 'six'));
  select(pair: FactorPair): void { this.selected.set(pair); this.scanned.set(false); }
  scan(): void { this.scanned.set(true); }
  gateHeading(): string { return this.reading().breach ? 'BREACH FOUND · 6ℤ IS NOT PRIME' : 'NO BREACH FROM THIS PAIR'; }
  gateReading(): string { const r=this.reading(); if(r.breach)return `${this.selected().a}與${this.selected().b}都在外面，但product ${r.product}在裡面。`; if(!r.productInside)return 'Product沒有進boundary，因此prime implication沒有被觸發。'; return 'Product進boundary，但至少一個factor早已在裡面；contract仍成立。'; }
  reset(): void { this.selected.set(FACTOR_PAIRS[0]);this.scanned.set(false);this.prediction.set(null);this.transfer.set(null); }
}
