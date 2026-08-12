import { Component, computed, signal } from '@angular/core';
import { CoordinateOperation, address, addressLabel, coordinateOperate, quotientBundle, quotientOperate, reconstruct } from './rings-ch15-model';

@Component({
  selector: 'app-rings-ch15-crt-reconstruction',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 15.4</p><h2>Comaximal quotient views 形成可逆座標系，而不只是六格分類表</h2><p class="lede">當 I=(2)、J=(3) 時，每個 coordinate pair 都有唯一的 R/(I∩J) element。用 selector 3 只控制 mod-2 coordinate、selector 4 只控制 mod-3 coordinate，再檢查 coordinate arithmetic 是否與 quotient operations 同步。</p></header>
      <span class="map-convention">CHINESE REMAINDER · R/(I∩J) ≅ R/I×R/J WHEN I+J=R</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>要重建 coordinate (1,2)，能否分別調整兩邊而不破壞另一邊？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(true)">能；3 與 4 是獨立 selectors</button><button type="button" (click)="prediction.set(false)">不能；改一個 residue 必定影響另一個</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '檢查 3 的 coordinates (1,0) 與 4 的 coordinates (0,1)，再讓 mixer 組合。' : 'Comaximality 正是讓獨立修正成為可能；觀察兩個 selector pieces。' }}</p> }</section>

      <div class="control-row"><span class="kicker">TARGET COORDINATE</span><span class="kicker">mod 2</span>@for (value of mod2Values; track value) { <button type="button" [class.active]="targetMod2()===value" (click)="setTargetMod2(value)">{{ value }}</button> }<span class="kicker">mod 3</span>@for (value of mod3Values; track value) { <button type="button" [class.active]="targetMod3()===value" (click)="setTargetMod3(value)">{{ value }}</button> }<button type="button" (click)="rebuild()">RECONSTRUCT QUOTIENT INPUT</button><button type="button" (click)="verifyAll()">VERIFY ALL 6 COORDINATES</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid"><div class="crt-reconstruction-lab">
        <section class="selector-mixer"><div class="coordinate-request"><small>REQUESTED ADDRESS</small><strong>({{ targetMod2() }},{{ targetMod3() }})</strong><span>R/I × R/J</span></div><div class="selector-piece"><small>MOD-2 SELECTOR</small><strong>3×{{ targetMod2() }}</strong><span>3 has address (1,0)</span><b>{{ rebuilt() ? contribution2() : '?' }}</b></div><span class="mix-symbol">+</span><div class="selector-piece"><small>MOD-3 SELECTOR</small><strong>4×{{ targetMod3() }}</strong><span>4 has address (0,1)</span><b>{{ rebuilt() ? contribution3() : '?' }}</b></div><span class="mix-symbol">→</span><div class="quotient-reconstruction" [class.rebuilt]="rebuilt()"><small>R/K INPUT</small><strong>{{ rebuilt() ? 'C'+reconstructed() : '?' }}</strong><span>{{ rebuilt() ? bundleLabel(reconstructed()) : 'waiting' }}</span></div></section>

        <section class="inverse-address-table"><div class="tray-heading"><p class="kicker">REVERSIBLE ADDRESS TABLE</p><strong>{{ allVerified() ? '6/6 verified' : rebuilt() ? '1 coordinate reconstructed' : 'waiting' }}</strong></div>@for (index of quotientIndices; track index) { <div [class.visible]="allVerified() || (rebuilt() && reconstructed()===index)" [class.current]="rebuilt() && reconstructed()===index"><small>QUOTIENT INPUT</small><strong>C{{ index }}</strong><span>↔ {{ allVerified() || (rebuilt() && reconstructed()===index) ? coordinateLabel(index) : '(?,?)' }}</span><em>{{ bundleLabel(index) }}</em></div> }</section>

        <section class="operation-workbench"><div class="operation-controls"><span class="kicker">RING OPERATION</span><button type="button" [class.active]="operation()==='add'" (click)="operation.set('add'); operationChecked.set(false)">ADD</button><button type="button" [class.active]="operation()==='multiply'" (click)="operation.set('multiply'); operationChecked.set(false)">MULTIPLY</button><span class="kicker">LEFT C</span>@for (index of quotientIndices; track index) { <button type="button" [class.active]="left()===index" (click)="left.set(index); operationChecked.set(false)">{{ index }}</button> }<span class="kicker">RIGHT C</span>@for (index of quotientIndices; track index) { <button type="button" [class.active]="right()===index" (click)="right.set(index); operationChecked.set(false)">{{ index }}</button> }<button type="button" (click)="checkOperation()">CHECK TWO ROUTES</button></div><div class="operation-routes" [class.checked]="operationChecked()"><div><small>QUOTIENT FIRST</small><strong>C{{ left() }} {{ operationSymbol() }} C{{ right() }} = C{{ quotientResult() }}</strong><span>address → {{ operationChecked() ? coordinateLabel(quotientResult()) : '?' }}</span></div><span>{{ operationChecked() ? '=' : '?' }}</span><div><small>COORDINATES FIRST</small><strong>{{ coordinateLabel(left()) }} {{ operationSymbol() }} {{ coordinateLabel(right()) }}</strong><span>= {{ operationChecked() ? coordinateOutputLabel() : '?' }}</span></div></div></section>
      </div><aside class="console" aria-live="polite"><span class="evidence-badge">{{ operationChecked() ? 'RING ISOMORPHISM CHECK' : allVerified() ? 'BIJECTION VERIFIED' : 'CRT RECONSTRUCTION' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">({{ targetMod2() }},{{ targetMod3() }}) ↦ {{ rebuilt() ? '3·'+targetMod2()+'+4·'+targetMod3()+' = C'+reconstructed() : '?' }} {{ operationChecked() ? '· operations agree' : '' }}</div></aside></section>

      @if (operationChecked()) { <section class="transfer-strip"><div><p class="kicker">REVERSIBLE RING COORDINATES</p><strong>R/(I∩J) ≅ R/I × R/J</strong></div><p>每個 coordinate pair 可重建唯一 quotient element，且 ADD、MULTIPLY 都逐 coordinate 對齊；這不只是相同 cardinality，而是 ring structure 的完整翻譯。</p></section> }
      <section class="insight"><span class="insight-icon">CRT</span><div><strong>互補 quotient views 把一個 quotient world 拆成可獨立計算的 coordinates</strong><span>Intersection 決定先消掉哪些共同 differences；comaximality 保證每組 coordinates 可重建；operation check 則把 bijection 升級成 ring isomorphism。</span></div></section>
      <div class="chapter-resolution"><strong>CH15 RESOLUTION</strong><p>Paired outputs 形成地址；kernel 是 I∩J；product reachability 由 I+J 控制；comaximal views 最終成為可逆且保留 operations 的 CRT coordinates。</p></div>
      <details><summary>正式層：Chinese Remainder Theorem</summary><p>對 ideals I,J◁R，map Φ:R→R/I×R/J 的 kernel 是 I∩J。若 I+J=R，Φ surjective；由 First Isomorphism Theorem 得 R/(I∩J)≅R/I×R/J。本例中 (2)∩(3)=(6)、(2)+(3)=R。</p></details>
    </article>
  `,
})
export class RingsCh15CrtReconstructionComponent {
  readonly mod2Values = [0, 1] as const;
  readonly mod3Values = [0, 1, 2] as const;
  readonly quotientIndices = [0, 1, 2, 3, 4, 5] as const;
  readonly targetMod2 = signal(1);
  readonly targetMod3 = signal(2);
  readonly rebuilt = signal(false);
  readonly allVerified = signal(false);
  readonly operation = signal<CoordinateOperation>('add');
  readonly left = signal(1);
  readonly right = signal(5);
  readonly operationChecked = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly reconstructed = computed(() => reconstruct(this.targetMod2(), this.targetMod3()));
  readonly contribution2 = computed(() => 3 * this.targetMod2());
  readonly contribution3 = computed(() => 4 * this.targetMod3());
  readonly quotientResult = computed(() => quotientOperate(this.operation(), this.left(), this.right()));
  readonly coordinateOutput = computed(() => coordinateOperate(this.operation(), address(this.left()), address(this.right())));
  readonly verdictTitle = computed(() => this.operationChecked() ? 'COORDINATE ARITHMETIC = QUOTIENT ARITHMETIC' : this.allVerified() ? 'EVERY ADDRESS REBUILDS ONE UNIQUE R/K ELEMENT' : this.rebuilt() ? 'INDEPENDENT SELECTORS RECONSTRUCT THE REQUESTED INPUT' : 'MIX TWO SELECTOR PIECES · RECOVER ONE QUOTIENT CLASS');
  readonly verdictReading = computed(() => this.operationChecked() ? `${this.operation()==='add' ? 'Addition' : 'Multiplication'} 的兩條 routes 都得到 ${this.coordinateOutputLabel()}。` : this.allVerified() ? '六個 product addresses 與 C0 到 C5 一對一；沒有 unreachable socket，也沒有 duplicate quotient input。' : this.rebuilt() ? `3·${this.targetMod2()}+4·${this.targetMod3()}≡${this.reconstructed()} mod 6，address 正好回到 (${this.targetMod2()},${this.targetMod3()})。` : 'Selector 3 不改變 mod 3；selector 4 不改變 parity，因此可以分別設定兩個 coordinates。');

  coordinateLabel(index: number): string { return addressLabel(address(index)); }
  coordinateOutputLabel(): string { return addressLabel(this.coordinateOutput()); }
  bundleLabel(index: number): string { return `{${quotientBundle(index).join(',')}}`; }
  operationSymbol(): string { return this.operation() === 'add' ? '+' : '×'; }
  setTargetMod2(value: number): void { this.targetMod2.set(value); this.rebuilt.set(false); }
  setTargetMod3(value: number): void { this.targetMod3.set(value); this.rebuilt.set(false); }
  rebuild(): void { this.rebuilt.set(true); }
  verifyAll(): void { this.rebuilt.set(true); this.allVerified.set(true); }
  checkOperation(): void { this.allVerified.set(true); this.operationChecked.set(true); }
  reset(): void { this.targetMod2.set(1); this.targetMod3.set(2); this.rebuilt.set(false); this.allVerified.set(false); this.operation.set('add'); this.left.set(1); this.right.set(5); this.operationChecked.set(false); this.prediction.set(null); }
}
