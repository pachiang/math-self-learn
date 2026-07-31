import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type InformationState = 'none' | 'red' | 'blue';

@Component({
  selector: 'app-prob-v2-information-updates-bag',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch8">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 8.4</p>
        <h2>不放回時，第一抽的資訊會改變第二抽真正面對的袋子</h2>
        <p class="lede">
          Condition 不是題目旁邊的備註。知道第一抽顏色，就等於知道哪顆球已離開； 活著的 histories
          與第二抽的 sample space 都因此改變。
        </p>
      </header>

      <section class="scene">
        <div class="condition-prediction">
          <div>
            <p class="eyebrow">先預測 · 3 red, 2 blue · without replacement</p>
            <h3>已知第一抽是紅球，第二抽再抽到紅球的 probability 是多少？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測已知第一抽紅球後第二抽紅球的機率">
            @for (choice of ['3/5', '2/4', '3/4']; track choice) {
              <button
                type="button"
                [class.selected]="prediction() === choice"
                (click)="prediction.set(choice)"
              >
                {{ choice }}
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === '2/4') {
              <strong>對。</strong>一顆紅球已離開，第二抽前只剩 2 red、2 blue。
            } @else if (prediction() === '3/5') {
              3/5 是尚未知道第一抽時，第二個位置為紅球的 prior；given R 後袋子已不是原袋子。
            } @else {
              3/4 是已知第一抽為 blue 時才會看見的袋子：3 red、1 blue。
            }
          </p>
        }
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Information state</p>
            <h3>只切換你已知的資訊，觀察哪些 histories 還可能</h3>
          </div>
        </div>
        <div class="information-tabs" role="tablist" aria-label="選擇第一抽資訊狀態">
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="information() === 'none'"
            [class.active]="information() === 'none'"
            (click)="information.set('none')"
          >
            <strong>尚未知道第一抽</strong>
            <span>No information</span>
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="information() === 'red'"
            [class.active]="information() === 'red'"
            (click)="information.set('red')"
          >
            <strong>已知第一抽 red</strong>
            <span>Given R₁</span>
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="information() === 'blue'"
            [class.active]="information() === 'blue'"
            (click)="information.set('blue')"
          >
            <strong>已知第一抽 blue</strong>
            <span>Given B₁</span>
          </button>
        </div>
      </section>

      <section class="bag-condition-board">
        <div class="bag-history">
          <p class="eyebrow">World before the second draw</p>
          <h3>{{ stateTitle() }}</h3>

          @if (information() === 'none') {
            <div class="bag-stage" aria-label="原本袋中三顆紅球與兩顆藍球">
              @for (_ of redBalls(); track $index) {
                <span class="condition-ball">R</span>
              }
              @for (_ of blueBalls(); track $index) {
                <span class="condition-ball blue">B</span>
              }
            </div>
            <div class="mixture-history">
              <div>
                <strong>第一抽可能是 R · weight 3/5</strong>
                接著第二抽紅球比例為 2/4。
              </div>
              <div>
                <strong>第一抽可能是 B · weight 2/5</strong>
                接著第二抽紅球比例為 3/4。
              </div>
            </div>
          } @else {
            <div class="bag-stage" [attr.aria-label]="bagAriaLabel()">
              <span class="condition-ball drawn-ball" [class.blue]="information() === 'blue'">
                {{ information() === 'red' ? 'R' : 'B' }}
              </span>
              <span aria-hidden="true">→</span>
              @for (_ of redBalls(); track $index) {
                <span class="condition-ball">R</span>
              }
              @for (_ of blueBalls(); track $index) {
                <span class="condition-ball blue">B</span>
              }
            </div>
            <p class="feedback">外框球是已知被抽走的球；箭頭右側才是第二抽真正面對的新世界。</p>
          }
        </div>

        <div class="bag-result">
          <span class="card-label">{{ resultLabel() }}</span>
          <strong>{{ resultFraction() }} = {{ resultPercent() }}</strong>
          <p>{{ resultExplanation() }}</p>
        </div>
      </section>

      <section class="transfer-check">
        <div>
          <p class="eyebrow">Transfer check · 換掉抽球表面</p>
          <h3>
            100 筆交易中，20 筆是海外交易，其中 8 筆被標記。已知是海外交易後，標記率的 denominator
            是？
          </h3>
          @if (transferChoice() !== null) {
            <p class="feedback" aria-live="polite">
              @if (transferChoice() === 20) {
                <strong>對，是 20。</strong>given「海外」後，只在 20 筆海外交易裡看 8 筆交集，所以是
                8/20 = 40%。
              } @else {
                100 是資訊揭曉前的原世界；condition 已把 domestic transactions 裁掉。
              }
            </p>
          }
        </div>
        <div class="choice-row" role="group" aria-label="選擇條件機率的分母">
          <button
            type="button"
            [class.selected]="transferChoice() === 100"
            (click)="transferChoice.set(100)"
          >
            100
          </button>
          <button
            type="button"
            [class.selected]="transferChoice() === 20"
            (click)="transferChoice.set(20)"
          >
            20
          </button>
        </div>
      </section>

      <aside class="insight-card">
        <div class="renormalize-map" aria-hidden="true">
          <div>
            <span>Condition information</span>
            <strong>淘汰不相容 histories</strong>
          </div>
          <i>→</i>
          <div>
            <span>Updated world</span>
            <strong>重新計算下一步比例</strong>
          </div>
        </div>
        <div>
          <span class="card-label">資訊決定哪些 histories 還活著</span>
          <p>
            <strong>Conditional probability 的核心不是「分母減一」，而是更新世界。</strong>
            抽走 red 與抽走 blue 會留下不同袋子；只有先確定 condition，才知道下一步應在哪裡量比例。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>數值層：no information 為什麼仍是 3/5？</summary>
        <div>
          <p>尚未知道第一抽時，第二抽紅球會混合兩種互斥 histories：</p>
          <div class="math-line">
            <app-math e="P(R_2)=P(R_1)P(R_2\\mid R_1)+P(B_1)P(R_2\\mid B_1)" />
          </div>
          <div class="math-line">
            <app-math e="P(R_2)=\\frac35\\frac24+\\frac25\\frac34=\\frac35" />
          </div>
          <p>
            得知 R₁ 後，B₁ history 被完全裁掉，所以
            P(R₂|R₁)=2/4。下一章會用「縮小後比例是否改變」正式區分 independence 與 dependence。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2InformationUpdatesBagComponent {
  readonly prediction = signal<string | null>(null);
  readonly information = signal<InformationState>('red');
  readonly transferChoice = signal<number | null>(null);
  readonly redBalls = computed(() => Array.from({ length: this.information() === 'red' ? 2 : 3 }));
  readonly blueBalls = computed(() =>
    Array.from({ length: this.information() === 'blue' ? 1 : 2 }),
  );
  readonly stateTitle = computed(() => {
    if (this.information() === 'red') return 'Given R₁：紅球已離開，剩 2 red + 2 blue';
    if (this.information() === 'blue') return 'Given B₁：藍球已離開，剩 3 red + 1 blue';
    return 'No information：兩種 first-draw histories 都還活著';
  });
  readonly resultLabel = computed(() => {
    if (this.information() === 'red') return 'P(SECOND RED | FIRST RED)';
    if (this.information() === 'blue') return 'P(SECOND RED | FIRST BLUE)';
    return 'P(SECOND RED) · BEFORE INFORMATION';
  });
  readonly resultFraction = computed(() => {
    if (this.information() === 'red') return '2/4';
    if (this.information() === 'blue') return '3/4';
    return '3/5';
  });
  readonly resultPercent = computed(() => {
    if (this.information() === 'red') return '50%';
    if (this.information() === 'blue') return '75%';
    return '60%';
  });
  readonly resultExplanation = computed(() => {
    if (this.information() === 'red') {
      return 'condition 淘汰所有 first-blue histories；第二抽只在 2 red、2 blue 的袋子中發生。';
    }
    if (this.information() === 'blue') {
      return 'condition 淘汰所有 first-red histories；第二抽只在 3 red、1 blue 的袋子中發生。';
    }
    return '尚未收到 first-draw information，兩種 histories 都要按各自 weights 混合。';
  });
  readonly bagAriaLabel = computed(() =>
    this.information() === 'red'
      ? '已知抽走一顆紅球，袋中剩兩顆紅球與兩顆藍球'
      : '已知抽走一顆藍球，袋中剩三顆紅球與一顆藍球',
  );
}
