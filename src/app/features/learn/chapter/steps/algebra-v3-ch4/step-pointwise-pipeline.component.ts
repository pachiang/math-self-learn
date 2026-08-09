import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-algebra-v3-pointwise-pipeline',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch4-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 4.3</p>
        <h2>Function composition 為什麼自然 associative</h2>
        <p class="lede">兩個 composite functions 要相等，必須對每個 input 都給相同 output。把任意 x 放進兩種 parenthesization，兩邊其實都沿同一條 f→g→h path。</p>
      </header>

      <section class="prediction">
        <p class="kicker">先看執行流程</p>
        <h3>把 f→g→h pipeline 先編譯 f→g，會讓 input 改成先通過 g 嗎？</h3>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不會</button><button type="button" (click)="prediction.set(true)">會</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'compiling a chunk 只建立新的 function wrapper；input 進入 primitive functions 的順序不變。' : '對。packaging 不是 execution reorder。' }}</p> }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div><p class="kicker">Pointwise pipeline</p><h3>拖動任意 input，同時送進兩種 grouping</h3></div>
          <p>primitive functions 固定為 f(x)=x+1、g(x)=2x、h(x)=x²。每列都保留全部中間 states，不讓相同 final number 掩蓋不同 path。</p>
        </div>

        <label class="input-control"><span>任取 input x</span><input type="range" min="-4" max="4" step="1" [value]="input()" (input)="setInput($event)" /><strong>{{ input() }}</strong></label>
        <div class="control-row"><button type="button" (click)="recordInput()" [disabled]="testedInputs().has(input())">把 x={{ input() }} 加入測試紀錄</button><button type="button" (click)="testedInputs.set(newSet())" [disabled]="testedInputs().size === 0">清空紀錄</button></div>

        <div class="stage pipeline-rows">
          <section class="pipeline-row">
            <header><span>LEFT GROUPING</span><strong>((h∘g)∘f)(x)</strong><small>先把 g→h 打包，再接到 f</small></header>
            <div class="point-path"><b>{{ path()[0] }}</b><i>f:+1 →</i><b>{{ path()[1] }}</b><i>g:×2 →</i><b>{{ path()[2] }}</b><i>h:square →</i><b class="final">{{ path()[3] }}</b></div>
          </section>
          <section class="pipeline-row">
            <header><span>RIGHT GROUPING</span><strong>(h∘(g∘f))(x)</strong><small>先把 f→g 打包，再送進 h</small></header>
            <div class="point-path"><b>{{ path()[0] }}</b><i>f:+1 →</i><b>{{ path()[1] }}</b><i>g:×2 →</i><b>{{ path()[2] }}</b><i>h:square →</i><b class="final">{{ path()[3] }}</b></div>
          </section>
        </div>

        <div class="same-path-ledger" aria-live="polite"><span>left output = {{ path()[3] }}</span><i>✓ SAME RAW PATH</i><span>right output = {{ path()[3] }}</span></div>
        <p class="readout">已測 inputs：{{ testedLabel() }}。samples 幫助看見 mechanism；proof 必須保留 arbitrary x，不能只列完滑桿上的九個 values。</p>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>((h∘g)∘f)(x)</span><i>=</i><span>h(g(f(x)))</span><i>=</i><span>(h∘(g∘f))(x)</span></div>
        <p><strong>Associativity 不是硬塞給 actions 的規則；它來自 function pipeline 的執行語意。</strong>只要 domains/codomains 相容，input 依序穿過相同 mappings，括號無法改變 final function。</p>
      </aside>

      <section class="transfer">
        <p class="kicker">軟體 pipeline</p><h3>資料依序通過 decode→validate→store；只重新打包 functions、不換順序，output 會因此改變嗎？</h3>
        <div class="choice-row"><button type="button" (click)="transfer.set(false)">不會</button><button type="button" (click)="transfer.set(true)">會</button></div>
        @if (transfer() !== null) { <p class="feedback" [class.warning]="transfer()">{{ transfer() ? '若 primitive functions 與順序都相同，parenthesization 不會改變每筆資料走過的 path。' : '對。這就是可以安全編譯 pipeline chunk 的結構原因。' }}</p> }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details><summary>Pointwise proof：function composition associative</summary><div>任取 domain 中的 x。左側 ((h∘g)∘f)(x)=(h∘g)(f(x))=h(g(f(x)))；右側 (h∘(g∘f))(x)=h((g∘f)(x))=h(g(f(x)))。對每個 x outputs 相同，因此兩個 functions 相等。</div></details>
        <details><summary>償還 Ch3 proof debt：cancellation</summary><div class="proof-repayment">從 ax=ay，在兩側左乘 a⁻¹：a⁻¹(ax)=a⁻¹(ay)。現在用 associativity 明確改括號為 (a⁻¹a)x=(a⁻¹a)y，再用 inverse 與 identity 得 x=y。</div></details>
        <details><summary>償還 Ch3 proof debt：inverse uniqueness</summary><div class="proof-repayment">若 b、c 都是 a 的 two-sided inverse：b=b·e=b·(a·c)=(b·a)·c=e·c=c。中間唯一不只是替換定義的一步，正是 associativity。</div></details>
        <details><summary>邊界：pipeline 何時根本沒有定義？</summary><div>若 f 的 output 不在 g 的 domain，g∘f 就不存在。associativity 比較的是兩側都合法的 composites；它不會替不相容的 interfaces 自動接線。</div></details>
      </section>
    </article>
  `,
})
export class AlgebraV3PointwisePipelineComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly input = signal(1);
  readonly testedInputs = signal<ReadonlySet<number>>(new Set());
  readonly path = computed(() => {
    const x = this.input();
    return [x, x + 1, 2 * (x + 1), (2 * (x + 1)) ** 2];
  });
  readonly testedLabel = computed(() => this.testedInputs().size ? [...this.testedInputs()].sort((a, b) => a - b).join('、') : '尚未記錄');
  setInput(event: Event): void { const input = event.currentTarget; if (input instanceof HTMLInputElement) this.input.set(Number(input.value)); }
  recordInput(): void { this.testedInputs.update((values) => new Set([...values, this.input()])); }
  newSet(): ReadonlySet<number> { return new Set(); }
}
