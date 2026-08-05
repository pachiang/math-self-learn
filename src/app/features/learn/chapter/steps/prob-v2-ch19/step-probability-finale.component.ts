import { Component, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-probability-finale',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch19">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 19.8 · Finale</p>
        <h2>從 possible worlds 到 limit laws：先問機制，再問 measurement</h2>
        <p class="lede">
          十九章主線可以壓成一套可重複使用的思考方式：畫完整世界、分配重量、加入資訊、選擇
          measurement，最後才研究 repeated worlds 如何形成規律。
        </p>
      </header>
      <section class="course-spine">
        <article>
          <span>PART I · WORLD</span><strong>哪些 outcomes 可能？</strong>
          <p>Sample space、event、weight、counting。</p>
        </article>
        <i>→</i>
        <article>
          <span>PART II · INFORMATION</span><strong>知道什麼後，世界如何重配？</strong>
          <p>Conditional probability、independence、Bayes。</p>
        </article>
        <i>→</i>
        <article>
          <span>PART III–IV · MEASUREMENT</span><strong>從世界讀出哪個 quantity？</strong>
          <p>Random variables、distributions、expectation、family operations。</p>
        </article>
        <i>→</i>
        <article>
          <span>PART V · REPEAT</span><strong>Many worlds 出現什麼規律？</strong>
          <p>LLN 收束位置；CLT 放大 shape。</p>
        </article>
      </section>
      <section class="final-challenge">
        <div>
          <p class="eyebrow">最後一個判斷</p>
          <h3>
            某筆原始資料極度右偏，但 200 筆平均的 standardized distribution 接近
            Normal。哪句最精確？
          </h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.selected]="answer() === 'data'" (click)="answer.set('data')">
            原始資料已變 Normal</button
          ><button
            type="button"
            [class.selected]="answer() === 'stat'"
            (click)="answer.set('stat')"
          >
            Statistic 的 sampling law 近似 Normal
          </button>
        </div>
        @if (answer()) {
          <p class="feedback">
            @if (answer() === 'stat') {
              <strong>對。你已分清世界、measurement 與 repeated-world distribution。</strong>
            } @else {
              Raw source 沒有被改寫；Normal-like 的是每個 world 產生的 standardized statistic。
            }
          </p>
        }
      </section>
      <section class="limit-duet">
        <article>
          <span>LAW OF LARGE NUMBERS</span>
          <div><i></i><b>μ</b></div>
          <strong>Where does the cloud go?</strong>
          <p>X̄ₙ concentrates near μ.</p>
        </article>
        <article>
          <span>CENTRAL LIMIT THEOREM</span>
          <div><i></i><b>0</b></div>
          <strong>What shape remains after zoom?</strong>
          <p>Standardized error approaches Normal.</p>
        </article>
      </section>
      <aside class="insight-card">
        <div class="clt-core">
          <span>mechanism</span><i>→ measurement → repeat</i
          ><strong>→ distributional pattern</strong>
        </div>
        <div>
          <span class="card-label">最後留下的是判斷流程，不是公式清單</span>
          <p>
            <strong
              >先辨認 random object 與生成條件；公式只是把已看見的結構壓縮成可計算語言。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>本課兩條 limit laws 的正式並列</summary>
        <div class="clt-formulas">
          <app-math e="\\bar X_n\\xrightarrow{P}\\mu" /><app-math
            e="\\frac{\\sqrt n(\\bar X_n-\\mu)}{\\sigma}\\xrightarrow{d}N(0,1)"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ProbabilityFinaleComponent {
  readonly answer = signal<'data' | 'stat' | null>(null);
}
