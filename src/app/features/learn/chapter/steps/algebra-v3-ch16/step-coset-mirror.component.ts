import { Component, computed, signal } from '@angular/core';
import { D3_ELEMENTS, D3Element, label, multiply, setLabel } from './d3-model';

type SubgroupId = 'rotations' | 'mirror';

@Component({
  selector: 'app-algebra-v3-coset-mirror',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch16-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 16.2</p><h2>Left／right coset 是否對齊，決定 bucket 能不能不問乘法方向</h2><p class="lede">Subgroup H 描述「視為同一類的差異」。在 noncommutative group，先放 g 或後放 g 可能分出不同 buckets；normality 正是讓兩側重新一致。</p></header>

      <section class="prediction"><p class="kicker">先預測</p><h3>既然 H 是 subgroup，gH 與 Hg 對任意 g 都一定相同嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不一定</button><button type="button" (click)="prediction.set(true)">一定</button></div>@if (prediction() !== null) {<p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'Subgroup closure 只管 H 內部；外部 g 放左或右可能不同。' : '對。兩側永遠相同是 normality 的額外穩定性。' }}</p>}</section>

      <section class="lab"><div class="lab-heading"><div><p class="kicker">Left/right coset mirror</p><h3>同一個 g、同一個 subgroup，只交換乘法側</h3></div><p>用集合內容與 SAME／SPLIT 邊框判讀，不靠顏色。</p></div>
        <div class="coset-controls"><div role="group" aria-label="選擇 subgroup"><button type="button" [attr.aria-pressed]="subgroupId() === 'rotations'" (click)="selectSubgroup('rotations')">R={{'{e,r,r²}'}}</button><button type="button" [attr.aria-pressed]="subgroupId() === 'mirror'" (click)="selectSubgroup('mirror')">M={{'{e,s}'}}</button></div><div role="group" aria-label="選擇外部 element g">@for (item of elements; track item) {<button type="button" [attr.aria-pressed]="g() === item" (click)="g.set(item)">g={{ label(item) }}</button>}</div></div>
        <div class="stage coset-stage">
          <section class="coset-mirror" aria-live="polite"><article><span>LEFT COSET · gH</span><strong>{{ leftSet() }}</strong><div>@for (item of leftCoset(); track item) {<i>{{ label(item) }}</i>}</div></article><b [class.split]="!sameSets()">{{ sameSets() ? 'SAME' : 'SPLIT' }}</b><article><span>RIGHT COSET · Hg</span><strong>{{ rightSet() }}</strong><div>@for (item of rightCoset(); track item) {<i>{{ label(item) }}</i>}</div></article></section>
          <section class="coset-console"><p class="kicker">SIDE-CHOICE VERDICT</p><div class="map-verdict" [class.fail]="!sameSets()">{{ sameSets() ? '✓ SAME BUCKET FROM BOTH SIDES' : '× SIDE CHANGES THE BUCKET' }}</div><p>{{ reading() }}</p></section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>gH</span><i>normal means</i><span>Hg</span></div><p><strong>Normal subgroup 讓「以 H 為不可見差異」的分類不依賴差異放在左邊或右邊。</strong>這正是下一章要讓 cosets 相乘時所需的穩定性。</p></aside>

      <section class="transfer"><p class="kicker">遷移</p><h3>若 G 是 abelian，G 的每個 subgroup 都 normal 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">是</button><button type="button" (click)="transfer.set(false)">否</button></div>@if (transfer() !== null) {<p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。gh=hg 逐項成立，所以 gH=Hg。' : '在 abelian group 左右乘本來就相同。' }}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Left/right cosets 的定義</summary><div>gH={{'{gh:h∈H}'}}，Hg={{'{hg:h∈H}'}}。H normal in G 寫作 H◁G，等價於對所有 g∈G 有 gH=Hg。</div></details><details><summary>與 conjugation 條件的等價</summary><div>gH=Hg 等價於 gHg⁻¹=H：右側同乘 g⁻¹ 就把 coset equality 轉成 subgroup 在 conjugation 下不變。</div></details></section>
    </article>
  `,
})
export class AlgebraV3CosetMirrorComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly subgroupId = signal<SubgroupId>('rotations');
  readonly g = signal<D3Element>(3);
  readonly elements = D3_ELEMENTS;
  readonly subgroup = computed<D3Element[]>(() => this.subgroupId() === 'rotations' ? [0, 1, 2] : [0, 3]);
  readonly leftCoset = computed(() => this.sort(this.subgroup().map((h) => multiply(this.g(), h))));
  readonly rightCoset = computed(() => this.sort(this.subgroup().map((h) => multiply(h, this.g()))));
  readonly leftSet = computed(() => setLabel(this.leftCoset()));
  readonly rightSet = computed(() => setLabel(this.rightCoset()));
  label = label;
  selectSubgroup(id: SubgroupId): void { this.subgroupId.set(id); this.g.set(id === 'rotations' ? 3 : 1); }
  sameSets(): boolean { return this.leftCoset().every((item, index) => item === this.rightCoset()[index]); }
  reading(): string { return this.sameSets() ? '左右 side choice 不改變 equivalence bucket；這個 subgroup 通過目前的 g。' : '同一個 g 落入兩個不同 buckets；若把 cosets 當新 elements，代表選法會污染結果。'; }
  private sort(elements: D3Element[]): D3Element[] { return [...elements].sort((a, b) => a - b); }
}
