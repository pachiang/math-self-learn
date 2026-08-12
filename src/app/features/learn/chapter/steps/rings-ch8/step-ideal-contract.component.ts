import { Component, computed, signal } from '@angular/core';

type Lens = 'difference' | 'absorption';
type Representation = 'function' | 'mod6';

@Component({
  selector: 'app-rings-ch8-ideal-contract',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 8.4</p><h2>Difference stability 加上 ambient absorption，才是 ideal contract</h2><p class="lede">前兩頁不是兩個零散技巧。它們組成一種可遷移的boundary：內部additive differences留內，整個ambient ring的multiplication也推不出去。</p></header>
      <span class="map-convention">COURSE SCOPE · COMMUTATIVE RINGS WITH IDENTITY</span>

      <section class="prediction"><div><p class="kicker">最後一個入口判斷</p><h3>Boundary已通過difference與ambient multiplication ports，還必須包含1_R才算ideal嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不必包含1_R</button><button type="button" (click)="prediction.set(true)">必須包含1_R</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'那是本課subring convention的入口；ideal若含1_R，反而會被ambient absorption迫使成為整個R。':'對。Ideal的multiplication input之一來自整個ambient R，因此不需要把1_R放進boundary。'}}</p>}</section>

      <div class="control-row"><span class="kicker">INSPECTION LENS</span><button type="button" [class.active]="lens()==='difference'" (click)="inspect('difference')">− INTERNAL DIFFERENCE</button><button type="button" class="multiply" [class.active]="lens()==='absorption'" (click)="inspect('absorption')">× AMBIENT ABSORPTION</button>@if(transferUnlocked()){<button type="button" [class.active]="representation()==='mod6'" (click)="toggleRepresentation()">{{representation()==='function'?'TRANSFER · 6ℤ':'BACK · ker(ev_A)'}}</button>}<button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="ideal-contract-lab">
          <section class="ideal-boundary">
            <button type="button" class="ideal-port" [class.active]="lens()==='difference'" [class.checked]="differenceChecked()" (click)="inspect('difference')"><p class="kicker">INTERNAL ADDITIVE STABILITY</p><h3>i−j stays inside</h3><p>{{differenceExample()}}</p><span class="evidence-badge">GENERAL ARGUMENT · 0−0</span></button>
            <button type="button" class="ideal-port ambient" [class.active]="lens()==='absorption'" [class.checked]="absorptionChecked()" (click)="inspect('absorption')"><p class="kicker">EXTERNAL MULTIPLICATIVE STABILITY</p><h3>r·i stays inside</h3><p>{{absorptionExample()}}</p><span class="evidence-badge">GENERAL ARGUMENT · φ(r)·0</span></button>
            <div class="identity-outside"><strong>1_R · NOT REQUIRED</strong><span> · 若1_R∈I，則每個r=r1_R都會被迫進I。</span></div>
          </section>
          <aside class="contract-ledger" aria-live="polite"><p class="kicker">{{representation()==='function'?'ker(ev_A)':'ker(q)=6ℤ'}}</p><div class="contract-line" [class.checked]="differenceChecked()"><strong>{{differenceChecked()?'✓':'?'}} DIFFERENCE PORT</strong><span>{{differenceChecked()?'general reason attached':'inspect this obligation'}}</span></div><div class="contract-line" [class.checked]="absorptionChecked()"><strong>{{absorptionChecked()?'✓':'?'}} AMBIENT PORT</strong><span>{{absorptionChecked()?'general reason attached':'inspect this obligation'}}</span></div>@if(contractComplete()){<div class="ideal-nameplate">IDEAL<br><small>理想 · TWO-PORT CONTRACT</small></div>}@else{<div class="readout">兩個ports都需要自己的general reason。</div>}</aside>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{contractComplete()?'GENERAL THEOREM':'CONTRACT ASSEMBLY'}}</span><h3>{{contractComplete()?'EVERY RING-MAP KERNEL IS AN IDEAL':'INSPECT BOTH PORTS'}}</h3><p>{{lensReading()}}</p><div class="readout">{{contractComplete()?'additive stability + ambient absorption':'one boundary · two different input scopes'}}</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">I</span><div><strong>理想（ideal）容納invisible differences，也承受整個ambient ring的乘法作用</strong><span>Ring-map kernel天然具有這份contract。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · Ch9</strong><p>Subring檢查inside×inside；ideal檢查ambient×inside。它們只是強弱差異嗎？下一章用雙向反例拆開。</p></div>
      <details><summary>正式定義與邊界案例</summary><p>在commutative ring R中，nonempty subset I若對i,j∈I有i−j∈I，且對r∈R、i∈I有ri∈I，就稱I為ideal。&#123;0&#125;與R本身都是ideals；proper ideal等後續需要prime／maximal時再正式使用。</p></details>
    </article>
  `,
})
export class RingsCh8IdealContractComponent {
  readonly lens = signal<Lens>('difference');
  readonly representation = signal<Representation>('function');
  readonly differenceChecked = signal(false);
  readonly absorptionChecked = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly contractComplete = computed(() => this.differenceChecked() && this.absorptionChecked());
  readonly transferUnlocked = computed(() => this.contractComplete());
  readonly differenceExample = computed(() => this.representation() === 'function' ? '(0,a)−(0,b)=(0,a−b)' : '6a−6b=6(a−b)');
  readonly absorptionExample = computed(() => this.representation() === 'function' ? '(r_A,r_B)·(0,b)=(0,r_Bb)' : 'r·6k=6(rk)');
  readonly lensReading = computed(() => this.lens() === 'difference'
    ? '兩個inside inputs維持additive boundary；這是internal stability。'
    : 'Multiplier來自整個ambient R，只有另一個input必須在I；這是external stability。');
  inspect(lens: Lens): void { this.lens.set(lens); lens === 'difference' ? this.differenceChecked.set(true) : this.absorptionChecked.set(true); }
  toggleRepresentation(): void { this.representation.update(value => value === 'function' ? 'mod6' : 'function'); }
  reset(): void { this.lens.set('difference'); this.representation.set('function'); this.differenceChecked.set(false); this.absorptionChecked.set(false); this.prediction.set(null); }
}
