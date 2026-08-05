import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-lln-clt-bridge',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch18">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 18.8</p>
        <h2>LLN 看 cloud 是否縮到 μ；CLT 把 cloud 放大後再看 shape</h2>
        <p class="lede">
          兩個定理都研究 sums 與 averages，但鏡頭不同。LLN 不斷用同一尺度看 X̄ₙ，cloud 會塌到 μ；CLT
          乘回 √n，把 shrinking error 放大，詢問留下什麼 universal shape。
        </p>
      </header>
      <section class="lln-controls">
        <label
          >Sample size n<input
            type="range"
            min="4"
            max="400"
            step="4"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
      </section>
      <section class="bridge-lenses">
        <article class="lln-lens">
          <span>LLN LENS · ORIGINAL SCALE</span>
          <div><i [style.width.%]="llnWidth()"></i><b>μ</b></div>
          <strong>X̄ₙ − μ → 0</strong>
          <p>問題：誤差離 0 還有多遠？</p>
        </article>
        <article class="clt-lens">
          <span>CLT LENS · MAGNIFY ×√n</span>
          <div><i></i><b>0</b></div>
          <strong>√n(X̄ₙ − μ)</strong>
          <p>問題：重新放大後，留下什麼形狀？</p>
        </article>
        <div class="lens-divider">
          <span>same sampling cloud</span><i>change the camera scale</i>
        </div>
      </section>
      <section class="lln-checklist">
        <div><span>LLN DOES SAY</span><strong>fixed-distance errors become unlikely</strong></div>
        <div>
          <span>LLN DOES NOT SAY</span><strong>monotone paths or forced compensation</strong>
        </div>
        <div><span>NEXT: CLT</span><strong>shape and √n rate under conditions</strong></div>
      </section>
      <aside class="insight-card">
        <div class="lln-core">
          <span>LLN = location collapse</span><i>≠</i><strong>CLT = magnified error shape</strong>
        </div>
        <div>
          <span class="card-label">Same averages, different question</span>
          <p><strong>第十九章不會推翻 LLN；它會把 LLN 壓扁而看不見的細節重新放大。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>符號層：兩種 convergence 的預告</summary>
        <div class="lln-formulas">
          <app-math e="\\bar X_n\\xrightarrow{P}\\mu" /><app-math
            e="\\frac{\\sqrt n(\\bar X_n-\\mu)}{\\sigma}\\xrightarrow{d}N(0,1)"
          />
          <p>
            第一條是 convergence in probability；第二條是 convergence in
            distribution。下一章會用同步 histograms 建立差別。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2LlnCltBridgeComponent {
  readonly n = signal(25);
  readonly llnWidth = computed(() => Math.max(3, 100 / Math.sqrt(this.n())));
}
