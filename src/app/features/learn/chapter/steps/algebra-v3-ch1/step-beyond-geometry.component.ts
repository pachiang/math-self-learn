import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-algebra-v3-beyond-geometry',
  standalone: true,
  template: `
    <article class="alg-ch1-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 1.4</p>
        <h2>群論比較的是 action rhythm，不是物件材質</h2>
        <p class="lede">
          三角形 rotation、模 3 時鐘與 card shuffle
          看起來毫無關係。現在用同一個「做一次」按鈕同步推進三個 worlds，觀察共同的 composition
          pattern。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">離開幾何表面</p>
        <h3>「時鐘數字加 1」沒有移動幾何圖形，所以不能用群論研究嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(true)">不能</button>
          <button type="button" (click)="prediction.set(false)">仍然可以</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? '群論需要的是可合成、可撤銷的 actions；不要求 action 一定在物理空間移動。'
                : '對。只要 action 的合成規律存在，數值更新也能形成 group structure。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Three worlds, one action</p>
            <h3>同步按一次，表面表示一起前進</h3>
          </div>
          <p>不要只看第三步回到起點；比較每一步的 state graph 是否能一一對齊。</p>
        </div>

        <div class="stage">
          <div class="parallel-worlds">
            <section class="world-card">
              <span>TRIANGLE ROTATION</span>
              <div class="world-state">
                <div class="mini-triangle" aria-label="三角形頂點 labels 的目前配置">
                  @for (label of triangleLabels(); track $index) {
                    <b>{{ label }}</b>
                  }
                </div>
              </div>
              <p>每次把三個 positions 往前轉一格。</p>
            </section>

            <section class="world-card">
              <span>MOD 3 CLOCK</span>
              <div class="world-state" [attr.aria-label]="'目前時鐘 state ' + normalizedStep()">
                {{ normalizedStep() }}
              </div>
              <p>每次做 +1，超過 2 後回到 0。</p>
            </section>

            <section class="world-card">
              <span>CARD SHUFFLE</span>
              <div class="world-state" [attr.aria-label]="'目前卡片順序 ' + cardOrder()">
                {{ cardOrder() }}
              </div>
              <p>每次把最左邊的 card 移到最後。</p>
            </section>
          </div>

          <div class="rhythm-control">
            <button type="button" (click)="step.set(0)">回到 identity</button>
            <label>
              <span>已執行 {{ step() }} 次；目前等價於 r^{{ normalizedStep() }}</span>
              <input type="range" min="0" max="6" [value]="step()" (input)="setStep($event)" />
            </label>
            <button type="button" (click)="step.update((value) => value + 1)">
              三個 worlds 都做一次
            </button>
          </div>
        </div>

        <p class="readout">
          <strong>{{ cycleReading() }}</strong
          ><br />
          配對 identity↔0↔ABC、r↔1↔BCA、r²↔2↔CAB 後，「做一次」在三個 worlds 中走同一張三節點
          cycle。
        </p>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>不同表面</span><i>↔</i><span>同一骨架</span>
        </div>
        <p>
          <strong>抽象化是在丟掉材質，保留 composition pattern。</strong>
          三個 worlds 的 states 名稱不同，但 action graph 可以完全一樣。這是之後 isomorphism
          的直覺入口。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移檢查</p>
        <h3>
          RGB channels 每次循環成 GBR，再變 BRG，第三次回到 RGB；它能和三角形 rotation 共用同一
          action rhythm 嗎？
        </h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(true)">可以</button>
          <button type="button" (click)="transfer.set(false)">不可以</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">
            {{
              transfer()
                ? '可以；材質不同，但三步 cycle 與 composition pattern 相同。'
                : '比較 group structure 時，顏色材質不是必要資料。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>正式語言預告：representation 與 isomorphism</summary>
          <div>
            同一 abstract action pattern 可以有不同 representations。完整的 isomorphism 要求一個
            bijection 保留所有 compositions；這裡先只觀察三步 cyclic pattern。
          </div>
        </details>
        <details>
          <summary>Proof Lab：三個 cycles 怎樣逐步對齊？</summary>
          <div>
            建立 e↔0↔ABC、r↔1↔BCA、r²↔2↔CAB。逐一檢查每個 state 做一次 action
            後，三側都移到配對的下一個 state；因此整張 action graph 對齊，而不只是第三步碰巧回原點。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3BeyondGeometryComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly step = signal(0);
  readonly normalizedStep = computed(() => ((this.step() % 3) + 3) % 3);
  readonly triangleLabels = computed(() => {
    const states = [
      ['A', 'B', 'C'],
      ['C', 'A', 'B'],
      ['B', 'C', 'A'],
    ];
    return states[this.normalizedStep()];
  });
  readonly cardOrder = computed(() => ['ABC', 'BCA', 'CAB'][this.normalizedStep()]);
  readonly cycleReading = computed(() => {
    if (this.step() === 0) return '還沒執行 action：三個 worlds 都在 identity state。';
    if (this.normalizedStep() === 0)
      return `做了 ${this.step()} 次：完整走過 ${this.step() / 3} 圈，state 回來但 history 不等於沒做。`;
    return `做了 ${this.step()} 次：三個 worlds 同步位於 cycle 的第 ${this.normalizedStep()} 個非 identity state。`;
  });

  setStep(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) this.step.set(Number(input.value));
  }
}
