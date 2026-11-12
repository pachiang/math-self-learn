import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { FlipLineComponent } from './flip-line.component';

interface Opt {
  text: string;
  holds: (x: number) => boolean;
  /** Feedback once picked; the line shows the failing columns. */
  why: string;
}

interface Task {
  id: string;
  orig: string;
  holds: (x: number) => boolean;
  lo: number;
  hi: number;
  opts: Opt[];
  /** Index of the exact opposite. */
  right: number;
}

const TASKS: Task[] = [
  {
    id: 'gt',
    orig: '3 > x',
    holds: (x) => 3 > x,
    lo: -1,
    hi: 7,
    opts: [
      { text: 'x > 3', holds: (x) => x > 3, why: '看 x = 3 那一欄：原條件變成 3 > 3，候選也變成 3 > 3，兩句都不成立，沒有唱反調。等號那一格被漏掉了。' },
      { text: 'x ≥ 3', holds: (x) => x >= 3, why: '每一欄都恰好一個成立。x 比 3 小時原條件成立；x 等於或大於 3 時換候選成立。' },
      { text: 'x < 3', holds: (x) => x < 3, why: '這一列和原條件一模一樣：3 > x 就是 x < 3，只是換個方向寫。它們從頭到尾都一起成立或一起不成立。' },
    ],
    right: 1,
  },
  {
    id: 'and',
    orig: '0 < x 而且 x < 5',
    holds: (x) => 0 < x && x < 5,
    lo: -2,
    hi: 7,
    opts: [
      { text: 'x ≤ 0 而且 x ≥ 5', holds: (x) => x <= 0 && x >= 5, why: '沒有一個數同時 ≤ 0 又 ≥ 5，這一列從頭到尾都是空的。兩端的 x 讓兩句一起不成立。' },
      { text: 'x ≤ 0 或 x ≥ 5', holds: (x) => x <= 0 || x >= 5, why: '每一欄都恰好一個成立。只要有一邊破掉，「而且」就破了，所以兩邊之間要用「或」。' },
      { text: 'x < 0 或 x > 5', holds: (x) => x < 0 || x > 5, why: '看 x = 0 和 x = 5：原條件不成立，這一句也不成立。兩個等號格都漏掉了。' },
    ],
    right: 1,
  },
];

