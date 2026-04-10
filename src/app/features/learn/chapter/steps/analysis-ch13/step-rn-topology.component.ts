import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-rn-topology',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Rⁿ 的拓撲" subtitle="§13.1">
      <p>
        Ch8 學了一般度量空間。現在回到具體的 Rⁿ，回顧它的拓撲性質。
      </p>
      <ul>
        <li><strong>範數等價</strong>：Rⁿ 上所有範數都等價（Ch8 的 Lᵖ 球會變形，但開集不變）</li>
        <li><strong>Heine-Borel</strong>：緊緻 ⟺ 閉且有界</li>
        <li><strong>完備</strong>：Cauchy 列一定收斂</li>
        <li><strong>局部緊</strong>：每個點有緊鄰域</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="Rⁿ 的特殊之處">
      <div class="comparison">
        <table class="cmp">
          <thead><tr><th></th><th>R（Ch1-7）</th><th>Rⁿ（Ch13）</th><th>一般度量空間（Ch8）</th></tr></thead>
          <tbody>
            <tr><th>完備</th><td class="ok">✓</td><td class="ok">✓</td><td>不一定</td></tr>
            <tr><th>局部緊</th><td class="ok">✓</td><td class="ok">✓</td><td>不一定</td></tr>
            <tr><th>Heine-Borel</th><td class="ok">✓</td><td class="ok">✓</td><td class="bad">✗（一般需要全有界）</td></tr>
            <tr><th>連通</th><td class="ok">✓</td><td class="ok">✓</td><td>不一定</td></tr>
            <tr><th>範數等價</th><td>只有一種</td><td class="ok">✓（有限維）</td><td class="bad">✗（無限維不等價）</td></tr>
          </tbody>
        </table>
      </div>

      <div class="key-point">
        <strong>有限維是關鍵</strong>。Rⁿ 的很多好性質（Heine-Borel、範數等價）
        在無限維空間裡都失效。這就是泛函分析「更難」的原因。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看多變數函數的極限和連續——比一變數微妙得多。</p>
    </app-prose-block>
  `,
  styles: `
    .comparison { margin-bottom: 14px; overflow-x: auto; }
    .cmp { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cmp th { padding: 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 600; background: var(--bg-surface); }
    .cmp td { padding: 8px; border-bottom: 1px solid var(--border); color: var(--text-secondary);
      &.ok { color: #5a8a5a; font-weight: 600; } &.bad { color: #a05a5a; } }
    .key-point { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--accent-10); border-radius: 8px;
      strong { color: var(--accent); } }
  `,
})
export class StepRnTopologyComponent {}
