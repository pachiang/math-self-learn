import { Component, computed, signal } from '@angular/core';
import {
  classLabel,
  inducedOutput,
  mapOutput,
  quotientClasses,
} from './rings-ch12-model';

@Component({
  selector: 'app-rings-ch12-induced-map-builder',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 12.3</p>
        <h2>Map 一旦通過 descent gate，induced output 就被每個 coset 強迫唯一</h2>
        <p class="lede">使用通過gate的f₂(x)=x mod 2。選quotient class，再任選其中一張ambient handle；若f₂真的能下降，所有handles都會迫使同一個target output，因此f̄沒有額外設計空間。</p>
      </header>
      <span class="map-convention">INDUCED MAP · f̄:R/I→ℤ/2ℤ · f̄(x+I)=f₂(x) · f₂=f̄∘π</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>C1=&#123;1,5,9&#125;要送到哪裡？能否因handle換成5就改選target 0？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(true)">只能送1，三個handles都迫使它</button><button type="button" (click)="prediction.set(false)">可以自由指定0或1</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對。f̄(C1)必須同時等於f₂(1)、f₂(5)、f₂(9)，而三者都是1。' : '若改成0，triangle在ambient input 1上就不再對齊：f₂(1)=1，但f̄(π(1))=0。' }}</p> }
      </section>

      <div class="control-row">
        <span class="kicker">QUOTIENT INPUT</span>
        @for (quotientClass of classes; track quotientClass.index) { <button type="button" [class.active]="activeClass()===quotientClass.index" (click)="selectClass(quotientClass.index)">{{ classLabel(quotientClass.index) }}</button> }
        <span class="kicker">AMBIENT HANDLE</span>
        @for (member of activeMembers(); track member) { <button type="button" [class.active]="representative()===member" (click)="representative.set(member)">{{ member }}</button> }
        <button type="button" (click)="assignCurrent()">LET HANDLE FORCE OUTPUT</button>
        <button type="button" (click)="assignNext()">BUILD NEXT CLASS</button>
        <button type="button" (click)="completeMap()">COMPLETE f̄</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="induced-map-lab">
          <section class="factor-triangle" aria-live="polite">
            <div class="triangle-node ambient"><small>AMBIENT INPUT</small><strong>x={{ representative() }}</strong><span>R</span></div>
            <div class="triangle-route direct"><small>DIRECT f₂</small><strong>→ {{ directOutput() }}</strong></div>
            <div class="triangle-node target"><small>TARGET</small><strong>{{ directOutput() }}</strong><span>ℤ/2ℤ</span></div>
            <div class="triangle-route projection"><small>π</small><strong>↓ {{ classLabel(activeClass()) }}</strong></div>
            <div class="triangle-node quotient"><small>QUOTIENT INPUT</small><strong>{{ classLabel(activeClass()) }}</strong><span>{{ membersLabel(activeClass()) }}</span></div>
            <div class="triangle-route induced" [class.revealed]="isAssigned(activeClass())"><small>INDUCED f̄</small><strong>→ {{ isAssigned(activeClass()) ? assignedOutput(activeClass()) : '?' }}</strong></div>
          </section>

          <section class="class-output-builder">
            <div class="tray-heading"><p class="kicker">BUILD f̄ CLASS BY CLASS</p><strong>{{ assignments().length }}/4 forced outputs</strong></div>
            @for (quotientClass of classes; track quotientClass.index) {
              <button type="button" class="class-assignment" [class.active]="activeClass()===quotientClass.index" [class.assigned]="isAssigned(quotientClass.index)" (click)="selectClass(quotientClass.index)">
                <span><small>INPUT</small><strong>{{ classLabel(quotientClass.index) }}</strong><em>{{ membersLabel(quotientClass.index) }}</em></span><b>→</b><span><small>FORCED TARGET</small><strong>{{ isAssigned(quotientClass.index) ? assignedOutput(quotientClass.index) : '?' }}</strong><em>{{ isAssigned(quotientClass.index) ? 'all reps agree' : 'choose a handle' }}</em></span>
              </button>
            }
          </section>

          <section class="representative-consensus">
            <small>ACTIVE CLASS CONSENSUS</small>
            <div>@for (member of activeMembers(); track member) { <span [class.handle]="member===representative()"><strong>f₂({{ member }})={{ output(member) }}</strong><small>{{ member===representative() ? 'CURRENT HANDLE' : 'SAME FORCING' }}</small></span> }</div>
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ complete() ? 'UNIQUE INDUCED MAP · COMPLETE' : 'COMMUTING TRIANGLE ASSEMBLY' }}</span>
          <h3>{{ complete() ? 'f₂ = f̄ ∘ π · EVERYWHERE' : 'ONE CLASS HAS ONE FORCED TARGET' }}</h3>
          <p>{{ consoleReading() }}</p>
          <div class="readout">f₂({{ representative() }})={{ directOutput() }} · f̄(π({{ representative() }}))={{ isAssigned(activeClass()) ? assignedOutput(activeClass()) : '?' }}</div>
        </aside>
      </section>

      @if (complete()) {
        <section class="transfer-strip"><div><p class="kicker">UNIQUENESS CERTIFICATE</p><strong>f̄(C0)=0 · f̄(C1)=1 · f̄(C2)=0 · f̄(C3)=1</strong></div><p>若任何一格改寫，挑該class中的任一ambient representative，direct route f₂與factor route f̄∘π就會立刻分岔。</p></section>
      }

      <section class="insight"><span class="insight-icon">∃!</span><div><strong>Induced map 不是「找到一個可行答案」，而是被 factorization equation 逐 class 唯一決定</strong><span>Projection先忘掉representative；原map在每條fiber上的共同output，正好成為quotient element唯一能接受的target。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 12.4</strong><p>Parity map把四個quotient elements再壓成兩個；zero map甚至只留一個。那麼R/I在所有合法壓縮中究竟保留了多少資訊？</p></div>
      <details><summary>正式層：存在唯一的 induced homomorphism</summary><p>因I⊆ker f₂，定義f̄(x+I)=f₂(x)是well-defined的ring homomorphism，且f₂=f̄∘π。若另一張g:R/I→ℤ/2ℤ也滿足f₂=g∘π，則對每個x+I都有g(x+I)=g(π(x))=f₂(x)=f̄(x+I)，故g=f̄。</p></details>
    </article>
  `,
})
export class RingsCh12InducedMapBuilderComponent {
  readonly classes = quotientClasses();
  readonly activeClass = signal(1);
  readonly representative = signal(1);
  readonly assignments = signal<readonly number[]>([]);
  readonly prediction = signal<boolean | null>(null);
  readonly activeMembers = computed(() => this.classes[this.activeClass()].members);
  readonly directOutput = computed(() => mapOutput('mod2', this.representative()));
  readonly complete = computed(() => this.assignments().length === this.classes.length);
  readonly consoleReading = computed(() => this.complete()
    ? '四個class outputs都由ambient parity map強迫完成；triangle在12張ambient inputs上全部對齊。'
    : this.isAssigned(this.activeClass())
      ? `${this.classLabel(this.activeClass())}已被迫送到${this.assignedOutput(this.activeClass())}；切換另外兩張handles不會改變target。`
      : `選${this.classLabel(this.activeClass())}中的任一handle；direct output會迫使f̄填入唯一target。`);
  classLabel = classLabel;

  output(value: number): number { return mapOutput('mod2', value); }
  isAssigned(index: number): boolean { return this.assignments().includes(index); }
  assignedOutput(index: number): number { return inducedOutput('mod2', index)!; }
  membersLabel(index: number): string { return `{${this.classes[index].members.join(',')}}`; }
  selectClass(index: number): void { this.activeClass.set(index); this.representative.set(this.classes[index].representative); }
  assignCurrent(): void {
    if (!this.isAssigned(this.activeClass())) this.assignments.update(indices => [...indices, this.activeClass()].sort());
  }
  assignNext(): void {
    const next = this.classes.find(item => !this.isAssigned(item.index));
    if (!next) return;
    this.selectClass(next.index); this.assignCurrent();
  }
  completeMap(): void { this.assignments.set(this.classes.map(item => item.index)); }
  reset(): void { this.activeClass.set(1); this.representative.set(1); this.assignments.set([]); this.prediction.set(null); }
}
