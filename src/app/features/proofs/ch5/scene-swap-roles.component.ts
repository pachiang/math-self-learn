import { Component, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { fmtQ, sub } from '../ch2/ch2-expr';
import { RuleSpec, cmp } from '../ch4/ch4-game';
import { RuleGameComponent, RuleSolved } from '../ch4/rule-game.component';
import { NegSpec, NegateMachineComponent } from './negate-machine.component';

const CLASS_SPEC: NegSpec = {
  quants: [
    { q: 'forall', v: 's', dom: 'Z', domText: '學生', all: '每個學生 s', some: '有一個學生 s' },
    { q: 'exists', v: 'c', dom: 'Z', domText: '課', all: '每一門課 c', some: '有一門課 c' },
  ],
  body: 's 的 c 不及格',
  options: [
    { text: 's 的 c 及格', ok: true, why: '對。不是不及格，就是及格。最後一行就是上一幕留下來的 (b)：有一個學生，每一門課都及格。' },
    { text: 's 的 c 不及格', ok: false, why: '「並非」走到這裡還沒用掉：s 的 c 不及格「不成立」，意思是 s 的 c 及格。' },
  ],
  check: 's 的 c 不及格',
  negCheck: 's 的 c 及格',
};

/** Sentence B from chapter 4, refuted there by the opponent's rule x = y. */
const B_SPEC: NegSpec = {
  quants: [
    { q: 'exists', v: 'y', dom: 'Z', all: '對每個整數 y', some: '存在整數 y' },
    { q: 'forall', v: 'x', dom: 'Z', all: '對每個整數 x', some: '存在整數 x' },
  ],
  body: 'y > x',
  check: 'y > x',
  negCheck: 'y > x 不成立',
};

/** Playing ¬B: the opponent names y, you answer x so that y > x fails. */
const NOT_B: RuleSpec = {
  given: 'y',
  answer: 'x',
  domain: 'Z',
  tests: [0, -8, 7, 1000, -1001],
  wins: (y, x) => cmp(y, x) <= 0,
  cond: (y, x) => `${fmtQ(y)} > ${fmtQ(x)} 不成立`,
  loseWhy: (y, x) => `${fmtQ(y)} > ${fmtQ(x)} 成立了，這一招沒打破它。`,
  key: (y, x) => sub(x, y),
  keyOk: (c) => c.n >= 0,
  reason: (c) =>
    c.n === 0
      ? 'x − y 永遠等於 0，x 就是 y，所以 y > x 永遠不成立。'
      : `x − y 永遠等於 ${fmtQ(c)}，x 永遠比 y 大，所以 y > x 永遠不成立。`,
};

@Component({
  selector: 'app-pf-swap-roles',
  standalone: true,
  imports: [NegateMachineComponent, RuleGameComponent],
  styleUrl: './scene-swap-roles.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">2 / 5 · 換人出招</p>
        <h1 class="pf-title">否定，就是換人出招</h1>
        <p class="pf-lede">
          上一幕靠一個一個班級試，才找出否定句。這一幕換一個不用列舉的做法：在句子最前面放一個「並非」，再把它一格一格往右推。每推一格都要你決定，跨過去的那一格會變成什麼。
        </p>

        <div class="pf-slip">
          <small>原句</small>
          <p>每個學生都有一門課不及格。</p>
        </div>
        <p class="pf-note">寫成完整版：對每個學生 s，存在一門課 c，使 s 的 c 不及格。虛線框是「對每個」（∀），實線框是「存在」（∃），朱色框是「並非」（¬）。</p>
        <app-pf-negate [spec]="classSpec" label="學生句" (finished)="classDone.set(true)" />

        @if (classDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              看那兩條出招順序條。原句裡，學生由對手挑（他想挑出一個沒有不及格的學生），課由你挑。否定句裡正好反過來：<b>你</b>挑學生，<b>對手</b>挑課。「並非」每跨過一個量詞，那一招就換人出。
            </p>
            <p class="pf-p">這不只對學生和課成立。來否定第 4 章的句子 B。</p>
          </div>
        }

        @if (classDone()) {
          <div class="pf-col tight pf-rise">
            <div class="pf-slip">
              <small>第 4 章的句子 B</small>
              <p>存在整數 y，使得對每個整數 x，都有 y &gt; x。</p>
              @if (rule()) {
                <span class="pf-seal refuted stamp">推翻</span>
              }
            </div>
            <app-pf-negate [spec]="bSpec" label="句子 B" (finished)="bDone.set(true)" />
          </div>
        }

        @if (bDone()) {
          <div class="pf-col tight pf-rise">
            <div class="pf-slip">
              <small>B 的否定句（¬B）</small>
              <p>對每個整數 y，都存在整數 x，使 y &gt; x 不成立。</p>
              @if (rule()) {
                <span class="pf-seal proved stamp">證明</span>
              }
            </div>
            <p class="pf-p">
              在 ¬B 的遊戲裡，對手先出 y，<b>你</b>看著 y 挑 x。這正是第 4 章第 2 幕對手坐的位置：那時你先出 y，他回你一個 x，讓 y &gt; x 不成立。現在換你來做這件事。
            </p>
            <p class="pf-q">寫一條規則：對手出 y，你出 x = ？</p>
            <app-pf-rule-game
              [spec]="notB"
              inputId="pf-rule-notb"
              hint="y − 4"
              exampleHint="讓 x 和 y 永遠差同一個數，而且 x 不比 y 小"
              (solvedRule)="onRule($event)"
            />
          </div>
        }

        @if (rule(); as r) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              你用規則 x = {{ r.src }} 證明了 ¬B，句子 B 也在同一刻被推翻。這不是兩件事：<b>推翻一句話，就是證明它的否定</b>。第 4 章對手打敗你用的規則 x = y，現在是你手上的證明。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>否定就是交換角色：<br />「並非」每跨過一個量詞，「對每個」和「存在」就互換。<br />原本的對手變成你；推翻原句，就是證明它的否定。</p>
            </div>
            <details class="pf-why">
              <summary>為什麼跨過「對每個」一定變成「存在」？</summary>
              <div>
                <p>「並非每個 s 都怎樣」是說，「每個 s 都怎樣」這件事失敗了。要讓它失敗，只要有一個 s 不怎樣就夠了，所以變成「存在 s，並非怎樣」。</p>
                <p>反過來，「並非存在 c 怎樣」是說連一個都找不到，也就是每個 c 都不怎樣，所以變成「對每個 c，並非怎樣」。</p>
                <p>寫成符號：¬∀x P(x) 等價於 ∃x ¬P(x)；¬∃x P(x) 等價於 ∀x ¬P(x)。不論 x 從多大的世界裡挑，這兩條都成立，所以上一幕 512 班的結果在任何大小的班級都對。</p>
              </div>
            </details>
            <p class="pf-note">最後一格還留著「y &gt; x 不成立」，讀起來很拗口。下一幕把它翻成正面的說法，你會看到 x = y 這招為什麼剛好夠用。</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneSwapRolesComponent {
  private readonly progress = inject(LearnProgressService);

  readonly classSpec = CLASS_SPEC;
  readonly bSpec = B_SPEC;
  readonly notB = NOT_B;

  readonly classDone = signal(false);
  readonly bDone = signal(false);
  readonly rule = signal<RuleSolved | null>(null);

  onRule(r: RuleSolved): void {
    this.rule.set(r);
    this.progress.markCompleted('proofs-ch5', '2');
  }
}

