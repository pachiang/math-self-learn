import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface SLExample {
  id: string;
  name: string;
  ode: string;
  p: string;
  q: string;
  w: string;
  eigenfunc: string;
  where: string;
}

const SL_EXAMPLES: SLExample[] = [
  {
    id: 'fourier',
    name: 'Fourier',
    ode: 'y″ + λy = 0',
    p: 'p(x) = 1',
    q: 'q(x) = 0',
    w: 'w(x) = 1',
    eigenfunc: 'sin(nπx/L)',
    where: '弦、常數係數',
  },
  {
    id: 'legendre',
    name: 'Legendre',
    ode: '(1−x²)y″ − 2xy′ + λy = 0',
    p: 'p(x) = 1 − x²',
    q: 'q(x) = 0',
    w: 'w(x) = 1',
    eigenfunc: 'Pₙ(x)',
    where: '球面、[−1, 1]',
  },
  {
    id: 'hermite',
    name: 'Hermite',
    ode: 'y″ − 2xy′ + λy = 0',
    p: 'p(x) = e^(−x²)',
    q: 'q(x) = 0',
    w: 'w(x) = e^(−x²)',
    eigenfunc: 'Hₙ(x)',
    where: '量子諧振子、ℝ',
  },
  {
    id: 'bessel',
    name: 'Bessel',
    ode: 'x²y″ + xy′ + (λx² − n²)y = 0',
    p: 'p(x) = x',
    q: 'q(x) = −n²/x',
    w: 'w(x) = x',
    eigenfunc: 'Jₙ(√λ·x)',
    where: '圓形對稱、[0, R]',
  },
  {
    id: 'laguerre',
    name: 'Laguerre',
    ode: 'xy″ + (1−x)y′ + λy = 0',
    p: 'p(x) = xe^(−x)',
    q: 'q(x) = 0',
    w: 'w(x) = e^(−x)',
    eigenfunc: 'Lₙ(x)',
    where: '氫原子徑向、[0, ∞)',
  },
];

