import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-riemann-comparison',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="與 Riemann 的比較" subtitle="§9.8">
      <p>Lebesgue 判準（精確版）：</p>
      <p class="formula axiom">
        f 在 [a,b] 上 Riemann 可積 ⟺<br />
        f 有界，且間斷點集合的 <strong>Lebesgue 測度 = 0</strong>
      </p>
      <p>
        這完美地解釋了 Ch6 的所有例子：連續函數的間斷點集 = ∅（測度零），
        Dirichlet 函數的間斷點 = R（正測度）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Riemann vs Lebesgue 的全面比較">
      <div class="compare-table">
        <table class="cmp">
          <thead>
            <tr><th></th><th>Riemann</th><th>Lebesgue</th></tr>
          </thead>
          <tbody>
            <tr>
              <th>切法</th><td>垂直（x 軸分割）</td><td>水平（y 軸分割）</td>
            </tr>
            <tr>
              <th>定義域</th><td>有界閉區間 [a,b]</td><td>任何可測集</td>
            </tr>
            <tr>
              <th>Dirichlet 函數</th><td class="bad">不可積 ✗</td><td class="ok">可積，∫ = 0 ✓</td>
            </tr>
            <tr>
              <th>逐點極限交換</th><td class="bad">需要均勻收斂</td><td class="ok">DCT（更弱條件）✓</td>
            </tr>
            <tr>
              <th>完備性</th><td class="bad">L¹ 不完備</td><td class="ok">L¹ 完備 ✓</td>
            </tr>
            <tr>
              <th>Riemann 可積 →</th><td colspan="2" class="note">Riemann 可積 → Lebesgue 可積，且積分值相同</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-box">
        <div class="sb-title">為什麼 Lebesgue 贏了？</div>
        <div class="sb-body">
          <p>
            Lebesgue 積分嚴格推廣 Riemann 積分：任何 Riemann 可積的函數都 Lebesgue 可積，
            但反過來不成立（Dirichlet 函數）。
          </p>
          <p>
            更重要的是 <strong>DCT</strong>（下一章）——
            它讓極限和積分的交換變得容易得多。
            這是整個現代分析選擇 Lebesgue 的根本原因。
          </p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節心智圖總結 Lebesgue 測度。下一章正式定義 <strong>Lebesgue 積分</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); }
      strong { color: var(--text); } }
    .compare-table { margin-bottom: 14px; overflow-x: auto; }
    .cmp { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cmp th { padding: 8px 10px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); background: var(--bg-surface); font-weight: 600; }
    .cmp td { padding: 8px 10px; border-bottom: 1px solid var(--border);
      color: var(--text-secondary);
      &.ok { color: #5a8a5a; font-weight: 600; }
      &.bad { color: #a05a5a; font-weight: 600; }
      &.note { text-align: center; font-style: italic; } }
    .summary-box { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .sb-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .sb-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      p { margin: 6px 0; } strong { color: var(--accent); } }
  `,
})
export class StepRiemannComparisonComponent {}
