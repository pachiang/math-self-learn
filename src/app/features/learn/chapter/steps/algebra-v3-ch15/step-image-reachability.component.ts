import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-algebra-v3-image-reachability',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch15-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 15.1</p>
        <h2>Codomain 是允許降落的機場；image 是班機真的抵達過的 gates</h2>
        <p class="lede">固定 homomorphism φ:ℤ₁₂→ℤ₈、φ(n)=2n。右邊先畫出所有合法 outputs，再逐一送入 domain，別把「在 target 裡」誤當成「一定到得了」。</p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>Target ℤ₈ 有 8 個 elements，所以 image 一定也有 8 個嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不一定</button>
          <button type="button" (click)="prediction.set(true)">一定</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'Codomain 只宣告可能的落點；map 未必覆蓋它們。' : '對。Image 要由實際 mappings 決定。' }}</p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div><p class="kicker">Reachability spotlight</p><h3>掃過 inputs，讓可達 outputs 一盞一盞亮起</h3></div>
          <p>尚未掃完時只能說「目前看過」；掃完 finite domain 才能把未亮的 gates 判成 UNREACHED。</p>
        </div>
        <div class="stage image-stage">
          <section class="domain-deck" aria-label="ℤ₁₂ domain elements">
            <span class="stage-label">DOMAIN · ℤ₁₂</span>
            <div>
              @for (n of domain; track n) {
                <button type="button" [class.visited]="isVisited(n)" [attr.aria-pressed]="selected() === n" (click)="visit(n)">{{ n }}</button>
              }
            </div>
          </section>
          <div class="mapping-beam" aria-live="polite"><strong>{{ selected() }}</strong><span>× 2 mod 8</span><i>→</i><strong>{{ map(selected()) }}</strong></div>
          <section class="target-deck" aria-label="ℤ₈ codomain elements">
            <span class="stage-label">CODOMAIN · ℤ₈</span>
            <div>
              @for (y of codomain; track y) {
                <article [class.reached]="isSeenOutput(y)" [class.unreached]="isComplete() && !isSeenOutput(y)">
                  <strong>{{ y }}</strong><small>{{ outputStatus(y) }}</small>
                </article>
              }
            </div>
          </section>
          <section class="image-console" aria-live="polite">
            <p class="kicker">SCANNED {{ visitedCount() }} / 12</p>
            <div class="set-readout"><span>{{ isComplete() ? 'IMAGE' : 'SEEN SO FAR' }}</span><strong>{{ seenSet() }}</strong></div>
            <div class="control-row"><button type="button" class="primary" [disabled]="isComplete()" (click)="scanNext()">Scan next</button><button type="button" (click)="scanAll()">Scan all</button><button type="button" (click)="reset()">重設</button></div>
            <p>{{ scopeReading() }}</p>
          </section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>codomain</span><i>contains</i><span>image</span></div><p><strong>Image（像）是實際可達 outputs 的集合，不是 target 的別名。</strong>這個例子只抵達 {{'{0,2,4,6}'}}；odd elements 雖在 ℤ₈，卻不在 image。</p></aside>

      <section class="transfer"><p class="kicker">遷移</p><h3>φ:ℤ→ℤ, φ(n)=2n 的 image 是什麼？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">所有 even integers</button><button type="button" (click)="transfer.set(false)">整個 ℤ</button></div>@if (transfer() !== null) {<p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。Codomain 是 ℤ，但 odd integers 沒有 preimage。' : '若 2n=1，就需要 n=1/2，不在 domain ℤ。' }}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Image 的正式定義</summary><div>im φ={{'{φ(g):g∈G}'}}⊆H。因 φ 保 operation，兩個可達 outputs 的 product 仍可達，inverse 也可達，所以 im φ 是 H 的 subgroup。</div></details><details><summary>本例為何只有 even residues？</summary><div>2n mod 8 永遠是 even residue；反過來 0、2、4、6 分別由 n=0、1、2、3 抵達，因此 image 恰為 {{'{0,2,4,6}'}}。</div></details></section>
    </article>
  `,
})
export class AlgebraV3ImageReachabilityComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly selected = signal(0);
  readonly visitedMask = signal(1);
  readonly domain = Array.from({ length: 12 }, (_, n) => n);
  readonly codomain = Array.from({ length: 8 }, (_, n) => n);
  readonly visitedCount = computed(() => this.domain.filter((n) => this.isVisited(n)).length);
  readonly seenOutputs = computed(() => [...new Set(this.domain.filter((n) => this.isVisited(n)).map((n) => this.map(n)))].sort((a, b) => a - b));
  readonly seenSet = computed(() => `{${this.seenOutputs().join(', ')}}`);
  map(n: number): number { return (2 * n) % 8; }
  isVisited(n: number): boolean { return (this.visitedMask() & (1 << n)) !== 0; }
  isSeenOutput(y: number): boolean { return this.seenOutputs().includes(y); }
  isComplete(): boolean { return this.visitedCount() === 12; }
  visit(n: number): void { this.selected.set(n); this.visitedMask.update((mask) => mask | (1 << n)); }
  scanNext(): void { const next = this.domain.find((n) => !this.isVisited(n)); if (next !== undefined) this.visit(next); }
  scanAll(): void { this.visitedMask.set((1 << 12) - 1); this.selected.set(11); }
  reset(): void { this.visitedMask.set(1); this.selected.set(0); }
  outputStatus(y: number): string { if (this.isSeenOutput(y)) return 'REACHED'; return this.isComplete() ? 'UNREACHED' : 'NOT YET SEEN'; }
  scopeReading(): string { return this.isComplete() ? '完整掃描後：image={0,2,4,6}，是 codomain 的 proper subset。' : '目前亮起的是 evidence sample；還不能對未掃 inputs 下結論。'; }
}
