import { Component, computed, signal } from '@angular/core';
import {
  certificateForResidue,
  generatedResidues,
  ResidueCertificate,
  RESIDUE_MODULUS,
} from './rings-ch10-model';

type Candidate = 'even' | 'whole';
type TransferAnswer = 'function-ideal' | 'function-whole' | 'integer-both' | null;

@Component({
  selector: 'app-rings-ch10-generated-minimality-certificate',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 10.4</p>
        <h2>安全壓縮還不夠：不能順手抹掉沒有被迫消失的 cards</h2>
        <p class="lede">Even region與whole ring都能安全一起歸零，也都包含4、6。但「由4、6生成」還要求最少傷害：只壓掉ring laws為了讓seeds歸零而強迫壓掉的元素。</p>
      </header>
      <span class="map-convention">PRE-QUOTIENT AUDIT · SAFE SUPERSET ≠ MINIMAL FORCED-ZERO REGION</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>把whole ring全部壓成0也很安全；為什麼它不是4、6所生成的collapse plan？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">它會額外抹掉沒有combination證書的cards</button><button type="button" (click)="prediction.set(true)">因為whole ring不是ideal</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'R當然是ideal；問題不是安全失敗，而是odd cards沒有被4→0與6→0強迫消失。' : '對。Generated需要「足以保持相容」和「沒有unforced erasure」兩面證書。' }}</p> }
      </section>

      <div class="control-row">
        <span class="kicker">COLLAPSE PLAN</span>
        <button type="button" [class.active]="candidate()==='even'" (click)="selectCandidate('even')">E · COLLAPSE EVENS</button>
        <button type="button" [class.active]="candidate()==='whole'" (click)="selectCandidate('whole')">R · COLLAPSE EVERYTHING</button>
        <button type="button" (click)="containsChecked.set(true)">CHECK REQUESTED ZEROS</button>
        <button type="button" (click)="contractChecked.set(true)">CHECK COLLAPSE SAFETY</button>
        <button type="button" [disabled]="!leftLockOpen()" (click)="certificatesTraced.set(true)">AUDIT UNFORCED ERASURE</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="minimality-lab">
          <section class="candidate-boundary" [class.whole]="candidate()==='whole'">
            <div class="tray-heading"><p class="kicker">{{ candidate()==='even' ? 'PLAN E · COLLAPSE EVENS' : 'PLAN R · COLLAPSE WHOLE RING' }}</p><strong>{{ members().length }} cards marked → 0</strong></div>
            <div class="residue-rail certificate-grid">
              @for (value of members(); track value) {
                <div class="residue-slot member" [class.extra]="certificatesTraced() && !certificate(value)">
                  <strong>{{ value }}</strong>
                  @if (certificatesTraced()) {
                    @if (certificate(value); as proof) { <small>{{ proof.leftCoefficient }}·4+{{ proof.rightCoefficient }}·6</small> }
                    @else { <small>UNFORCED ERASURE</small> }
                  } @else { <small>PLANNED → 0</small> }
                </div>
              }
            </div>
          </section>

          <section class="double-lock-desk" aria-live="polite">
            <div class="goal-lock" [class.open]="leftLockOpen()">
              <p class="kicker">LOCK 1 · SAFE COLLAPSE</p>
              <strong>{{ leftLockOpen() ? 'OPEN' : 'CHECK BOTH OBLIGATIONS' }}</strong>
              <span>{{ containsChecked() ? '✓ 4 and 6 marked → 0' : '? requested zeros included' }}</span>
              <span>{{ contractChecked() ? '✓ operations stay compatible' : '? ideal safety contract' }}</span>
            </div>
            <div class="goal-lock minimal" [class.open]="generatedConfirmed()" [class.blocked]="unforcedExtra()!==null">
              <p class="kicker">LOCK 2 · NO UNFORCED ERASURE</p>
              <strong>{{ lockTwoTitle() }}</strong>
              <span>{{ lockTwoReading() }}</span>
            </div>
          </section>
        </div>
        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ certificatesTraced() ? 'GENERAL FORCING + INSTANCE CERTIFICATES' : 'CANDIDATE AUDIT' }}</span>
          <h3>{{ verdictTitle() }}</h3>
          <p>{{ verdictReading() }}</p>
          <div class="readout">safe plan containing requested zeros {{ leftLockOpen() ? '✓' : '?' }} · minimal forced-zero plan {{ generatedConfirmed() ? '✓' : unforcedExtra()!==null ? '× UNFORCED' : '?' }}</div>
        </aside>
      </section>

      @if (generatedConfirmed()) {
        <section class="transfer-match">
          <div><p class="kicker">TRANSFER A · FUNCTION WORLD</p><strong>request a=(1,2) → 0</strong><p>八張(a)與whole function ring都能安全collapse；哪個是最小forced plan？</p><div class="choice-row"><button type="button" (click)="transfer.set('function-ideal')">只壓八張(a)</button><button type="button" (click)="transfer.set('function-whole')">壓掉whole ring</button></div></div>
          <div><p class="kicker">TRANSFER B · ℤ</p><strong>request 6 → 0</strong><p>12與14是否被迫歸零？</p><button type="button" (click)="transfer.set('integer-both')">12=2·6會；14不會</button></div>
          @if (transfer() !== null) { <p class="feedback" [class.warning]="transfer()==='function-whole'">{{ transferFeedback() }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">min</span><div><strong>Generated ideal 是滿足指定歸零的最小安全壓縮</strong><span>不漏掉operations強迫的results，也不抹掉任何沒有coefficient-combination理由的card。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · Ch11</strong><p>現在真的執行collapse：若4被壓成0，為什麼1與5也必須變成同一個新element？</p></div>
      <details><summary>為什麼certificate能證明minimality？</summary><p>任何讓4與6歸零且保持ring operations相容的region，都因absorption與addition而必須包含每個4r+6s，所以所有有certificate的cards都不能省略。反過來，這些combinations本身形成ideal。因此generated ideal既是所有forced combinations，也等於所有含seeds之ideals的intersection。Whole ring雖是安全的larger collapse，odd cards沒有被seeds強迫。</p></details>
    </article>
  `,
})
export class RingsCh10GeneratedMinimalityCertificateComponent {
  readonly allResidues = Array.from({ length: RESIDUE_MODULUS }, (_, value) => value);
  readonly evenResidues = generatedResidues();
  readonly candidate = signal<Candidate>('whole');
  readonly containsChecked = signal(false);
  readonly contractChecked = signal(false);
  readonly certificatesTraced = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<TransferAnswer>(null);
  readonly members = computed(() => this.candidate() === 'even' ? this.evenResidues : this.allResidues);
  readonly leftLockOpen = computed(() => this.containsChecked() && this.contractChecked());
  readonly unforcedExtra = computed(() => {
    if (!this.certificatesTraced()) return null;
    return this.members().find(value => this.certificate(value) === null) ?? null;
  });
  readonly generatedConfirmed = computed(() => this.leftLockOpen() && this.certificatesTraced() && this.unforcedExtra() === null);
  readonly lockTwoTitle = computed(() => !this.certificatesTraced()
    ? 'TRACE REQUIRED'
    : this.unforcedExtra() === null ? 'OPEN' : `BLOCKED BY EXTRA ${this.unforcedExtra()}`);
  readonly lockTwoReading = computed(() => !this.certificatesTraced()
    ? '每張預定抹掉的card都要能追溯到4r+6s。'
    : this.unforcedExtra() === null ? '每張被抹掉的card都有forced combination certificate。' : `${this.unforcedExtra()}是合法ring member，卻不是seeds強迫歸零的combination。`);
  readonly verdictTitle = computed(() => this.generatedConfirmed()
    ? 'E = (4,6) · MINIMAL SAFE COLLAPSE'
    : this.unforcedExtra() !== null ? 'PLAN R IS SAFE · BUT ERASES TOO MUCH' : 'TWO LOCKS REQUIRED');
  readonly verdictReading = computed(() => this.generatedConfirmed()
    ? 'E通過ideal safety contract；每張even card又是任何讓4與6歸零的相容plan都不能拒絕的combination。'
    : this.unforcedExtra() !== null
      ? '不要把R標成不安全。它的問題是抹掉了沒有forced certificate的odd cards，造成不必要的資訊損失。'
      : '先證明plan包含requested zeros且可以安全collapse，再檢查是否有unforced erasure。');
  readonly transferFeedback = computed(() => this.transfer() === 'function-ideal'
    ? '對。Whole function ring是安全的larger collapse，但八張multiple cards才沒有unforced erasure。'
    : this.transfer() === 'function-whole'
      ? 'Whole ring會額外抹掉第二lane為1或3的cards；它們沒有r·(1,2) certificate。'
      : '對。是否被迫歸零靠coefficient certificate，不靠離seed的數線距離。');

  certificate(value: number): ResidueCertificate | null { return certificateForResidue(value); }
  selectCandidate(candidate: Candidate): void {
    this.candidate.set(candidate); this.containsChecked.set(false); this.contractChecked.set(false); this.certificatesTraced.set(false); this.transfer.set(null);
  }
  reset(): void {
    this.candidate.set('whole'); this.containsChecked.set(false); this.contractChecked.set(false); this.certificatesTraced.set(false); this.prediction.set(null); this.transfer.set(null);
  }
}
