import { Component, computed, signal } from '@angular/core';
import {
  FUNCTION_INPUTS,
  RingOperation,
  clampFunctionValue,
  combineFunctions,
} from './rings-ch1-model';

@Component({
  selector: 'app-rings-ch1-function-elements',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 1.3</p>
        <h2>f(A) 只是一個局部讀數；整張 mapping 才是一個 ring element</h2>
        <p class="lede">在這個world裡，一個object要同時回答A、B、C三個inputs。Pointwise operation會逐lane計算，但只有三個outputs裝回同一張card後，才得到一個新的function element。</p>
      </header>
      <span class="map-convention">FUNCTION WORLD · R=ℤ^&#123;A,B,C&#125; · ONE CARD = ONE ELEMENT · ONE LANE = ONE VALUE</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>若只算出(f+g)(B)=−1，是否已經知道完整的element f+g？</h3></div>
        <div class="choice-row">
          <button type="button" (click)="prediction.set('function')">還沒有，A與C仍缺值</button>
          <button type="button" (click)="prediction.set('value')">有，−1就是output element</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'value'">{{ prediction() === 'function' ? '對。−1只是B-lane的local reading；完整element必須交付A、B、C三個values。' : '−1只能回答input B。換成A或C時還沒有output，所以它不是完整function。' }}</p>
        }
      </section>

      <div class="control-row" aria-label="Function operation and lane controls">
        <span class="kicker">POINTWISE OPERATION</span>
        <button type="button" [class.active]="operation() === 'add'" (click)="setOperation('add')">＋ ADD</button>
        <button type="button" class="multiply" [class.active]="operation() === 'multiply'" (click)="setOperation('multiply')">× MULTIPLY</button>
        <span class="kicker">ACTIVE INPUT</span>
        @for (input of inputs; track input; let index = $index) {
          <button type="button" [class.active]="activeLane() === index" (click)="activeLane.set(index)">{{ input }}</button>
        }
        <button type="button" (click)="computeLane(activeLane())">COMPUTE THIS LANE</button>
        <button type="button" (click)="computeAll()">ASSEMBLE WHOLE FUNCTION</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="function-assembly-lab">
          <section class="function-element-board" role="group" aria-label="Two whole function elements combine pointwise into one whole output function element">
            <section class="function-element-card source">
              <div class="function-card-heading"><h4>f</h4><span class="element-capsule">ONE ELEMENT</span></div>
              <p class="function-signature">&#123;A,B,C&#125; → ℤ</p>
              @for (input of inputs; track input; let index = $index) {
                <div class="lane" [class.active]="activeLane() === index">
                  <button type="button" [attr.aria-label]="'減少 f(' + input + ')'" (click)="adjust('f', index, -1)">−</button>
                  <span class="value"><small>f({{ input }})</small>{{ f()[index] }}</span>
                  <button type="button" [attr.aria-label]="'增加 f(' + input + ')'" (click)="adjust('f', index, 1)">＋</button>
                </div>
              }
            </section>

            <span class="operation-port" [class.multiply]="operation() === 'multiply'" aria-hidden="true">{{ operationSymbol() }}</span>

            <section class="function-element-card source">
              <div class="function-card-heading"><h4>g</h4><span class="element-capsule">ONE ELEMENT</span></div>
              <p class="function-signature">&#123;A,B,C&#125; → ℤ</p>
              @for (input of inputs; track input; let index = $index) {
                <div class="lane" [class.active]="activeLane() === index">
                  <button type="button" [attr.aria-label]="'減少 g(' + input + ')'" (click)="adjust('g', index, -1)">−</button>
                  <span class="value"><small>g({{ input }})</small>{{ g()[index] }}</span>
                  <button type="button" [attr.aria-label]="'增加 g(' + input + ')'" (click)="adjust('g', index, 1)">＋</button>
                </div>
              }
            </section>

            <span class="operation-port arrow" [class.multiply]="operation() === 'multiply'" aria-hidden="true">→</span>

            <section class="function-element-card output" [class.complete]="assembled()" aria-live="polite">
              <div class="function-card-heading"><h4>h={{ operation() === 'add' ? 'f+g' : 'fg' }}</h4><span class="element-capsule">{{ assembled() ? 'ONE COMPLETE ELEMENT' : 'ASSEMBLING' }}</span></div>
              <p class="function-signature">&#123;A,B,C&#125; → ℤ</p>
              @for (input of inputs; track input; let index = $index) {
                <button type="button" class="lane output-lane" [class.active]="activeLane() === index" [class.done]="isComputed(index)" (click)="activeLane.set(index)">
                  <span class="value"><small>h({{ input }})</small>{{ isComputed(index) ? output()[index] : '?' }}</span>
                  <small>{{ isComputed(index) ? 'LOCAL VALUE INSTALLED' : 'LOCAL VALUE MISSING' }}</small>
                </button>
              }
            </section>
          </section>

          <section class="lane-workbench" aria-live="polite">
            <div><small>ACTIVE LOCAL READING</small><strong>f({{ activeInput() }}) = {{ f()[activeLane()] }}</strong></div>
            <span class="workbench-operation">{{ operationSymbol() }}</span>
            <div><small>ACTIVE LOCAL READING</small><strong>g({{ activeInput() }}) = {{ g()[activeLane()] }}</strong></div>
            <span class="workbench-arrow">→</span>
            <div class="local-output" [class.done]="isComputed(activeLane())"><small>ONE OUTPUT VALUE</small><strong>h({{ activeInput() }}) = {{ isComputed(activeLane()) ? output()[activeLane()] : '?' }}</strong></div>
          </section>

          <section class="assembly-meter">
            <div><small>LOCAL VALUES INSTALLED</small><strong>{{ computedLanes().length }} / {{ inputs.length }}</strong></div>
            <div class="assembly-track" aria-hidden="true">@for (input of inputs; track input; let index=$index) { <span [class.done]="isComputed(index)">{{ input }}</span> }</div>
            <strong>{{ assembled() ? 'WHOLE FUNCTION ELEMENT READY' : 'NOT YET A COMPLETE FUNCTION' }}</strong>
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">ACTIVE LANE · INPUT {{ activeInput() }}</p>
          <h3>{{ laneEquation() }}</h3>
          <p>{{ consoleReading() }}</p>
          <div class="readout">h = &#123; {{ outputCardReading() }} &#125;</div>
        </aside>
      </section>

      <section class="insight"><span class="insight-icon">ƒ card</span><div><strong>Pointwise描述計算方式，不會把function拆成三個elements</strong><span>每條lane只產生一個value；把所有input lanes收回同一張mapping card，才得到一個新的ring element。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 1.4</strong><p>現在同一批function cards上有ADD與MULTIPLY；兩條rules各自都能產生新card，就已經足以叫作ring嗎？</p></div>
      <details><summary>符號層：pointwise operations</summary><p>對每個input x，定義(f+g)(x)=f(x)+g(x)與(fg)(x)=f(x)g(x)。等號右邊算出一個integer value；讓x跑過整個domain後，所有values合起來才定義左邊的新function。這裡不是function composition；完整ring laws到Ch3再檢查。</p></details>
    </article>
  `,
})
export class RingsCh1FunctionElementsComponent {
  readonly inputs = FUNCTION_INPUTS;
  readonly operation = signal<RingOperation>('add');
  readonly activeLane = signal(1);
  readonly prediction = signal<'value' | 'function' | null>(null);
  readonly f = signal<number[]>([1, -2, 2]);
  readonly g = signal<number[]>([2, 1, -1]);
  readonly computedLanes = signal<readonly number[]>([]);
  readonly output = computed(() => combineFunctions(this.f(), this.g(), this.operation()));
  readonly assembled = computed(() => this.computedLanes().length === this.inputs.length);
  readonly activeInput = computed(() => this.inputs[this.activeLane()]);
  readonly operationSymbol = computed(() => this.operation() === 'add' ? '+' : '×');
  readonly laneEquation = computed(() => {
    const index = this.activeLane();
    return `h(${this.inputs[index]}) = ${this.f()[index]} ${this.operationSymbol()} ${this.g()[index]} ${this.isComputed(index) ? '= ' + this.output()[index] : '= ?'}`;
  });
  readonly consoleReading = computed(() => this.assembled()
    ? '三個local readings已裝進同一張h card；現在右側才是一個完整的新function element。'
    : this.isComputed(this.activeLane())
      ? `Input ${this.activeInput()}已有local output，但整張h仍缺${this.inputs.length - this.computedLanes().length}條lane。`
      : `先計算input ${this.activeInput()}的local output；這一步只填一格，不會單獨產生一個function element。`);
  readonly outputCardReading = computed(() => this.inputs
    .map((input, index) => `${input}↦${this.isComputed(index) ? this.output()[index] : '?'}`)
    .join(', '));

  isComputed(index: number): boolean { return this.computedLanes().includes(index); }

  computeLane(index: number): void {
    if (!this.isComputed(index)) this.computedLanes.update(indices => [...indices, index].sort());
  }

  computeAll(): void { this.computedLanes.set(this.inputs.map((_, index) => index)); }

  setOperation(operation: RingOperation): void {
    this.operation.set(operation);
    this.computedLanes.set([]);
  }

  adjust(card: 'f' | 'g', index: number, delta: number): void {
    const source = card === 'f' ? this.f : this.g;
    source.update(values => values.map((value, current) => current === index ? clampFunctionValue(value + delta) : value));
    this.activeLane.set(index);
    this.computedLanes.update(indices => indices.filter(current => current !== index));
  }

  reset(): void {
    this.f.set([1, -2, 2]);
    this.g.set([2, 1, -1]);
    this.operation.set('add');
    this.activeLane.set(1);
    this.computedLanes.set([]);
    this.prediction.set(null);
  }
}
