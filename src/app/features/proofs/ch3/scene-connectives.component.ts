import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { CELLS, Cell, CellView, Grid4Component, HOLDS, cellDesc } from './grid4.component';

type Phase = 'or' | 'and' | 'not' | 'done';
type Tone = 'good' | 'bad' | 'you';

/** Each number sits alone in its cell, so no cell looks "heavier" than another. */
const NUMS = [4, 7, 12, 15];
const CELL_OF: Record<number, Cell> = { 12: 'TT', 4: 'TF', 15: 'FT', 7: 'FF' };
const TOK: Record<Cell, string> = { TT: '12', TF: '4', FT: '15', FF: '7' };

interface Sentence {
  id: 'or' | 'and' | 'not';
  name: string;
  text: string;
  sym: string;
  en: string;
  holds: (c: Cell) => boolean;
}

const SENT: Record<'or' | 'and' | 'not', Sentence> = {
  or: { id: 'or', name: 'P 或 Q', text: 'n 是偶數，或 n > 10', sym: 'P ∨ Q', en: 'or', holds: HOLDS.or },
  and: { id: 'and', name: 'P 且 Q', text: 'n 是偶數，且 n > 10', sym: 'P ∧ Q', en: 'and', holds: HOLDS.and },
  not: { id: 'not', name: '非 P', text: 'n 不是偶數', sym: '¬P', en: 'not', holds: HOLDS.notP },
};

const XOR_VIEW: Partial<Record<Cell, CellView>> = { TT: { mark: 'false' }, TF: { mark: 'true' }, FT: { mark: 'true' }, FF: { mark: 'false' } };

