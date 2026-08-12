import { Component, computed, signal } from '@angular/core';

type IdentityMap = 'zero' | 'reduction';

@Component({
  selector: 'app-rings-ch7-identity-gate',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 7.3</p><h2>兩條 operation routes 都對齊，仍可能漏掉 identity gate</h2><p class="lede">Zero map確實保留addition與multiplication；它失敗的地方不是那兩條rails，而是把source identity送成target的0。</p></header>
      <span class="map-convention">COURSE CONVENTION · φ(1_R)=1_S</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>z:ℤ→ℤ、z(n)=0讓兩種routes全對齊。本課會接受它嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不接受，還要檢查1</button><button type="button" (click)="prediction.set(true)">接受，兩條rails已足夠</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'Preserving operations不強迫target的ambient 1被命中；讓identity beacon親自過橋。':'對。保留1是本課採用的獨立definition gate。'}}</p>}</section>

      <div class="control-row"><span class="kicker">MAP</span><button type="button" [class.active]="map()==='zero'" (click)="select('zero')">ZERO MAP · ℤ→ℤ</button>@if(unlocked()){<button type="button" [class.active]="map()==='reduction'" (click)="select('reduction')">TRANSFER · ℤ→ℤ/6ℤ</button>}<button type="button" (click)="runAdd()">RUN ADD AUDIT</button><button type="button" (click)="runMultiply()">RUN MULTIPLY AUDIT</button><button type="button" [disabled]="!railsPassed()" (click)="sendIdentity()">SEND IDENTITY</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="identity-gate-lab">
          <div class="sealed-contracts">
            <section class="contract-seal" [class.passed]="addAudited()"><div><p class="kicker">ADD RAIL</p><h3>{{addAudited()?'SEALED · PASS':'NOT AUDITED'}}</h3><p>{{map()==='zero'?'z(a+b)=0=z(a)+z(b)':'q(a+b)=q(a)+q(b)'}}</p></div></section>
            <section class="contract-seal multiply" [class.passed]="multiplyAudited()"><div><p class="kicker">MULTIPLY RAIL</p><h3>{{multiplyAudited()?'SEALED · PASS':'NOT AUDITED'}}</h3><p>{{map()==='zero'?'z(ab)=0=z(a)z(b)':'q(ab)=q(a)q(b)'}}</p></div></section>
            <section class="identity-flight">
              <div class="identity-beacon">1_R</div>
              <div class="identity-flight-line"></div>
              <div class="identity-target" [class.fail]="identitySent() && !identityPass()">{{identitySent()?identityImage():'1_S dock'}}</div>
            </section>
          </div>
          <aside class="identity-card ambient"><p class="kicker">IDENTITY GATE</p><h3>{{identityVerdict()}}</h3><p>{{identityReading()}}</p></aside>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{identitySent()&&!identityPass()?'WITNESS · IDENTITY':'GENERAL AUDIT'}}</span><h3>{{finalVerdict()}}</h3><p>已通過的operation rails保持通過；identity failure不會竄改它們真正支持的結論。</p><div class="readout">{{addAudited()?'ADD ✓':'ADD ?'}} · {{multiplyAudited()?'MULTIPLY ✓':'MULTIPLY ?'}} · {{identitySent()?(identityPass()?'IDENTITY ✓':'IDENTITY ×'):'IDENTITY ?'}}</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">1</span><div><strong>本課的ring map有三個入口</strong><span>保ADD、保MULTIPLY、把ambient 1送到ambient 1；第三個不會由前兩個自動亮起。</span></div></section>
      <details><summary>其他教材與自動保留的東西</summary><p>有些教材允許不保1的ring homomorphisms，因此會接受zero map。本課採unital convention。另一方面，保addition確實自動推出<code>φ(0)=0</code>與<code>φ(−a)=−φ(a)</code>，所以0不是第四個獨立gate。</p></details>
    </article>
  `,
})
export class RingsCh7IdentityGateComponent {
  readonly map = signal<IdentityMap>('zero');
  readonly addAudited = signal(false);
  readonly multiplyAudited = signal(false);
  readonly identitySent = signal(false);
  readonly unlocked = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly railsPassed = computed(() => this.addAudited() && this.multiplyAudited());
  readonly identityPass = computed(() => this.map() === 'reduction');
  readonly identityImage = computed(() => this.map() === 'zero' ? '0 ≠ 1_S' : '[1]₆ = 1_S');
  readonly identityVerdict = computed(() => !this.identitySent() ? 'WAITING FOR 1_R' : this.identityPass() ? 'IDENTITY DOCKED' : 'MISSED 1_S DOCK');
  readonly identityReading = computed(() => !this.identitySent()
    ? '先讓兩條operation rails取得各自證據，再單獨發送identity。'
    : this.identityPass() ? 'Source 1被送到target的ambient identity。' : 'z(1_ℤ)=0；兩條operation routes仍然保留，但本課convention拒絕這張map。');
  readonly finalVerdict = computed(() => !this.identitySent()
    ? 'RING MAP CONTRACT INCOMPLETE'
    : this.identityPass() ? 'ACCEPTED · ALL THREE GATES' : 'REJECTED BY COURSE CONVENTION');
  runAdd(): void { this.addAudited.set(true); }
  runMultiply(): void { this.multiplyAudited.set(true); }
  sendIdentity(): void { if (this.railsPassed()) { this.identitySent.set(true); this.unlocked.set(true); } }
  select(map: IdentityMap): void { this.map.set(map); this.addAudited.set(false); this.multiplyAudited.set(false); this.identitySent.set(false); }
  reset(): void { this.map.set('zero'); this.addAudited.set(false); this.multiplyAudited.set(false); this.identitySent.set(false); this.unlocked.set(false); this.prediction.set(null); }
}
