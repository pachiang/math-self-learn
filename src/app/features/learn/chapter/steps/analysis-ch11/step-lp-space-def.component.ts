import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { lpNorm, sampleFn } from './analysis-ch11-util';

@Component({
  selector: 'app-step-lp-space-def',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼是 Lᵖ 空間" subtitle="§11.1">
      <p>
        <strong>Lᵖ[a,b]</strong> = 所有滿足 ∫|f|ᵖ &lt; ∞ 的可測函數，配上範數：
      </p>
      <p class="formula">||f||ₚ = (∫|f|ᵖ)^(1/p)</p>
      <p>特殊情形：</p>
      <ul>
        <li><strong>L¹</strong>：∫|f| &lt; ∞。「絕對可積」。</li>
        <li><strong>L²</strong>：∫|f|² &lt; ∞。有<strong>內積</strong>的空間。量子力學的舞台。</li>
        <li><strong>L∞</strong>：ess sup |f| &lt; ∞。「本質有界」。</li>
      </ul>
      <p>
        注意：Lᵖ 裡的「函數」其實是<strong>等價類</strong>——幾乎處處相等的函數視為同一個。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="同一個函數在不同 Lᵖ 範數下的「大小」">
      <div class="p-ctrl">
        <span class="pl">p = {{ pDisplay() }}</span>
        <input type="range" min="1" max="20" step="0.5" [value]="p()"
               (input)="p.set(+($any($event.target)).value)" class="p-slider" />
        <div class="presets">
          <button class="pre-btn" (click)="p.set(1)">L¹</button>
          <button class="pre-btn" (click)="p.set(2)">L²</button>
          <button class="pre-btn" (click)="p.set(20)">L∞</button>
        </div>
      </div>

      <svg viewBox="0 0 520 200" class="lp-svg">
        <line x1="40" y1="160" x2="500" y2="160" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="160" stroke="var(--border)" stroke-width="0.8" />

        <!-- |f|^p shaded -->
        <path [attr.d]="poweredArea()" fill="var(--accent)" fill-opacity="0.12" />

        <!-- |f| curve -->
        <path [attr.d]="fPath()" fill="none" stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="4 3" />

        <!-- |f|^p curve -->
        <path [attr.d]="fpPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">||f||₁ = {{ norm1.toFixed(4) }}</div>
        <div class="r-card accent">||f||{{ pDisplay() }} = {{ normP().toFixed(4) }}</div>
        <div class="r-card">||f||∞ = {{ normInf.toFixed(4) }}</div>
      </div>

      <div class="legend">
        <span><span class="dot green"></span>|f(x)| = |sin(πx)|</span>
        <span><span class="dot accent"></span>|f(x)|ᵖ</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        p 越大，範數越側重函數的「峰值」。L∞ 範數 = 最大值。
        L¹ 範數 = 面積。L² 在中間——而且有一個額外的結構：<strong>內積</strong>。
      </p>
      <p>下一節看 Lᵖ 裡最重要的不等式——<strong>Hölder</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .p-ctrl { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
    .pl { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 70px; }
    .p-slider { width: 140px; accent-color: var(--accent); }
    .presets { display: flex; gap: 4px; margin-left: auto; }
    .pre-btn { padding: 3px 8px; border: 1px solid var(--border); border-radius: 4px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); } }
    .lp-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .result-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .r-card { flex: 1; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.accent { color: var(--accent); background: var(--accent-10); } }
    .legend { display: flex; gap: 14px; font-size: 11px; color: var(--text-muted); }
    .dot { display: inline-block; width: 14px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.green { background: #5a8a5a; } &.accent { background: var(--accent); } }
  `,
})
export class StepLpSpaceDefComponent {
  readonly p = signal(2);
  readonly pDisplay = computed(() => this.p() >= 20 ? '∞' : String(this.p()));

  private readonly f = (x: number) => Math.abs(Math.sin(Math.PI * x));
  readonly norm1 = lpNorm(this.f, 1, 0, 1);
  readonly normInf = lpNorm(this.f, 50, 0, 1);
  readonly normP = computed(() => lpNorm(this.f, this.p(), 0, 1));

  fx(x: number): number { return 40 + x * 460; }
  fy(y: number): number { return 160 - y * 140; }

  fPath(): string {
    const pts = sampleFn(this.f, 0, 1, 200);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  fpPath(): string {
    const pp = this.p();
    const pts = sampleFn((x) => Math.pow(this.f(x), pp >= 50 ? 1 : pp), 0, 1, 200);
    return 'M' + pts.filter((p) => p.y < 1.2).map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  poweredArea(): string {
    const pp = this.p();
    const fn = (x: number) => Math.pow(this.f(x), pp >= 50 ? 1 : pp);
    let d = `M${this.fx(0)},${this.fy(0)}`;
    for (let x = 0; x <= 1; x += 0.005) {
      const y = fn(x);
      if (y < 1.2) d += `L${this.fx(x)},${this.fy(y)}`;
    }
    d += `L${this.fx(1)},${this.fy(0)}Z`;
    return d;
  }
}
