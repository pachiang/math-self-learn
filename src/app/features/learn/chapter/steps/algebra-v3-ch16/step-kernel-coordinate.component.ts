import { Component, computed, signal } from '@angular/core';
import { conjugate, D3_ELEMENTS, D3Element, label } from './d3-model';

@Component({
  selector: 'app-algebra-v3-kernel-coordinate',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch16-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 16.1</p><h2>真正能被忘掉的差異，換一個座標看仍必須不可見</h2><p class="lede">在 D₃ 中，r 是 120° rotation、s 是 reflection。Sign map σ:D₃→C₂ 只記「有沒有翻面」；它的 kernel 是三個 rotations。</p></header>

      <section class="prediction"><p class="kicker">先預測</p><h3>若 h 對 σ 不可見，把整個描述改成 g h g⁻¹ 後，可能突然變可見嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不可能</button><button type="button" (click)="prediction.set(true)">可能</button></div>@if (prediction() !== null) {<p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'Homomorphism 看到 σ(g)σ(h)σ(g)⁻¹；中間是 identity，就仍是 identity。' : '對。改寫座標不能讓 map 原本忘掉的 action 重新出現。' }}</p>}</section>

      <section class="lab"><div class="lab-heading"><div><p class="kicker">Coordinate-change conveyor</p><h3>選 h 與座標 g，追蹤 invisible action 被重新描述</h3></div><p>h 只從 kernel 選；g 可是任意 rotation 或 reflection。</p></div>
        <div class="coordinate-controls"><div role="group" aria-label="選擇 kernel action h"><span>INVISIBLE h</span>@for (item of kernel; track item) {<button type="button" [attr.aria-pressed]="h() === item" (click)="h.set(item)">{{ label(item) }}</button>}</div><div role="group" aria-label="選擇 coordinate change g"><span>COORDINATE g</span>@for (item of elements; track item) {<button type="button" [attr.aria-pressed]="g() === item" (click)="g.set(item)">{{ label(item) }}</button>}</div></div>
        <div class="stage coordinate-stage">
          <section class="conjugation-conveyor" aria-live="polite"><article><span>ORIGINAL ACTION</span><strong>{{ label(h()) }}</strong><small>σ({{ label(h()) }})=0 · INVISIBLE</small></article><i>change coordinates<br>g ( · ) g⁻¹</i><article><span>REWRITTEN ACTION</span><strong>{{ label(conjugated()) }}</strong><small>σ({{ label(conjugated()) }})={{ sign(conjugated()) }}</small></article></section>
          <section class="coordinate-console"><p class="kicker">CONJUGATION TRACE</p><div class="trace-equation"><strong>{{ label(g()) }} · {{ label(h()) }} · {{ labelInverseG() }}</strong><i>=</i><strong>{{ label(conjugated()) }}</strong></div><div class="map-verdict">✓ STILL IN KERNEL · STILL INVISIBLE</div><p>座標名稱可能從 {{ label(h()) }} 變成 {{ label(conjugated()) }}，但 action type 仍是 rotation。</p></section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>h invisible</span><i>conjugate by any g</i><span>still invisible</span></div><p><strong>Kernel 的不可見性對所有 coordinate changes 穩定。</strong>這個穩定性就是 normal subgroup（正規子群）背後的角色，不是額外發明的 closure 技巧。</p></aside>

      <section class="transfer"><p class="kicker">遷移</p><h3>任意 homomorphism φ:G→H 的 kernel 都一定 normal 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">一定</button><button type="button" (click)="transfer.set(false)">只有 abelian G 才一定</button></div>@if (transfer() !== null) {<p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。φ(ghg⁻¹)=φ(g)eφ(g)⁻¹=e。' : '不需 G abelian；homomorphism law 本身就保證。' }}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Kernel normal 的正式 proof</summary><div>取 h∈ker φ 與任意 g∈G。φ(ghg⁻¹)=φ(g)φ(h)φ(g)⁻¹=φ(g)eφ(g)⁻¹=e，所以 ghg⁻¹∈ker φ。</div></details><details><summary>D₃ sign map</summary><div>σ(rotation)=0、σ(reflection)=1，以 addition mod 2 合成。兩次 reflection 合成 rotation，正好對應 1+1=0。</div></details></section>
    </article>
  `,
})
export class AlgebraV3KernelCoordinateComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly h = signal<D3Element>(1);
  readonly g = signal<D3Element>(3);
  readonly elements = D3_ELEMENTS;
  readonly kernel: D3Element[] = [0, 1, 2];
  readonly conjugated = computed(() => conjugate(this.g(), this.h()));
  label = label;
  sign(element: D3Element): number { return element < 3 ? 0 : 1; }
  labelInverseG(): string { const inverseLabels: Record<D3Element, string> = { 0: 'e', 1: 'r²', 2: 'r', 3: 's', 4: 'rs', 5: 'r²s' }; return inverseLabels[this.g()]; }
}
