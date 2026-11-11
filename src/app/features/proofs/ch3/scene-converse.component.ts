import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { CELLS, Cell, CellView, Grid4Component, cellDesc } from './grid4.component';

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
          <small>原句（第 2 幕證過，它成立）</small>
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
            <p class="pf-feedback you" role="status">先記住你的答案。我們不靠感覺，用四格圖找每一句的違約格。</p>
          }
        </div>

        <!-- 2 · find each breach cell -->
        @if (guess() !== null) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              四格圖和第 2 幕一樣：P 是「n 是 4 的倍數」，Q 是「n 是偶數」。原句的違約格在 P 成立、Q 不成立那一格，裡面沒有數。
              每一句的違約格都是：<b>「若」後面成立，「則」後面不成立</b>。
            </p>
            @if (cur(); as r) {
              <p class="pf-q">{{ r.id }}：{{ r.text }}<br />它在哪一格違約？</p>
              <p class="pf-note">「若」後面是「{{ r.ifPart }}」，「則」後面是「{{ r.thenPart }}」。點四格圖裡的一格。</p>
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
              A 的違約格裡有 6：6 是偶數，卻不是 4 的倍數。所以 A 不成立。B 的違約格和原句是<b>同一格</b>，而且是空的，所以 B 成立。
              {{ guessNote() }}
            </p>
            <div class="verdicts">
              <div class="vcard">
                <span class="pf-seal refuted mini">推翻</span>
                <div>
                  <b>A 是另一句話</b>
                  <p>違約格搬到另一格。這次要推翻它，只需要一個反例：n = 6。</p>
                </div>
              </div>
              <div class="vcard">
                <span class="pf-seal proved mini">證明</span>
                <div>
                  <b>B 和原句是同一句話</b>
                  <p>
                    不只這一題：對任何 P、Q，「若非 Q 則非 P」的「若」成立就是 Q 不成立、「則」不成立就是 P 成立，違約格永遠是 P 成立、Q 不成立那一格。
                  </p>
                </div>
              </div>
            </div>
            <div class="exhaust">
              <small>這次的「所有」是證明，不是例子</small>
              <p>
                第 1 章說，例子證明不了「對所有 n」，因為 n 有無限多個。這裡的「所有」是 P、Q 真假的所有組合，只有四種，四格都看過了。
                完整列舉（finite exhaustion）有限的世界，就是證明。
              </p>
            </div>
            <p class="pf-p">
              A 這種把「若」和「則」對調的句子叫<b>逆命題</b>（converse）；B 這種對調再兩邊都加「不」的句子叫<b>逆否命題</b>（contrapositive）。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>換句話說時，看違約格有沒有搬家：<br />逆否沒搬，是同一句話；<br />逆命題搬了，是另一句話。</p>
            </div>
            <details class="pf-why">
              <summary>高中學的「否命題」呢？</summary>
              <div>
                <p>否命題（inverse）是兩邊都加「不」、但不對調：「若 n 不是 4 的倍數，則 n 不是偶數」。</p>
                <p>它的「若」成立是 P 不成立，「則」不成立是 Q 成立：違約格是 P 不成立、Q 成立，和逆命題同一格。所以否命題和逆命題是同一句話，和原句不同（6 同樣推翻它）。</p>
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
    if (g === 'B') return '你一開始就選了只有 B，對。';
    if (g === 'both') return '你一開始選了 A、B 都是：A 聽起來很像原句，但違約格不同。';
    if (g === 'A') return '你一開始選了 A：A 只是把兩半對調，聽起來最像，但違約格不同。';
    return '你一開始選了都不是：B 雖然多了兩個「不」，違約格卻和原句一樣。';
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
            ? '對：n 是偶數（Q 成立），卻不是 4 的倍數（P 不成立）。A 的違約格不在原句那一格。'
            : '對：n 不是偶數（Q 不成立），卻是 4 的倍數（P 成立）。B 的違約格就是原句那一格。',
      });
      if (this.named()) this.progress.markCompleted('proofs-ch3', '5');
      return;
    }
    const [ifOk, thenOk] = PARTS[r.id](c);
    const why = !ifOk
      ? `「${r.ifPart}」不成立：承諾沒被觸發。`
      : thenOk
        ? `「${r.ifPart}」成立，「${r.thenPart}」也成立：守約。`
        : '';
    this.msg.set({ tone: 'bad', text: `「${cellDesc(c)}」那一格：${why}要找的是「若」成立、「則」不成立的格。` });
  }
}
