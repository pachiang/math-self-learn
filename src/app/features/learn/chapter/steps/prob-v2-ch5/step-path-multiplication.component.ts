import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type DrawPath = 'RR' | 'RB' | 'BR' | 'BB';

interface PathModel {
  firstNumerator: number;
  secondNumerator: number;
  resultNumerator: number;
  remaining: string;
}

@Component({
  selector: 'app-prob-v2-path-multiplication',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch5">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 5.2</p>
        <h2>沿一條 path 相乘，是因為世界被連續切小</h2>
        <p class="lede">
          袋中有 3 顆紅球、2 顆藍球，不放回抽兩顆。 第二個 fraction 不是再次切整個
          Ω；它只切第一步已留下的那一塊世界。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Without replacement · 選一條完整 path</p>
            <h3>每條 path 都經過兩次 narrowing</h3>
          </div>
        </div>
        <div class="path-picker" role="group" aria-label="選擇兩次抽球的完整 path">
          @for (path of paths; track path) {
            <button
              type="button"
              [class.active]="selectedPath() === path"
              (click)="selectedPath.set(path)"
            >
              <strong>{{ path }}</strong>
              <span>{{ pathName(path) }}</span>
            </button>
          }
        </div>
      </section>

      <section class="narrowing-board">
        <div class="nested-world-card">
          <p class="eyebrow">Nested mass · 每一層只切父區塊</p>
          <h3>整個世界 → 第一抽 {{ firstColorName() }} → 第二抽 {{ secondColorName() }}</h3>
          <div class="nested-world" aria-label="完整 path 的 probability mass 如何逐層縮小">
            <div
              class="first-world"
              [class.blue]="selectedPath()[0] === 'B'"
              [style.width.%]="firstProbability() * 100"
            >
              <div class="second-world" [style.width.%]="secondProbability() * 100">
                <span>
                  {{ selectedPath() }}<br />
                  {{ percent(pathProbability()) }} of Ω
                </span>
              </div>
              <div class="second-rest">第一抽相同<br />第二抽走另一支</div>
            </div>
            <div class="other-world">
              第一抽走另一支<br />
              {{ percent(1 - firstProbability()) }} of Ω
            </div>
          </div>
          <p class="feedback">
            紫色區域先占整個世界的 {{ firstFraction() }}； 再保留父區塊裡的
            {{ secondFraction() }}，最後占 Ω 的 <strong>{{ resultFraction() }}</strong
            >。
          </p>
        </div>

        <div class="factor-stack">
          <div class="factor-card">
            <span>第一層 · 從 5 顆中選</span>
            <strong>{{ firstFraction() }}</strong>
            <p>第一抽是{{ firstColorName() }}，留下整個世界的一部分。</p>
          </div>
          <div class="factor-card">
            <span>第二層 · 只在剩餘 4 顆中選</span>
            <strong>× {{ secondFraction() }}</strong>
            <p>{{ currentPath().remaining }}</p>
          </div>
          <div class="factor-card result">
            <span>完整 path 的 probability mass</span>
            <strong>= {{ resultFraction() }}</strong>
            <p>{{ firstFraction() }} × {{ secondFraction() }} = {{ resultFraction() }}</p>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="operation-map" aria-hidden="true">
          <div>
            <span>第一個 fraction</span>
            <strong>切整個世界</strong>
          </div>
          <i>×</i>
          <div>
            <span>第二個 fraction</span>
            <strong>只切留下的父區塊</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Multiplication 是 nested narrowing</span>
          <p>
            <strong>沿 path 相乘，不是因為題目出現「兩次」；是因為比例一層套在上一層裡。</strong>
            每次都要先問：這個 fraction 正在切哪一個當下世界？
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：兩階段 multiplication rule 的雛形</summary>
        <div>
          <p>若第一步事件是 A，走到 A 之後第二步事件是 B，完整 path 的重量寫成：</p>
          <div class="math-line">
            <app-math e="P(A\\cap B)=P(A)\\,P(B\\mid A)" />
          </div>
          <p>
            <app-math e="P(B\\mid A)" /> 讀作「B given A」： 走到 A 這個 branch 後，B
            在剩餘世界中的比例。 conditional probability 的正式定義會在第八章建立；此處先保留 tree
            上的幾何意思。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2PathMultiplicationComponent {
  readonly paths: DrawPath[] = ['RR', 'RB', 'BR', 'BB'];
  readonly selectedPath = signal<DrawPath>('RR');
  readonly models: Record<DrawPath, PathModel> = {
    RR: {
      firstNumerator: 3,
      secondNumerator: 2,
      resultNumerator: 6,
      remaining: '第一顆紅球已離開，剩下 2 紅、2 藍。',
    },
    RB: {
      firstNumerator: 3,
      secondNumerator: 2,
      resultNumerator: 6,
      remaining: '第一顆紅球已離開，剩下 2 紅、2 藍。',
    },
    BR: {
      firstNumerator: 2,
      secondNumerator: 3,
      resultNumerator: 6,
      remaining: '第一顆藍球已離開，剩下 3 紅、1 藍。',
    },
    BB: {
      firstNumerator: 2,
      secondNumerator: 1,
      resultNumerator: 2,
      remaining: '第一顆藍球已離開，剩下 3 紅、1 藍。',
    },
  };
  readonly currentPath = computed(() => this.models[this.selectedPath()]);
  readonly firstProbability = computed(() => this.currentPath().firstNumerator / 5);
  readonly secondProbability = computed(() => this.currentPath().secondNumerator / 4);
  readonly pathProbability = computed(() => this.firstProbability() * this.secondProbability());
  readonly firstFraction = computed(() => `${this.currentPath().firstNumerator} / 5`);
  readonly secondFraction = computed(() => `${this.currentPath().secondNumerator} / 4`);
  readonly resultFraction = computed(() => this.simplify(this.currentPath().resultNumerator, 20));
  readonly firstColorName = computed(() => (this.selectedPath()[0] === 'R' ? '紅球' : '藍球'));
  readonly secondColorName = computed(() => (this.selectedPath()[1] === 'R' ? '紅球' : '藍球'));

  pathName(path: DrawPath): string {
    const color = (letter: string) => (letter === 'R' ? '紅' : '藍');
    return `${color(path[0])} → ${color(path[1])}`;
  }

  percent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  private simplify(numerator: number, denominator: number): string {
    const divisor = this.gcd(numerator, denominator);
    return `${numerator / divisor} / ${denominator / divisor}`;
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
