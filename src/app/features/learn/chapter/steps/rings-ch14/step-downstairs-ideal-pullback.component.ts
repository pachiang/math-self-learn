import { Component, computed, signal } from '@angular/core';
import {
  CH14_CLASSES,
  CH14_IDEALS,
  IdealKey,
  classLabel,
  classSetLabel,
  idealRecord,
  pullback,
  setLabel,
} from './rings-ch14-model';

@Component({
  selector: 'app-rings-ch14-downstairs-ideal-pullback',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 14.1</p><h2>Downstairs 想再壓成 0 的區域，拉回 R 後一定含著 K</h2><p class="lede">固定 R=ℤ/12ℤ、K=(6)={{ '{0,6}' }}，所以 R/K 有六張 quotient cards。先在 downstairs 選一個 ideal L，再把 L 裡每張 card 的兩個 ambient handles 全部拉回 upstairs。</p></header>
      <span class="map-convention">PULLBACK · L ◁ R/K ⇒ π⁻¹(L) ◁ R · K⊆π⁻¹(L)</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>若 downstairs 只把 quotient zero C0 再視為 0，拉回 R 會得到多大的區域？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set('k')">剛好 K={{ '{0,6}' }}</button><button type="button" (click)="prediction.set('zero')">只剩 ambient 0</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()==='zero'">{{ prediction()==='k' ? '記得 C0 是一整條 fiber，不是一張 ambient card。' : 'Projection 的一個 downstairs element 通常有多個 ambient handles；實際把 C0 拉回看看。' }}</p> }</section>

      <div class="control-row"><span class="kicker">DOWNSTAIRS IDEAL L</span>@for (ideal of ideals; track ideal.key) { <button type="button" [class.active]="selectedKey()===ideal.key" (click)="selectIdeal(ideal.key)">{{ ideal.downstairsName }} · {{ classSet(ideal.downstairs) }}</button> }<button type="button" (click)="liftNext()">LIFT NEXT ZERO CARD</button><button type="button" (click)="liftAll()">PULL BACK WHOLE IDEAL</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="pullback-lab">
          <section class="downstairs-world"><div class="tray-heading"><p class="kicker">DOWNSTAIRS · R/K</p><strong>{{ selected().downstairsName }}</strong></div><div class="quotient-six-grid">@for (quotientClass of classes; track quotientClass.index) { <div [class.in-ideal]="isDownstairsZero(quotientClass.index)" [class.lifted]="isLifted(quotientClass.index)"><small>{{ isDownstairsZero(quotientClass.index) ? 'L · ZERO REGION' : 'OUTSIDE L' }}</small><strong>{{ className(quotientClass.index) }}</strong><span>{{ membersLabel(quotientClass.members) }}</span></div> }</div></section>

          <div class="pullback-elevator"><span>π⁻¹</span><strong>LIFT EVERY HANDLE</strong><small>{{ lifted().length }}/{{ selected().downstairs.length }} cards</small><b>↑</b></div>

          <section class="upstairs-world"><div class="tray-heading"><p class="kicker">UPSTAIRS · R</p><strong>π⁻¹(L)</strong></div><div class="ambient-twelve-grid">@for (value of residues; track value) { <div [class.preimage]="isRevealedPreimage(value)" [class.kernel]="isKernel(value)"><strong>{{ value }}</strong><small>{{ isKernel(value) ? 'K' : isRevealedPreimage(value) ? 'LIFTED' : 'AMBIENT' }}</small></div> }</div></section>

          <section class="containment-certificate" [class.verified]="complete()"><div><small>FIRST FORCED FIBER</small><strong>K={{ '{0,6}' }}</strong></div><span>⊆</span><div><small>FULL PULLBACK</small><strong>{{ complete() ? selected().upstairsName+'='+upstairsLabel() : '?' }}</strong></div></section>
        </div>

        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ complete() ? 'PULLBACK COMPLETE' : 'ZERO-REGION ELEVATOR' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">π⁻¹({{ selected().downstairsName }}) = {{ complete() ? upstairsLabel() : partialLabel() }} · K {{ complete() ? '⊆' : '?' }} π⁻¹(L)</div></aside>
      </section>

      @if (complete()) { <section class="transfer-strip"><div><p class="kicker">WHY K IS AUTOMATIC</p><strong>0̄∈L · π⁻¹(0̄)=K</strong></div><p>每個 ideal 都含自己的 zero。Downstairs 的 zero 正是整條 K-fiber，因此任何 pullback 都無法漏掉 K。</p></section> }
      <section class="insight"><span class="insight-icon">π⁻¹</span><div><strong>Downstairs 的合法 zero region 拉回後，是 upstairs 中一個包含 K 的 ideal</strong><span>Pullback 不是挑代表元；它收回每張 quotient card 的 whole fiber，所以第一次 collapse 的 K 必定完整保留。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 14.2</strong><p>反過來，upstairs 任一個包含 K 的 ideal J，送到 R/K 後會不會形成唯一的 downstairs ideal？</p></div>
      <details><summary>正式層：為什麼 π⁻¹(L) 是 ideal？</summary><p>Projection π 是 ring homomorphism。若 a,b∈π⁻¹(L)，則 π(a−b)=π(a)−π(b)∈L；若 r∈R，則 π(ra)=π(r)π(a)∈L。因此 pullback 對 subtraction 與 ambient multiplication 封閉。又因 0̄∈L，ker π=K⊆π⁻¹(L)。</p></details>
    </article>
  `,
})
export class RingsCh14DownstairsIdealPullbackComponent {
  readonly ideals = CH14_IDEALS;
  readonly classes = CH14_CLASSES;
  readonly residues = Array.from({ length: 12 }, (_, value) => value);
  readonly selectedKey = signal<IdealKey>('two');
  readonly lifted = signal<readonly number[]>([]);
  readonly prediction = signal<'k' | 'zero' | null>(null);
  readonly selected = computed(() => idealRecord(this.selectedKey()));
  readonly complete = computed(() => this.lifted().length === this.selected().downstairs.length);
  readonly revealedPreimage = computed(() => pullback(this.lifted()));
  readonly verdictTitle = computed(() => this.complete() ? 'EVERY PULLBACK STARTS BY CONTAINING K' : 'LIFT WHOLE QUOTIENT CARDS · NOT REPRESENTATIVES');
  readonly verdictReading = computed(() => this.complete()
    ? `${this.selected().downstairsName} 的 ${this.selected().downstairs.length} 張 zero cards 拉回 ${this.selected().upstairs.length} 個 ambient handles，得到 ${this.selected().upstairsName}。`
    : '每按一次，π⁻¹ 會同時拉回一張 quotient card 的兩個 representatives。');

  className(index: number): string { return classLabel(index); }
  classSet(values: readonly number[]): string { return classSetLabel(values); }
  membersLabel(values: readonly number[]): string { return setLabel(values); }
  upstairsLabel(): string { return setLabel(this.selected().upstairs); }
  partialLabel(): string { return this.lifted().length ? setLabel(this.revealedPreimage()) : '?'; }
  isDownstairsZero(index: number): boolean { return this.selected().downstairs.includes(index); }
  isLifted(index: number): boolean { return this.lifted().includes(index); }
  isRevealedPreimage(value: number): boolean { return this.revealedPreimage().includes(value); }
  isKernel(value: number): boolean { return value === 0 || value === 6; }
  selectIdeal(key: IdealKey): void { this.selectedKey.set(key); this.lifted.set([]); }
  liftNext(): void { const next = this.selected().downstairs.find(index => !this.lifted().includes(index)); if (next !== undefined) this.lifted.update(values => [...values, next]); }
  liftAll(): void { this.lifted.set(this.selected().downstairs); }
  reset(): void { this.selectedKey.set('two'); this.lifted.set([]); this.prediction.set(null); }
}
