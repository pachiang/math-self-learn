import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { readNumber } from '../ch2/ch2-expr';
import { BoardState, DIV_TRANS, bridgeOf, givensFor, stmtText } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';
import { SkeletonReviewComponent } from '../board/skeleton-review.component';
import { CH6_SKELETON } from '../board/skeletons';

interface Blank {
  id: 'k' | 'l' | 'm';
  lhs: string;
  times: string;
  from: string;
}
const BLANKS: Blank[] = [
  { id: 'k', lhs: '12', times: '3', from: '3 ∣ 12' },
  { id: 'l', lhs: '60', times: '12', from: '12 ∣ 60' },
  { id: 'm', lhs: '60', times: '3', from: '3 ∣ 60？' },
];

@Component({
  selector: 'app-pf-both-ends',
  standalone: true,
  imports: [ProofBoardComponent, SkeletonReviewComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', './ch7.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">1 / 5 · 兩端</p>
        <h1 class="pf-title">中段之前，<br />先把兩端換成定義</h1>
        <p class="pf-lede">
          第 6 章證完的每一題，中段都只有一步。這一章看中段比較長的證明：已知和目標之間，要搭一座橋。開始之前，先從記憶裡把上一章的骨架拿出來。
        </p>

        <app-pf-skeleton-review [card]="skeleton" [saveAt]="['proofs-ch7', '1']" (finished)="reviewed.set(true)" />

        @if (reviewed()) {
          <div class="c6-block pf-rise">
            <div class="pf-def">
              <small>整除的定義（第 2 章；本課約定 0 ∣ 0 成立、0 ∣ 3 不成立）</small>
              <p>a ∣ b ⇔ 有一個整數 <span class="pf-k">k</span>，使 b = a × <span class="pf-k">k</span></p>
            </div>
            <p class="pf-p">先用具體的數。3 整除 12，12 整除 60。那 3 整除 60 嗎？把三個空格都填上：</p>
            <form class="c7-blanks" (submit)="$event.preventDefault(); checkBlanks()">
              @for (b of blanks; track b.id; let i = $index) {
                <div class="c7-blank">
                  <small>{{ b.from }}</small>
                  <span class="pf-eqn">
                    <span>{{ b.lhs }} = {{ b.times }} ×</span>
                    <input class="pf-input" inputmode="numeric" autocomplete="off" [attr.aria-label]="b.lhs + ' 除以 ' + b.times" [value]="drafts()[i]" (input)="setDraft(i, $any($event.target).value)" [disabled]="blanksDone()" />
                  </span>
                </div>
              }
              @if (!blanksDone()) {
                <button type="submit" class="pf-btn primary small">檢查</button>
              }
            </form>
            @if (blankMsg(); as m) {
              <p class="pf-feedback" [class.bad]="!blanksDone()" [class.good]="blanksDone()" role="status">{{ m }}</p>
            }
          </div>
        }

        @if (blanksDone()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              具體的數只能說明這一組。定理說的是<b>對每個整數 a、b、c</b> 都成立。在板上把它走到中段前：已知那頭和目標那頭，都換成定義說的話。用的全是上一章的卡。
            </p>
            <app-pf-board
              [start]="start"
              [frozen]="!!ends()"
              label="定理：整除會傳遞"
              idBase="pf-c7-ends"
              (changed)="onChange($event)"
            />
          </div>
        }

        @if (ends(); as e) {
          <div class="c6-block pf-rise">
            <div class="c7-ends" aria-label="橋的兩端">
              <div>
                <small>已知這頭 · 手上的等式</small>
                @for (q of e.eqs; track q) {
                  <p class="pf-num">{{ q }}</p>
                }
              </div>
              <span class="c7-gap" aria-hidden="true">？</span>
              <div>
                <small>目標這頭 · 等著填的 □</small>
                <p class="pf-num">{{ e.goal }}</p>
              </div>
            </div>
            <p class="pf-p">
              兩端都寫好了，中間還空著。要怎麼從左邊那兩條等式走到 {{ e.goal }}？剛才的具體數字裡 {{ e.k }} = 4、{{ e.l }} = 5、□ = 20。20 和 4、5 是什麼關係？<a routerLink="/learn/proofs/ch7/2">下一幕</a>來搭這座橋。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>中段之前，先把兩端都換成定義：<br />已知變成手上的等式，目標變成一個等著填的 □。</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneBothEndsComponent {
  private readonly progress = inject(LearnProgressService);

  readonly skeleton = CH6_SKELETON;
  readonly blanks = BLANKS;
  readonly start = DIV_TRANS;

  readonly reviewed = signal(!!this.progress.getStepData('proofs-ch7', '1', 'skeleton'));
  readonly drafts = signal(['', '', '']);
  readonly blanksDone = signal(false);
  readonly blankMsg = signal<string | null>(null);
  readonly ends = signal<{ eqs: string[]; goal: string; k: string; l: string } | null>(null);

  setDraft(i: number, v: string): void {
    this.drafts.update((d) => d.map((x, j) => (j === i ? v : x)));
  }

  checkBlanks(): void {
    for (let i = 0; i < BLANKS.length; i++) {
      const b = BLANKS[i];
      const r = readNumber(this.drafts()[i]);
      if (!r.ok) {
        this.blankMsg.set(`${b.lhs} = ${b.times} × □：${r.msg}`);
        return;
      }
      if (r.v.d !== 1 || r.v.n * Number(b.times) !== Number(b.lhs)) {
        this.blankMsg.set(`${b.times} × ${this.drafts()[i].trim()} 不是 ${b.lhs}。`);
        return;
      }
    }
    this.blanksDone.set(true);
    this.blankMsg.set('對：12 = 3 × 4、60 = 12 × 5、60 = 3 × 20。兩個商是 4 和 5，第三個是 20。');
  }

  onChange(st: BoardState): void {
    const left = givensFor(st, 'split').length + givensFor(st, 'unfold').length + givensFor(st, 'obtain').length;
    if (st.goal?.t === 'exists' && left === 0) {
      const b = bridgeOf(st);
      const got = st.objs.filter((o) => o.kind === 'got').map((o) => o.name);
      this.ends.set({
        eqs: st.hyps.filter((h) => h.s.t === 'eq' && !h.used).map((h) => stmtText(h.s)),
        goal: b ? `${b.left} = ${b.back}` : '',
        k: got[0] ?? 'k',
        l: got[1] ?? 'l',
      });
      this.progress.markCompleted('proofs-ch7', '1');
    }
  }
}
