import { Component, computed, signal } from '@angular/core';

type ReasonId = 'nonzero' | 'fiber' | 'certificate';

@Component({
  selector: 'app-rings-ch16-maximal-field-correspondence',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch16-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 16.5</p>
        <h2>兩個 every statements，由三條已知 bridge 精確接在一起</h2>
        <p class="lede">這一頁不再掃描finite examples。把前四節已建立的三條理由依因果順序接回去，就能看見「沒有intermediate ideal」與「每個nonzero class可逆」不是相似現象，而是同一certificate被全稱量化。</p>
      </header>
      <span class="map-convention">GENERAL ARGUMENT · COMMUTATIVE UNITAL RINGS · M IS A PROPER IDEAL</span>

      <section class="prediction">
        <div><p class="kicker">組裝前先定位兩端</p><h3>左端量化outside representatives，右端量化nonzero classes；中間缺少哪三種connection？</h3></div>
        <p class="prediction-note">請依序放入：角色翻譯 → fiber invariance → single certificate。</p>
      </section>

      <div class="reason-tile-bank" aria-label="Reason tiles for the maximal field argument">
        <button type="button" [disabled]="used('certificate')" (click)="place('certificate')"><small>SINGLE CERTIFICATE</small><strong>1∈M+(a) ⇔ a+M has inverse</strong></button>
        <button type="button" [disabled]="used('nonzero')" (click)="place('nonzero')"><small>ROLE TRANSLATION</small><strong>a∉M ⇔ a+M≠0+M</strong></button>
        <button type="button" [disabled]="used('fiber')" (click)="place('fiber')"><small>FIBER INVARIANCE</small><strong>same class ⇒ same verdict</strong></button>
        <button type="button" class="distractor" (click)="rejectDistractor()"><small>DISTRACTOR</small><strong>more cards ⇒ more maximal</strong></button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      @if (message()) { <p class="assembly-feedback" [class.warning]="messageWarning()">{{ message() }}</p> }

      <section class="stage stage-grid">
        <div class="quantifier-bridge-lab">
          <section class="bridge-endpoint ideal-endpoint">
            <small>UPSTAIRS EVERY</small><strong>∀ a∉M</strong><span>M+(a)=R</span><b>NO INTERMEDIATE IDEAL</b>
          </section>

          <section class="bridge-reasons">
            <div [class.connected]="used('nonzero')"><span>1</span><small>ROLE TRANSLATION</small><strong>{{ used('nonzero') ? 'a outside M ⇔ a+M nonzero' : 'PLACE FIRST REASON' }}</strong></div>
            <div [class.connected]="used('fiber')"><span>2</span><small>GROUP BY FIBER</small><strong>{{ used('fiber') ? 'many handles share one verdict' : 'PLACE SECOND REASON' }}</strong></div>
            <div [class.connected]="used('certificate')"><span>3</span><small>SAME CERTIFICATE</small><strong>{{ used('certificate') ? '1=i+ra ⇔ inverse dock opens' : 'PLACE THIRD REASON' }}</strong></div>
          </section>

          <section class="bridge-endpoint field-endpoint">
            <small>DOWNSTAIRS EVERY</small><strong>∀ x≠0 in R/M</strong><span>x has multiplicative inverse</span><b>EVERY NONZERO CLASS UNIT</b>
          </section>

          @if (complete()) {
            <div class="general-theorem-seal"><small>MAXIMAL–FIELD CORRESPONDENCE · GENERAL ARGUMENT</small><strong>M maximal ⇔ R/M is a FIELD（體）</strong><span>不是sample count；是三條雙向bridge串成的equivalence。</span></div>
          }
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ complete() ? 'GENERAL ARGUMENT · SYNTHESIS' : 'ARGUMENT ASSEMBLY' }}</span>
          <h3>{{ complete() ? 'BOTH EVERY STATEMENTS NOW MATCH' : 'PLACE REASON '+(placed().length+1)+' OF 3' }}</h3>
          <p>{{ complete() ? 'Outside representatives先按quotient fibers打包；每一bundle的growth certificate與class inverse完全同步。' : nextHint() }}</p>
          <div class="readout">logical bridges {{ placed().length }} / 3 · finite scans used 0</div>
        </aside>
      </section>

      @if (complete()) {
        <section class="transfer-strip">
          <div><p class="kicker">FIXED TRANSFER · Z/nZ</p><strong>若nZ與Z之間還有proper ideal dZ，quotient中會留下什麼痕跡？</strong></div>
          <div class="choice-row"><button type="button" (click)="transfer.set(true)">某個nonzero class沒有inverse</button><button type="button" (click)="transfer.set(false)">every nonzero class仍會可逆</button></div>
          @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對：intermediate ideal對應一個outside seed，其class無法取得identity certificate。' : '若every nonzero class都可逆，三條bridge會反推nZ沒有proper intermediate ideal。' }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">M⇔F</span><div><strong>Maximal ideal與field quotient由每一張identity certificate逐fiber對齊</strong><span>Upstairs沒有中間boundary，正好表示downstairs每個nonzero class都能回到1；兩端不是強弱比喻，而是同一條general equivalence。</span></div></section>
      <div class="next-question"><strong>NEXT CHAPTER · Ch17</strong><p>Field要求nonzero classes都能回到1；若只要求nonzero×nonzero不要塌成zero，會對應哪一種ideal boundary？</p></div>
      <details><summary>完整雙向 proof</summary><p>若M maximal且a+M≠0，則a∉M，所以M+(a)是嚴格包含M的ideal，只能等於R；故1=i+ra，得到a+M可逆。反向若R/M是field，任取M⊊J，選a∈J\M；a+M非零且可逆，所以1=i+ra∈J，因而J=R。</p></details>
    </article>
  `,
})
export class RingsCh16MaximalFieldCorrespondenceComponent {
  readonly placed = signal<readonly ReasonId[]>([]);
  readonly message = signal('');
  readonly messageWarning = signal(false);
  readonly transfer = signal<boolean | null>(null);
  readonly expected: readonly ReasonId[] = ['nonzero', 'fiber', 'certificate'];
  readonly complete = computed(() => this.placed().length === this.expected.length);

  used(id: ReasonId): boolean { return this.placed().includes(id); }
  place(id: ReasonId): void {
    const expected = this.expected[this.placed().length];
    if (id !== expected) {
      this.messageWarning.set(true);
      this.message.set(this.wrongReason(id, expected));
      return;
    }
    this.placed.update(values => [...values, id]);
    this.messageWarning.set(false);
    this.message.set(this.placed().length === 3 ? '三條bridge已接通；現在可以壓縮成一般定理。' : '這一段成立。接著補下一個缺口。');
  }
  rejectDistractor(): void { this.messageWarning.set(true); this.message.set('Cardinality不控制maximality；這張tile無法連接任何一個logical gap。'); }
  wrongReason(id: ReasonId, expected: ReasonId): string {
    if (expected === 'nonzero') return '先把upstairs角色翻成downstairs角色：outside a究竟對應哪一類quotient class？';
    if (expected === 'fiber') return '角色已對齊，但還要先處理many representatives為何共享一個verdict。';
    return id === 'certificate' ? '' : '最後才使用16.2的single certificate，把growth reaches 1與inverse dock接起來。';
  }
  nextHint(): string {
    return [
      '先接角色：a在M外，與a+M不是zero class是同一句話。',
      '再按fiber打包：同一class的不同handles不能產生不同certificate verdict。',
      '最後接single certificate：1進入growth，恰好等於class取得inverse。',
    ][this.placed().length];
  }
  reset(): void { this.placed.set([]); this.message.set(''); this.messageWarning.set(false); this.transfer.set(null); }
}
