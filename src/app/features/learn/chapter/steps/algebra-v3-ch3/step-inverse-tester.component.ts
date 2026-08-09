import { Component, computed, signal } from '@angular/core';

type Vertex = 'A' | 'B' | 'C';
type ActionId = 'r' | 'r2' | 's';

const VERTICES: readonly Vertex[] = ['A', 'B', 'C'];
const LABEL: Record<ActionId, string> = { r: 'r · 轉一格', r2: 'r² · 轉兩格', s: 's · reflection' };
const SHORT_LABEL: Record<ActionId, string> = { r: 'r', r2: 'r²', s: 's' };
const MAPS: Record<ActionId, Record<Vertex, Vertex>> = {
  r: { A: 'B', B: 'C', C: 'A' },
  r2: { A: 'C', B: 'A', C: 'B' },
  s: { A: 'A', B: 'C', C: 'B' },
};

@Component({
  selector: 'app-algebra-v3-inverse-tester',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch3-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 3.2</p>
        <h2>Inverse 撤銷的是整個 transformation</h2>
        <p class="lede">
          真正的 inverse（反元素）不是把某張圖碰巧送回去。它必須在所有 states 上都能折返，而且接在 original action 前後都得到 identity。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先拆掉符號迷思</p>
        <h3>120° rotation r 的 inverse，一定要寫成「−r」嗎？</h3>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不一定</button><button type="button" (click)="prediction.set(true)">一定</button></div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{ prediction() ? 'inverse 是一個角色，不指定外表。在 triangle rotations 中，r 的 inverse 是 r²。' : '對。負號、倒數、反向 rotation 都只是不同 operation 下的具體表示。' }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div><p class="kicker">Two-sided undo tester</p><h3>選一個 candidate，逐一測完三個起點</h3></div>
          <p>左板測 original→candidate，右板測 candidate→original。每按一次只增加一個起點的證據，避免用單一成功畫面冒充 universal undo。</p>
        </div>

        <div class="undo-controls">
          <label>ORIGINAL ACTION
            <select [value]="original()" (change)="setOriginal($event)">
              @for (action of actions; track action) { <option [value]="action" [selected]="action === original()">{{ label[action] }}</option> }
            </select>
          </label>
          <label>CANDIDATE UNDO
            <select [value]="candidate()" (change)="setCandidate($event)">
              @for (action of actions; track action) { <option [value]="action" [selected]="action === candidate()">{{ label[action] }}</option> }
            </select>
          </label>
          <button type="button" (click)="useSuggestedCandidate()">試推薦 candidate</button>
          <button type="button" (click)="testNext()" [disabled]="testedCount() >= 3">測試下一個起點</button>
          <button type="button" (click)="testedCount.set(0)" [disabled]="testedCount() === 0">清除測試</button>
        </div>

        <div class="test-progress">
          <span>證據</span><input type="range" min="0" max="3" [value]="testedCount()" (input)="setTestedCount($event)" aria-label="已測試的起點數量" /><span>{{ testedCount() }} / 3 states</span>
        </div>

        <div class="stage undo-boards">
          <section class="undo-board">
            <h4>{{ shortLabel[original()] }} → {{ shortLabel[candidate()] }}</h4>
            @for (path of forwardPaths(); track path.start; let index = $index) {
              <div class="undo-row">
                <b>{{ path.start }}</b><i>{{ shortLabel[original()] }} →</i><b>{{ index < testedCount() ? path.middle : '?' }}</b><i>{{ shortLabel[candidate()] }} →</i>
                <b [class.returned]="index < testedCount() && path.end === path.start" [class.missed]="index < testedCount() && path.end !== path.start">{{ index < testedCount() ? path.end : '?' }}</b>
              </div>
            }
            <footer>{{ sideVerdict(forwardPaths()) }}</footer>
          </section>

          <section class="undo-board">
            <h4>{{ shortLabel[candidate()] }} → {{ shortLabel[original()] }}</h4>
            @for (path of reversePaths(); track path.start; let index = $index) {
              <div class="undo-row">
                <b>{{ path.start }}</b><i>{{ shortLabel[candidate()] }} →</i><b>{{ index < testedCount() ? path.middle : '?' }}</b><i>{{ shortLabel[original()] }} →</i>
                <b [class.returned]="index < testedCount() && path.end === path.start" [class.missed]="index < testedCount() && path.end !== path.start">{{ index < testedCount() ? path.end : '?' }}</b>
              </div>
            }
            <footer>{{ sideVerdict(reversePaths()) }}</footer>
          </section>
        </div>

        <div class="world-verdict" aria-live="polite">{{ overallVerdict() }}</div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>action</span><i>→</i><span>undo</span><i>→</i><span>same state</span></div>
        <p>
          <strong>Inverse 是與 original action 配對的 whole-world return route。</strong>
          檢查的是兩個 composite mappings 是否都等於 identity；不是看符號像負數，也不是只恢復一個特殊起點。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">同一角色，不同外表</p>
        <h3>reflection s 做兩次回到原狀，所以 s 可以是自己的 inverse 嗎？</h3>
        <div class="choice-row"><button type="button" (click)="transfer.set(true)">可以</button><button type="button" (click)="transfer.set(false)">不可以</button></div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。s·s=e；inverse 不必長得與 original 不同。' : '若 s 在所有 states 上做兩次都回原位，s 就完全符合 undo 的角色。' }}</p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details><summary>正式條件：two-sided inverse</summary><div>對 element a，candidate b 必須同時滿足 ab=e 與 ba=e，才記作 a⁻¹。符號 a⁻¹ 只宣告角色；如何算出它取決於 operation。</div></details>
        <details><summary>Proof debt：inverse uniqueness 為什麼先不證？</summary><div>標準 proof 需要把 b·(a·c) 改括號成 (b·a)·c。這一步正是 associativity；第 4 章會先讓重新加括號變得可見，再回來償還唯一性證明。</div></details>
      </section>
    </article>
  `,
})
export class AlgebraV3InverseTesterComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly original = signal<ActionId>('r');
  readonly candidate = signal<ActionId>('r');
  readonly testedCount = signal(0);
  readonly actions: readonly ActionId[] = ['r', 'r2', 's'];
  readonly label = LABEL;
  readonly shortLabel = SHORT_LABEL;
  readonly forwardPaths = computed(() => this.buildPaths(this.original(), this.candidate()));
  readonly reversePaths = computed(() => this.buildPaths(this.candidate(), this.original()));
  readonly isInverse = computed(() => [...this.forwardPaths(), ...this.reversePaths()].every((path) => path.start === path.end));
  readonly overallVerdict = computed(() => {
    if (this.testedCount() < 3) return `尚未完成：還有 ${3 - this.testedCount()} 個起點未測，不能宣告 inverse。`;
    return this.isInverse() ? '✓ TWO-SIDED INVERSE — 兩種順序、所有 states 都回到自己' : '× NOT AN INVERSE — 至少一條 return path 沒有回到起點';
  });

  setOriginal(event: Event): void { this.original.set(this.selectValue(event)); this.testedCount.set(0); }
  setCandidate(event: Event): void { this.candidate.set(this.selectValue(event)); this.testedCount.set(0); }
  setTestedCount(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) this.testedCount.set(Number(input.value));
  }
  testNext(): void { this.testedCount.update((count) => Math.min(3, count + 1)); }
  useSuggestedCandidate(): void {
    this.candidate.set(this.original() === 'r' ? 'r2' : this.original() === 'r2' ? 'r' : 's');
    this.testedCount.set(0);
  }
  sideVerdict(paths: ReadonlyArray<{ start: Vertex; end: Vertex }>): string {
    if (this.testedCount() < 3) return `○ ${this.testedCount()} / 3 paths checked`;
    return paths.every((path) => path.start === path.end) ? '✓ 這個方向等於 identity' : '× 這個方向不是 identity';
  }
  private buildPaths(first: ActionId, second: ActionId) {
    return VERTICES.map((start) => {
      const middle = MAPS[first][start];
      return { start, middle, end: MAPS[second][middle] };
    });
  }
  private selectValue(event: Event): ActionId {
    const select = event.currentTarget;
    return select instanceof HTMLSelectElement ? select.value as ActionId : 'r';
  }
}
