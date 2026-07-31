import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type BallColor = 'R' | 'B';
type ReplacementMode = 'with' | 'without';

@Component({
  selector: 'app-prob-v2-replacement-world',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch5">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 5.3</p>
        <h2>放不放回，改變的是下一層 branch 看見的世界</h2>
        <p class="lede">
          <strong>有放回（with replacement）</strong>會把袋子恢復原狀；
          <strong>不放回（without replacement）</strong>則讓第一抽永久改變袋中組成。 branch
          名稱相同，weights 卻可能不同。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">固定起點 · 3 紅 2 藍</p>
            <h3>先指定第一抽，再決定要不要把球放回</h3>
          </div>
          <div class="preset-row" role="group" aria-label="選擇放回模式">
            <button
              type="button"
              [class.active]="mode() === 'without'"
              (click)="mode.set('without')"
            >
              Without replacement
            </button>
            <button type="button" [class.active]="mode() === 'with'" (click)="mode.set('with')">
              With replacement
            </button>
          </div>
        </div>
        <div class="choice-row" role="group" aria-label="選擇第一抽結果">
          <button type="button" [class.selected]="firstDraw() === 'R'" (click)="firstDraw.set('R')">
            第一抽是紅球
          </button>
          <button type="button" [class.selected]="firstDraw() === 'B'" (click)="firstDraw.set('B')">
            第一抽是藍球
          </button>
        </div>
      </section>

      <section class="replacement-board">
        <div class="bag-state">
          <p class="eyebrow">第二抽之前，袋中的真實狀態</p>
          <h3>{{ stateTitle() }}</h3>
          <div class="ball-rack" aria-label="第二次抽球前袋中的球">
            @for (_ of redBalls(); track $index) {
              <span class="draw-ball">R</span>
            }
            @for (_ of blueBalls(); track $index) {
              <span class="draw-ball blue">B</span>
            }
          </div>
          <div class="state-equation">
            <div>
              <span>第二抽前紅球數</span>
              <strong>{{ redCount() }}</strong>
            </div>
            <i>/</i>
            <div>
              <span>袋中總球數</span>
              <strong>{{ totalCount() }}</strong>
            </div>
          </div>
          <p class="feedback">
            第二抽紅球的 branch weight 是
            <strong>{{ redCount() }} / {{ totalCount() }}</strong
            >。
            {{ stateExplanation() }}
          </p>
        </div>

        <div class="leaf-distribution">
          <p class="eyebrow">完整 tree 的 leaf weights</p>
          <h3>
            {{
              mode() === 'with'
                ? '放回後，第二層重新使用 3/5 與 2/5'
                : '不放回時，第二層依第一抽分別改寫'
            }}
          </h3>
          <div class="leaf-bars" aria-label="四個完整 paths 的 probability distribution">
            @for (leaf of leafProbabilities(); track leaf.path) {
              <div class="leaf-bar">
                <div class="leaf-bar-track">
                  <i class="leaf-bar-fill" [style.height.%]="leaf.probability * 250"></i>
                </div>
                <strong>{{ leaf.path }}</strong>
                <span>{{ fraction(leaf.probability) }} · {{ percent(leaf.probability) }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="operation-map" aria-hidden="true">
          <div>
            <span>With replacement</span>
            <strong>下一層看見原袋子</strong>
          </div>
          <i>vs</i>
          <div>
            <span>Without replacement</span>
            <strong>下一層看見被改變的袋子</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Tree 結構相同，不代表 branch weights 相同</span>
          <p>
            <strong>生成過程若改變當下世界，下一個 branch 的 fraction 就必須跟著改。</strong>
            不要因為兩次都叫「抽球」，便沿用第一次的 3/5。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>數值層：兩種模型的四個 leaf probabilities</summary>
        <div>
          <p>With replacement：</p>
          <div class="math-line">
            <app-math
              e="P(RR)=\\frac35\\frac35=\\frac9{25},\\quad P(RB)=P(BR)=\\frac6{25},\\quad P(BB)=\\frac4{25}"
            />
          </div>
          <p>Without replacement：</p>
          <div class="math-line">
            <app-math
              e="P(RR)=\\frac35\\frac24=\\frac3{10},\\quad P(RB)=P(BR)=\\frac3{10},\\quad P(BB)=\\frac1{10}"
            />
          </div>
          <p>
            「放回後第二層比例不變」之後會用 independence 正式描述；
            此處先從實際生成機制判斷，不提前把名稱當作理由。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ReplacementWorldComponent {
  readonly mode = signal<ReplacementMode>('without');
  readonly firstDraw = signal<BallColor>('R');
  readonly redCount = computed(() => {
    if (this.mode() === 'with') return 3;
    return this.firstDraw() === 'R' ? 2 : 3;
  });
  readonly blueCount = computed(() => {
    if (this.mode() === 'with') return 2;
    return this.firstDraw() === 'B' ? 1 : 2;
  });
  readonly totalCount = computed(() => this.redCount() + this.blueCount());
  readonly redBalls = computed(() => Array.from({ length: this.redCount() }));
  readonly blueBalls = computed(() => Array.from({ length: this.blueCount() }));
  readonly stateTitle = computed(() => {
    if (this.mode() === 'with') {
      return `第一抽 ${this.firstDraw()} 放回後：袋子恢復成 3 紅 2 藍`;
    }
    return this.firstDraw() === 'R'
      ? '紅球離開袋子：剩下 2 紅 2 藍'
      : '藍球離開袋子：剩下 3 紅 1 藍';
  });
  readonly stateExplanation = computed(() =>
    this.mode() === 'with'
      ? '第一抽沒有改變第二層的袋中組成。'
      : '分母與顏色數量都必須依第一抽結果更新。',
  );
  readonly leafProbabilities = computed(() => {
    if (this.mode() === 'with') {
      return [
        { path: 'RR', probability: 9 / 25 },
        { path: 'RB', probability: 6 / 25 },
        { path: 'BR', probability: 6 / 25 },
        { path: 'BB', probability: 4 / 25 },
      ];
    }
    return [
      { path: 'RR', probability: 3 / 10 },
      { path: 'RB', probability: 3 / 10 },
      { path: 'BR', probability: 3 / 10 },
      { path: 'BB', probability: 1 / 10 },
    ];
  });

  percent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  fraction(value: number): string {
    const lookup: Record<string, string> = {
      '0.36': '9/25',
      '0.24': '6/25',
      '0.16': '4/25',
      '0.30': '3/10',
      '0.10': '1/10',
    };
    return lookup[value.toFixed(2)];
  }
}
