import { Component, signal } from '@angular/core';

interface GaloisStage {
  id: string;
  extension: string;
  scope: string;
  normal: boolean;
  separable: boolean;
  normalEvidence: string;
  normalNote: string;
  separableNote: string;
}

const STAGES: GaloisStage[] = [
  {
    id: 'cbrt2',
    extension: 'ℚ(∛2) / ℚ',
    scope: 'CHAR 0',
    normal: false,
    separable: true,
    normalEvidence: 'WITNESS · x³−2 有根卻未分解',
    normalNote: '缺少 x³−2 的兩個複數 conjugates。',
    separableNote: 'x³−2 有三個 distinct roots；char 0 下 separability 自動成立。',
  },
  {
    id: 'split',
    extension: 'ℚ(∛2, ω) / ℚ',
    scope: 'CHAR 0 · SPLITTING FIELD',
    normal: true,
    separable: true,
    normalEvidence: 'GENERAL CERTIFICATE · splitting field ⇒ normal',
    normalNote: '它是 x³−2 的 splitting field，所以所有 conjugates 到齊。',
    separableNote: 'char 0 下 irreducible polynomial 沒有 repeated roots。',
  },
  {
    id: 'f8',
    extension: '𝔽₈ / 𝔽₂',
    scope: 'FINITE FIELDS · PERFECT',
    normal: true,
    separable: true,
    normalEvidence: 'GENERAL CERTIFICATE · splitting field ⇒ normal',
    normalNote: '𝔽₈ 是 x⁸−x 在 𝔽₂ 上的 splitting field。',
    separableNote: 'finite fields 是 perfect，所有有限擴張都 separable。',
  },
];

@Component({
  selector: 'app-fields-ch6-separable-scope',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 6.4</p>
        <h2>兩道不同的門：normal + separable = Galois</h2>
        <p class="lede">
          <strong>normal</strong> 問「所有 conjugates 是否到齊」；<strong>separable</strong> 問「它們是否彼此相異」。
          前者管完整性，後者管可區分性。只有兩道門都通過，finite extension 才是 <strong>Galois extension</strong>。
        </p>
      </header>

      <span class="map-convention">FINITE EXTENSIONS · NORMAL ≠ SEPARABLE · CHAR 0 / FINITE FIELDS MAINLINE</span>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>ℚ(∛2)/ℚ 的三個 conjugates 彼此相異，這就足以讓它成為 Galois 嗎？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'yes'" (click)="prediction.set('yes')">足夠</button>
          <button type="button" [class.active]="prediction() === 'no'" (click)="prediction.set('no')">還缺一道門</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'yes'">
            {{ prediction() === 'no'
              ? '對。它 separable，但兩個複數 conjugates 不在 field 裡，所以不 normal、也不 Galois。'
              : '還不夠：distinct roots 只通過 separable；ℚ(∛2) 沒把 conjugates 收齊，因此不 normal。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選有限擴張">
        <span class="kicker">FINITE EXTENSION</span>
        @for (s of stages; track s.id) {
          <button type="button" [class.active]="stage().id === s.id" (click)="stage.set(s)">{{ s.extension }}</button>
        }
      </div>

      <section class="stage galois-stage">
        <div class="gate-board">
          <p class="board-scope">{{ stage().extension }} · {{ stage().scope }}</p>
          <div class="axis-gates">
            <div class="axis-gate" [class.pass]="stage().normal" [class.fail]="!stage().normal">
              <span class="gate-index">01 · COMPLETENESS</span>
              <h3>normal</h3>
              <strong>{{ stage().normal ? 'PASS · conjugates 到齊' : 'BLOCKED · conjugates 有缺' }}</strong>
              <p>{{ stage().normalNote }}</p>
            </div>
            <div class="axis-gate" [class.pass]="stage().separable" [class.fail]="!stage().separable">
              <span class="gate-index">02 · DISTINCTNESS</span>
              <h3>separable</h3>
              <strong>{{ stage().separable ? 'PASS · roots 彼此相異' : 'BLOCKED · repeated roots' }}</strong>
              <p>{{ stage().separableNote }}</p>
            </div>
          </div>
          <div class="galois-merge" [class.pass]="stage().normal && stage().separable">
            <span>normal</span><b>＋</b><span>separable</span><b>→</b>
            <strong>{{ stage().normal && stage().separable ? 'GALOIS' : 'NOT GALOIS' }}</strong>
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">兩軸診斷</p>
          <h3>{{ stage().extension }}</h3>
          <p>
            {{ stage().normal && stage().separable
              ? '兩道門都通過：接下來 automorphisms 能完整反映 conjugates 的對稱。'
              : '只通過 separable 不夠：roots 雖可區分，卻沒有全部住在同一個 field。' }}
          </p>
          <div class="readout">Galois ⇔ normal + separable（finite extension）</div>
          <p class="evidence-tag">NORMAL: {{ stage().normalEvidence }} · SEPARABLE: GENERAL ARGUMENT（perfect field）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">N＋S</span>
        <div>
          <strong>normal 管「到齊」；separable 管「不同」——兩者不能互相代替</strong>
          <span>——automorphism 在非 Galois extension 仍可定義；Galois 條件保證下一階段的 symmetry 能完整對應 extension degree。</span>
        </div>
      </section>

      <details>
        <summary>符號層：separable、perfect field 與 char p 例外</summary>
        <p>
          Algebraic extension <code>L/K</code> 是 <strong>separable</strong>，若每個 <code>α∈L</code> 的 minimal polynomial 都沒有 repeated roots；對單一 polynomial 可用
          <code>gcd(f,f′)=1</code> 檢查。Characteristic 0 fields 與 finite fields 都是 <strong>perfect fields</strong>，所以其 algebraic extensions 自動 separable。
          在 imperfect characteristic <code>p</code> field，例如 <code>𝔽ₚ(t)</code> 上的 <code>xᵖ−t</code>，導數為 0，才會出現 inseparable 現象。
          對 finite extension，<code>L/K</code> 是 Galois 當且僅當它同時 normal 與 separable。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh6SeparableScopeComponent {
  readonly stages = STAGES;
  readonly stage = signal<GaloisStage>(STAGES[0]);
  readonly prediction = signal<'yes' | 'no' | null>(null);
}
