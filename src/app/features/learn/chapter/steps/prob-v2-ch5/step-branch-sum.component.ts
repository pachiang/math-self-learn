import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type DrawPath = 'RR' | 'RB' | 'BR' | 'BB';
type EventPreset = 'exactly-one' | 'same' | 'first-red' | 'custom';

interface WeightedPath {
  path: DrawPath;
  probability: number;
  fraction: string;
}

@Component({
  selector: 'app-prob-v2-branch-sum',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch5">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 5.4</p>
        <h2>沿一條 path 乘；把多條完整 paths 合併時加</h2>
        <p class="lede">
          tree 的 leaves 是互斥的完整 outcomes：一次 experiment 最後只會停在一個 leaf。 event
          若收集多個 leaves，就把那些已算好的 path weights 加起來。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">3 紅 2 藍 · 不放回抽兩顆</p>
            <h3>選一個 event，或直接點選 leaves 自己組合</h3>
          </div>
          <div class="preset-row" role="group" aria-label="選擇由完整 paths 組成的事件">
            <button
              type="button"
              [class.active]="preset() === 'exactly-one'"
              (click)="applyPreset('exactly-one')"
            >
              剛好一紅
            </button>
            <button
              type="button"
              [class.active]="preset() === 'same'"
              (click)="applyPreset('same')"
            >
              兩球同色
            </button>
            <button
              type="button"
              [class.active]="preset() === 'first-red'"
              (click)="applyPreset('first-red')"
            >
              第一抽紅
            </button>
          </div>
        </div>
      </section>

      <section class="event-collector">
        <div class="leaf-bank" role="group" aria-label="四個完整 paths">
          @for (leaf of leaves; track leaf.path) {
            <button
              type="button"
              class="weighted-leaf"
              [class.selected]="selected().has(leaf.path)"
              [attr.aria-pressed]="selected().has(leaf.path)"
              (click)="togglePath(leaf.path)"
            >
              <span>COMPLETE PATH</span>
              <strong>{{ leaf.path }}</strong>
              <span>{{ pathName(leaf.path) }}</span>
              <i aria-hidden="true"></i>
              <span>weight {{ leaf.fraction }}</span>
            </button>
          }
        </div>

        <div class="event-tray" aria-live="polite">
          <span>EVENT · {{ eventName() }}</span>
          <strong>P(event) = {{ totalFraction() }}</strong>
          <div class="tray-pieces" aria-label="被事件收集的 probability mass">
            @for (leaf of selectedLeaves(); track leaf.path) {
              <div [style.width.%]="leaf.probability * 100">
                {{ leaf.path }}<br />{{ leaf.fraction }}
              </div>
            }
            <div class="tray-rest">
              {{ selected().size ? '未選取的 mass' : '尚未選取 leaf' }}
            </div>
          </div>
          <p>
            @if (selectedLeaves().length) {
              {{ sumExpression() }}。這些 leaves 彼此互斥，所以每份 mass 只加一次。
            } @else {
              Event 是 empty set，目前沒有任何完整 path 被收集。
            }
          </p>
        </div>
      </section>

      <section class="operation-map">
        <div>
          <span>Within each path</span>
          <strong>沿 successive branches 相乘</strong>
        </div>
        <i>then</i>
        <div>
          <span>Across selected paths</span>
          <strong>把 mutually exclusive leaves 相加</strong>
        </div>
      </section>

      <aside class="insight-card">
        <div class="operation-map" aria-hidden="true">
          <div>
            <span>沿路前進</span>
            <strong>Multiply</strong>
          </div>
          <i>→ tree →</i>
          <div>
            <span>合併道路</span>
            <strong>Add</strong>
          </div>
        </div>
        <div>
          <span class="card-label">加法與乘法是在操作 tree，不是題目關鍵字</span>
          <p>
            <strong
              >乘法算一條完整 history 的重量；加法把幾條互斥 histories 收進同一 event。</strong
            >
            先畫出世界如何分岔，該用哪個 operation 會從結構自己浮現。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：sum over disjoint paths</summary>
        <div>
          <p>若 event E 由互斥的完整 paths <app-math e="\\pi_1,\\ldots,\\pi_k" /> 組成：</p>
          <div class="math-line">
            <app-math e="P(E)=\\sum_{i=1}^{k}P(\\pi_i)" />
          </div>
          <p>
            而每條兩階段 path 的 weight 由 branch probabilities 相乘。 例如「剛好一紅」包含 RB 與
            BR：
          </p>
          <div class="math-line">
            <app-math
              e="P(\\text{exactly one red})=P(RB)+P(BR)=\\frac35\\frac24+\\frac25\\frac34=\\frac35"
            />
          </div>
          <p>
            這已經是 law of total probability 的基本形狀； 更一般的 partition 與 conditional weights
            會在第八至十章正式整理。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BranchSumComponent {
  readonly leaves: WeightedPath[] = [
    { path: 'RR', probability: 3 / 10, fraction: '3/10' },
    { path: 'RB', probability: 3 / 10, fraction: '3/10' },
    { path: 'BR', probability: 3 / 10, fraction: '3/10' },
    { path: 'BB', probability: 1 / 10, fraction: '1/10' },
  ];
  readonly preset = signal<EventPreset>('exactly-one');
  readonly selected = signal(new Set<DrawPath>(['RB', 'BR']));
  readonly selectedLeaves = computed(() =>
    this.leaves.filter((leaf) => this.selected().has(leaf.path)),
  );
  readonly total = computed(() =>
    this.selectedLeaves().reduce((sum, leaf) => sum + leaf.probability, 0),
  );
  readonly eventName = computed(() => {
    const names: Record<EventPreset, string> = {
      'exactly-one': '剛好一紅',
      same: '兩球同色',
      'first-red': '第一抽紅',
      custom: '自訂 leaves',
    };
    return names[this.preset()];
  });
  readonly totalFraction = computed(() => {
    const numerator = Math.round(this.total() * 10);
    const divisor = this.gcd(numerator, 10);
    return `${numerator / divisor} / ${10 / divisor}`;
  });
  readonly sumExpression = computed(() => {
    const fractions = this.selectedLeaves()
      .map((leaf) => leaf.fraction)
      .join(' + ');
    return `${fractions} = ${this.totalFraction()}`;
  });

  applyPreset(preset: Exclude<EventPreset, 'custom'>): void {
    const paths: Record<Exclude<EventPreset, 'custom'>, DrawPath[]> = {
      'exactly-one': ['RB', 'BR'],
      same: ['RR', 'BB'],
      'first-red': ['RR', 'RB'],
    };
    this.preset.set(preset);
    this.selected.set(new Set(paths[preset]));
  }

  togglePath(path: DrawPath): void {
    const next = new Set(this.selected());
    next.has(path) ? next.delete(path) : next.add(path);
    this.selected.set(next);
    this.preset.set('custom');
  }

  pathName(path: DrawPath): string {
    const color = (letter: string) => (letter === 'R' ? '紅' : '藍');
    return `${color(path[0])} → ${color(path[1])}`;
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
