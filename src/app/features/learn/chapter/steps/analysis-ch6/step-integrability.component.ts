import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { upperSum, lowerSum } from './analysis-ch6-util';

@Component({
  selector: 'app-step-integrability',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="可積條件" subtitle="§6.3">
      <p>f 在 [a,b] 上 <strong>Riemann 可積</strong> ⟺ 對任意 ε > 0，存在分割 P 使 U(f,P) − L(f,P) &lt; ε。</p>
      <p>哪些函數可積？</p>
      <ul>
        <li><strong>連續函數</strong>：在閉區間上一定可積（均勻連續保證 U−L → 0）</li>
        <li><strong>單調函數</strong>：即使有跳躍也可積（跳躍只在可數多個點）</li>
        <li><strong>有限個間斷點</strong>的有界函數：可積</li>
        <li><strong>Dirichlet 函數</strong>：處處間斷 → <strong>不可積</strong></li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="Dirichlet 函數：有理數=1，無理數=0。無論怎麼分割，U=1, L=0">
      <div class="n-ctrl">
        <span class="nl">n = {{ nParts() }}</span>
        <input type="range" min="1" max="40" step="1" [value]="nParts()"
               (input)="nParts.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 520 200" class="int-svg">
        <line x1="40" y1="150" x2="500" y2="150" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="150" stroke="var(--border)" stroke-width="0.8" />

        <!-- Upper sum = 1 everywhere (red band) -->
        <rect x="40" y="25" width="460" height="125" fill="#aa5a6a" fill-opacity="0.08"
              stroke="#aa5a6a" stroke-width="0.5" />
        <text x="505" y="35" class="u-label">U = 1</text>

        <!-- Lower sum = 0 everywhere (blue line at bottom) -->
        <line x1="40" y1="150" x2="500" y2="150" stroke="#5a7faa" stroke-width="2" />
        <text x="505" y="155" class="l-label">L = 0</text>

        <!-- Scattered dots for rationals and irrationals -->
        @for (d of dots; track $index) {
          <circle [attr.cx]="40 + d.x * 460" [attr.cy]="d.rational ? 30 : 145"
                  r="2" [attr.fill]="d.rational ? '#aa5a6a' : '#5a7faa'" fill-opacity="0.4" />
        }
      </svg>

      <div class="verdict bad">
        U − L = 1 − 0 = 1，不管分割多細都不變。<strong>Dirichlet 函數不可積。</strong>
      </div>

      <div class="compare">
        <div class="cmp-title">可積 vs 不可積</div>
        <table class="cmp-table">
          <tr><th>函數</th><th>間斷點</th><th>可積？</th></tr>
          <tr><td>連續函數</td><td>0 個</td><td class="ok">✓</td></tr>
          <tr><td>floor(x)</td><td>可數多（跳躍）</td><td class="ok">✓</td></tr>
          <tr><td>Dirichlet</td><td>處處間斷</td><td class="bad">✗</td></tr>
        </table>
        <div class="cmp-note">
          精確判準（Lebesgue 判準）：f 可積 ⟺ 間斷點集合的<strong>測度為零</strong>。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>Dirichlet 函數是 Riemann 積分的極限——它促使了 Lebesgue 積分的發明（後續章節）。</p>
      <p>下一節看積分最重要的性質——<strong>微積分基本定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { flex: 1; accent-color: var(--accent); }
    .int-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .u-label { font-size: 9px; fill: #aa5a6a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .l-label { font-size: 9px; fill: #5a7faa; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .verdict { padding: 10px; text-align: center; font-size: 13px; font-weight: 600;
      border-radius: 8px; margin-bottom: 12px;
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; }
      strong { font-size: 14px; } }
    .compare { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); }
    .cmp-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
    .cmp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cmp-table th { padding: 5px 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); }
    .cmp-table td { padding: 5px 8px; border-bottom: 1px solid var(--border); color: var(--text);
      &.ok { color: #5a8a5a; font-weight: 700; } &.bad { color: #a05a5a; font-weight: 700; } }
    .cmp-note { font-size: 11px; color: var(--text-secondary); margin-top: 8px;
      strong { color: var(--accent); } }
  `,
})
export class StepIntegrabilityComponent {
  readonly nParts = signal(10);
  // Random dots for Dirichlet visualization
  readonly dots = Array.from({ length: 80 }, () => ({
    x: Math.random(), rational: Math.random() < 0.3,
  }));
}
