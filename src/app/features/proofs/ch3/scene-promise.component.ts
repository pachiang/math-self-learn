import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { CELLS, Cell, CellView, Grid4Component } from './grid4.component';

type Tone = 'good' | 'bad' | 'you';

interface Situation {
  id: string;
  cell: Cell;
  text: string;
  verdict: string;
  why: string;
}

const SITS: Situation[] = [
  { id: '甲', cell: 'TT', text: '考了 100 分，吃到冰淇淋', verdict: '守約', why: '考到了，也請了，說到做到。' },
  { id: '乙', cell: 'TF', text: '考了 100 分，沒吃到冰淇淋', verdict: '食言', why: '你考到了，冰淇淋卻沒有來。這就是食言。' },
  { id: '丙', cell: 'FT', text: '沒考 100 分，還是吃到冰淇淋', verdict: '沒食言', why: '爸爸只說考到會請，沒說考不到就不請。多請你一次，不算說話不算話。' },
  { id: '丁', cell: 'FF', text: '沒考 100 分，也沒吃到冰淇淋', verdict: '沒食言', why: '你沒考到，這個承諾根本沒派上用場。爸爸沒有說錯話。' },
];

/** Numbers for the math sentence, in the order the learner places them. None can reach TF. */
const PLACE = [
  { n: 8, cell: 'TT' as Cell, why: '8 = 4 × 2，是 4 的倍數，也是偶數。' },
  { n: 6, cell: 'FT' as Cell, why: '6 是偶數，但不是 4 的倍數（6 ÷ 4 = 1.5，不是整數）。' },
  { n: 3, cell: 'FF' as Cell, why: '3 既不是 4 的倍數，也不是偶數。' },
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
          <p class="pf-q">考完試，結果一定是下面四種情況之一。哪幾種算爸爸食言？</p>
          <p class="pf-note">點你覺得算食言的情況，可以選好幾個，也可以一個都不選。</p>
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
            <p class="pf-p">把這四種情況放進四格圖。這次上排是「考了 100 分」，左欄是「吃到冰淇淋」：</p>
            <app-pf-grid4 p="考 100 分" q="吃到冰淇淋" [view]="storyView" />
            <p class="pf-p">
              四格裡只有一格算違約。上排是你考到 100 分的時候，承諾這時才<b>被觸發</b>，爸爸必須兌現；下排是你沒考到，承諾<b>沒被觸發</b>，爸爸請不請都不算違約。
            </p>
            <p class="pf-p">
              數學把這種句子叫做<b>「若 P 則 Q」</b>（if P then Q），寫成 <span class="pf-num">P ⇒ Q</span>，讀作 P implies Q。數學的規定是：只有違約那一格，這句話是假的；其他三格都算真的。
            </p>
            <p class="pf-p">可是，沒觸發的兩格為什麼算「真」，而不是「不知道」？</p>
            <div class="pf-row">
              @if (!whyOpen()) {
                <button type="button" class="pf-btn primary" (click)="whyOpen.set(true)">用一句數學來看</button>
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
              <p class="pf-q">{{ place[placeIdx()].n }} 應該放在四格圖的哪一格？</p>
              <p class="pf-note">直接點格子。上排是「n 是 4 的倍數」，左欄是「n 是偶數」。</p>
            }
            <app-pf-grid4 p="n 是 4 的倍數" q="n 是偶數" [view]="mathView()" [pickable]="placeIdx() < place.length" (pick)="placeAt($event)" />
            @if (placeMsg(); as m) {
              <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.bad]="m.tone === 'bad'" role="status">{{ m.text }}</p>
            }

            @if (placeIdx() >= place.length) {
              <p class="pf-q">違約格（是 4 的倍數，卻不是偶數）目前空著。會不會有哪個數其實該放進去？</p>
              <div class="pf-row">
                <button type="button" class="pf-btn" [class.picked]="never() === 'maybe'" [disabled]="never() === 'no'" (click)="never.set('maybe')">會，只是還沒試到</button>
                <button type="button" class="pf-btn" [class.picked]="never() === 'no'" [disabled]="never() === 'no'" (click)="pickNever()">不會，永遠空著</button>
              </div>
              @if (never() === 'maybe') {
                <p class="pf-feedback you" role="status">再多試幾個數，也只是例子而已，第 1 章看過這件事。這次其實不必試，用第 2 章的工具就看得出答案。再選一次看看。</p>
              }
              @if (never() === 'no') {
                <div class="pf-obj got pf-rise">
                  <span class="pf-tag">已知「n 是 4 的倍數」</span>
                  <div>n = 4k，k 是整數</div>
                  <div>n = 2 × (2k)，2k 是整數，所以 n 是偶數</div>
                  <small>這是第 2 章的推理：違約格永遠空著，不是因為還沒試到。</small>
                </div>
                <p class="pf-p pf-rise">
                  所以不管 n 是多少，這句話都不會出錯。可是 6 和 3 落在<b>沒觸發</b>的格子裡。要是沒觸發算「假」，這句人人同意的話碰到 n = 6 就變成假的了，這說不過去。
                  「若 P 則 Q」想說的就是「不會違約」，所以數學規定：<b>沒觸發算真</b>。
                </p>
                <div class="pf-takeaway reveal">
                  <small>帶走這一句</small>
                  <p>「若 P 則 Q」只保證一件事：<br />P 成立的時候，Q 也成立。<br />只有「P 成立、Q 不成立」那一格算違約。</p>
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
      this.commitMsg.set({ tone: 'good', text: '只有乙。很多人會把丙或丁也算成食言，你沒有。' });
      return;
    }
    const extra = [...p].filter((id) => id !== '乙');
    const parts: string[] = [];
    if (!p.has('乙')) parts.push('你漏了乙：考到 100 分卻沒有冰淇淋，這才是食言。');
    if (extra.length) parts.push(`${extra.join('、')}不算食言，理由寫在每張卡片下面。`);
    this.commitMsg.set({ tone: 'you', text: `只有乙算食言。${parts.join('')}` });
  }

  placeAt(c: Cell): void {
    const item = PLACE[this.placeIdx()];
    if (!item) return;
    if (c !== item.cell) {
      this.placeMsg.set({ tone: 'bad', text: `${item.n} 不在這一格。${item.why}` });
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
