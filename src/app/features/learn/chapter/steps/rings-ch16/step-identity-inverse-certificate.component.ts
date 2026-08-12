import { Component, computed, signal } from '@angular/core';
import { Pair, pairLabel } from '../rings-ch10/rings-ch10-model';
import { containsPair } from '../rings-ch12/rings-ch12-model';
import { quotientClassLabel, quotientClasses } from '../rings-ch15/rings-ch15-model';
import {
  candidateMembers,
  enlargementCertificates,
  generatedEnlargement,
  growthDestination,
  IDENTITY,
  inverseCertificate,
  MaximalCandidateId,
} from './rings-ch16-model';

type CertificateState = 'blocked' | 'open';

@Component({
  selector: 'app-rings-ch16-identity-inverse-certificate',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch16-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 16.2</p>
        <h2>同一張 identity certificate，一邊打開 whole ring，一邊打開 inverse dock</h2>
        <p class="lede">Class inverse不要求ambient seed本身可逆。真正要找的是 1=i+ra：ideal correction i在quotient中變成zero，留下r作為a的inverse。</p>
      </header>
      <span class="map-convention">COURSE SCOPE · COMMUTATIVE UNITAL RINGS · a+I UNIT ⇔ 1 IN GROW(I; a)</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>a在ambient ring不是unit，它的class仍可能在quotient中可逆嗎？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(true)">可能，product只需相差ideal member</button><button type="button" (click)="prediction.set(false)">不可能，inverse必須完全相同</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對：quotient只要求ra+I=1+I，也就是1−ra∈I。' : '你要求的是ambient inverse；quotient inverse允許ideal correction被wrap成zero。' }}</p> }
      </section>

      <div class="control-row">
        <button type="button" [class.active]="state()==='blocked'" [attr.aria-pressed]="state()==='blocked'" (click)="chooseState('blocked')">BLOCKED · Q + (1,0)</button>
        <button type="button" [class.active]="state()==='open'" [attr.aria-pressed]="state()==='open'" (click)="chooseState('open')">OPEN · K + (0,1)</button>
        <button type="button" [disabled]="stage()!==0" (click)="advance()">BUILD GROWTH</button>
        <button type="button" [disabled]="stage()!==1" (click)="advance()">CHECK IDENTITY</button>
        <button type="button" [disabled]="stage()!==2" (click)="advance()">TRY INVERSE</button>
        <button type="button" (click)="replay()">REPLAY</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="identity-certificate-lab">
          <section class="ambient-certificate-route">
            <small>AMBIENT CERTIFICATE ROUTE</small>
            <div class="certificate-node"><span>OUTSIDE SEED a</span><strong>{{ label(seed()) }}</strong></div>
            <div class="certificate-node" [class.revealed]="stage()>=1"><span>GROW(I; a)</span><strong>{{ stage()>=1 ? destination() : '?' }}</strong></div>
            <div class="certificate-node" [class.revealed]="stage()>=2"><span>IDENTITY 1_R</span><strong>{{ stage()>=2 ? label(identity) : '?' }}</strong><b>{{ stage()>=2 ? (identityReached() ? 'IN GROWTH' : 'STILL OUTSIDE') : 'CHECK PENDING' }}</b></div>
            <div class="identity-equation" [class.revealed]="stage()>=2 && identityReached()"><small>EXACT CERTIFICATE</small><strong>{{ stage()>=2 ? certificateEquation() : '1 = i + r·a' }}</strong></div>
          </section>

          <div class="certificate-wrapper" [class.revealed]="stage()>=2"><span>ideal correction i wraps to zero class</span><b>↓</b><span>same r becomes inverse partner</span></div>

          <section class="quotient-inverse-route">
            <small>QUOTIENT INVERSE ROUTE</small>
            <div class="certificate-node"><span>SOURCE CLASS</span><strong>{{ sourceClassLabel() }}</strong></div>
            <div class="inverse-arrow"><strong>×</strong><small>candidate r+I</small></div>
            <div class="certificate-node" [class.revealed]="stage()>=3"><span>INVERSE PARTNER</span><strong>{{ stage()>=3 ? inverseClassLabel() : '?' }}</strong></div>
            <div class="inverse-dock" [class.docked]="stage()>=3 && hasInverse()" [class.blocked]="stage()>=3 && !hasInverse()"><small>IDENTITY DOCK · 1+I</small><strong>{{ stage()>=3 ? (hasInverse() ? 'DOCKED' : 'NO PARTNER') : 'TRY INVERSE' }}</strong><span>{{ stage()>=3 ? quotientEquation() : 'class product pending' }}</span></div>
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ evidenceLabel() }}</span>
          <h3>{{ stageHeading() }}</h3>
          <p>{{ stageReading() }}</p>
          <div class="readout">1 in GROW {{ stage()>=2 ? (identityReached() ? 'YES' : 'NO') : '?' }} · class inverse {{ stage()>=3 ? (hasInverse() ? 'YES' : 'NO') : '?' }}</div>
        </aside>
      </section>

      @if (stage() >= 3) {
        <section class="transfer-strip">
          <div><p class="kicker">TRANSFER · Z/5Z · NON-SELF INVERSE</p><strong>1=(-5)+3·2同時給出哪兩份證書？</strong></div>
          <div class="choice-row"><button type="button" (click)="transfer.set(true)">GROW(5Z;2)=Z 且2⁻¹=3 mod5</button><button type="button" (click)="transfer.set(false)">只證明2是ambient integer unit</button></div>
          @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對：−5是ideal correction；wrap後消失，留下3·2=1 mod5。' : '2不是Z中的unit；certificate證明的是quotient class的inverse。' }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">1=i+ra</span><div><strong>Growth reaches 1 與 class取得inverse共用同一證書</strong><span>Ambient side的ideal correction i把identity帶進generated boundary；quotient side把i壓成zero，只留下ra=1。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 16.3</strong><p>若這張certificate對每一個nonzero class都存在，整個quotient會成為哪種ring？</p></div>
      <details><summary>雙向 general argument</summary><p>若(a+I)(r+I)=1+I，則1−ra∈I，故1=(1−ra)+ra屬於GROW(I;a)。反向若1=i+ra且i∈I，wrap後i+I=0+I，所以(r+I)(a+I)=1+I。</p></details>
    </article>
  `,
})
export class RingsCh16IdentityInverseCertificateComponent {
  readonly identity = IDENTITY;
  readonly state = signal<CertificateState>('blocked');
  readonly stage = signal(0);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly idealId = computed<MaximalCandidateId>(() => this.state() === 'blocked' ? 'Q' : 'K');
  readonly seed = computed<Pair>(() => this.state() === 'blocked' ? [1, 0] : [0, 1]);
  readonly generated = computed(() => generatedEnlargement(this.idealId(), this.seed()));
  readonly destination = computed(() => growthDestination(this.idealId(), this.seed()));
  readonly sourceClass = computed(() => quotientClasses(this.idealId()).findIndex(bucket => containsPair(bucket.members, this.seed())));
  readonly inverse = computed(() => inverseCertificate(this.idealId(), this.sourceClass()));
  readonly identityReached = computed(() => containsPair(this.generated(), IDENTITY));
  label = pairLabel;

  chooseState(state: CertificateState): void { this.state.set(state); this.stage.set(0); this.transfer.set(null); }
  advance(): void { this.stage.update(stage => Math.min(3, stage + 1)); }
  replay(): void { this.stage.set(0); this.transfer.set(null); }
  hasInverse(): boolean { return this.inverse() !== null; }
  sourceClassLabel(): string { return quotientClassLabel(this.idealId(), this.sourceClass()).split(' · ')[0]; }
  inverseClassLabel(): string { return this.inverse() ? quotientClassLabel(this.idealId(), this.inverse()!.inverseClass).split(' · ')[0] : 'NONE'; }
  certificateEquation(): string {
    const certificate = enlargementCertificates(this.idealId(), this.seed()).find(item => pairKeySafe(item.output) === pairKeySafe(IDENTITY));
    return certificate ? `${pairLabel(IDENTITY)} = ${pairLabel(certificate.idealMember)} + ${pairLabel(certificate.coefficient)}·${pairLabel(this.seed())}` : 'NO IDENTITY CERTIFICATE';
  }
  quotientEquation(): string { return this.inverse() ? `${this.sourceClassLabel()} × ${this.inverseClassLabel()} = 1+I` : `${this.sourceClassLabel()} × ? never reaches 1+I`; }
  evidenceLabel(): string {
    if (this.stage() < 2) return 'STEPWISE CONSTRUCTION';
    return this.identityReached() ? 'EXAMPLE + EXACT CERTIFICATE' : 'FINITE INSTANCE · EXACT NONMEMBERSHIP';
  }
  stageHeading(): string { return ['ONE SEED · TWO READOUTS', 'GENERATED DESTINATION FOUND', 'IDENTITY STATUS FOUND', 'INVERSE STATUS MATCHES'][this.stage()]; }
  stageReading(): string {
    if (this.stage() === 0) return '先讓outside seed依ideal contract生成最小enlargement。';
    if (this.stage() === 1) return `Growth抵達${this.destination()}；下一步只檢查identity是否包含其中。`;
    if (this.stage() === 2) return this.identityReached() ? 'Identity已被i+ra certificate強迫加入；wrap這張certificate即可找到inverse。' : 'Growth停在proper ideal，identity仍outside；因此不可能有inverse certificate。';
    return this.hasInverse() ? '同一張certificate在ambient side打開whole ring，在quotient side打開identity dock。' : 'Identity不在growth內，quotient class也沒有任何partner能抵達1+I。';
  }
  reset(): void { this.state.set('blocked'); this.stage.set(0); this.prediction.set(null); this.transfer.set(null); }
}

function pairKeySafe(pair: Pair): string { return `${pair[0]},${pair[1]}`; }
