import { Component, computed, signal } from '@angular/core';
import {
  D3_ELEMENTS,
  type D3Element,
  inverse,
  label,
  multiply,
} from '../algebra-v3-ch16/d3-model';

@Component({
  selector: 'app-algebra-v3-left-translation-factory',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch21-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 21.1</p>
        <h2>固定一個群元素去左乘，整個群會被重新排一次</h2>
        <p class="lede">
          把 <code>g</code> 固定，讓每個 <code>x</code> 都走到 <code>gx</code>。群的 inverse
          保證這不是壓扁或複製，而是一張可逆 wiring。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>兩個不同輸入 x、y，有可能被同一個 g 左乘後撞在同一點嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不可能，左乘可取消</button>
          <button type="button" (click)="prediction.set(true)">可能，乘法會合併</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{ prediction()
              ? '若 gx = gy，兩邊左乘 g⁻¹ 就得到 x = y；collision 不能發生。'
              : '對。g⁻¹ 能把每條路倒轉，所以不同輸入不會 collision。' }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Left translation factory</p>
            <h3>換一個 g，就製造一張新的 permutation L<sub>g</sub></h3>
          </div>
          <p>左欄與右欄都是同一個 D₃；線只是在改變「誰被指到誰」。</p>
        </div>

        <div class="actor-picker" aria-label="選擇左乘的群元素">
          @for (element of elements; track element) {
            <button
              type="button"
              [attr.aria-pressed]="actor() === element"
              (click)="actor.set(element)"
            >
              g = {{ name(element) }}
            </button>
          }
        </div>

        <div class="stage translation-stage">
          <svg viewBox="0 0 720 390" role="img" [attr.aria-label]="wiringLabel()">
            <defs>
              <marker id="ch21-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
            <text x="90" y="24" class="column-title">INPUT x</text>
            <text x="570" y="24" class="column-title">OUTPUT gx</text>
            @for (wire of wiring(); track wire.source) {
              <line
                x1="145"
                [attr.y1]="y(wire.source)"
                x2="575"
                [attr.y2]="y(wire.target)"
                marker-end="url(#ch21-arrow)"
              />
            }
            @for (element of elements; track element) {
              <g class="state-node">
                <circle cx="110" [attr.cy]="y(element)" r="23" />
                <text x="110" [attr.y]="y(element) + 6">{{ name(element) }}</text>
              </g>
              <g class="state-node output-node">
                <circle cx="610" [attr.cy]="y(element)" r="23" />
                <text x="610" [attr.y]="y(element) + 6">{{ name(element) }}</text>
              </g>
            }
          </svg>

          <section class="translation-console" aria-live="polite">
            <p class="kicker">PERMUTATION BUILT</p>
            <strong>L<sub>{{ name(actor()) }}</sub> : x ↦ {{ name(actor()) }}x</strong>
            <div class="bijection-meter">
              <span>UNIQUE OUTPUTS</span>
              <b>{{ uniqueOutputs() }} / 6</b>
              <small>NO COLLISIONS · NO EMPTY TARGETS</small>
            </div>
            <div class="reverse-ticket">
              <span>倒轉這張 wiring</span>
              <b>L<sub>{{ name(inverseActor()) }}</sub></b>
              <small>L<sub>{{ name(inverseActor()) }}</sub> ∘ L<sub>{{ name(actor()) }}</sub> = identity</small>
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>g ∈ G</span><i>manufactures</i><span>L<sub>g</sub> ∈ Sym(G)</span>
        </div>
        <p>
          <strong>群的每個元素，本身就是一台 permutation 製造器。</strong>
          不需要替群找外部舞台；先讓它左乘自己的所有元素，就得到一張可逆重排。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若改用右乘 x ↦ xg，仍會是一張 permutation 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(true)">會，仍可用 g⁻¹ 倒轉</button>
          <button type="button" (click)="transfer.set(false)">不會，只有左乘可以</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">
            {{ transfer()
              ? '對。右乘也可逆；這章選左乘，是為了讓 composition 的順序直接保存原乘法。'
              : 'inverse 在右側一樣能撤銷：xg 再乘 g⁻¹ 就回到 x。' }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>為什麼 Lg 一定 bijective？</summary>
          <div>
            定義 L<sub>g</sub>(x)=gx。它的 inverse function 是 L<sub>g⁻¹</sub>，因為
            g⁻¹(gx)=x 且 g(g⁻¹x)=x。因此 L<sub>g</sub> 同時 injective 與 surjective，屬於
            Sym(G)。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3LeftTranslationFactoryComponent {
  readonly elements = D3_ELEMENTS;
  readonly actor = signal<D3Element>(3);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly wiring = computed(() =>
    this.elements.map(source => ({ source, target: multiply(this.actor(), source) })),
  );
  readonly uniqueOutputs = computed(() => new Set(this.wiring().map(wire => wire.target)).size);
  readonly inverseActor = computed(() => inverse(this.actor()));

  name = label;

  y(element: D3Element): number {
    return 60 + element * 60;
  }

  wiringLabel(): string {
    return `Left translation L_${label(this.actor())}: ${this.wiring()
      .map(wire => `${label(wire.source)} maps to ${label(wire.target)}`)
      .join(', ')}`;
  }
}
