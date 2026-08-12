import { Component, computed, signal } from '@angular/core';
import {
  classLabel,
  IDEAL_I,
  quotientClasses,
  quotientClassIndex,
  RESIDUES,
} from './rings-ch12-model';

@Component({
  selector: 'app-rings-ch12-canonical-projection-fibers',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 12.1</p>
        <h2>Collapse 不只是把 cards 圈起來；它會產生一張 canonical projection</h2>
        <p class="lede">固定R=ℤ/12ℤ與I=(4)=&#123;0,4,8&#125;。Projection π不挑一張代表留下，而是把每張ambient card送到它所代表的whole coset；因此每個coset正好是一條fiber。</p>
      </header>
      <span class="map-convention">CANONICAL PROJECTION · π:R→R/I · π(x)=x+I · FIBER OVER QUOTIENT ZERO = I</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>π把4送去哪裡：新的非零element，還是和0相同的quotient zero？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(true)">和0相同，因為4∈I</button><button type="button" (click)="prediction.set(false)">不同，因為ambient中4≠0</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對。π(0)=π(4)=π(8)=C0；這三張cards正好組成zero fiber。' : 'Ambient equality沒有改；改的是π的output identity。0與4都被送進whole coset I。' }}</p> }
      </section>

      <div class="control-row">
        <span class="kicker">AMBIENT CARD x</span>
        @for (value of residues; track value) { <button type="button" [class.active]="selected()===value" (click)="select(value)">{{ value }}</button> }
        <button type="button" (click)="projectCurrent()">SEND THROUGH π</button>
        <button type="button" (click)="projectNext()">SEND NEXT UNTRACED</button>
        <button type="button" (click)="revealAll()">REVEAL ALL FIBERS</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="projection-fiber-lab">
          <section class="projection-source">
            <div class="tray-heading"><p class="kicker">AMBIENT R · 12 ELEMENTS</p><strong>{{ projected().length }}/12 traced</strong></div>
            <div class="projection-source-grid">
              @for (value of residues; track value) {
                <button type="button" class="ambient-residue" [class.selected]="selected()===value" [class.traced]="isProjected(value)" (click)="select(value)">
                  <strong>{{ value }}</strong><small>{{ isProjected(value) ? 'π→'+classLabel(classIndex(value)) : 'AMBIENT' }}</small>
                </button>
              }
            </div>
          </section>

          <div class="projection-machine" aria-hidden="true"><span>π</span><strong>x ↦ x+I</strong><small>KEEP CLASS IDENTITY</small></div>

          <section class="fiber-rack" aria-live="polite">
            <div class="tray-heading"><p class="kicker">R/I · FOUR OUTPUT ELEMENTS</p><strong>each tile is one fiber</strong></div>
            @for (quotientClass of classes; track quotientClass.index) {
              <div class="projection-fiber" [class.zero-fiber]="quotientClass.index===0" [class.active]="activeClass()===quotientClass.index">
                <div><small>{{ quotientClass.index===0 ? 'QUOTIENT ZERO · KERNEL FIBER' : 'QUOTIENT ELEMENT' }}</small><strong>{{ classLabel(quotientClass.index) }}</strong></div>
                <div class="fiber-members">@for (member of quotientClass.members; track member) { <span [class.arrived]="isProjected(member)">{{ isProjected(member) ? member : '?' }}</span> }</div>
              </div>
            }
          </section>

          <section class="projection-certificate">
            <div><small>CURRENT AMBIENT INPUT</small><strong>x={{ selected() }}</strong></div><span>π</span><div><small>OUTPUT ELEMENT</small><strong>{{ hasProjectedCurrent() ? classLabel(activeClass()) : '?' }}</strong></div><span>fiber</span><div><small>ALL REPRESENTATIVES</small><strong>{{ hasProjectedCurrent() ? membersLabel(activeClass()) : '?' }}</strong></div>
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ complete() ? 'FINITE EXHAUSTION · ALL FIBERS' : 'CANONICAL PROJECTION TRACE' }}</span>
          <h3>{{ complete() ? 'KER π = I · NOTHING EXTRA ERASED' : 'ONE CARD ENTERS ONE WHOLE COSET' }}</h3>
          <p>{{ consoleReading() }}</p>
          <div class="readout">π({{ selected() }})={{ hasProjectedCurrent() ? classLabel(activeClass()) : '?' }} · π⁻¹(C0)=&#123;0,4,8&#125;=I</div>
        </aside>
      </section>

      <section class="insight"><span class="insight-icon">π</span><div><strong>Kernel 記錄 projection 真正抹掉的資訊</strong><span>π的每條fiber是一個coset；zero fiber恰好是I，所以這張map執行的是「只讓I歸零」而不是任意刪除。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 12.2</strong><p>如果另一張map也想讀取這個壓縮後的世界，它至少必須同意I裡所有cards都已經是0嗎？</p></div>
      <details><summary>正式層：canonical projection 為什麼是 ring homomorphism？</summary><p>定義π(x)=x+I。依Ch11的quotient operations，π(x+y)=(x+y)+I=(x+I)+(y+I)，且π(xy)=xy+I=(x+I)(y+I)。因此π同時保留addition、multiplication與identity；其kernel是&#123;x:π(x)=I&#125;=I。</p></details>
    </article>
  `,
})
export class RingsCh12CanonicalProjectionFibersComponent {
  readonly residues = RESIDUES;
  readonly classes = quotientClasses();
  readonly ideal = IDEAL_I;
  readonly selected = signal(4);
  readonly projected = signal<readonly number[]>([]);
  readonly prediction = signal<boolean | null>(null);
  readonly activeClass = computed(() => quotientClassIndex(this.selected()));
  readonly complete = computed(() => this.projected().length === this.residues.length);
  readonly hasProjectedCurrent = computed(() => this.isProjected(this.selected()));
  readonly consoleReading = computed(() => this.complete()
    ? '四條fibers完整覆蓋R；只有0、4、8進入quotient zero，因此projection沒有順手抹掉其他classes。'
    : this.hasProjectedCurrent()
      ? `${this.selected()}被送進${classLabel(this.activeClass())}；同一tile中的cards不是多個outputs，而是同一output的完整preimage。`
      : '選一張ambient card送進π；destination由它所屬的coset唯一決定。');
  classLabel = classLabel;
  classIndex = quotientClassIndex;

  isProjected(value: number): boolean { return this.projected().includes(value); }
  membersLabel(index: number): string { return `{${this.classes[index].members.join(',')}}`; }
  select(value: number): void { this.selected.set(value); }
  projectCurrent(): void {
    if (!this.isProjected(this.selected())) this.projected.update(values => [...values, this.selected()].sort((a, b) => a - b));
  }
  projectNext(): void {
    const next = this.residues.find(value => !this.isProjected(value));
    if (next === undefined) return;
    this.selected.set(next); this.projectCurrent();
  }
  revealAll(): void { this.projected.set(this.residues); }
  reset(): void { this.selected.set(4); this.projected.set([]); this.prediction.set(null); }
}
