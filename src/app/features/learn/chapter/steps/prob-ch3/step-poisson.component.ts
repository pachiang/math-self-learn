import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function poissonPMF(lambda: number, k: number): number {
  if (k < 0) return 0;
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return Math.exp(-lambda) * Math.pow(lambda, k) / fact;
}
function binomialPMF(n: number, p: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let c = 1;
  for (let i = 0; i < Math.min(k, n - k); i++) c = (c * (n - i)) / (i + 1);
  return c * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

@Component({
  selector: 'app-prob-ch3-poisson',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Poisson：罕見事件的王" subtitle="§3.3">
      <p>
        <strong>Poisson(λ)</strong> 描述單位時間 / 空間內某個<strong>罕見事件</strong>發生的次數。
      </p>
      <div class="centered-eq big">
        P(X = k) = e<sup>−λ</sup> · λᵏ / k!
      </div>
      <ul class="props">
        <li>E[X] = λ</li>
        <li>Var(X) = λ (期望 = 變異數——Poisson 的標誌)</li>
      </ul>

      <h4>從哪裡來？Binomial 極限</h4>
      <p>
        考慮把時間切成 n 個極小的小段。
        每小段事件發生機率 p = λ/n（很小）。
        Binomial(n, p) 的事件數，當 n → ∞、p → 0、np = λ 固定，
        PMF 收斂到 Poisson(λ)。
      </p>
      <div class="centered-eq">
        lim<sub>n→∞</sub> C(n, k) (λ/n)ᵏ (1−λ/n)ⁿ⁻ᵏ = e<sup>−λ</sup> λᵏ / k!
      </div>
      <p class="key-idea">
        所以 Poisson 是「很多獨立機會 × 每個機會很小」的極限。
        單位時間內：<strong>客服電話次數、放射性衰變粒子數、高速公路上某段車禍數、門市進客人數、打字錯字數⋯⋯</strong>
      </p>
    </app-prose-block>

    <app-challenge-card prompt="互動：看 Binomial → Poisson 的收斂">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">λ = np</span>
          <input type="range" min="0.5" max="15" step="0.1" [value]="lambda()"
            (input)="lambda.set(+$any($event).target.value)" />
          <span class="sl-val">{{ lambda().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">n (Binomial)</span>
          <input type="range" min="5" max="200" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="derived">
          p = λ/n = <strong>{{ (lambda() / n()).toFixed(4) }}</strong>
        </div>
      </div>

      <div class="pmf-plot">
        <div class="pmf-title">兩個分佈並排：Binomial(n={{ n() }}, p={{ (lambda()/n()).toFixed(3) }}) vs Poisson(λ={{ lambda().toFixed(1) }})</div>
        <svg viewBox="-10 -170 420 210" class="pmf-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-165" x2="0" y2="35" stroke="var(--border-strong)" stroke-width="1" />

          @for (b of bars(); track b.k) {
            <rect [attr.x]="b.x - 8" [attr.y]="-b.binom"
              width="7" [attr.height]="b.binom"
              fill="#5a8aa8" opacity="0.8" />
            <rect [attr.x]="b.x + 1" [attr.y]="-b.pois"
              width="7" [attr.height]="b.pois"
              fill="var(--accent)" opacity="0.8" />
            @if (b.k <= 20 && b.k % (b.k < 10 ? 1 : 2) === 0) {
              <text [attr.x]="b.x" y="14" class="tk" text-anchor="middle">{{ b.k }}</text>
            }
          }
        </svg>
        <div class="legend">
          <span class="leg"><span class="sw bl"></span>Binomial</span>
          <span class="leg"><span class="sw ac"></span>Poisson</span>
        </div>
      </div>

      <div class="dist-info">
        <div class="di">
          <div class="di-lab">Binomial 誤差（L₁）</div>
          <div class="di-val">{{ l1Error().toFixed(5) }}</div>
        </div>
        <div class="di">
          <div class="di-lab">當 n 夠大 p 夠小</div>
          <div class="di-val">誤差 → 0</div>
        </div>
      </div>

      <p class="note">
        拉高 n 到 100+、同時 λ 保持中等——兩個分佈幾乎完全重合。
        小 n 時差距明顯；這就是 Poisson 的<strong>大 n 小 p 極限</strong>。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>Poisson 的特殊性質</h4>
      <div class="props-grid">
        <div class="pr">
          <div class="pr-name">E = Var = λ</div>
          <p>期望值等於變異數——這是 Poisson 的「簽名」。若資料發現 Var ≈ Mean，就可能是 Poisson。</p>
        </div>
        <div class="pr">
          <div class="pr-name">疊加性</div>
          <p>X ~ Poisson(λ₁), Y ~ Poisson(λ₂) 獨立 → X + Y ~ Poisson(λ₁ + λ₂)。兩個「稀有事件過程」的合併仍是稀有。</p>
        </div>
        <div class="pr">
          <div class="pr-name">分裂</div>
          <p>Poisson(λ) 中每個事件以機率 p 歸 A 類、(1−p) 歸 B 類 → A ~ Poisson(λp)、B ~ Poisson(λ(1−p))，<strong>互相獨立</strong>。</p>
        </div>
        <div class="pr">
          <div class="pr-name">時間間隔是 Exponential</div>
          <p>Poisson 事件發生的時間間隔服從指數分佈 Exp(λ)。這是下一章連續分佈的主角。</p>
        </div>
      </div>

      <h4>現實生活中的 Poisson 案例</h4>
      <ul class="ex">
        <li>某客服每小時接到約 λ = 15 通電話——Poisson(15)。</li>
        <li>一公里高速公路每天發生 λ = 0.3 起車禍——Poisson(0.3)。</li>
        <li>夜空每小時流星 λ = 10——Poisson(10)。</li>
        <li>一本書每頁錯字 λ = 0.5——Poisson(0.5)。</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        Poisson 是「大量獨立小機會」的極限。
        一個參數 λ 就決定了分佈形狀和所有統計量。
        下一節看另一族：等第一次成功前的等待時間——Geometric。
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
    .props { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; display: grid; gap: 6px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .derived { text-align: center; font-size: 13px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; padding: 4px 0; }
    .derived strong { color: var(--accent); }

    .pmf-plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pmf-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .pmf-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .legend { display: flex; gap: 14px; justify-content: center; margin-top: 4px; font-size: 11px; color: var(--text-muted); }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 12px; height: 10px; border-radius: 2px; }
    .sw.bl { background: #5a8aa8; }
    .sw.ac { background: var(--accent); }

    .dist-info { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px; }
    .di { padding: 10px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .di-lab { font-size: 11px; color: var(--text-muted); }
    .di-val { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .note strong { color: var(--accent); }

    .props-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
    .pr { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pr-name { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .pr p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .pr strong { color: var(--accent); }

    .ex { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh3PoissonComponent {
  readonly lambda = signal(5);
  readonly n = signal(30);

  readonly bars = computed(() => {
    const lam = this.lambda();
    const n = this.n();
    const p = lam / n;
    const maxK = Math.min(30, n);
    const out: Array<{ k: number; x: number; binom: number; pois: number }> = [];
    for (let k = 0; k <= maxK; k++) {
      out.push({
        k,
        x: (k / maxK) * 380 + 10,
        binom: binomialPMF(n, p, k) * 500,
        pois: poissonPMF(lam, k) * 500,
      });
    }
    return out;
  });

  readonly l1Error = computed(() => {
    const lam = this.lambda();
    const n = this.n();
    const p = lam / n;
    let err = 0;
    for (let k = 0; k <= 50; k++) {
      err += Math.abs(binomialPMF(n, p, k) - poissonPMF(lam, k));
    }
    return err;
  });
}
