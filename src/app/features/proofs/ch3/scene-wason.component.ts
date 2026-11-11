import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { CELLS, Cell, CellView, Grid4Component } from './grid4.component';

type Tone = 'good' | 'bad' | 'you';

interface Card {
  face: string;
  back: string;
  /** The two cells this card could land in, depending on its hidden side. */
  could: [Cell, Cell];
  flip: boolean;
  why: string;
}

const CARDS: Card[] = [
  { face: 'A', back: '8', could: ['TT', 'TF'], flip: true, why: '母音：規則被觸發。背面是偶數就守約，是奇數就違約。要翻。' },
  { face: 'K', back: '5', could: ['FT', 'FF'], flip: false, why: '不是母音：規則沒被觸發，背面是什麼都不會違約。不用翻。' },
  { face: '4', back: 'U', could: ['TT', 'FT'], flip: false, why: '已經是偶數：背面是母音就守約，是子音就沒觸發。怎樣都不會違約。不用翻。' },
  { face: '7', back: 'E', could: ['TF', 'FF'], flip: true, why: '不是偶數：背面若是母音，就是違約。要翻。' },
];

const LIFE = [
  { face: '喝啤酒', flip: true, pair: 'A', role: 'P 成立' },
  { face: '喝可樂', flip: false, pair: 'K', role: 'P 不成立' },
  { face: '25 歲', flip: false, pair: '4', role: 'Q 成立' },
  { face: '16 歲', flip: true, pair: '7', role: 'Q 不成立' },
];

