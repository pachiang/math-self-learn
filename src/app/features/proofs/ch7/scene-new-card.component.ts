import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { readNumber } from '../ch2/ch2-expr';
import { BoardState, CH7_CARDS, DIV_CHAIN, DIV_CHAIN_BY_HAND, replay } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';
import { CH7_SKELETON } from '../board/skeletons';

const BY_HAND = replay(DIV_CHAIN, DIV_CHAIN_BY_HAND);

@Component({
  selector: 'app-pf-new-card',
  standalone: true,
  imports: [ProofBoardComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', './ch7.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">5 / 5 · 新卡</p>
        <h1 class="pf-title">證完的定理，<br />變成一張卡</h1>
        <p class="pf-lede">這次的句子有三段整除：</p>
        <div class="c7-claim">
          <small>要證的句子</small>
          <p>對每個整數 a、b、c、d，若 a ∣ b、b ∣ c 而且 c ∣ d，則 a ∣ d。</p>
        </div>
        <p class="pf-p">
          照第 2 幕的做法，三條已知各展開一次、各拿一個字母，再選證人。先猜：板上最後一共會有幾個字母（對手給的、拿到的、你選的都算）？
        </p>
        <form class="c7-blanks" (submit)="$event.preventDefault(); checkGuess()">
          <label class="c7-blank">
            <small>字母個數</small>
            <input class="pf-input" inputmode="numeric" autocomplete="off" [value]="guessDraft()" (input)="guessDraft.set($any($event.target).value)" [disabled]="guessed() !== null" />
          </label>
          @if (guessed() === null) {
            <button type="submit" class="pf-btn primary small">猜這個數</button>
          }
        </form>
        @if (guessMsg(); as m) {
          <p class="pf-feedback" [class.you]="guessed() !== null" [class.bad]="guessed() === null" role="status">{{ m }}</p>
        }

        @if (guessed() !== null) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              題目愈長，字母愈多。可是第 2 幕已經證過一件事，而且是對<b>每個</b>整數都成立。證過的定理可以直接拿來用，不必每次重走一遍：
            </p>
            <div class="pf-def c7-lemma">
              <small>新卡 · 引用定理（第 2 幕證過）</small>
              <p>整除會傳遞：已知 x ∣ y 而且 y ∣ z，就得到 x ∣ z。</p>
            </div>
            <p class="pf-p">
              用的時候，板上任何兩條「x ∣ y」「y ∣ z」都能接起來，x、y、z 可以是 a、b、c，也可以是 a、c、d。目標如果和某條已知一模一樣，就打「對上已知」收尾。
            </p>
            @for (r of [round()]; track r) {
              <app-pf-board
                [start]="start"
                [deck]="deck"
                deckNote="第 7 章加了兩張卡：對上已知、引用定理。"
                [frozen]="!!result()"
                label="定理：三段整除也會傳遞"
                idBase="pf-c7-card"
                (solved)="onSolved($event)"
              />
            }
          </div>
        }

        @if (byHandAgain()) {
          <div class="pf-feedback you pf-rise" role="status">
            證出來了，不過這一次是一個字母一個字母拿出來的，和猜的那個版本一樣長。再走一次，這回讓「引用定理」替你接起來。
            <button type="button" class="pf-btn small" (click)="retry()">清空板子再走一次</button>
          </div>
        }

        @if (result(); as r) {
          <div class="c6-block pf-rise">
            <table class="pf-table c7-compare">
              <caption class="pf-sr-only">一個一個拿字母和引用定理的比較</caption>
              <tr><th></th><th>一個一個拿字母</th><th>引用定理（你的）</th></tr>
              <tr><td>板上字母</td><td class="pf-num">{{ byHand.letters }}</td><td class="pf-num"><b>{{ r.letters }}</b></td></tr>
              <tr><td>步數</td><td class="pf-num">{{ byHand.steps }}</td><td class="pf-num"><b>{{ r.steps }}</b></td></tr>
              <tr><td>需要想法的步</td><td>選證人 m = klj</td><td>決定先接哪兩條</td></tr>
            </table>
            <p class="pf-p">
              引用定理的那幾步，一個新字母都沒有拿：第 2 幕裡 k、l、m = kl 那一整段，已經包在這張卡裡了。
            </p>
            <div class="pf-takeaway reveal">
              <small>全章帶走這一句</small>
              <p>中段是一座橋：兩端換成定義，一次代入一條已知，證人就在碰頭的地方。<br />證完的橋，下次就是一張卡。</p>
            </div>

            <div class="c6-skeleton">
              <small>骨架卡 · 第 8 章開頭會請你重建</small>
              <p class="c6-sk-title">{{ skeleton.title }}</p>
              <ol>
                @for (b of skeleton.beats; track b) {
                  <li>{{ b }}</li>
                }
              </ol>
            </div>
            <p class="pf-note">
              下一章：目標不一定能直接展開。第 8 章「逆否與反證」把否定的目標換成可以用的已知。<a routerLink="/learn/proofs">第 8 章</a>還在規畫中。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneNewCardComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = DIV_CHAIN;
  readonly deck = CH7_CARDS;
  readonly skeleton = CH7_SKELETON;
  readonly byHand = { letters: BY_HAND.objs.length, steps: BY_HAND.log.length };

  readonly guessDraft = signal('');
  readonly guessed = signal<number | null>(null);
  readonly guessMsg = signal<string | null>(null);
  readonly round = signal(0);
  readonly byHandAgain = signal(false);
  readonly final = signal<BoardState | null>(null);

  readonly result = computed(() => {
    const st = this.final();
    return st ? { letters: st.objs.length, steps: st.log.length } : null;
  });

  checkGuess(): void {
    const r = readNumber(this.guessDraft());
    if (!r.ok) return this.guessMsg.set(r.msg);
    if (r.v.d !== 1 || r.v.n < 1) return this.guessMsg.set('填一個正整數。');
    const n = r.v.n;
    const want = this.byHand.letters;
    this.guessed.set(n);
    this.guessMsg.set(
      `${n === want ? '對' : `你猜 ${n}`}：一個一個拿要 ${want} 個字母。對手給 a、b、c、d 四個，三條已知各拿一個，再加上你選的 m。這樣走完要 ${this.byHand.steps} 步。`,
    );
  }

  onSolved(st: BoardState): void {
    if (!st.log.some((e) => e.card === 'lemma')) {
      this.byHandAgain.set(true);
      return;
    }
    this.byHandAgain.set(false);
    this.final.set(st);
    this.progress.markCompleted('proofs-ch7', '5');
  }

  retry(): void {
    this.byHandAgain.set(false);
    this.round.update((n) => n + 1);
  }
}
