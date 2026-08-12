import { Component, computed, signal } from '@angular/core';
import { pairLabel } from '../rings-ch10/rings-ch10-model';
import {
  classInverseAudit,
  idealIsMaximal,
  MaximalCandidateId,
  quotientIsField,
} from './rings-ch16-model';

@Component({
  selector: 'app-rings-ch16-maximal-field-correspondence',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch16-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 16.3</p>
        <h2>Every outside seed 直達 R，正好等於 every nonzero class 有 inverse</h2>
        <p class="lede">把上一節的single-class certificate逐列套用。左端growth destination與右端inverse dock不再是兩份audit，而是同一列的兩種語言。</p>
      </header>
      <span class="map-convention">COURSE SCOPE · COMMUTATIVE UNITAL RINGS · PROPER IDEAL</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>Quotient沒有zero divisors，是否已足以保證每個nonzero class都有inverse？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">一般都足夠</button><button type="button" (click)="prediction.set(true)">不夠，還要逐class開inverse dock</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對：domain只防止nonzero product塌成zero；field還要求每個nonzero class能回到1。' : 'Finite worlds可能讓兩者重合，但那不是一般證明；本頁直接audit inverses。' }}</p> }
      </section>

      <div class="control-row">
        <button type="button" [class.active]="idealId()==='K'" [attr.aria-pressed]="idealId()==='K'" (click)="chooseIdeal('K')">AUDIT R/K</button>
        <button type="button" [class.active]="idealId()==='Q'" [attr.aria-pressed]="idealId()==='Q'" (click)="chooseIdeal('Q')">AUDIT R/Q</button>
        <button type="button" [disabled]="hasAudited()" (click)="auditCurrent()">{{ hasAudited() ? 'CLASS AUDIT COMPLETE' : 'AUDIT ALL NONZERO CLASSES' }}</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="field-audit-lab">
          <div class="field-audit-head"><span>QUOTIENT CLASS</span><span>GENERATED DESTINATION</span><span>INVERSE DOCK</span></div>
          <div class="field-audit-rows">
            @for (row of rows(); track row.classIndex) {
              <button type="button" [class.zero-row]="row.isZero" [class.revealed]="hasAudited()" [class.selected]="selectedClass()===row.classIndex" [attr.aria-pressed]="selectedClass()===row.classIndex" [attr.aria-label]="rowLabel(row.classIndex)" (click)="selectedClass.set(row.classIndex)">
                <span><small>{{ row.isZero ? 'ZERO CLASS · NOT REQUIRED' : 'NONZERO CLASS' }}</small><strong>{{ classShort(row.label) }}</strong><b>rep {{ label(row.representative) }}</b></span>
                <span><small>GROW(I; representative)</small><strong>{{ hasAudited() ? row.growthDestination : '?' }}</strong><b>{{ hasAudited() ? (row.growthDestination==='R' ? 'WHOLE R' : 'PROPER INTERMEDIATE') : 'pending' }}</b></span>
                <span [class.docked]="hasAudited() && row.inverse"><small>MULTIPLICATIVE PARTNER</small><strong>{{ hasAudited() ? inverseReading(row.classIndex) : '?' }}</strong><b>{{ hasAudited() ? (row.isZero ? 'NOT REQUIRED' : row.inverse ? 'DOCKED AT 1+I' : 'NO INVERSE') : 'pending' }}</b></span>
              </button>
            }
          </div>
          @if (hasAudited()) {
            <div class="selected-class-certificate" aria-live="polite">
              <small>SELECTED ROW · EXACT CAUSAL READOUT</small>
              <strong>{{ selectedRowHeading() }}</strong>
              <span>{{ selectedRowReading() }}</span>
            </div>
          }
          @if (hasAudited()) {
            <div class="field-verdict-ledger">
              <div><small>EVERY OUTSIDE GROWTH → R?</small><strong>{{ maximal() ? 'YES' : 'NO' }}</strong><span>{{ idealId() }} {{ maximal() ? 'MAXIMAL' : 'NOT MAXIMAL' }}</span></div>
              <div><small>EVERY NONZERO CLASS UNIT?</small><strong>{{ field() ? 'YES' : 'NO' }}</strong><span>R/{{ idealId() }} {{ field() ? 'FIELD' : 'NOT FIELD' }}</span></div>
            </div>
          }
          @if (fullyAudited()) {
            <div class="maximal-field-seal"><small>MAXIMAL IDEAL THEOREM · GENERAL ARGUMENT</small><strong>M maximal ⇔ R/M is a FIELD（體）</strong><span>field = commutative unital ring, 1≠0, every nonzero element is a unit</span></div>
          }
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ hasAudited() ? 'FINITE EXHAUSTION + GENERAL BRIDGE' : 'CLASS AUDIT PENDING' }}</span>
          <h3>{{ hasAudited() ? fieldVerdict() : 'ZERO CLASS EXEMPT · AUDIT EVERY OTHER ROW' }}</h3>
          <p>{{ hasAudited() ? auditReading() : '每列固定一個quotient class；growth與inverse verdict由同一representative和同一ideal計算。' }}</p>
          @if (hasAudited()) { <div class="readout">nonzero rows {{ nonzeroCount() }} · inverse docks opened {{ dockedCount() }}</div> }
        </aside>
      </section>

      @if (fullyAudited()) {
        <section class="transfer-strip">
          <div><p class="kicker">TRANSFER · Z/5Z INVERSE PARTNERS</p><strong>哪組表明inverse不必等於自己？</strong></div>
          <div class="choice-row"><button type="button" (click)="transfer.set(true)">2 ↔ 3</button><button type="button" (click)="transfer.set(false)">1 ↔ 1</button></div>
          @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對：2·3=1 mod5；R/K的O↔O只是兩元素field的偶然性。' : '1當然self-inverse，但無法修正「所有inverse都不換element」的錯覺。' }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">M↔F</span><div><strong>Maximal ideal 是讓 quotient 成為 field 的exact boundary</strong><span>沒有proper enlargement，等價於每個nonzero class都能用同一張identity certificate打開inverse dock。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 16.4</strong><p>Field一定沒有zero divisors，所以maximal一定prime；反方向也永遠成立嗎？</p></div>
      <details><summary>為什麼這不是依賴 finite-domain shortcut？</summary><p>對每個a∉M，16.2直接證明GROW(M;a)=R等價於a+M可逆。把「每個outside a」量化，就同時得到maximal criterion與field definition；不需先用finite domain⇒field。</p></details>
    </article>
  `,
})
export class RingsCh16MaximalFieldCorrespondenceComponent {
  readonly idealId = signal<MaximalCandidateId>('K');
  readonly auditedIdeals = signal<ReadonlySet<MaximalCandidateId>>(new Set());
  readonly selectedClass = signal(1);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly rows = computed(() => classInverseAudit(this.idealId()));
  readonly maximal = computed(() => idealIsMaximal(this.idealId()));
  readonly field = computed(() => quotientIsField(this.idealId()));
  readonly fullyAudited = computed(() => this.auditedIdeals().size === 2);
  readonly nonzeroCount = computed(() => this.rows().filter(row => !row.isZero).length);
  readonly dockedCount = computed(() => this.rows().filter(row => !row.isZero && row.inverse).length);
  label = pairLabel;

  chooseIdeal(id: MaximalCandidateId): void { this.idealId.set(id); this.selectedClass.set(id === 'K' ? 1 : 1); this.transfer.set(null); }
  auditCurrent(): void {
    this.auditedIdeals.update(values => {
      const next = new Set(values);
      next.add(this.idealId());
      return next;
    });
  }
  hasAudited(): boolean { return this.auditedIdeals().has(this.idealId()); }
  classShort(label: string): string { return label.split(' · ')[0]; }
  inverseReading(classIndex: number): string {
    const row = this.rows()[classIndex];
    if (row.isZero) return '—';
    return row.inverse ? this.classShort(this.rows()[row.inverse.inverseClass].label) : 'NONE';
  }
  rowLabel(classIndex: number): string {
    const row = this.rows()[classIndex];
    if (!this.hasAudited()) return `${row.label}; audit pending`;
    return `${row.label}; growth ${row.growthDestination}; ${row.isZero ? 'zero class not required' : row.inverse ? 'inverse exists' : 'no inverse'}`;
  }
  selectedRowHeading(): string {
    const row = this.rows()[this.selectedClass()];
    if (row.isZero) return `${this.classShort(row.label)} · ZERO CLASS IS EXEMPT`;
    return row.inverse
      ? `${this.classShort(row.label)} → GROW R ↔ INVERSE ${this.inverseReading(row.classIndex)}`
      : `${this.classShort(row.label)} → GROW ${row.growthDestination} ↔ NO INVERSE`;
  }
  selectedRowReading(): string {
    const row = this.rows()[this.selectedClass()];
    if (row.isZero) return 'Field contract只要求nonzero elements可逆；zero row固定保留作角色基準，不列入audit。';
    if (!row.inverse) return `Representative ${this.label(row.representative)} 的growth停在proper ${row.growthDestination}，identity不在其中，因此不存在inverse certificate。`;
    return `${this.label(row.representative)} × ${this.label(row.inverse.inverseRepresentative)} = ${this.label(row.inverse.rawProduct)}；與identity相差ideal member ${this.label(row.inverse.idealCorrection)}，wrap後正好抵達1+I。`;
  }
  fieldVerdict(): string { return this.field() ? 'FIELD（體）· EVERY NONZERO DOCK OPENS' : 'NOT A FIELD · SOME NONZERO DOCKS STAY CLOSED'; }
  auditReading(): string { return this.field() ? 'R/K的唯一nonzero class O直達whole growth，且O×O=1-class。' : 'R/Q的01與10 rows分別停在L與K，也都找不到inverse；只有11 row抵達R。'; }
  reset(): void { this.idealId.set('K'); this.auditedIdeals.set(new Set()); this.selectedClass.set(1); this.prediction.set(null); this.transfer.set(null); }
}
