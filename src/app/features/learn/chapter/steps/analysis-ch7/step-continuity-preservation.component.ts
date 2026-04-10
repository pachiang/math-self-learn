import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn, supNorm } from './analysis-ch7-util';

@Component({
  selector: 'app-step-continuity-preservation',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="連續性的保持" subtitle="§7.4">
      <p>
        <strong>定理</strong>：如果每個 fₙ 連續，且 fₙ → f <strong>均勻</strong>收斂，
        那 f 也連續。
      </p>
      <p>
        這是均勻收斂最核心的用處。逐點收斂做不到這一點（xⁿ 的例子）。
      </p>
      <p class="formula">
        連續 + 均勻收斂 → 極限連續<br />
        連續 + 逐點收斂 → 極限<strong>可能不連續</strong>
      </p>
    </app-prose-block>

    <app-challenge-card prompt="對比：均勻收斂保持連續 vs 逐點收斂破壞連續">
      <div class="dual-panel">
        <div class="panel ok-panel">
          <div class="p-title ok">均勻收斂：sin(x)/n → 0</div>
          <svg viewBox="0 0 240 160" class="cp-svg">
            <line x1="20" y1="80" x2="220" y2="80" stroke="var(--border)" stroke-width="0.5" />
            @for (k of [1, 3, 5, 10]; track k) {
              <path [attr.d]="sinNPath(k)" fill="none" stroke="var(--accent)"
                    [attr.stroke-width]="k === nVal() ? 2.5 : 0.8"
                    [attr.stroke-opacity]="k === nVal() ? 1 : 0.2" />
            }
            <path [attr.d]="sinNPath(nVal())" fill="none" stroke="var(--accent)" stroke-width="2.5" />
            <!-- Limit = 0 -->
            <line x1="20" y1="80" x2="220" y2="80" stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="4 3" />
          </svg>
          <div class="p-verdict ok">每個 fₙ 連續，極限 = 0 也連續 ✓</div>
        </div>

        <div class="panel bad-panel">
          <div class="p-title bad">逐點收斂：xⁿ → 跳躍</div>
          <svg viewBox="0 0 240 160" class="cp-svg">
            <line x1="20" y1="140" x2="220" y2="140" stroke="var(--border)" stroke-width="0.5" />
            @for (k of [1, 3, 5, 10]; track k) {
              <path [attr.d]="xNPath(k)" fill="none" stroke="#a05a5a"
                    [attr.stroke-width]="k === nVal() ? 2.5 : 0.8"
                    [attr.stroke-opacity]="k === nVal() ? 1 : 0.2" />
            }
            <path [attr.d]="xNPath(nVal())" fill="none" stroke="#a05a5a" stroke-width="2.5" />
            <!-- Limit: 0 on [0,1), 1 at 1 -->
            <line x1="20" y1="140" x2="210" y2="140" stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="4 3" />
            <circle cx="220" cy="20" r="4" fill="#5a8a5a" />
          </svg>
          <div class="p-verdict bad">每個 fₙ 連續，但極限不連續 ✗</div>
        </div>
      </div>

      <div class="n-ctrl">
        <span class="nl">n = {{ nVal() }}</span>
        <input type="range" min="1" max="20" step="1" [value]="nVal()"
               (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        證明的關鍵：均勻收斂讓我們用同一個 N 控制所有 x，
        再配合 fₙ 在每個 x 的連續性，三角不等式把兩者拼起來。
      </p>
      <p>下一節看另一個重要的交換：<strong>逐項微分</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      strong { color: #a05a5a; } }
    .dual-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    @media (max-width: 600px) { .dual-panel { grid-template-columns: 1fr; } }
    .panel { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .p-title { padding: 8px 10px; font-size: 12px; font-weight: 700;
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
    .cp-svg { width: 100%; display: block; background: var(--bg); }
    .p-verdict { padding: 6px 10px; text-align: center; font-size: 11px; font-weight: 600;
      &.ok { color: #5a8a5a; } &.bad { color: #a05a5a; } }
    .n-ctrl { display: flex; align-items: center; gap: 10px; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { flex: 1; accent-color: var(--accent); }
  `,
})
export class StepContinuityPreservationComponent {
  readonly nVal = signal(5);

  sinNPath(n: number): string {
    const pts: string[] = [];
    for (let x = 0; x <= 2 * Math.PI; x += 0.05) {
      const y = Math.sin(x) / n;
      pts.push(`${20 + (x / (2 * Math.PI)) * 200},${80 - y * 60}`);
    }
    return 'M' + pts.join('L');
  }

  xNPath(n: number): string {
    const pts: string[] = [];
    for (let x = 0; x <= 1; x += 0.005) {
      const y = Math.pow(x, n);
      pts.push(`${20 + x * 200},${140 - y * 120}`);
    }
    return 'M' + pts.join('L');
  }
}
