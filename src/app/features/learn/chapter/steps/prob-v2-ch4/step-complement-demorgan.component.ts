import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type DeMorganMode = 'not-union' | 'not-intersection';

@Component({
  selector: 'app-prob-v2-complement-demorgan',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch4">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 4.3</p>
        <h2>Complement，就是把「選中」與「沒選中」整張反轉</h2>
        <p class="lede">
          事件的<strong>補集（complement）</strong>不是另一個陌生世界； 它仍在同一個 Ω
          裡，只留下原本 event 外面的所有 outcomes。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">De Morgan’s laws · 不背符號，逐格對照</p>
            <h3>A = 偶數；B = 大於 8</h3>
          </div>
        </div>
        <div class="demorgan-controls" role="group" aria-label="選擇 De Morgan 規則">
          <button
            type="button"
            [class.active]="mode() === 'not-union'"
            (click)="mode.set('not-union')"
          >
            <strong>NOT (A OR B)</strong>
            <span>先合併 A、B，再把整個選取反轉</span>
          </button>
          <button
            type="button"
            [class.active]="mode() === 'not-intersection'"
            (click)="mode.set('not-intersection')"
          >
            <strong>NOT (A AND B)</strong>
            <span>先找重疊，再把整個選取反轉</span>
          </button>
        </div>
      </section>

      <section class="mirror-worlds">
        <div class="mirror-panel">
          <p class="eyebrow">左路線 · 先組合，再 complement</p>
          <h3>{{ leftTitle() }}</h3>
          <div class="mini-world" aria-label="先組合事件後取 complement 的結果">
            @for (outcome of outcomes; track outcome) {
              <div [class.selected]="leftSelected(outcome)">{{ outcome }}</div>
            }
          </div>
          <p class="feedback">選中 {{ selectedLabel() }}</p>
        </div>

        <div class="mirror-equals" aria-label="兩邊結果相等">=</div>

        <div class="mirror-panel">
          <p class="eyebrow">右路線 · 先各自 complement，再換 operation</p>
          <h3>{{ rightTitle() }}</h3>
          <div class="mini-world" aria-label="先取各事件 complement 後組合的結果">
            @for (outcome of outcomes; track outcome) {
              <div [class.selected]="rightSelected(outcome)">{{ outcome }}</div>
            }
          </div>
          <p class="feedback">逐格比較，選中的 outcomes 完全相同。</p>
        </div>
      </section>

      <section class="logic-translation">
        <div>
          <span>原句</span>
          <strong>{{ sentenceBefore() }}</strong>
        </div>
        <i>否定往內推，operation 翻面</i>
        <div>
          <span>等價句</span>
          <strong>{{ sentenceAfter() }}</strong>
        </div>
      </section>

      <aside class="insight-card">
        <div class="logic-translation" aria-hidden="true">
          <div>
            <span>NOT (A OR B)</span>
            <strong>NOT A AND NOT B</strong>
          </div>
          <i>↔</i>
          <div>
            <span>NOT (A AND B)</span>
            <strong>NOT A OR NOT B</strong>
          </div>
        </div>
        <div>
          <span class="card-label">否定穿過括號時，OR 與 AND 互換</span>
          <p>
            <strong>「兩者至少一個成立」的否定，是「兩者都不成立」；</strong>
            「兩者都成立」的否定，則是「至少一個不成立」。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：complement identities 與 De Morgan’s laws</summary>
        <div>
          <p>若 <app-math e="A^c=\\Omega\\setminus A" />，則 A 與其 complement 瓜分整個世界：</p>
          <div class="math-line">
            <app-math e="A\\cap A^c=\\varnothing,\\qquad A\\cup A^c=\\Omega" />
          </div>
          <div class="math-line">
            <app-math e="(A\\cup B)^c=A^c\\cap B^c,\\qquad (A\\cap B)^c=A^c\\cup B^c" />
          </div>
          <p>
            因此 <app-math e="P(A^c)=1-P(A)" />。 公式只是「A 與 Aᶜ 正好把總量 1 分完」的數值版本。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ComplementDemorganComponent {
  readonly outcomes = Array.from({ length: 12 }, (_, index) => index + 1);
  readonly mode = signal<DeMorganMode>('not-union');
  readonly leftTitle = computed(() =>
    this.mode() === 'not-union' ? 'Complement of A ∪ B' : 'Complement of A ∩ B',
  );
  readonly rightTitle = computed(() => (this.mode() === 'not-union' ? 'Aᶜ ∩ Bᶜ' : 'Aᶜ ∪ Bᶜ'));
  readonly sentenceBefore = computed(() =>
    this.mode() === 'not-union' ? '不是「是偶數或大於 8」' : '不是「既是偶數又大於 8」',
  );
  readonly sentenceAfter = computed(() =>
    this.mode() === 'not-union' ? '不是偶數，而且不大於 8' : '不是偶數，或是不大於 8',
  );
  readonly selectedOutcomes = computed(() =>
    this.outcomes.filter((outcome) => this.leftSelected(outcome)),
  );
  readonly selectedLabel = computed(() => `{${this.selectedOutcomes().join(', ')}}`);

  inA(outcome: number): boolean {
    return outcome % 2 === 0;
  }

  inB(outcome: number): boolean {
    return outcome > 8;
  }

  leftSelected(outcome: number): boolean {
    if (this.mode() === 'not-union') {
      return !(this.inA(outcome) || this.inB(outcome));
    }
    return !(this.inA(outcome) && this.inB(outcome));
  }

  rightSelected(outcome: number): boolean {
    if (this.mode() === 'not-union') {
      return !this.inA(outcome) && !this.inB(outcome);
    }
    return !this.inA(outcome) || !this.inB(outcome);
  }
}
