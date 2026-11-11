import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { CELLS, Cell, CellView, Grid4Component, cellDesc } from './grid4.component';

type Tone = 'good' | 'bad' | 'you';

interface Situation {
  id: string;
  cell: Cell;
  text: string;
  verdict: string;
  why: string;
}

const SITS: Situation[] = [
  { id: '甲', cell: 'TT', text: '考了 100 分，吃到冰淇淋', verdict: '守約', why: '說到做到。' },
  { id: '乙', cell: 'TF', text: '考了 100 分，沒吃到冰淇淋', verdict: '食言', why: '考了 100 分卻沒有冰淇淋：這就是食言。' },
  { id: '丙', cell: 'FT', text: '沒考 100 分，還是吃到冰淇淋', verdict: '沒食言', why: '爸爸只說了考 100 分會怎樣，沒說沒考 100 分就不准吃。多請一次不算食言。' },
  { id: '丁', cell: 'FF', text: '沒考 100 分，也沒吃到冰淇淋', verdict: '沒食言', why: '沒考 100 分，承諾根本沒被觸發。爸爸沒有說錯話。' },
];

/** Numbers for the math sentence, in the order the learner places them. None can reach TF. */
const PLACE = [
  { n: 8, cell: 'TT' as Cell, why: '8 = 4 × 2，是 4 的倍數；8 也是偶數。' },
  { n: 6, cell: 'FT' as Cell, why: '6 是偶數，但不是 4 的倍數：6 = 4 × 1.5，1.5 不是整數。' },
  { n: 3, cell: 'FF' as Cell, why: '3 不是 4 的倍數，也不是偶數。' },
];

const IMPLIES_NOTE: Record<Cell, string> = { TT: '算真', TF: '算假', FT: '算真', FF: '算真' };
const IMPLIES_MARK: Record<Cell, CellView['mark']> = { TT: 'kept', TF: 'breach', FT: 'idle', FF: 'idle' };

