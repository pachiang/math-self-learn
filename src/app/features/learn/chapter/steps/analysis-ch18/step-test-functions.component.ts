import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { bumpFunction, samplePath } from './analysis-ch18-util';

@Component({
  selector: 'app-step-test-functions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="測試函數空間 D" subtitle="§18.2">
      <p>
        廣義函數的定義需要先有<strong>測試函數</strong>：C∞ 且<strong>緊支撐</strong>（在有限範圍外為零）的函數。
      </p>
      <p class="formula">D = C₀∞(R) = 所有光滑且緊支撐的函數</p>
      <p>
        典型例子：bump function φ(x) = exp(−1/(1−x²)) 在 |x| &lt; 1，外面為零。
        它是<strong>無窮次可微</strong>但在 |x|=1 處突然變零——光滑函數的魔法。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動支撐寬度 a，看 bump function 如何變化">
      <div class="ctrl-row">
        <span class="cl">支撐 a = {{ support().toFixed(2) }}</span>
        <input type="range" min="0.2" max="3" step="0.05" [value]="support()"
               (input)="support.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 500 200" class="tf-svg">
        <line x1="40" y1="170" x2="460" y2="170" stroke="var(--border)" stroke-width="0.8" />
        <line x1="250" y1="20" x2="250" y2="170" stroke="var(--border)" stroke-width="0.5" />

        <!-- Support region highlight -->
        <rect [attr.x]="250 - support() * 70" y="20" [attr.width]="support() * 140" height="150"
              fill="var(--accent)" fill-opacity="0.04" />
        <line [attr.x1]="250 - support() * 70" y1="20" [attr.x2]="250 - support() * 70" y2="170"
              stroke="var(--accent)" stroke-width="0.5" stroke-dasharray="4 3" />
        <line [attr.x1]="250 + support() * 70" y1="20" [attr.x2]="250 + support() * 70" y2="170"
              stroke="var(--accent)" stroke-width="0.5" stroke-dasharray="4 3" />

        <!-- Bump function -->
        <path [attr.d]="bumpPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <text [attr.x]="250 - support() * 70 - 5" y="175" text-anchor="end" fill="var(--text-muted)" font-size="7">−a</text>
        <text [attr.x]="250 + support() * 70 + 5" y="175" fill="var(--text-muted)" font-size="7">a</text>
      </svg>

      <div class="properties">
        <div class="prop"><span class="pk">C∞</span> 無窮次可微（所有導數存在且連續）</div>
        <div class="prop"><span class="pk">支撐</span> 在 [−{{ support().toFixed(2) }}, {{ support().toFixed(2) }}] 外恆等於 0</div>
        <div class="prop"><span class="pk">正</span> φ(x) ≥ 0 在支撐內</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        測試函數空間 D 配上適當的拓撲（比 L² 拓撲更精細）後，
        <strong>分佈就是 D 上的連續線性泛函</strong>。下一節正式定義。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 90px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .tf-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 12px; }
    .properties { display: flex; flex-direction: column; gap: 6px; }
    .prop { padding: 8px 12px; border-radius: 6px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-secondary); }
    .pk { font-weight: 700; color: var(--accent); margin-right: 8px; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepTestFunctionsComponent {
  readonly support = signal(1);

  bumpPath(): string {
    const a = this.support();
    return samplePath((x) => bumpFunction(x, a), -3.5, 3.5, 130, 170, 70, 250);
  }
}
