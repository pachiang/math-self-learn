import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type CoinInformation = 'none' | 'second-h' | 'second-t';

@Component({
  selector: 'app-prob-v2-ratio-invariant',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch9">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 9.1</p>
        <h2>獨立不是世界沒有縮小，而是縮小後比例沒變</h2>
        <p class="lede">
          兩個事件<strong>獨立（independent）</strong>，意思是得到其中一件事的資訊後，另一件事的
          probability 保持原樣。這是一個 ratio invariant，不是語意上的「好像無關」。
        </p>
      </header>

      <section class="scene">
        <div class="independence-prediction">
          <div>
            <p class="eyebrow">先預測 · two fair coin tosses</p>
            <h3>已知第二次是 H，第一次是 H 的 probability 會從 1/2 改變嗎？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測第一次正面機率是否改變">
            <button
              type="button"
              [class.selected]="prediction() === 'change'"
              (click)="prediction.set('change')"
            >
              會改變
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'same'"
              (click)="prediction.set('same')"
            >
              仍是 1/2
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'same') {
              <strong>對。</strong>given second H 後只剩 HH、TH；其中仍是一條 first H、一條 first
              T。
            } @else {
              世界確實縮小了，但留下的兩條 paths 仍用 1:1 保留 first H 與 first T。
            }
          </p>
        }
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Condition switch · A = first toss is H</p>
            <h3>切換第二次的資訊，盯著 A 的比例</h3>
          </div>
          <div class="preset-row" role="group" aria-label="切換第二次硬幣資訊">
            <button
              type="button"
              [class.active]="information() === 'none'"
              (click)="information.set('none')"
            >
              No information
            </button>
            <button
              type="button"
              [class.active]="information() === 'second-h'"
              (click)="information.set('second-h')"
            >
              Given second H
            </button>
            <button
              type="button"
              [class.active]="information() === 'second-t'"
              (click)="information.set('second-t')"
            >
              Given second T
            </button>
          </div>
        </div>
      </section>

      <section class="ratio-worlds">
        <div class="ratio-panel">
          <p class="eyebrow">Before information · Ω</p>
          <h3>四條完整 paths</h3>
          <div class="path-world" style="--path-count: 4" aria-label="兩次硬幣的四條完整路徑">
            @for (path of paths; track path) {
              <div
                class="path-tile"
                [class.in-a]="inA(path)"
                [class.discarded]="information() !== 'none' && !survives(path)"
              >
                <strong>{{ path }}</strong>
                <span>{{ inA(path) ? 'A · first H' : 'not A' }}</span>
              </div>
            }
          </div>
          <div class="ratio-readout">
            <span>P(A) · first toss is H</span>
            <strong>2 / 4 = 50%</strong>
          </div>
        </div>

        <div class="ratio-arrow" aria-hidden="true">
          @if (information() === 'none') {
            等待<br />condition
          } @else {
            裁成<br />{{ conditionLabel() }} →
          }
        </div>

        <div class="ratio-panel conditioned">
          <p class="eyebrow">After information · conditioned world</p>
          <h3>{{ conditionedTitle() }}</h3>
          @if (information() === 'none') {
            <div class="invariant-badge">
              <span>先選一個 condition</span>
              <strong>觀察 A 的比例是否改變</strong>
            </div>
          } @else {
            <div
              class="path-world"
              style="--path-count: 2"
              aria-label="條件資訊後剩餘的兩條硬幣路徑"
            >
              @for (path of survivingPaths(); track path) {
                <div class="path-tile" [class.in-a]="inA(path)">
                  <strong>{{ path }}</strong>
                  <span>{{ inA(path) ? 'A survives' : 'not A' }}</span>
                </div>
              }
            </div>
            <div class="ratio-readout">
              <span>P(A | {{ conditionLabel() }})</span>
              <strong>1 / 2 = 50%</strong>
            </div>
          }
        </div>
      </section>

      <section class="invariant-badge" aria-live="polite">
        <span>BEFORE 50% → AFTER {{ information() === 'none' ? '等待資訊' : '50%' }}</span>
        <strong>
          {{
            information() === 'none'
              ? 'Independence 要比較 before 與 after'
              : '比例完全不變：A 與這個 condition independent'
          }}
        </strong>
      </section>

      <aside class="insight-card">
        <div class="marginal-lock" aria-hidden="true">
          <div>
            <span>Original world</span>
            <strong>A 占 50%</strong>
          </div>
          <i>condition on B</i>
          <div>
            <span>World B</span>
            <strong>A 仍占 50%</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Conditional：世界縮小；independent：縮小後比例不變</span>
          <p>
            <strong>第二次資訊刪掉一半 paths，卻沒有偏向 first H 或 first T。</strong>
            新資訊沒有讓 A 更可能或更不可能，這才是 independence 的內容。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：independence 的等價定義</summary>
        <div>
          <p>當 P(B)>0 時，A、B independent 可以寫成：</p>
          <div class="math-line">
            <app-math e="P(A\\mid B)=P(A)" />
          </div>
          <p>代入 conditional probability 定義並乘回 P(B)，得到常用的對稱形式：</p>
          <div class="math-line">
            <app-math e="P(A\\cap B)=P(A)P(B)" />
          </div>
          <p>
            「可以直接相乘」是比例不變帶來的結果，不是 independence 最值得記的直覺。對稱形式也說明：
            A independent of B 時，B 也 independent of A。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2RatioInvariantComponent {
  readonly paths = ['HH', 'HT', 'TH', 'TT'];
  readonly prediction = signal<'change' | 'same' | null>(null);
  readonly information = signal<CoinInformation>('second-h');
  readonly survivingPaths = computed(() => this.paths.filter((path) => this.survives(path)));
  readonly conditionLabel = computed(() =>
    this.information() === 'second-h' ? 'second H' : 'second T',
  );
  readonly conditionedTitle = computed(() => {
    if (this.information() === 'none') return '尚未指定 conditioned world';
    return this.information() === 'second-h' ? '只剩 HH、TH' : '只剩 HT、TT';
  });

  inA(path: string): boolean {
    return path.startsWith('H');
  }

  survives(path: string): boolean {
    if (this.information() === 'none') return true;
    return this.information() === 'second-h' ? path.endsWith('H') : path.endsWith('T');
  }
}
