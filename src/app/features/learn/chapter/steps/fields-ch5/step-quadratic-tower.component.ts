import { Component, computed, signal } from '@angular/core';

type Step = 'q' | 'l'; // q = 真正加入新平方根（×2）；l = 沒有加入新方向（×1）

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
          把一步步作圖串起來，得到的是一個<strong>容納目標 x 的 construction field Kₘ</strong>。真的加入新平方根才讓塔 <strong>×2</strong>；
          沒有新方向的步驟只 <strong>×1</strong>。先算整座塔，再看住在裡面的 <code>ℚ(x)</code>——兩者不能畫成同一個 field。
        </p>
      </header>

      <span class="map-convention">STRAIGHTEDGE + COMPASS ONLY · AMBIENT Kₘ ≠ TARGET ℚ(x) · NECESSARY CONDITION</span>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>若三步中只有兩步真的加入新平方根，construction field 的維度是多少？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'all'" (click)="prediction.set('all')">2³ = 8</button>
          <button type="button" [class.active]="prediction() === 'quad'" (click)="prediction.set('quad')">2² = 4</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'all'">
            {{ prediction() === 'quad'
              ? '對。只數真正產生新平方根的 degree-2 layers；×2、×2、×1 得到 4。下面自己疊塔看。'
              : '不是每個操作都讓 field 變大；只數真正的 degree-2 layers，所以 ×2·×2·×1 = 4。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="疊作圖步驟">
        <span class="kicker">加一步</span>
        <button type="button" (click)="add('q')">加入新平方根（×2）</button>
        <button type="button" (click)="add('l')">沒有新方向（×1）</button>
        <button type="button" (click)="reset()">重設</button>
      </div>

      <section class="stage tower-stage">
        <div class="steps-board">
          <p class="board-scope">左：作圖步驟序列</p>
          <div class="step-chips">
            @for (s of steps(); track $index; let i = $index) {
              <span class="step-chip" [class.quad]="s === 'q'" [class.lin]="s === 'l'">
                {{ i + 1 }}. {{ s === 'q' ? '新平方根 ×2' : '無新方向 ×1' }}
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
                <div class="tower-node" [class.top]="row.cls === 'top'" [class.base]="row.cls === 'base'">
                  {{ row.label }}
                  @if (row.cls === 'top') { <span class="target-pocket">ℚ(x) ⊆ Kₘ · target lives here</span> }
                </div>
              } @else {
                <div class="tower-edge" [class.x1]="row.factor === 1"><span>×{{ row.factor }}</span></div>
              }
            }
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">先量容器，再量目標</p>
          <h3>[Kₘ : ℚ] = 2<sup>{{ quadCount() }}</sup> = {{ totalDim() }}</h3>
          <p>{{ quadCount() }} 個真正的 degree-2 layers；另外 {{ linCount() }} 步只乘 1。</p>
          <div class="field-role-readout"><strong>AMBIENT</strong><span>Kₘ 的維度 = {{ totalDim() }}</span></div>
          <div class="field-role-readout target"><strong>TARGET</strong><span>[ℚ(x):ℚ] ∣ {{ totalDim() }}，所以仍是 2 的冪</span></div>
          <p class="evidence-tag">證據強度：GENERAL ARGUMENT（tower law + 每步 ≤ 2）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">2ᵐ</span>
        <div>
          <strong>二次塔先限制容器；整除關係再限制住在裡面的目標</strong>
          <span>——<code>[Kₘ:ℚ]=2ʳ</code>，而 <code>[ℚ(x):ℚ] ∣ 2ʳ</code>，所以作圖數的 degree 必是 2 的冪。</span>
        </div>
      </section>

      <details>
        <summary>符號層：constructible ⇒ 2 的冪</summary>
        <p>
          若 <code>x</code> 可作圖，則存在塔 <code>ℚ = K₀ ⊆ K₁ ⊆ … ⊆ Kₙ ∋ x</code>，每層 <code>[Kᵢ:Kᵢ₋₁] ∈ {{ '{' }}1, 2{{ '}' }}</code>。由 tower law，
          <code>[Kₙ:ℚ]</code> 是這些因子的乘積，故為 <code>2ʳ</code>。因為 <code>ℚ ⊆ ℚ(x) ⊆ Kₙ</code>，再用一次 tower law，
          <code>[ℚ(x):ℚ]</code> 整除 <code>[Kₙ:ℚ]=2ʳ</code>，所以它也是 2 的冪。注意：兩個 degree 通常不必相等。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh5QuadraticTowerComponent {
  readonly steps = signal<Step[]>(['q', 'l', 'q']);
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
        i === n ? `Kₘ · ambient 維度 ${dims[n]}` : i === 0 ? 'ℚ · 維度 1' : `K${i} · 維度 ${dims[i]}`;
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
    this.steps.set(['q', 'l', 'q']);
    this.prediction.set(null);
  }
}
