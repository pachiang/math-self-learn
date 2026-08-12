import { Component, computed, signal } from '@angular/core';
import {
  FUNCTION_SEED,
  multiplyPairs,
  Pair,
  pairKey,
  pairLabel,
  principalPairCertificates,
  subtractPairs,
} from './rings-ch10-model';

type ContractRoute = 'difference' | 'absorption';
type ExtremeSeed = 'zero' | 'unit';

@Component({
  selector: 'app-rings-ch10-principal-ideal-contract',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 10.2</p>
        <h2>所有 r·a 正好形成一塊可以安全一起歸零的 region</h2>
        <p class="lede">上一節找出每張被a拖向0的card。現在檢查這整塊region：兩張未來的zero做difference，或再被ambient element乘一次，都不能逃回可見世界。</p>
      </header>
      <span class="map-convention">PRE-QUOTIENT AUDIT · GENERAL SAFE-COLLAPSE MECHANISM</span>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>若r₁a與r₂a都必須歸零，它們的difference能否留在zero region外？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不能，difference也被迫歸零</button><button type="button" (click)="prediction.set(true)">可以，它是新的card</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '若兩張都代表未來的0，它們的difference也必須代表0；共同的a讓這項義務仍有coefficient證書。' : '對。接著用difference與ambient multiplication檢查這塊collapse region的兩個安全port。' }}</p> }
      </section>

      <div class="control-row">
        <span class="kicker">ACTIVE ROUTE</span>
        <button type="button" [class.active]="route()==='difference'" (click)="runDifference()">− TEST ZERO DIFFERENCE</button>
        <button type="button" class="multiply" [class.active]="route()==='absorption'" (click)="runAbsorption()">× TEST AMBIENT MULTIPLY</button>
        <button type="button" (click)="reset()">RESET</button>
      </div>

      <section class="stage stage-grid">
        <div class="principal-contract-lab">
          <section class="certificate-tray">
            <div class="tray-heading"><p class="kicker">CANDIDATE ZERO REGION · (a)</p><strong>每張card都有「被a拖走」的證書</strong></div>
            <div class="pair-board principal">
              @for (certificate of certificates; track key(certificate.output)) {
                <div class="pair-card member forced-zero"><strong>{{ label(certificate.output) }}</strong><small>{{ label(certificate.coefficient) }}·a → 0</small></div>
              }
            </div>
          </section>

          <section class="coefficient-route" [class.absorption]="route()==='absorption'" aria-live="polite">
            @if (route() === 'difference') {
              <div class="equation-card zero-requested"><small>FUTURE ZERO</small><strong>{{ label(leftMultiple) }}</strong><span>{{ label(leftCoefficient) }}·a → 0</span></div>
              <div class="route-operation">−</div>
              <div class="equation-card zero-requested"><small>FUTURE ZERO</small><strong>{{ label(rightMultiple) }}</strong><span>{{ label(rightCoefficient) }}·a → 0</span></div>
              <div class="pipeline-arrow">→</div>
              <div class="equation-card result forced-zero" [class.revealed]="differenceChecked()"><small>STILL FUTURE ZERO</small><strong>{{ differenceChecked() ? label(differenceOutput) : '?' }}</strong><span>{{ differenceChecked() ? label(differenceCoefficient) + '·a → 0' : 'run route' }}</span></div>
            } @else {
              <div class="equation-card ambient"><small>AMBIENT s</small><strong>{{ label(ambientCoefficient) }}</strong><span>outside allowed</span></div>
              <div class="route-operation">×</div>
              <div class="equation-card zero-requested"><small>FUTURE ZERO</small><strong>{{ label(leftMultiple) }}</strong><span>{{ label(leftCoefficient) }}·a → 0</span></div>
              <div class="pipeline-arrow">→</div>
              <div class="equation-card result forced-zero" [class.revealed]="absorptionChecked()"><small>STILL FUTURE ZERO</small><strong>{{ absorptionChecked() ? label(absorptionOutput) : '?' }}</strong><span>{{ absorptionChecked() ? label(absorptionCoefficient) + '·a → 0' : 'run route' }}</span></div>
            }
          </section>

          <aside class="two-port-ledger">
            <div class="contract-line" [class.checked]="differenceChecked()"><strong>{{ differenceChecked() ? '✓' : '?' }} DIFFERENCE PORT</strong><span>(r₁−r₂)·a</span></div>
            <div class="contract-line" [class.checked]="absorptionChecked()"><strong>{{ absorptionChecked() ? '✓' : '?' }} AMBIENT PORT</strong><span>(sr₁)·a</span></div>
            @if (contractComplete()) { <div class="ideal-nameplate">(a)<br><small>SAFE COLLAPSE REGION · 主理想</small></div> }
          </aside>
        </div>
        <aside class="console" aria-live="polite">
          <span class="evidence-badge">{{ contractComplete() ? 'GENERAL ARGUMENT' : 'CONTRACT ASSEMBLY' }}</span>
          <h3>{{ contractComplete() ? '(a) CAN COLLAPSE WITHOUT LEAKS' : routeTitle() }}</h3>
          <p>{{ routeReading() }}</p>
          <div class="readout">{{ activeEquation() }}</div>
        </aside>
      </section>

      @if (contractComplete()) {
        <section class="transfer-strip">
          <div><p class="kicker">EXTREME SEEDS</p><strong>只換 seed，固定 ambient-coefficient mechanism</strong></div>
          <div class="choice-row"><button type="button" [class.active]="extreme()==='zero'" (click)="extreme.set('zero')">SEED 0</button><button type="button" [class.active]="extreme()==='unit'" (click)="extreme.set('unit')">SEED 1</button></div>
          @if (extreme() === 'zero') { <p class="feedback">指定0歸零不會拖走新card：每個r·0=0，所以(0)=&#123;0&#125;。</p> }
          @if (extreme() === 'unit') { <p class="feedback">若指定1歸零，每個x=x·1都被迫歸零，所以(1)=R；整個ring會一起collapse。</p> }
        </section>
      }

      <section class="insight"><span class="insight-icon">(a)</span><div><strong>(a) 是指定 a→0 後完整且安全的 forced-zero region</strong><span>Difference與ambient multiplication只更新coefficient；任何輸出仍帶有「multiple of a」證書。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 10.3</strong><p>若同時指定兩個seeds歸零，只把兩塊principal zero regions疊在一起，會漏掉什麼？</p></div>
      <details><summary>正式定義與本頁邊界</summary><p>在commutative unital ring R中，由a產生的主理想（principal ideal）記為(a)=&#123;ra:r∈R&#125;。Difference route給r₁a−r₂a=(r₁−r₂)a；absorption route給s(r₁a)=(sr₁)a。本頁仍只稽核「哪些元素可以安全一起歸零」，尚未把它們真的換成quotient中的單一0；那個動作留到Ch11。</p></details>
    </article>
  `,
})
export class RingsCh10PrincipalIdealContractComponent {
  readonly seed = FUNCTION_SEED;
  readonly certificates = principalPairCertificates();
  readonly leftCoefficient: Pair = [3, 3];
  readonly rightCoefficient: Pair = [1, 0];
  readonly ambientCoefficient: Pair = [2, 3];
  readonly leftMultiple = multiplyPairs(this.leftCoefficient, this.seed);
  readonly rightMultiple = multiplyPairs(this.rightCoefficient, this.seed);
  readonly differenceCoefficient = subtractPairs(this.leftCoefficient, this.rightCoefficient);
  readonly differenceOutput = subtractPairs(this.leftMultiple, this.rightMultiple);
  readonly absorptionCoefficient = multiplyPairs(this.ambientCoefficient, this.leftCoefficient);
  readonly absorptionOutput = multiplyPairs(this.ambientCoefficient, this.leftMultiple);
  readonly route = signal<ContractRoute>('difference');
  readonly differenceChecked = signal(false);
  readonly absorptionChecked = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly extreme = signal<ExtremeSeed | null>(null);
  readonly contractComplete = computed(() => this.differenceChecked() && this.absorptionChecked());
  readonly routeTitle = computed(() => this.route() === 'difference' ? 'ZERO DIFFERENCE MUST STAY ZERO' : 'AMBIENT MULTIPLY MUST STAY ZERO');
  readonly routeReading = computed(() => this.route() === 'difference'
    ? '兩張future-zero cards相減後，共同的seed a仍在；只把r₁與r₂換成difference coefficient。'
    : '外部s仍可見，但它只會和既有r₁合成新coefficient；輸出繼續被a拖向0。');
  readonly activeEquation = computed(() => this.route() === 'difference'
    ? `${pairLabel(this.leftMultiple)}−${pairLabel(this.rightMultiple)}=${pairLabel(this.differenceOutput)} = ${pairLabel(this.differenceCoefficient)}·a`
    : `${pairLabel(this.ambientCoefficient)}·${pairLabel(this.leftMultiple)}=${pairLabel(this.absorptionOutput)} = ${pairLabel(this.absorptionCoefficient)}·a`);
  key = pairKey;
  label = pairLabel;
  runDifference(): void { this.route.set('difference'); this.differenceChecked.set(true); }
  runAbsorption(): void { this.route.set('absorption'); this.absorptionChecked.set(true); }
  reset(): void {
    this.route.set('difference'); this.differenceChecked.set(false); this.absorptionChecked.set(false); this.prediction.set(null); this.extreme.set(null);
  }
}
