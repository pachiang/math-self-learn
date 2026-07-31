import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-permutation-slots',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch6">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 6.2</p>
        <h2>位置有名字時，交換 objects 就產生新的 outcome</h2>
        <p class="lede">
          <strong>排列（permutation）</strong>是在 distinct objects 中依序填入有角色的 slots。
          填過的 object 不能重用，因此下一格的 choices 逐步減少。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Podium builder</p>
            <h3>n 位選手，要填入 k 個有順序的名次</h3>
          </div>
        </div>
        <div class="range-board">
          <div class="range-control">
            <label for="objects">選手數 n</label>
            <input
              id="objects"
              type="range"
              min="3"
              max="7"
              [value]="objectCount()"
              (input)="updateObjectCount(+$any($event).target.value)"
            />
            <strong>{{ objectCount() }}</strong>
          </div>
          <div class="range-control">
            <label for="slots">名次數 k</label>
            <input
              id="slots"
              type="range"
              min="1"
              [max]="maxSlots()"
              [value]="slotCount()"
              (input)="slotCount.set(+$any($event).target.value)"
            />
            <strong>{{ slotCount() }}</strong>
          </div>
        </div>
      </section>

      <section class="slot-board">
        <div class="ordered-slots">
          <p class="eyebrow">每填一格，就少一個可用 object</p>
          <h3>每個 slot 的 branch count</h3>
          <div class="slot-row">
            @for (slot of slotLabels; track $index) {
              <div class="role-slot" [class.inactive]="$index >= slotCount()">
                <span>{{ slot }}</span>
                <strong>{{ $index < slotCount() ? objectCount() - $index : '—' }}</strong>
                <small>{{ $index < slotCount() ? 'choices remain' : '未使用' }}</small>
              </div>
            }
          </div>
        </div>

        <div class="permutation-result">
          <span>ORDERED OUTCOMES</span>
          <strong>{{ permutationCount() }}</strong>
          <p>{{ productExpression() }}。每一格角色不同，所以交換任兩位選手會改變結果。</p>
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Order changes meaning</p>
            <h3>同樣選到 A、B、C，名次交換後不是同一個 outcome</h3>
          </div>
          <p>A 在第一格與 A 在第二格扮演不同角色；objects 相同不代表 ordered outcome 相同。</p>
        </div>
        <div class="swap-comparison">
          <div class="arrangement-card" aria-label="A 第一名、B 第二名、C 第三名">
            <i>A</i><i>B</i><i>C</i>
          </div>
          <i>≠</i>
          <div class="arrangement-card" aria-label="B 第一名、A 第二名、C 第三名">
            <i>B</i><i>A</i><i>C</i>
          </div>
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Sample leaves · 顯示前 18 條</p>
            <h3>每一串 letters 都是不同的 ordered path</h3>
          </div>
          <p>目前共有 {{ permutationCount() }} 條；公式只是把這些逐格減少的 choices 壓縮。</p>
        </div>
        <div class="arrangement-samples" aria-label="部分 permutations">
          @for (sample of arrangementSamples(); track sample) {
            <span>{{ sample }}</span>
          }
          @if (permutationCount() > arrangementSamples().length) {
            <span>+{{ permutationCount() - arrangementSamples().length }} more</span>
          }
        </div>
      </section>

      <aside class="insight-card">
        <div class="cluster-arrow" aria-hidden="true">
          <div>
            <span>Position 1</span>
            <strong>{{ objectCount() }} choices</strong>
          </div>
          <i>objects 用過就移除</i>
          <div>
            <span>Position {{ slotCount() }}</span>
            <strong>{{ objectCount() - slotCount() + 1 }} choices</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Permutation 的判斷核心是 slots 有沒有角色</span>
          <p>
            <strong>若交換位置會改變 outcome，就保留 order，沿著 n、n−1、n−2… 計數。</strong>
            不要只因題目用了「選」或「排」某個中文字便決定公式。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：falling factorial 與 permutation notation</summary>
        <div>
          <p>從 n 個 distinct objects 依序填入 k 個 slots：</p>
          <div class="math-line">
            <app-math e="P(n,k)=n(n-1)\\cdots(n-k+1)=\\frac{n!}{(n-k)!}" />
          </div>
          <p>
            有些教材寫作 <app-math e="{}_nP_k" />、<app-math e="P_n^k" /> 或 falling factorial
            <app-math e="n^{\\underline{k}}" />。 符號不同，背後都是逐格移除已使用 object 的同一棵
            tree。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2PermutationSlotsComponent {
  readonly objectCount = signal(5);
  readonly slotCount = signal(3);
  readonly slotLabels = ['第 1 名', '第 2 名', '第 3 名', '第 4 名'];
  readonly maxSlots = computed(() => Math.min(4, this.objectCount()));
  readonly permutationCount = computed(() => {
    let result = 1;
    for (let index = 0; index < this.slotCount(); index += 1) {
      result *= this.objectCount() - index;
    }
    return result;
  });
  readonly productExpression = computed(() =>
    Array.from({ length: this.slotCount() }, (_, index) => this.objectCount() - index).join(' × '),
  );
  readonly arrangementSamples = computed(() => {
    const letters = Array.from({ length: this.objectCount() }, (_, index) =>
      String.fromCharCode(65 + index),
    );
    const results: string[] = [];
    const build = (prefix: string[], remaining: string[]): void => {
      if (results.length >= 18) return;
      if (prefix.length === this.slotCount()) {
        results.push(prefix.join(''));
        return;
      }
      for (const letter of remaining) {
        build(
          [...prefix, letter],
          remaining.filter((candidate) => candidate !== letter),
        );
      }
    };
    build([], letters);
    return results;
  });

  updateObjectCount(value: number): void {
    this.objectCount.set(value);
    if (this.slotCount() > Math.min(4, value)) {
      this.slotCount.set(Math.min(4, value));
    }
  }
}
