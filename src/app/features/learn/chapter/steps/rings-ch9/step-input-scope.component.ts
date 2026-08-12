import { Component, computed, signal } from '@angular/core';
import { ContractLens } from './rings-ch9-model';

@Component({
  selector: 'app-rings-ch9-input-scope',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 9.1</p><h2>關鍵不是boundary大小，而是input wires從哪裡接進來</h2><p class="lede">兩份contracts共用additive backbone，multiplication卻問不同範圍：subring只接inside inputs；ideal允許一個input來自整個ambient world。</p></header>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>把一條MULTIPLY input從inside改接到ambient R，只是同一測試變嚴格嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不是，input roles換了</button><button type="button" (click)="prediction.set(true)">是，同一條強弱刻度</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'Ambient scope雖更廣，ideal卻沒有subring的1_R入口；不能畫成單向升級。':'對。先並排trace兩套wiring，不讓panel形狀替你排名。'}}</p>}</section>

      <div class="control-row"><span class="kicker">FOCUS LENS</span><button type="button" [class.active]="lens()==='subring'" (click)="focus('subring')">SUBRING CONTRACT</button><button type="button" class="multiply" [class.active]="lens()==='ideal'" (click)="focus('ideal')">IDEAL CONTRACT</button><button type="button" (click)="trace()">TRACE INPUT ORIGINS</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="contract-scope-lab">
          <section class="scope-panel" [class.active]="lens()==='subring'">
            <p class="kicker">SUBRING · INTERNAL AUTONOMY</p>
            <div class="scope-boundary"><div class="scope-inputs"><div class="scope-input"><strong>s∈S</strong><small>inside</small></div><div class="scope-op">×</div><div class="scope-input"><strong>t∈S</strong><small>inside</small></div></div><div class="wire-origin" [class.traced]="subringTraced()">BOTH WIRES START INSIDE S</div></div>
            <div class="scope-row"><div class="scope-chip required">DIFFERENCE · inside−inside</div><div class="scope-chip required">IDENTITY · 1_R REQUIRED</div></div>
          </section>
          <section class="scope-panel ideal" [class.active]="lens()==='ideal'">
            <p class="kicker">IDEAL · AMBIENT STABILITY</p>
            <div class="scope-boundary"><div class="scope-inputs"><div class="scope-input ambient"><strong>r∈R</strong><small>anywhere ambient</small></div><div class="scope-op">×</div><div class="scope-input"><strong>i∈I</strong><small>inside</small></div></div><div class="wire-origin" [class.traced]="idealTraced()">ONE WIRE STARTS ANYWHERE IN R</div></div>
            <div class="scope-row"><div class="scope-chip required">DIFFERENCE · inside−inside</div><div class="scope-chip not-required">IDENTITY · NOT REQUIRED</div></div>
          </section>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">DEFINITION SCOPE · INPUT WIRING</span><h3>{{lensTitle()}}</h3><p>{{lensReading()}}</p><div class="readout">{{bothTraced()?'inside×inside  ≠  ambient×inside':'trace both panels before comparing'}}</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">↳</span><div><strong>Subring問inside能否自己生活；ideal問inside能否承受整個ambient world</strong><span>不要先問哪個比較強，先問inputs允許從哪裡來。</span></div></section>
      <details><summary>量詞層：兩份compact tests</summary><p>本課subring test要求<code>s−t∈S</code>、<code>st∈S</code>與<code>1_R∈S</code>。Ideal test要求<code>i−j∈I</code>，以及對每個r∈R都有<code>ri∈I</code>。</p></details>
    </article>
  `,
})
export class RingsCh9InputScopeComponent {
  readonly lens = signal<ContractLens>('subring');
  readonly subringTraced = signal(false);
  readonly idealTraced = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly bothTraced = computed(() => this.subringTraced() && this.idealTraced());
  readonly lensTitle = computed(() => this.lens() === 'subring' ? 'INSIDE × INSIDE' : 'AMBIENT × INSIDE');
  readonly lensReading = computed(() => this.lens() === 'subring'
    ? '兩個multiplication inputs都必須已住在boundary內，另有ambient identity入口。'
    : '只有i必須在boundary內；r可以來自ambient R的任何位置，不另要求1_R入場。');
  focus(lens: ContractLens): void { this.lens.set(lens); }
  trace(): void { this.lens() === 'subring' ? this.subringTraced.set(true) : this.idealTraced.set(true); }
  reset(): void { this.lens.set('subring'); this.subringTraced.set(false); this.idealTraced.set(false); this.prediction.set(null); }
}
