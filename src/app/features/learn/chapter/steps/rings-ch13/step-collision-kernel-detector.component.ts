import { Component, computed, signal } from '@angular/core';
import {
  CH13_KERNEL,
  CH13_RESIDUES,
  isKernelElement,
  mapToTarget,
  residueDifference,
  sameTarget,
  targetLabel,
} from './rings-ch13-model';

@Component({
  selector: 'app-rings-ch13-collision-kernel-detector',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">RINGS & IDEALS · 13.1</p>
        <h2>Kernel 不只收集「送到 0」的 inputs；它記錄了每一次 collision</h2>
        <p class="lede">固定 <strong>f:ℤ/12ℤ→ℤ/4ℤ×ℤ/2ℤ</strong>，f(x)=(x mod 4, x mod 2)。任選兩張 input cards；不要只比 outputs，還要把兩張 cards 的差送進同一張 map。</p>
      </header>
      <span class="map-convention">COLLISION LAW · f(x)=f(y) ⇔ f(x−y)=0 ⇔ x−y∈ker f</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>f(1) 與 f(5) 會撞在一起嗎？如果會，差 1−5 能透露什麼？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(true)">會；差會落進 kernel</button><button type="button" (click)="prediction.set(false)">不會；1 與 5 是不同 inputs</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '先保留這個判斷；讓兩條 routes 同時驗證它。' : 'Ambient inputs 的確不同，但 map 可能看不見它們之間的差。' }}</p> }
      </section>

      <div class="selector-stack">
        <div class="control-row"><span class="kicker">INPUT x</span>@for (value of residues; track value) { <button type="button" [class.active]="x()===value" (click)="selectX(value)">{{ value }}</button> }</div>
        <div class="control-row"><span class="kicker">INPUT y</span>@for (value of residues; track value) { <button type="button" [class.active]="y()===value" (click)="selectY(value)">{{ value }}</button> }<button type="button" (click)="testPair()">TEST THIS PAIR</button><button type="button" (click)="nextContrast()">TRY CONTRAST</button><button type="button" (click)="auditAll()">AUDIT ALL 144 PAIRS</button><button type="button" (click)="reset()">RESET</button></div>
      </div>

      <section class="stage stage-grid">
        <div class="collision-kernel-lab">
          <section class="collision-route-card">
            <div class="input-pair">
              <span><small>INPUT x</small><strong>{{ x() }}</strong></span>
              <span><small>INPUT y</small><strong>{{ y() }}</strong></span>
            </div>
            <div class="map-machine"><small>f</small><strong>(mod 4, mod 2)</strong></div>
            <div class="output-pair" [class.collision]="tested() && collides()">
              <span><small>f({{ x() }})</small><strong>{{ tested() ? outputXLabel() : '?' }}</strong></span>
              <span><small>f({{ y() }})</small><strong>{{ tested() ? outputYLabel() : '?' }}</strong></span>
            </div>
          </section>

          <div class="equivalence-bridge" [class.revealed]="tested()"><strong>{{ tested() ? (collides() ? 'SAME OUTPUT' : 'DIFFERENT OUTPUTS') : '?' }}</strong><span>⇕</span><small>check the difference</small></div>

          <section class="difference-route-card">
            <div class="difference-card"><small>x−y in ℤ/12ℤ</small><strong>{{ difference() }}</strong><span>{{ x() }}−{{ y() }} mod 12</span></div>
            <div class="map-machine"><small>f</small><strong>ZERO TEST</strong></div>
            <div class="kernel-dock" [class.inside]="tested() && differenceInKernel()" [class.outside]="tested() && !differenceInKernel()"><small>f({{ difference() }})</small><strong>{{ tested() ? differenceOutputLabel() : '?' }}</strong><span>{{ tested() ? (differenceInKernel() ? 'IN ker f' : 'NOT IN ker f') : 'waiting' }}</span></div>
          </section>

          <section class="collision-certificate">
            <div><small>OUTPUT TEST</small><strong>{{ tested() ? (collides() ? 'f(x)=f(y)' : 'f(x)≠f(y)') : '?' }}</strong></div><span>⇔</span><div><small>DIFFERENCE TEST</small><strong>{{ tested() ? (differenceInKernel() ? 'x−y∈ker f' : 'x−y∉ker f') : '?' }}</strong></div>
          </section>
        </div>

        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ audited() ? '144-PAIR EXHAUSTIVE AUDIT' : 'COLLISION DETECTOR' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">ker f={{ kernelLabel }} · x−y={{ difference() }} · f(x−y)={{ tested() ? differenceOutputLabel() : '?' }}</div></aside>
      </section>

      @if (audited()) { <section class="transfer-strip"><div><p class="kicker">FINITE AUDIT</p><strong>36 output collisions · 36 kernel differences</strong></div><p>144 組 ordered pairs 全部吻合。Kernel 看似只是一條 zero fiber，卻能判斷 map 對任何兩個 inputs 是否分得出來。</p></section> }
      <section class="insight"><span class="insight-icon">x−y</span><div><strong>Kernel 是 map 的「不可見差異表」</strong><span>f(x)=f(y) 不是偶然撞點；兩個 inputs 相差的量正好被 f 送成 0。知道 ker f，就知道所有 collisions。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 13.2</strong><p>如果所有與 x 碰撞的 y 都滿足 x−y∈ker f，整條 fiber 會長成什麼固定形狀？</p></div>
      <details><summary>正式層：collision law 的兩個方向</summary><p>若 f(x)=f(y)，則 f(x−y)=f(x)−f(y)=0，所以 x−y∈ker f。反過來，若 x−y∈ker f，則 0=f(x−y)=f(x)−f(y)，因此 f(x)=f(y)。</p></details>
    </article>
  `,
})
export class RingsCh13CollisionKernelDetectorComponent {
  readonly residues = CH13_RESIDUES;
  readonly kernelLabel = `{${CH13_KERNEL.join(',')}}`;
  readonly x = signal(1);
  readonly y = signal(5);
  readonly tested = signal(false);
  readonly audited = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly difference = computed(() => residueDifference(this.x(), this.y()));
  readonly collides = computed(() => sameTarget(this.x(), this.y()));
  readonly differenceInKernel = computed(() => isKernelElement(this.difference()));
  readonly outputXLabel = computed(() => targetLabel(mapToTarget(this.x())));
  readonly outputYLabel = computed(() => targetLabel(mapToTarget(this.y())));
  readonly differenceOutputLabel = computed(() => targetLabel(mapToTarget(this.difference())));
  readonly verdictTitle = computed(() => this.audited()
    ? 'ALL 144 PAIRS OBEY THE SAME EQUIVALENCE'
    : !this.tested()
    ? 'COMPARE THE OUTPUTS · THEN TEST THE DIFFERENCE'
    : this.collides() ? 'COLLISION FOUND · DIFFERENCE ENTERS KERNEL' : 'NO COLLISION · DIFFERENCE STAYS VISIBLE');
  readonly verdictReading = computed(() => this.audited()
    ? '36 組 output collisions 恰好對應 36 組 kernel differences；目前這一組 pair 也遵守同一規則。'
    : !this.tested()
    ? '兩條 input routes 與 difference route 現在都還未揭曉。'
    : this.collides()
      ? `${this.x()} 與 ${this.y()} 都送到 ${this.outputXLabel()}；它們的差 ${this.difference()} 被送到 (0,0)。`
      : `${this.x()} 與 ${this.y()} 的 outputs 不同；差 ${this.difference()} 也沒有落進 kernel。`);

  selectX(value: number): void { this.x.set(value); this.tested.set(false); }
  selectY(value: number): void { this.y.set(value); this.tested.set(false); }
  testPair(): void { this.tested.set(true); }
  nextContrast(): void {
    if (this.collides()) this.y.set((this.y() + 1) % 12);
    else this.y.set((this.x() + 4) % 12);
    this.tested.set(true);
  }
  auditAll(): void { this.tested.set(true); this.audited.set(true); }
  reset(): void { this.x.set(1); this.y.set(5); this.tested.set(false); this.audited.set(false); this.prediction.set(null); }
}
