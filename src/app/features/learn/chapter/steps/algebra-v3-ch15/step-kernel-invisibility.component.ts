import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-algebra-v3-kernel-invisibility',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch15-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 15.2</p><h2>Kernel 收集的不是「壞 inputs」，而是 target 完全看不見的 actions</h2><p class="lede">仍用 φ:ℤ₁₂→ℤ₈、φ(n)=2n。把 candidate k 加到任意 base x；若 target 端看不出前後差別，k 就被這個 map 壓成 identity。</p></header>

      <section class="prediction"><p class="kicker">先預測</p><h3>φ(4)=0，是否代表 4 在 domain 裡等於 identity 0？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不是，只是 map 分不出</button><button type="button" (click)="prediction.set(true)">就是同一 element</button></div>@if (prediction() !== null) {<p class="feedback" [class.warning]="prediction()">{{ prediction() ? '4≠0 in ℤ₁₂；它們只是在 φ 的鏡頭下 collision。' : '對。Kernel 描述 map 的盲點，不改寫 domain 本身。' }}</p>}</section>

      <section class="lab"><div class="lab-heading"><div><p class="kicker">Invisible-action tester</p><h3>換 k，觀察所有 base points 是否都留下同一張 target 照片</h3></div><p>每格都有 SAME／SPLIT 文字。先看整排現象，再讀出 identity preimage。</p></div>
        <div class="kernel-picker" role="group" aria-label="選擇 candidate kernel element">@for (k of domain; track k) {<button type="button" [attr.aria-pressed]="candidate() === k" (click)="candidate.set(k)">{{ k }}</button>}</div>
        <div class="stage kernel-stage">
          <section class="invisibility-strip" aria-label="candidate 對所有 base inputs 的可見性">
            @for (x of domain; track x) {
              <article [class.split]="!sameAt(x)"><span>BASE {{ x }}</span><strong>{{ map(x) }} / {{ map(x + candidate()) }}</strong><small>{{ sameAt(x) ? 'SAME' : 'SPLIT' }}</small></article>
            }
          </section>
          <section class="kernel-console" aria-live="polite"><p class="kicker">CANDIDATE k={{ candidate() }}</p><div class="identity-test"><span>φ(k)</span><strong>{{ map(candidate()) }}</strong><i>{{ isInvisible() ? '= TARGET IDENTITY' : '≠ TARGET IDENTITY' }}</i></div><div class="map-verdict" [class.fail]="!isInvisible()">{{ isInvisible() ? '✓ INVISIBLE ACTION · k ∈ ker φ' : '× VISIBLE CHANGE · k ∉ ker φ' }}</div><p>{{ isInvisible() ? '對每個 x，φ(x+k)=φ(x)+φ(k)=φ(x)。' : '至少一個 target state 改變；這個 action 沒被 map 擦掉。' }}</p></section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>different in G</span><i>looks like identity through φ</i><span>invisible in H</span></div><p><strong>Kernel（核）是 identity 的整個 preimage：ker φ={{'{g:φ(g)=e_H}'}}。</strong>本例是 {{ kernelSet() }}；它精確列出 φ 忘掉哪些 domain actions。</p></aside>

      <section class="transfer"><p class="kicker">遷移</p><h3>若 ker φ 只含 domain identity，φ 還能把兩個不同 inputs 合併嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(false)">不能</button><button type="button" (click)="transfer.set(true)">仍可以</button></div>@if (transfer() !== null) {<p class="feedback" [class.warning]="transfer()">{{ transfer() ? '若 φ(a)=φ(b)，則 φ(a⁻¹b)=e；trivial kernel 迫使 a=b。' : '對。這正是下一個 detector 的 injective 判準。' }}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>為何 kernel 是 subgroup？</summary><div>e_G 映到 e_H；若 a、b 都映到 e_H，則 φ(ab⁻¹)=φ(a)φ(b)⁻¹=e_H。因此 kernel 通過 one-step subgroup test。</div></details><details><summary>本例的計算</summary><div>2k≡0 mod 8 等價於 k≡0 mod 4。在 ℤ₁₂ 中得到 k=0、4、8。</div></details></section>
    </article>
  `,
})
export class AlgebraV3KernelInvisibilityComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly candidate = signal(4);
  readonly domain = Array.from({ length: 12 }, (_, n) => n);
  readonly kernel = computed(() => this.domain.filter((n) => this.map(n) === 0));
  readonly kernelSet = computed(() => `{${this.kernel().join(', ')}}`);
  map(n: number): number { return ((2 * n) % 8 + 8) % 8; }
  sameAt(x: number): boolean { return this.map(x) === this.map(x + this.candidate()); }
  isInvisible(): boolean { return this.map(this.candidate()) === 0; }
}
