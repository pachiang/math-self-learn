import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-arzela-ascoli',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Arzela-Ascoli 定理" subtitle="§7.9">
      <p>
        第二章的 <strong>Bolzano-Weierstrass</strong> 說：有界數列有收斂子列。
        <strong>Arzela-Ascoli</strong> 是函數版本：
      </p>
      <p class="formula axiom">
        如果函數列 {{ '{' }}fₙ{{ '}' }} 在 [a,b] 上<br />
        (1) <strong>一致有界</strong>：∃M, |fₙ(x)| ≤ M ∀n, ∀x<br />
        (2) <strong>等度連續</strong>：∀ε, ∃δ, ∀n, |x−y|&lt;δ ⟹ |fₙ(x)−fₙ(y)|&lt;ε<br />
        那麼存在<strong>均勻收斂的子列</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="BW vs Arzela-Ascoli 的類比">
      <div class="analogy-table">
        <table class="cmp">
          <thead>
            <tr><th></th><th>Bolzano-Weierstrass (Ch2)</th><th>Arzela-Ascoli (Ch7)</th></tr>
          </thead>
          <tbody>
            <tr>
              <th>對象</th><td>數列（數的序列）</td><td>函數列（函數的序列）</td>
            </tr>
            <tr>
              <th>條件</th><td>有界</td><td>一致有界 + 等度連續</td>
            </tr>
            <tr>
              <th>結論</th><td>有收斂子列</td><td>有<strong>均勻收斂</strong>子列</td>
            </tr>
            <tr>
              <th>空間</th><td>R（有限維）</td><td>C[a,b]（無限維）</td>
            </tr>
            <tr>
              <th>核心</th><td>完備性 + 有界</td><td>完備性 + 有界 + <strong>等度連續</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="key-insight">
        <div class="ki-title">為什麼需要「等度連續」？</div>
        <div class="ki-body">
          <p>
            在有限維空間裡，「有界」就夠了（BW）。但在無限維空間裡，
            有界<strong>不夠</strong>——需要額外的「緊緻性」條件。
          </p>
          <p>
            等度連續就是這個額外條件。它防止函數列「越來越野」——
            振盪越來越劇烈但振幅不變的函數列有界但<strong>沒有收斂子列</strong>。
          </p>
          <p>
            例如 fₙ(x) = sin(nx)：有界（|fₙ| ≤ 1）但振盪越來越快 →
            不等度連續 → Arzela-Ascoli 不適用 → 果然沒有均勻收斂子列。
          </p>
        </div>
      </div>

      <div class="applications">
        <div class="app-title">Arzela-Ascoli 的應用</div>
        <ul class="app-list">
          <li><strong>ODE 存在性</strong>：Picard-Lindelöf 定理的證明</li>
          <li><strong>變分法</strong>：最小化泛函的「直接方法」</li>
          <li><strong>PDE</strong>：橢圓方程解的正則性</li>
          <li><strong>概率論</strong>：隨機過程的緊緻性</li>
        </ul>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Arzela-Ascoli 把有限維的直覺（BW）推廣到函數空間。
        它是泛函分析的入口——從這裡開始，分析跳出了「一個函數」的框架，
        開始研究「函數的集合」的結構。
      </p>
      <p>下一節心智圖總結。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 12px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); }
      strong { color: var(--text); } }
    .analogy-table { margin-bottom: 14px; overflow-x: auto; }
    .cmp { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cmp th { padding: 8px 10px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); background: var(--bg-surface); font-weight: 600; }
    .cmp td { padding: 8px 10px; border-bottom: 1px solid var(--border);
      color: var(--text-secondary); strong { color: var(--accent); } }
    .key-insight { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 14px; }
    .ki-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .ki-body { font-size: 12px; color: var(--text-secondary); line-height: 1.7;
      p { margin: 6px 0; } strong { color: var(--text); } }
    .applications { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .app-title { font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; }
    .app-list { margin: 0; padding-left: 20px; font-size: 12px; color: var(--text-secondary);
      line-height: 1.8; strong { color: var(--text); } }
  `,
})
export class StepArzelaAscoliComponent {}
