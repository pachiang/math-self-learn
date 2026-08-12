import { Component, computed, signal } from '@angular/core';
import {
  CandidateMap,
  IDEAL_I,
  killsIdeal,
  mapDefinition,
  mapOutput,
  zeroFiberOutputs,
} from './rings-ch12-model';

@Component({
  selector: 'app-rings-ch12-map-descent-gate',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 12.2</p>
        <h2>一張 map 若不同意 I=0，就無法讀取 R/I</h2>
        <p class="lede">Quotient zero只有一個input identity，卻有0、4、8三個ambient handles。Candidate map必須把這三張cards送到同一個target zero；否則同一個quotient element會要求多個互相衝突的outputs。</p>
      </header>
      <span class="map-convention">DESCENT GATE · f FACTORS THROUGH R/I IFF I⊆ker f · TEST THE ZERO FIBER FIRST</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>Map f₃(x)=x mod 3 能讀取R/I嗎？注意0、4、8在R/I已是同一個zero element。</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不能，三個handles產生衝突</button><button type="button" (click)="prediction.set(true)">能，每張ambient card都有output</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '問題不是ambient map有沒有output，而是同一個quotient input是否得到唯一output。' : '對。選f₃並逐張送出I；0、1、2三個target outputs會讓gate拒絕它。' }}</p> }
      </section>

      <div class="control-row">
        <span class="kicker">CANDIDATE MAP</span>
        <button type="button" [class.active]="candidate()==='mod2'" (click)="selectMap('mod2')">f₂ · MOD 2</button>
        <button type="button" [class.active]="candidate()==='mod3'" (click)="selectMap('mod3')">f₃ · MOD 3</button>
        <button type="button" [class.active]="candidate()==='zero'" (click)="selectMap('zero')">z · ZERO MAP</button>
        <button type="button" (click)="sendNext()">SEND NEXT I-HANDLE</button>
        <button type="button" (click)="auditAll()">AUDIT WHOLE ZERO FIBER</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="descent-gate-lab">
          <section class="collapsed-input-tile">
            <div class="tray-heading"><p class="kicker">ONE QUOTIENT INPUT · C0=I</p><strong>three ambient handles</strong></div>
            <div class="zero-handle-row">@for (value of ideal; track value) { <span [class.sent]="isSent(value)"><strong>{{ value }}</strong><small>{{ isSent(value) ? 'SENT' : 'HANDLE' }}</small></span> }</div>
          </section>

          <div class="candidate-map-machine"><small>AMBIENT MAP</small><strong>{{ definition().label }}</strong><span>{{ definition().targetLabel }}</span></div>

          <section class="target-sockets" aria-live="polite">
            <div class="tray-heading"><p class="kicker">TARGET OUTPUTS FROM THE SAME INPUT C0</p><strong>{{ distinctSentOutputs().length }} distinct</strong></div>
            @for (value of ideal; track value; let index=$index) {
              <div class="target-route" [class.revealed]="isSent(value)" [class.conflict]="conflict() && isSent(value)"><span>handle {{ value }}</span><strong>→ {{ isSent(value) ? output(value) : '?' }}</strong><small>{{ definition().targetLabel }}</small></div>
            }
          </section>

          <section class="descent-lock" [class.open]="auditComplete() && passes()" [class.blocked]="auditComplete() && !passes()">
            <div><small>OBLIGATION 1</small><strong>I⊆ker f</strong><span>{{ auditComplete() ? (passes() ? '✓ EVERY I-HANDLE → 0' : '× SOME I-HANDLE ≠ 0') : '? AUDIT REQUIRED' }}</span></div>
            <div><small>OBLIGATION 2</small><strong>ONE INPUT → ONE OUTPUT</strong><span>{{ auditComplete() ? (passes() ? '✓ DESCENT POSSIBLE' : '× OUTPUT CONFLICT') : '? WAITING' }}</span></div>
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ auditComplete() ? 'WHOLE ZERO-FIBER AUDIT' : 'DESCENT ELIGIBILITY TEST' }}</span>
          <h3>{{ verdictTitle() }}</h3>
          <p>{{ verdictReading() }}</p>
          <div class="readout">I⊆ker {{ candidateLabel() }} {{ auditComplete() ? (passes() ? '✓' : '×') : '?' }} · induced reader {{ auditComplete() ? (passes() ? 'POSSIBLE' : 'IMPOSSIBLE') : 'UNTESTED' }}</div>
        </aside>
      </section>

      @if (auditedMaps().length >= 2) {
        <section class="transfer-strip"><div><p class="kicker">WHY TESTING I IS ENOUGH</p><strong>若x與y是同一coset，則x−y∈I</strong></div><p>只要I⊆ker f，就有f(x−y)=0，因此f(x)=f(y)。Zero-fiber test會自動保護每一條coset fiber。</p></section>
      }

      <section class="insight"><span class="insight-icon">I⊆ker f</span><div><strong>能否穿過 quotient，只取決於 map 是否殺掉所有已被壓成 0 的 differences</strong><span>Ambient map有output還不夠；它必須對同一coset的所有representatives給出同一target identity。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 12.3</strong><p>通過gate的f₂確實能讀R/I；但class C1應送到target 0還是1，還有任何選擇自由嗎？</p></div>
      <details><summary>正式層：factor through 的必要與充分</summary><p>若f=f̄∘π，則每個i∈I都有f(i)=f̄(π(i))=f̄(0)=0，所以I⊆ker f。反之若I⊆ker f，可令f̄(x+I)=f(x)；因x−y∈I會推出f(x)=f(y)，所以此定義不依賴representative。</p></details>
    </article>
  `,
})
export class RingsCh12MapDescentGateComponent {
  readonly ideal = IDEAL_I;
  readonly candidate = signal<CandidateMap>('mod3');
  readonly sent = signal<readonly number[]>([]);
  readonly prediction = signal<boolean | null>(null);
  readonly auditedMaps = signal<readonly CandidateMap[]>([]);
  readonly definition = computed(() => mapDefinition(this.candidate()));
  readonly auditComplete = computed(() => this.sent().length === this.ideal.length);
  readonly passes = computed(() => killsIdeal(this.candidate()));
  readonly sentOutputs = computed(() => this.sent().map(value => mapOutput(this.candidate(), value)));
  readonly distinctSentOutputs = computed(() => [...new Set(this.sentOutputs())]);
  readonly conflict = computed(() => this.distinctSentOutputs().length > 1 || this.sentOutputs().some(output => output !== 0));
  readonly verdictTitle = computed(() => !this.auditComplete()
    ? 'TEST EVERY HANDLE OF QUOTIENT ZERO'
    : this.passes() ? 'GATE OPEN · MAP CAN DESCEND' : 'GATE BLOCKED · SAME INPUT CONFLICTS');
  readonly verdictReading = computed(() => !this.auditComplete()
    ? `把I的三張handles逐一送進${this.definition().label}；它們現在代表同一個quotient input。`
    : this.passes()
      ? `${this.definition().label}把I全部送到target zero，因此它不會重新區分R/I已合併的representatives。`
      : `${this.definition().label}在C0的三個handles上得到${zeroFiberOutputs(this.candidate()).join('、')}；同一input沒有唯一target output。`);

  output(value: number): number { return mapOutput(this.candidate(), value); }
  isSent(value: number): boolean { return this.sent().includes(value); }
  candidateLabel(): string { return this.candidate() === 'mod2' ? 'f₂' : this.candidate() === 'mod3' ? 'f₃' : 'z'; }
  selectMap(map: CandidateMap): void { this.candidate.set(map); this.sent.set([]); }
  sendNext(): void {
    const next = this.ideal.find(value => !this.isSent(value));
    if (next === undefined) return;
    this.sent.update(values => [...values, next]);
    this.captureAudit();
  }
  auditAll(): void { this.sent.set(this.ideal); this.captureAudit(); }
  reset(): void { this.candidate.set('mod3'); this.sent.set([]); this.prediction.set(null); this.auditedMaps.set([]); }
  private captureAudit(): void {
    if (this.sent().length !== this.ideal.length || this.auditedMaps().includes(this.candidate())) return;
    this.auditedMaps.update(maps => [...maps, this.candidate()]);
  }
}
