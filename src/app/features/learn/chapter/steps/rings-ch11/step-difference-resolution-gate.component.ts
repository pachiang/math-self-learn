import { Component, computed, signal } from '@angular/core';
import { difference, IDEAL_4, sameUnderIdeal } from './rings-ch11-model';

interface PairPreset {
  readonly id: string;
  readonly left: number;
  readonly right: number;
  readonly label: string;
}

type TransferAnswer = 'same' | 'different' | null;

@Component({
  selector: 'app-rings-ch11-difference-resolution-gate',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 11.1</p>
        <h2>一旦 4 被壓成 0，1 和 5 就不能繼續是兩個元素</h2>
        <p class="lede">Ch10只畫出將被壓成0的region。現在真的執行collapse：若i∈I已和0合併，那麼x與x+i也必須合併，否則「兩邊加上同一個東西」會破壞等號。</p>
      </header>
      <span class="map-convention">COLLAPSE TRIGGER · Z/12Z · I=(4)=&#123;0,4,8&#125; · QUOTIENT OPERATIONS NOT YET DEFINED</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>若4與0已合併，1+4與1+0還能落在兩個不同的新元素嗎？</h3></div>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(true)">不能，5必須和1合併</button>
          <button type="button" (click)="prediction.set(false)">可以，ambient 中 1≠5</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對。沿difference gate檢查：1−5=8∈I，這份差異已和0合併。' : 'Ambient中仍有1≠5；但collapse後若保留這個區別，加法就不再尊重4=0。' }}</p>
        }
      </section>

      <div class="control-row">
        <span class="kicker">PAIR UNDER TEST</span>
        @for (preset of presets; track preset.id) {
          <button type="button" [class.active]="selected().id===preset.id" (click)="select(preset)">{{ preset.label }}</button>
        }
        <button type="button" (click)="checkDifference()">TRACE COLLAPSED DIFFERENCE</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="difference-resolution-lab">
          <section class="residue-source-board" aria-label="Z modulo 12 residue cards">
            @for (value of residues; track value) {
              <div class="resolution-card" [class.left-card]="value===selected().left" [class.right-card]="value===selected().right">
                <strong>{{ value }}</strong>
                @if (value===selected().left) { <small>REP x</small> }
                @if (value===selected().right) { <small>REP y</small> }
              </div>
            }
          </section>

          <section class="difference-pipeline" aria-live="polite">
            <div class="pipeline-card"><small>LEFT x</small><strong>{{ selected().left }}</strong></div>
            <div class="pipeline-operation">−</div>
            <div class="pipeline-card"><small>RIGHT y</small><strong>{{ selected().right }}</strong></div>
            <div class="pipeline-operation">→</div>
            <div class="difference-token" [class.revealed]="checked()"><small>x−y mod 12</small><strong>{{ checked() ? activeDifference() : '?' }}</strong></div>
            <div class="pipeline-operation">→</div>
            <div class="ideal-gate" [class.accepted]="checked() && isSame()" [class.rejected]="checked() && !isSame()">
              <small>ZERO CLASS · I=(4)</small><strong>{{ checked() ? (isSame() ? 'DIFFERENCE → 0' : 'DIFFERENCE VISIBLE') : 'COLLAPSE GATE' }}</strong><span>&#123;0,4,8&#125;</span>
            </div>
          </section>

          <div class="semantic-ledger">
            <div><small>AMBIENT EQUALITY</small><strong>{{ selected().left }} {{ selected().left===selected().right ? '=' : '≠' }} {{ selected().right }}</strong></div>
            <div><small>AFTER COLLAPSE</small><strong>{{ checked() ? (isSame() ? 'ONE NEW ELEMENT' : 'TWO NEW ELEMENTS') : 'PENDING' }}</strong></div>
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">COLLAPSE RULE · x AND y MERGE IFF x−y∈I</span>
          <h3>{{ verdictTitle() }}</h3>
          <p>{{ verdictReading() }}</p>
          <div class="readout">{{ checked() ? selected().left + '−' + selected().right + ' ≡ ' + activeDifference() + ' (mod 12) · ' + (isSame() ? '[x]=[y]' : '[x]≠[y]') : '先產生 exact difference token' }}</div>
        </aside>
      </section>

      @if (auditedCount() >= 2) {
        <section class="transfer-strip">
          <div><p class="kicker">TRANSFER · INTEGERS</p><strong>若6Z整塊被壓成0，17會和5、8中的哪一個合併？</strong></div>
          <div class="choice-row">
            <button type="button" (click)="transferAnswer.set('same')">17 與 5</button>
            <button type="button" (click)="transferAnswer.set('different')">17 與 8</button>
          </div>
          @if (transferAnswer() !== null) {
            <p class="feedback" [class.warning]="transferAnswer()==='different'">{{ transferAnswer()==='same' ? '正確：17−5=12∈6Z，所以collapse必須把17與5合併。' : '17−8=9∉6Z；指定6Z歸零並沒有強迫這一對合併。' }}</p>
          }
        </section>
      }

      <section class="insight"><span class="insight-icon">x−y→0</span><div><strong>壓掉 I，等於把所有相差 I-element 的代表綁在一起</strong><span>x與y在原ring中仍不同；在新世界裡，[x]=[y]恰好因為x−y∈I。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 11.2</strong><p>1、5、9既然都被綁在一起，新世界的一個element究竟是其中哪一張card，還是整束cards？</p></div>
      <details><summary>正式定義：congruence modulo an ideal</summary><p>對ring R與ideal I，定義x≡y (mod I)當且僅當x−y∈I。因為y=x+i（某個i∈I），也可讀成「y只是x加上一份已被壓成0的noise」。這一頁建立新元素的identification rule；尚未定義class上的加法或乘法。</p></details>
    </article>
  `,
})
export class RingsCh11DifferenceResolutionGateComponent {
  readonly residues = Array.from({ length: 12 }, (_, value) => value);
  readonly presets: readonly PairPreset[] = [
    { id: 'same', left: 1, right: 5, label: '1 & 5' },
    { id: 'distinct', left: 1, right: 3, label: '1 & 3' },
    { id: 'same-again', left: 2, right: 10, label: '2 & 10' },
  ];
  readonly selected = signal<PairPreset>(this.presets[0]);
  readonly checked = signal(false);
  readonly auditedIds = signal<readonly string[]>([]);
  readonly prediction = signal<boolean | null>(null);
  readonly transferAnswer = signal<TransferAnswer>(null);
  readonly activeDifference = computed(() => difference(this.selected().left, this.selected().right));
  readonly isSame = computed(() => sameUnderIdeal(this.selected().left, this.selected().right, IDEAL_4));
  readonly auditedCount = computed(() => this.auditedIds().length);
  readonly verdictTitle = computed(() => !this.checked()
    ? 'WAITING FOR THE DIFFERENCE'
    : this.isSame() ? 'COLLAPSED DIFFERENCE · REPRESENTATIVES MERGE' : 'VISIBLE DIFFERENCE · KEEP THEM DISTINCT');
  readonly verdictReading = computed(() => !this.checked()
    ? '這個gate不量距離，也不看card外觀；它只問exact difference是否已被zero class吸收。'
    : this.isSame()
      ? `${this.activeDifference()}∈I，因此collapse後兩張cards必須成為同一個新element；它們在Z/12Z中仍是不同ambient elements。`
      : `${this.activeDifference()}∉I，因此指定I歸零沒有抹掉這份差異，兩張cards仍代表不同的新elements。`);

  select(preset: PairPreset): void {
    this.selected.set(preset);
    this.checked.set(false);
    this.transferAnswer.set(null);
  }

  checkDifference(): void {
    this.checked.set(true);
    if (!this.auditedIds().includes(this.selected().id)) {
      this.auditedIds.update(ids => [...ids, this.selected().id]);
    }
  }

  reset(): void {
    this.selected.set(this.presets[0]);
    this.checked.set(false);
    this.auditedIds.set([]);
    this.prediction.set(null);
    this.transferAnswer.set(null);
  }
}
