import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { samplePath, gaussianDelta } from './analysis-ch18-util';

@Component({
  selector: 'app-step-green-function',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="基本解與 Green 函數" subtitle="§18.9">
      <p>
        分佈論最強的應用：解 <strong>PDE</strong>。找「基本解」G 滿足 LG = δ，
        那麼 Lu = f 的解就是 u = G * f。
      </p>
      <p class="formula">Lu = f &nbsp;⇒&nbsp; u = G * f &nbsp;(G 是 L 的 Green 函數)</p>
      <p>
        例：熱方程的 Green 函數 = 高斯核。Laplace 的 Green 函數 = 1/|x|。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="熱方程：初始 delta 脈衝如何隨時間擴散">
      <div class="ctrl-row">
        <span class="cl">t = {{ time().toFixed(3) }}</span>
        <input type="range" min="0.005" max="1" step="0.005" [value]="time()"
               (input)="time.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 500 200" class="heat-svg">
        <line x1="40" y1="170" x2="460" y2="170" stroke="var(--border)" stroke-width="0.8" />
        <line x1="250" y1="10" x2="250" y2="170" stroke="var(--border)" stroke-width="0.5" />

        <!-- Heat kernel at time t -->
        <path [attr.d]="heatPath()" fill="rgba(var(--accent-rgb), 0.1)" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Ghost of initial delta -->
        <line x1="250" y1="170" x2="250" y2="20" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4 3" />
      </svg>

      <div class="info-row">
        <div class="i-card">G(x,t) = (1/√4πt) e^(−x²/4t)</div>
        <div class="i-card">峰高 = {{ peakH().toFixed(2) }}</div>
        <div class="i-card accent">∫ G dx = 1（質量守恆）</div>
      </div>

      <div class="interpretation">
        <strong>物理解讀</strong>：t=0 時所有熱量集中在一個點（δ）。
        隨時間推移，熱量按高斯分佈擴散——越來越平坦，但總熱量不變。
        Green 函數 = 「單位衝擊的響應」。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        分佈論把 PDE 變成<strong>代數問題</strong>：
        用 Fourier 變換把微分算子變成乘法 → 解方程 → 反變換回來。
        這是現代 PDE 理論的基本框架。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .sl { flex: 1; accent-color: var(--accent); height: 24px; }
    .heat-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 12px; }
    .info-row { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
    .i-card { flex: 1; min-width: 100px; padding: 8px; border-radius: 8px; text-align: center; font-size: 11px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
    .interpretation { padding: 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted); line-height: 1.7; }
    .interpretation strong { color: var(--accent); }
  `,
})
export class StepGreenFunctionComponent {
  readonly time = signal(0.05);

  readonly peakH = computed(() => 1 / Math.sqrt(4 * Math.PI * this.time()));

  heatPath(): string {
    const t = this.time();
    const heatKernel = (x: number) => (1 / Math.sqrt(4 * Math.PI * t)) * Math.exp(-x * x / (4 * t));
    const peak = heatKernel(0);
    const yScale = Math.min(150, 150 / (peak * 0.8));
    return samplePath(heatKernel, -3, 3, yScale, 170, 70, 250);
  }
}
