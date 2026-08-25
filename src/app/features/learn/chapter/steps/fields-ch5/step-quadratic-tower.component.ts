import { Component, computed, signal } from '@angular/core';

type Step = 'q' | 'l'; // q = 線∩圓/圓∩圓（二次，×2）；l = 線∩線（一次，×1）

type TowerRow =
  | { t: 'node'; label: string; cls: string }
  | { t: 'edge'; factor: number };

@Component({
  selector: 'app-fields-ch5-quadratic-tower',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 5.2</p>
        <h2>作圖 = 二次擴張的塔 → 維度是 2 的冪</h2>
        <p class="lede">
          把一步步作圖串起來，右邊的 field 塔就一層層長高。每個「解到二次」的步驟讓塔 <strong>×2</strong>、「線∩線」只 <strong>×1</strong>。
          由 Ch4 的 tower law，總維度是各層相乘——因子全是 2 → <strong>一定是 2 的冪</strong>。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>若中間混入一步「線∩線」（只 ×1），總維度會是 2^(總步數) 還是 2^(二次步數)？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'all'" (click)="prediction.set('all')">2^(總步數)</button>
          <button type="button" [class.active]="prediction() === 'quad'" (click)="prediction.set('quad')">2^(二次步數)</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'all'">
            {{ prediction() === 'quad'
              ? '對。線∩線 ×1 不長高，所以維度是 2^(解到二次的步數)。下面自己疊塔看。'
              : '線∩線只乘 1，不長高；維度是 2^(二次步數)，不是 2^(總步數)。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="疊作圖步驟">
        <span class="kicker">加一步</span>
        <button type="button" (click)="add('q')">線∩圓（二次 ×2）</button>
        <button type="button" (click)="add('l')">線∩線（一次 ×1）</button>
        <button type="button" (click)="reset()">重設</button>
      </div>

      <section class="stage tower-stage">
        <div class="steps-board">
          <p class="board-scope">左：作圖步驟序列</p>
          <div class="step-chips">
            @for (s of steps(); track $index; let i = $index) {
              <span class="step-chip" [class.quad]="s === 'q'" [class.lin]="s === 'l'">
                {{ i + 1 }}. {{ s === 'q' ? '線∩圓 ×2' : '線∩線 ×1' }}
              </span>
            }
            @if (!steps().length) { <span class="step-empty">還沒有步驟——按上面加一步。</span> }
          </div>
        </div>

        <div class="tower-board">
          <p class="board-scope is-field">右：field 塔（維度＝各層相乘）</p>
          <div class="tower-col">
            @for (row of towerRows(); track $index) {
              @if (row.t === 'node') {
                <div class="tower-node" [class.top]="row.cls === 'top'" [class.base]="row.cls === 'base'">{{ row.label }}</div>
              } @else {
                <div class="tower-edge" [class.x1]="row.factor === 1"><span>×{{ row.factor }}</span></div>
              }
            }
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">總維度</p>
          <h3>[ℚ(x) : ℚ] = 2<sup>{{ quadCount() }}</sup> = {{ totalDim() }}</h3>
          <p>二次步數 m = {{ quadCount() }}（線∩線那 {{ linCount() }} 步只乘 1，不長高）。</p>
          <div class="readout">因子全是 1 或 2 → 相乘後必是 2 的冪。</div>
          <p class="evidence-tag">證據強度：GENERAL ARGUMENT（tower law + 每步 ≤ 2）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">2ᵐ</span>
        <div>
          <strong>一串二次步驟疊成一座塔，維度是各層相乘</strong>
          <span>——因子全是 2 → 作圖數的維度<strong>必是 2 的冪</strong> <code>[ℚ(x):ℚ] = 2ᵐ</code>。</span>
        </div>
      </section>

      <details>
        <summary>符號層：constructible ⇒ 2 的冪</summary>
        <p>
          若 <code>x</code> 可作圖，則存在塔 <code>ℚ = K₀ ⊆ K₁ ⊆ … ⊆ Kₙ ∋ x</code>，每層 <code>[Kᵢ:Kᵢ₋₁] ∈ {{ '{' }}1, 2{{ '}' }}</code>。由 tower law，
          <code>[Kₙ:ℚ]</code> 是這些因子的乘積，故 <code>[ℚ(x):ℚ]</code> 整除 <code>[Kₙ:ℚ] = 2ᵐ</code>——必是 2 的冪。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh5QuadraticTowerComponent {
  readonly steps = signal<Step[]>(['q', 'q']);
  readonly prediction = signal<'all' | 'quad' | null>(null);

  readonly quadCount = computed(() => this.steps().filter((s) => s === 'q').length);
  readonly linCount = computed(() => this.steps().filter((s) => s === 'l').length);
  readonly totalDim = computed(() => 2 ** this.quadCount());

  readonly towerRows = computed<TowerRow[]>(() => {
    const factors = this.steps().map((s) => (s === 'q' ? 2 : 1));
    const dims: number[] = [1];
    for (const f of factors) dims.push(dims[dims.length - 1] * f);
    const n = factors.length; // dims 長度 n+1
    const rows: TowerRow[] = [];
    for (let i = n; i >= 0; i--) {
      const label =
        i === n ? `ℚ(x) · 維度 ${dims[n]}` : i === 0 ? 'ℚ · 維度 1' : `維度 ${dims[i]}`;
      const cls = i === n ? 'top' : i === 0 ? 'base' : '';
      rows.push({ t: 'node', label, cls });
      if (i > 0) rows.push({ t: 'edge', factor: factors[i - 1] });
    }
    return rows;
  });

  add(s: Step): void {
    if (this.steps().length >= 6) return;
    this.steps.set([...this.steps(), s]);
  }
  reset(): void {
    this.steps.set(['q', 'q']);
    this.prediction.set(null);
  }
}
