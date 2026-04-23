import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch5-inequalities',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Markov & Chebyshev 不等式" subtitle="§5.3">
      <p>
        我們常想問：「X 偏離平均很遠的機率是多少？」
        就算不知道分佈，只用期望值與變異數就能<strong>上界</strong>這個機率。
      </p>

      <h4>Markov 不等式</h4>
      <div class="centered-eq big">
        P(X ≥ a) ≤ E[X] / a, &nbsp;&nbsp; X ≥ 0, a &gt; 0
      </div>
      <p>
        只需 X 非負、知道平均。
        「若平均年薪 100 萬，則 1000 萬以上的最多 10%」——因為不可能大家都年薪 1000 萬。
      </p>

      <h4>Chebyshev 不等式</h4>
      <div class="centered-eq big">
        P(|X − μ| ≥ k·σ) ≤ 1 / k²
      </div>
      <p>
        對<strong>任何</strong>有變異數的分佈：
      </p>
      <ul class="cheby">
        <li>距中心 2σ 以外至多 25%</li>
        <li>距中心 3σ 以外至多 11.1%</li>
        <li>距中心 10σ 以外至多 1%</li>
      </ul>
      <p class="key-idea">
        <strong>Chebyshev 很寬鬆但普遍適用</strong>。對 Normal 分佈，3σ 以外實際只有 0.27%，
        遠好於 Chebyshev 的上界 11.1%——但 Chebyshev 不需要你知道分佈。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="互動：比較 Markov / Chebyshev 界線與真實機率（Exp 分佈）">
      <div class="plot">
        <div class="p-title">Exp(1) 的 P(X ≥ a) 與不等式上界</div>
        <svg viewBox="-10 -100 420 140" class="p-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-95" x2="0" y2="20" stroke="var(--border-strong)" stroke-width="1" />

          <!-- True tail -->
          <path [attr.d]="truePath()" fill="none" stroke="var(--accent)" stroke-width="2" />
          <!-- Markov bound -->
          <path [attr.d]="markovPath()" fill="none" stroke="#5a8aa8" stroke-width="1.6" stroke-dasharray="4 3" />
          <!-- Chebyshev bound -->
          <path [attr.d]="chebyPath()" fill="none" stroke="#ba8d2a" stroke-width="1.6" stroke-dasharray="3 4" />

          <!-- a marker -->
          <line [attr.x1]="a() * 40" y1="-95" [attr.x2]="a() * 40" y2="10" stroke="var(--accent)" stroke-width="1" stroke-dasharray="2 2" />
          <text [attr.x]="a() * 40" y="14" class="tk mean" text-anchor="middle">a={{ a().toFixed(1) }}</text>
        </svg>
        <div class="legend">
          <span class="leg"><span class="sw acc"></span>真實 P(X ≥ a) = e^(-a)</span>
          <span class="leg"><span class="sw bl"></span>Markov 1/a</span>
          <span class="leg"><span class="sw org"></span>Chebyshev 1/(a-1)²</span>
        </div>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">a</span>
          <input type="range" min="0.5" max="9" step="0.05" [value]="a()"
            (input)="a.set(+$any($event).target.value)" />
          <span class="sl-val">{{ a().toFixed(2) }}</span>
        </div>
      </div>

      <div class="bounds">
        <div class="bd">
          <div class="bd-lab">真實 P(X ≥ {{ a().toFixed(2) }})</div>
          <div class="bd-val acc">{{ trueTail().toFixed(4) }}</div>
        </div>
        <div class="bd">
          <div class="bd-lab">Markov 上界 1/a</div>
          <div class="bd-val bl">{{ markovBound().toFixed(4) }}</div>
        </div>
        <div class="bd">
          <div class="bd-lab">Chebyshev 上界</div>
          <div class="bd-val org">{{ chebyBound().toFixed(4) }}</div>
        </div>
      </div>

      <p class="note">
        兩個不等式都高估了真實機率——但這是特性而非缺陷。
        它們適用於<strong>任何分佈</strong>，不需要具體形狀——
        這讓它們成為「壞情況保證」工具。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>為什麼 Chebyshev 這麼重要？</h4>
      <p>
        Chebyshev 是證明<strong>大數法則</strong>的關鍵一步。
        若 <code>X̄ₙ = (X₁ + ⋯ + Xₙ)/n</code> 是樣本均值：
      </p>
      <ul class="pre-lln">
        <li>E[X̄ₙ] = μ（跟原分佈一樣）</li>
        <li>Var(X̄ₙ) = σ²/n （除以 n，隨 n 變大）</li>
      </ul>
      <p>
        用 Chebyshev：
      </p>
      <div class="centered-eq">
        P(|X̄ₙ − μ| ≥ ε) ≤ σ² / (nε²) → 0 (當 n → ∞)
      </div>
      <p class="key-idea">
        <strong>樣本均值會收斂到真正期望值。</strong>
        這就是大數法則（LLN）的弱版——<strong>下一章 Ch6 正式登場</strong>。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Markov 和 Chebyshev 是機率論最常用的「尾部上界」工具。
        Chebyshev + Var(X̄) ∝ 1/n = LLN 的證明骨架。
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
    .cheby, .pre-lln { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.mean { fill: var(--accent); }

    .legend { display: flex; gap: 12px; justify-content: center; margin-top: 4px; font-size: 11px; color: var(--text-muted); flex-wrap: wrap; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.acc { background: var(--accent); }
    .sw.bl { background: #5a8aa8; }
    .sw.org { background: #ba8d2a; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 14px; color: var(--accent); font-weight: 700; min-width: 24px; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .bounds { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
    .bd { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .bd-lab { font-size: 10px; color: var(--text-muted); }
    .bd-val { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .bd-val.acc { color: var(--accent); }
    .bd-val.bl { color: #5a8aa8; }
    .bd-val.org { color: #ba8d2a; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .note strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh5InequalitiesComponent {
  readonly a = signal(2);

  // Exp(1): mean 1, var 1
  readonly trueTail = computed(() => Math.exp(-this.a()));
  readonly markovBound = computed(() => Math.min(1, 1 / this.a()));
  readonly chebyBound = computed(() => {
    const a = this.a();
    if (a <= 1) return 1;
    // P(|X - 1| >= a - 1) <= 1 / (a-1)^2
    return Math.min(1, 1 / Math.pow(a - 1, 2));
  });

  truePath(): string {
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (10 * i) / N;
      const y = Math.exp(-x);
      const px = x * 40;
      const py = -y * 85;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  markovPath(): string {
    const pts: string[] = [];
    const N = 200;
    for (let i = 1; i <= N; i++) {
      const x = (10 * i) / N;
      const y = Math.min(1, 1 / x);
      const px = x * 40;
      const py = -y * 85;
      pts.push(`${i === 1 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  chebyPath(): string {
    const pts: string[] = [];
    const N = 200;
    for (let i = 1; i <= N; i++) {
      const x = (10 * i) / N;
      if (x <= 1) continue;
      const y = Math.min(1, 1 / Math.pow(x - 1, 2));
      const px = x * 40;
      const py = -y * 85;
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
