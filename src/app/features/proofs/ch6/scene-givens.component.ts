import { Component, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { BoardState, CardId, EVEN_SUM, EVEN_SUM_OPENING, givensFor } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';

const DECK: CardId[] = ['intro', 'assume', 'unfoldGoal', 'split', 'unfold', 'obtain'];

@Component({
  selector: 'app-pf-givens',
  standalone: true,
  imports: [ProofBoardComponent],
  styleUrl: './ch6.scss',
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">3 / 6 · 已知的形狀</p>
        <h1 class="pf-title">已知也有形狀</h1>
        <p class="pf-lede">
          上一幕停在「找一個 m」。m 得用已知裡的東西來寫，可是 H1 還整句包著。這一幕多了三張<b>對已知用</b>的卡。已知和目標一樣，形狀決定你能拿它做什麼。
        </p>
        <p class="pf-note">
          紀錄裡淡色的前三步是上一幕做的。目標的卡還在，但這一幕要處理的是左邊。
        </p>

        <app-pf-board
          [start]="start"
          [prefix]="opening"
          [deck]="deck"
          [frozen]="done()"
          label="定理：偶數加偶數，處理已知"
          idBase="pf-c6-givens"
          (changed)="onChange($event)"
          (refused)="onRefused($event.code)"
        />

        @if (clashed() && !done()) {
          <p class="pf-feedback you pf-rise" role="note">
            定義裡寫的是「存在整數 k」，兩條已知展開後都寫 k，這沒有問題：那只是定義用的代稱。可是一旦<b>取出來</b>放上板，它就是一個特定的數，兩個不同的數就要兩個名字。
          </p>
        }

        @if (done()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              看板子左邊：a、b 是虛線框，對手給的；k、l 是加粗的框，各自記著從哪一條已知拿到。用過的已知變淡，但沒有消失，旁邊寫著它變成了什麼。
            </p>
            <p class="pf-p">
              右邊的目標一個字都沒變，可是你手上多了 <span class="pf-num">a = 2k</span> 和 <span class="pf-num">b = 2l</span>。
              {{ clashed() ? '你也碰到了一次撞名：' : '如果第二次也叫 k 會怎樣？' }}下一幕專門看這件事。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>已知也有形狀：<br />「而且」拆成兩條，定義詞展開成「存在」，<br />「存在」讓你拿出一個整數，並替它取一個新名字。</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneGivensComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = EVEN_SUM;
  readonly opening = EVEN_SUM_OPENING;
  readonly deck = DECK;

  readonly done = signal(false);
  readonly clashed = signal(false);

  onChange(st: BoardState): void {
    const left = givensFor(st, 'split').length + givensFor(st, 'unfold').length + givensFor(st, 'obtain').length;
    if (left === 0 && st.objs.filter((o) => o.kind === 'got').length === 2) {
      this.done.set(true);
      this.progress.markCompleted('proofs-ch6', '3');
    }
  }

  onRefused(code: string): void {
    if (code === 'clash') this.clashed.set(true);
  }
}
