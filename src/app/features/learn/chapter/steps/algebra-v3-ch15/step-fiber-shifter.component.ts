import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-algebra-v3-fiber-shifter',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch15-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 15.3</p><h2>每個 nonempty fiber，都是同一團不可見差異搬到新位置</h2><p class="lede">從 output y 往回照，fiber φ⁻¹(y) 會框出所有產生同一張 target 照片的 inputs。Kernel 是 y=0 的 fiber；其他 fibers 並不是新形狀。</p></header>

      <section class="prediction"><p class="kicker">先預測</p><h3>φ⁻¹(2) 中若有 1，還會有哪些 inputs 與它 collision？</h3><div class="choice-row"><button type="button" (click)="prediction.set(true)">1+ker φ = {{'{1,5,9}'}}</button><button type="button" (click)="prediction.set(false)">只有 1</button></div>@if (prediction() !== null) {<p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對。加上 0、4、8 都不改變 output。' : '5 與 9 也映到 2；collision 差異正是 kernel。' }}</p>}</section>

      <section class="lab"><div class="lab-heading"><div><p class="kicker">Fiber shifter</p><h3>選一個 output，反向照亮它的完整 preimage</h3></div><p>Odd outputs 也能被選，但會得到 EMPTY；空 fiber 不是假裝成一份 coset。</p></div>
        <div class="output-picker" role="group" aria-label="選擇 ℤ₈ output">@for (y of codomain; track y) {<button type="button" [attr.aria-pressed]="output() === y" (click)="output.set(y)">y={{ y }}</button>}</div>
        <div class="stage fiber-stage">
          <section class="domain-wheel" aria-label="ℤ₁₂ 中被選 output 的 preimage">@for (n of domain; track n) {<article [class.in-fiber]="inFiber(n)"><strong>{{ n }}</strong><small>{{ inFiber(n) ? 'IN FIBER' : 'OTHER' }}</small></article>}</section>
          <div class="pullback-beam"><span>φ⁻¹({{ output() }})</span><i>← look backward</i><strong>{{ fiberSet() }}</strong></div>
          <section class="fiber-console" aria-live="polite"><p class="kicker">{{ fiber().length ? 'NONEMPTY FIBER' : 'EMPTY FIBER' }}</p>@if (fiber().length) {<div class="shift-equation"><strong>{{ representative() }}</strong><i>+</i><span>ker φ {{ kernelSet }}</span><i>=</i><strong>{{ fiberSet() }}</strong></div><div class="map-verdict">✓ SAME SHAPE · SHIFTED KERNEL</div><p>任兩個 highlighted inputs 的差都在 kernel，所以 map 無法分辨它們。</p>} @else {<div class="map-verdict fail">× UNREACHED OUTPUT · NO PREIMAGE</div><p>{{ output() }} 在 codomain 裡，但不在 image；因此沒有 representative 可以拿來平移 kernel。</p>}</section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>kernel</span><i>shift by one representative</i><span>fiber</span></div><p><strong>所有 nonempty fibers 的 collision pattern 都由 kernel 控制。</strong>若 φ(a)=y，則 φ⁻¹(y)=a ker φ（additive notation 是 a+ker φ）。</p></aside>

      <section class="transfer"><p class="kicker">遷移</p><h3>兩個 inputs a、b 落在同一 fiber，最精確的判斷是什麼？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">a−b ∈ ker φ</button><button type="button" (click)="transfer.set(false)">a=b</button></div>@if (transfer() !== null) {<p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。φ(a)=φ(b) ⇔ φ(a−b)=0。' : 'Homomorphism 可以 many-to-one；同 fiber 不代表 domain elements 相等。' }}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Fiber = coset 的推導</summary><div>若 φ(x)=φ(a)，則 φ(a⁻¹x)=e，所以 a⁻¹x∈ker φ，亦即 x∈a ker φ；反向代入 homomorphism law 即得相等。</div></details><details><summary>為何 unreachable output 的 fiber 為空？</summary><div>Image 的定義正是「至少有一個 preimage 的 outputs」。所以 y∉im φ 與 φ⁻¹(y)=∅ 是同一句話的正反兩面。</div></details></section>
    </article>
  `,
})
export class AlgebraV3FiberShifterComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly output = signal(2);
  readonly domain = Array.from({ length: 12 }, (_, n) => n);
  readonly codomain = Array.from({ length: 8 }, (_, n) => n);
  readonly kernelSet = '{0, 4, 8}';
  readonly fiber = computed(() => this.domain.filter((n) => this.map(n) === this.output()));
  readonly fiberSet = computed(() => this.fiber().length ? `{${this.fiber().join(', ')}}` : '∅');
  map(n: number): number { return (2 * n) % 8; }
  inFiber(n: number): boolean { return this.map(n) === this.output(); }
  representative(): number { return this.fiber()[0] ?? 0; }
}
