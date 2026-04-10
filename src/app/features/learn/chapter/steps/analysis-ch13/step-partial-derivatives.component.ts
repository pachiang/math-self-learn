import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { gradient2D } from './analysis-ch13-util';

@Component({
  selector: 'app-step-partial-derivatives',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="偏導數" subtitle="§13.3">
      <p>
        <strong>偏導數</strong>：固定其他變數，只對一個變數微分。
      </p>
      <p class="formula">
        ∂f/∂x = lim(h→0) [f(x+h, y) − f(x, y)] / h
      </p>
      <p>
        <strong>Schwarz 定理</strong>：如果混合偏導數連續，則交換微分順序不影響結果：
        ∂²f/∂x∂y = ∂²f/∂y∂x。
      </p>
      <p>
        ⚠ 偏導數存在<strong>不保證連續</strong>，更不保證可微（全微分）。
        偏導數只看「座標軸方向」，不看其他方向。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖探針看 f(x,y) = x² + xy 的梯度向量">
      <div class="ctrl-row">
        <span class="cl">x₀ = {{ px().toFixed(1) }}</span>
        <input type="range" min="-2" max="2" step="0.1" [value]="px()"
               (input)="px.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">y₀ = {{ py().toFixed(1) }}</span>
        <input type="range" min="-2" max="2" step="0.1" [value]="py()"
               (input)="py.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-3 -3 6 6" class="grad-svg">
        <!-- Grid -->
        @for (g of [-2,-1,0,1,2]; track g) {
          <line [attr.x1]="g" y1="-3" [attr.x2]="g" y2="3" stroke="var(--border)" stroke-width="0.015" />
          <line x1="-3" [attr.y1]="g" x2="3" [attr.y2]="g" stroke="var(--border)" stroke-width="0.015" />
        }

        <!-- Gradient arrow -->
        <line [attr.x1]="px()" [attr.y1]="py()"
              [attr.x2]="px() + grad()[0] * 0.3" [attr.y2]="py() + grad()[1] * 0.3"
              stroke="var(--accent)" stroke-width="0.06" />
        <circle [attr.cx]="px() + grad()[0] * 0.3" [attr.cy]="py() + grad()[1] * 0.3"
                r="0.06" fill="var(--accent)" />

        <!-- Probe point -->
        <circle [attr.cx]="px()" [attr.cy]="py()" r="0.08"
                fill="var(--accent)" stroke="white" stroke-width="0.03" />

        <!-- Partial x component -->
        <line [attr.x1]="px()" [attr.y1]="py()"
              [attr.x2]="px() + grad()[0] * 0.3" [attr.y2]="py()"
              stroke="#5a7faa" stroke-width="0.04" stroke-dasharray="0.05 0.04" />

        <!-- Partial y component -->
        <line [attr.x1]="px() + grad()[0] * 0.3" [attr.y1]="py()"
              [attr.x2]="px() + grad()[0] * 0.3" [attr.y2]="py() + grad()[1] * 0.3"
              stroke="#aa5a6a" stroke-width="0.04" stroke-dasharray="0.05 0.04" />
      </svg>

      <div class="result-row">
        <div class="r-card">∂f/∂x = {{ grad()[0].toFixed(2) }}</div>
        <div class="r-card">∂f/∂y = {{ grad()[1].toFixed(2) }}</div>
        <div class="r-card accent">∇f = ({{ grad()[0].toFixed(2) }}, {{ grad()[1].toFixed(2) }})</div>
      </div>

      <div class="legend">
        <span><span class="dot blue"></span>∂f/∂x 分量</span>
        <span><span class="dot red"></span>∂f/∂y 分量</span>
        <span><span class="dot accent"></span>梯度 ∇f</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>偏導數只是「座標軸方向的變化率」。下一節看更本質的概念——<strong>全微分</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .cl { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .sl { width: 80px; accent-color: var(--accent); }
    .grad-svg { width: 100%; max-width: 380px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .result-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .r-card { flex: 1; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px;
      font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.accent { color: var(--accent); } }
    .legend { display: flex; gap: 14px; font-size: 11px; color: var(--text-muted); justify-content: center; }
    .dot { display: inline-block; width: 12px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.blue { background: #5a7faa; } &.red { background: #aa5a6a; } &.accent { background: var(--accent); } }
  `,
})
export class StepPartialDerivativesComponent {
  readonly px = signal(1.0);
  readonly py = signal(0.5);

  // f(x,y) = x² + xy → ∂f/∂x = 2x + y, ∂f/∂y = x
  private readonly f = (x: number, y: number) => x * x + x * y;
  readonly grad = computed(() => gradient2D(this.f, this.px(), this.py()));
}
