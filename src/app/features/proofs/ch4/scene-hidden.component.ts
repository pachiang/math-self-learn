import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { MovesComponent, Move } from './moves.component';

type Qt = 'forall' | 'exists';

interface Slot {
  want: Qt;
  /** Shown when the learner picks the other word. */
  wrong: string;
}

interface Item {
  id: string;
  plain: string;
  /** The full sentence split around the slots: parts.length === slots.length + 1. */
  parts: string[];
  slots: Slot[];
  moves: Move[];
  check: string;
  note: string;
}

const WORD: Record<Qt, string> = { forall: '對每個', exists: '存在' };

const ITEMS: Item[] = [
  {
    id: 'even',
    plain: '偶數加偶數是偶數。',
    parts: ['', '偶數 a、', '偶數 b，a + b 都是偶數。'],
    slots: [
      { want: 'forall', wrong: '「存在一個偶數 a」只談到某一個 a。原句說的是任何偶數都行，所以是「對每個」。' },
      { want: 'forall', wrong: 'b 和 a 一樣，任何偶數都行。原句說的是任何兩個偶數相加都是偶數，不是只談某一個 b。' },
    ],
    moves: [
      { q: 'forall', v: 'a', dom: 'Z', domText: '偶數', who: '對手出' },
      { q: 'forall', v: 'b', dom: 'Z', domText: '偶數', who: '對手出' },
    ],
    check: 'a + b 是偶數',
    note: '兩招都由對手出：你得準備好應付任何一對偶數，而且兩個可能不一樣。這正是第 2 章要替兩個已知取兩個名字（k 和 m）的原因。',
  },
  {
    id: 'four',
    plain: '若 n 是 4 的倍數，則 n 是偶數。',
    parts: ['', '整數 n：若 n 是 4 的倍數，則 n 是偶數。'],
    slots: [{ want: 'forall', wrong: '「存在一個 n」只要找到一個 n 就成立，例如 n = 4。但這句話講的是一條規律，要對每個 n 都成立。' }],
    moves: [{ q: 'forall', v: 'n', dom: 'Z', who: '對手出' }],
    check: '若 n 是 4 的倍數，則 n 是偶數',
    note: '第 3 章把 8、6、3 放進四格圖時，其實就是對手出了三個 n。那只是例子；第 2 章的 4k = 2 × (2k) 才是對每個 n 都成立的理由。',
  },
  {
    id: 'opp',
    plain: '每個整數都有相反數。',
    parts: ['', '整數 x，', '整數 y，使 x + y = 0。'],
    slots: [
      { want: 'forall', wrong: '原句說「每個整數」，所以 x 是「對每個」。' },
      { want: 'exists', wrong: '「對每個整數 y，x + y = 0」是說所有 y 都能讓 x + y = 0，這太強了。原句只說「有」一個相反數，也就是「存在」。' },
    ],
    moves: [
      { q: 'forall', v: 'x', dom: 'Z', who: '對手出' },
      { q: 'exists', v: 'y', dom: 'Z', who: '你出' },
    ],
    check: 'x + y = 0',
    note: '「有」就是「存在」。對手先出 x，你再看著 x 找 y：和句子 A 是同一種遊戲。下一幕就來玩這一句。',
  },
];

