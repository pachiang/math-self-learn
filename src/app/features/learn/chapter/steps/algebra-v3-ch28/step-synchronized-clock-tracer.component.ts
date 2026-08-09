import { Component, computed, signal } from '@angular/core';
import { coordinateOrder, productGrid, productTrace } from './product-model';

interface ClockPreset {
  label: string;
  m: number;
  n: number;
  dx: number;
  dy: number;
}

@Component({
  selector: 'app-algebra-v3-synchronized-clock-tracer',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch28-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 28.3</p>
        <h2>Pair 的週期不是把兩個 clocks 相乘；它等兩軸第一次同時回到零</h2>
        <p class="lede">
          反覆套用同一個 pair step，token 會在 wraparound grid
          上留下軌跡。第一軸與第二軸可以各自先回來，但 pair 必須等兩者同步。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>一個 coordinate 每 4 步回來，另一個每 6 步回來；pair 第一次何時回來？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(12)">第 12 步</button
          ><button type="button" (click)="prediction.set(24)">第 24 步</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 12">
            {{
              prediction() === 12
                ? '對。12 是第一個同時被 4、6 整除的時間。'
                : '乘成 24 會忽略兩個 clocks 共用的回返時刻 12。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Synchronized-clock tracer</p>
            <h3>逐步走訪 torus grid，等兩個 clocks 同步歸零</h3>
          </div>
          <p>每個 visited cell 寫出 time stamp；未造訪 cell 顯示破折號，軌跡辨識不依賴顏色。</p>
        </div>
        <div class="clock-presets">
          @for (item of presets; track item.label; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="presetIndex() === i"
              (click)="selectPreset(i)"
            >
              {{ item.label }}
            </button>
          }
        </div>
        <div class="stage clock-tracer-stage">
          <section
            class="trace-grid"
            [style.grid-template-columns]="gridColumns()"
            [attr.aria-label]="traceLabel()"
          >
            @for (cell of cells(); track cell.key) {
              <article
                [class.visited]="visitTime(cell.key) >= 0"
                [class.current]="current().key === cell.key"
                [class.returned]="returned() && cell.key === '0,0'"
              >
                <small>({{ cell.x }},{{ cell.y }})</small
                ><b>{{ visitTime(cell.key) >= 0 ? 't=' + visitTime(cell.key) : '—' }}</b
                ><span>{{
                  current().key === cell.key
                    ? returned()
                      ? 'RETURN'
                      : 'NOW'
                    : visitTime(cell.key) >= 0
                      ? 'VISITED'
                      : 'UNVISITED'
                }}</span>
              </article>
            }
          </section>
          <section class="clock-strips">
            <article>
              <header>
                <span>FIRST CLOCK · mod {{ active().m }}</span
                ><b>period {{ firstPeriod() }}</b>
              </header>
              <div>
                @for (time of timeline(); track time) {
                  <i [class.zero]="firstAt(time) === 0"
                    ><small>t{{ time }}</small
                    ><strong>{{ firstAt(time) }}</strong></i
                  >
                }
              </div>
            </article>
            <article>
              <header>
                <span>SECOND CLOCK · mod {{ active().n }}</span
                ><b>period {{ secondPeriod() }}</b>
              </header>
              <div>
                @for (time of timeline(); track time) {
                  <i [class.zero]="secondAt(time) === 0"
                    ><small>t{{ time }}</small
                    ><strong>{{ secondAt(time) }}</strong></i
                  >
                }
              </div>
            </article>
          </section>
          <section class="clock-console" aria-live="polite">
            <p class="kicker">RETURN DASHBOARD</p>
            <div>
              <span>CURRENT STEP</span><b>{{ shownStep() }} / {{ order() }}</b
              ><small>{{
                returned() ? 'BOTH CLOCKS BACK AT ZERO' : 'WAITING FOR SYNCHRONY'
              }}</small>
            </div>
            <div>
              <span>FIRST COMMON RETURN</span
              ><b>lcm({{ firstPeriod() }}, {{ secondPeriod() }}) = {{ order() }}</b>
            </div>
            <div>
              <span>ORBIT COVERAGE</span><b>{{ trace().length }} / {{ cells().length }}</b
              ><small>{{
                fullCoverage()
                  ? 'ONE PATH VISITS THE WHOLE GRID'
                  : laneCount() + ' DISJOINT PATHS NEEDED'
              }}</small>
            </div>
            <div class="trace-controls">
              <button type="button" class="primary" [disabled]="returned()" (click)="next()">
                下一步</button
              ><button type="button" (click)="runCycle()">走完整圈</button
              ><button type="button" (click)="reset()">重設</button>
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>A returns</span><i>wait</i><span>B returns</span><i>→</i><span>first sync</span>
        </div>
        <p>
          <strong>Pair order 是 coordinate return times 的同步問題。</strong>共享 factors 會讓
          clocks 提早重逢，因此一條 pair orbit 未必走遍整張 product grid。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>在 C₅×C₇ 中反覆走 (1,1)，一條 path 能走遍 35 格嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(true)">能，5 與 7 沒有共用週期</button
          ><button type="button" (click)="transfer.set(false)">
            不能，pair path 一定只走一部分
          </button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">
            {{
              transfer()
                ? '對。兩個 generator clocks 第 35 步才同步，因此先訪完全部 35 個 pairs。'
                : '互質 clocks 的首次同步時間就是格數 5×7，所以不會提早閉合。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Order formula 與 cyclic product criterion</summary>
          <div>
            若 g、h 的有限 orders 分別為 r、s，則 (g,h) 的 n 次方等於 identity，恰好要求 r 與 s
            都整除 n；最小正解是 lcm(r,s)。因此 Cₘ×Cₙ 要由 generator pair 走遍 mn 格，必須
            lcm(m,n)=mn，也就是 gcd(m,n)=1。這是觀察完整軌跡後的壓縮，不是另一條獨立口訣。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3SynchronizedClockTracerComponent {
  readonly presets: ClockPreset[] = [
    { label: 'C₂×C₃ · step (1,1)', m: 2, n: 3, dx: 1, dy: 1 },
    { label: 'C₄×C₆ · step (1,1)', m: 4, n: 6, dx: 1, dy: 1 },
    { label: 'C₄×C₆ · step (1,2)', m: 4, n: 6, dx: 1, dy: 2 },
    { label: 'C₃×C₄ · step (1,1)', m: 3, n: 4, dx: 1, dy: 1 },
  ];
  readonly presetIndex = signal(1);
  readonly progress = signal(5);
  readonly prediction = signal<number | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly active = computed(() => this.presets[this.presetIndex()]);
  readonly cells = computed(() => productGrid(this.active().m, this.active().n));
  readonly trace = computed(() =>
    productTrace(this.active().m, this.active().n, this.active().dx, this.active().dy),
  );
  readonly order = computed(() => this.trace().length);
  readonly firstPeriod = computed(() => coordinateOrder(this.active().m, this.active().dx));
  readonly secondPeriod = computed(() => coordinateOrder(this.active().n, this.active().dy));
  readonly returned = computed(() => this.progress() > this.order());
  readonly current = computed(() =>
    this.returned() ? { x: 0, y: 0, key: '0,0' } : this.trace()[this.progress() - 1],
  );
  readonly timeline = computed(() =>
    Array.from({ length: Math.min(this.progress(), this.order() + 1) }, (_, i) => i),
  );
  selectPreset(index: number) {
    this.presetIndex.set(index);
    this.reset();
  }
  reset() {
    this.progress.set(1);
  }
  next() {
    this.progress.update((value) => Math.min(this.order() + 1, value + 1));
  }
  runCycle() {
    this.progress.set(this.order() + 1);
  }
  visitTime(key: string) {
    const index = this.trace().findIndex((cell) => cell.key === key);
    return index >= 0 && index < this.progress() ? index : -1;
  }
  firstAt(time: number) {
    return (time * this.active().dx) % this.active().m;
  }
  secondAt(time: number) {
    return (time * this.active().dy) % this.active().n;
  }
  shownStep() {
    return Math.min(this.progress() - 1, this.order());
  }
  fullCoverage() {
    return this.trace().length === this.cells().length;
  }
  laneCount() {
    return this.cells().length / this.trace().length;
  }
  gridColumns() {
    return `repeat(${this.active().m}, minmax(58px, 1fr))`;
  }
  traceLabel() {
    return `${this.active().label}, orbit visits ${this.trace().length} of ${this.cells().length} states`;
  }
}
