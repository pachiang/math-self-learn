import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { BoardState, ODD_SQUARE } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';

@Component({
  selector: 'app-pf-transfer',
  standalone: true,
  imports: [ProofBoardComponent, RouterLink],
  styleUrl: './ch6.scss',
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">6 / 6 · 遷移</p>
        <h1 class="pf-title">換一個定義，<br />自己走一遍</h1>
        <p class="pf-lede">
          新的定理，空的板子，八張卡全開。這次沒有人替你走前面幾步。奇數的定義多了一個「+ 1」，其餘的做法照舊。
        </p>
        <div class="pf-def">
          <small>奇數的定義（本課的約定，在整數 ℤ 裡）</small>
          <p>n 是奇數 ⇔ 有一個整數 <span class="pf-k">k</span>，使 n = 2<span class="pf-k">k</span> + 1</p>
        </div>

        <app-pf-board
          [start]="start"
          [bridge]="true"
          [frozen]="!!result()"
          label="定理：奇數的平方是奇數"
          idBase="pf-c6-odd"
          (solved)="onSolved($event)"
          (refused)="onRefused($event.code)"
        />

        @if (wrongWitness() > 0 && !result()) {
          <p class="pf-feedback you pf-rise" role="note">
            提示：橋上往前那一列，已經把 (2k + 1)² 乘開成 4k² + 4k + 1 了。要把它寫成 2 × □ + 1，先把 4k² + 4k 提出一個 2。
          </p>
        }

        @if (result(); as r) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              你自己走完了：紀錄上 {{ r.total }} 步，只有 {{ r.ideas }} 步標「需要想法」{{ r.misses ? '。中間有 ' + r.misses + ' 次被板子擋下來，每一次都是形狀或名字的問題，不是點子的問題' : '' }}。
            </p>
            <p class="pf-p">
              和偶數那一題比，表面換了很多：定義多了 + 1，運算從加法變成平方，證人從 k + l 變成 2k² + 2k。可是證明的開頭（令任意、假設前提、展開）和結尾（代入化簡）一模一樣，因為<b>目標的形狀</b>一樣。
            </p>
            <div class="pf-takeaway reveal">
              <small>全章帶走這一句</small>
              <p>還沒想到點子之前，目標的形狀已經替你寫好證明的開頭和結尾；<br />你真正要想的，只有中間那一步。</p>
            </div>

            <div class="c6-skeleton">
              <small>骨架卡 · 第 7 章開頭會請你重建</small>
              <p class="c6-sk-title">偶數加偶數是偶數</p>
              <ol>
                <li>令 a、b 為任意整數，假設它們是偶數</li>
                <li>拿到 k、l：a = 2k，b = 2l</li>
                <li>選 m = k + l，代入化簡</li>
              </ol>
            </div>

            <details class="pf-why">
              <summary>板子替你假設了哪些事？</summary>
              <div>
                <p>「整數加、減、乘的結果還是整數」：所以 k + l、2k² + 2k 一定是整數。這是整數的基本性質（ℤ 對加法與乘法封閉），本課直接使用。</p>
                <p>「代入化簡」是把兩邊展開成多項式再比較。第 7 章會請你自己搭這座代數橋，不再由板子替你展開。</p>
              </div>
            </details>
            <p class="pf-note">
              下一章：中段不一定只有一行代數。第 7 章把已知與目標都展開成定義，再搭一座橋，證人會依賴好幾個拿到的字母。<a routerLink="/learn/proofs/ch7/1">前往第 7 章「中段：從定義走到定義」</a>
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneTransferComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = ODD_SQUARE;
  readonly misses = signal(0);
  readonly wrongWitness = signal(0);
  readonly final = signal<BoardState | null>(null);

  readonly result = computed(() => {
    const st = this.final();
    if (!st) return null;
    return { total: st.log.length, ideas: st.log.filter((e) => e.tag === 'idea').length, misses: this.misses() };
  });

  onSolved(st: BoardState): void {
    this.final.set(st);
    this.progress.markCompleted('proofs-ch6', '6');
  }

  onRefused(code: string): void {
    if (code === 'neq') this.wrongWitness.update((n) => n + 1);
    else this.misses.update((n) => n + 1);
  }
}
