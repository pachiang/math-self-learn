import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { CELLS, Cell, CellView, Grid4Component } from './grid4.component';

type Tone = 'good' | 'bad' | 'you';

/** Sample numbers: 6 is the one that lands where the converse breaks. */
const TOK: Record<Cell, string[]> = { TT: ['8'], TF: [], FT: ['6'], FF: ['3'] };

interface Rewrite {
  id: 'A' | 'B';
  text: string;
  ifPart: string;
  thenPart: string;
  breach: Cell;
  name: string;
  en: string;
}

const REWRITES: Rewrite[] = [
  { id: 'A', text: '若 n 是偶數，則 n 是 4 的倍數。', ifPart: 'n 是偶數', thenPart: 'n 是 4 的倍數', breach: 'FT', name: '逆命題', en: 'converse' },
  { id: 'B', text: '若 n 不是偶數，則 n 不是 4 的倍數。', ifPart: 'n 不是偶數', thenPart: 'n 不是 4 的倍數', breach: 'TF', name: '逆否命題', en: 'contrapositive' },
];

/** Does the rewrite's "if" part hold in cell c, and its "then" part? (P: 4 的倍數, Q: 偶數) */
const PARTS: Record<'A' | 'B', (c: Cell) => [boolean, boolean]> = {
  A: (c) => [c[1] === 'T', c[0] === 'T'],
  B: (c) => [c[1] === 'F', c[0] === 'F'],
};