@Component({
  selector: 'app-pf-promise',
  standalone: true,
  imports: [Grid4Component],
  styleUrl: './scene-promise.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">2 / 6 · 若…則</p>
        <h1 class="pf-title">什麼時候算食言？</h1>

        <div class="pf-slip">
          <small>爸爸說</small>
          <p>「如果你這次考 100 分，我就請你吃冰淇淋。」</p>
        </div>

        <!-- 1 · predict -->
        <div class="pf-col tight">
          <p class="pf-q">考完試，可能發生下面四種情況。哪幾種算爸爸食言？</p>
          <p class="pf-note">點選你認為食言的情況，可以複選，也可以都不選。</p>
          <div class="sits">
            @for (s of sits; track s.id) {
              <button
                type="button"
                class="sit"
                [class.picked]="picks().has(s.id)"
                [class.broke]="committed() && s.cell === 'TF'"
                [attr.aria-pressed]="picks().has(s.id)"
                [disabled]="committed()"
                (click)="toggle(s.id)"
              >
                <span class="tag">{{ s.id }}</span>
                <span class="txt">{{ s.text }}</span>
                @if (committed()) {
                  <span class="verdict">{{ s.verdict }}</span>
                  <small>{{ s.why }}</small>
                }
              </button>
            }
          </div>
          @if (!committed()) {
            <div class="pf-row"><button type="button" class="pf-btn primary" (click)="commit()">我選好了</button></div>
          } @else if (commitMsg(); as m) {
            <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.you]="m.tone === 'you'" role="status">{{ m.text }}</p>
          }
        </div>

        <!-- 2 · the grid, and a name for it -->
        @if (committed()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">把四種情況放進四格圖。P 是「考 100 分」，Q 是「吃到冰淇淋」：</p>
            <app-pf-grid4 p="考 100 分" q="吃到冰淇淋" [view]="storyView" />
            <p class="pf-p">
              只有一格違約。這種句子叫<b>「若 P 則 Q」</b>（if P then Q），寫成 <span class="pf-num">P ⇒ Q</span>，讀作 P implies Q。上排是承諾被觸發的時候；下排 P 不成立，承諾<b>沒被觸發</b>，不管 Q 怎樣都不算違約。
            </p>
            <p class="pf-p">數學把「若 P 則 Q」算成：違約格是假，其他三格都是真。可是沒觸發為什麼算「真」，不算「不知道」？</p>
            <div class="pf-row">
              @if (!whyOpen()) {
                <button type="button" class="pf-btn primary" (click)="whyOpen.set(true)">看一句數學</button>
              }
            </div>
          </div>
        }

        <!-- 3 · why "not triggered" counts as true -->
        @if (whyOpen()) {
          <div class="pf-col tight pf-rise">
            <div class="pf-slip">
              <small>一句大家都同意的話</small>
              <p>若 n 是 4 的倍數，則 n 是偶數。</p>
            </div>
            @if (placeIdx() < place.length) {
              <p class="pf-q">把 {{ place[placeIdx()].n }} 放進四格圖：它落在哪一格？</p>
              <p class="pf-note">點格子。P 是「n 是 4 的倍數」，Q 是「n 是偶數」。</p>
            }
            <app-pf-grid4 p="n 是 4 的倍數" q="n 是偶數" [view]="mathView()" [pickable]="placeIdx() < place.length" (pick)="placeAt($event)" />
            @if (placeMsg(); as m) {
              <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.bad]="m.tone === 'bad'" role="status">{{ m.text }}</p>
            }

            @if (placeIdx() >= place.length) {
              <p class="pf-q">違約格（4 的倍數，卻不是偶數）是空的。會不會有某個數落進去？</p>
              <div class="pf-row">
                <button type="button" class="pf-btn" [class.picked]="never() === 'maybe'" [disabled]="never() === 'no'" (click)="never.set('maybe')">會，只是還沒試到</button>
                <button type="button" class="pf-btn" [class.picked]="never() === 'no'" [disabled]="never() === 'no'" (click)="pickNever()">不會，永遠空著</button>
              </div>
              @if (never() === 'maybe') {
                <p class="pf-feedback you" role="status">試再多數都只是例子（第 1 章）。這次不用試，用第 2 章的工具就能看出來：再選一次。</p>
              }
              @if (never() === 'no') {
                <div class="pf-obj got pf-rise">
                  <span class="pf-tag">從「n 是 4 的倍數」</span>
                  <div>n = 4k，k 是整數</div>
                  <div>n = 2 × (2k)，2k 是整數，所以 n 是偶數</div>
                  <small>第 2 章的理由：違約格永遠空著，不是因為沒試到。</small>
                </div>
                <p class="pf-p pf-rise">
                  所以這句話對每個 n 都不會出錯。可是 6 和 3 落在<b>沒觸發</b>的格。如果沒觸發算「假」，這句大家都同意的話在 n = 6 就變成假的了。
                  數學要「若 P 則 Q」表達的正是「從不違約」，所以<b>沒觸發算真</b>。
                </p>
                <div class="pf-takeaway reveal">
                  <small>帶走這一句</small>
                  <p>「若 P 則 Q」只承諾一件事：<br />P 成立時，Q 也成立。<br />只有「P 成立、Q 不成立」那一格算違約。</p>
                </div>
              }
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class ScenePromiseComponent {
  private readonly progress = inject(LearnProgressService);

  readonly sits = SITS;
  readonly place = PLACE;

  readonly picks = signal<Set<string>>(new Set());
  readonly committed = signal(false);
  readonly commitMsg = signal<{ tone: Tone; text: string } | null>(null);
  readonly whyOpen = signal(false);
  readonly placeIdx = signal(0);
  readonly placeMsg = signal<{ tone: Tone; text: string } | null>(null);
  readonly never = signal<'maybe' | 'no' | null>(null);

  readonly storyView: Partial<Record<Cell, CellView>> = Object.fromEntries(
    SITS.map((s) => [s.cell, { mark: IMPLIES_MARK[s.cell], note: IMPLIES_NOTE[s.cell], tokens: [s.id] }]),
  );

  readonly mathView = computed(() => {
    const placed = PLACE.slice(0, this.placeIdx());
    const done = this.never() === 'no';
    const v: Partial<Record<Cell, CellView>> = {};
    for (const c of CELLS) {
      v[c] = {
        tokens: placed.filter((p) => p.cell === c).map((p) => String(p.n)),
        mark: done ? IMPLIES_MARK[c] : 'none',
        note: done ? (c === 'TF' ? '永遠空著' : IMPLIES_NOTE[c]) : undefined,
      };
    }
    return v;
  });

  toggle(id: string): void {
    this.picks.update((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  commit(): void {
    const p = this.picks();
    this.committed.set(true);
    if (p.size === 1 && p.has('乙')) {
      this.commitMsg.set({ tone: 'good', text: '只有乙。很多人會把丙或丁也算進去，你沒有。' });
      return;
    }
    const extra = [...p].filter((id) => id !== '乙');
    const parts: string[] = [];
    if (!p.has('乙')) parts.push('乙才是食言：考了 100 分卻沒有冰淇淋。');
    if (extra.length) parts.push(`${extra.join('、')}不算食言：每張卡下面寫了理由。`);
    this.commitMsg.set({ tone: 'you', text: `只有乙算食言。${parts.join('')}` });
  }

  placeAt(c: Cell): void {
    const item = PLACE[this.placeIdx()];
    if (!item) return;
    if (c !== item.cell) {
      this.placeMsg.set({ tone: 'bad', text: `${item.n} 不在「${cellDesc(c)}」那一格。${item.why}` });
      return;
    }
    this.placeMsg.set({ tone: 'good', text: item.why });
    this.placeIdx.update((i) => i + 1);
  }

  pickNever(): void {
    this.never.set('no');
    this.placeMsg.set(null);
    this.progress.markCompleted('proofs-ch3', '2');
  }
}
