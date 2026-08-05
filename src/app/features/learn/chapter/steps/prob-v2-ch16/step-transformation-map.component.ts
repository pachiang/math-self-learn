import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { betaPdf } from './continuous-math';

type Pipeline = 'uniform' | 'square' | 'ratio';

@Component({
  selector: 'app-prob-v2-transformation-map',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch16">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 16.8</p>
        <h2>不要靠 curve 猜名字；沿著生成 pipeline 追蹤重量</h2>
        <p class="lede">
          Support 都是 [0,1]，不代表 mechanism 相同。Distribution 是
          <strong>source + operation</strong> 留下的重量地圖；shape 只是最後看見的影子。
        </p>
      </header>
      <section
        class="pipeline-picker"
        role="group"
        aria-label="選擇 continuous distribution 生成流程"
      >
        @for (item of pipelines; track item.key) {
          <button
            type="button"
            [class.active]="pipeline() === item.key"
            (click)="pipeline.set(item.key)"
          >
            <span>{{ item.source }}</span
            ><i>{{ item.operation }}</i
            ><strong>{{ item.output }}</strong>
          </button>
        }
      </section>
      <section class="transformation-workbench">
        <div class="pipeline-flow">
          <article>
            <span>SOURCE</span><strong>{{ current().source }}</strong
            ><small>{{ current().sourceNote }}</small>
          </article>
          <i>→</i>
          <article class="operation-node">
            <span>OPERATION</span><strong>{{ current().operation }}</strong
            ><small>{{ current().operationNote }}</small>
          </article>
          <i>→</i>
          <article>
            <span>OUTPUT</span><strong>{{ current().output }}</strong
            ><small>support [0,1]</small>
          </article>
        </div>
        <div class="pipeline-density" aria-label="所選生成流程的輸出密度">
          @for (bar of bars(); track bar.x) {
            <i [style.height.%]="bar.height"></i>
          }
          <div><span>0</span><span>output value</span><span>1</span></div>
        </div>
        <div class="conservation-ledger">
          <div><span>Input total mass</span><strong>1.000</strong></div>
          <i>transport</i>
          <div><span>Output total mass</span><strong>1.000</strong></div>
          <p>{{ current().reading }}</p>
        </div>
      </section>
      <section class="continuous-family-map">
        <div><span>flat source</span><strong>U ~ Uniform(0,1)</strong></div>
        <i>affine → flat<br />nonlinear → reshaped</i>
        <div><span>positive sources</span><strong>G₁, G₂ ~ Gamma</strong></div>
        <i>normalize → share</i>
        <div><span>bounded proportion</span><strong>R ~ Beta</strong></div>
      </section>
      <aside class="insight-card">
        <div class="pipeline-core" aria-hidden="true">
          <span>source</span><i>+</i><span>operation</span><b>→</b><strong>distribution</strong>
        </div>
        <div>
          <span class="card-label">Transformation 是重量守恆的操作語言</span>
          <p><strong>面對陌生 curve，先問重量從哪來、經過什麼 map，再決定是否需要公式。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>工具層：monotone change-of-variables checklist</summary>
        <div class="continuous-formulas">
          <app-math e="Y=g(X),\\qquad x=g^{-1}(y)" /><app-math
            e="f_Y(y)=f_X(g^{-1}(y))\\left|\\frac{d}{dy}g^{-1}(y)\\right|"
          />
          <ol>
            <li>先找 output support。</li>
            <li>把 output interval 映回 input。</li>
            <li>用 inverse derivative 補償 local stretch。</li>
            <li>最後檢查 density 非負且總 area 為 1。</li>
          </ol>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2TransformationMapComponent {
  readonly pipeline = signal<Pipeline>('square');
  readonly pipelines = [
    { key: 'uniform' as const, source: 'Uniform U', operation: 'identity', output: 'Uniform' },
    { key: 'square' as const, source: 'Uniform U', operation: 'square U²', output: 'piles near 0' },
    {
      key: 'ratio' as const,
      source: 'Gamma G₁,G₂',
      operation: 'normalize ratio',
      output: 'Beta(2,5)',
    },
  ];
  readonly descriptions = {
    uniform: {
      source: 'Uniform U',
      sourceNote: 'equal mass per equal length',
      operation: 'Y = U',
      operationNote: 'no local stretch',
      output: 'Uniform',
      reading: 'Identity map 沒有拉伸任何區域，flat density 保持 flat。',
    },
    square: {
      source: 'Uniform U',
      sourceNote: 'ten equal-mass pieces',
      operation: 'Y = U²',
      operationNote: 'compress near 0',
      output: 'Transformed Uniform',
      reading: '靠近 0 的 output 空間更窄，因此相同 mass 疊得更高。',
    },
    ratio: {
      source: 'Gamma G₁,G₂',
      sourceNote: 'two independent positive weights',
      operation: 'G₁ / (G₁ + G₂)',
      operationNote: 'remove total scale',
      output: 'Beta(2,5)',
      reading: 'Normalize 丟掉 total，只留下左側占兩份、右側占五份的 relative share。',
    },
  };
  readonly current = computed(() => this.descriptions[this.pipeline()]);
  readonly bars = computed(() => {
    const points = Array.from({ length: 64 }, (_, index) => (index + 0.5) / 64);
    const values = points.map((x) =>
      this.pipeline() === 'uniform'
        ? 1
        : this.pipeline() === 'square'
          ? 1 / (2 * Math.sqrt(x))
          : betaPdf(x, 2, 5),
    );
    const max = Math.max(...values);
    return points.map((x, index) => ({ x, height: (values[index] / max) * 100 }));
  });
}
