import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-stats-ch2-mle',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="最大概似估計 MLE" subtitle="§2.2">
      <p>
        直覺：資料已經發生了。什麼樣的 θ <strong>最讓這組資料看起來合理</strong>？
        那個 θ 就是 MLE。
      </p>

      <h4>概似函數 (Likelihood)</h4>
      <div class="centered-eq big">
        L(θ; X₁, …, Xₙ) = ∏ f(Xᵢ; θ)
      </div>
      <p>
        — 注意：L 是 <strong>θ</strong> 的函數（資料固定），而 PDF 是 <strong>X</strong> 的函數（θ 固定）。
        同一個式子，兩種視角。
      </p>

      <p>
        取對數通常更好處理（連乘變連加、指數族變線性）：
      </p>
      <div class="centered-eq big">
        ℓ(θ) = log L(θ) = Σ log f(Xᵢ; θ)
      </div>

      <p>
        MLE：<code>θ̂ = argmax_θ ℓ(θ)</code>。解法通常對 θ 求導設為 0。
      </p>

      <h4>兩個經典例子</h4>
      <div class="examples">
        <div class="ex">
          <div class="ex-head">伯努利 Bernoulli(p)</div>
          <div class="ex-body">
            資料：k 次成功、n − k 次失敗。<br>
            L(p) = p^k (1−p)^(n−k) → p̂ = <strong>k / n</strong>
            <div class="ex-note">樣本比例就是 MLE</div>
          </div>
        </div>
        <div class="ex">
          <div class="ex-head">常態 N(μ, σ²)</div>
          <div class="ex-body">
            同時對 μ, σ² 求導：<br>
            μ̂ = X̄；&nbsp; σ̂² = Σ(Xᵢ − X̄)² / <strong>n</strong>
            <div class="ex-note">σ̂² 是<strong>有偏</strong>的（記得 Bessel）</div>
          </div>
        </div>
      </div>

      <div class="key-idea">
        <strong>MLE 的漸近性質：</strong>
        在「標準條件」下，當 n 大：
        <ul>
          <li>漸近無偏：E[θ̂] → θ</li>
          <li>漸近常態：√n (θ̂ − θ) →ᵈ N(0, I(θ)⁻¹)</li>
          <li>漸近有效：變異達到 Cramér–Rao 下界（§2.4 會講）</li>
        </ul>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="拖動 p，看 n 次投擲（k 正面）時的概似函數在哪裡最大">
      <div class="data-row">
        觀察到 <strong>{{ k() }} 正 / {{ n() }} 投</strong>
        &nbsp;&nbsp; 樣本比例 p̂ = {{ (k() / n()).toFixed(3) }}
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">n</span>
          <input type="range" min="5" max="200" step="1" [value]="n()"
            (input)="setN(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">k</span>
          <input type="range" min="0" [attr.max]="n()" step="1" [value]="k()"
            (input)="k.set(+$any($event).target.value)" />
          <span class="sl-val">{{ k() }}</span>
        </div>
      </div>

      <div class="p">
        <div class="p-title">log-likelihood ℓ(p) vs p</div>
        <svg viewBox="-10 -100 420 130" class="p-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          @for (i of ticks; track i) {
            <line [attr.x1]="i * 40" y1="-2" [attr.x2]="i * 40" y2="2" stroke="var(--border-strong)" stroke-width="0.6" />
            <text [attr.x]="i * 40" y="14" class="tk" text-anchor="middle">{{ (i / 10).toFixed(1) }}</text>
          }
          <path [attr.d]="loglikPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
          <line [attr.x1]="(k() / n()) * 400" y1="-95" [attr.x2]="(k() / n()) * 400" y2="5"
                stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 2" />
          <text [attr.x]="(k() / n()) * 400" y="-98" class="tk acc" text-anchor="middle">p̂ = k/n</text>
          <line [attr.x1]="guess() * 400" y1="-70" [attr.x2]="guess() * 400" y2="5"
                stroke="#ba8d2a" stroke-width="2" />
          <text [attr.x]="guess() * 400" y="-73" class="tk org" text-anchor="middle">你的 p</text>
        </svg>
      </div>

      <div class="guess-ctrl">
        <div class="sl">
          <span class="sl-lab">移動 p</span>
          <input type="range" min="0.01" max="0.99" step="0.01" [value]="guess()"
            (input)="guess.set(+$any($event).target.value)" />
          <span class="sl-val">{{ guess().toFixed(2) }}</span>
        </div>
      </div>

      <div class="stats">
        <div class="st">
          <div class="st-l">ℓ(你的 p)</div>
          <div class="st-v">{{ loglikAt(guess()).toFixed(2) }}</div>
        </div>
        <div class="st">
          <div class="st-l">ℓ(p̂) 最大</div>
          <div class="st-v">{{ loglikAt(k() / n()).toFixed(2) }}</div>
        </div>
        <div class="st">
          <div class="st-l">MLE p̂</div>
          <div class="st-v grn">{{ (k() / n()).toFixed(3) }}</div>
        </div>
      </div>

      <p class="note">
        ℓ(p) 是凹函數，頂點正好在 p = k/n。
        移開一點，log-likelihood 就掉——資料「不太像」是從那個 p 產生的。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        MLE 把估計問題化為最佳化：「找讓資料最可能的 θ」。
        簡單又強大，幾乎所有現代統計 & 機器學習模型的訓練都是 MLE（含變形）的具體實例。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 13px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea ul { margin: 6px 0 0 20px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .examples { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
    .ex { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .ex-head { font-size: 12px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .ex-body { font-size: 12px; line-height: 1.6; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .ex-note { font-size: 10px; color: var(--text-muted); margin-top: 4px; font-family: system-ui, sans-serif; }

    .data-row { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px;
      font-size: 13px; text-align: center; margin-bottom: 10px; font-family: 'JetBrains Mono', monospace; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .guess-ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 10px; margin: 10px 0; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 50px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 30px; text-align: right; }

    .p { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.acc { fill: var(--accent); font-weight: 700; }
    .tk.org { fill: #ba8d2a; font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st-v.grn { color: #5ca878; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh2MleComponent {
  readonly ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly n = signal(40);
  readonly k = signal(14);
  readonly guess = signal(0.5);

  setN(newN: number) {
    this.n.set(newN);
    if (this.k() > newN) this.k.set(newN);
  }

  loglikAt(p: number): number {
    const n = this.n(), k = this.k();
    if (p <= 0 || p >= 1) return -Infinity;
    return k * Math.log(p) + (n - k) * Math.log(1 - p);
  }

  loglikPath(): string {
    const pts: string[] = [];
    const N = 200;
    const n = this.n(), k = this.k();
    const pMin = 0.005, pMax = 0.995;
    // normalize so peak (at k/n) maps to top of plot
    const pHat = Math.max(pMin, Math.min(pMax, k / n));
    const peak = this.loglikAt(pHat);
    const low = Math.min(this.loglikAt(pMin), this.loglikAt(pMax));
    const range = peak - low;
    for (let i = 0; i <= N; i++) {
      const p = pMin + ((pMax - pMin) * i) / N;
      const y = this.loglikAt(p);
      const norm = range > 0 ? (y - low) / range : 0;
      const px = p * 400;
      const py = -norm * 85;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
