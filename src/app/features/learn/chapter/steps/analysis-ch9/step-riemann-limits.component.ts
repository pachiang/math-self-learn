import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-riemann-limits',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Riemann 積分的局限" subtitle="§9.1">
      <p>
        Riemann 積分很好用，但有兩個根本性的缺陷：
      </p>
      <ol>
        <li><strong>太多函數不可積</strong>：Dirichlet 函數（Ch6 見過）——有理數上 = 1，
            無理數上 = 0。處處間斷 → Riemann 不可積。但「直覺上」它的積分應該 = 0
            （因為有理數「佔的空間」是零）。</li>
        <li><strong>極限交換太受限</strong>：逐點收斂的函數列，
            lim ∫fₙ ≠ ∫ lim fₙ 除非有均勻收斂。
            Lebesgue 積分用更弱的條件（DCT）就能交換。</li>
      </ol>
    </app-prose-block>

    <app-challenge-card prompt="Riemann vs Lebesgue 的切法比較">
      <div class="compare">
        <div class="cmp-card">
          <div class="cc-title riemann">Riemann 的切法：垂直切</div>
          <svg viewBox="0 0 200 120" class="cmp-svg">
            <!-- Vertical slices -->
            @for (i of slices; track i) {
              <rect [attr.x]="20 + i * 16" y="20" width="14" [attr.height]="60 + Math.sin(i) * 20"
                    fill="var(--accent)" fill-opacity="0.15" stroke="var(--accent)" stroke-width="0.5" />
            }
            <text x="100" y="110" class="label">把 x 軸切成小段</text>
          </svg>
          <div class="cc-desc">
            問：x 在 [xᵢ, xᵢ₊₁] 時，f(x) 大概多大？<br />
            缺點：如果 f 在每段裡劇烈振盪（如 Dirichlet），無法定義。
          </div>
        </div>

        <div class="cmp-card">
          <div class="cc-title lebesgue">Lebesgue 的切法：水平切</div>
          <svg viewBox="0 0 200 120" class="cmp-svg">
            <!-- Horizontal slices -->
            @for (i of hSlices; track i) {
              <rect x="20" [attr.y]="20 + i * 12" width="160" height="10"
                    [attr.fill]="hColors[i % hColors.length]" fill-opacity="0.12"
                    stroke="var(--border)" stroke-width="0.3" />
            }
            <text x="100" y="110" class="label">把 y 軸切成小段</text>
          </svg>
          <div class="cc-desc">
            問：f(x) 在 [yᵢ, yᵢ₊₁] 的那些 x 有「多大」？<br />
            優點：只要能量「多大」（<strong>測度</strong>），就能積分。
          </div>
        </div>
      </div>

      <div class="insight">
        Lebesgue 的關鍵轉換：不問「每一小段 x 上 f 多大」，
        而問「<strong>f 取到某個值的 x 集合有多大</strong>」。
        這需要一個精確的「集合大小」概念——<strong>測度</strong>。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節定義這個「集合的大小」——<strong>外測度</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    @media (max-width: 600px) { .compare { grid-template-columns: 1fr; } }
    .cmp-card { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .cc-title { padding: 8px 12px; font-size: 13px; font-weight: 700; text-align: center;
      &.riemann { background: rgba(200,152,59,0.08); color: #c8983b; }
      &.lebesgue { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
    .cmp-svg { width: 100%; display: block; background: var(--bg); }
    .label { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .cc-desc { padding: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--accent); } }
    .insight { padding: 14px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--accent-10); border-radius: 10px; border: 2px solid var(--accent);
      strong { color: var(--accent); } }
  `,
})
export class StepRiemannLimitsComponent {
  readonly Math = Math;
  readonly slices = Array.from({ length: 10 }, (_, i) => i);
  readonly hSlices = Array.from({ length: 8 }, (_, i) => i);
  readonly hColors = ['#5a7faa', '#5a8a5a', '#c8983b', '#aa5a6a', '#8a6aaa'];
}
