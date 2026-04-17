import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-schwartz-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Schwartz 空間與 tempered distributions" subtitle="§18.6">
      <p>
        D（緊支撐 C∞）太小——不包含 e^(−x²)。放寬為 <strong>Schwartz 空間 S</strong>：
      </p>
      <p class="formula">S = 所有 C∞ 且「快速衰減」的函數</p>
      <p>
        「快速衰減」：f 和所有導數比任何多項式衰減都快。
        e^(−x²) ∈ S，但 e^x ∉ S。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="比較三種函數空間">
      <div class="space-tower">
        <div class="space-card" style="--sc: #8a6aaa">
          <div class="sc-name">D = C₀∞</div>
          <div class="sc-desc">緊支撐 + C∞</div>
          <div class="sc-ex">✓ bump function &nbsp; ✗ e^(−x²)</div>
          <div class="sc-note">最小，但測試函數太少</div>
        </div>
        <div class="arrow">⊂</div>
        <div class="space-card" style="--sc: #5a7faa">
          <div class="sc-name">S (Schwartz)</div>
          <div class="sc-desc">快速衰減 + C∞</div>
          <div class="sc-ex">✓ e^(−x²) &nbsp; ✓ x^n e^(−x²) &nbsp; ✗ 1/(1+x²)</div>
          <div class="sc-note">Fourier 變換的天然棲息地：F(S) = S</div>
        </div>
        <div class="arrow">⊂</div>
        <div class="space-card" style="--sc: #5a8a5a">
          <div class="sc-name">L² (Hilbert)</div>
          <div class="sc-desc">平方可積</div>
          <div class="sc-ex">✓ 1/(1+x²) &nbsp; ✗ 1/√x (在 0 附近)</div>
          <div class="sc-note">完備的，但不是所有 L² 函數都能微分</div>
        </div>
      </div>

      <div class="dual-tower">
        <div class="dt-label">對偶空間（分佈）</div>
        <div class="dt-row">
          <span class="dt-name">D' (所有分佈)</span>
          <span class="dt-arrow">⊃</span>
          <span class="dt-name">S' (tempered)</span>
          <span class="dt-arrow">⊃</span>
          <span class="dt-name">L²</span>
        </div>
        <div class="dt-note">函數空間越小 → 對偶（分佈）越大。S' 裡可以做 Fourier 變換。</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        <strong>Tempered distributions</strong>（S'）是最常用的分佈空間——
        因為 Schwartz 空間在 Fourier 變換下封閉（F(S) = S），
        所以 S' 裡的分佈都能做 Fourier 變換。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .space-tower { display: flex; flex-direction: column; gap: 0; margin-bottom: 14px; }
    .space-card { padding: 12px; border-radius: 8px; border: 2px solid var(--sc); background: color-mix(in srgb, var(--sc) 6%, transparent); }
    .sc-name { font-size: 15px; font-weight: 700; color: var(--sc); font-family: 'JetBrains Mono', monospace; }
    .sc-desc { font-size: 12px; color: var(--text-muted); }
    .sc-ex { font-size: 11px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .sc-note { font-size: 11px; color: var(--text-muted); font-style: italic; }
    .arrow { text-align: center; font-size: 16px; color: var(--accent); font-weight: 700; padding: 2px 0; }
    .dual-tower { padding: 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border); }
    .dt-label { font-size: 12px; font-weight: 600; color: var(--accent); margin-bottom: 6px; }
    .dt-row { display: flex; align-items: center; justify-content: center; gap: 8px;
      font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: var(--text); flex-wrap: wrap; }
    .dt-arrow { color: var(--accent); }
    .dt-note { font-size: 11px; color: var(--text-muted); margin-top: 6px; text-align: center; }
  `,
})
export class StepSchwartzSpaceComponent {}
