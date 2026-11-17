import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { BoardState, CardId, SQ_PLUS_N } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';
import { SkeletonReviewComponent } from '../board/skeleton-review.component';
import { CH6_SKELETON } from '../board/skeletons';
import { CaseLineComponent, CaseRow } from './case-line.component';
import { caseRows } from './ch9-cases';

type Half = 'all' | 'evens' | 'drawn';

const HALF: { id: Half; text: string; why: string }[] = [
  { id: 'all', text: '所有整數', why: '還沒。情況 2（n 是奇數）還沒證，數線上奇數那一排還沒蓋章。現在說「對每個整數」，就是 9.1 那位同學的錯。' },
  { id: 'evens', text: '所有偶數', why: '對。情況 1 的證明對每一個偶數 n 都成立，不只畫出來的那幾個；奇數還一個都沒證到。' },
  { id: 'drawn', text: '數線上畫出來的那幾個偶數', why: '比那多。情況 1 的證明裡 k 是任意的，所以它對每一個偶數都成立。數線只是畫出其中幾個。' },
];

@Component({
  selector: 'app-pf-split',
  standalone: true,
  imports: [ProofBoardComponent, SkeletonReviewComponent, CaseLineComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', '../ch8/ch8.scss', './ch9-split.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">2 / 5 · 分頭</p>
        <h1 class="pf-title">分頭證完，<br />才算證完</h1>
        <p class="pf-lede">這一幕的兩種情況裡，都會用到第 6 章的步法。先把它的骨架拿出來。</p>

        <app-pf-skeleton-review [card]="skeleton" [saveAt]="['proofs-ch9', '2']" (finished)="reviewed.set(true)" />

        @if (reviewed()) {
          <div class="c6-block pf-rise">
            <div class="c7-claim">
              <small>要證的句子</small>
              <p>對每個整數 n，n² + n 是偶數。</p>
            </div>
            <p class="pf-p">
              n = 0、1、2、3、4 時，n² + n 是 0、2、6、12、20，都是偶數<span class="c8-tag">例子</span>。在板上證證看。先試試直接證；卡住的話，卡片區有一張這一章的新卡。
            </p>
            <app-pf-board
              [start]="start"
              [deck]="deck"
              deckNote="第 9 章加了一張卡：按餘數分。"
              [frozen]="!!final()"
              label="定理：對每個整數 n，n² + n 是偶數"
              idBase="pf-c9-split"
              (changed)="onChanged($event)"
              (solved)="onSolved($event)"
              (refused)="onRefused($event.card, $event.code)"
            />
            @if (hint(); as h) {
              <p class="pf-feedback you pf-rise" role="note">{{ h }}</p>
            }
          </div>
        }

        @if (rows().length) {
          <div class="c6-block pf-rise">
            <p class="pf-p">每個整數依它屬於哪一種情況上色。一種情況證完，那一排就蓋上章：</p>
            <app-pf-case-line [rows]="rows()" [lo]="-8" [hi]="8" mode="proof" />
            <p class="pf-feedback" [class.good]="!!final()" role="status">{{ stripMsg() }}</p>
          </div>
        }

        @if (halfSeen()) {
          <div class="c6-block pf-rise">
            <p class="pf-q small">情況 1 證完的那一刻，證到了哪些 n？</p>
            <div class="pf-row" role="group" aria-label="情況 1 證到了哪些 n">
              @for (o of half; track o.id) {
                <button type="button" class="pf-btn small" [class.picked]="halfPick() === o.id" (click)="halfPick.set(o.id)">{{ o.text }}</button>
              }
            </div>
            @if (halfWhy(); as w) {
              <p class="pf-feedback" [class.good]="halfPick() === 'evens'" [class.bad]="halfPick() !== 'evens'" role="status">{{ w }}</p>
            }
          </div>
        }

        @if (final()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              兩種情況是兩個完整的證明，各自有自己的 k、自己的證人。「按餘數分」這張卡本身不證任何東西，它只保證兩種情況加起來蓋滿所有整數。
            </p>
            <div class="pf-def">
              <small>另一種寫法</small>
              <p>n² + n = n(n + 1)。n 和 n + 1 一定有一個是偶數，偶數乘任何整數還是偶數，所以 n² + n 是偶數。</p>
            </div>
            <p class="pf-q small">這個一行的證明，有沒有分情況？</p>
            <div class="pf-row" role="group" aria-label="一行的證明有沒有分情況">
              <button type="button" class="pf-btn small" [class.picked]="onePick() === 'yes'" (click)="pickOne('yes')">有</button>
              <button type="button" class="pf-btn small" [class.picked]="onePick() === 'no'" (click)="pickOne('no')">沒有</button>
            </div>
            @if (onePick(); as p) {
              <p class="pf-feedback" [class.good]="p === 'yes'" [class.you]="p === 'no'" role="status">
                {{ p === 'yes' ? '對，' : '看起來沒有，其實藏著。' }}情況藏在「n 和 n + 1 一定有一個是偶數」這句話裡：n 是偶數時是 n，n 是奇數時是 n + 1。要證這句話，還是得分兩種情況。
              </p>
            }
          </div>
        }

        @if (onePick()) {
          <div class="c6-block pf-rise">
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>已知只有「或」可以用時，就分頭證。<br />每一種情況各自是一個完整的證明，全部證完才算證完。</p>
            </div>
            <p class="pf-note">
              「n 是偶數，或 n + 1 是偶數」這句話本身是一個「或」，而且是要證的目標。<a routerLink="/learn/proofs/ch9/3">下一幕</a>看目標是「或」時該怎麼走。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneSplitComponent {
  private readonly progress = inject(LearnProgressService);

  readonly skeleton = CH6_SKELETON;
  readonly start = SQ_PLUS_N;
  readonly deck: CardId[] = ['intro', 'unfoldGoal', 'witness', 'check', 'rem', 'unfold', 'obtain'];
  readonly half = HALF;

  readonly reviewed = signal(!!this.progress.getStepData('proofs-ch9', '2', 'skeleton'));
  readonly st = signal<BoardState | null>(null);
  readonly final = signal<BoardState | null>(null);
  readonly hint = signal<string | null>(null);
  readonly halfSeen = signal(false);
  readonly halfPick = signal<Half | null>(null);
  readonly onePick = signal<'yes' | 'no' | null>(null);

  readonly rows = computed<CaseRow[]>(() => caseRows(this.final() ?? this.st()));
  readonly halfWhy = computed(() => HALF.find((o) => o.id === this.halfPick())?.why ?? null);
  readonly stripMsg = computed(() => {
    const r = this.rows();
    const done = r.filter((x) => x.sealed).length;
    if (this.final()) return '兩種情況都證完，每一個整數都蓋到章了，整句話才算證完。';
    if (done === 0) return '兩種情況加起來蓋滿所有整數。先證情況 1：n 是偶數。';
    return '情況 1 證完：偶數那一排全部蓋章。奇數一個都還沒證到，所以整句話還沒證完。';
  });

  onChanged(st: BoardState): void {
    this.hint.set(null);
    this.st.set(st);
    if (st.tabs.some((t) => t.id === '1' && t.status === 'done')) this.halfSeen.set(true);
  }

  onRefused(card: CardId, code: string): void {
    const split = (this.st()?.tabs.length ?? 0) > 0;
    if ((card === 'witness' || card === 'check') && !split && (code === 'neq' || code === 'div' || code === 'parse')) {
      this.hint.set(
        'm 只能用板上的字母寫，可是板上只有 n，已知裡也沒有任何關於 n 的等式，n² + n 寫不成「2 乘一個整數式子」。不過 n 只有兩種可能：偶數或奇數。知道是哪一種，就有一條等式可以代入。新卡「按餘數分」做的就是這件事。',
      );
    } else if (card === 'unfold' && !split) {
      this.hint.set('已知裡還沒有東西可以展開。n 是對手給的，你對它一無所知，除了一件事：它不是偶數就是奇數。');
    }
  }

  onSolved(st: BoardState): void {
    this.hint.set(null);
    this.st.set(st);
    this.final.set(st);
    this.halfSeen.set(true);
    this.progress.markCompleted('proofs-ch9', '2');
  }

  pickOne(p: 'yes' | 'no'): void {
    this.onePick.set(p);
  }
}