@Component({
  selector: 'app-pf-converse',
  standalone: true,
  imports: [Grid4Component],
  styleUrl: './scene-converse.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">5 / 6 · 換句話說</p>
        <h1 class="pf-title">反過來說，還是同一句嗎？</h1>

        <div class="pf-slip">
          <small>原句（第 2 幕已經證明它成立）</small>
          <p>若 n 是 4 的倍數，則 n 是偶數。</p>
          <span class="pf-seal proved">證明</span>
        </div>

        <div class="rewrites">
          @for (r of rewrites; track r.id) {
            <div class="rw">
              <span class="tag">{{ r.id }}</span>
              <p>{{ r.text }}</p>
              @if (named()) {
                <small>{{ r.name }}（{{ r.en }}）</small>
              }
            </div>
          }
        </div>

        <!-- 1 · predict -->
        <div class="pf-col tight">
          <p class="pf-q">A、B 哪一句和原句意思一樣？</p>
          <div class="pf-row">
            @for (o of opts; track o.id) {
              <button type="button" class="pf-btn" [class.picked]="guess() === o.id" [disabled]="guess() !== null" (click)="guess.set(o.id)">{{ o.label }}</button>
            }
          </div>
          @if (guess() !== null) {
            <p class="pf-feedback you" role="status">先記住你的答案。接下來不靠感覺，改用四格圖替每一句找出它的違約格。</p>
          }
        </div>

        <!-- 2 · find each breach cell -->
        @if (guess() !== null) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              四格圖和第 2 幕一樣：上排是「n 是 4 的倍數」，左欄是「n 是偶數」。原句的違約格是「4 的倍數，卻不是偶數」那一格，裡面一個數都沒有。
              每一句找違約格的方法都一樣：找<b>「若」後面成立、「則」後面卻不成立</b>的那一格。
            </p>
            @if (cur(); as r) {
              <p class="pf-q">{{ r.id }}：{{ r.text }}<br />它在哪一格違約？</p>
              <p class="pf-note">這句的「若」後面是「{{ r.ifPart }}」，「則」後面是「{{ r.thenPart }}」。在四格圖上點出它違約的那一格。</p>
            }
            <app-pf-grid4 p="n 是 4 的倍數" q="n 是偶數" [view]="view()" [pickable]="!!cur()" (pick)="pick($event)" />
            @if (msg(); as m) {
              <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.bad]="m.tone === 'bad'" role="status">{{ m.text }}</p>
            }
          </div>
        }

        <!-- 3 · verdict and evidence -->
        @if (named()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              A 的違約格裡有 6：6 是偶數，卻不是 4 的倍數，所以 A 不成立。B 的違約格和原句是<b>同一格</b>，而那一格是空的，所以 B 成立。
              {{ guessNote() }}
            </p>
            <div class="verdicts">
              <div class="vcard">
                <span class="pf-seal refuted mini">推翻</span>
                <div>
                  <b>A 是另一句話</b>
                  <p>違約格搬到了別的格子。要推翻它，一個反例就夠：n = 6。</p>
                </div>
              </div>
              <div class="vcard">
                <span class="pf-seal proved mini">證明</span>
                <div>
                  <b>B 和原句是同一句話</b>
                  <p>
                    不只這一題如此。換成任何 P、Q，「若非 Q 則非 P」要違約，得「非 Q」成立、「非 P」不成立，也就是 Q 不成立、P 成立。那正是原句的違約格。
                  </p>
                </div>
              </div>
            </div>
            <div class="exhaust">
              <small>這次的「所有」是證明，不是例子</small>
              <p>
                第 1 章說過，例子證明不了「對所有 n 都成立」，因為 n 有無限多個，永遠試不完。這裡要檢查的卻是 P、Q 真假的所有組合，總共只有四種，四格我們全看過了。
                像這樣把有限的情況一個不漏地檢查完，叫做完整列舉（finite exhaustion），它就是證明。
              </p>
            </div>
            <p class="pf-p">
              像 A 這樣把「若」和「則」後面的話對調，叫做<b>逆命題</b>（converse）；像 B 這樣對調之後，兩邊再各加一個「不」，叫做<b>逆否命題</b>（contrapositive）。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>換個說法時，看違約格有沒有搬家：<br />逆否命題沒搬，是同一句話；<br />逆命題搬了，是另一句話。</p>
            </div>
            <details class="pf-why">
              <summary>高中學的「否命題」呢？</summary>
              <div>
                <p>否命題（inverse）是兩邊各加一個「不」，但不對調：「若 n 不是 4 的倍數，則 n 不是偶數」。</p>
                <p>它要違約，得「不是 4 的倍數」成立、「不是偶數」不成立，也就是：不是 4 的倍數，卻是偶數。這和逆命題的違約格是同一格，所以否命題和逆命題其實是同一句話，跟原句不同。6 一樣能推翻它。</p>
              </div>
            </details>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneConverseComponent {
  private readonly progress = inject(LearnProgressService);

  readonly rewrites = REWRITES;
  readonly opts = [
    { id: 'A', label: '只有 A' },
    { id: 'B', label: '只有 B' },
    { id: 'both', label: 'A、B 都是' },
    { id: 'none', label: '都不是' },
  ];

  readonly guess = signal<string | null>(null);
  readonly found = signal<Record<string, boolean>>({});
  readonly msg = signal<{ tone: Tone; text: string } | null>(null);

  readonly cur = computed(() => REWRITES.find((r) => !this.found()[r.id]) ?? null);
  readonly named = computed(() => REWRITES.every((r) => this.found()[r.id]));

  readonly view = computed(() => {
    const f = this.found();
    const v: Partial<Record<Cell, CellView>> = {};
    for (const c of CELLS) {
      const labels: string[] = [];
      if (c === 'TF') labels.push('原句');
      for (const r of REWRITES) if (f[r.id] && r.breach === c) labels.push(r.id);
      const isBreach = labels.length > 0;
      v[c] = {
        tokens: TOK[c],
        mark: isBreach ? 'breach' : 'none',
        note: isBreach ? `${labels.join('、')} 的違約格` : undefined,
      };
    }
    return v;
  });

  readonly guessNote = computed(() => {
    const g = this.guess();
    if (g === 'B') return '你一開始就選了「只有 B」，選對了。';
    if (g === 'both') return '你一開始選「A、B 都是」。A 聽起來很像原句，違約格卻不一樣。';
    if (g === 'A') return '你一開始選了 A。A 只是把前後對調，聽起來最像，違約格卻不一樣。';
    return '你一開始選「都不是」。B 雖然多了兩個「不」，違約格卻跟原句一模一樣。';
  });

  pick(c: Cell): void {
    const r = this.cur();
    if (!r) return;
    if (c === r.breach) {
      this.found.update((f) => ({ ...f, [r.id]: true }));
      this.msg.set({
        tone: 'good',
        text:
          r.id === 'A'
            ? '對。是偶數，卻不是 4 的倍數，A 就在這一格違約。這不是原句的違約格。'
            : '對。不是偶數，卻是 4 的倍數，B 就在這一格違約，跟原句是同一格。',
      });
      if (this.named()) this.progress.markCompleted('proofs-ch3', '5');
      return;
    }
    const [ifOk, thenOk] = PARTS[r.id](c);
    const why = !ifOk
      ? `這裡「${r.ifPart}」不成立，承諾沒被觸發。`
      : thenOk
        ? `這裡「${r.ifPart}」和「${r.thenPart}」都成立，承諾守住了。`
        : '';
    this.msg.set({ tone: 'bad', text: `不是這一格。${why}要找的是「若」後面成立、「則」後面卻不成立的那一格。` });
  }
}
