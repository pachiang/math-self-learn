import { Component, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { readNumber } from '../ch2/ch2-expr';
import { BoardState, EVEN_SUM, EVEN_SUM_GIVENS, EVEN_SUM_OPENING } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';

/** Chapter 2's five-step card against this board's move log. */
const FIVE: { step: string; tag: '照定義' | '要想'; moves: string }[] = [
  { step: '1 · 寫下已知和目標', tag: '照定義', moves: '第 1–2 步：令任意、假設前提' },
  { step: '2 · 展開已知，取新名字', tag: '照定義', moves: '第 4–8 步：拆開、展開、取出 k 和 l' },
  { step: '3 · 展開目標，寫下要造什麼', tag: '照定義', moves: '第 3 步：展開目標' },
  { step: '4 · 接起來', tag: '要想', moves: '第 9 步：選 m = k + l' },
  { step: '5 · 檢查，寫結論', tag: '照定義', moves: '第 10 步：代入化簡' },
];

@Component({
  selector: 'app-pf-meet',
  standalone: true,
  imports: [ProofBoardComponent],
  styleUrl: './ch6.scss',
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">5 / 6 · 正推與倒推</p>
        <h1 class="pf-title">在中間碰頭</h1>
        <p class="pf-lede">
          目標要一個 m，已知給了 k 和 l。m 要怎麼用 k、l 寫？不必憑空猜。板子下面多了一座橋：從目標<b>往回</b>看它要什麼形狀，從已知<b>往前</b>推出你手上有什麼，兩邊對齊，答案就在中間。
        </p>
        <p class="pf-note">兩列都打開之後，再出「提出證人」那張卡。</p>

        <app-pf-board
          [start]="start"
          [prefix]="prefix"
          [bridge]="true"
          [tags]="guessed()"
          [frozen]="solved()"
          label="定理：偶數加偶數，找證人"
          idBase="pf-c6-meet"
          (solved)="onSolved($event)"
        />

        @if (solved() && !guessed()) {
          <form class="pf-col tight pf-rise" (submit)="$event.preventDefault(); guess()">
            <p class="pf-q">證完了。紀錄裡一共 10 步。你覺得其中有幾步，是真的需要想法的？</p>
            <div class="pf-row">
              <input class="pf-input" inputmode="numeric" autocomplete="off" aria-label="需要想法的步數" [value]="guessDraft()" (input)="guessDraft.set($any($event.target).value)" />
              <button type="submit" class="pf-btn primary small">揭曉</button>
            </div>
            @if (guessMsg(); as m) {
              <p class="pf-feedback bad" role="status">{{ m }}</p>
            }
          </form>
        }

        @if (guessed()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-feedback" [class.good]="guessN() === 1" [class.you]="guessN() !== 1" role="status">
              {{ guessN() === 1 ? '對，只有一步。' : '你猜 ' + guessN() + ' 步；紀錄上只有一步標「需要想法」。' }}
              十步裡，九步都是看形狀照做的；只有「選 m = k + l」要想，而且連它都有方向：往回和往前兩列一對齊，□ 只剩一個選擇。
            </p>
            <p class="pf-p">第 2 章結尾那張五步卡，就是這份紀錄的縮寫：</p>
            <table class="pf-table c6-five">
              <caption class="pf-sr-only">第 2 章五步卡與本章步法紀錄的對應</caption>
              <tr><th>第 2 章的五步</th><th>那時的標籤</th><th>板子上的哪幾步</th></tr>
              @for (f of five; track f.step) {
                <tr [class.idea]="f.tag === '要想'">
                  <td>{{ f.step }}</td>
                  <td>{{ f.tag === '要想' ? '★ 要想' : '照定義' }}</td>
                  <td>{{ f.moves }}</td>
                </tr>
              }
            </table>
            <p class="pf-note">「照定義」就是這裡的「形狀決定」，「要想」就是「需要想法」。這一章只是把那五步拆得更細，並且讓每一步都有一張卡。</p>
            <details class="pf-why">
              <summary>為什麼不能寫 m = (a + b) / 2？</summary>
              <div>
                <p>(a + b) / 2 乘以 2 確實等於 a + b，可是它是不是整數？「a + b 除以 2 是整數」正好就是「a + b 是偶數」，也就是這一題要證的事。拿它當證人，等於用結論證明結論。</p>
                <p>所以板子只收 +、−、× 寫成的證人：整數加減乘還是整數，這一點一眼就看得出來，不必再證。</p>
              </div>
            </details>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>從已知往前推，從目標往回推；<br />兩邊碰頭的地方，就是唯一需要想的那一步。</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneMeetComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = EVEN_SUM;
  readonly prefix = [...EVEN_SUM_OPENING, ...EVEN_SUM_GIVENS];
  readonly five = FIVE;

  readonly solved = signal(false);
  readonly guessed = signal(false);
  readonly guessDraft = signal('');
  readonly guessN = signal(0);
  readonly guessMsg = signal<string | null>(null);

  onSolved(_: BoardState): void {
    this.solved.set(true);
  }

  guess(): void {
    const r = readNumber(this.guessDraft());
    if (!r.ok || r.v.d !== 1 || r.v.n < 0 || r.v.n > 10) {
      this.guessMsg.set('填一個 0 到 10 的整數。');
      return;
    }
    this.guessN.set(r.v.n);
    this.guessed.set(true);
    this.progress.markCompleted('proofs-ch6', '5');
  }
}
