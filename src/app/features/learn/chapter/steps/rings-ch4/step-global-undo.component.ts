import { Component, computed, signal } from '@angular/core';
import { inverseMod, mod, multiplicationOutputs } from './rings-ch4-model';

@Component({
  selector: 'app-rings-ch4-global-undo',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 4.3</p>
        <h2>一張 inverse card，不只救回 1；它會撤銷整台 multiplication machine</h2>
        <p class="lede">若 b=a⁻¹，先乘 a 再乘 b，任何 input x 都會回到 x。Unit 的力量是 global undo，不是只有一組碰巧成功的算式。</p>
      </header>

      <div class="general-banner"><span>GENERAL MECHANISM</span><code>mᵦ ∘ mₐ = idᵣ</code></div>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>知道 3·7≡1 mod 10，能否保證每個 x 經 ×3 再 ×7 都回到原位？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(true)">可以</button><button type="button" (click)="prediction.set(false)">只保證 x=1</button></div>
        @if (prediction() !== null) {<p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對。交換與結合運算次序後，(x·3)·7=x·(3·7)=x。' : 'Inverse equation 會被任何 x 一起帶入，因此不是只修復 identity card。' }}</p>}
      </section>

      <div class="control-row">
        <span class="case-badge">INSTANCE · ℤ/10ℤ</span>
        @for (v of multipliers; track v) {<button type="button" [class.active]="a()===v" (click)="a.set(v)">×{{v}}</button>}
        <span class="kicker">INPUT</span>
        @for (x of inputs; track x) {<button type="button" [class.active]="selected()===x" (click)="selected.set(x)">{{x}}</button>}
        <button type="button" [class.active]="selected()===null" (click)="selected.set(null)">SHOW ALL</button>
      </div>

      <section class="stage stage-grid">
        <div class="wiring-board">
          <div class="socket-row">@for (node of visibleNodes(); track node.x) {<span class="socket" [class.selected]="selected()===node.x">{{node.x}}</span>}</div>
          <div class="wire-history">
            <strong>x</strong><span class="wire-arrow">× {{a()}} →</span><strong>{{forwardLabel()}}</strong>
            <span class="wire-arrow">{{inverse()===null ? 'NO REVERSE' : '× '+inverse()+' →'}}</span>
            <strong>{{roundTripLabel()}}</strong>
          </div>
          <div class="socket-row">@for (node of visibleNodes(); track node.x) {<span class="socket middle">{{node.output}}</span>}</div>
          <div class="socket-row">@for (node of roundTripNodes(); track node.x) {<span class="socket" [class.selected]="inverse()!==null">{{node.output===null?'—':node.output}}</span>}</div>
        </div>
        <aside class="console" aria-live="polite">
          <p class="kicker">UNDO STATUS</p>
          <h3>{{inverse()===null ? 'NO GLOBAL UNDO' : 'WHOLE WORLD RESTORED'}}</h3>
          <p>{{statusText()}}</p>
          <div class="readout">{{inverse()===null ? a()+' is not a unit' : a()+'⁻¹ = '+inverse()+' in ℤ/10ℤ'}}</div>
        </aside>
      </section>

      <section class="insight"><span class="insight-icon">↩</span><div><strong>Unit 把 multiplication 變成可逆 transformation</strong><span>Nonunit 只表示這台 machine 沒有全域倒帶；不是 ring 壞掉。</span></div></section>
      <details><summary>為什麼 inverse 能撤銷所有 x？</summary><p>在 commutative ring 中，若 ab=1，則 b(ax)=(ba)x=x。一般 ring 可用 left/right multiplication 與 two-sided inverse 精確表述。</p></details>
    </article>
  `,
})
export class RingsCh4GlobalUndoComponent {
  readonly multipliers = [3, 9, 4] as const;
  readonly inputs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
  readonly a = signal(3);
  readonly selected = signal<number | null>(2);
  readonly prediction = signal<boolean | null>(null);
  readonly inverse = computed(() => inverseMod(this.a(), 10));
  readonly allNodes = computed(() => multiplicationOutputs(this.a(), 10));
  readonly visibleNodes = computed(() => this.selected() === null ? this.allNodes() : this.allNodes().filter(node => node.x === this.selected()));
  readonly roundTripNodes = computed(() => this.visibleNodes().map(node => ({ x: node.x, output: this.inverse() === null ? null : mod(node.output * this.inverse()!, 10) })));
  readonly forwardLabel = computed(() => this.selected() === null ? 'all ×a outputs' : String(mod(this.selected()! * this.a(), 10)));
  readonly roundTripLabel = computed(() => this.inverse() === null ? 'blocked' : this.selected() === null ? 'all original x' : String(this.selected()));
  readonly statusText = computed(() => this.inverse() === null
    ? `×${this.a()} 會 collision 並漏掉 sockets；沒有另一張 multiplication card 能替所有 inputs 復原。`
    : `inverse ${this.inverse()} 與 ×${this.a()} 串接後，${this.selected() === null ? '十個 inputs 全數' : '目前 input'}回到起點。`);
}
