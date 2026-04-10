import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-fatou',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Fatou 引理" subtitle="§10.5">
      <p>不要求單調時，等號可能變成不等號：</p>
      <p class="formula axiom">
        如果 fₙ ≥ 0，那麼<br />
        <strong>∫ lim inf fₙ ≤ lim inf ∫ fₙ</strong>
      </p>
      <p>
        「積分的 lim inf ≥ lim inf 的積分」。嚴格不等號是可能的——
        面積可以在極限過程中「逃走」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="嚴格不等號的例子：面積逃走了！">
      <div class="example-card">
        <div class="ec-title">經典反例</div>
        <div class="ec-body">
          <p>fₙ(x) = n · 1(0, 1/n)(x)。</p>
          <p>每個 fₙ 是高度 n、寬度 1/n 的矩形。</p>
          <ul>
            <li>∫ fₙ = n · (1/n) = <strong>1</strong> 對所有 n</li>
            <li>lim fₙ(x) = 0 對所有 x > 0 → ∫ lim fₙ = <strong>0</strong></li>
          </ul>
          <p class="inequality">0 = ∫ lim fₙ &lt; lim inf ∫ fₙ = 1</p>
          <p>面積「逃到無窮高」了——矩形越來越窄但越來越高，面積守恆但極限函數是零。</p>
        </div>
      </div>

      <div class="comparison">
        <table class="cmp">
          <thead><tr><th>定理</th><th>條件</th><th>結論</th></tr></thead>
          <tbody>
            <tr><td>MCT</td><td>0 ≤ f₁ ≤ f₂ ≤ …（<strong>單調</strong>）</td><td>lim ∫ = ∫ lim（<strong>等號</strong>）</td></tr>
            <tr><td>Fatou</td><td>fₙ ≥ 0（<strong>不需要單調</strong>）</td><td>∫ lim inf ≤ lim inf ∫（<strong>不等號</strong>）</td></tr>
            <tr><td>DCT</td><td>|fₙ| ≤ g ∈ L¹（<strong>控制</strong>）</td><td>lim ∫ = ∫ lim（<strong>等號</strong>）</td></tr>
          </tbody>
        </table>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>Fatou 引理是 MCT 和 DCT 之間的橋樑。下一節看最強的工具——<strong>控制收斂定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } strong { color: var(--text); } }
    .example-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 14px; }
    .ec-title { font-size: 14px; font-weight: 700; color: #a05a5a; margin-bottom: 8px; }
    .ec-body { font-size: 13px; color: var(--text-secondary); line-height: 1.8;
      strong { color: var(--accent); font-size: 15px; }
      p { margin: 6px 0; } }
    .inequality { text-align: center; font-size: 15px; font-weight: 700; color: #a05a5a;
      font-family: 'JetBrains Mono', monospace; padding: 8px;
      background: rgba(160,90,90,0.08); border-radius: 6px; }
    .comparison { overflow-x: auto; }
    .cmp { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cmp th { padding: 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 600; background: var(--bg-surface); }
    .cmp td { padding: 8px; border-bottom: 1px solid var(--border); color: var(--text-secondary);
      strong { color: var(--accent); } }
  `,
})
export class StepFatouComponent {}
