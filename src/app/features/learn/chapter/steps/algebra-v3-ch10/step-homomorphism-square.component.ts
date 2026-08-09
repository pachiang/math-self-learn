import { Component, computed, signal } from '@angular/core';

type MapMode = 'natural' | 'scrambled';

@Component({
  selector: 'app-algebra-v3-homomorphism-square',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch10-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 10.2</p><h2>翻譯必須保留動作：先算再翻，等於先翻再算</h2><p class="lede">一張 map 不只要搬運 elements，還要搬運它們怎麼組合。把同一對 a、b 沿方形的兩條路送到 target；若終點不同，這張翻譯表就在那一格弄壞了 operation。</p></header>
      <section class="prediction"><p class="kicker">先預測</p><h3>任何 bijection 都會自動保留 group operation 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不會</button><button type="button" (click)="prediction.set(true)">會</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'一對一只管 elements 的配對，沒有約束 operation table。下一個實驗會給出 bijective 但不保運算的反例。':'對。保運算是另一個必須逐對檢查的條件。'}}</p>}</section>
      <section class="lab">
        <div class="lab-heading"><div><p class="kicker">Commuting-square checker</p><h3>讓兩條計算路徑競賽</h3></div><p>Natural map 是 φ(k)=iᵏ；scrambled map 仍是一對一，卻交換了 −1 與 −i 的標籤。</p></div>
        <div class="mode-picker" role="group" aria-label="選擇 map"><button type="button" [attr.aria-pressed]="mode()==='natural'" (click)="mode.set('natural')">Natural map</button><button type="button" [attr.aria-pressed]="mode()==='scrambled'" (click)="mode.set('scrambled')">Scrambled bijection</button></div>
        <div class="pair-picker"><label>a <input type="range" min="0" max="3" [value]="a()" (input)="a.set(+$any($event.target).value)"><strong>{{a()}}</strong></label><label>b <input type="range" min="0" max="3" [value]="b()" (input)="b.set(+$any($event.target).value)"><strong>{{b()}}</strong></label></div>
        <div class="stage square-layout">
          <div class="commuting-square" aria-label="保運算交換方形">
            <div class="square-node top-left">({{a()}}, {{b()}})<small>SOURCE PAIR</small></div>
            <div class="square-node top-right">{{sum()}}<small>a+b mod 4</small></div>
            <div class="square-node bottom-left">({{root(map()[a()])}}, {{root(map()[b()])}})<small>TRANSLATED PAIR</small></div>
            <div class="square-node bottom-right" [class.mismatch]="!commutes()"><span>{{root(leftEnd())}}</span><span>{{root(rightEnd())}}</span><small>{{commutes()?'SAME ENDPOINT':'TWO ENDPOINTS'}}</small></div>
            <span class="square-arrow top">+ then φ →</span><span class="square-arrow left">φ ↓</span><span class="square-arrow right">↓ φ(a+b)</span><span class="square-arrow bottom">multiply →</span>
          </div>
          <section class="square-console" aria-live="polite"><p class="kicker">PATH READOUT</p><div class="route-readout"><span>先算再翻</span><strong>φ({{a()}}+{{b()}}) = {{root(leftEnd())}}</strong></div><div class="route-readout"><span>先翻再算</span><strong>φ({{a()}})φ({{b()}}) = {{root(rightEnd())}}</strong></div><div class="translation-verdict" [class.fail]="!commutes()">{{commutes()?'✓ THIS PAIR COMMUTES':'× OPERATION MISMATCH WITNESS'}}</div><button type="button" (click)="findWitness()">自動找一個失敗 pair</button><p>{{allPairsPass()?'16 個 input pairs 全部同終點；這張 map 是 homomorphism。':'至少一對走到不同終點；一個 witness 就足以推翻 homomorphism。'}}</p></section>
        </div>
      </section>
      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>combine</span><i>then map</i><span>=</span><i>map then</i><span>combine</span></div><p><strong>Homomorphism 是保留 operation 的翻譯。</strong>它不是「結果看起來相近」，而是對每一對 inputs，兩條路都必須落在完全相同的 target element。</p></aside>
      <section class="transfer"><p class="kicker">泛化</p><h3>要推翻 homomorphism，需要檢查完所有 pairs 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(false)">不用，一個反例即可</button><button type="button" (click)="transfer.set(true)">需要全部檢查</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="transfer()">{{transfer()?'Universal claim 只要一個不交換的 square 就被推翻。':'對；但要證明它成立，則要給出涵蓋所有 pairs 的理由。'}}</p>}</section>
      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Homomorphism 的正式定義</summary><div>對 groups G、H，map φ:G→H 若對所有 a,b∈G 都滿足 φ(ab)=φ(a)φ(b)，就稱為 group homomorphism。兩邊的 operation 可以用不同符號。</div></details><details><summary>為何 natural map 保運算？</summary><div>在 ℤ₄ 與四次方根中，φ(a+b)=i^(a+b)=i^a·i^b=φ(a)φ(b)，exponents 按 modulo 4 解讀。</div></details></section>
    </article>
  `,
})
export class AlgebraV3HomomorphismSquareComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly mode = signal<MapMode>('natural');
  readonly a = signal(1);
  readonly b = signal(2);
  readonly map = computed(() => this.mode() === 'natural' ? [0, 1, 2, 3] : [0, 1, 3, 2]);
  readonly sum = computed(() => (this.a() + this.b()) % 4);
  readonly leftEnd = computed(() => this.map()[this.sum()]);
  readonly rightEnd = computed(() => (this.map()[this.a()] + this.map()[this.b()]) % 4);
  readonly commutes = computed(() => this.leftEnd() === this.rightEnd());
  readonly allPairsPass = computed(() => [0,1,2,3].every(a => [0,1,2,3].every(b => this.map()[(a+b)%4] === (this.map()[a]+this.map()[b])%4)));
  root(index: number): string { return ['1','i','−1','−i'][index]; }
  findWitness(): void {
    for (let a=0;a<4;a++) for (let b=0;b<4;b++) if (this.map()[(a+b)%4] !== (this.map()[a]+this.map()[b])%4) { this.a.set(a); this.b.set(b); return; }
  }
}
