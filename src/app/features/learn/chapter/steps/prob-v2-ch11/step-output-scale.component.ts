import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type ScaleFocus = 'angle' | 'sector';

@Component({
  selector: 'app-prob-v2-output-scale',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch11">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 11.4</p>
        <h2>Discrete 或 continuous，要看輸出尺，不是看故事外觀</h2>
        <p class="lede">
          同一個 spinner 落點可以量成精確角度，也能分類成四個 sectors。
          <strong>離散（discrete）</strong
          >輸出彼此分開；<strong>連續（continuous）</strong>輸出能沿區間平滑變化。
        </p>
      </header>

      <section class="scene">
        <div class="rv-prediction">
          <div>
            <p class="eyebrow">先預測 · same physical experiment</p>
            <h3>一根連續旋轉的指針，能否同時產生 discrete 與 continuous random variable？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="判斷同一實驗能否定義兩類隨機變數">
            <button
              type="button"
              [class.selected]="prediction() === 'yes'"
              (click)="prediction.set('yes')"
            >
              可以
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'no'"
              (click)="prediction.set('no')"
            >
              不可以
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'yes') {
              <strong>可以。</strong>Θ 讀精確角度；C 只讀落在哪個 sector。物理 outcome
              相同，輸出尺不同。
            } @else {
              Experiment 不會把 variable 類型鎖死；同一落點可被精細測量，也可被粗略分類。
            }
          </p>
        }
      </section>

      <section class="spinner-controls">
        <label for="spinner-angle">拖動同一個 spinner outcome</label>
        <input
          id="spinner-angle"
          type="range"
          min="0"
          max="359"
          step="1"
          [value]="angle()"
          (input)="angle.set(+$any($event).target.value)"
        />
        <strong>{{ angle() }}°</strong>
        <div class="preset-row" role="group" aria-label="聚焦輸出尺度">
          <button type="button" [class.active]="focus() === 'angle'" (click)="focus.set('angle')">
            Exact angle Θ
          </button>
          <button type="button" [class.active]="focus() === 'sector'" (click)="focus.set('sector')">
            Sector C
          </button>
        </div>
      </section>

      <section class="scale-board">
        <div class="spinner-panel">
          <p class="eyebrow">One physical outcome</p>
          <h3>指針停在 {{ angle() }}°</h3>
          <div class="spinner" aria-label="分成四區的旋轉盤">
            <div class="sector-label north">Q1</div>
            <div class="sector-label east">Q2</div>
            <div class="sector-label south">Q3</div>
            <div class="sector-label west">Q4</div>
            <div class="spinner-pointer" [style.transform]="'rotate(' + (angle() - 90) + 'deg)'">
              <i></i>
            </div>
            <div class="spinner-hub"></div>
          </div>
          <p class="spinner-caption">同一落點，同時送進兩台 measurement machines</p>
        </div>

        <div class="scale-outputs">
          <div class="scale-output" [class.focused]="focus() === 'angle'">
            <div class="scale-heading">
              <span>CONTINUOUS OUTPUT</span>
              <strong>Θ = {{ angle() }}°</strong>
            </div>
            <div class="angle-line">
              <div class="angle-progress" [style.width.%]="(angle() / 359) * 100"></div>
              <i [style.left.%]="(angle() / 359) * 100"></i>
              <span class="zero">0°</span>
              <span class="full">360°</span>
            </div>
            <p>拖動 1°，輸出也移動 1°；中間還能繼續切得更細。</p>
          </div>

          <div class="scale-output" [class.focused]="focus() === 'sector'">
            <div class="scale-heading">
              <span>DISCRETE OUTPUT</span>
              <strong>C = {{ sectorLabel() }}</strong>
            </div>
            <div class="sector-slots">
              @for (sector of sectors; track sector) {
                <div [class.active]="sectorLabel() === sector">
                  <strong>{{ sector }}</strong>
                  <span>{{ sectorRange(sector) }}</span>
                </div>
              }
            </div>
            <p>角度在同一 sector 內移動時，C 不變；越過邊界才跳到下一格。</p>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="scale-contrast" aria-hidden="true">
          <div><i class="continuous-line"></i><strong>任意靠近</strong><span>continuous</span></div>
          <div><i class="discrete-dots"></i><strong>分離 slots</strong><span>discrete</span></div>
        </div>
        <div>
          <span class="card-label">看 output space，不看 experiment 的外表</span>
          <p>
            <strong
              >同一個 {{ angle() }}° outcome，Θ={{ angle() }} 而 C={{ sectorLabel() }}。</strong
            >
            continuous 與 discrete 描述的是 measurement rule 允許輸出哪些值。
          </p>
        </div>
      </aside>

      <section class="transfer-check">
        <p class="eyebrow">遷移一下 · customer waiting time</p>
        <h3>精確等待秒數 T，與「是否超過 5 分鐘」I，各是哪一類？</h3>
        <button type="button" (click)="transferOpen.set(!transferOpen())">
          {{ transferOpen() ? '收起判斷' : '揭曉判斷' }}
        </button>
        @if (transferOpen()) {
          <p class="feedback">
            T 是 continuous；I 只輸出 0 或 1，所以是 discrete
            indicator。兩者可以讀取同一位顧客的同一段等待。
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>定義層：discrete、continuous 與這個模型的邊界</summary>
        <div>
          <p>
            Discrete random variable 的可能值可逐一列舉（finite 或 countably infinite）。Continuous
            random variable 通常在某個 interval 上取值，probability 需要以區間來描述。
          </p>
          <div class="math-line">
            <app-math e="C\\in\\{Q1,Q2,Q3,Q4\\},\\qquad \\Theta\\in[0,360)" />
          </div>
          <p>
            真實儀器有有限精度，因此紀錄值在工程上可能被量化成細密的 discrete grid；continuous model
            是對測量尺度的理想化。下一章會比較兩者的 distribution 如何承接 probability mass。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2OutputScaleComponent {
  readonly sectors = ['Q1', 'Q2', 'Q3', 'Q4'];
  readonly prediction = signal<'yes' | 'no' | null>(null);
  readonly angle = signal(137);
  readonly focus = signal<ScaleFocus>('angle');
  readonly transferOpen = signal(false);
  readonly sectorLabel = computed(() => {
    const index = Math.floor(this.angle() / 90);
    return this.sectors[Math.min(index, 3)];
  });

  sectorRange(sector: string): string {
    const index = this.sectors.indexOf(sector);
    return `${index * 90}°–${(index + 1) * 90}°`;
  }
}