@Component({
  selector: 'app-pf-connectives',
  standalone: true,
  imports: [Grid4Component],
  styleUrl: './scene-connectives.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">1 / 6 · 且、或、非</p>
        <h1 class="pf-title">12 算不算？</h1>
        <p class="pf-lede">數學句子常用「且」「或」「非」把兩句話接成一句。先看兩句關於整數 n 的話：</p>

        <div class="defs">
          <div class="pf-def"><small>P</small><p>n 是偶數</p></div>
          <div class="pf-def"><small>Q</small><p>n &gt; 10</p></div>
        </div>

        <!-- 1 · predict the inclusive or -->
        <div class="pf-col tight">
          <p class="pf-q">「n 是偶數，或 n &gt; 10」：下面哪些數讓這句話成立？</p>
          <p class="pf-note">點選你認為成立的數，可以複選。</p>
          <div class="nums">
            @for (n of nums; track n) {
              <button
                type="button"
                class="num"
                [class.picked]="orPicks().has(n)"
                [class.yes]="orDone() && holdsOr(n)"
                [attr.aria-pressed]="orPicks().has(n)"
                [disabled]="orDone()"
                (click)="toggleOr(n)"
              >
                <b>{{ n }}</b>
                @if (orDone()) {
                  <small>偶數 {{ n % 2 === 0 ? '✓' : '✗' }}　&gt;10 {{ n > 10 ? '✓' : '✗' }}</small>
                  <small class="verdict">{{ holdsOr(n) ? '成立' : '不成立' }}</small>
                }
              </button>
            }
          </div>
          @if (!orDone()) {
            <div class="pf-row"><button type="button" class="pf-btn primary" (click)="commitOr()">我選好了</button></div>
          } @else if (orMsg(); as m) {
            <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.you]="m.tone === 'you'" role="status">{{ m.text }}</p>
          }
        </div>

        <!-- 2 · the four-cell grid -->
        @if (orDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              每個數都讓 P、Q 各自成立或不成立，所以會落進下面四格中的一格。這張<b>四格圖</b>整章都會用：<b>上排是 P 成立，左欄是 Q 成立</b>。標「● 成立」的藍色格，是句子成立的格。
            </p>
            <div class="slip">
              <small>現在的句子</small>
              <p>{{ cur().text }}</p>
            </div>
            <app-pf-grid4 p="n 是偶數" q="n &gt; 10" [view]="gridView()" [pickable]="picking()" (pick)="togglePick($event)" />

            @switch (phase()) {
              @case ('or') {
                <p class="pf-p">「或」在三格成立。只有兩邊都不成立的那一格（7）不成立。</p>
                <div class="pf-row"><button type="button" class="pf-btn primary" (click)="go('and')">下一句：且</button></div>
              }
              @case ('done') {}
              @default {
                @if (!solved()) {
                  <p class="pf-q">「{{ cur().text }}」在哪幾格成立？</p>
                  <p class="pf-note">直接點四格圖裡的格子選取（可以複選），再按檢查。</p>
                  <div class="pf-row"><button type="button" class="pf-btn primary" (click)="checkPick()">檢查</button></div>
                }
                @if (pickMsg(); as m) {
                  <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.bad]="m.tone === 'bad'" role="status">{{ m.text }}</p>
                }
                @if (solved() && phase() === 'and') {
                  <div class="pf-row"><button type="button" class="pf-btn primary" (click)="go('not')">下一句：非</button></div>
                }
                @if (solved() && phase() === 'not') {
                  <div class="pf-row"><button type="button" class="pf-btn primary" (click)="go('done')">把三句收起來</button></div>
                }
              }
            }
          </div>
        }

        <!-- 3 · compression -->
        @if (phase() === 'done') {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">三句話，三種圈法。數學替這三種圈法取了短名字和符號：</p>
            <div class="minis">
              @for (s of sentences; track s.id) {
                <div class="mini-card">
                  <app-pf-grid4 [mini]="true" p="P" q="Q" [view]="miniView(s)" [label]="s.name + ' 成立的格'" />
                  <div>
                    <b>{{ s.name }}</b>
                    <span class="sym">{{ s.sym }}</span>
                    <small>讀作 {{ s.en }}</small>
                  </div>
                </div>
              }
            </div>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>用且、或、非接起來的句子，<br />就是在四格裡圈出它成立的格。<br />「或」圈三格：兩個都成立也算。</p>
            </div>
            <details class="pf-why">
              <summary>日常的「或」不是常常只能選一個嗎？</summary>
              <div>
                <p>「套餐附湯或飲料」通常不能兩樣都拿。這種二選一叫互斥或（exclusive or），在四格圖上只圈「恰好一個成立」的兩格：</p>
                <app-pf-grid4 [mini]="true" p="P" q="Q" [view]="xorView" label="互斥或成立的格" />
                <p>數學裡的「或」一律是包含的。要表達二選一，會明說「恰好一個成立」。</p>
              </div>
            </details>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneConnectivesComponent {
  private readonly progress = inject(LearnProgressService);

  readonly nums = NUMS;
  readonly sentences = [SENT.and, SENT.or, SENT.not];
  readonly xorView = XOR_VIEW;

  readonly orPicks = signal<Set<number>>(new Set());
  readonly orDone = signal(false);
  readonly orMsg = signal<{ tone: Tone; text: string } | null>(null);

  readonly phase = signal<Phase>('or');
  readonly picks = signal<Set<Cell>>(new Set());
  readonly solved = signal(false);
  readonly pickMsg = signal<{ tone: Tone; text: string } | null>(null);

  readonly cur = computed(() => SENT[this.phase() === 'done' ? 'not' : (this.phase() as 'or' | 'and' | 'not')]);
  readonly picking = computed(() => (this.phase() === 'and' || this.phase() === 'not') && !this.solved());

  readonly gridView = computed(() => {
    const s = this.cur();
    const showMarks = this.phase() === 'or' || this.phase() === 'done' || this.solved();
    const v: Partial<Record<Cell, CellView>> = {};
    for (const c of CELLS) {
      v[c] = {
        tokens: [TOK[c]],
        mark: showMarks ? (s.holds(c) ? 'true' : 'false') : 'none',
        picked: this.picking() && this.picks().has(c),
      };
    }
    return v;
  });

  holdsOr(n: number): boolean {
    return HOLDS.or(CELL_OF[n]);
  }

  miniView(s: Sentence): Partial<Record<Cell, CellView>> {
    const v: Partial<Record<Cell, CellView>> = {};
    for (const c of CELLS) v[c] = { mark: s.holds(c) ? 'true' : 'false' };
    return v;
  }

  toggleOr(n: number): void {
    this.orPicks.update((s) => {
      const next = new Set(s);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }

  commitOr(): void {
    const picks = this.orPicks();
    const notes: string[] = [];
    if (!picks.has(12)) notes.push('12 是偶數，也大於 10：兩邊都成立。數學的「或」只要至少一邊成立就算，兩邊都成立也算。');
    if (!picks.has(4)) notes.push('4 是偶數，第一邊成立就夠了。');
    if (!picks.has(15)) notes.push('15 大於 10，第二邊成立就夠了。');
    if (picks.has(7)) notes.push('7 不是偶數，也不大於 10，兩邊都不成立。');
    this.orDone.set(true);
    this.orMsg.set(
      notes.length === 0
        ? { tone: 'good', text: '全對。特別注意 12：它兩邊都成立，也算「或」成立。' }
        : { tone: 'you', text: `成立的是 4、12、15。${notes.join(' ')}` },
    );
  }

  go(p: Phase): void {
    this.phase.set(p);
    this.picks.set(new Set());
    this.solved.set(false);
    this.pickMsg.set(null);
    if (p === 'done') this.progress.markCompleted('proofs-ch3', '1');
  }

  togglePick(c: Cell): void {
    if (!this.picking()) return;
    this.pickMsg.set(null);
    this.picks.update((s) => {
      const next = new Set(s);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }

  checkPick(): void {
    const s = this.cur();
    const picks = this.picks();
    if (picks.size === 0) {
      this.pickMsg.set({ tone: 'bad', text: '先點選格子。' });
      return;
    }
    const wrong = CELLS.filter((c) => picks.has(c) !== s.holds(c));
    if (wrong.length === 0) {
      this.solved.set(true);
      this.pickMsg.set({
        tone: 'good',
        text: s.id === 'and' ? '對。「且」要兩邊都成立，只有 12 那一格。' : '對。「n 不是偶數」只管 P：上排是偶數，所以是下半排兩格。15 大於 10 也不影響。',
      });
      return;
    }
    const c = wrong[0];
    const missing = !picks.has(c);
    this.pickMsg.set({ tone: 'bad', text: this.explain(s, c, missing) });
  }

  private explain(s: Sentence, c: Cell, missing: boolean): string {
    const at = `${TOK[c]} 那一格（${cellDesc(c)}）`;
    if (s.id === 'and') {
      return missing ? `${at}：P、Q 都成立，「且」成立。` : `${at}：「且」要 P、Q 兩邊都成立，這格有一邊不成立。`;
    }
    if (missing) return `${at}：${TOK[c]} 不是偶數，所以「n 不是偶數」成立。它大不大於 10 無所謂，這句話只管 P。`;
    return `${at}：${TOK[c]} 是偶數，所以「n 不是偶數」不成立。`;
  }
}
