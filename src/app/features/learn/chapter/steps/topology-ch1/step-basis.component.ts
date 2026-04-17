import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-topo-basis',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="基底與子基底" subtitle="§1.5">
      <p>
        列出 τ 裡的所有開集很繁瑣。<strong>基底</strong>（basis）B 是一個更小的集族，
        能「生成」整個拓撲：
      </p>
      <p class="formula">U ∈ τ ⟺ U 是 B 裡元素的聯集</p>
      <p>
        就像線性代數裡的基底用有限個向量生成整個空間，
        拓撲的基底用「基本開集」生成所有開集。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="經典基底的例子">
      <div class="basis-list">
        <div class="b-card">
          <div class="b-name">R 的標準拓撲</div>
          <div class="b-basis">B = 所有開區間 (a, b)</div>
          <div class="b-note">任何開集都是開區間的聯集。這就是你在微積分裡用的。</div>
        </div>
        <div class="b-card">
          <div class="b-name">R² 的標準拓撲</div>
          <div class="b-basis">B = 所有開圓盤 B(x, ε)</div>
          <div class="b-note">也可以用開矩形 (a₁,b₁) × (a₂,b₂) 做基底——生成相同的拓撲。</div>
        </div>
        <div class="b-card">
          <div class="b-name">離散拓撲</div>
          <div class="b-basis">B = 所有單點集</div>
          <div class="b-note">每個點本身就是開集 → 任何子集 = 單點集的聯集。</div>
        </div>
      </div>

      <div class="subbasis">
        <strong>子基底</strong>（subbasis）更懶——S 是子基底如果 S 的有限交集構成基底。
        例：R 上 (−∞, a) 和 (b, ∞) 形式的集合構成標準拓撲的子基底。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        基底讓我們可以用「少量的生成元」描述拓撲，
        就像群的生成元或向量空間的基底。下一節看度量拓撲。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .basis-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
    .b-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .b-name { font-size: 13px; font-weight: 700; color: var(--accent); }
    .b-basis { font-size: 13px; font-weight: 600; color: var(--text); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .b-note { font-size: 11px; color: var(--text-muted); }
    .subbasis { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted); line-height: 1.7; }
    .subbasis strong { color: var(--accent); }
  `,
})
export class StepTopoBasisComponent {}
