import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { binomialPmf, poissonPmf } from './event-stream-math';

type StreamMode = 'stable' | 'rush' | 'burst';

@Component({
  selector: 'app-prob-v2-poisson-origin',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch15">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 15.3</p>
        <h2>更多、更小、更稀疏的機會，讓 Binomial count map 靠近 Poisson</h2>
        <p class="lede">
          把 exposure 切成 n 個微小 slots；每格 chance 降成 μ/n，總 expected count 仍是
          μ。格線越細，trial machine 的痕跡逐漸消失，只留下 event count。
        </p>
      </header>

      <section class="stream-controls">
        <label
          >Micro opportunities n<input
            type="range"
            min="8"
            max="96"
            step="8"
            [value]="slots()"
            (input)="slots.set(+$any($event).target.value)"
          /><strong>{{ slots() }}</strong></label
        >
        <div class="stream-segmented" role="group" aria-label="切換事件流情境">
          @for (item of modes; track item.key) {
            <button type="button" [class.active]="mode() === item.key" (click)="mode.set(item.key)">
              {{ item.label }}
            </button>
          }
        </div>
      </section>

      <section class="rare-board">
        <div class="micro-grid" [class.rush]="mode() === 'rush'" [class.burst]="mode() === 'burst'">
          @for (slot of slotArray(); track slot) {
            <i [class.event]="isEvent(slot)"></i>
          }
        </div>
        <div class="rare-explanation">
          <span class="card-label">GENERATOR CHECK</span>
          <h3>{{ currentMode().title }}</h3>
          <p>{{ currentMode().description }}</p>
          <div class="assumption-lights">
            <span [class.off]="mode() === 'rush'"
              >{{ mode() === 'rush' ? '×' : '✓' }} constant rate</span
            ><span [class.off]="mode() === 'burst'"
              >{{ mode() === 'burst' ? '×' : '✓' }} independent increments</span
            ><span>✓ tiny-slot chance</span>
          </div>
        </div>
        <div class="approx-chart">
          <span class="card-label">COUNT MAP COMPARISON · μ = 4</span>
          <div>
            @for (bar of comparison(); track bar.k) {
              <div>
                <span class="binomial" [style.height.%]="(bar.bin / maxProbability()) * 100"></span
                ><span class="poisson" [style.height.%]="(bar.poi / maxProbability()) * 100"></span
                ><strong>{{ bar.k }}</strong>
              </div>
            }
          </div>
          <p><i class="legend-bin"></i>Binomial(n, μ/n) <i class="legend-poi"></i>Poisson(μ)</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="rare-core" aria-hidden="true">
          <span>more slots</span><i>+</i><span>rarer each</span><i>+</i><span>same μ</span><b>→</b
          ><strong>Poisson</strong>
        </div>
        <div>
          <span class="card-label">Count data alone is not enough</span>
          <p>
            <strong
              >Rush hour 讓 rate 漂移；shared outage 讓 events 成群。兩者都可能產生
              count，卻不再是標準 Poisson world。</strong
            >
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>極限與假設層：從 Binomial 到 Poisson process</summary>
        <div class="stream-formulas">
          <app-math
            e="\\operatorname{Binomial}(n,\\mu/n)\\xrightarrow[n\\to\\infty]{}\\operatorname{Poisson}(\\mu)"
          />
          <p>
            Homogeneous Poisson process 還要求 disjoint intervals 的 counts independent，且極短
            interval 中同時多個 events 的 probability 可忽略。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2PoissonOriginComponent {
  readonly slots = signal(32);
  readonly mode = signal<StreamMode>('stable');
  readonly mean = 4;
  readonly modes = [
    {
      key: 'stable' as const,
      label: 'Stable',
      title: '每格同樣稀疏，分離區段互不影響',
      description: '增加 slots 時，每格 chance μ/n 同步下降。',
    },
    {
      key: 'rush' as const,
      label: 'Rush hour',
      title: '後半段機會明顯變密',
      description: '同一 exposure 內的 rate 不再 constant。',
    },
    {
      key: 'burst' as const,
      label: 'Burst cluster',
      title: '一個 shared cause 拉出整群 events',
      description: '看到一件事會提高附近再出現 event 的 chance。',
    },
  ];
  readonly currentMode = computed(() => this.modes.find((item) => item.key === this.mode())!);
  readonly slotArray = computed(() => Array.from({ length: this.slots() }, (_, i) => i));
  readonly comparison = computed(() => {
    const n = this.slots();
    const p = this.mean / n;
    return Array.from({ length: 10 }, (_, k) => ({
      k,
      bin: binomialPmf(k, n, p),
      poi: poissonPmf(k, this.mean),
    }));
  });
  readonly maxProbability = computed(() =>
    Math.max(...this.comparison().flatMap((bar) => [bar.bin, bar.poi])),
  );
  isEvent(index: number): boolean {
    if (this.mode() === 'rush')
      return (
        index > this.slots() * 0.55 && index % Math.max(2, Math.floor(this.slots() / 12)) === 0
      );
    if (this.mode() === 'burst')
      return Math.abs(index - this.slots() * 0.45) < 3 || Math.abs(index - this.slots() * 0.8) < 2;
    return [0.12, 0.36, 0.63, 0.86].some(
      (position) => Math.abs(index - position * this.slots()) < 0.55,
    );
  }
}