@Component({
  selector: 'app-pf-wason',
  standalone: true,
  imports: [Grid4Component],
  styleUrl: './scene-wason.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">3 / 6 · 檢查承諾</p>
        <h1 class="pf-title">該翻哪幾張？</h1>
        <p class="pf-lede">每張卡一面是英文字母，另一面是數字。桌上放著四張，你只看得到朝上的那一面。</p>

        <div class="pf-slip">
          <small>規則</small>
          <p>如果一張卡的一面是母音，另一面就是偶數。</p>
          @if (flipped()) {
            <span class="pf-seal refuted stamp">推翻</span>
          }
        </div>

        <div class="cards">
          @for (c of cards; track c.face) {
            <button
              type="button"
              class="card"
              [class.picked]="picks().has(c.face)"
              [class.must]="committed() && c.flip"
              [class.turned]="flipped()"
              [attr.aria-pressed]="picks().has(c.face)"
              [attr.aria-label]="flipped() ? c.face + '，背面是 ' + c.back : c.face"
              [disabled]="committed()"
              (click)="toggle(c.face)"
            >
              <span class="face">{{ flipped() ? c.back : c.face }}</span>
              @if (flipped()) {
                <small>正面 {{ c.face }}</small>
              }
            </button>
          }
        </div>

        @if (!committed()) {
          <p class="pf-q">要確定規則有沒有被打破，<b>最少</b>要翻哪幾張？</p>
          <p class="pf-note">點選要翻的卡，再按「就翻這幾張」。</p>
          <div class="pf-row"><button type="button" class="pf-btn primary" (click)="commit()">就翻這幾張</button></div>
        }

        @if (committed()) {
          <div class="pf-col tight pf-rise">
            @if (commitMsg(); as m) {
              <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.you]="m.tone === 'you'" role="status">{{ m.text }}</p>
            }
            <p class="pf-p">
              用四格圖看：P 是「一面是母音」，Q 是「另一面是偶數」。每張卡背面有兩種可能，所以它<b>可能</b>落在兩格裡的一格；格子裡的「A?」表示 A 可能在這一格。只有可能落進違約格的卡，才需要翻。
            </p>
            <app-pf-grid4 p="一面是母音" q="另一面是偶數" [view]="couldView" />
            <ul class="why">
              @for (c of cards; track c.face) {
                <li [class.must]="c.flip"><b>{{ c.face }}</b>{{ c.why }}</li>
              }
            </ul>
            @if (!flipped()) {
              <div class="pf-row"><button type="button" class="pf-btn primary" (click)="flip()">把四張都翻開</button></div>
            } @else {
              <p class="pf-feedback bad pf-rise" role="status">
                7 的背面是 E：一面是母音，另一面卻不是偶數。規則被打破了，抓到它的是 7，不是 4。{{ picks().has('7') ? '你翻了 7，抓到了。' : '你沒翻 7，就會錯過這張。' }}
              </p>
            }
          </div>
        }

        <!-- transfer: same structure, everyday surface -->
        @if (flipped()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-q">換一個場景。你是酒吧的檢查員：</p>
            <div class="pf-slip">
              <small>規則</small>
              <p>如果在喝酒，就必須滿 18 歲。</p>
            </div>
            <p class="pf-p">每張卡一面寫這個人在喝什麼，另一面寫年齡。要確定有沒有人違規，最少要翻哪幾張？</p>
            <div class="cards">
              @for (c of life; track c.face) {
                <button
                  type="button"
                  class="card wide"
                  [class.picked]="lifePicks().has(c.face)"
                  [class.must]="lifeDone() && c.flip"
                  [attr.aria-pressed]="lifePicks().has(c.face)"
                  [disabled]="lifeDone()"
                  (click)="toggleLife(c.face)"
                >
                  <span class="face">{{ c.face }}</span>
                </button>
              }
            </div>
            @if (!lifeDone()) {
              <div class="pf-row"><button type="button" class="pf-btn primary" (click)="commitLife()">就翻這幾張</button></div>
            } @else {
              @if (lifeMsg(); as m) {
                <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.you]="m.tone === 'you'" role="status">{{ m.text }}</p>
              }
              <table class="pf-table pair">
                <tr><th>四格裡的位置</th><th>字母卡</th><th>酒吧</th><th></th></tr>
                @for (c of life; track c.face) {
                  <tr [class.must]="c.flip">
                    <td>{{ c.role }}</td>
                    <td class="pf-num">{{ c.pair }}</td>
                    <td>{{ c.face }}</td>
                    <td>{{ c.flip ? '要翻' : '不用翻' }}</td>
                  </tr>
                }
              </table>
              <p class="pf-p">
                兩題結構一模一樣：要翻的都是「P 成立」和「Q 不成立」的那兩張。酒吧版本比較容易，是因為你自然會去找違規的人；字母版本也該這樣找。
              </p>
              <div class="pf-takeaway reveal">
                <small>帶走這一句</small>
                <p>檢查「若 P 則 Q」，<br />只看可能落進違約格的：<br />P 成立的，和 Q 不成立的。</p>
              </div>
              <details class="pf-why">
                <summary>為什麼大多數人會翻 4？</summary>
                <div>
                  <p>這是心理學家 Wason 在 1966 年設計的選卡任務（Wason selection task）。在原始實驗裡，大多數人選 A 和 4，選對 A 和 7 的人很少。</p>
                  <p>翻 4 是在找「支持規則的例子」：背面是母音，看起來像證實了規則。但第 1 章說過，例子再多也證明不了規則；能推翻規則的只有違約的那一張。這種偏好叫確認偏誤（confirmation bias）。</p>
                  <p>喝酒年齡的版本由 Griggs 與 Cox 在 1982 年提出，答對的人多很多，雖然邏輯結構完全相同。</p>
                </div>
              </details>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneWasonComponent {
  private readonly progress = inject(LearnProgressService);

  readonly cards = CARDS;
  readonly life = LIFE;

  readonly picks = signal<Set<string>>(new Set());
  readonly committed = signal(false);
  readonly commitMsg = signal<{ tone: Tone; text: string } | null>(null);
  readonly flipped = signal(false);
  readonly lifePicks = signal<Set<string>>(new Set());
  readonly lifeDone = signal(false);
  readonly lifeMsg = signal<{ tone: Tone; text: string } | null>(null);

  readonly couldView: Partial<Record<Cell, CellView>> = Object.fromEntries(
    CELLS.map((c) => [
      c,
      {
        mark: c === 'TF' ? 'breach' : 'none',
        note: c === 'TF' ? '可能落在這裡的卡要翻' : undefined,
        tokens: CARDS.filter((k) => k.could.includes(c)).map((k) => k.face + '?'),
      },
    ]),
  );

  toggle(face: string): void {
    this.picks.update((s) => toggled(s, face));
  }

  toggleLife(face: string): void {
    this.lifePicks.update((s) => toggled(s, face));
  }

  commit(): void {
    const p = this.picks();
    this.committed.set(true);
    if (same(p, ['A', '7'])) {
      this.commitMsg.set({ tone: 'good', text: 'A 和 7，對。這題大多數人會答錯。' });
    } else if (same(p, ['A', '4'])) {
      this.commitMsg.set({ tone: 'you', text: '這是最常見的答案：A 和 4。A 對了，但 4 翻了也抓不到違約，該翻的是 7。' });
    } else {
      this.commitMsg.set({ tone: 'you', text: `你選了${p.size ? [...p].join('、') : '不翻'}。該翻的是 A 和 7，理由在四格圖下面。` });
    }
  }

  flip(): void {
    this.flipped.set(true);
  }

  commitLife(): void {
    const p = this.lifePicks();
    this.lifeDone.set(true);
    this.lifeMsg.set(
      same(p, ['喝啤酒', '16 歲'])
        ? { tone: 'good', text: '喝啤酒的人要查年齡，16 歲的人要查在喝什麼。這次是不是容易很多？' }
        : { tone: 'you', text: '該翻的是「喝啤酒」和「16 歲」：喝啤酒的人可能未滿 18，16 歲的人可能在喝酒。' },
    );
    this.progress.markCompleted('proofs-ch3', '3');
  }
}

function toggled(s: Set<string>, v: string): Set<string> {
  const next = new Set(s);
  next.has(v) ? next.delete(v) : next.add(v);
  return next;
}

function same(s: Set<string>, want: string[]): boolean {
  return s.size === want.length && want.every((w) => s.has(w));
}
