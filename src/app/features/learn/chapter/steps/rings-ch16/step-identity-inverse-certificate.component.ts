import { Component, computed, signal } from '@angular/core';
import { Pair, pairKey, pairLabel } from '../rings-ch10/rings-ch10-model';
import {
  enlargementCertificates,
  generatedEnlargement,
  growthDestination,
  IDENTITY,
  inverseCertificate,
  MaximalCandidateId,
  quotientClassIndex,
  quotientClassLabel,
} from './rings-ch16-model';

type CertificateState = 'open' | 'blocked';

@Component({
  selector: 'app-rings-ch16-identity-inverse-certificate',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch16-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 16.2</p>
        <h2>同一張 1=i+ra，一邊打開 growth，一邊打開 inverse</h2>
        <p class="lede">Quotient inverse不要求a在ambient ring本身可逆。只要identity能寫成ideal correction加上一個a的multiple，wrap時i會變成zero，留下r作為a+I的partner。</p>
      </header>
      <span class="map-convention">GENERAL BRIDGE · COMMUTATIVE UNITAL RINGS · a+I UNIT ⇔ 1∈I+(a)</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>Ambient element a不是unit，它的quotient class仍可能可逆嗎？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(true)">可能，product只需和1相差I-element</button><button type="button" (click)="prediction.set(false)">不可能，ambient a必須先是unit</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對：quotient只保留class identity；ideal correction會被wrap成zero。' : '這把ambient inverse和quotient inverse混在一起了；接下來看correction如何消失。' }}</p> }
      </section>

      <div class="control-row">
        <button type="button" [class.active]="state()==='open'" [attr.aria-pressed]="state()==='open'" (click)="chooseState('open')">OPEN · K + a=(0,1)</button>
        <button type="button" [class.active]="state()==='blocked'" [attr.aria-pressed]="state()==='blocked'" (click)="chooseState('blocked')">BLOCKED · Q + a=(1,0)</button>
        <button type="button" [disabled]="stage()>=3" (click)="next()">{{ nextLabel() }}</button>
        <button type="button" (click)="replay()">REPLAY</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="dual-reading-certificate">
          <section class="certificate-reading ambient-reading">
            <div class="reading-heading"><small>UPSTAIRS READING · AMBIENT GROWTH</small><strong>I + OUTSIDE SEED a</strong></div>
            <div class="aligned-token ideal-token"><small>IDEAL CORRECTION i</small><strong>{{ stage()>=2 && certificate() ? label(certificate()!.idealMember) : 'i∈I' }}</strong><span>already available</span></div>
            <span class="equation-symbol">+</span>
            <div class="aligned-token product-token"><small>{{ stage()>=2 ? 'AMBIENT MULTIPLE r·a' : 'OUTSIDE SEED a' }}</small><strong>{{ stage()>=2 ? (certificate() ? label(certificate()!.seedMultiple) : 'NO TERM COMPLETES 1') : stage()>=1 ? label(seed()) : 'a' }}</strong><span>{{ stage()>=2 ? (certificate() ? 'the multiple used in this certificate' : 'growth has no identity certificate') : stage()>=1 ? 'seed begins growth' : 'waiting' }}</span></div>
            <span class="equation-symbol">=</span>
            <div class="aligned-token identity-token" [class.reached]="stage()>=2 && identityReached()" [class.blocked]="stage()>=2 && !identityReached()"><small>IDENTITY 1_R</small><strong>{{ label(identity) }}</strong><span>{{ stage()<2 ? 'membership pending' : identityReached() ? 'IN GROWTH' : 'STILL OUTSIDE' }}</span></div>
            <div class="growth-destination"><small>GENERATED DESTINATION</small><strong>{{ stage()>=1 ? destination() : '?' }}</strong><span>{{ stage()>=1 ? generated().length+' ambient cards' : 'run generation first' }}</span></div>
          </section>

          <div class="wrap-axis" [class.active]="stage()>=3">
            <span>QUOTIENT WRAP</span><strong>i+I → 0+I</strong><b>↓</b><small>same tokens · new reading</small>
          </div>

          <section class="certificate-reading quotient-reading">
            <div class="reading-heading"><small>DOWNSTAIRS READING · QUOTIENT PRODUCT</small><strong>(r+I)(a+I)</strong></div>
            <div class="aligned-token ideal-token wrapped"><small>IDEAL CORRECTION</small><strong>{{ stage()>=3 ? '0+I' : 'i+I' }}</strong><span>{{ stage()>=3 ? 'WRAPPED TO ZERO' : 'not wrapped yet' }}</span></div>
            <span class="equation-symbol">+</span>
            <div class="aligned-token product-token"><small>CLASS PRODUCT</small><strong>{{ stage()>=3 ? sourceClassLabel()+' × '+inverseClassLabel() : '(a+I)(r+I)' }}</strong><span>same r and a</span></div>
            <span class="equation-symbol">=</span>
            <div class="aligned-token identity-token" [class.reached]="stage()>=3 && hasInverse()" [class.blocked]="stage()>=3 && !hasInverse()"><small>IDENTITY DOCK</small><strong>1+I</strong><span>{{ stage()<3 ? 'wrap pending' : hasInverse() ? 'DOCKED' : 'NO PARTNER' }}</span></div>
            <div class="exact-certificate"><small>EXACT CERTIFICATE</small><strong>{{ stage()>=2 ? certificateEquation() : '1=i+r·a' }}</strong><span>{{ stage()>=3 ? quotientEquation() : 'same equation awaits quotient reading' }}</span></div>
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ evidenceLabel() }}</span>
          <h3>{{ stageHeading() }}</h3>
          <p>{{ stageReading() }}</p>
          <div class="readout">1 in growth {{ stage()>=2 ? (identityReached() ? 'YES' : 'NO') : '?' }} · class inverse {{ stage()>=3 ? (hasInverse() ? 'YES' : 'NO') : '?' }}</div>
        </aside>
      </section>

      @if (stage() >= 3) {
        <section class="transfer-strip">
          <div><p class="kicker">NON-DEGENERATE TRANSFER · Z/5Z</p><strong>1=(-5)+3·2同時提供哪兩份證書？</strong></div>
          <div class="choice-row"><button type="button" (click)="transfer.set(true)">GROW(5Z;2)=Z 且(2+5Z)⁻¹=3+5Z</button><button type="button" (click)="transfer.set(false)">只證明2是integer unit</button></div>
          @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對：−5是ideal correction，wrap後只留下3·2=1 mod5。' : '2不是integer unit；certificate證明的是它在quotient中的class可逆。' }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">1=i+ra</span><div><strong>Growth reaches 1 與 class取得inverse是同一張certificate</strong><span>Upstairs把i當作已在ideal中的correction；downstairs把i壓成zero，讓ra直接停靠1-class。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 16.3</strong><p>一張outside seed能抵達R還不夠；什麼條件保證every outside seed都無法停在intermediate ideal？</p></div>
      <details><summary>雙向 general argument</summary><p>若(a+I)(r+I)=1+I，則1−ra∈I，故1=(1−ra)+ra∈I+(a)。反向若1=i+ra且i∈I，wrap後i+I=0+I，因此(r+I)(a+I)=1+I。</p></details>
    </article>
  `,
})
export class RingsCh16IdentityInverseCertificateComponent {
  readonly identity = IDENTITY;
  readonly state = signal<CertificateState>('open');
  readonly stage = signal(0);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly idealId = computed<MaximalCandidateId>(() => this.state() === 'open' ? 'K' : 'Q');
  readonly seed = computed<Pair>(() => this.state() === 'open' ? [0, 1] : [1, 0]);
  readonly generated = computed(() => generatedEnlargement(this.idealId(), this.seed()));
  readonly destination = computed(() => growthDestination(this.idealId(), this.seed()));
  readonly sourceClass = computed(() => quotientClassIndex(this.idealId(), this.seed()));
  readonly inverse = computed(() => inverseCertificate(this.idealId(), this.sourceClass()));
  readonly certificate = computed(() => enlargementCertificates(this.idealId(), this.seed()).find(item => pairKey(item.output) === pairKey(IDENTITY)) ?? null);
  readonly identityReached = computed(() => this.certificate() !== null);
  label = pairLabel;

  chooseState(state: CertificateState): void { this.state.set(state); this.stage.set(0); this.transfer.set(null); }
  next(): void { this.stage.update(stage => Math.min(3, stage + 1)); }
  replay(): void { this.stage.set(0); this.transfer.set(null); }
  hasInverse(): boolean { return this.inverse() !== null; }
  sourceClassLabel(): string { return quotientClassLabel(this.idealId(), this.sourceClass()).split(' · ')[0]; }
  inverseClassLabel(): string { return this.inverse() ? quotientClassLabel(this.idealId(), this.inverse()!.inverseClass).split(' · ')[0] : 'NONE'; }
  nextLabel(): string { return ['GENERATE FROM I AND a', 'ASK WHETHER 1 ARRIVES', 'WRAP I TO ZERO', 'COMPLETE'][this.stage()]; }
  certificateEquation(): string {
    const item = this.certificate();
    return item ? `${pairLabel(IDENTITY)} = ${pairLabel(item.idealMember)} + ${pairLabel(item.coefficient)}·${pairLabel(this.seed())}` : 'NO IDENTITY CERTIFICATE';
  }
  quotientEquation(): string { return this.hasInverse() ? `${this.sourceClassLabel()} × ${this.inverseClassLabel()} = 1+I` : `${this.sourceClassLabel()} × ? never reaches 1+I`; }
  evidenceLabel(): string { return this.stage() < 2 ? 'STEPWISE CONSTRUCTION' : this.identityReached() ? 'EXACT CERTIFICATE' : 'EXACT NONMEMBERSHIP · FINITE INSTANCE'; }
  stageHeading(): string { return ['ONE EQUATION · TWO READINGS', 'GENERATED DESTINATION FOUND', 'IDENTITY STATUS FOUND', 'QUOTIENT READING COMPLETE'][this.stage()]; }
  stageReading(): string {
    if (this.stage() === 0) return '先由I與outside seed生成最小ideal enlargement；目前不假設它會抵達identity。';
    if (this.stage() === 1) return `Growth停在${this.destination()}；下一步只問1_R是否真的被強迫加入。`;
    if (this.stage() === 2) return this.identityReached() ? 'Identity已有i+r·a certificate；現在把i整塊wrap成quotient zero。' : 'Identity仍在growth外，所以不存在可wrap成inverse的certificate。';
    return this.hasInverse() ? '同一張等式在upstairs打開whole growth，在downstairs打開identity dock。' : '沒有identity certificate，quotient class也找不到任何inverse partner。';
  }
  reset(): void { this.state.set('open'); this.stage.set(0); this.prediction.set(null); this.transfer.set(null); }
}
