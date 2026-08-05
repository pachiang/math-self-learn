import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-prob-v2-additive-noise',
  standalone: true,
  template: `
    <article class="prob-v2-lesson prob-v2-ch17">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 17.1</p>
        <h2>Normal 的出發點不是鐘形，而是許多 signed effects 的相加</h2>
        <p class="lede">
          測量誤差、製程偏差與人的差異，常由許多小幅、方向不定的 contributions 疊成。<strong
            >常態分布（Normal distribution）</strong
          >是這種 additive world 的核心模型。
        </p>
      </header>
      <section class="scene normal-prediction">
        <div>
          <p class="eyebrow">先預測 · cancellation</p>
          <h3>八個可正可負的小偏差相加，極端總和會比接近 0 的總和更常見嗎？</h3>
        </div>
        <div class="choice-row">
          <button
            type="button"
            [class.selected]="prediction() === 'edge'"
            (click)="prediction.set('edge')"
          >
            極端較常見</button
          ><button
            type="button"
            [class.selected]="prediction() === 'center'"
            (click)="prediction.set('center')"
          >
            中央較常見
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 'center') {
              <strong>對。走向極端需要許多 effects 同向；混合正負的組合更多。</strong>
            } @else {
              極端需要罕見的同向合作；一般情況中，正負 contributions 會部分抵銷。
            }
          </p>
        }
      </section>
      <section class="normal-controls">
        <label
          >Number of effects<input
            type="range"
            min="1"
            max="12"
            step="1"
            [value]="effects()"
            (input)="effects.set(+$any($event).target.value)"
          /><strong>{{ effects() }}</strong></label
        >
      </section>
      <section class="additive-board">
        <div class="effect-stack">
          <span>ONE GENERATED CASE</span>
          @for (effect of currentEffects(); track $index) {
            <i [class.negative]="effect < 0"
              ><b [style.width.%]="Math.abs(effect) * 50"></b
              ><small>{{ effect > 0 ? '+' : '' }}{{ effect.toFixed(2) }}</small></i
            >
          }
          <strong>sum = {{ currentSum().toFixed(2) }}</strong>
        </div>
        <div class="sum-histogram">
          <span>MANY CASES · SAME GENERATOR</span>
          @for (bar of histogram(); track bar.index) {
            <i [style.height.%]="bar.height" [class.center]="bar.center"></i>
          }
          <div><b>negative</b><b>0</b><b>positive</b></div>
        </div>
        <p>{{ reading() }}</p>
      </section>
      <aside class="insight-card">
        <div class="normal-family-core">
          <span>many small signed effects</span><i>+</i><strong>partial cancellation</strong>
        </div>
        <div>
          <span class="card-label">Mechanism first, bell shape second</span>
          <p>
            <strong
              >鐘形是 additive mechanism 留下的影子；何時真的逼近 Normal 留到 CLT
              章正式處理。</strong
            >
          </p>
        </div>
      </aside>
    </article>
  `,
})
export class ProbV2AdditiveNoiseComponent {
  protected readonly Math = Math;
  readonly prediction = signal<'edge' | 'center' | null>(null);
  readonly effects = signal(6);
  readonly currentEffects = computed(() =>
    Array.from({ length: this.effects() }, (_, i) => this.noise(7, i)),
  );
  readonly currentSum = computed(
    () => this.currentEffects().reduce((sum, x) => sum + x, 0) / Math.sqrt(this.effects()),
  );
  readonly samples = computed(() =>
    Array.from(
      { length: 240 },
      (_, sample) =>
        Array.from({ length: this.effects() }, (_, i) => this.noise(sample, i)).reduce(
          (sum, x) => sum + x,
          0,
        ) / Math.sqrt(this.effects()),
    ),
  );
  readonly histogram = computed(() => {
    const bins = 21,
      counts = Array(bins).fill(0) as number[];
    this.samples().forEach((value) => {
      const index = Math.max(0, Math.min(bins - 1, Math.floor(((value + 2.8) / 5.6) * bins)));
      counts[index] += 1;
    });
    const max = Math.max(...counts);
    return counts.map((count, index) => ({
      index,
      height: (count / max) * 100,
      center: Math.abs(index - (bins - 1) / 2) < 2,
    }));
  });
  readonly reading = computed(() =>
    this.effects() === 1
      ? '只有一個 source 時，output 仍保留原本 source 的平坦痕跡。'
      : this.effects() < 5
        ? '開始出現 cancellation，但輪廓仍看得出小 source 的結構。'
        : '更多獨立小 effects 疊合後，重量穩定聚向中央。',
  );
  private noise(sample: number, index: number): number {
    const raw = Math.sin((sample + 1) * 12.9898 + (index + 1) * 78.233) * 43758.5453;
    return (raw - Math.floor(raw)) * 2 - 1;
  }
}
