import { Component, computed, signal } from '@angular/core';
import { bernoulliTrials } from './probability-v2-random';

type ForecastAnswer = 'wrong' | 'not-enough';
type TransferAnswer = 'broken' | 'possible';

@Component({
  selector: 'app-prob-v2-not-prophecy',
  standalone: true,
  template: `
    <article class="lesson">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 1.1</p>
        <h2>70% 不是對明天的保證</h2>
        <p class="lede">
          機率（probability）要回答的不是「明天究竟會不會下雨」，
          而是結果揭曉前，我們該怎麼描述仍然存在的不確定性。
        </p>
      </header>

      <section class="forecast-scene" aria-labelledby="forecast-question">
        <div class="weather-card">
          <span class="weather-icon" aria-hidden="true">☂</span>
          <div>
            <span class="weather-label">明日降雨機率</span>
            <strong>70%</strong>
          </div>
        </div>

        <div class="question">
          <p id="forecast-question">隔天結果是晴天。單憑這一次，就能說預報錯了嗎？</p>
          <div class="choices" role="group" aria-label="選擇你的判斷">
            <button
              type="button"
              [class.selected]="forecastAnswer() === 'wrong'"
              (click)="forecastAnswer.set('wrong')"
            >
              能，因為沒有下雨
            </button>
            <button
              type="button"
              [class.selected]="forecastAnswer() === 'not-enough'"
              (click)="forecastAnswer.set('not-enough')"
            >
              不能，資訊還不夠
            </button>
          </div>
        </div>

        @if (forecastAnswer()) {
          <div class="reveal" aria-live="polite">
            <div
              class="probability-strip"
              role="img"
              aria-label="模型把百分之七十的權重放在下雨，百分之三十放在不下雨；實際結果落在不下雨區"
            >
              <div class="rain-region">
                <span>下雨 · 70%</span>
              </div>
              <div class="clear-region">
                <span>晴天 · 30%</span>
              </div>
              <div class="outcome-marker">
                <span>實際結果</span>
              </div>
            </div>

            @if (forecastAnswer() === 'wrong') {
              <p class="feedback misconception">
                這個判斷把 <strong>70%</strong> 誤讀成了「一定下雨」。 但模型從一開始就保留了 30%
                的晴天可能；結果只是落在較小的那一區。
              </p>
            } @else {
              <p class="feedback correct">
                對。單次晴天和「70% 下雨」並不矛盾。 我們需要許多條件相近的預測，才能判斷這個 70%
                是否可靠。
              </p>
            }
          </div>
        }
      </section>

      <section class="calibration-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">從一次結果，退後看一整群</p>
            <h3>那要怎麼評估一個 70% 預測？</h3>
          </div>
          <p>
            收集很多被預測為 70% 的相似日子。若模型校準良好
            （well-calibrated），其中下雨的比例應逐漸靠近 70%。
          </p>
        </div>

        <div class="sample-controls" role="group" aria-label="選擇觀察的案例數">
          @for (size of sampleSizes; track size) {
            <button
              type="button"
              [class.active]="sampleSize() === size"
              (click)="sampleSize.set(size)"
            >
              {{ size }} 天
            </button>
          }
        </div>

        <div class="calibration-panel">
          <div class="case-grid" [style.--columns]="gridColumns()">
            @for (didRain of outcomes(); track $index) {
              <span
                class="case"
                [class.rain]="didRain"
                [attr.aria-label]="didRain ? '下雨' : '晴天'"
                [title]="didRain ? '下雨' : '晴天'"
              >
                <span aria-hidden="true">{{ didRain ? '●' : '○' }}</span>
              </span>
            }
          </div>

          <div class="calibration-readout">
            <div class="readout-number">
              <strong>{{ rainyCount() }}</strong>
              <span>／{{ sampleSize() }} 天下雨</span>
            </div>
            <div class="readout-percent">{{ observedPercent() }}%</div>
            <div class="target-line">
              <span>觀察比例</span>
              <div class="mini-track">
                <i [style.width.%]="observedRate() * 100"></i>
                <b style="left: 70%"></b>
              </div>
              <span>模型 70%</span>
            </div>
          </div>
        </div>

        <p class="observe">
          案例少時，觀察比例可能離 70% 很遠。案例變多後，我們才逐漸有能力分辨：
          這是正常波動，還是模型長期把權重放錯了位置。
        </p>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span class="before">?</span>
          <span class="arrow">→</span>
          <span class="split"><i></i><b></b></span>
          <span class="arrow">→</span>
          <span class="after">☀</span>
        </div>
        <div>
          <span class="card-label">帶走這個模型</span>
          <p>
            <strong>機率不是預言。</strong>
            它是在答案揭曉前，替仍可能發生的世界分配權重。
          </p>
        </div>
      </aside>

      <section class="transfer">
        <h3>換一個情境，模型還適用嗎？</h3>
        <p>
          一個 API 宣稱單次請求成功率為 99%。你送出一次請求，剛好失敗了。
          這一次失敗是否足以證明「99%」一定是假的？
        </p>
        <div class="choices compact" role="group" aria-label="API 情境判斷">
          <button
            type="button"
            [class.selected]="transferAnswer() === 'broken'"
            (click)="transferAnswer.set('broken')"
          >
            足以證明
          </button>
          <button
            type="button"
            [class.selected]="transferAnswer() === 'possible'"
            (click)="transferAnswer.set('possible')"
          >
            還不能證明
          </button>
        </div>
        @if (transferAnswer()) {
          <p class="transfer-feedback" aria-live="polite">
            @if (transferAnswer() === 'possible') {
              沒錯。1% 不是 0%；要檢驗宣稱，需要觀察許多可比較的請求，以及失敗是否約占 1%。
            } @else {
              還差一步：99% 仍允許約 1% 的失敗。單次失敗很值得調查，但邏輯上尚未否定模型。
            }
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>嚴格一點：什麼是 calibration？</summary>
        <div>
          <p>
            機率預測的校準（calibration）比較的是一群預測，而不是一個事件： 在所有預測值接近 70%
            的案例中，事件發生的長期比例也應接近 70%。
          </p>
          <p>
            calibration 並不是好模型的全部。一個永遠報告基準比例的模型可能校準良好，
            卻沒有辨別能力（discrimination）。我們現在只先建立「不能用單一 outcome 判決一個
            probability」這個地基。
          </p>
        </div>
      </details>
    </article>
  `,
  styles: `
    :host {
      display: block;
      --rain: #6f92ad;
      --rain-soft: color-mix(in srgb, var(--rain) 18%, transparent);
      --clear: #d19c55;
      --clear-soft: color-mix(in srgb, var(--clear) 20%, transparent);
      --success: #668c70;
    }

    .lesson {
      display: grid;
      gap: 28px;
    }
    .hero {
      padding: 12px 0 2px;
    }
    .eyebrow {
      margin: 0 0 7px;
      color: var(--accent);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    h2,
    h3,
    p {
      margin-top: 0;
    }
    h2 {
      margin-bottom: 12px;
      font-size: clamp(28px, 6vw, 42px);
      line-height: 1.12;
      letter-spacing: -0.04em;
    }
    h3 {
      margin-bottom: 8px;
      font-size: 19px;
      line-height: 1.35;
    }
    .lede {
      max-width: 610px;
      margin-bottom: 0;
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.8;
    }

    .forecast-scene {
      padding: clamp(18px, 4vw, 30px);
      border: 1px solid var(--border);
      border-radius: 22px;
      background:
        radial-gradient(circle at 12% 0%, var(--rain-soft), transparent 38%), var(--bg-surface);
    }
    .weather-card {
      display: inline-flex;
      align-items: center;
      gap: 13px;
      padding: 11px 16px;
      border: 1px solid color-mix(in srgb, var(--rain) 32%, var(--border));
      border-radius: 14px;
      background: var(--bg);
    }
    .weather-icon {
      font-size: 31px;
      line-height: 1;
    }
    .weather-label {
      display: block;
      color: var(--text-muted);
      font-size: 11px;
    }
    .weather-card strong {
      display: block;
      color: var(--rain);
      font-size: 27px;
      line-height: 1.05;
    }
    .question {
      margin-top: 24px;
    }
    .question p {
      margin-bottom: 13px;
      color: var(--text);
      font-size: 17px;
      font-weight: 600;
      line-height: 1.55;
    }

    .choices {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }
    .choices button,
    .sample-controls button {
      min-height: 42px;
      padding: 9px 14px;
      border: 1px solid var(--border-strong);
      border-radius: 10px;
      background: var(--bg);
      color: var(--text-secondary);
      cursor: pointer;
      font: inherit;
      font-size: 13px;
      font-weight: 650;
      transition:
        background 0.18s ease,
        border-color 0.18s ease,
        color 0.18s ease,
        transform 0.18s ease;
    }
    button:hover {
      border-color: var(--accent);
      color: var(--text);
    }
    button:focus-visible {
      outline: 3px solid var(--accent-30);
      outline-offset: 3px;
    }
    .choices button.selected,
    .sample-controls button.active {
      border-color: var(--accent);
      background: var(--accent-18);
      color: var(--text);
    }
    .choices button:active,
    .sample-controls button:active {
      transform: translateY(1px);
    }

    .reveal {
      margin-top: 25px;
    }
    .probability-strip {
      position: relative;
      display: grid;
      grid-template-columns: 7fr 3fr;
      height: 94px;
      overflow: visible;
      border: 1px solid var(--border-strong);
      border-radius: 14px;
      background: var(--bg);
    }
    .rain-region,
    .clear-region {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rain-region {
      border-radius: 13px 0 0 13px;
      background: var(--rain-soft);
      color: var(--rain);
    }
    .clear-region {
      border-left: 2px dashed var(--border-strong);
      border-radius: 0 13px 13px 0;
      background: var(--clear-soft);
      color: var(--clear);
    }
    .rain-region span,
    .clear-region span {
      font-size: 12px;
      font-weight: 750;
    }
    .outcome-marker {
      position: absolute;
      left: 84%;
      top: -12px;
      width: 2px;
      height: 118px;
      background: var(--text);
    }
    .outcome-marker::after {
      content: '';
      position: absolute;
      left: -5px;
      bottom: -1px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--text);
      box-shadow: 0 0 0 4px var(--bg-surface);
    }
    .outcome-marker span {
      position: absolute;
      top: -17px;
      left: 50%;
      translate: -50% -100%;
      width: max-content;
      color: var(--text);
      font-size: 10px;
      font-weight: 700;
    }
    .feedback {
      margin: 27px 0 0;
      padding: 13px 15px;
      border-left: 3px solid;
      border-radius: 0 10px 10px 0;
      font-size: 14px;
      line-height: 1.7;
    }
    .feedback.misconception {
      border-color: var(--clear);
      background: var(--clear-soft);
    }
    .feedback.correct {
      border-color: var(--success);
      background: color-mix(in srgb, var(--success) 12%, transparent);
    }

    .section-heading {
      display: grid;
      grid-template-columns: minmax(0, 0.8fr) minmax(260px, 1.2fr);
      gap: 24px;
      align-items: end;
    }
    .section-heading p:last-child {
      margin-bottom: 8px;
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.7;
    }
    .sample-controls {
      display: flex;
      gap: 7px;
      margin: 14px 0 10px;
    }
    .sample-controls button {
      min-height: 36px;
      padding: 6px 12px;
    }
    .calibration-panel {
      display: grid;
      grid-template-columns: minmax(260px, 1.1fr) minmax(210px, 0.9fr);
      gap: 18px;
      padding: 18px;
      border: 1px solid var(--border);
      border-radius: 18px;
      background: var(--bg-surface);
    }
    .case-grid {
      display: grid;
      grid-template-columns: repeat(var(--columns), minmax(12px, 1fr));
      align-content: center;
      gap: 4px;
      min-height: 152px;
      padding: 13px;
      border-radius: 12px;
      background: var(--bg);
    }
    .case {
      display: grid;
      place-items: center;
      aspect-ratio: 1;
      min-width: 0;
      border: 1px solid color-mix(in srgb, var(--clear) 50%, transparent);
      border-radius: 50%;
      color: var(--clear);
      font-size: clamp(7px, 1.6vw, 13px);
      line-height: 1;
    }
    .case.rain {
      border-color: var(--rain);
      background: var(--rain);
      color: var(--bg);
    }
    .calibration-readout {
      align-self: center;
    }
    .readout-number strong {
      color: var(--rain);
      font-size: 34px;
      line-height: 1;
    }
    .readout-number span {
      color: var(--text-secondary);
      font-size: 13px;
    }
    .readout-percent {
      margin: 5px 0 18px;
      color: var(--text-muted);
      font-size: 14px;
    }
    .target-line {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 6px 10px;
      color: var(--text-muted);
      font-size: 10px;
    }
    .target-line span:last-child {
      grid-column: 2;
      justify-self: end;
    }
    .mini-track {
      position: relative;
      height: 8px;
      overflow: visible;
      border-radius: 999px;
      background: var(--bg-elevated);
    }
    .mini-track i {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: var(--rain);
    }
    .mini-track b {
      position: absolute;
      top: -4px;
      width: 2px;
      height: 16px;
      background: var(--text);
    }
    .observe {
      margin: 12px 0 0;
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.65;
    }

    .insight-card {
      display: grid;
      grid-template-columns: minmax(170px, 0.65fr) minmax(260px, 1.35fr);
      gap: 22px;
      align-items: center;
      padding: 22px;
      border: 1px solid var(--accent-30);
      border-radius: 18px;
      background: linear-gradient(135deg, var(--accent-10), transparent);
    }
    .insight-visual {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .before,
    .after {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border: 1px solid var(--border-strong);
      border-radius: 50%;
      background: var(--bg);
      font-size: 20px;
    }
    .arrow {
      color: var(--text-muted);
    }
    .split {
      display: flex;
      width: 64px;
      height: 36px;
      overflow: hidden;
      border: 1px solid var(--border-strong);
      border-radius: 8px;
    }
    .split i {
      flex: 7;
      background: var(--rain-soft);
    }
    .split b {
      flex: 3;
      border-left: 1px dashed var(--border-strong);
      background: var(--clear-soft);
    }
    .card-label {
      color: var(--accent);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .insight-card p {
      margin: 5px 0 0;
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.7;
    }
    .insight-card strong {
      color: var(--text);
    }

    .transfer {
      padding-top: 3px;
    }
    .transfer > p {
      color: var(--text-secondary);
      line-height: 1.7;
    }
    .choices.compact button {
      min-height: 38px;
      padding: 7px 12px;
    }
    .transfer-feedback {
      margin: 12px 0 0;
      color: var(--text);
      font-size: 13px;
      line-height: 1.65;
    }

    .deep-dive {
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .deep-dive summary {
      padding: 15px 2px;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
    }
    .deep-dive summary:focus-visible {
      outline: 3px solid var(--accent-30);
      outline-offset: 3px;
    }
    .deep-dive div {
      padding: 0 4px 7px 22px;
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.7;
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none !important;
      }
    }
  `,
})
export class ProbV2ProbabilityNotProphecyComponent {
  readonly sampleSizes = [10, 50, 100] as const;
  readonly forecastAnswer = signal<ForecastAnswer | null>(null);
  readonly transferAnswer = signal<TransferAnswer | null>(null);
  readonly sampleSize = signal<(typeof this.sampleSizes)[number]>(10);

  readonly outcomes = computed(() => bernoulliTrials(this.sampleSize(), 0.7, 20260731));
  readonly rainyCount = computed(() => this.outcomes().filter(Boolean).length);
  readonly observedRate = computed(() => this.rainyCount() / this.sampleSize());
  readonly observedPercent = computed(() => Math.round(this.observedRate() * 100));
  readonly gridColumns = computed(() => (this.sampleSize() === 10 ? 5 : 10));
}
