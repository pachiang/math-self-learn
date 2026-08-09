import { Component, computed, signal } from '@angular/core';

interface MapModel { id: string; label: string; source: number; target: number; multiplier: number; }

@Component({
  selector: 'app-algebra-v3-map-detector',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch15-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 15.4</p><h2>Injective 看 kernel；surjective 看 image——兩個 gauges 不要綁在一起</h2><p class="lede">Homomorphism 的 collision 與 coverage 不必逐對、逐點猜。Kernel 濃縮前者，image 濃縮後者；isomorphism 只是兩個 gauges 同時通過。</p></header>

      <section class="prediction"><p class="kicker">先判斷</p><h3>一個 homomorphism 可以 surjective 但不 injective 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(true)">可以</button><button type="button" (click)="prediction.set(false)">不可以</button></div>@if (prediction() !== null) {<p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '可以。ℤ₆→ℤ₃ projection 覆蓋 target，卻把相隔 3 的 inputs 合併。' : 'Coverage 與 collision 是不同軸；其中一軸能單獨通過。' }}</p>}</section>

      <section class="lab"><div class="lab-heading"><div><p class="kicker">Two-gauge detector</p><h3>切換 maps，只讀 kernel 與 image 就下診斷</h3></div><p>每個 verdict 同時顯示文字、集合與分數，不依賴綠／紅色。</p></div>
        <div class="detector-picker" role="group" aria-label="選擇 homomorphism">@for (model of models; track model.id) {<button type="button" [attr.aria-pressed]="selectedId() === model.id" (click)="selectedId.set(model.id)">{{ model.label }}</button>}</div>
        <div class="stage detector-stage">
          <section class="map-wires" aria-label="目前 map 的 element mappings">@for (n of sourceElements(); track n) {<article><strong>{{ n }}</strong><i>→</i><strong>{{ map(n) }}</strong></article>}</section>
          <section class="gauge-grid" aria-live="polite">
            <article [class.fail]="!isInjective()"><p class="kicker">COLLISION GAUGE</p><span>ker φ = {{ kernelSet() }}</span><strong>{{ isInjective() ? '✓ INJECTIVE' : '× NOT INJECTIVE' }}</strong><small>{{ isInjective() ? 'identity alone is invisible' : 'non-identity inputs vanish' }}</small></article>
            <article [class.fail]="!isSurjective()"><p class="kicker">COVERAGE GAUGE</p><span>im φ = {{ imageSet() }}</span><strong>{{ isSurjective() ? '✓ SURJECTIVE' : '× NOT SURJECTIVE' }}</strong><small>{{ image().length }} / {{ model().target }} target elements reached</small></article>
          </section>
          <section class="detector-console"><p class="kicker">COMBINED READING</p><div class="map-verdict" [class.fail]="!isIsomorphism()">{{ combinedVerdict() }}</div><p>{{ explanation() }}</p></section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>ker φ = {{'{e}'}}</span><i>detects injective</i><span>im φ = H</span><i>detects surjective</i></div><p><strong>Kernel 問「有沒有被抹掉的差異」；image 問「target 有沒有漏掉的區域」。</strong>兩問合起來才是 bijective homomorphism，也就是 isomorphism。</p></aside>

      <section class="transfer"><p class="kicker">遷移</p><h3>若 finite groups |G|=|H|，homomorphism 已知 injective，還需要另證 surjective 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(false)">不用，finite equal-size 會自動覆蓋</button><button type="button" (click)="transfer.set(true)">仍一定要逐點找 preimage</button></div>@if (transfer() !== null) {<p class="feedback" [class.warning]="transfer()">{{ transfer() ? 'Finite equal-size sets 上，injective map 的 image 已有 |G|=|H| 個 elements。' : '對。這是 finite counting shortcut，不是一般 infinite 情況。' }}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Trivial kernel ⇔ injective</summary><div>若 φ(a)=φ(b)，則 φ(a⁻¹b)=e。Kernel 只有 e 時得到 a=b；反之若 φ injective，φ(g)=e=φ(e) 會迫使 g=e。</div></details><details><summary>Image 全滿 ⇔ surjective</summary><div>Surjective 的定義就是每個 h∈H 都等於某個 φ(g)；換成集合語言，恰是 im φ=H。</div></details></section>
    </article>
  `,
})
export class AlgebraV3MapDetectorComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly selectedId = signal('projection');
  readonly models: MapModel[] = [
    { id: 'projection', label: 'ℤ₆→ℤ₃ · n↦n', source: 6, target: 3, multiplier: 1 },
    { id: 'embedding', label: 'ℤ₃→ℤ₆ · n↦2n', source: 3, target: 6, multiplier: 2 },
    { id: 'automorphism', label: 'ℤ₄→ℤ₄ · n↦3n', source: 4, target: 4, multiplier: 3 },
    { id: 'zero', label: 'ℤ₄→ℤ₆ · n↦0', source: 4, target: 6, multiplier: 0 },
  ];
  readonly model = computed(() => this.models.find((item) => item.id === this.selectedId()) ?? this.models[0]);
  readonly sourceElements = computed(() => Array.from({ length: this.model().source }, (_, n) => n));
  readonly kernel = computed(() => this.sourceElements().filter((n) => this.map(n) === 0));
  readonly image = computed(() => [...new Set(this.sourceElements().map((n) => this.map(n)))].sort((a, b) => a - b));
  readonly kernelSet = computed(() => `{${this.kernel().join(', ')}}`);
  readonly imageSet = computed(() => `{${this.image().join(', ')}}`);
  map(n: number): number { return (this.model().multiplier * n) % this.model().target; }
  isInjective(): boolean { return this.kernel().length === 1; }
  isSurjective(): boolean { return this.image().length === this.model().target; }
  isIsomorphism(): boolean { return this.isInjective() && this.isSurjective(); }
  combinedVerdict(): string { if (this.isIsomorphism()) return '✓ BOTH GAUGES PASS · ISOMORPHISM'; if (this.isInjective()) return 'ONE-TO-ONE, BUT TARGET NOT FILLED'; if (this.isSurjective()) return 'TARGET FILLED, BUT INPUTS COLLIDE'; return '× COLLISIONS AND UNREACHED TARGETS'; }
  explanation(): string { if (this.isIsomorphism()) return '沒有不可見差異，也沒有遺漏 output。'; if (this.isInjective()) return 'Source 完整保留，但只嵌入 target 的一部分。'; if (this.isSurjective()) return '每個 target 都到得了，但多個 source elements 被壓在一起。'; return '這個 map 同時遺忘 source 差異，也沒有填滿 target。'; }
}