@Component({
  selector: 'app-pf-hidden',
  standalone: true,
  imports: [MovesComponent],
  styleUrl: './scene-hidden.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">4 / 5 · 藏起來的量詞</p>
        <h1 class="pf-title">這句話裡，<br />藏了幾個「對每個」？</h1>
        <p class="pf-lede">
          平常的數學句子很少把「對每個」「存在」寫出來，但它們都在。要知道一句話要求你做什麼，第一步就是把它們找出來。
        </p>

        @for (it of items; track it.id; let i = $index) {
          @if (i <= active()) {
            <div class="item pf-col tight" [class.pf-rise]="i > 0">
              <div class="pf-slip">
                <small>原句 {{ i + 1 }}</small>
                <p>{{ it.plain }}</p>
              </div>
              <p class="pf-q">把它寫成完整版：每個空格填「對每個」還是「存在」？</p>
              <div class="full" role="group" [attr.aria-label]="'原句 ' + (i + 1) + ' 的完整版'">
                @for (part of it.parts; track $index; let j = $index) {
                  @if (part) {
                    <span class="txt">{{ part }}</span>
                  }
                  @if (j < it.slots.length) {
                    <span class="slot" role="group" [attr.aria-label]="'第 ' + (j + 1) + ' 個空格'">
                      @for (w of words; track w) {
                        <button
                          type="button"
                          class="pf-btn small"
                          [class.picked]="pick(it.id, j) === w"
                          [attr.aria-pressed]="pick(it.id, j) === w"
                          [disabled]="done()[it.id]"
                          (click)="choose(it.id, j, w)"
                        >
                          {{ word(w) }}
                        </button>
                      }
                    </span>
                  }
                }
              </div>
              @if (!done()[it.id]) {
                <div class="pf-row"><button type="button" class="pf-btn primary" (click)="check(it)">檢查</button></div>
              }
              @if (msgs()[it.id]; as m) {
                <p class="pf-feedback" [class.good]="done()[it.id]" [class.bad]="!done()[it.id]" role="status">{{ m }}</p>
              }
              @if (done()[it.id]) {
                <app-pf-moves [moves]="it.moves" [check]="it.check" [symbols]="true" [label]="'原句 ' + (i + 1) + ' 的出招順序'" />
                <p class="pf-p">{{ it.note }}</p>
                @if (i < items.length - 1 && active() === i) {
                  <div class="pf-row"><button type="button" class="pf-btn primary" (click)="active.set(i + 1)">下一句</button></div>
                }
              }
            </div>
          }
        }

        @if (allDone()) {
          <div class="pf-col tight pf-rise">
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>讀一句數學，先把藏起來的量詞找出來，<br />再排出招順序：<br />誰出、從哪裡挑、誰先。</p>
            </div>
            <details class="pf-why">
              <summary>「x² = 2 有解」少了什麼？</summary>
              <div>
                <p>它沒說 x 從哪裡挑。完整版是「存在 x，使 x² = 2」：在實數 ℝ 裡成立（x = √2），在有理數 ℚ 裡不成立，第 8 章會證明這件事。</p>
                <p>少寫了世界，這句話就沒有確定的真假。這和上一幕 ℤ、ℕ 的差別是同一件事。</p>
              </div>
            </details>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneHiddenComponent {
  private readonly progress = inject(LearnProgressService);

  readonly items = ITEMS;
  readonly words: Qt[] = ['forall', 'exists'];

  readonly active = signal(0);
  readonly picks = signal<Record<string, (Qt | undefined)[]>>({});
  readonly done = signal<Record<string, boolean>>({});
  readonly msgs = signal<Record<string, string>>({});

  readonly allDone = computed(() => ITEMS.every((it) => this.done()[it.id]));

  word(w: Qt): string {
    return WORD[w];
  }

  pick(id: string, j: number): Qt | undefined {
    return this.picks()[id]?.[j];
  }

  choose(id: string, j: number, w: Qt): void {
    this.picks.update((p) => {
      const row = [...(p[id] ?? [])];
      row[j] = w;
      return { ...p, [id]: row };
    });
    this.msgs.update((m) => ({ ...m, [id]: '' }));
  }

  check(it: Item): void {
    const row = this.picks()[it.id] ?? [];
    const empty = it.slots.findIndex((_, j) => !row[j]);
    if (empty >= 0) {
      this.msgs.update((m) => ({ ...m, [it.id]: `第 ${empty + 1} 個空格還沒選。` }));
      return;
    }
    const wrong = it.slots.findIndex((s, j) => row[j] !== s.want);
    if (wrong >= 0) {
      const prefix = it.slots.length > 1 ? `第 ${wrong + 1} 個空格：` : '';
      this.msgs.update((m) => ({ ...m, [it.id]: prefix + it.slots[wrong].wrong }));
      return;
    }
    this.done.update((d) => ({ ...d, [it.id]: true }));
    this.msgs.update((m) => ({ ...m, [it.id]: '對。' }));
    if (this.allDone()) this.progress.markCompleted('proofs-ch4', '4');
  }
}