@Component({
  selector: 'app-de-ch11-sl-form',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Sturm-Liouville 形式：統一一切" subtitle="§11.5">
      <p>
        Ch10 的特殊函數、§11.2 的弦振動看起來是獨立的故事。
        Sturm-Liouville 理論把它們<strong>統一成一個架構</strong>。
      </p>
      <p class="key-idea">
        <strong>Sturm-Liouville 標準形式</strong>：
      </p>
      <div class="centered-eq big">
        −(p(x) y′)′ + q(x) y = λ w(x) y,&nbsp;&nbsp;x ∈ [a, b]
      </div>
      <p>
        配合合適的邊界條件（Dirichlet / Neumann / Robin / Periodic）。
        這裡：
      </p>
      <ul class="coef-list">
        <li><code>p(x) &gt; 0</code>：跟「張力 / 擴散係數」對應。</li>
        <li><code>q(x)</code>：類似位能。</li>
        <li><code>w(x) &gt; 0</code>：<strong>權重函數</strong>。改變內積的定義 <code>⟨f,g⟩ = ∫ f·g·w dx</code>。</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="選一個經典方程，看它怎麼寫成 SL 形式">
      <div class="tab-row">
        @for (ex of examples; track ex.id) {
          <button class="tab" [class.active]="selected() === ex.id" (click)="selected.set(ex.id)">
            {{ ex.name }}
          </button>
        }
      </div>

      <div class="sl-card">
        <div class="sl-header">
          <div class="sl-label">原 ODE</div>
          <div class="sl-ode">{{ current().ode }}</div>
        </div>
        <div class="sl-arrow">↓ 化為 SL 形式 ↓</div>
        <div class="sl-sf">
          −(<span class="p">{{ current().p }}</span> · y′)′ + <span class="q">{{ current().q }}</span> · y = λ · <span class="w">{{ current().w }}</span> · y
        </div>
        <div class="sl-grid">
          <div class="sl-item">
            <div class="sl-item-lab">本徵函數</div>
            <div class="sl-item-val">{{ current().eigenfunc }}</div>
          </div>
          <div class="sl-item">
            <div class="sl-item-lab">出場</div>
            <div class="sl-item-val small">{{ current().where }}</div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>SL 定理（本章的核心）</h4>
      <p>對任何「正則」SL 問題（p, w 在 [a, b] 連續、正值、邊界合規）：</p>
      <ol class="sl-thm">
        <li>本徵值 <strong>λ₁ &lt; λ₂ &lt; λ₃ &lt; ⋯</strong>，全為實數，且 <strong>λₙ → ∞</strong>。</li>
        <li>本徵函數族 <strong>(yₙ)</strong> 在權重 w 下正交：<code>∫ yₘ yₙ w dx = 0 (m ≠ n)</code>。</li>
        <li>族 <strong>(yₙ) 完備</strong>：任何滿足邊界條件的 f 可展開為 <code>f(x) = Σ cₙ yₙ(x)</code>。</li>
        <li><strong>Fₙ(x) 有 n−1 個內部零點</strong>（跟弦的駐波節點數對應）。</li>
      </ol>

      <h4>為什麼這個結構這麼萬能？</h4>
      <p>
        每個物理系統（擴散、振動、波傳、量子）可以寫成
        <strong>算子 Ly = λwy</strong> 的形式，算子自伴，於是：
      </p>
      <ul class="outcomes">
        <li><strong>本徵值 = 能量 / 頻率 / 衰減率</strong>（都是實數，有物理意義）。</li>
        <li><strong>本徵函數 = 模態 / 波函數 / 駐波形狀</strong>（彼此獨立演化）。</li>
        <li><strong>展開 = 分解到模態空間</strong>（物理中叫「譜分解」）。</li>
      </ul>

      <div class="ch-preview">
        <h4>這章讓你帶走什麼</h4>
        <p>
          BVP 的本徵值問題 → 正交本徵函數 → 函數展開 → SL 統一架構。
          這五節的工具<strong>全部</strong>會在下一章發揮作用：
          用「空間的本徵函數 × 時間的 ODE」組合出 PDE 的解。
          這就是 <strong>分離變數法</strong>——PDE 的第一大兵器。
        </p>
        <div class="preview-row">
          <span class="preview-ch">下一章：Ch12 熱方程</span>
          <span class="preview-arrow">→</span>
          <span class="preview-what">用本章的工具解真正的 PDE</span>
        </div>
      </div>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 15px; margin: 12px 0; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }

    .coef-list { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .coef-list strong { color: var(--accent); }

    .tab-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .tab { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 16px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .tab.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .tab:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .sl-card { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; }
    .sl-header { margin-bottom: 8px; }
    .sl-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .sl-ode { text-align: center; font-size: 16px; font-family: 'JetBrains Mono', monospace; padding: 8px; background: var(--bg); border-radius: 6px; color: var(--text); }
    .sl-arrow { text-align: center; color: var(--accent); font-weight: 700; margin: 6px 0; }
    .sl-sf { text-align: center; font-size: 17px; font-family: 'JetBrains Mono', monospace; padding: 12px; background: var(--accent-10); border: 1px solid var(--accent-30); border-radius: 6px; color: var(--accent); font-weight: 600; }
    .sl-sf .p { color: #5ca878; }
    .sl-sf .q { color: #c87b5e; }
    .sl-sf .w { color: #5a8aa8; }

    .sl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
    .sl-item { padding: 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; text-align: center; }
    .sl-item-lab { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .sl-item-val { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .sl-item-val.small { font-size: 12px; font-family: inherit; font-weight: 500; }

    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .sl-thm { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .sl-thm strong { color: var(--accent); }
    .outcomes { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .outcomes strong { color: var(--accent); }

    .ch-preview { padding: 16px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 12px; margin-top: 16px; }
    .ch-preview p { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .preview-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 10px; background: var(--accent-10); border-radius: 8px; font-size: 13px; flex-wrap: wrap; }
    .preview-ch { font-weight: 700; color: var(--accent); }
    .preview-arrow { color: var(--accent); }
    .preview-what { color: var(--text-secondary); }
  `,
})
export class DeCh11SlFormComponent {
  readonly selected = signal<string>('legendre');
  readonly examples = SL_EXAMPLES;
  readonly current = computed(() => SL_EXAMPLES.find(e => e.id === this.selected())!);
}
