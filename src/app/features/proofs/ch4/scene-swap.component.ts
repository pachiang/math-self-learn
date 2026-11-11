import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { Q, add, fmtQ, isInt, paren, readNumber } from '../ch2/ch2-expr';
import { MovesComponent, Move } from './moves.component';
import { RuleGameComponent, RuleSolved } from './rule-game.component';
import { RuleSpec } from './ch4-game';

/** x + y written with the second term parenthesised when negative. */
const sumText = (x: Q, y: Q) => `${fmtQ(x)} + ${paren(y)}`;

/** You move second: answer every x with a y such that x + y = 0. */
const SPEC_D: RuleSpec = {
  given: 'x',
  answer: 'y',
  domain: 'Z',
  tests: [0, -8, 7, 1000, -1001],
  wins: (x, y) => add(x, y).n === 0,
  cond: (x, y) => `${sumText(x, y)} = 0`,
  key: (x, y) => add(x, y),
  keyOk: (c) => c.n === 0,
  reason: () => 'x + y 永遠等於 0，不管 x 是多少都成立。',
};

/**
 * You are the opponent: the system names y first, you answer with x so that x + y ≠ 0.
 * The system tries y = 0 and y = −1 early, which break x = y and x = 1.
 */
const SPEC_E: RuleSpec = {
  given: 'y',
  answer: 'x',
  domain: 'Z',
  tests: [0, -1, 4, 1000, -1001],
  wins: (y, x) => add(x, y).n !== 0,
  cond: (y, x) => `${sumText(x, y)} ≠ 0`,
  loseWhy: (y, x) => `${sumText(x, y)} 剛好等於 0，句子成立了。`,
  key: (y, x) => add(x, y),
  keyOk: (c) => c.n !== 0,
  reason: (c) => `x + y 永遠等於 ${fmtQ(c)}，不是 0，所以系統出什麼 y 都一樣輸。`,
};

/** The system's opening move in sentence E. */
const FIRST_Y = 4;

