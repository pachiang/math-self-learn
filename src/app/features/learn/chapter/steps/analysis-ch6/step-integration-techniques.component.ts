import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-integration-techniques',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="積分技巧" subtitle="§6.5">
      <p>FTC II 把積分變成「找反導數」的問題。三大技巧：</p>
    </app-prose-block>

    <app-challenge-card prompt="三大積分技巧一覽">
      <div class="techniques">
        <div class="tech-card">
          <div class="tc-num">1</div>
          <div class="tc-body">
            <div class="tc-title">換元法（Substitution）</div>
            <div class="tc-formula">∫ f(g(x)) g'(x) dx = ∫ f(u) du，u = g(x)</div>
            <div class="tc-why">鏈式法則的逆運算。「把內層拿出來當新變數」。</div>
            <div class="tc-example">
              例：∫ 2x · cos(x²) dx = ∫ cos(u) du = sin(u) = sin(x²)
            </div>
          </div>
        </div>

        <div class="tech-card">
          <div class="tc-num">2</div>
          <div class="tc-body">
            <div class="tc-title">分部積分（Integration by Parts）</div>
            <div class="tc-formula">∫ u dv = uv − ∫ v du</div>
            <div class="tc-why">乘法法則的逆運算。「一邊微分一邊積分」。</div>
            <div class="tc-example">
              例：∫ x·eˣ dx = x·eˣ − ∫ eˣ dx = x·eˣ − eˣ
            </div>
          </div>
        </div>

        <div class="tech-card">
          <div class="tc-num">3</div>
          <div class="tc-body">
            <div class="tc-title">部分分式（Partial Fractions）</div>
            <div class="tc-formula">P(x)/Q(x) = A/(x−a) + B/(x−b) + …</div>
            <div class="tc-why">把複雜的有理函數拆成簡單的 1/(x−a) 型。</div>
            <div class="tc-example">
              例：∫ 1/(x²−1) dx = ½ ∫ [1/(x−1) − 1/(x+1)] dx
            </div>
          </div>
        </div>
      </div>

      <div class="insight">
        這三個技巧涵蓋了大部分「可以手算」的積分。
        但有些積分<strong>沒有初等反導數</strong>（如 e^(−x²)）——
        只能用數值方法或級數。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看積分的一個重要應用：<strong>瑕積分</strong>（improper integrals）。</p>
    </app-prose-block>
  `,
  styles: `
    .techniques { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
    .tech-card { display: flex; gap: 14px; padding: 14px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg-surface); }
    .tc-num { width: 32px; height: 32px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 700; flex-shrink: 0; }
    .tc-body { flex: 1; }
    .tc-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .tc-formula { font-size: 14px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 8px 12px; margin: 6px 0;
      background: var(--accent-10); border-radius: 6px; }
    .tc-why { font-size: 12px; color: var(--text-secondary); margin: 4px 0; }
    .tc-example { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
      padding: 6px 10px; background: var(--bg); border-radius: 4px; margin-top: 6px; }
    .insight { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      strong { color: var(--accent); } }
  `,
})
export class StepIntegrationTechniquesComponent {}
