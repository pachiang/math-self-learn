import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type VocabularyChoice = 'experiment' | 'outcome' | 'sample-space';

@Component({
  selector: 'app-prob-v2-experiment-outcome-space',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 2.1</p>
        <h2>骰子落地前，整個世界都還在</h2>
        <p class="lede">
          機率問題常把三個不同層級混在一起：一套產生結果的規則、
          事前所有可能結果，以及最後真正發生的那一個結果。
          先把這三層拆開，後面的符號才會有位置可放。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">先找出「真正發生的那一個」</p>
            <h3>下面哪一張卡是在描述 outcome？</h3>
          </div>
          <p>
            結果（outcome）必須是一場 experiment 結束後， 可以指著它說「這次就是它」的完整答案。
          </p>
        </div>

        <div class="classification" role="group" aria-label="選擇哪一項是 outcome">
          <button
            type="button"
            [class.selected]="vocabularyChoice() === 'experiment'"
            (click)="vocabularyChoice.set('experiment')"
          >
            <span>A</span>
            <strong>擲一顆六面骰</strong>
          </button>
          <button
            type="button"
            [class.selected]="vocabularyChoice() === 'sample-space'"
            (click)="vocabularyChoice.set('sample-space')"
          >
            <span>B</span>
            <strong>1、2、3、4、5、6</strong>
          </button>
          <button
            type="button"
            [class.selected]="vocabularyChoice() === 'outcome'"
            (click)="vocabularyChoice.set('outcome')"
          >
            <span>C</span>
            <strong>這次骰到 4</strong>
          </button>
        </div>

        @if (vocabularyChoice()) {
          <p class="feedback" aria-live="polite">
            @switch (vocabularyChoice()) {
              @case ('outcome') {
                <strong>對，C 是一個 outcome。</strong>
                它描述這次 experiment 最後落在哪一個完整結果。
              }
              @case ('experiment') {
                A 描述的是<strong>隨機實驗（random experiment）</strong>：
                一套可以執行、但結果事前不確定的程序。
              }
              @case ('sample-space') {
                B 把所有 outcomes 放在一起，描述的是
                <strong>樣本空間（sample space）</strong>。
              }
            }
          </p>
        }
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">讓三層同時出現在畫面上</p>
            <h3>反覆擲骰：什麼改變，什麼保持不變？</h3>
          </div>
          <p>
            experiment 的規則沒有改，sample space 也沒有改。 每次重新執行時，只有被選中的 outcome
            改變。
          </p>
        </div>

        <div class="world-demo">
          <div class="experiment-machine">
            <span class="machine-label"> RANDOM EXPERIMENT<br />擲一顆六面骰 </span>
            <div class="die-face" [attr.aria-label]="dieLabel()">
              {{ currentOutcome() ?? '?' }}
            </div>
            <button type="button" class="primary-action" (click)="roll()">
              {{ currentOutcome() === null ? '擲第一次' : '再擲一次' }}
            </button>
          </div>

          <div class="outcome-world" aria-label="樣本空間包含一到六">
            @for (value of outcomes; track value) {
              <div class="outcome-tile" [class.active]="currentOutcome() === value">
                {{ value }}
              </div>
            }
            <p class="world-caption">
              SAMPLE SPACE · 無論這次骰到哪一點，事前的完整可能世界一直是這六格
            </p>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="three-levels" aria-hidden="true">
          <div>
            <span>規則</span>
            <strong>experiment</strong>
          </div>
          <i>→</i>
          <div>
            <span>可能世界</span>
            <strong>sample space</strong>
          </div>
          <i>→</i>
          <div>
            <span>實際落點</span>
            <strong>outcome</strong>
          </div>
        </div>
        <div>
          <span class="card-label">帶走這個層級</span>
          <p>
            <strong>experiment 產生 outcome；sample space 收集所有可能 outcomes。</strong>
            不要把「做什麼」「可能有哪些」「這次發生什麼」混成同一件事。
          </p>
        </div>
      </aside>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">換一個情境</p>
            <h3>付款流程中，哪一個是 outcome？</h3>
          </div>
          <p>
            experiment 是「送出一次付款請求」；如果我們只關心是否成功， sample space
            可以先寫成「成功、失敗」。
          </p>
        </div>
        <div class="choice-row" role="group" aria-label="選擇付款流程的 outcome">
          <button
            type="button"
            [class.selected]="transferChoice() === 0"
            (click)="transferChoice.set(0)"
          >
            送出付款請求
          </button>
          <button
            type="button"
            [class.selected]="transferChoice() === 1"
            (click)="transferChoice.set(1)"
          >
            {{ '{成功, 失敗}' }}
          </button>
          <button
            type="button"
            [class.selected]="transferChoice() === 2"
            (click)="transferChoice.set(2)"
          >
            這次付款失敗
          </button>
        </div>
        @if (transferChoice() !== null) {
          <p class="feedback" aria-live="polite">
            @if (transferChoice() === 2) {
              <strong>對。</strong>「這次付款失敗」是這次 experiment 的一個完整 outcome。
            } @else if (transferChoice() === 0) {
              這是 experiment，也就是產生結果的程序。
            } @else {
              這是 sample space：事前仍可能發生的完整 outcomes 集合。
            }
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>符號層：為什麼 sample space 寫成 Ω？</summary>
        <div>
          <p>sample space 常用大寫希臘字母 Omega：<strong>Ω</strong>。 擲一顆六面骰時可以寫成：</p>
          <div class="math-line">
            <app-math e="Omega = {1,2,3,4,5,6}" />
          </div>
          <p>
            每個 outcome 是 Ω 裡的一個元素。例如骰到 4，可以寫成
            <app-math e="4 in Omega" />，讀作「4 belongs to Ω」。 這裡還沒有替任何結果分配
            probability；我們只是先把可能世界畫完整。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ExperimentOutcomeSpaceComponent {
  readonly outcomes = [1, 2, 3, 4, 5, 6] as const;
  readonly rollSequence = [4, 1, 6, 2, 5, 3] as const;
  readonly vocabularyChoice = signal<VocabularyChoice | null>(null);
  readonly transferChoice = signal<number | null>(null);
  readonly rollIndex = signal(-1);
  readonly currentOutcome = computed(() =>
    this.rollIndex() < 0 ? null : this.rollSequence[this.rollIndex() % this.rollSequence.length],
  );
  readonly dieLabel = computed(() =>
    this.currentOutcome() === null ? '骰子尚未投擲' : `這次骰到 ${this.currentOutcome()}`,
  );

  roll(): void {
    this.rollIndex.update((index) => index + 1);
  }
}
