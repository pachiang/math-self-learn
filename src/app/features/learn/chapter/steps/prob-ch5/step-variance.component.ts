import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch5-variance',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="變異數：散佈程度" subtitle="§5.2">
      <p>
        E[X] 告訴你「中心」，但不告訴你「跟中心差多遠」。變異數填補這個：
      </p>
      <div class="centered-eq big">
        Var(X) = E[(X − μ)²] = E[X²] − (E[X])²
      </div>
      <p>
        第二個等式是 <strong>計算捷徑</strong>：用 LOTUS 算 E[X²]，減去 μ²。
      </p>
      <ul class="props">
        <li><strong>Var(X) ≥ 0</strong>，= 0 當且僅當 X 為常數</li>
        <li><strong>Var(aX + b) = a²·Var(X)</strong>（加常數不變、乘常數平方變化）</li>
        <li><strong>標準差</strong> σ = √Var(X) —— 單位與 X 相同</li>
      </ul>

      <h4>獨立時：變異數可加</h4>
      <div class="centered-eq">
        若 X, Y 獨立，則 Var(X + Y) = Var(X) + Var(Y)
      </div>
      <p class="key-idea">
        對比期望值永遠可加，變異數<strong>需要獨立</strong>。
        若不獨立，還要加 2·Cov(X, Y)（協變異數，下一節）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="比較兩個分佈：相同 E[X]，不同 Var(X)">
      <div class="compare-plot">
        <div class="p-title">兩個分佈：都中心在 0，但寬度不同</div>
        <svg viewBox="-210 -100 420 160" class="cp-svg">
          <line x1="-200" y1="0" x2="200" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-95" x2="0" y2="40" stroke="var(--border-strong)" stroke-width="1" />

          <path [attr.d]="tallPath()" fill="rgba(90, 138, 168, 0.2)" />
          <path [attr.d]="tallPath()" fill="none" stroke="#5a8aa8" stroke-width="2" />

          <path [attr.d]="widePath()" fill="rgba(200, 123, 94, 0.2)" />
          <path [attr.d]="widePath()" fill="none" stroke="#c87b5e" stroke-width="2" />

          @for (i of [-4,-3,-2,-1,1,2,3,4]; track i) {
            <line [attr.x1]="i * 30" y1="-3" [attr.x2]="i * 30" y2="3" stroke="var(--border-strong)" />
            <text [attr.x]="i * 30" y="14" class="tk" text-anchor="middle">{{ i }}</text>
          }
        </svg>
      </div>

      <div class="compare-cells">
        <div class="cc bl">
          <div class="cc-title">高窄（低 Var）</div>
          <div class="cc-row">σ = {{ sigmaA().toFixed(2) }}</div>
          <div class="cc-row">Var = {{ (sigmaA() ** 2).toFixed(3) }}</div>
          <div class="cc-desc">絕大多數取值近 0，像精密儀器。</div>
        </div>
        <div class="cc rd">
          <div class="cc-title">矮寬（高 Var）</div>
          <div class="cc-row">σ = {{ sigmaB().toFixed(2) }}</div>
          <div class="cc-row">Var = {{ (sigmaB() ** 2).toFixed(3) }}</div>
          <div class="cc-desc">取值分散，像隨機猜測。</div>
        </div>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">σ (窄)</span>
          <input type="range" min="0.2" max="2.5" step="0.05" [value]="sigmaA()"
            (input)="sigmaA.set(+$any($event).target.value)" />
          <span class="sl-val">{{ sigmaA().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">σ (寬)</span>
          <input type="range" min="0.2" max="2.5" step="0.05" [value]="sigmaB()"
            (input)="sigmaB.set(+$any($event).target.value)" />
          <span class="sl-val">{{ sigmaB().toFixed(2) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>常見分佈的變異數一覽</h4>
      <table class="vt">
        <thead>
          <tr><th>分佈</th><th>E[X]</th><th>Var(X)</th></tr>
        </thead>
        <tbody>
          <tr><td>Bernoulli(p)</td><td>p</td><td>p(1-p)</td></tr>
          <tr><td>Binomial(n, p)</td><td>np</td><td>np(1-p)</td></tr>
          <tr><td>Poisson(λ)</td><td>λ</td><td>λ</td></tr>
          <tr><td>Geometric(p)</td><td>1/p</td><td>(1-p)/p²</td></tr>
          <tr><td>Uniform(a, b)</td><td>(a+b)/2</td><td>(b-a)²/12</td></tr>
          <tr><td>Exp(λ)</td><td>1/λ</td><td>1/λ²</td></tr>
          <tr><td>Normal(μ, σ²)</td><td>μ</td><td>σ²</td></tr>
        </tbody>
      </table>

      <h4>協變異數 Cov(X, Y)</h4>
      <div class="centered-eq">
        Cov(X, Y) = E[(X − μ_X)(Y − μ_Y)] = E[XY] − E[X]·E[Y]
      </div>
      <ul class="cov-props">
        <li><strong>Cov(X, X) = Var(X)</strong></li>
        <li>X, Y 獨立 ⇒ Cov(X, Y) = 0（但反之不成立！）</li>
        <li>Cov 為正 → 同方向變動；負 → 反方向變動</li>
      </ul>

      <h4>相關係數（Correlation）</h4>
      <div class="centered-eq">
        ρ(X, Y) = Cov(X, Y) / (σ_X · σ_Y) ∈ [−1, 1]
      </div>
      <p>
        無單位的 Cov，數值在 [−1, 1]。<code>|ρ| = 1</code> 表示 Y = aX + b（線性相關）。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Var 量化散佈、Cov 量化相關。獨立 → Var 可加，否則要加 Cov。
        下一節連結兩者：樣本平均的變異數如何隨樣本大小縮小——LLN 的前奏。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .props { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .props strong { color: var(--accent); }
    .cov-props { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); }
    .cov-props strong { color: var(--accent); }

    .compare-plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .cp-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .compare-cells { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
    @media (max-width: 640px) { .compare-cells { grid-template-columns: 1fr; } }
    .cc { padding: 10px; border-radius: 10px; }
    .cc.bl { background: rgba(90, 138, 168, 0.1); border: 1px solid #5a8aa8; }
    .cc.rd { background: rgba(200, 123, 94, 0.1); border: 1px solid #c87b5e; }
    .cc-title { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
    .cc.bl .cc-title { color: #5a8aa8; }
    .cc.rd .cc-title { color: #c87b5e; }
    .cc-row { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); padding: 2px 0; }
    .cc-desc { font-size: 12px; color: var(--text-muted); margin-top: 4px; font-style: italic; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; display: grid; gap: 6px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .vt { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .vt th, .vt td { padding: 6px 10px; border: 1px solid var(--border); text-align: left; font-family: 'JetBrains Mono', monospace; }
    .vt th { background: var(--accent-10); color: var(--accent); font-weight: 700; }
    .vt tr:nth-child(even) td { background: var(--bg-surface); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh5VarianceComponent {
  readonly sigmaA = signal(0.6);
  readonly sigmaB = signal(1.8);

  private normal(x: number, sigma: number): number {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-(x * x) / (2 * sigma * sigma));
  }

  tallPath(): string { return this.buildPath(this.sigmaA()); }
  widePath(): string { return this.buildPath(this.sigmaB()); }

  private buildPath(sigma: number): string {
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = -7 + (14 * i) / N;
      const y = this.normal(x, sigma);
      const px = x * 30;
      const py = -y * 180;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    pts.push('L 210 0 L -210 0 Z');
    return pts.join(' ');
  }
}
