import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function normalPDF(x: number, mu: number, sigma: number): number {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

@Component({
  selector: 'app-prob-ch4-normal',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Normal 分佈：萬能的鐘形" subtitle="§4.3">
      <div class="centered-eq big">
        f(x) = (1/σ√(2π)) · exp(−(x−μ)²/(2σ²))
      </div>
      <ul class="props">
        <li>E[X] = μ（位置參數）</li>
        <li>Var(X) = σ²（形狀參數）</li>
        <li>對稱、無窮可微、分析性好——整個數學都愛它</li>
      </ul>

      <h4>為什麼 Normal 到處都是？</h4>
      <p class="key-idea">
        <strong>中央極限定理 (CLT)：</strong>
        大量獨立隨機變數的和（不管它們原本是什麼分佈），
        在適當歸一化後會趨向 Normal。
        這個「普遍性」就是為什麼身高、測量誤差、股票日報酬、考試分數通通接近 Normal——
        它們都是許多微小因素的累積。
        （Ch6 完整講解 CLT。）
      </p>

      <h4>68-95-99.7 法則</h4>
      <div class="rule">
        <div class="r-item">
          <div class="r-box" style="background: rgba(92, 168, 120, 0.3);"></div>
          <div class="r-text">
            <div class="r-range">μ ± 1σ</div>
            <div class="r-pct">68.27%</div>
          </div>
        </div>
        <div class="r-item">
          <div class="r-box" style="background: rgba(244, 200, 102, 0.3);"></div>
          <div class="r-text">
            <div class="r-range">μ ± 2σ</div>
            <div class="r-pct">95.45%</div>
          </div>
        </div>
        <div class="r-item">
          <div class="r-box" style="background: rgba(200, 123, 94, 0.3);"></div>
          <div class="r-text">
            <div class="r-range">μ ± 3σ</div>
            <div class="r-pct">99.73%</div>
          </div>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="互動：調 μ 和 σ，看鐘形怎麼變">
      <div class="plot">
        <svg viewBox="-210 -100 420 170" class="plot-svg">
          <line x1="-200" y1="0" x2="200" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-95" x2="0" y2="40" stroke="var(--border-strong)" stroke-width="1" />

          <!-- 1-sigma band -->
          <rect [attr.x]="(mu() - sigma()) * 30" y="-95" [attr.width]="2 * sigma() * 30" height="95"
            fill="rgba(92, 168, 120, 0.18)" />
          <!-- 2-sigma band (outer) -->
          <rect [attr.x]="(mu() - 2*sigma()) * 30" y="-95" [attr.width]="sigma() * 30" height="95"
            fill="rgba(244, 200, 102, 0.15)" />
          <rect [attr.x]="(mu() + sigma()) * 30" y="-95" [attr.width]="sigma() * 30" height="95"
            fill="rgba(244, 200, 102, 0.15)" />

          <!-- Current pdf -->
          <path [attr.d]="pdfPath()" fill="rgba(200, 123, 94, 0.1)" />
          <path [attr.d]="pdfPath()" fill="none" stroke="var(--accent)" stroke-width="2" />

          <!-- Standard reference -->
          @if (showStd()) {
            <path [attr.d]="standardPath()" fill="none" stroke="var(--text-muted)" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.6" />
          }

          <!-- Mean marker -->
          <line [attr.x1]="mu() * 30" y1="-95" [attr.x2]="mu() * 30" y2="0"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" />

          @for (i of [-6,-4,-2,2,4,6]; track i) {
            <line [attr.x1]="i * 30" y1="-3" [attr.x2]="i * 30" y2="3" stroke="var(--border-strong)" />
            <text [attr.x]="i * 30" y="14" class="tk" text-anchor="middle">{{ i }}</text>
          }
        </svg>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">μ</span>
          <input type="range" min="-5" max="5" step="0.1" [value]="mu()"
            (input)="mu.set(+$any($event).target.value)" />
          <span class="sl-val">{{ mu().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">σ</span>
          <input type="range" min="0.3" max="3" step="0.05" [value]="sigma()"
            (input)="sigma.set(+$any($event).target.value)" />
          <span class="sl-val">{{ sigma().toFixed(2) }}</span>
        </div>
        <label class="chk">
          <input type="checkbox" [checked]="showStd()" (change)="showStd.set($any($event).target.checked)" />
          顯示標準常態 N(0, 1) 當參考
        </label>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>Z-score 標準化</h4>
      <div class="centered-eq">
        Z = (X − μ) / σ
      </div>
      <p>
        任何 Normal 都能變成<strong>標準常態</strong> N(0, 1)。
        查 Z 表就能算任意 Normal 的機率——這是統計教科書「Z 表」的由來。
      </p>

      <h4>Normal 的強大性質</h4>
      <div class="props-grid">
        <div class="pr">
          <div class="pr-name">線性組合仍是 Normal</div>
          <p>若 X ~ N(μ₁,σ₁²) 與 Y ~ N(μ₂,σ₂²) 獨立，則 aX + bY ~ N(aμ₁+bμ₂, a²σ₁²+b²σ₂²)。</p>
        </div>
        <div class="pr">
          <div class="pr-name">CLT 的極限分佈</div>
          <p>n 個 iid RV 的和 ≈ Normal（樣本越大越準）。</p>
        </div>
        <div class="pr">
          <div class="pr-name">最大熵</div>
          <p>給定均值與變異數，熵最大的連續分佈是 Normal。</p>
        </div>
        <div class="pr">
          <div class="pr-name">自共軛</div>
          <p>Bayes 推論中，Normal 先驗 + Normal 似然 → Normal 後驗。計算超方便。</p>
        </div>
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        Normal = 統計學的主角，因為 CLT 讓它無處不在。
        μ 決定位置、σ 決定寬度，就這兩個數決定一切。
        下一節看 Gamma 及其他偏斜分佈。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .props { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); }

    .rule { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin: 10px 0; }
    .r-item { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); display: flex; align-items: center; gap: 10px; }
    .r-box { width: 30px; height: 20px; border-radius: 4px; }
    .r-range { font-size: 14px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .r-pct { font-size: 13px; color: var(--text-secondary); }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 14px; color: var(--accent); font-weight: 700; min-width: 24px; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .chk { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); margin-top: 6px; cursor: pointer; }

    .props-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
    .pr { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pr-name { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; }
    .pr p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh4NormalComponent {
  readonly mu = signal(0);
  readonly sigma = signal(1);
  readonly showStd = signal(false);

  pdfPath(): string {
    const mu = this.mu();
    const sigma = this.sigma();
    const pts: string[] = [];
    const N = 200;
    const SCALE_X = 30;
    const SCALE_Y = 180;
    for (let i = 0; i <= N; i++) {
      const x = -7 + (14 * i) / N;
      const y = normalPDF(x, mu, sigma);
      const px = x * SCALE_X;
      const py = -y * SCALE_Y;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  standardPath(): string {
    const pts: string[] = [];
    const N = 200;
    const SCALE_X = 30;
    const SCALE_Y = 180;
    for (let i = 0; i <= N; i++) {
      const x = -7 + (14 * i) / N;
      const y = normalPDF(x, 0, 1);
      const px = x * SCALE_X;
      const py = -y * SCALE_Y;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
