import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-inner-product-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="內積空間" subtitle="§12.1">
      <p>
        <strong>內積空間</strong> = 向量空間 + 內積 ⟨·,·⟩，滿足：
      </p>
      <ol>
        <li><strong>正定</strong>：⟨f, f⟩ ≥ 0，且 = 0 ⟺ f = 0</li>
        <li><strong>線性</strong>：⟨αf + βg, h⟩ = α⟨f,h⟩ + β⟨g,h⟩</li>
        <li><strong>共軛對稱</strong>：⟨f, g⟩ = ⟨g, f⟩（實數情形就是對稱）</li>
      </ol>
      <p>
        <strong>Hilbert 空間</strong> = 完備的內積空間。L² 是最重要的例子。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="內積空間的例子">
      <div class="examples">
        <div class="ex-card">
          <div class="ec-name">Rⁿ</div>
          <div class="ec-inner">⟨x, y⟩ = Σ xᵢyᵢ</div>
          <div class="ec-note">有限維 Hilbert 空間（線代 Ch3）</div>
        </div>
        <div class="ex-card">
          <div class="ec-name">L²[0,1]</div>
          <div class="ec-inner">⟨f, g⟩ = ∫₀¹ f(x)g(x) dx</div>
          <div class="ec-note">無限維 Hilbert 空間（Ch11）</div>
        </div>
        <div class="ex-card">
          <div class="ec-name">ℓ²</div>
          <div class="ec-inner">⟨a, b⟩ = Σ aₙbₙ</div>
          <div class="ec-note">平方可和數列的空間</div>
        </div>
        <div class="ex-card">
          <div class="ec-name">Cⁿ（複數）</div>
          <div class="ec-inner">⟨z, w⟩ = Σ z̄ᵢwᵢ</div>
          <div class="ec-note">量子力學的舞台（線代 Ch10）</div>
        </div>
      </div>

      <div class="key-insight">
        <div class="ki-title">內積 → 範數 → 度量</div>
        <div class="ki-body">
          ||f|| = √⟨f,f⟩ 定義範數。d(f,g) = ||f−g|| 定義度量。<br />
          所以 Hilbert 空間自動是 Banach 空間（Ch11），也是度量空間（Ch8）。<br />
          但多了一個關鍵結構：<strong>角度</strong>（正交性）。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>有了內積就能談<strong>正交</strong>——下一節看正交投影定理。</p>
    </app-prose-block>
  `,
  styles: `
    .examples { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
    @media (max-width: 500px) { .examples { grid-template-columns: 1fr; } }
    .ex-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
    .ec-name { font-size: 16px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .ec-inner { font-size: 12px; color: var(--accent); font-family: 'JetBrains Mono', monospace;
      margin: 4px 0; }
    .ec-note { font-size: 11px; color: var(--text-muted); }
    .key-insight { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); }
    .ki-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .ki-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--text); } }
  `,
})
export class StepInnerProductSpaceComponent {}
