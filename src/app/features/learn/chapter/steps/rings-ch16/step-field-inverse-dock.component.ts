import { Component, computed, signal } from '@angular/core';
import {
  classInverseAudit,
  identityClassIndex,
  MaximalCandidateId,
  quotientClassLabel,
  quotientClasses,
  quotientIsField,
  quotientProduct,
  zeroClassIndex,
} from './rings-ch16-model';

@Component({
  selector: 'app-rings-ch16-field-inverse-dock',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch16-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 16.1</p>
        <h2>每張 nonzero class 都要有一條路回到 1</h2>
        <p class="lede">CRT剛把多張quotient views拼成座標。現在固定一張quotient，只問它的multiplication還剩多少undo能力：選一張nonzero class，再替它找能抵達identity dock的partner。</p>
      </header>
      <span class="map-convention">DEFINITION SCOPE · COMMUTATIVE UNITAL QUOTIENT · ZERO CLASS EXEMPT</span>

      <section class="prediction">
        <div><p class="kicker">先預測，不先看完整表</p><h3>你選的source class，哪張partner能讓product抵達1+I？若沒有，就選NO PARTNER。</h3></div>
        <p class="prediction-note">一列成功只是example；field behavior要求every nonzero row都成功。</p>
      </section>

      <div class="control-row">
        <span class="kicker">ACTIVE QUOTIENT</span>
        <button type="button" [class.active]="idealId()==='K'" [attr.aria-pressed]="idealId()==='K'" (click)="chooseWorld('K')">R/K · 2 CLASSES</button>
        <button type="button" [class.active]="idealId()==='Q'" [attr.aria-pressed]="idealId()==='Q'" (click)="chooseWorld('Q')">R/Q · 4 CLASSES</button>
        <button type="button" [disabled]="auditedCurrent()" (click)="auditRemaining()">{{ auditedCurrent() ? 'FINITE AUDIT COMPLETE' : 'AUDIT REMAINING CLASSES' }}</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="inverse-dock-lab">
          <div class="dock-reference-row">
            <div><small>ZERO CLASS</small><strong>{{ shortLabel(zeroIndex()) }}</strong><span>EXEMPT · inverse不可能要求zero</span></div>
            <div><small>IDENTITY CLASS</small><strong>{{ shortLabel(oneIndex()) }}</strong><span>PRODUCT TARGET · 1+{{ idealId() }}</span></div>
          </div>

          <section class="dock-workbench">
            <div class="dock-column source-column">
              <small>1 · SOURCE CLASS</small>
              @for (row of rows(); track row.classIndex) {
                <button type="button" [disabled]="row.isZero" [class.active]="sourceClass()===row.classIndex" [attr.aria-pressed]="sourceClass()===row.classIndex" (click)="selectSource(row.classIndex)">
                  <strong>{{ shortLabel(row.classIndex) }}</strong><span>{{ row.isZero ? 'ZERO · EXEMPT' : 'NONZERO' }}</span>
                </button>
              }
            </div>

            <div class="dock-column partner-column">
              <small>2 · PREDICT PARTNER</small>
              @for (bucket of classes(); track $index) {
                <button type="button" [class.active]="partnerClass()===$index" [attr.aria-pressed]="partnerClass()===$index" (click)="choosePartner($index)">
                  <strong>{{ shortLabel($index) }}</strong><span>TRY THIS CLASS</span>
                </button>
              }
              <button type="button" class="no-partner" [class.active]="partnerClass()===null" [attr.aria-pressed]="partnerClass()===null" (click)="choosePartner(null)">NO PARTNER</button>
            </div>

            <div class="product-route" [class.tested]="tested()">
              <small>3 · CLASS PRODUCT</small>
              <strong>{{ tested() ? productEquation() : shortLabel(sourceClass()) + ' × ?' }}</strong>
              <span>{{ tested() ? (docked() ? 'OUTPUT MATCHES 1+I' : 'OUTPUT MISSES 1+I') : 'choose a prediction' }}</span>
              <button type="button" [disabled]="partnerClass()===undefined" (click)="testPrediction()">RUN PRODUCT</button>
            </div>

            <div class="identity-dock" [class.docked]="tested() && docked()" [class.blocked]="tested() && !docked()">
              <small>IDENTITY DOCK · {{ shortLabel(oneIndex()) }}</small>
              <strong>{{ !tested() ? 'WAITING' : docked() ? 'DOCKED' : 'NO MATCH' }}</strong>
              <span>{{ feedback() }}</span>
            </div>
          </section>

          @if (auditedCurrent()) {
            <section class="compact-class-audit" aria-live="polite">
              @for (row of rows(); track row.classIndex) {
                <div [class.zero]="row.isZero" [class.pass]="!row.isZero && row.inverse" [class.fail]="!row.isZero && !row.inverse">
                  <small>{{ row.isZero ? 'EXEMPT' : 'NONZERO CLASS' }}</small>
                  <strong>{{ shortLabel(row.classIndex) }}</strong>
                  <span>{{ row.isZero ? 'not audited' : row.inverse ? 'partner '+shortLabel(row.inverse.inverseClass) : 'NO PARTNER' }}</span>
                </div>
              }
            </section>
          }

          @if (bothAudited()) {
            <section class="field-comparison-ledger">
              <div><small>R/K</small><strong>EVERY NONZERO DOCK OPENS</strong><span>FIELD（體）· THIS FINITE QUOTIENT</span></div>
              <div><small>R/Q</small><strong>SOME DOCKS STAY CLOSED</strong><span>NOT A FIELD</span></div>
            </section>
          }
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ auditedCurrent() ? 'FINITE EXHAUSTION · ACTIVE QUOTIENT' : tested() ? 'EXAMPLE · EXACT CLASS PRODUCT' : 'PREDICTION PENDING' }}</span>
          <h3>{{ verdictHeading() }}</h3>
          <p>{{ verdictReading() }}</p>
          <div class="readout">nonzero rows {{ nonzeroCount() }} · inverse docks {{ auditedCurrent() ? dockedCount() : '?' }}</div>
        </aside>
      </section>

      @if (bothAudited()) {
        <section class="transfer-strip">
          <div><p class="kicker">ACCIDENTAL-PROPERTY CHECK · Z/5Z</p><strong>R/K裡唯一nonzero class剛好self-inverse。一般inverse也會永遠等於自己嗎？</strong></div>
          <div class="choice-row"><button type="button" (click)="transfer.set(true)">不會，2×3=1 mod 5</button><button type="button" (click)="transfer.set(false)">會，partner必須同一張</button></div>
          @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對：2與3互為inverse；self-inverse只是兩元素field的偶然性。' : 'Z/5Z中2的inverse是3，角色不必由同一element扮演。' }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">→1</span><div><strong>Field behavior = every nonzero element都有multiplicative undo</strong><span>Zero class固定豁免；一個成功product只證明一列，必須每個nonzero class都能打開identity dock。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 16.2</strong><p>一張ambient card本身不是unit，為什麼它的quotient class仍可能找到inverse？</p></div>
      <details><summary>Field 的正式定義</summary><p>Field（體）是commutative unital ring，且0≠1、每個nonzero element都有multiplicative inverse。本頁先讓這項behavior可見；finite scan只證明畫面中的兩個quotients。</p></details>
    </article>
  `,
})
export class RingsCh16FieldInverseDockComponent {
  readonly idealId = signal<MaximalCandidateId>('K');
  readonly sourceClass = signal(1);
  readonly partnerClass = signal<number | null | undefined>(undefined);
  readonly tested = signal(false);
  readonly audited = signal<ReadonlySet<MaximalCandidateId>>(new Set());
  readonly transfer = signal<boolean | null>(null);
  readonly classes = computed(() => quotientClasses(this.idealId()));
  readonly rows = computed(() => classInverseAudit(this.idealId()));
  readonly zeroIndex = computed(() => zeroClassIndex(this.idealId()));
  readonly oneIndex = computed(() => identityClassIndex(this.idealId()));
  readonly nonzeroCount = computed(() => this.rows().filter(row => !row.isZero).length);
  readonly dockedCount = computed(() => this.rows().filter(row => !row.isZero && row.inverse).length);
  readonly bothAudited = computed(() => this.audited().size === 2);

  chooseWorld(id: MaximalCandidateId): void {
    this.idealId.set(id);
    this.sourceClass.set(this.rows().find(row => !row.isZero)?.classIndex ?? 0);
    this.partnerClass.set(undefined);
    this.tested.set(false);
  }
  selectSource(classIndex: number): void { this.sourceClass.set(classIndex); this.partnerClass.set(undefined); this.tested.set(false); }
  choosePartner(classIndex: number | null): void { this.partnerClass.set(classIndex); this.tested.set(false); }
  testPrediction(): void { this.tested.set(true); }
  auditRemaining(): void { this.audited.update(set => new Set([...set, this.idealId()])); }
  auditedCurrent(): boolean { return this.audited().has(this.idealId()); }
  shortLabel(index: number): string { return quotientClassLabel(this.idealId(), index).split(' · ')[0]; }
  docked(): boolean {
    const partner = this.partnerClass();
    if (partner === null) return this.rows()[this.sourceClass()].inverse === null;
    return partner !== undefined && quotientProduct(this.idealId(), this.sourceClass(), partner) === this.oneIndex();
  }
  productEquation(): string {
    const partner = this.partnerClass();
    if (partner === null) return `${this.shortLabel(this.sourceClass())} × ? · CLAIM NONE`;
    if (partner === undefined) return `${this.shortLabel(this.sourceClass())} × ?`;
    return `${this.shortLabel(this.sourceClass())} × ${this.shortLabel(partner)} = ${this.shortLabel(quotientProduct(this.idealId(), this.sourceClass(), partner))}`;
  }
  feedback(): string {
    if (!this.tested()) return 'product尚未執行';
    const actual = this.rows()[this.sourceClass()].inverse;
    if (this.docked()) return this.partnerClass() === null ? '正確：所有class partners都會miss' : '正確：這張partner抵達1+I';
    return actual ? `這列其實可由${this.shortLabel(actual.inverseClass)}打開dock` : '你選的partner會miss；而且這列確實沒有任何inverse';
  }
  verdictHeading(): string {
    if (!this.auditedCurrent()) return this.tested() ? (this.docked() ? 'THIS PREDICTION WORKS' : 'THIS PREDICTION MISSES') : 'TRY ONE NONZERO ROW FIRST';
    return quotientIsField(this.idealId()) ? 'FIELD BEHAVIOR · EVERY NONZERO DOCK OPENS' : 'NOT A FIELD · SOME NONZERO DOCKS STAY CLOSED';
  }
  verdictReading(): string {
    if (!this.auditedCurrent()) return '先親手完成一列；再用finite audit回答every nonzero class是否都成功。';
    return quotientIsField(this.idealId()) ? 'Active quotient的每一張nonzero class都有multiplicative partner抵達identity class。' : '至少一張nonzero class沒有任何partner能抵達identity；因此field contract失敗。';
  }
  reset(): void {
    this.idealId.set('K'); this.sourceClass.set(1); this.partnerClass.set(undefined); this.tested.set(false); this.audited.set(new Set()); this.transfer.set(null);
  }
}
