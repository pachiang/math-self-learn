import { Component, computed, signal } from '@angular/core';
import {
  FunctionPair,
  RingMapOperation,
  clampResidue,
  evaluateA,
  mod,
  operatePair,
  operateValue,
  pairLabel,
} from './rings-ch7-model';

@Component({
  selector: 'app-rings-ch7-two-route-bridge',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 7.1</p>
        <h2>同一張 bridge，要讓兩種 operation routes 都抵達同一點</h2>
        <p class="lede">Ring map 不是element lookup table。對每對source inputs，先在source合成再翻譯，必須和先各自翻譯再用target rule得到同一個output。</p>
      </header>
      <span class="map-convention">COURSE CONVENTION · UNITAL MAPS PRESERVE 1</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>ev_A 只讀A lane。切換ADD與MULTIPLY時，兩條routes都會對齊嗎？</h3></div>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">都會對齊</button>
          <button type="button" (click)="prediction.set(true)">只有一條會</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'Pointwise ADD與MULTIPLY都在A lane使用同一套mod-4 rule；切換operation後仍可逐路檢查。' : '對。先別把兩次成功當成一般證明，沿兩條routes看看原因。' }}</p>
        }
      </section>

      <div class="control-row" aria-label="Map route controls">
        <span class="kicker">AUDIT</span>
        <button type="button" [class.active]="operation() === 'add'" (click)="setOperation('add')">＋ ADD</button>
        <button type="button" class="multiply" [class.active]="operation() === 'multiply'" (click)="setOperation('multiply')">× MULTIPLY</button>
        <button type="button" (click)="advance()">{{ routeStep() < 2 ? 'STEP ROUTES' : 'REPLAY ROUTES' }}</button>
        <button type="button" (click)="reset()">RESET</button>
        @if (transferUnlocked()) {
          <button type="button" [class.active]="mode() === 'reduction'" (click)="toggleTransfer()">{{ mode() === 'evaluation' ? 'TRANSFER · MOD 6' : 'BACK · FUNCTION MAP' }}</button>
        }
      </div>

      <section class="stage stage-grid">
        <div class="map-bridge-lab">
          <section class="map-world-panel source">
            <div class="world-cap"><span>SOURCE R</span><strong>{{ sourceWorld() }}</strong></div>
            @if (mode() === 'evaluation') {
              <div class="map-inputs">
                <section class="map-function-card"><strong>f {{ pairLabel(f()) }}</strong>@for (lane of lanes; track lane; let i = $index) {<div class="mini-lane" [class.observed]="i === 0"><span>{{ lane }}</span><b>{{ f()[i] }}</b><button type="button" [attr.aria-label]="'decrease f ' + lane" (click)="adjust('f', i, -1)">−</button><button type="button" [attr.aria-label]="'increase f ' + lane" (click)="adjust('f', i, 1)">+</button></div>}</section>
                <section class="map-function-card"><strong>g {{ pairLabel(g()) }}</strong>@for (lane of lanes; track lane; let i = $index) {<div class="mini-lane" [class.observed]="i === 0"><span>{{ lane }}</span><b>{{ g()[i] }}</b><button type="button" [attr.aria-label]="'decrease g ' + lane" (click)="adjust('g', i, -1)">−</button><button type="button" [attr.aria-label]="'increase g ' + lane" (click)="adjust('g', i, 1)">+</button></div>}</section>
              </div>
              <section class="map-function-card result" [class.route-step]="routeStep() < 1"><strong>operate in R → {{ pairLabel(sourceResult()) }}</strong><span>A→{{ sourceResult()[0] }} · B→{{ sourceResult()[1] }}</span></section>
            } @else {
              <div class="map-inputs"><section class="map-function-card"><strong>a = 8</strong><span>integer source element</span></section><section class="map-function-card"><strong>b = 5</strong><span>integer source element</span></section></div>
              <section class="map-function-card result"><strong>operate in ℤ → {{ integerSourceResult() }}</strong><span>then reduce mod 6</span></section>
            }
          </section>

          <div class="bridge-column">
            <div class="route-step" [class.active]="routeStep() >= 1"><b>1</b> OPERATE IN R</div>
            <div class="phi-bridge">φ<br><small>{{ mapLabel() }}</small></div>
            <div class="route-step multiply" [class.active]="routeStep() >= 2"><b>2</b> OPERATE IN S</div>
          </div>

          <section class="map-world-panel target">
            <div class="world-cap"><span>TARGET S</span><strong>{{ targetWorld() }}</strong></div>
            <div class="route-equations">
              <div class="route-equation upper">先合再翻 → {{ upperEndpoint() }}</div>
              <div class="route-equation lower">先翻再合 → {{ lowerEndpoint() }}</div>
            </div>
            <div class="endpoint-dock" [class.matched]="routeStep() >= 2">
              <span>{{ routeStep() >= 2 ? 'ROUTES MEET' : 'TARGET DOCK' }}</span>
              <strong>{{ routeStep() >= 2 ? upperEndpoint() : '?' }}</strong>
            </div>
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ routeStep() >= 2 ? 'EXAMPLE · THIS PAIR' : 'ROUTE AUDIT' }}</span>
          <h3>{{ operation() === 'add' ? 'ADD · solid rails' : 'MULTIPLY · double rails' }}</h3>
          <p>{{ routeNarration() }}</p>
          <div class="readout">{{ compressedEquation() }}</div>
        </aside>
      </section>

      <section class="insight"><span class="insight-icon">φ</span><div><strong>Ring homomorphism（環同態）是一張同時尊重兩套wiring的翻譯</strong><span>不是只替每個element指定一個新名字。</span></div></section>
      <details><summary>符號層：兩份 preservation contract</summary><p>對任意a,b∈R，需要<code>φ(a+b)=φ(a)+φ(b)</code>與<code>φ(ab)=φ(a)φ(b)</code>。單一pair的動畫只是example；ev_A對任意functions成立，是因兩側都在A lane使用同一個pointwise rule。</p></details>
    </article>
  `,
})
export class RingsCh7TwoRouteBridgeComponent {
  readonly lanes = ['A', 'B'] as const;
  readonly f = signal<FunctionPair>([1, 2]);
  readonly g = signal<FunctionPair>([3, 1]);
  readonly operation = signal<RingMapOperation>('add');
  readonly routeStep = signal(0);
  readonly mode = signal<'evaluation' | 'reduction'>('evaluation');
  readonly prediction = signal<boolean | null>(null);
  readonly addSeen = signal(false);
  readonly multiplySeen = signal(false);
  readonly transferUnlocked = computed(() => this.addSeen() && this.multiplySeen());
  readonly sourceResult = computed(() => operatePair(this.f(), this.g(), this.operation()));
  readonly integerSourceResult = computed(() => operateValue(8, 5, this.operation()));
  readonly upperEndpoint = computed(() => this.mode() === 'evaluation'
    ? evaluateA(this.sourceResult())
    : mod(this.integerSourceResult(), 6));
  readonly lowerEndpoint = computed(() => this.mode() === 'evaluation'
    ? operateValue(evaluateA(this.f()), evaluateA(this.g()), this.operation(), 4)
    : operateValue(mod(8, 6), mod(5, 6), this.operation(), 6));
  readonly sourceWorld = computed(() => this.mode() === 'evaluation' ? '(ℤ/4ℤ)^{A,B}' : 'ℤ');
  readonly targetWorld = computed(() => this.mode() === 'evaluation' ? 'ℤ/4ℤ' : 'ℤ/6ℤ');
  readonly mapLabel = computed(() => this.mode() === 'evaluation' ? 'ev_A · read A' : 'q · reduce mod 6');
  readonly routeNarration = computed(() => this.routeStep() === 0
    ? '先保留你的預測；兩條route尚未展開。'
    : this.routeStep() === 1
      ? `Source先用${this.operation() === 'add' ? 'ADD' : 'MULTIPLY'}得到intermediate object，再送過φ。`
      : `兩條routes都抵達${this.upperEndpoint()}；這一對inputs通過目前audit。`);
  readonly compressedEquation = computed(() => this.routeStep() >= 2
    ? `φ(a ${this.operation() === 'add' ? '+' : '·'} b) = ${this.upperEndpoint()} = φ(a) ${this.operation() === 'add' ? '+' : '·'} φ(b)`
    : 'operate in R → φ  ?=  φ each → operate in S');
  pairLabel = pairLabel;

  setOperation(operation: RingMapOperation): void { this.operation.set(operation); this.routeStep.set(0); }
  advance(): void {
    if (this.routeStep() >= 2) { this.routeStep.set(0); return; }
    this.routeStep.update(step => step + 1);
    if (this.routeStep() === 2) this.operation() === 'add' ? this.addSeen.set(true) : this.multiplySeen.set(true);
  }
  adjust(card: 'f' | 'g', lane: number, delta: number): void {
    const source = card === 'f' ? this.f : this.g;
    source.update(pair => pair.map((value, index) => index === lane ? clampResidue(value + delta) : value) as unknown as FunctionPair);
    this.routeStep.set(0);
  }
  toggleTransfer(): void { this.mode.update(mode => mode === 'evaluation' ? 'reduction' : 'evaluation'); this.routeStep.set(0); }
  reset(): void { this.f.set([1, 2]); this.g.set([3, 1]); this.operation.set('add'); this.routeStep.set(0); this.mode.set('evaluation'); this.prediction.set(null); this.addSeen.set(false); this.multiplySeen.set(false); }
}
