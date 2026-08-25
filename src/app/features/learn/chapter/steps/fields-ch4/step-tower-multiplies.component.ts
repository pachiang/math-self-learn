import { Component, computed, signal } from '@angular/core';
import { TowerPreset, productLabel, towerProduct, towerSum } from './fields-ch4-model';

const TOWERS: TowerPreset[] = [
  {
    id: 't23',
    label: 'ℚ ⊂ ℚ(√2) ⊂ ℚ(√2, ∛2)',
    midField: 'ℚ(√2)',
    topField: 'ℚ(√2, ∛2)',
    botBasis: ['1', '√2'],
    topBasis: ['1', '∛2', '∛4'],
  },
  {
    id: 't22',
    label: 'ℚ ⊂ ℚ(√2) ⊂ ℚ(√2, √3)',
    midField: 'ℚ(√2)',
    topField: 'ℚ(√2, √3)',
    botBasis: ['1', '√2'],
    topBasis: ['1', '√3'],
  },
  {
    id: 't32',
    label: 'ℚ ⊂ ℚ(∛2) ⊂ ℚ(∛2, √3)',
    midField: 'ℚ(∛2)',
    topField: 'ℚ(∛2, √3)',
    botBasis: ['1', '∛2', '∛4'],
    topBasis: ['1', '√3'],
  },
];

@Component({
  selector: 'app-fields-ch4-tower-multiplies',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 4.1</p>
        <h2>疊起來，維度是相乘不是相加</h2>
        <p class="lede">
          Ch3 讓我們一次造一個擴張。把它們<strong>疊成一座塔</strong>時，總維度是相乘：<code>[L:F] = [L:K][K:F]</code>。
          原因看得見——大 field 的一組基底，恰好是<strong>兩層基底的所有乘積</strong>。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>ℚ(√2) 再疊上 ∛2，總維度是 2 + 3 = 5 還是 2 × 3 = 6？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'sum'" (click)="prediction.set('sum')">5（相加）</button>
          <button type="button" [class.active]="prediction() === 'prod'" (click)="prediction.set('prod')">6（相乘）</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'sum'">
            {{ prediction() === 'prod'
              ? '對。下面的 grid 有 2×3 = 6 格，每格一個基底乘積——相加對不上格數。'
              : '不是相加：basis 是「兩層乘積」，2×3 = 6 格。（2×2=4 會剛好等於 2+2，別被那個巧合騙。）' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選塔">
        <span class="kicker">TOWER</span>
        @for (t of towers; track t.id) {
          <button type="button" [class.active]="tower().id === t.id" (click)="tower.set(t)">{{ t.label }}</button>
        }
      </div>

      <section class="stage grid-stage">
        <div class="grid-board">
          <p class="board-scope">basis grid · 列 = 下層 [K:F]，行 = 上層 [L:K]，每格 = 乘積</p>
          <div class="basis-grid" [style.grid-template-columns]="'auto repeat(' + cols() + ', 1fr)'" role="table">
            <div class="bg-corner" role="columnheader"></div>
            @for (c of tower().topBasis; track $index) {
              <div class="bg-head col" role="columnheader">{{ c }}</div>
            }
            @for (r of tower().botBasis; track $index; let ri = $index) {
              <div class="bg-head row" role="rowheader">{{ r }}</div>
              @for (c of tower().topBasis; track $index) {
                <div class="bg-cell" role="cell">{{ product(r, c) }}</div>
              }
            }
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">維度＝格數</p>
          <h3>[{{ tower().topField }} : ℚ] = {{ prod() }}</h3>
          <p>{{ rows() }}（下層）× {{ cols() }}（上層）= {{ prod() }} 格，每格一個基底乘積。</p>
          <div class="readout">相乘 {{ rows() }}×{{ cols() }} = {{ prod() }}。（相加只有 {{ sum() }}，對不上格數）</div>
          <p class="evidence-tag">證據強度：GENERAL ARGUMENT（乘積 grid 張成整個上層 field）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">×</span>
        <div>
          <strong>疊一座塔，維度相乘</strong>
          <span>——因為大 basis 是兩層 basis 的所有乘積 <code>{{ '{' }} bᵢ · cⱼ {{ '}' }}</code>；格數 = 列 × 行。</span>
        </div>
      </section>

      <details>
        <summary>符號層：tower law</summary>
        <p>
          若 <code>F ⊆ K ⊆ L</code>，則 <code>[L:F] = [L:K][K:F]</code>。取 <code>K</code>-over-<code>F</code> 的 basis
          <code>{{ '{' }}bᵢ{{ '}' }}</code> 與 <code>L</code>-over-<code>K</code> 的 basis <code>{{ '{' }}cⱼ{{ '}' }}</code>，
          則 <code>{{ '{' }}bᵢcⱼ{{ '}' }}</code> 是 <code>L</code>-over-<code>F</code> 的 basis（需 <code>{{ '{' }}cⱼ{{ '}' }}</code> over 中間 field K 獨立）——共
          <code>[L:K]·[K:F]</code> 個。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh4TowerMultipliesComponent {
  readonly towers = TOWERS;
  readonly tower = signal<TowerPreset>(TOWERS[0]);
  readonly prediction = signal<'sum' | 'prod' | null>(null);

  readonly rows = computed(() => this.tower().botBasis.length);
  readonly cols = computed(() => this.tower().topBasis.length);
  readonly prod = computed(() => towerProduct(this.tower()));
  readonly sum = computed(() => towerSum(this.tower()));

  product(r: string, c: string): string {
    return productLabel(r, c);
  }
}
