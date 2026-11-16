import { Component, computed, inject, input, output, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';

export interface SkeletonCard {
  title: string;
  /** Where it was proved, e.g. 「第 6 章」. */
  from: string;
  beats: string[];
  /** Plausible lines that are not part of the skeleton, each with the reason. */
  decoys: { text: string; why: string }[];
}

/**
 * Spaced review of a skeleton card: the beats and decoys are shuffled, the learner
 * picks them in order. A decoy or an out-of-order beat is refused with a reason.
 * The result is stored as step data on the scene that shows it.
 */
@Component({
  selector: 'app-pf-skeleton-review',
  standalone: true,
  styleUrl: './skeleton-review.component.scss',
  template: `
    <section class="sk" [attr.aria-label]="'骨架卡複習：' + card().title">
      <small class="sk-eyebrow">骨架卡複習 · {{ card().from }}</small>
      <p class="sk-title">{{ card().title }}</p>
      @if (!done()) {
        <p class="pf-note">先別往回翻。依證明的順序點選每一拍；有些句子不屬於這張卡。</p>
      }
      <ol class="sk-built">
        @for (b of card().beats; track $index; let i = $index) {
          <li [class.empty]="i >= picked().length">
            <span class="pf-num">{{ i + 1 }}</span>
            <span>{{ i < picked().length ? b : '　' }}</span>
          </li>
        }
      </ol>
      @if (!done()) {
        <div class="sk-pool" role="group" aria-label="還沒放進去的句子">
          @for (o of pool(); track o.text) {
            <button type="button" class="pf-btn small" (click)="pick(o.text)">{{ o.text }}</button>
          }
        </div>
      }
      @if (msg(); as m) {
        <p class="pf-feedback" [class.bad]="!done()" [class.good]="done()" role="status">{{ m }}</p>
      }
    </section>
  `,
})
export class SkeletonReviewComponent {
  private readonly progress = inject(LearnProgressService);

  readonly card = input.required<SkeletonCard>();
  /** Where to store the result: progress chapter id and step id. */
  readonly saveAt = input<[string, string] | null>(null);
  readonly finished = output<{ misses: number }>();

  readonly picked = signal<string[]>([]);
  readonly misses = signal(0);
  readonly msg = signal<string | null>(null);
  readonly done = computed(() => this.picked().length === this.card().beats.length);

  /** Fixed interleaving (decoys between beats, beats reversed) so a replay looks the same. */
  readonly pool = computed(() => {
    const c = this.card();
    const items = [...c.beats].reverse().map((text) => ({ text }));
    c.decoys.forEach((d, i) => items.splice(Math.min(1 + i * 2, items.length), 0, { text: d.text }));
    return items.filter((o) => !this.picked().includes(o.text));
  });

  pick(text: string): void {
    const c = this.card();
    const want = c.beats[this.picked().length];
    if (text === want) {
      this.picked.update((p) => [...p, text]);
      this.msg.set(this.done() ? `重建完成${this.misses() ? `（中間擋下 ${this.misses()} 次）` : ''}。這 ${c.beats.length} 拍就是整段證明，其他都是照形狀補上的細節。` : null);
      if (this.done()) {
        const at = this.saveAt();
        if (at) this.progress.saveStepData(at[0], at[1], 'skeleton', { misses: this.misses() });
        this.finished.emit({ misses: this.misses() });
      }
      return;
    }
    this.misses.update((n) => n + 1);
    const decoy = c.decoys.find((d) => d.text === text);
    this.msg.set(decoy ? decoy.why : `這一句屬於這張卡，但還沒輪到它。第 ${this.picked().length + 1} 拍是什麼？`);
  }
}
