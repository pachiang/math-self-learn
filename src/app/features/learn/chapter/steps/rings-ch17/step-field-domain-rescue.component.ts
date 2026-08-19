import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-rings-ch17-field-domain-rescue',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch17-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 17.4</p><h2>Field 的 inverse 可以把 zero product 倒帶，因此 maximal 一定 prime</h2><p class="lede">這一頁只證明正向箭頭。假設field中x非零而xy=0；把x的inverse接上等式，看看另一個factor是否還能維持nonzero。</p></header>
      <span class="map-convention">GENERAL ARGUMENT · FIELD ⇒ INTEGRAL DOMAIN · CONVERSE NOT DISCUSSED YET</span>

      <section class="prediction"><div><p class="kicker">倒帶前先預測</p><h3>若x≠0而xy=0，在field裡能否利用x⁻¹保留y≠0？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不能，倒帶會迫使y=0</button><button type="button" (click)="prediction.set(true)">可以，y仍可能非零</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'Field保證x⁻¹存在；把等式兩邊乘上它後，x不能再遮住y。' : '對。inverse會撤銷nonzero x，zero-product witness因此無法存在。' }}</p>}</section>

      <div class="control-row"><button type="button" [disabled]="prediction()===null || step()>=4" (click)="next()">NEXT ALGEBRA STEP</button><button type="button" (click)="replay()">REPLAY</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="inverse-rescue-lab">
          <div class="rescue-equation">
            <div class="rescue-step" [class.visible]="step()>=1"><small>ASSUME A ZERO PRODUCT</small><strong>xy = 0</strong><span>x≠0</span></div>
            <div class="rescue-step" [class.visible]="step()>=2"><small>FIELD SUPPLIES UNDO</small><strong>x⁻¹xy = x⁻¹0</strong><span>attach the same inverse</span></div>
            <div class="rescue-step" [class.visible]="step()>=3"><small>COLLAPSE x⁻¹x</small><strong>1y = 0</strong><span>identity remains</span></div>
            <div class="rescue-step" [class.visible]="step()>=4"><small>ONLY POSSIBLE VERDICT</small><strong>y = 0</strong><span>no nonzero×nonzero crash</span></div>
          </div>
          @if(complete()) { <div class="correspondence-chain"><div><small>CH16</small><strong>M maximal ⇔ R/M field</strong></div><div class="chain-arrow">⇒</div><div><small>THIS PAGE</small><strong>field ⇒ domain</strong></div><div class="chain-result"><small>COMBINE WITH CH17.3 · R/M DOMAIN ⇔ M PRIME</small><strong>M maximal ⇒ M prime</strong></div></div> }
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ complete() ? 'GENERAL ARGUMENT · IMPLICATION' : 'EQUATION REPLAY' }}</span><h3>{{ complete() ? 'INVERSE CONTRACT PREVENTS ZERO COLLAPSE' : 'UNDO STEP '+step()+' / 4' }}</h3><p>{{ complete() ? 'Every nonzero element可逆，比「nonzero product不消失」提供更多控制；因此field一定是domain。' : stepHint() }}</p><div class="readout">inverse available because x≠0 · converse not claimed</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">M⇒P</span><div><strong>Maximal ideal 一定是 prime ideal</strong><span>Maximal讓quotient成為field；field的inverse能消除任何假想zero-product witness，所以quotient必為domain。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 17.5</strong><p>只保證zero product可追溯，是否也足以替每個nonzero element找到inverse？</p></div>
      <details><summary>Field ⇒ domain 的正式條件</summary><p>令F為field。若xy=0且x≠0，則x⁻¹存在，故y=(x⁻¹x)y=x⁻¹(xy)=0。於是F沒有nonzero zero products，是integral domain。本頁只建立單向implication。</p></details>
    </article>
  `,
})
export class RingsCh17FieldDomainRescueComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly step = signal(0);
  readonly complete = computed(() => this.step() === 4);
  next(): void { this.step.update(value => Math.min(4, value + 1)); }
  replay(): void { this.step.set(0); }
  stepHint(): string { return ['先保留x≠0與xy=0。','現在使用field唯一新增的能力：x有inverse。','Associativity讓x⁻¹x先縮成1。','Identity不再遮住y；下一步讀出結果。'][this.step()]; }
  reset(): void { this.prediction.set(null);this.step.set(0); }
}
