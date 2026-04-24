import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-stats-ch2-crlb',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Fisher 資訊與 Cramér–Rao 下界" subtitle="§2.4">
      <p>
        「最低能降到多少」有沒有理論下限？Cramér–Rao 定理給了答案：
        <strong>任何無偏估計量的變異，不可能低於 1/I(θ)</strong>。
      </p>

      <h4>Fisher 資訊 (Fisher Information)</h4>
      <div class="centered-eq big">
        I(θ) = E[(∂ log f(X;θ) / ∂θ)²] = −E[∂² log f(X;θ) / ∂θ²]
      </div>
      <p>
        直覺：log-likelihood 在 θ 附近的「曲率」。
        曲率大 → 資料對 θ 高度敏感 → 估計容易精確 → 資訊量大。<br>
        曲率小 → 資料對 θ 不敏感 → 估計很糊 → 資訊量少。
      </p>

      <h4>Cramér–Rao 下界 (CRLB)</h4>
      <div class="centered-eq big">
        Var(θ̂) ≥ 1 / (n · I(θ))
      </div>
      <p>
        對 n 個獨立觀察，資訊會累加；變異下界隨 n 減為 1/n。
        達到等號的無偏估計量稱為 <strong>有效 (efficient)</strong>。
      </p>

      <div class="key-idea">
        <strong>MLE 的漸近有效性：</strong>
        在標準條件下，MLE 的漸近變異恰為 1/(n·I(θ))——也就是說
        <em>大樣本時，MLE 的精度達到宇宙上限</em>。這是 MLE 被譽為「黃金標準」的理論基礎。
      </div>
    </app-prose-block>

    <app-prose-block subtitle="三個範例">
      <h4>伯努利 Bernoulli(p)</h4>
      <p>
        I(p) = 1/(p(1−p))，CRLB = p(1−p)/n<br>
        樣本比例 p̂ = k/n 的變異 = p(1−p)/n — 正好達到下界 <strong>✓</strong>
      </p>

      <h4>常態 N(μ, σ²)，σ 已知</h4>
      <p>
        I(μ) = 1/σ²，CRLB = σ²/n<br>
        X̄ 的變異 = σ²/n — 達標 <strong>✓</strong>
      </p>

      <h4>Poisson(λ)</h4>
      <p>
        I(λ) = 1/λ，CRLB = λ/n<br>
        λ̂ = X̄ 的變異 = λ/n — 達標 <strong>✓</strong>
      </p>

      <p>
        三個常見分佈的 MLE 都達標。這不是巧合——它們都是指數族（exponential family），
        而指數族的 MLE 通常就是有效的。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="視覺化：log-likelihood 曲率 = Fisher 資訊；曲率大，估計才精">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">真實 p</span>
          <input type="range" min="0.05" max="0.95" step="0.01" [value]="p()"
            (input)="p.set(+$any($event).target.value)" />
          <span class="sl-val">{{ p().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">樣本 n</span>
          <input type="range" min="5" max="200" step="5" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
      </div>

      <svg viewBox="-10 -100 420 130" class="p-svg">
        <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
        @for (i of ticks; track i) {
          <line [attr.x1]="i * 40" y1="-2" [attr.x2]="i * 40" y2="2" stroke="var(--border-strong)" stroke-width="0.6" />
          <text [attr.x]="i * 40" y="14" class="tk" text-anchor="middle">{{ (i / 10).toFixed(1) }}</text>
        }
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2" />
        <line [attr.x1]="p() * 400" y1="-90" [attr.x2]="p() * 400" y2="5"
              stroke="#5ca878" stroke-width="2" stroke-dasharray="3 2" />
        <text [attr.x]="p() * 400" y="-93" class="tk grn" text-anchor="middle">真 p</text>
      </svg>

      <div class="stats">
        <div class="st">
          <div class="st-l">I(p)</div>
          <div class="st-v">{{ fisherInfo().toFixed(2) }}</div>
          <div class="st-d">= 1/(p(1−p))</div>
        </div>
        <div class="st">
          <div class="st-l">CRLB = 1/(nI)</div>
          <div class="st-v">{{ crlb().toFixed(5) }}</div>
          <div class="st-d">變異下界</div>
        </div>
        <div class="st">
          <div class="st-l">SE 下界 = √CRLB</div>
          <div class="st-v">{{ seMin().toFixed(4) }}</div>
          <div class="st-d">標準誤差下界</div>
        </div>
      </div>

      <p class="note">
        p 靠近 0 或 1 時 I(p) 很大（曲率陡），估計容易精準；p = 0.5 時資訊最少，估計最難。
        這解釋了為何民調緊繃選情（p ≈ 0.5）需要更大樣本才能分高下。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        Fisher 資訊量化「資料對 θ 有多敏感」。CRLB 給出變異下界，
        是整個估計理論的天花板。MLE 在大樣本時能觸碰這個天花板——這就是最漂亮的結果之一。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st-d { font-size: 9px; color: var(--text-muted); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh2CrlbComponent {
  readonly ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly p = signal(0.3);
  readonly n = signal(40);

  readonly fisherInfo = computed(() => 1 / (this.p() * (1 - this.p())));
  readonly crlb = computed(() => 1 / (this.n() * this.fisherInfo()));
  readonly seMin = computed(() => Math.sqrt(this.crlb()));

  curvePath(): string {
    // Show Fisher info = 1/(q(1-q)) as a curve — shows where info peaks
    const pts: string[] = [];
    const N = 200;
    const fAt = (q: number) => 1 / (q * (1 - q));
    // Normalize: cap large values, plot 1/I inverted if helpful
    const ys: number[] = [];
    for (let i = 1; i < N; i++) {
      const q = i / N;
      ys.push(fAt(q));
    }
    const peak = Math.max(...ys);
    const min = Math.min(...ys);
    for (let i = 1; i < N; i++) {
      const q = i / N;
      const y = fAt(q);
      const norm = (y - min) / (peak - min);
      const px = q * 400;
      const py = -norm * 85;
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
