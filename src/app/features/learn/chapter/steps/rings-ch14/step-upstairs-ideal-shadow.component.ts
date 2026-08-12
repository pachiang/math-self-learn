import { Component, computed, signal } from '@angular/core';
import {
  CH14_CLASSES,
  CH14_IDEALS,
  CH14_RESIDUES,
  IdealKey,
  classLabel,
  classSetLabel,
  idealRecord,
  pullback,
  pushdown,
  setLabel,
} from './rings-ch14-model';

@Component({
  selector: 'app-rings-ch14-upstairs-ideal-shadow',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 14.2</p><h2>Upstairs 的 J⊇K 會在 quotient 留下一個不依賴代表元的 shadow</h2><p class="lede">選一個包含 K 的 ideal J。把 J 裡的 ambient cards 逐張送過 π；同一 fiber 的 handles 會落在同一 quotient card，所以 downstairs 真正留下的是 J/K，而不是一袋重複輸出。</p></header>
      <span class="map-convention">PUSH DOWN · K⊆J◁R ⇒ J/K◁R/K · π⁻¹(J/K)=J</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>J=(2) 有 6 個 ambient elements；push down 後會有 6 張還是 3 張 quotient cards？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(3)">3 張；每兩個 handles 合一</button><button type="button" (click)="prediction.set(6)">6 張；J 本來有 6 個 elements</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()===6">{{ prediction()===3 ? '對；K 已先把每條兩元素 fiber 壓成一張 card。' : 'Push down 會去除同一 K-fiber 的重複 representatives；實際逐張送入看看。' }}</p> }</section>

      <div class="control-row"><span class="kicker">UPSTAIRS IDEAL J⊇K</span>@for (ideal of ideals; track ideal.key) { <button type="button" [class.active]="selectedKey()===ideal.key" (click)="selectIdeal(ideal.key)">{{ ideal.upstairsName }} · {{ set(ideal.upstairs) }}</button> }<button type="button" (click)="pushNext()">PUSH NEXT J-ELEMENT</button><button type="button" (click)="pushAll()">PUSH DOWN WHOLE J</button><button type="button" (click)="pullBackCheck()">PULL BACK TO CHECK</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="shadow-lab">
          <section class="upstairs-shadow-source"><div class="tray-heading"><p class="kicker">UPSTAIRS · {{ selected().upstairsName }}</p><strong>{{ sent().length }}/{{ selected().upstairs.length }} sent</strong></div><div class="ambient-twelve-grid">@for (value of residues; track value) { <button type="button" [class.in-selected]="isInSelected(value)" [class.sent]="isSent(value)" (click)="send(value)"><strong>{{ value }}</strong><small>{{ isInSelected(value) ? (isSent(value) ? 'SENT' : 'J') : 'OUTSIDE' }}</small></button> }</div></section>

          <div class="shadow-machine"><span>π</span><strong>REMOVE DUPLICATE HANDLES</strong><small>{{ sent().length }} handles → {{ shadow().length }} cards</small><b>→</b></div>

          <section class="downstairs-shadow"><div class="tray-heading"><p class="kicker">DOWNSTAIRS SHADOW · J/K</p><strong>{{ shadowSet() }}</strong></div><div class="quotient-six-grid">@for (quotientClass of classes; track quotientClass.index) { <div [class.shadow]="isShadow(quotientClass.index)"><small>{{ isShadow(quotientClass.index) ? 'J/K' : 'OUTSIDE' }}</small><strong>{{ className(quotientClass.index) }}</strong><span>{{ set(quotientClass.members) }}</span></div> }</div></section>

          <section class="roundtrip-check" [class.verified]="checked()"><div><small>START</small><strong>{{ selected().upstairsName }}={{ set(selected().upstairs) }}</strong></div><span>push ↓</span><div><small>SHADOW</small><strong>{{ complete() ? selected().downstairsName+'='+classSet(selected().downstairs) : shadowSet() }}</strong></div><span>pull ↑</span><div><small>RETURN</small><strong>{{ checked() ? set(roundtrip()) : '?' }}</strong></div></section>
        </div>

        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ checked() ? 'ROUNDTRIP VERIFIED' : 'IDEAL SHADOW BUILDER' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">{{ selected().upstairsName }} → {{ complete() ? selected().downstairsName : '?' }} → {{ checked() ? selected().upstairsName : '?' }}</div></aside>
      </section>

      @if (checked()) { <section class="transfer-strip"><div><p class="kicker">NO INFORMATION LOST ABOUT J</p><strong>π⁻¹(π(J))=J because K⊆J</strong></div><p>若 J 不含 K，push down 會被迫把缺少的同-fiber handles 補回來；正是 K⊆J 讓 roundtrip 精確返回原 ideal。</p></section> }
      <section class="insight"><span class="insight-icon">J/K</span><div><strong>包含 K 的 upstairs ideal，會留下唯一的 downstairs ideal shadow</strong><span>Push down 自動移除 representative 重複；再 pull back 則完整恢復 J。兩個方向沒有選擇自由。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 14.3</strong><p>這個一對一 correspondence 只配對四個 ideals，還是也完整保留它們之間的 inclusion 關係？</p></div>
      <details><summary>正式層：為什麼 J/K 是 ideal，而且 roundtrip 回到 J？</summary><p>因 K⊆J，J 是 cosets 的 union，故 J/K={{ '{j+K:j∈J}' }} well-defined。Quotient operations 直接由 ambient operations下降，因此 J/K 對 subtraction 與 ambient multiplication封閉。最後 x∈π⁻¹(J/K) iff x+K=j+K for some j∈J iff x−j∈K⊆J iff x∈J。</p></details>
    </article>
  `,
})
export class RingsCh14UpstairsIdealShadowComponent {
  readonly ideals = CH14_IDEALS;
  readonly classes = CH14_CLASSES;
  readonly residues = CH14_RESIDUES;
  readonly selectedKey = signal<IdealKey>('two');
  readonly sent = signal<readonly number[]>([]);
  readonly checked = signal(false);
  readonly prediction = signal<3 | 6 | null>(null);
  readonly selected = computed(() => idealRecord(this.selectedKey()));
  readonly shadow = computed(() => pushdown(this.sent()));
  readonly complete = computed(() => this.selected().upstairs.every(value => this.sent().includes(value)));
  readonly roundtrip = computed(() => pullback(this.shadow()));
  readonly verdictTitle = computed(() => this.checked() ? 'PUSH DOWN · PULL BACK · SAME IDEAL RETURNS' : this.complete() ? 'J/K IS THE UNIQUE DOWNSTAIRS SHADOW' : 'WATCH REPRESENTATIVES MERGE INTO QUOTIENT CARDS');
  readonly verdictReading = computed(() => this.checked()
    ? `${this.selected().upstairsName} 經過 ${this.selected().downstairsName} 後完整返回，沒有增加也沒有遺漏。`
    : this.complete() ? `${this.selected().upstairs.length} 個 handles 變成 ${this.selected().downstairs.length} 張 quotient cards。` : '同一 quotient class 的第二個 handle 到達時，不會創造新的 downstairs element。');

  set(values: readonly number[]): string { return setLabel(values); }
  classSet(values: readonly number[]): string { return classSetLabel(values); }
  className(index: number): string { return classLabel(index); }
  shadowSet(): string { return this.shadow().length ? classSetLabel(this.shadow()) : '?'; }
  isInSelected(value: number): boolean { return this.selected().upstairs.includes(value); }
  isSent(value: number): boolean { return this.sent().includes(value); }
  isShadow(index: number): boolean { return this.shadow().includes(index); }
  selectIdeal(key: IdealKey): void { this.selectedKey.set(key); this.sent.set([]); this.checked.set(false); }
  send(value: number): void { if (!this.isInSelected(value) || this.isSent(value)) return; this.sent.update(values => [...values, value]); }
  pushNext(): void { const next = this.selected().upstairs.find(value => !this.isSent(value)); if (next !== undefined) this.send(next); }
  pushAll(): void { this.sent.set(this.selected().upstairs); this.checked.set(false); }
  pullBackCheck(): void { this.pushAll(); this.checked.set(true); }
  reset(): void { this.selectedKey.set('two'); this.sent.set([]); this.checked.set(false); this.prediction.set(null); }
}
