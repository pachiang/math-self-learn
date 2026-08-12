import { Component, computed, signal } from '@angular/core';
import {
  multiplyPairs,
  Pair,
  pairLabel,
  subtractPairs,
} from '../rings-ch10/rings-ch10-model';
import {
  addPairs,
  DIAGONAL_SUBGROUP,
  FUNCTION_IDEAL,
  QuotientOperation,
  sameUnderPairBoundary,
} from './rings-ch11-model';

type BoundaryChoice = 'subgroup' | 'ideal';

@Component({
  selector: 'app-rings-ch11-operation-representative-safety',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 11.3</p>
        <h2>代表可以任換，operation 的 output coset 就不能跟著變</h2>
        <p class="lede">把同一個input coset的兩個handles送進完全相同的計算。Addition只需要noise能相加；multiplication還會把noise乘上ambient element，因此需要ideal的absorption contract。</p>
      </header>
      <span class="map-convention">WELL-DEFINEDNESS AUDIT · SAME INPUT CLASSES MUST PRODUCE THE SAME OUTPUT CLASS</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>一個additive subgroup已足以形成cosets；是否也自動保證coset multiplication安全？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不一定，product noise可能逃出</button><button type="button" (click)="prediction.set(true)">會，cosets已經分好了</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'Cosets只保證additive identification；把noise乘上ambient y後，仍可能離開zero class。' : '對。先在D上跑addition，再切到multiplication看同一個representative swap分岔。' }}</p> }
      </section>

      <div class="control-row">
        <span class="kicker">ZERO CLASS</span>
        <button type="button" [class.active]="boundaryChoice()==='subgroup'" (click)="setBoundary('subgroup')">D · ADDITIVE SUBGROUP</button>
        <button type="button" class="multiply" [class.active]="boundaryChoice()==='ideal'" (click)="setBoundary('ideal')">K · IDEAL REPAIR</button>
        <span class="kicker">OPERATION</span>
        <button type="button" [class.active]="operation()==='add'" (click)="setOperation('add')">+</button>
        <button type="button" [class.active]="operation()==='multiply'" (click)="setOperation('multiply')">×</button>
        <button type="button" (click)="runSwap()">RUN REPRESENTATIVE SWAP</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="operation-safety-lab">
          <section class="zero-class-rack" [class.ideal]="boundaryChoice()==='ideal'">
            <div class="tray-heading"><p class="kicker">COLLAPSED ZERO CLASS · {{ boundaryLabel() }}</p><strong>{{ activeBoundary().length }} pair cards</strong></div>
            <div class="pair-member-line">@for (member of activeBoundary(); track label(member)) { <span>{{ label(member) }}</span> }</div>
          </section>

          <section class="representative-equivalence">
            <div><small>SAME INPUT COSET · HANDLE A</small><strong>{{ label(baseX) }}</strong></div>
            <div class="noise-certificate"><small>difference</small><strong>{{ label(inputNoise) }}</strong><span>∈ {{ boundaryLabel() }}</span></div>
            <div><small>SAME INPUT COSET · HANDLE B</small><strong>{{ label(alternateX) }}</strong></div>
          </section>

          <section class="parallel-compute" aria-live="polite">
            <div class="compute-lane">
              <small>HANDLE A ROUTE</small><div><strong>{{ label(baseX) }}</strong><b>{{ operationSymbol() }}</b><strong>{{ label(fixedY) }}</strong></div>
              <span>→</span><strong class="output-pair">{{ swapRun() ? label(baseOutput()) : '?' }}</strong>
            </div>
            <div class="compute-lane alternate">
              <small>HANDLE B ROUTE</small><div><strong>{{ label(alternateX) }}</strong><b>{{ operationSymbol() }}</b><strong>{{ label(fixedY) }}</strong></div>
              <span>→</span><strong class="output-pair">{{ swapRun() ? label(alternateOutput()) : '?' }}</strong>
            </div>
          </section>

          <section class="output-difference" [class.safe]="swapRun() && outputsSame()" [class.split]="swapRun() && !outputsSame()">
            <small>OUTPUT DIFFERENCE</small><strong>{{ swapRun() ? label(outputNoise()) : '?' }}</strong>
            <span>{{ swapRun() ? (outputsSame() ? 'IN ZERO CLASS · SAME OUTPUT COSET' : 'ESCAPES ZERO CLASS · TWO OUTPUT COSETS') : 'run both routes' }}</span>
          </section>
        </div>

        <aside class="console" aria-live="polite">
          <span class="evidence-badge">REPRESENTATIVE-INDEPENDENCE TEST</span>
          <h3>{{ verdictTitle() }}</h3>
          <p>{{ verdictReading() }}</p>
          <div class="readout">same input coset {{ inputSame() ? '✓' : '×' }} · same output coset {{ swapRun() ? (outputsSame() ? '✓' : '×') : '?' }}</div>
        </aside>
      </section>

      <section class="insight"><span class="insight-icon">well-defined</span><div><strong>Ideal正是讓兩種operations都不依賴representative的difference set</strong><span>Addition保留原noise；multiplication會產生ambient multiple of noise，所以還需要absorption。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 11.4</strong><p>當zero class真的是ideal，兩種operations都安全；現在如何把cosets正式組成一個新的ring？</p></div>
      <details><summary>一般計算：noise為什麼不會改變output class？</summary><p>若x'=x+i、y'=y+j且i,j∈I，則(x'+y')−(x+y)=i+j∈I。乘法則有x'y'−xy=xj+iy+ij；ideal absorption保證三項都在I。只有additive subgroup時，xj或iy可能逃出zero class，畫面的D就是反例。</p></details>
    </article>
  `,
})
export class RingsCh11OperationRepresentativeSafetyComponent {
  readonly baseX: Pair = [1, 0];
  readonly alternateX: Pair = [3, 2];
  readonly fixedY: Pair = [1, 0];
  readonly inputNoise = subtractPairs(this.baseX, this.alternateX);
  readonly boundaryChoice = signal<BoundaryChoice>('subgroup');
  readonly operation = signal<QuotientOperation>('add');
  readonly swapRun = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly activeBoundary = computed(() => this.boundaryChoice() === 'subgroup' ? DIAGONAL_SUBGROUP : FUNCTION_IDEAL);
  readonly boundaryLabel = computed(() => this.boundaryChoice() === 'subgroup' ? 'D' : 'K=(1,2)');
  readonly operationSymbol = computed(() => this.operation() === 'add' ? '+' : '×');
  readonly baseOutput = computed(() => this.operate(this.baseX, this.fixedY));
  readonly alternateOutput = computed(() => this.operate(this.alternateX, this.fixedY));
  readonly outputNoise = computed(() => subtractPairs(this.baseOutput(), this.alternateOutput()));
  readonly inputSame = computed(() => sameUnderPairBoundary(this.baseX, this.alternateX, this.activeBoundary()));
  readonly outputsSame = computed(() => sameUnderPairBoundary(this.baseOutput(), this.alternateOutput(), this.activeBoundary()));
  readonly verdictTitle = computed(() => !this.swapRun()
    ? 'READY TO SWAP ONE HANDLE'
    : this.outputsSame() ? 'SAFE · OUTPUT CLASS UNCHANGED' : 'AMBIGUOUS · MULTIPLICATION SPLITS');
  readonly verdictReading = computed(() => {
    if (!this.swapRun()) return '兩條routes只替換同一input coset的handle；另一個input與operation保持固定。';
    if (this.outputsSame()) return this.operation() === 'add'
      ? '兩個raw sums不同，但difference仍在D；addition只搬運原本的additive noise。'
      : '切換到ideal K後，product noise被ambient absorption留在zero class，兩個raw products重新合併。';
    return `${pairLabel(this.outputNoise())}∉D：同一個input coset竟得到兩個output cosets，所以D上不能定義multiplication。`;
  });
  label = pairLabel;

  setBoundary(choice: BoundaryChoice): void { this.boundaryChoice.set(choice); this.swapRun.set(false); }
  setOperation(operation: QuotientOperation): void { this.operation.set(operation); this.swapRun.set(false); }
  runSwap(): void { this.swapRun.set(true); }
  reset(): void {
    this.boundaryChoice.set('subgroup'); this.operation.set('add'); this.swapRun.set(false); this.prediction.set(null);
  }

  private operate(left: Pair, right: Pair): Pair {
    return this.operation() === 'add' ? addPairs(left, right) : multiplyPairs(left, right);
  }
}
