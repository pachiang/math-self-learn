import { Component, computed, signal } from '@angular/core';
import { bernoulliTrials } from './probability-v2-random';

interface SampleWorld {
  id: number;
  heads: number;
  proportion: number;
  row: number;
}

@Component({
  selector: 'app-prob-v2-long-run-pattern',
  standalone: true,
  template: `
    <article class="lesson">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 1.3</p>
        <h2>規律不在每一步，而在很多世界的形狀裡</h2>
        <p class="lede">
          公平硬幣的正面權重一直是 50%。但觀察到的正面比例， 要等資料累積後才通常靠近
          50%。我們來同時看 36 個平行世界。
        </p>
      </header>

      <section class="experiment">
        <div class="experiment-header">
          <div>
            <p class="eyebrow">每個世界都使用同一枚公平硬幣</p>
            <h3>投擲次數增加時，36 個世界如何重新聚集？</h3>
          </div>
          <div class="trial-controls" role="group" aria-label="選擇每個世界的投擲次數">
            @for (count of trialCounts; track count) {
              <button
                type="button"
                [class.active]="trialCount() === count"
                (click)="trialCount.set(count)"
              >
                {{ count }} 次
              </button>
            }
          </div>
        </div>

        <div class="distribution" aria-labelledby="distribution-caption">
          <div class="distribution-axis" aria-hidden="true">
            <span>0%</span>
            <span>25%</span>
            <span class="theory-label">理論值 50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          <div class="dot-field">
            <div class="theory-line" aria-hidden="true"></div>
            @for (world of worlds(); track world.id) {
              <span
                class="world-dot"
                [style.left.%]="world.proportion * 100"
                [style.top.px]="world.row * 11 + 4"
                [attr.aria-label]="
                  '世界 ' + (world.id + 1) + '：正面比例 ' + formatPercent(world.proportion)
                "
                [title]="
                  '世界 ' + (world.id + 1) + ' · ' + world.heads + '/' + trialCount() + ' 正面'
                "
              ></span>
            }
          </div>
          <div class="spread-summary" id="distribution-caption">
            <div>
              <span>最低</span>
              <strong>{{ formatPercent(minimum()) }}</strong>
            </div>
            <div>
              <span>36 個世界的平均</span>
              <strong>{{ formatPercent(average()) }}</strong>
            </div>
            <div>
              <span>最高</span>
              <strong>{{ formatPercent(maximum()) }}</strong>
            </div>
          </div>
        </div>

        <p class="observe">
          @if (trialCount() <= 50) {
            現在世界之間仍很分散。公平模型完全允許某些短期世界非常偏斜。
          } @else {
            點群正在向 50% 收窄。不是每個世界都剛好一半，而是大幅偏離的世界變少了。
          }
        </p>
      </section>

      <section class="path-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">別只看終點</p>
            <h3>一個世界，是怎麼慢慢靠近 50% 的？</h3>
          </div>
          <button type="button" class="new-path" (click)="nextPath()">換一條路徑</button>
        </div>

        <div class="path-chart">
          <svg
            viewBox="0 0 640 230"
            role="img"
            [attr.aria-label]="
              '累計投擲 ' +
              trialCount() +
              ' 次的正面比例路徑，最後為 ' +
              formatPercent(pathFinalProportion())
            "
          >
            <line x1="36" y1="30" x2="36" y2="196" class="axis" />
            <line x1="36" y1="196" x2="620" y2="196" class="axis" />
            <line x1="36" y1="113" x2="620" y2="113" class="theory" />
            <text x="29" y="34" text-anchor="end" class="tick">100%</text>
            <text x="29" y="117" text-anchor="end" class="tick theory-text">50%</text>
            <text x="29" y="200" text-anchor="end" class="tick">0%</text>
            <text x="36" y="216" class="tick">1</text>
            <text x="620" y="216" text-anchor="end" class="tick">{{ trialCount() }} 次</text>
            <path [attr.d]="pathData()" class="sample-path" />
            <circle cx="620" [attr.cy]="pathFinalY()" r="5" class="endpoint" />
          </svg>
          <div class="path-legend">
            <span><i class="path-key"></i>這個世界的累計正面比例</span>
            <span><i class="theory-key"></i>模型的 50% 權重</span>
          </div>
        </div>

        <p class="observe">
          路徑不會平滑地朝 50% 前進，也可能暫時離得更遠。
          「通常更靠近」描述的是許多可能路徑的整體趨勢，不是每一步都必須改善。
        </p>
      </section>

      <section class="dilution-card">
        <div class="dilution-visual">
          <div class="stage early">
            <span>前 10 次</span>
            <strong>8 / 10</strong>
            <b>80%</b>
          </div>
          <div class="plus" aria-hidden="true">＋</div>
          <div class="stage new-data">
            <span>再來 90 次</span>
            <strong>45 / 90</strong>
            <b>50%</b>
          </div>
          <div class="arrow" aria-hidden="true">→</div>
          <div class="stage total">
            <span>合在一起</span>
            <strong>53 / 100</strong>
            <b>53%</b>
          </div>
        </div>
        <div class="dilution-copy">
          <p class="eyebrow">不是補償，是稀釋</p>
          <h3>硬幣沒有「還」三次反面</h3>
          <p>
            前十次的偶然偏差仍然存在，只是它在一百次資料裡占的比例變小了。
            長期穩定來自新資料逐漸稀釋早期波動，不是未來在修正過去。
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="funnel" aria-hidden="true">
          <span class="wide"></span>
          <span class="mid"></span>
          <span class="narrow"></span>
          <i></i>
        </div>
        <p>
          <strong>機率描述的是可能路徑的整體形狀。</strong>
          短期可以很亂；資料增加時，比例的散布才通常逐漸收窄。
        </p>
      </aside>

      <section class="checkpoint">
        <h3>第一章的三層區分</h3>
        <div class="checkpoint-grid">
          <div>
            <span class="number">1</span>
            <strong>模型權重</strong>
            <p>公平硬幣每次正面是 50%。</p>
          </div>
          <div>
            <span class="number">2</span>
            <strong>單次結果</strong>
            <p>這一次只會是 H 或 T。</p>
          </div>
          <div>
            <span class="number">3</span>
            <strong>累計比例</strong>
            <p>短期波動，長期通常靠近模型權重。</p>
          </div>
        </div>
      </section>

      <details class="deep-dive">
        <summary>定理預告：Law of Large Numbers 到底說什麼？</summary>
        <div>
          <p>
            大數法則（Law of Large Numbers, LLN）的典型版本說：
            在獨立、同分布且期望值存在等條件下，樣本平均會以特定意義收斂到期望值。
          </p>
          <p>
            對 Bernoulli trials 而言，樣本平均就是成功比例，所以公平硬幣的正面比例會靠近
            0.5。定理沒有說有限次後必定等於 0.5，也沒有說偏高後下一次就更容易偏低。 Ch15 會區分 weak
            LLN、strong LLN 與「收斂」的精確意思。
          </p>
        </div>
      </details>
    </article>
  `,
  styles: `
    :host {
      display: block;
      --path: #b77d69;
      --path-soft: color-mix(in srgb, var(--path) 16%, transparent);
      --theory: #6f92ad;
      --theory-soft: color-mix(in srgb, var(--theory) 17%, transparent);
    }
    .lesson {
      display: grid;
      gap: 30px;
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
      max-width: 630px;
      margin-bottom: 0;
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.8;
    }

    .experiment {
      padding: clamp(18px, 4vw, 28px);
      border: 1px solid var(--border);
      border-radius: 22px;
      background: var(--bg-surface);
    }
    .experiment-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 18px;
    }
    .trial-controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 6px;
    }
    .trial-controls button,
    .new-path {
      min-height: 38px;
      padding: 7px 12px;
      border: 1px solid var(--border-strong);
      border-radius: 9px;
      background: var(--bg);
      color: var(--text-secondary);
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      transition:
        background 0.18s ease,
        border-color 0.18s ease,
        color 0.18s ease,
        transform 0.18s ease;
    }
    .trial-controls button:hover,
    .new-path:hover {
      border-color: var(--accent);
      color: var(--text);
    }
    .trial-controls button.active {
      border-color: var(--accent);
      background: var(--accent-18);
      color: var(--text);
    }
    button:focus-visible,
    summary:focus-visible {
      outline: 3px solid var(--accent-30);
      outline-offset: 3px;
    }
    button:active {
      transform: translateY(1px);
    }

    .distribution {
      margin-top: 18px;
    }
    .distribution-axis {
      position: relative;
      display: flex;
      justify-content: space-between;
      height: 22px;
      color: var(--text-muted);
      font-size: 9px;
    }
    .distribution-axis span:nth-child(2),
    .distribution-axis span:nth-child(4) {
      position: absolute;
    }
    .distribution-axis span:nth-child(2) {
      left: 25%;
      translate: -50% 0;
    }
    .distribution-axis span:nth-child(4) {
      left: 75%;
      translate: -50% 0;
    }
    .theory-label {
      position: absolute;
      left: 50%;
      translate: -50% 0;
      color: var(--theory);
      font-weight: 750;
    }
    .dot-field {
      position: relative;
      height: 104px;
      margin: 0 5px;
      border-left: 1px solid var(--border-strong);
      border-right: 1px solid var(--border-strong);
      background: linear-gradient(
        to right,
        transparent 24.8%,
        var(--border) 25%,
        transparent 25.2%,
        transparent 74.8%,
        var(--border) 75%,
        transparent 75.2%
      );
    }
    .theory-line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      translate: -1px 0;
      background: var(--theory);
      opacity: 0.65;
    }
    .world-dot {
      position: absolute;
      width: 10px;
      height: 10px;
      translate: -50% 0;
      border: 1px solid color-mix(in srgb, var(--path) 75%, var(--bg));
      border-radius: 50%;
      background: var(--path);
      box-shadow: 0 0 0 2px var(--bg-surface);
      transition:
        left 0.35s ease,
        top 0.35s ease;
    }
    .spread-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 7px;
      margin-top: 12px;
    }
    .spread-summary div {
      padding: 9px;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: var(--bg);
      text-align: center;
    }
    .spread-summary span {
      display: block;
      color: var(--text-muted);
      font-size: 9px;
    }
    .spread-summary strong {
      color: var(--text);
      font-size: 14px;
    }
    .observe {
      margin: 13px 0 0;
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.7;
    }

    .section-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 12px;
    }
    .new-path {
      flex: 0 0 auto;
      border-color: var(--accent-30);
      background: var(--accent-10);
      color: var(--text);
    }
    .path-chart {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: var(--bg-surface);
    }
    .path-chart svg {
      display: block;
      width: 100%;
      overflow: visible;
    }
    .axis {
      stroke: var(--border-strong);
      stroke-width: 1;
    }
    .theory {
      stroke: var(--theory);
      stroke-width: 1.5;
      stroke-dasharray: 6 5;
    }
    .tick {
      fill: var(--text-muted);
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
    }
    .theory-text {
      fill: var(--theory);
    }
    .sample-path {
      fill: none;
      stroke: var(--path);
      stroke-width: 2.25;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .endpoint {
      fill: var(--path);
      stroke: var(--bg-surface);
      stroke-width: 3;
    }
    .path-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      color: var(--text-muted);
      font-size: 9px;
    }
    .path-legend span {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .path-key,
    .theory-key {
      display: inline-block;
      width: 16px;
      height: 2px;
    }
    .path-key {
      background: var(--path);
    }
    .theory-key {
      border-top: 2px dashed var(--theory);
    }

    .dilution-card {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 25px;
      align-items: center;
    }
    .dilution-visual {
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr;
      gap: 7px;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: var(--bg-surface);
    }
    .stage {
      display: grid;
      gap: 2px;
      justify-items: center;
      padding: 10px 5px;
      border-radius: 10px;
      background: var(--bg);
      text-align: center;
    }
    .stage span {
      color: var(--text-muted);
      font-size: 8px;
    }
    .stage strong {
      color: var(--text);
      font-size: 13px;
    }
    .stage b {
      color: var(--path);
      font-size: 18px;
    }
    .stage.new-data b,
    .stage.total b {
      color: var(--theory);
    }
    .plus,
    .arrow {
      color: var(--text-muted);
    }
    .dilution-copy p:last-child {
      margin-bottom: 0;
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.7;
    }

    .insight-card {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 24px;
      align-items: center;
      padding: 22px;
      border: 1px solid var(--accent-30);
      border-radius: 18px;
      background: linear-gradient(135deg, var(--accent-10), transparent);
    }
    .funnel {
      position: relative;
      display: grid;
      gap: 9px;
      justify-items: center;
      padding: 8px;
    }
    .funnel span {
      display: block;
      height: 7px;
      border-radius: 999px;
      background: var(--path-soft);
      border: 1px solid color-mix(in srgb, var(--path) 45%, transparent);
    }
    .funnel .wide {
      width: 150px;
    }
    .funnel .mid {
      width: 96px;
    }
    .funnel .narrow {
      width: 44px;
    }
    .funnel i {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      translate: -1px 0;
      background: var(--theory);
    }
    .insight-card p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.7;
    }
    .insight-card strong {
      color: var(--text);
    }

    .checkpoint h3 {
      margin-bottom: 12px;
    }
    .checkpoint-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
    }
    .checkpoint-grid > div {
      position: relative;
      padding: 15px;
      border: 1px solid var(--border);
      border-radius: 13px;
      background: var(--bg-surface);
    }
    .checkpoint-grid .number {
      display: grid;
      place-items: center;
      width: 23px;
      height: 23px;
      margin-bottom: 9px;
      border-radius: 50%;
      background: var(--accent-18);
      color: var(--accent);
      font-size: 10px;
      font-weight: 800;
    }
    .checkpoint-grid strong {
      color: var(--text);
      font-size: 13px;
    }
    .checkpoint-grid p {
      margin: 5px 0 0;
      color: var(--text-secondary);
      font-size: 11px;
      line-height: 1.55;
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
    .deep-dive div {
      padding: 0 4px 7px 22px;
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.7;
    }

    @media (prefers-reduced-motion: reduce) {
      button,
      .world-dot {
        transition: none !important;
      }
    }
  `,
})
export class ProbV2LongRunPatternComponent {
  readonly trialCounts = [10, 50, 200, 1000] as const;
  readonly trialCount = signal<(typeof this.trialCounts)[number]>(10);
  readonly pathGeneration = signal(0);

