import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-rings-ch9-ideal-not-unital-subring',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 9.3</p><h2>Kernel 承受所有ambient multipliers，卻沒有本課subring需要的1</h2><p class="lede">Ideal absorption其實已涵蓋inside×inside。K的subring verdict失敗，不是乘法壞掉，而是ambient identity不在boundary裡。</p></header>
      <span class="map-convention">COURSE CONVENTION · SUBRINGS SHARE AMBIENT 1_R</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>K已通過difference與ambient absorption，能否直接判定為本課subring？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不能，還要檢查1_R</button><button type="button" (click)="prediction.set(true)">可以，ideal一定是subring</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'Absorption會給internal product，但不會把ambient identity補進K。':'對。先derive internal product，再單獨送identity beacon。'}}</p>}</section>

      <div class="control-row"><button type="button" [disabled]="internalDerived()" (click)="deriveInternal()">DERIVE INTERNAL PRODUCT</button><button type="button" [disabled]="!internalDerived()||identitySent()" (click)="sendIdentity()">SEND AMBIENT IDENTITY</button>@if(identitySent()){<button type="button" (click)="transfer.set(!transfer())">{{transfer()?'BACK · KERNEL K':'TRANSFER · 2ℤ⊂ℤ'}}</button>}<button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="kernel-convention-lab">
          <section class="kernel-evidence">
            <p class="kicker">{{transfer()?'2ℤ INSIDE ℤ':'K = ker(ev_A)'}}</p>
            <div class="derived-seals"><div class="derived-seal pass"><strong>✓ DIFFERENCE</strong><small>{{transfer()?'2a−2b=2(a−b)':'Ch8 general argument'}}</small></div><div class="derived-seal pass"><strong>✓ AMBIENT ABSORPTION</strong><small>{{transfer()?'r·2k=2(rk)':'r∈R, i∈K'}}</small></div><div class="derived-seal" [class.pass]="internalDerived()"><strong>{{internalDerived()?'✓':'?'}} INTERNAL PRODUCT</strong><small>{{internalDerived()?'inside×inside is a special case':'derive from ambient scope'}}</small></div></div>
            <div class="kernel-shell"><strong>{{transfer()?'…, −4, −2, 0, 2, 4, …':'(0,0) · (0,1) · (0,2) · (0,3)'}}</strong></div>
          </section>
          <div class="identity-entry"><div class="identity-beacon-small">{{transfer()?'1_ℤ':'1_R=(1,1)'}}</div><div class="fiber-arrow"></div><div class="identity-barrier" [style.opacity]="identitySent()?1:.3">{{identitySent()?'OUTSIDE BOUNDARY':'ENTRY UNTESTED'}}</div></div>
          <aside class="verdict-ledger"><div class="ledger-line pass">✓ DIFFERENCE</div><div class="ledger-line" [class.pass]="internalDerived()">{{internalDerived()?'✓':'?'}} INTERNAL PRODUCT</div><div class="ledger-line pass">✓ AMBIENT ABSORPTION</div><div class="ledger-line" [class.fail]="identitySent()">{{identitySent()?'×':'?'}} SAME 1_R</div></aside>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{identitySent()?'COURSE-CONVENTION VERDICT':'GENERAL ARGUMENT'}}</span><h3>{{finalVerdict()}}</h3><p>{{reading()}}</p><div class="readout">ambient×inside includes inside×inside · identity is a separate gate</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">1∉</span><div><strong>Ideal的multiplication reach更廣，但沒有subring的identity entrance</strong><span>兩份contracts不能排成單一直線。</span></div></section>
      <details><summary>Convention為什麼改變subring verdict？</summary><p>在commutative ring中，ideal一定對internal multiplication closed。若教材允許non-unital subrings，K與2ℤ也可稱為subrings；本課要求subring包含ambient 1_R，因此proper ideals不通過這個entry gate。</p></details>
    </article>
  `,
})
export class RingsCh9IdealNotUnitalSubringComponent {
  readonly internalDerived = signal(false);
  readonly identitySent = signal(false);
  readonly transfer = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly finalVerdict = computed(() => !this.internalDerived() ? 'DERIVE THE SPECIAL CASE' : !this.identitySent() ? 'IDENTITY GATE STILL OPEN' : 'IDEAL ✓ · SUBRING ×');
  readonly reading = computed(() => !this.internalDerived()
    ? '把ambient multiplier r限制成另一個inside element；absorption立即給internal product closure。'
    : !this.identitySent() ? '三項closure能力都已通過，只剩本課same-identity entry。' : `${this.transfer()?'1不在2ℤ':'(1,1)不在K'}；只有identity gate失敗，其他PASS保持不變。`);
  deriveInternal(): void { this.internalDerived.set(true); }
  sendIdentity(): void { if (this.internalDerived()) this.identitySent.set(true); }
  reset(): void { this.internalDerived.set(false); this.identitySent.set(false); this.transfer.set(false); this.prediction.set(null); }
}
