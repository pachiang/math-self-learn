import { Component, computed, signal } from '@angular/core';
import {
  IDEAL_4,
  partitionByIdeal,
  quotientOperation,
  QuotientOperation,
} from './rings-ch11-model';

@Component({
  selector: 'app-rings-ch11-quotient-ring-construction',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 11.4</p>
        <h2>在 ambient ring 計算，再把 raw result 包回 coset</h2>
        <p class="lede">上一節已確保換representative不會換output class。現在可以把whole cosets當作新elements：挑handles、沿用ambient operation、最後只保留result所在的coset。</p>
      </header>
      <span class="map-convention">QUOTIENT RING · R/I=&#123;x+I:x∈R&#125; · [x]+[y]=[x+y] · [x][y]=[xy]</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>C2=&#123;1,5,9&#125;與C4=&#123;3,7,11&#125;相乘：handles 1·3=3、5·7=11，是否產生兩個quotient answers？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不會，3與11在同一coset</button><button type="button" (click)="prediction.set(true)">會，raw results不同</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'Quotient output不是raw residue；3與11只是同一output coset的不同handles。' : '對。切換handles會看見raw result改變，但wrap後的coset label保持不變。' }}</p> }
      </section>

      <div class="control-row">
        <span class="kicker">OPERATION</span>
        <button type="button" [class.active]="operation()==='add'" (click)="setOperation('add')">＋ QUOTIENT ADD</button>
        <button type="button" class="multiply" [class.active]="operation()==='multiply'" (click)="setOperation('multiply')">× QUOTIENT MULTIPLY</button>
        <span class="kicker">LEFT HANDLE</span>
        @for (value of leftClass; track value) { <button type="button" [class.active]="leftRepresentative()===value" (click)="selectLeft(value)">{{ value }}</button> }
        <span class="kicker">RIGHT HANDLE</span>
        @for (value of rightClass; track value) { <button type="button" [class.active]="rightRepresentative()===value" (click)="selectRight(value)">{{ value }}</button> }
        <button type="button" (click)="run()">COMPUTE AND WRAP</button>
        <button type="button" (click)="scanAllRepresentatives()">SCAN ALL 9 HANDLE PAIRS</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="quotient-construction-lab">
          <section class="coset-input-card">
            <div class="tray-heading"><p class="kicker">LEFT QUOTIENT ELEMENT · C2</p><strong>whole coset</strong></div>
            <div class="coset-member-line">@for (value of leftClass; track value) { <span [class.handle]="value===leftRepresentative()">{{ value }}<small>{{ value===leftRepresentative() ? 'HANDLE' : 'SAME ELEMENT' }}</small></span> }</div>
          </section>

          <span class="quotient-operation-port" [class.multiply]="operation()==='multiply'">{{ operationSymbol() }}</span>

          <section class="coset-input-card">
            <div class="tray-heading"><p class="kicker">RIGHT QUOTIENT ELEMENT · C4</p><strong>whole coset</strong></div>
            <div class="coset-member-line">@for (value of rightClass; track value) { <span [class.handle]="value===rightRepresentative()">{{ value }}<small>{{ value===rightRepresentative() ? 'HANDLE' : 'SAME ELEMENT' }}</small></span> }</div>
          </section>

          <div class="compute-wrap-lane" [class.revealed]="hasRun()">
            <div><small>1 · AMBIENT COMPUTE</small><strong>{{ leftRepresentative() }} {{ operationSymbol() }} {{ rightRepresentative() }} = {{ hasRun() ? rawOutput() : '?' }}</strong></div>
            <span>→</span>
            <div><small>2 · WRAP RAW RESULT</small><strong>{{ hasRun() ? rawOutput() + ' ∈ C' + (outputClassIndex()+1) : '? ∈ ?' }}</strong></div>
          </div>

          <section class="coset-output-card" [class.revealed]="hasRun()" aria-live="polite">
            <div class="tray-heading"><p class="kicker">OUTPUT QUOTIENT ELEMENT</p><strong>{{ hasRun() ? 'C' + (outputClassIndex()+1) : 'waiting' }}</strong></div>
            <div class="coset-member-line">@for (value of outputMembers(); track value) { <span>{{ hasRun() ? value : '?' }}<small>{{ hasRun() && value===rawOutput() ? 'RAW HANDLE' : 'SAME OUTPUT' }}</small></span> }</div>
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ activeScanComplete() ? 'FINITE HANDLE SCAN · 9/9' : 'COMPUTE → WRAP' }}</span>
          <h3>{{ verdictTitle() }}</h3>
          <p>{{ verdictReading() }}</p>
          <div class="readout">C2 {{ operationSymbol() }} C4 = {{ hasRun() ? 'C' + (outputClassIndex()+1) : '?' }} · raw handle {{ hasRun() ? rawOutput() : '?' }}</div>
        </aside>
      </section>

      @if (bothOperationsAudited()) {
        <section class="transfer-match">
          <div><p class="kicker">QUOTIENT ZERO</p><strong>0+I = I = &#123;0,4,8&#125;</strong><p>被壓掉的whole ideal正是新ring裡的一個zero element。</p></div>
          <div><p class="kicker">QUOTIENT ONE</p><strong>1+I = &#123;1,5,9&#125;</strong><p>Identity也成為whole coset；不是挑定representative 1才有效。</p></div>
        </section>
      }

      <section class="insight"><span class="insight-icon">R/I</span><div><strong>Quotient ring不是少掉一些舊elements，而是用cosets重做一套新elements</strong><span>Operations先借ambient handles計算，再丟棄handle差異，只保留well-defined的output coset。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 11.5</strong><p>若把zero class從I擴大成J，新的quotient elements會變多、變少，還是重新任意排列？</p></div>
      <details><summary>為什麼ring laws會下降到quotient？</summary><p>Class operations由[x]+[y]=[x+y]與[x][y]=[xy]定義。Well-definedness保證handles可任換；associativity、distributivity與identities則可先在ambient representatives上使用，再包回class。例如([x]+[y])+[z]=[(x+y)+z]=[x+(y+z)]。</p></details>
    </article>
  `,
})
export class RingsCh11QuotientRingConstructionComponent {
  readonly classes = partitionByIdeal(IDEAL_4);
  readonly leftClass = this.classes[1].members;
  readonly rightClass = this.classes[3].members;
  readonly operation = signal<QuotientOperation>('multiply');
  readonly leftRepresentative = signal(1);
  readonly rightRepresentative = signal(3);
  readonly hasRun = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly auditedOperations = signal<readonly QuotientOperation[]>([]);
  readonly operationSymbol = computed(() => this.operation() === 'add' ? '+' : '×');
  readonly result = computed(() => quotientOperation(this.leftRepresentative(), this.rightRepresentative(), this.operation()));
  readonly rawOutput = computed(() => this.result().raw);
  readonly outputClassIndex = computed(() => this.result().outputClass);
  readonly outputMembers = computed(() => this.classes[this.outputClassIndex()].members);
  readonly activeScanComplete = computed(() => this.auditedOperations().includes(this.operation()));
  readonly bothOperationsAudited = computed(() => this.auditedOperations().length === 2);
  readonly verdictTitle = computed(() => !this.hasRun()
    ? 'SELECT HANDLES · THEN WRAP'
    : this.activeScanComplete() ? 'ALL 9 ROUTES LAND IN ONE OUTPUT COSET' : 'RAW RESULT IS ONLY AN OUTPUT HANDLE');
  readonly verdictReading = computed(() => !this.hasRun()
    ? '兩個inputs是whole cosets；被選中的numbers只是送進ambient operation的temporary handles。'
    : this.activeScanComplete()
      ? `目前${this.operation() === 'add' ? 'addition' : 'multiplication'}的9組handle pairs雖產生不同raw residues，output class完全一致。`
      : `${this.rawOutput()}不是quotient answer的全部；它只指出output element C${this.outputClassIndex()+1}。`);

  selectLeft(value: number): void { this.leftRepresentative.set(value); this.hasRun.set(false); }
  selectRight(value: number): void { this.rightRepresentative.set(value); this.hasRun.set(false); }
  setOperation(operation: QuotientOperation): void { this.operation.set(operation); this.hasRun.set(false); }
  run(): void { this.hasRun.set(true); }
  scanAllRepresentatives(): void {
    this.hasRun.set(true);
    if (!this.auditedOperations().includes(this.operation())) this.auditedOperations.update(values => [...values, this.operation()]);
  }
  reset(): void {
    this.operation.set('multiply'); this.leftRepresentative.set(1); this.rightRepresentative.set(3); this.hasRun.set(false); this.prediction.set(null); this.auditedOperations.set([]);
  }
}