  readonly worlds = computed<SampleWorld[]>(() => {
    const stackByHeads = new Map<number, number>();

    return Array.from({ length: 36 }, (_, id) => {
      const flips = bernoulliTrials(this.trialCount(), 0.5, 4103 + id * 131);
      const heads = flips.filter(Boolean).length;
      const row = stackByHeads.get(heads) ?? 0;
      stackByHeads.set(heads, row + 1);

      return {
        id,
        heads,
        proportion: heads / this.trialCount(),
        row,
      };
    });
  });

  readonly minimum = computed(() => Math.min(...this.worlds().map((world) => world.proportion)));
  readonly maximum = computed(() => Math.max(...this.worlds().map((world) => world.proportion)));
  readonly average = computed(
    () => this.worlds().reduce((sum, world) => sum + world.proportion, 0) / this.worlds().length,
  );

  readonly pathFlips = computed(() =>
    bernoulliTrials(this.trialCount(), 0.5, 8807 + this.pathGeneration() * 173),
  );

  readonly pathProportions = computed(() => {
    let heads = 0;
    return this.pathFlips().map((flip, index) => {
      if (flip) heads += 1;
      return heads / (index + 1);
    });
  });

  readonly pathFinalProportion = computed(() => this.pathProportions().at(-1) ?? 0);
  readonly pathFinalY = computed(() => this.proportionToY(this.pathFinalProportion()));
  readonly pathData = computed(() => {
    const values = this.pathProportions();
    const lastIndex = Math.max(values.length - 1, 1);
    const maxPoints = 320;
    const step = Math.max(1, Math.ceil(values.length / maxPoints));
    const points: string[] = [];

    for (let index = 0; index < values.length; index += step) {
      const x = 36 + (index / lastIndex) * 584;
      const y = this.proportionToY(values[index]);
      points.push(`${points.length === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }

    if ((values.length - 1) % step !== 0) {
      points.push(`L 620 ${this.proportionToY(values.at(-1) ?? 0).toFixed(2)}`);
    }

    return points.join(' ');
  });

  nextPath(): void {
    this.pathGeneration.update((value) => value + 1);
  }

  formatPercent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  private proportionToY(proportion: number): number {
    return 196 - proportion * 166;
  }
}
