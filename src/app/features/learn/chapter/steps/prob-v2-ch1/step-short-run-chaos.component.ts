import { Component, computed, signal } from '@angular/core';
import { bernoulliTrials, longestRun } from './probability-v2-random';

type SequenceAnswer = 'alternating' | 'clustered' | 'mixed' | 'same';

interface CoinWorld {
  flips: boolean[];
  heads: number;
  longestRun: number;
}

@Component({
  selector: 'app-prob-v2-short-run-chaos',
  standalone: true,
  template: `
    <article class="lesson">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 1.2</p>
        <h2>公平，不代表看起來很平均</h2>
        <p class="lede">
          一枚公平硬幣（fair coin）只承諾每一次正反面的權重相同。
          它沒有承諾短序列一定交替，也沒有承諾每十次都剛好五比五。
        </p>
      </header>

      <section class="prediction-card">
        <div class="question-copy">
          <p class="eyebrow">先別計算，先看你的直覺</p>
          <h3>下面三條完整序列，哪一條最不可能由公平硬幣產生？</h3>
          <p>每條都是 12 次投擲；H 是正面，T 是反面。</p>
        </div>

        <div class="sequence-options" role="group" aria-label="選擇最不可能的硬幣序列">
          @for (sequence of candidateSequences; track sequence.id) {
            <button
              type="button"
              [class.selected]="sequenceAnswer() === sequence.id"
              (click)="sequenceAnswer.set(sequence.id)"
            >
              <span class="option-label">{{ sequence.label }}</span>
              <span class="coin-sequence" aria-hidden="true">
                @for (flip of sequence.flips; track $index) {
                  <i [class.heads]="flip">{{ flip ? 'H' : 'T' }}</i>
                }
              </span>
              <span class="sr-only">{{ sequence.text }}</span>
            </button>
          }
          <button
            type="button"
            class="same-option"
            [class.selected]="sequenceAnswer() === 'same'"
            (click)="sequenceAnswer.set('same')"
          >
            三條完整序列一樣可能
          </button>
        </div>

        @if (sequenceAnswer()) {
          <div class="answer-reveal" aria-live="polite">
            @if (sequenceAnswer() === 'same') {
              <strong>答對了：如果每次獨立且公平，三條完整序列的機率相同。</strong>
            } @else {
              <strong>這正是短期隨機最容易欺騙直覺的地方。</strong>
            }
            <p>
              任何指定好的 12 次 H/T 序列，都需要連續命中 12 個各占一半的分支； 因此每一條的重量都是
              <span class="formula">1 / 2¹²</span>。 「看起來很亂」不是公平的必要條件。
            </p>
          </div>
        }
      </section>

      <section class="worlds-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">同一個生成規則，六個不同世界</p>
            <h3>按一次重生，再看短期能有多不整齊</h3>
          </div>
          <button type="button" class="regenerate" (click)="regenerate()">生成下一組</button>
        </div>

        <div class="worlds" aria-live="polite">
          @for (world of worlds(); track $index) {
            <div class="world">
              <span class="world-label">世界 {{ $index + 1 }}</span>
              <div
                class="coin-sequence world-sequence"
                [attr.aria-label]="sequenceLabel(world.flips)"
              >
                @for (flip of world.flips; track $index) {
                  <i [class.heads]="flip" aria-hidden="true">{{ flip ? 'H' : 'T' }}</i>
                }
              </div>
              <div class="world-stats">
                <span>{{ world.heads }} 正</span>
                <span>最長連續 {{ world.longestRun }}</span>
              </div>
            </div>
          }
        </div>

        <div class="reading-guide">
          <span>觀察：</span>
          有些世界接近 10:10，有些不是；有些會自然出現連續五、六次相同結果。
          它們使用的生成規則完全相同。
        </div>
      </section>

      <aside class="insight-card">
        <div class="model-side">
          <span>每一次</span>
          <div class="balance" aria-hidden="true">
            <i>H<br /><b>50%</b></i>
            <em></em>
            <i>T<br /><b>50%</b></i>
          </div>
        </div>
        <div class="not-equal" aria-hidden="true">≠</div>
        <div class="sequence-side">
          <span>每一小段</span>
          <div class="mini-sequence" aria-hidden="true">H H H H T H</div>
        </div>
        <p><strong>模型的公平</strong>描述每次生成時的權重， 不要求每一小段結果看起來平均。</p>
      </aside>

      <section class="misconception">
        <div class="streak-visual" aria-hidden="true">
          <i>H</i><i>H</i><i>H</i><i>H</i><i>H</i><b>?</b>
        </div>
        <div>
          <p class="eyebrow">一個重要陷阱</p>
          <h3>連續五次正面後，下一次更容易是反面嗎？</h3>
          <p>
            如果每次投擲彼此獨立（independent），答案仍是 50%。 過去的 streak
            不會讓硬幣欠你一次反面。這種「該輪到了」的感覺， 之後會正式稱為賭徒謬誤（gambler’s
            fallacy）。
          </p>
        </div>
      </section>

      <details class="deep-dive">
        <summary>為什麼每條指定序列一樣可能？</summary>
        <div>
          <p>
            在「公平且各次獨立」的模型中，每一步指定 H 或 T 都貢獻一個
            <span class="formula">1/2</span>。一條指定的 12 步路徑，因此有
            <span class="formula">(1/2)¹²</span> 的重量。
          </p>
          <p>
            但要小心問題的分類方式。「完全交替」只有兩條序列；
            「看起來有點混亂」可能包含大量序列。單一序列一樣重，
            不代表不同事件（序列集合）也一樣重。我們會在事件與計數章正式處理。
          </p>
        </div>
      </details>
    </article>
  `,
  styles: `
    :host {
      display: block;
      --heads: #b77d69;
      --heads-soft: color-mix(in srgb, var(--heads) 17%, transparent);
      --tails: #6f92ad;
      --tails-soft: color-mix(in srgb, var(--tails) 17%, transparent);
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
      font-weight: 750;
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
      line-height: 1.4;
    }
    .lede {
      max-width: 620px;
      margin-bottom: 0;
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.8;
    }

    .prediction-card {
      padding: clamp(18px, 4vw, 28px);
      border: 1px solid var(--border);
      border-radius: 22px;
      background: var(--bg-surface);
    }
    .question-copy > p:last-child {
      color: var(--text-muted);
      font-size: 12px;
    }
    .sequence-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
    }
    .sequence-options button {
      display: grid;
      gap: 9px;
      min-width: 0;
      min-height: 98px;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 13px;
      background: var(--bg);
      color: var(--text-secondary);
      cursor: pointer;
      font: inherit;
      text-align: left;
      transition:
        background 0.18s ease,
        border-color 0.18s ease,
        transform 0.18s ease;
    }
    .sequence-options button:hover {
      border-color: var(--accent);
    }
    .sequence-options button:focus-visible,
    .regenerate:focus-visible {
      outline: 3px solid var(--accent-30);
      outline-offset: 3px;
    }
    .sequence-options button.selected {
      border-color: var(--accent);
      background: var(--accent-18);
    }
    .sequence-options button:active,
    .regenerate:active {
      transform: translateY(1px);
    }
    .sequence-options .same-option {
      grid-column: 1 / -1;
      display: block;
      min-height: 42px;
      text-align: center;
      font-size: 13px;
      font-weight: 700;
    }
    .option-label {
      color: var(--text);
      font-size: 12px;
      font-weight: 800;
    }
    .coin-sequence {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .coin-sequence i {
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      border: 1px solid var(--tails);
      border-radius: 50%;
      background: var(--tails-soft);
      color: var(--tails);
      font-size: 9px;
      font-style: normal;
      font-weight: 800;
    }
    .coin-sequence i.heads {
      border-color: var(--heads);
      background: var(--heads-soft);
      color: var(--heads);
    }
    .answer-reveal {
      margin-top: 15px;
      padding: 14px 16px;
      border-left: 3px solid var(--accent);
      border-radius: 0 10px 10px 0;
      background: var(--accent-10);
    }
    .answer-reveal strong {
      color: var(--text);
      font-size: 14px;
    }
    .answer-reveal p {
      margin: 5px 0 0;
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.7;
    }
    .formula {
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 650;
    }

    .section-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 12px;
    }
    .regenerate {
      flex: 0 0 auto;
      min-height: 39px;
      padding: 7px 13px;
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      background: var(--accent-10);
      color: var(--text);
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
    }
    .worlds {
      display: grid;
      gap: 7px;
    }
    .world {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr) 118px;
      gap: 10px;
      align-items: center;
      padding: 9px 11px;
      border: 1px solid var(--border);
      border-radius: 11px;
      background: var(--bg-surface);
    }
    .world-label {
      color: var(--text-muted);
      font-size: 10px;
      font-weight: 700;
    }
    .world-sequence {
      flex-wrap: nowrap;
      gap: 2px;
      overflow: hidden;
    }
    .world-sequence i {
      width: clamp(12px, 2.35vw, 20px);
      height: clamp(12px, 2.35vw, 20px);
      flex: 0 1 20px;
      font-size: clamp(0px, 1.2vw, 8px);
    }
    .world-stats {
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      color: var(--text-muted);
      font-size: 9px;
    }
    .reading-guide {
      margin-top: 10px;
      padding: 11px 13px;
      color: var(--text-secondary);
      font-size: 12px;
      line-height: 1.65;
    }
    .reading-guide span {
      color: var(--accent);
      font-weight: 750;
    }

    .insight-card {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 14px;
      align-items: center;
      padding: 21px;
      border: 1px solid var(--accent-30);
      border-radius: 18px;
      background: linear-gradient(135deg, var(--accent-10), transparent);
    }
    .model-side,
    .sequence-side {
      display: grid;
      justify-items: center;
      gap: 8px;
      color: var(--text-muted);
      font-size: 10px;
      font-weight: 700;
    }
    .balance {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .balance i {
      display: grid;
      place-items: center;
      width: 51px;
      height: 51px;
      border: 1px solid var(--border-strong);
      border-radius: 50%;
      background: var(--bg);
      color: var(--text);
      font-style: normal;
    }
    .balance i:first-child {
      border-color: var(--heads);
    }
    .balance i:last-child {
      border-color: var(--tails);
    }
    .balance b {
      color: var(--text-muted);
      font-size: 9px;
    }
    .balance em {
      width: 24px;
      height: 2px;
      background: var(--text-muted);
    }
    .not-equal {
      color: var(--accent);
      font-size: 26px;
    }
    .mini-sequence {
      padding: 14px 10px;
      border: 1px solid var(--border-strong);
      border-radius: 10px;
      background: var(--bg);
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      white-space: nowrap;
    }
    .insight-card > p {
      grid-column: 1 / -1;
      margin: 2px auto 0;
      max-width: 520px;
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.7;
      text-align: center;
    }
    .insight-card strong {
      color: var(--text);
    }

    .misconception {
      display: grid;
      grid-template-columns: 0.8fr 1.2fr;
      gap: 24px;
      align-items: center;
    }
    .streak-visual {
      display: flex;
      justify-content: center;
      gap: 5px;
      padding: 23px 12px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: var(--bg-surface);
    }
    .streak-visual i,
    .streak-visual b {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 11px;
      font-style: normal;
    }
    .streak-visual i {
      border: 1px solid var(--heads);
      background: var(--heads-soft);
      color: var(--heads);
    }
    .streak-visual b {
      margin-left: 6px;
      border: 1px dashed var(--accent);
      color: var(--accent);
    }
    .misconception p:last-child {
      margin-bottom: 0;
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.7;
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
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none !important;
      }
    }
  `,
})
export class ProbV2ShortRunChaosComponent {
  readonly candidateSequences: {
    id: Exclude<SequenceAnswer, 'same'>;
    label: string;
    text: string;
    flips: boolean[];
  }[] = [
    {
      id: 'alternating',
      label: 'A · 完全交替',
      text: '正反正反正反正反正反正反',
      flips: this.parseSequence('HTHTHTHTHTHT'),
    },
    {
      id: 'clustered',
      label: 'B · 分成兩團',
      text: '六次正面後六次反面',
      flips: this.parseSequence('HHHHHHTTTTTT'),
    },
    {
      id: 'mixed',
      label: 'C · 看起來較亂',
      text: '正正反正反反反正正反反正',
      flips: this.parseSequence('HHTHTTTHHTTH'),
    },
  ];

  readonly sequenceAnswer = signal<SequenceAnswer | null>(null);
  readonly generation = signal(0);
  readonly worlds = computed<CoinWorld[]>(() =>
    Array.from({ length: 6 }, (_, index) => {
      const flips = bernoulliTrials(20, 0.5, 9301 + this.generation() * 97 + index * 17);
      return {
        flips,
        heads: flips.filter(Boolean).length,
        longestRun: longestRun(flips),
      };
    }),
  );

  regenerate(): void {
    this.generation.update((value) => value + 1);
  }

  sequenceLabel(flips: readonly boolean[]): string {
    return flips.map((flip) => (flip ? '正面' : '反面')).join('、');
  }

  private parseSequence(sequence: string): boolean[] {
    return [...sequence].map((value) => value === 'H');
  }
}
