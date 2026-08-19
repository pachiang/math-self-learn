import { Component, signal } from '@angular/core';
import { classLabel, idealLabel, IntegerIdealId, quotientLabel } from './rings-ch17-model';

@Component({
  selector: 'app-rings-ch17-product-boundary-trace',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch17-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 17.1</p>
        <h2>同一個 product，換一條 zero boundary 就可能整個消失</h2>
        <p class="lede">固定ambient ring、兩個factors與乘法結果，只改哪些integers會被quotient壓成zero。Downstairs的zero product不是新事故，而是upstairs membership被看見。</p>
      </header>
      <span class="map-convention">CONTROLLED COMPARISON · R=ℤ · a=2 · b=3 · ONLY THE IDEAL CHANGES</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>2與3在兩邊都不是zero class；哪一個quotient會讓它們的product變成zero？</h3></div>
        <div class="choice-row"><button type="button" (click)="predict('six')">只有 ℤ/6ℤ</button><button type="button" (click)="predict('zero')">只有 ℤ/(0)</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()!=='six'">{{ prediction()==='six' ? '先保留這個判斷；執行同一個product，看差異是否真的只來自boundary。' : '兩邊的ambient product都是6；請追蹤哪條boundary會把6收進zero class。' }}</p> }
      </section>

      <div class="control-row"><button type="button" [disabled]="prediction()===null" (click)="run()">RUN SAME PRODUCT</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="product-trace-lab">
          <div class="trace-worlds">
            @for (world of worlds; track world) {
              <section class="trace-world" [class.active]="revealed()">
                <div class="trace-heading"><div><small>ACTIVE ZERO BOUNDARY</small><strong>{{ idealLabel(world) }}</strong></div><span>{{ quotientLabel(world) }}</span></div>
                <div class="trace-equation">
                  <div class="trace-card"><small>FACTOR a</small><strong>2</strong><span>{{ revealed() ? classLabel(2,world)+' ≠ zero' : 'outside boundary' }}</span></div>
                  <b class="trace-arrow">×</b>
                  <div class="trace-card"><small>FACTOR b</small><strong>3</strong><span>{{ revealed() ? classLabel(3,world)+' ≠ zero' : 'outside boundary' }}</span></div>
                  <b class="trace-arrow">=</b>
                  <div class="trace-card product" [class.zero]="revealed() && world==='six'"><small>PRODUCT</small><strong>6</strong><span>{{ revealed() ? (world==='six' ? '6 ∈ 6ℤ' : '6 ∉ (0)') : 'membership pending' }}</span></div>
                </div>
                <div class="trace-result" [class.crash]="revealed() && world==='six'"><small>DOWNSTAIRS READOUT</small><strong>{{ revealed() ? productReading(world) : '(2+I)(3+I) = ?' }}</strong><span>{{ revealed() ? (world==='six' ? 'PRODUCT CLASS IS ZERO' : 'PRODUCT CLASS SURVIVES') : 'run the shared product' }}</span></div>
              </section>
              @if (!$last) { <div class="boundary-switch" aria-label="Only the ideal changes">⇄</div> }
            }
          </div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ revealed() ? 'CONTROLLED EXAMPLE · EXACT MEMBERSHIP' : 'PREDICTION PENDING' }}</span><h3>{{ revealed() ? 'ZERO PRODUCT TRACED TO THE BOUNDARY' : 'KEEP THE PRODUCT FIXED' }}</h3><p>{{ revealed() ? 'Upstairs兩次都是2·3=6；只有6ℤ把6壓成zero，因此只有ℤ/6ℤ出現nonzero×nonzero=zero。' : '不要改factors、operation或ambient ring；本頁只隔離ideal的作用。' }}</p><div class="readout">fixed: R=ℤ · a=2 · b=3 · ab=6</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">ab→0</span><div><strong>Product class 是 zero，恰好表示 ambient product 落進 ideal</strong><span>Quotient沒有憑空創造zero product；它只把已進入boundary的product顯示成zero class。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 17.2</strong><p>什麼boundary rule能禁止「兩個outsiders相乘後一起消失」？</p></div>
      <details><summary>一般式與本頁 evidence 邊界</summary><p>對任意ideal I，(a+I)(b+I)=ab+I，而ab+I=0+I恰好等價於ab∈I。本頁兩個world是exact examples；一般等價來自quotient equality的定義。</p></details>
    </article>
  `,
})
export class RingsCh17ProductBoundaryTraceComponent {
  readonly worlds: readonly IntegerIdealId[] = ['six', 'zero'];
  readonly prediction = signal<IntegerIdealId | null>(null);
  readonly revealed = signal(false);
  idealLabel = idealLabel;
  quotientLabel = quotientLabel;
  classLabel = classLabel;
  predict(id: IntegerIdealId): void { this.prediction.set(id); this.revealed.set(false); }
  run(): void { this.revealed.set(true); }
  productReading(id: IntegerIdealId): string { return id === 'six' ? '(2+6ℤ)(3+6ℤ)=0+6ℤ' : '(2+(0))(3+(0))=6+(0)'; }
  reset(): void { this.prediction.set(null); this.revealed.set(false); }
}
