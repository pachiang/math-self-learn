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
            <p class="pf-p">放到四格圖上看：上排是「考了 120 分」，這根本不可能發生，所以整排畫上斜線。注意，違約格也在這一排。</p>
            <app-pf-grid4 p="考 120 分" q="拿到手機" [view]="broView" />
            <p class="pf-p">
              要抓到哥哥食言，你得先考到 120 分，但這件事永遠不會發生。所以不管他最後送不送手機，你都抓不到他食言，這句話就算是<b>真的</b>。像這樣前提永遠不會發生、所以自動成立的句子，叫做<b>空洞為真</b>（vacuous truth）。
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
            <p class="pf-note">格子裡放了幾個整數當例子。它們全都在下排，因為沒有哪個整數能同時是偶數和奇數。</p>

            @if (!absurdAsked()) {
              <p class="pf-p">把「則」後面換成別的話，看看四格圖會怎麼變：</p>
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
                <p class="pf-note">最後試試看：則 1 = 2。</p>
              }
            } @else {
              @if (absurdMsg(); as m) {
                <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.you]="m.tone === 'you'" role="status">{{ m.text }}</p>
              }
              <details class="pf-why">
                <summary>為什麼沒有整數既是偶數、又是奇數？</summary>
                <div>
                  <p>用第 2 章的工具。假設 n 是偶數，就拿到一個整數 k，讓 n = 2k；n 又是奇數，再拿到一個整數 m，讓 n = 2m + 1。</p>
                  <p>兩式相減得到 2k − 2m = 1，也就是 k − m = 0.5。可是兩個整數相減一定是整數，不可能是 0.5。矛盾，所以這樣的 n 根本不存在，上排永遠不會發生。</p>
                </div>
              </details>
              <div class="pf-takeaway reveal">
                <small>帶走這一句</small>
                <p>前提不可能發生，違約格就永遠空著。<br />這種承諾自動成立，<br />「則」後面接什麼都一樣。</p>
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
      this.broMsg.set({ tone: 'good', text: '對。哥哥要食言，只有一種情況：你考了 120 分，他卻沒給手機。可是你根本考不到 120 分。' });
      return;
    }
    this.broMsg.set({
      tone: 'you',
      text:
        id === 'yes'
          ? '想想看，怎樣才算食言？你考了 120 分，他卻沒給手機。可是 120 分考得到嗎？再選一次。'
          : '這種承諾只有一種情況算食言：你考了 120 分，他卻沒給手機。這種情況會發生嗎？再選一次。',
    });
  }

  setConcl(id: string): void {
    this.conclId.set(id);
  }

  answerAbsurd(holds: boolean): void {
    this.absurdAsked.set(true);
    this.absurdMsg.set(
      holds
        ? { tone: 'good', text: '對。要讓它違約，得先找到一個既是偶數又是奇數的 n。第一步就永遠做不到，所以這句話不會違約，它成立。' }
        : {
            tone: 'you',
            text: '1 = 2 確實是錯的，可是這句話沒有說 1 = 2，它說的是「若 n 既是偶數、又是奇數，則 1 = 2」。要讓它違約，得先找到這樣的 n，而這永遠找不到。所以句子成立：前提不可能發生時，「則」後面接什麼都一樣。',
          },
    );
    this.progress.markCompleted('proofs-ch3', '4');
  }
}
