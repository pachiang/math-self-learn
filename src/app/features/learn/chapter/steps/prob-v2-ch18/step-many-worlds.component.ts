import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { histogram, sampleMean } from './lln-math';

@Component({
  selector: 'app-prob-v2-many-worlds',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch18">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 18.2</p>
        <h2>LLN 的主角不是一條漂亮路徑，而是所有可能 sample means</h2>
        <p class="lede">
          固定 n，重做整場 experiment 會得到很多不同的 X̄ₙ。n 增加時，這個<strong
            >抽樣分布（sampling distribution）</strong
          >把重量集中到 μ 周圍。
        </p>
      </header>
      <section class="lln-controls">
        <label
          >Sample size in every world<input
            type="range"
            min="5"
            max="500"
            step="5"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        ><button type="button" (click)="generation.update(x=>x+1)">new 240 worlds</button>
      </section>
      <section class="worlds-board">
        <div class="world-dots">
          @for (world of worldMeans(); track world.index) {
            <i
              [style.left.%]="world.mean * 100"
              [style.top.%]="world.row * 100"
              [class.outside]="Math.abs(world.mean - 0.6) > 0.1"
            ></i>
          }
          <b style="left:60%"><span>μ</span></b>
        </div>
        <div class="mean-histogram">
          @for (bar of bars(); track bar.index) {
            <i [style.height.%]="bar.height" [class.target]="bar.index === 17"></i>
          }
          <div><span>0</span><span>sample mean X̄ₙ</span><span>1</span></div>
        </div>
        <div class="worlds-readout">
          <span>240 possible worlds</span><strong>{{ outsideCount() }}</strong
          ><small>remain more than 0.10 from μ</small>
          <p>{{ reading() }}</p>
        </div>
      </section>
      <aside class="insight-card">
        <div class="lln-core">
          <span>n grows</span><i>→</i><strong>distribution of X̄ narrows around μ</strong>
        </div>
        <div>
          <span class="card-label">Concentration is a statement across worlds</span>
          <p><strong>單一路徑可以暫時偏離；LLN 說偏離固定距離的 probability 會下降。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>名稱層：sampling distribution 是什麼？</summary>
        <div class="lln-formulas">
          <p>
            它不是原始 0/1 observations 的 distribution，而是「每個 world 都收集 n
            筆並算一次平均」後，這些 averages 形成的 distribution。
          </p>
          <app-math e="E[\\bar X_n]=\\mu" />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ManyWorldsComponent {
  protected readonly Math = Math;
  readonly n = signal(30);
  readonly generation = signal(0);
  readonly means = computed(() =>
    Array.from({ length: 240 }, (_, world) =>
      sampleMean(world + this.generation() * 997, this.n(), 0.6),
    ),
  );
  readonly worldMeans = computed(() =>
    this.means().map((mean, index) => ({ index, mean, row: (index % 12) / 12 })),
  );
  readonly bars = computed(() => histogram(this.means(), 30));
  readonly outsideCount = computed(
    () => this.means().filter((x) => Math.abs(x - 0.6) > 0.1).length,
  );
  readonly reading = computed(() =>
    this.n() < 30
      ? '小 n 時，不少 worlds 的 average 仍能落得很遠。'
      : this.outsideCount() < 10
        ? '幾乎所有 worlds 都被收進 μ 附近的固定 band。'
        : 'Sampling distribution 正在變窄，但仍保留少數偏離 worlds。',
  );
}
