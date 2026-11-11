import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { CELLS, Cell, CellView, Grid4Component, num } from './grid4.component';

type Tone = 'good' | 'bad' | 'you';

interface Conclusion {
  id: string;
  text: string;
  holds: (n: number) => boolean;
}

const CONCLUSIONS: Conclusion[] = [
  { id: 'eq100', text: 'n = 100', holds: (n) => n === 100 },
  { id: 'neg', text: 'n < 0', holds: (n) => n < 0 },
  { id: 'absurd', text: '1 = 2', holds: () => false },
];

/** Sample integers; none is both even and odd, so all land in the bottom row. */
const SAMPLE = [-3, 0, 2, 5, 100];

@Component({
  selector: 'app-pf-vacuous',
  standalone: true,
  imports: [Grid4Component],
  styleUrl: './scene-vacuous.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">4 / 6 · 空洞為真</p>
        <h1 class="pf-title">永遠不會被觸發的承諾</h1>

        <div class="pf-slip">
          <small>哥哥說（這次考試滿分 100 分）</small>
          <p>「如果你這次考 120 分，我就把手機送你。」</p>
        </div>

        <div class="pf-col tight">
          <p class="pf-q">哥哥這句話，有可能食言嗎？</p>
          <div class="pf-row">
            @for (o of opts; track o.id) {
              <button type="button" class="pf-btn" [class.picked]="bro() === o.id" [disabled]="broDone()" (click)="pickBro(o.id)">{{ o.label }}</button>
            }
          </div>
          @if (broMsg(); as m) {
            <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.you]="m.tone === 'you'" role="status">{{ m.text }}</p>
          }
        </div>

        @if (broDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">在四格圖上看：上排是「考了 120 分」，根本不可能發生，所以整排畫上斜線。違約格也在上排。</p>
            <app-pf-grid4 p="考 120 分" q="拿到手機" [view]="broView" />
            <p class="pf-p">
              違約格不可能發生，這個承諾就永遠不會被打破，所以它是<b>真的</b>，不管哥哥送不送手機。前提不可能成立，句子因此自動成立，這叫<b>空洞為真</b>（vacuous truth）。
            </p>
          </div>

          <!-- math version -->
          <div class="pf-col tight pf-rise">
            <p class="pf-q">數學裡也有這種句子：</p>
            <div class="pf-slip">
              <small>對整數 n</small>
              <p>若 n 既是偶數、又是奇數，則 {{ concl().text }}。</p>
            </div>
            <app-pf-grid4 p="n 既是偶數又是奇數" [q]="concl().text" [view]="mathView()" />
            <p class="pf-note">格子裡放了幾個整數當例子：它們全都落在下排，因為沒有整數既是偶數又是奇數。</p>

            @if (!absurdAsked()) {
              <p class="pf-p">換掉「則」後面的話，看四格圖怎麼變：</p>
              <div class="pf-row">
                @for (c of conclusions; track c.id) {
                  <button type="button" class="pf-btn small" [class.picked]="conclId() === c.id" (click)="setConcl(c.id)">則 {{ c.text }}</button>
                }
              </div>
              @if (conclId() === 'absurd') {
                <p class="pf-q">「若 n 既是偶數、又是奇數，則 1 = 2。」這句話成立嗎？</p>
                <div class="pf-row">
                  <button type="button" class="pf-btn" (click)="answerAbsurd(true)">成立</button>
                  <button type="button" class="pf-btn" (click)="answerAbsurd(false)">不成立，1 = 2 是錯的</button>
                </div>
              } @else {
                <p class="pf-note">試試最後一個：則 1 = 2。</p>
              }
            } @else {
              @if (absurdMsg(); as m) {
                <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.you]="m.tone === 'you'" role="status">{{ m.text }}</p>
              }
              <details class="pf-why">
                <summary>為什麼沒有整數既是偶數、又是奇數？</summary>
                <div>
                  <p>用第 2 章的工具。假設 n 是偶數，拿到整數 k，n = 2k；n 也是奇數，拿到整數 m，n = 2m + 1。</p>
                  <p>兩式相減：2k − 2m = 1，也就是 1 = 2 × (k − m)。k − m 是整數，所以 1 會是偶數。但 1 = 2 × 0.5，0.5 不是整數：1 不是偶數。所以這樣的 n 不存在，上排永遠不可能。</p>
                </div>
              </details>
              <div class="pf-takeaway reveal">
                <small>帶走這一句</small>
                <p>前提不可能成立，違約格就永遠空著：<br />這種承諾自動成立，<br />不管「則」後面接什麼。</p>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneVacuousComponent {
  private readonly progress = inject(LearnProgressService);

  readonly opts = [
    { id: 'yes', label: '有可能' },
    { id: 'no', label: '不可能' },
    { id: 'unsure', label: '說不準' },
  ];
  readonly conclusions = CONCLUSIONS;

  readonly bro = signal<string | null>(null);
  readonly broDone = signal(false);
  readonly broMsg = signal<{ tone: Tone; text: string } | null>(null);
  readonly conclId = signal('eq100');
  readonly absurdAsked = signal(false);
  readonly absurdMsg = signal<{ tone: Tone; text: string } | null>(null);

  readonly concl = computed(() => CONCLUSIONS.find((c) => c.id === this.conclId())!);

  readonly broView: Partial<Record<Cell, CellView>> = {
    TT: { mark: 'impossible' },
    TF: { mark: 'impossible', note: '違約格在這裡' },
    FT: { mark: 'idle', note: '算真' },
    FF: { mark: 'idle', note: '算真' },
  };

  readonly mathView = computed(() => {
    const c = this.concl();
    const v: Partial<Record<Cell, CellView>> = {};
    for (const cell of CELLS) {
      const top = cell[0] === 'T';
      v[cell] = {
        mark: top ? 'impossible' : 'idle',
        note: cell === 'TF' ? '違約格在這裡' : top ? undefined : '算真',
        tokens: top ? [] : SAMPLE.filter((n) => c.holds(n) === (cell[1] === 'T')).map(num),
      };
    }
    return v;
  });

  pickBro(id: string): void {
    this.bro.set(id);
    if (id === 'no') {
      this.broDone.set(true);
      this.broMsg.set({ tone: 'good', text: '對。食言只有一種情況：考了 120 分，卻沒拿到手機。可是根本考不到 120 分。' });
      return;
    }
    this.broMsg.set({
      tone: 'you',
      text:
        id === 'yes'
          ? '想想看什麼情況算食言：考了 120 分卻沒拿到手機。考得到 120 分嗎？再選一次。'
          : '「若…則」只在一格違約：考了 120 分卻沒拿到手機。那一格會發生嗎？再選一次。',
    });
  }

  setConcl(id: string): void {
    this.conclId.set(id);
  }

  answerAbsurd(holds: boolean): void {
    this.absurdAsked.set(true);
    this.absurdMsg.set(
      holds
        ? { tone: 'good', text: '對。要違約，得先有一個 n 既是偶數又是奇數，再讓 1 = 2 不成立。前半永遠做不到，所以這句話不會違約：它成立。' }
        : {
            tone: 'you',
            text: '1 = 2 確實是錯的，但這句話沒有說 1 = 2；它說「若 n 既偶又奇，則 1 = 2」。要違約，得先找到既偶又奇的 n，永遠找不到。所以句子成立：前提不可能時，「則」後面接什麼都一樣。',
          },
    );
    this.progress.markCompleted('proofs-ch3', '4');
  }
}