@Component({
  selector: 'app-pf-swap',
  standalone: true,
  imports: [MovesComponent, RuleGameComponent, RouterLink],
  styleUrl: './scene-swap.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">5 / 5 · 換你當對手</p>
        <h1 class="pf-title">換你來找碴</h1>
        <p class="pf-lede">上一幕的第三句「每個整數都有相反數」，寫成完整版就是句子 D。先照老規矩，你當出「存在」的那一方。</p>

        <!-- D: you move second -->
        <div class="pf-slip">
          <small>句子 D</small>
          <p>對每個整數 x，都存在整數 y，使 x + y = 0。</p>
          @if (dRule()) {
            <span class="pf-seal proved stamp">證明</span>
          }
        </div>
        <app-pf-moves [moves]="movesD" check="x + y = 0" [symbols]="true" label="句子 D 的出招順序" />
        <p class="pf-q">寫一條規則：對手出 x，你出 y = ？</p>
        <app-pf-rule-game [spec]="specD" inputId="pf-rule-d" exampleHint="讓 x + y 永遠等於同一個數" (solvedRule)="dRule.set($event)" />

        <!-- E: you are the opponent -->
        @if (dRule()) {
          <div class="pf-col tight pf-rise">
            <div class="pf-slip">
              <small>句子 E</small>
              <p>存在整數 y，使得對每個整數 x，都有 x + y = 0。</p>
              @if (eRule()) {
                <span class="pf-seal refuted stamp">推翻</span>
              }
            </div>
            <p class="pf-p">
              句子 E 把順序反過來了。這次<b>換你當對手</b>：系統先出 y，想讓句子成立；你看過 y 之後挑 x，只要讓 x + y ≠ 0，你就贏了。
            </p>
            <app-pf-moves [moves]="movesE()" check="x + y = 0" [symbols]="true" [result]="firstX() !== null ? 'lose' : null" label="句子 E 的出招順序" />

            <p class="pf-q">系統出 y = {{ firstY }}。你出哪個 x，讓 x + y ≠ 0？</p>
            @if (firstX() === null) {
              <form class="pf-row" (submit)="$event.preventDefault(); playFirst()">
                <label class="y-eq" for="pf-x-first">x =</label>
                <input class="pf-input" id="pf-x-first" inputmode="numeric" autocomplete="off" [value]="draft()" (input)="draft.set($any($event.target).value)" />
                <button type="submit" class="pf-btn primary small">出這一招</button>
              </form>
            } @else {
              <p class="pf-feedback good">x = {{ firstX() }}，{{ firstX() }} + {{ firstY }} ≠ 0。這一回合你贏了，但這只是一個例子。</p>
            }
            @if (firstMsg(); as m) {
              <p class="pf-feedback bad" role="status">{{ m }}</p>
            }
          </div>
        }

        @if (firstX() !== null) {
          <div class="pf-col tight pf-rise">
            <p class="pf-q">別只贏這一回：寫一條規則，看到 y 就出 x = ？</p>
            <app-pf-rule-game
              [spec]="specE"
              inputId="pf-rule-e"
              otherName="系統"
              hint="3y + 2"
              exampleHint="讓 x + y 永遠等於同一個不是 0 的數"
              (solvedRule)="onE($event)"
            />
          </div>
        }

        @if (eRule(); as e) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              你當對手時，有一條對每個 y 都贏的規則 x = {{ e.src }}，所以句子 E 不成立。D 成立，是因為你後出，看著 x 選 y；E 不成立，是因為這次後出的是對手（也就是你），看著 y 選 x。不管站在哪一邊，<b>後出的人都佔了「看得到」的便宜</b>。
            </p>
            <div class="pf-takeaway reveal">
              <small>本章帶走這一句</small>
              <p>讀量詞句，就是排出招順序：<br />「對每個」由對手出，「存在」由你出。<br />後出的人可以看著前面的招決定；<br />順序一換，遊戲就換了。</p>
            </div>
            <details class="pf-why">
              <summary>生活裡也有一樣的句子嗎？</summary>
              <div>
                <p>「每把鎖都有一把鑰匙打得開」：對每把鎖，存在一把鑰匙。鑰匙可以看著鎖挑，每把鎖配不同的鑰匙也沒關係。</p>
                <p>「有一把鑰匙打得開每把鎖」：存在一把鑰匙，對每把鎖都打得開。這是萬能鑰匙，要求強得多。字幾乎一樣，順序一換，意思就差很多。</p>
              </div>
            </details>
            <p class="pf-note">
              下一章：這一幕你當了對手，而且贏了。要說明一句話不成立，就是替對手找到必勝的規則；把一句話否定，其實就是讓你和對手交換位置。<a routerLink="/learn/proofs">第 5 章「否定就是交換角色」</a>還在規畫中。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneSwapComponent {
  private readonly progress = inject(LearnProgressService);

  readonly specD = SPEC_D;
  readonly specE = SPEC_E;
  readonly firstY = FIRST_Y;
  readonly movesD: Move[] = [
    { q: 'forall', v: 'x', dom: 'Z', who: '對手出' },
    { q: 'exists', v: 'y', dom: 'Z', who: '你出' },
  ];

  readonly dRule = signal<RuleSolved | null>(null);
  readonly eRule = signal<RuleSolved | null>(null);
  readonly draft = signal('');
  readonly firstX = signal<string | null>(null);
  readonly firstMsg = signal<string | null>(null);

  readonly movesE = computed<Move[]>(() => [
    { q: 'exists', v: 'y', dom: 'Z', who: '系統出', value: String(FIRST_Y) },
    { q: 'forall', v: 'x', dom: 'Z', who: '你出（當對手）', value: this.firstX() ?? undefined },
  ]);

  playFirst(): void {
    const r = readNumber(this.draft());
    if (!r.ok) {
      this.firstMsg.set(r.msg);
      return;
    }
    if (!isInt(r.v)) {
      this.firstMsg.set(`${fmtQ(r.v)} 不是整數，句子要的 x 是整數。`);
      return;
    }
    if (r.v.n + FIRST_Y === 0) {
      this.firstMsg.set(`${fmtQ(r.v)} + ${FIRST_Y} = 0，條件成立，這一回合系統贏了。換一個 x。`);
      return;
    }
    this.firstMsg.set(null);
    this.firstX.set(fmtQ(r.v));
  }

  onE(s: RuleSolved): void {
    this.eRule.set(s);
    this.progress.markCompleted('proofs-ch4', '5');
  }
}
