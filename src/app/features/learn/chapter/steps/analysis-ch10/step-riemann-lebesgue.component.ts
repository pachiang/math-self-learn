import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-riemann-lebesgue',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="跟 Riemann 積分的關係" subtitle="§10.7">
      <p>
        好消息：Lebesgue 積分<strong>完全相容</strong>Riemann 積分。
      </p>
      <p class="formula">
        f Riemann 可積 ⟹ f Lebesgue 可積，且兩個積分值相等
      </p>
      <p>
        反過來不成立（Dirichlet 函數 Lebesgue 可積但 Riemann 不可積）。
        所以 Lebesgue 是 Riemann 的<strong>嚴格推廣</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Lebesgue 積分的三大優勢">
      <div class="advantages">
        <div class="adv-card">
          <div class="ac-num">1</div>
          <div class="ac-body">
            <div class="ac-title">更多函數可積</div>
            <div class="ac-desc">
              Dirichlet 函數、特徵函數、逐點極限⋯⋯Riemann 處理不了的，Lebesgue 都可以。
            </div>
          </div>
        </div>
        <div class="adv-card">
          <div class="ac-num">2</div>
          <div class="ac-body">
            <div class="ac-title">更強的收斂定理</div>
            <div class="ac-desc">
              DCT 只需要逐點收斂 + 可積控制。Riemann 需要均勻收斂。
              這在概率論和 PDE 裡是<strong>決定性的優勢</strong>。
            </div>
          </div>
        </div>
        <div class="adv-card">
          <div class="ac-num">3</div>
          <div class="ac-body">
            <div class="ac-title">L¹ 完備</div>
            <div class="ac-desc">
              Lebesgue 可積函數空間 L¹ 是完備的度量空間。
              Riemann 可積函數空間不完備——Cauchy 列的極限可以不可積。
            </div>
          </div>
        </div>
      </div>

      <div class="backwards">
        <div class="bw-title">向後相容</div>
        <div class="bw-body">
          你在微積分課裡算的所有積分，用 Lebesgue 定義算出來的值<strong>完全一樣</strong>。
          Lebesgue 不是「替代」Riemann——是「推廣」它。學過的東西一點都不浪費。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節預覽多變數積分的關鍵工具——<strong>Fubini 定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .advantages { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
    .adv-card { display: flex; gap: 14px; padding: 14px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg-surface); }
    .ac-num { width: 32px; height: 32px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; flex-shrink: 0; }
    .ac-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .ac-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--accent); } }
    .backwards { padding: 14px; border: 2px solid #5a8a5a; border-radius: 10px;
      background: rgba(90,138,90,0.06); }
    .bw-title { font-size: 14px; font-weight: 700; color: #5a8a5a; margin-bottom: 6px; }
    .bw-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--text); } }
  `,
})
export class StepRiemannLebesgueComponent {}
