import { Component, computed, signal } from '@angular/core';
import {
  allPairs,
  FUNCTION_SEED,
  multiplyPairs,
  Pair,
  pairKey,
  pairLabel,
} from './rings-ch10-model';

@Component({
  selector: 'app-rings-ch10-ambient-multiple-frontier',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 10.1</p>
        <h2>若 seed 必須變成 0，它的 ambient multiples 也不能留下來</h2>
        <p class="lede">先不建造quotient，只追蹤一份未來的collapse obligation。若a將被壓成0，那麼對任何ambient r，product r·a也必須跟著歸零；r本身不受影響。</p>
      </header>
      <span class="map-convention">PRE-QUOTIENT AUDIT · FUTURE ZERO REQUEST · R=(ℤ/4ℤ)^&#123;A,B&#125; · COMMUTATIVE</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>若a=(1,2)未來算作0，r=(3,3)仍可見；product r·a=(3,2)能否保持非零？</h3></div>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不能，r·a也被迫歸零</button>
          <button type="button" (click)="prediction.set(true)">可以，因為r仍可見</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'r是否被壓掉不重要。既然a→0，乘法相容性要求r·a→r·0=0。' : '對。留下r，壓掉a與r·a；三張cards的roles必須分開。' }}</p>
        }
      </section>

      <div class="control-row">
        <span class="kicker">AMBIENT r(A)</span>
        @for (value of values; track value) { <button type="button" [class.active]="rA()===value" (click)="rA.set(value)">{{ value }}</button> }
        <span class="kicker">r(B)</span>
        @for (value of values; track value) { <button type="button" [class.active]="rB()===value" (click)="rB.set(value)">{{ value }}</button> }
        <button type="button" class="multiply" (click)="applyCurrent()">TRACE r·a OBLIGATION</button>
        <button type="button" (click)="nextCoefficient()">TRACE NEXT r</button>
        <button type="button" (click)="completeScan()">REVEAL ALL FORCED OUTPUTS</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="multiple-frontier-lab">
          <section class="ambient-board">
            <p class="kicker">AMBIENT COEFFICIENTS · STAY VISIBLE</p>
            <div class="pair-board">
              @for (pair of board; track key(pair)) {
                <button type="button" class="pair-card coefficient" [class.selected]="key(pair)===key(r())" [class.audited]="wasApplied(pair)" (click)="selectCoefficient(pair)">
                  <strong>{{ label(pair) }}</strong><small>{{ wasApplied(pair) ? 'USED AS r' : 'AVAILABLE' }}</small>
                </button>
              }
            </div>
          </section>

          <section class="role-pipeline" aria-live="polite">
            <div class="role-card ambient"><span>AMBIENT r · NOT ERASED</span><strong>{{ label(r()) }}</strong></div>
            <div class="scope-op">×</div>
            <div class="role-card inside zero-requested"><span>REQUEST · a → FUTURE 0</span><strong>{{ label(seed) }}</strong></div>
            <div class="pipeline-arrow">→</div>
            <div class="role-card product forced-zero" [class.revealed]="appliedOnce()"><span>COLLAPSE OBLIGATION · r·a → 0</span><strong>{{ appliedOnce() ? label(product()) : '?' }}</strong><small>{{ appliedOnce() ? 'because r·a → r·0' : 'trace multiplier' }}</small></div>
          </section>

          <section class="multiple-tray zero-obligation-tray">
            <div class="tray-heading"><p class="kicker">MUST COLLAPSE WITH a</p><strong>{{ forcedMembers().length }} / 8 distinct outputs</strong></div>
            <div class="pair-board">
              @for (pair of principalMembers; track key(pair)) {
                <div class="pair-card output" [class.member]="isForced(pair)">
                  <strong>{{ label(pair) }}</strong><small>{{ isForced(pair) ? '→ 0 · ' + coefficientCount(pair) + ' witness' : 'NOT YET TRACED' }}</small>
                </div>
              }
            </div>
          </section>
        </div>
        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ fullScan() ? 'FINITE EXHAUSTION · THIS INSTANCE' : 'EXAMPLE · FORCED OUTPUT' }}</span>
          <h3>{{ fullScan() ? '8 OUTPUTS MUST FOLLOW a TO ZERO' : 'KEEP r · COLLAPSE r·a' }}</h3>
          <p>{{ statusText() }}</p>
          <div class="readout">a→0 ⟹ r·a→r·0=0 · current r·a={{ label(product()) }}</div>
        </aside>
      </section>

      @if (fullScan()) {
        <section class="transfer-strip">
          <div><p class="kicker">TRANSFER · INTEGER WORLD</p><strong>request 6 → 0 · ambient coefficient −3</strong><p>−18能否在新世界保持非零？</p></div>
          <div class="choice-row"><button type="button" (click)="transferAnswer.set(true)">不能，−18=(−3)·6</button><button type="button" (click)="transferAnswer.set(false)">可以，因為它在0左邊</button></div>
          @if (transferAnswer() !== null) { <p class="feedback" [class.warning]="!transferAnswer()">{{ transferAnswer() ? '對。換了representation，forced-zero mechanism仍是ambient coefficient × seed。' : '數線方向沒有collapse語意；certificate (−3)·6才是被迫歸零的理由。' }}</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">a→0</span><div><strong>壓掉seed，會強迫它的所有ambient multiples一起歸零</strong><span>r可以留下；不能留下的是r·a，因為它必須和r·0得到相同結果。</span></div></section>
      <details><summary>量詞層：這一頁真的證明了什麼？</summary><p>若a∈I且I是ideal，則對每個r∈R都有ra∈I。畫面中的16次scan只完整列出目前finite function ring的forced outputs；一般結論來自absorption contract。真正把I壓成quotient zero會留到Ch11。</p></details>
    </article>
  `,
})
export class RingsCh10AmbientMultipleFrontierComponent {
  readonly values = [0, 1, 2, 3] as const;
  readonly board = allPairs();
  readonly seed = FUNCTION_SEED;
  readonly principalMembers = this.uniqueProducts(this.board);
  readonly rA = signal(3);
  readonly rB = signal(3);
  readonly appliedKeys = signal<string[]>([]);
  readonly prediction = signal<boolean | null>(null);
  readonly transferAnswer = signal<boolean | null>(null);
  readonly r = computed<Pair>(() => [this.rA(), this.rB()]);
  readonly product = computed(() => multiplyPairs(this.r(), this.seed));
  readonly appliedOnce = computed(() => this.appliedKeys().length > 0);
  readonly fullScan = computed(() => this.appliedKeys().length === this.board.length);
  readonly forcedMembers = computed(() => this.uniqueProducts(this.board.filter(pair => this.wasApplied(pair))));
  readonly isZeroProduct = computed(() => this.product()[0] === 0 && this.product()[1] === 0);
  readonly statusText = computed(() => this.fullScan()
    ? '16張coefficient cards已完整掃描；duplicates疊合後共有8個outputs必須跟a一起歸零。這只列完目前finite instance。'
    : this.appliedOnce()
      ? `${pairLabel(this.r())}保持ambient可見；${pairLabel(this.product())}取得r·a certificate，因此不能在a歸零後保持非零。`
      : '先追蹤預設non-degenerate multiplier；r、a與r·a會保持三個不同roles。');
  key = pairKey;
  label = pairLabel;

  selectCoefficient(pair: Pair): void { this.rA.set(pair[0]); this.rB.set(pair[1]); }
  wasApplied(pair: Pair): boolean { return this.appliedKeys().includes(pairKey(pair)); }
  isForced(pair: Pair): boolean { return this.forcedMembers().some(member => pairKey(member) === pairKey(pair)); }
  coefficientCount(output: Pair): number {
    return this.board.filter(pair => this.wasApplied(pair) && pairKey(multiplyPairs(pair, this.seed)) === pairKey(output)).length;
  }
  applyCurrent(): void {
    const key = pairKey(this.r());
    if (!this.appliedKeys().includes(key)) this.appliedKeys.update(keys => [...keys, key]);
  }
  nextCoefficient(): void {
    const next = this.board.find(pair => !this.wasApplied(pair));
    if (!next) return;
    this.selectCoefficient(next);
    this.applyCurrent();
  }
  completeScan(): void { this.appliedKeys.set(this.board.map(pairKey)); }
  reset(): void {
    this.rA.set(3); this.rB.set(3); this.appliedKeys.set([]); this.prediction.set(null); this.transferAnswer.set(null);
  }
  private uniqueProducts(coefficients: readonly Pair[]): Pair[] {
    const seen = new Map<string, Pair>();
    for (const coefficient of coefficients) {
      const output = multiplyPairs(coefficient, this.seed);
      seen.set(pairKey(output), output);
    }
    return [...seen.values()].sort((left, right) => pairKey(left).localeCompare(pairKey(right)));
  }
}
