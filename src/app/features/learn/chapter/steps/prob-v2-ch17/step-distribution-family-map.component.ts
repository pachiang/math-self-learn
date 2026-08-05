import { Component, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type Route = 'sum' | 'square' | 'ratio';

@Component({
  selector: 'app-prob-v2-distribution-family-map',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch17">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 17.8</p>
        <h2>Distribution family map 要沿著 verbs 讀，而不是沿著 names 背</h2>
        <p class="lede">
          Normal、χ²、Gamma、Beta 的關係都可以用操作重建。點選一條路，地圖只高亮 source、operation
          與 output；真正要記的是箭頭上的 verb。
        </p>
      </header>
      <section class="family-route-picker">
        <button type="button" [class.active]="route() === 'sum'" (click)="route.set('sum')">
          <span>ADD</span><strong>small signed effects → Normal</strong></button
        ><button type="button" [class.active]="route() === 'square'" (click)="route.set('square')">
          <span>SQUARE + SUM</span><strong>Normals → χ² / Gamma</strong></button
        ><button type="button" [class.active]="route() === 'ratio'" (click)="route.set('ratio')">
          <span>NORMALIZE</span><strong>positive weights → Beta</strong>
        </button>
      </section>
      <section class="distribution-map">
        <div class="map-sources">
          <article [class.active]="route() === 'sum'">
            <span>SOURCES</span><strong>small signed effects</strong>
          </article>
          <article [class.active]="route() === 'square'">
            <span>SOURCES</span><strong>standard Normals Zᵢ</strong>
          </article>
          <article [class.active]="route() === 'ratio'">
            <span>SOURCES</span><strong>positive Gamma weights</strong>
          </article>
        </div>
        <div class="map-verbs">
          <i [class.active]="route() === 'sum'">add many</i
          ><i [class.active]="route() === 'square'">square, then add</i
          ><i [class.active]="route() === 'ratio'">divide by total</i>
        </div>
        <div class="map-outputs">
          <article [class.active]="route() === 'sum'">
            <strong>Normal</strong><small>signed location-scale</small>
          </article>
          <article [class.active]="route() === 'square'">
            <strong>χ² = Gamma</strong><small>nonnegative energy</small>
          </article>
          <article [class.active]="route() === 'ratio'">
            <strong>Beta</strong><small>bounded share [0,1]</small>
          </article>
        </div>
        <div class="map-reading">
          <span>CURRENT ROUTE</span><strong>{{ readings[route()].title }}</strong>
          <p>{{ readings[route()].text }}</p>
        </div>
      </section>
      <aside class="insight-card">
        <div class="normal-family-core">
          <span>source</span><i>+ operation</i><strong>→ support and shape</strong>
        </div>
        <div>
          <span class="card-label">Support 是 operation 留下的第一條線索</span>
          <p>
            <strong
              >Signed sum 可走遍實數；square sum 只能非負；normalize ratio 被限制在 0 與 1
              之間。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>完整符號地圖與下一章邊界</summary>
        <div class="normal-formulas">
          <app-math
            e="Z_i\\sim N(0,1)\\Rightarrow\\sum Z_i^2\\sim\\chi_\\nu^2=\\operatorname{Gamma}(\\nu/2,1/2)"
          /><app-math e="G_1/(G_1+G_2)\\sim\\operatorname{Beta}(\\alpha,\\beta)" />
          <p>
            「為什麼許多非 Normal sources 的標準化總和也趨向 Normal？」不是本章假定，而是第十九章
            Central Limit Theorem 的主題。下一章先處理平均值為何穩定。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2DistributionFamilyMapComponent {
  readonly route = signal<Route>('square');
  readonly readings = {
    sum: {
      title: 'Add signed effects',
      text: '方向仍被保留，output 住在整條 real line；許多小 contributions 常形成 Normal-like noise。',
    },
    square: {
      title: 'Square and add coordinates',
      text: 'Sign 被刪除，每個 coordinate 變成 energy；總 energy 形成 χ²，也就是特定 Gamma。',
    },
    ratio: {
      title: 'Normalize positive totals',
      text: 'Total size 被刪除，只留下 relative share；output 因而被鎖在 [0,1] 並形成 Beta。',
    },
  };
}