@Component({
  selector: 'app-pf-exact',
  standalone: true,
  imports: [FlipLineComponent],
  styleUrl: './scene-exact.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">3 / 5 · 最裡面那一句</p>
        <h1 class="pf-title">最裡面那一句，<br />要翻得剛好</h1>
        <p class="pf-lede">
          上一幕的否定句最後留著「y &gt; x 不成立」。量詞已經翻好了，可是最裡面這句還沒寫成正面的話。先讓 <span class="pf-num">y&nbsp;=&nbsp;3</span>，看得具體一點。
        </p>

        @for (t of tasks; track t.id; let i = $index) {
          @if (i <= active()) {
            <div class="item pf-col tight" [class.pf-rise]="i > 0">
              <div class="pf-slip">
                <small>{{ i === 0 ? '題目 1' : '題目 2' }} · x 是整數</small>
                <p>「{{ t.orig }}」不成立，換成正面的說法是？</p>
              </div>
              <div class="pf-row" role="group" [attr.aria-label]="'「' + t.orig + '」的反面'">
                @for (o of t.opts; track o.text; let j = $index) {
                  <button
                    type="button"
                    class="pf-btn"
                    [class.picked]="pick()[t.id] === j"
                    [attr.aria-pressed]="pick()[t.id] === j"
                    [disabled]="solved()[t.id]"
                    (click)="choose(t, j)"
                  >
                    {{ o.text }}
                  </button>
                }
              </div>
              <app-pf-flip-line
                [lo]="t.lo"
                [hi]="t.hi"
                [orig]="t.holds"
                [origText]="t.orig"
                [cand]="cand(t)"
                [candText]="candText(t)"
                [label]="'題目 ' + (i + 1)"
              />
              @if (pick()[t.id] !== undefined) {
                <p class="pf-feedback" [class.good]="solved()[t.id]" [class.bad]="!solved()[t.id]" role="status">
                  {{ t.opts[pick()[t.id]!].why }}{{ solved()[t.id] ? '' : '換一個試試。' }}
                </p>
              }

              @if (i === 0 && solved()['gt']) {
                <div class="pf-col tight pf-rise">
                  <p class="pf-p">
                    數線只畫了九個整數，可是理由對每個整數都成立：任何整數 x 和 3 比，只有「小於」「等於」「大於」三種可能。原條件拿走「小於」，反面就得把「等於」和「大於」都收下。
                  </p>
                  <p class="pf-p">
                    y 換成哪個整數都一樣：「y &gt; x 不成立」就是 <b>y ≤ x</b>。所以 ¬B 寫成正面的話是：
                  </p>
                  <div class="pf-slip">
                    <small>B 的否定句（¬B）</small>
                    <p>對每個整數 y，都存在整數 x，使 y ≤ x。</p>
                    <span class="pf-seal proved">證明</span>
                  </div>
                  <p class="pf-p">
                    上一幕的規則 x = y，正好每次都落在「等於」那一格。如果你把反面寫成 y &lt; x，x = y 就一次都贏不了：否定寫錯一格，連誰贏都會跟著變。
                  </p>
                  @if (active() === 0) {
                    <div class="pf-row"><button type="button" class="pf-btn primary" (click)="active.set(1)">再翻一句</button></div>
                  }
                </div>
              }
            </div>
          }
        }

        @if (solved()['and']) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              「而且」要兩邊都成立，所以只要<b>有一邊</b>破掉，它就破了。這和「並非每個學生」變成「有一個學生」是同一件事：兩個條件就像兩個學生，只要一個出問題就夠。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>最裡面的條件要翻得剛好：<br />每一種情況，原條件和新條件恰好一個成立。<br />&gt; 的反面是 ≤；「而且」的反面是「或」。</p>
            </div>
            <details class="pf-why">
              <summary>這兩條規則有名字嗎？</summary>
              <div>
                <p>「並非（P 而且 Q）」等於「並非 P，或並非 Q」；「並非（P 或 Q）」等於「並非 P，而且並非 Q」。這叫 De Morgan 定律，符號寫成 ¬(P ∧ Q) ⇔ ¬P ∨ ¬Q、¬(P ∨ Q) ⇔ ¬P ∧ ¬Q。</p>
                <p>「並非每個」變「存在」，其實是同一條定律放大到很多個條件：「每個 s 都怎樣」就是「s₁ 怎樣，而且 s₂ 怎樣，而且……」。</p>
              </div>
            </details>
            <details class="pf-why">
              <summary>「n 是偶數」的反面一定是「n 是奇數」嗎？</summary>
              <div>
                <p>在整數 ℤ 裡是：每個整數不是偶數就是奇數，恰好一種。可是如果 n 可以是 1/2，它既不是偶數也不是奇數，「不是偶數」就不等於「是奇數」。翻面之前，先看清楚世界。</p>
              </div>
            </details>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneExactComponent {
  private readonly progress = inject(LearnProgressService);

  readonly tasks = TASKS;
  readonly active = signal(0);
  readonly pick = signal<Record<string, number | undefined>>({});
  readonly solved = computed<Record<string, boolean>>(() =>
    Object.fromEntries(TASKS.map((t) => [t.id, this.pick()[t.id] === t.right])),
  );

  cand(t: Task): ((x: number) => boolean) | null {
    const j = this.pick()[t.id];
    return j === undefined ? null : t.opts[j].holds;
  }

  candText(t: Task): string {
    const j = this.pick()[t.id];
    return j === undefined ? '' : t.opts[j].text;
  }

  choose(t: Task, j: number): void {
    this.pick.update((p) => ({ ...p, [t.id]: j }));
    if (TASKS.every((x) => this.solved()[x.id])) this.progress.markCompleted('proofs-ch5', '3');
  }
}
