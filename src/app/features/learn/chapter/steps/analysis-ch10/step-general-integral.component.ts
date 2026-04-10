import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-general-integral',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="一般可測函數的積分" subtitle="§10.3">
      <p>
        帶符號的函數怎麼辦？拆成正部和負部：
      </p>
      <p class="formula">
        f⁺(x) = max(f(x), 0)，f⁻(x) = max(−f(x), 0)<br />
        f = f⁺ − f⁻，|f| = f⁺ + f⁻
      </p>
      <p>
        f 的 <strong>Lebesgue 積分</strong>定義為：
      </p>
      <p class="formula axiom">
        ∫ f dm = ∫ f⁺ dm − ∫ f⁻ dm<br />
        （前提：至少一個有限）
      </p>
      <p>
        f <strong>Lebesgue 可積</strong>（記 f ∈ L¹）⟺ ∫|f| dm &lt; ∞。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="把函數拆成正部和負部">
      <svg viewBox="0 0 520 220" class="gi-svg">
        <line x1="40" y1="110" x2="500" y2="110" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="210" stroke="var(--border)" stroke-width="0.8" />

        <!-- Positive part (green fill) -->
        <path [attr.d]="posArea" fill="#5a8a5a" fill-opacity="0.15" />
        <!-- Negative part (red fill) -->
        <path [attr.d]="negArea" fill="#aa5a6a" fill-opacity="0.15" />

        <!-- Function curve -->
        <path [attr.d]="curvePath" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Labels -->
        <text x="200" y="60" class="area-label pos">f⁺（正部面積）</text>
        <text x="350" y="170" class="area-label neg">f⁻（負部面積）</text>
      </svg>

      <div class="result-row">
        <div class="r-card pos">∫ f⁺ = 正部面積</div>
        <div class="r-card neg">∫ f⁻ = 負部面積</div>
        <div class="r-card">∫ f = 正 − 負</div>
      </div>

      <div class="l1-note">
        <strong>L¹ 空間</strong> = 所有 ∫|f| &lt; ∞ 的可測函數。
        這是一個<strong>完備的度量空間</strong>（Riesz-Fischer 定理）——
        正是 Riemann 積分做不到的。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看 Lebesgue 積分最重要的收斂定理——<strong>單調收斂定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .gi-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .area-label { font-size: 10px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      &.pos { fill: #5a8a5a; } &.neg { fill: #aa5a6a; } }
    .result-row { display: flex; gap: 8px; margin-bottom: 10px; }
    .r-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.pos { color: #5a8a5a; } &.neg { color: #aa5a6a; } }
    .l1-note { padding: 12px; font-size: 13px; color: var(--text-secondary);
      background: var(--accent-10); border-radius: 8px;
      strong { color: var(--accent); } }
  `,
})
export class StepGeneralIntegralComponent {
  // f(x) = sin(2πx) on [0, 1]
  private f(x: number): number { return Math.sin(2 * Math.PI * x); }
  private fx(x: number): number { return 40 + x * 460; }
  private fy(y: number): number { return 110 - y * 90; }

  readonly curvePath = (() => {
    const pts: string[] = [];
    for (let x = 0; x <= 1; x += 0.005) pts.push(`${this.fx(x)},${this.fy(this.f(x))}`);
    return 'M' + pts.join('L');
  })();

  readonly posArea = (() => {
    let d = `M${this.fx(0)},${this.fy(0)}`;
    for (let x = 0; x <= 0.5; x += 0.005) d += `L${this.fx(x)},${this.fy(Math.max(0, this.f(x)))}`;
    d += `L${this.fx(0.5)},${this.fy(0)}Z`;
    return d;
  })();

  readonly negArea = (() => {
    let d = `M${this.fx(0.5)},${this.fy(0)}`;
    for (let x = 0.5; x <= 1; x += 0.005) d += `L${this.fx(x)},${this.fy(Math.min(0, this.f(x)))}`;
    d += `L${this.fx(1)},${this.fy(0)}Z`;
    return d;
  })();
}
