import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-combination-clusters',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch6">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 6.3</p>
        <h2>若交換順序不會改變 outcome，就把那些 paths 合併</h2>
        <p class="lede">
          <strong>組合（combination）</strong>不是另一棵陌生的 tree。 它把「選到同一批
          objects、只是到達順序不同」的 ordered paths 壓進同一個 bucket。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">5 人選 3 人組 committee</p>
            <h3>點一個 group，看它背後收進多少 arrival orders</h3>
          </div>
          <p class="feedback">Committee 裡沒有第 1、2、3 名；ABC、BAC、CBA 的成員完全相同。</p>
        </div>
      </section>

      <section class="committee-layout">
        <div>
          <div class="split-heading">
            <div>
              <p class="eyebrow">Unordered groups</p>
              <h3>總共 10 個 committee buckets</h3>
            </div>
          </div>
          <div class="committee-list" role="group" aria-label="五人選三人的所有 committees">
            @for (committee of committees; track committee) {
              <button
                type="button"
                [class.active]="selectedCommittee() === committee"
                (click)="selectedCommittee.set(committee)"
              >
                {{ committee }}
              </button>
            }
          </div>
        </div>

        <div class="order-cluster">
          <span>SELECTED BUCKET · {{ selectedCommittee() }}</span>
          <h3>六條 ordered paths，壓成一個 group</h3>
          <div class="order-variants" aria-label="所選 committee 的六種 arrival orders">
            @for (variant of orderVariants(); track variant) {
              <div class="order-variant">{{ variant }}</div>
            }
          </div>
        </div>
      </section>

      <section class="cluster-arrow">
        <div>
          <span>若三個 slots 有角色</span>
          <strong>5 × 4 × 3 = 60 ordered paths</strong>
        </div>
        <i>每 6 條只差 order → 合併</i>
        <div>
          <span>Committee 沒有角色</span>
          <strong>60 ÷ 6 = 10 groups</strong>
        </div>
      </section>

      <aside class="insight-card">
        <div class="cluster-arrow" aria-hidden="true">
          <div>
            <span>ABC · BAC · CBA · …</span>
            <strong>不同 arrival paths</strong>
          </div>
          <i>same members</i>
          <div>
            <span>{{ '{A, B, C}' }}</span>
            <strong>同一 unordered outcome</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Combination 是 quotient-like compression</span>
          <p>
            <strong
              >如果重新排列已選 objects 不會產生新 outcome，就把 k! 個 order variants
              視為同一組。</strong
            >
            除以 k! 不是公式魔法，而是在移除已經不再有意義的 order 資訊。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：binomial coefficient 為什麼除以 k!？</summary>
        <div>
          <p>
            先把 k 個 chosen objects 放進 k 個有序 slots，得到
            <app-math e="P(n,k)" /> 條 paths。每個 unordered group 都被它自己的
            <app-math e="k!" /> 種 orders 重複描述，因此：
          </p>
          <div class="math-line">
            <app-math e="\\binom{n}{k}=\\frac{P(n,k)}{k!}=\\frac{n!}{k!(n-k)!}" />
          </div>
          <p>
            <app-math e="\\binom{n}{k}" /> 常讀作 “n choose k”。 使用前仍要先確認 objects
            distinct、只選一次，而且 group 內 order 不重要。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2CombinationClustersComponent {
  readonly committees = ['ABC', 'ABD', 'ABE', 'ACD', 'ACE', 'ADE', 'BCD', 'BCE', 'BDE', 'CDE'];
  readonly selectedCommittee = signal('ABC');
  readonly orderVariants = computed(() =>
    this.permutations(this.selectedCommittee().split('')).map((letters) => letters.join('')),
  );

  private permutations(items: string[]): string[][] {
    if (items.length <= 1) return [items];
    return items.flatMap((item, index) =>
      this.permutations(items.filter((_, itemIndex) => itemIndex !== index)).map((rest) => [
        item,
        ...rest,
      ]),
    );
  }
}
