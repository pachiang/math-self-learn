import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type DistId = 'coin' | 'dice' | 'exp' | 'cauchy';

function sampleDist(d: DistId): number {
  if (d === 'coin') return Math.random() < 0.5 ? 0 : 1;
  if (d === 'dice') return Math.ceil(Math.random() * 6);
  if (d === 'exp') return -Math.log(1 - Math.random());
  // Cauchy: has no mean!
  const u = Math.random() - 0.5;
  return Math.tan(Math.PI * u);
}

function trueMean(d: DistId): number {
  if (d === 'coin') return 0.5;
  if (d === 'dice') return 3.5;
  if (d === 'exp') return 1;
  return NaN; // Cauchy has no mean
}

@Component({
  selector: 'app-prob-ch6-lln',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="大數法則 (LLN)" subtitle="§6.1">
      <p>
        <strong>樣本平均</strong>定義為：
      </p>
      <div class="centered-eq big">
        X̄ₙ = (X₁ + X₂ + ⋯ + Xₙ) / n
      </div>
      <p>其中 X₁, ..., Xₙ 是從同一分佈獨立抽出的。</p>

      <h4>大數法則（弱版 / Weak LLN）</h4>
      <div class="centered-eq big">
        X̄ₙ →ᵖ μ &nbsp;&nbsp; 當 n → ∞
      </div>
      <p>
        「依機率收斂」：對任意 ε &gt; 0，<code>P(|X̄ₙ − μ| &gt; ε) → 0</code>。
        這用 §5.3 的 Chebyshev 就能證明——只需 Var(X) 存在。
      </p>

      <h4>強版 (Strong LLN)</h4>
      <p>更強：<strong>幾乎處處收斂</strong> X̄ₙ → μ，a.s.</p>

      <p class="key-idea">
        LLN 告訴我們：<strong>只要分佈有均值、樣本夠多，樣本均值就逼近真實均值</strong>。
        這是<strong>頻率學派機率詮釋</strong>的數學正當性——也是為什麼 Monte Carlo 會收斂。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選分佈 → 看樣本均值收斂到真值（還是不收斂！）">
      <div class="dist-tabs">
        @for (d of dists; track d.id) {
          <button class="pill" [class.active]="dist() === d.id" (click)="setDist(d.id)">{{ d.name }}</button>
        }
      </div>

      <div class="info-box" [attr.data-d]="dist()">
        <div class="i-row">
          <span class="i-lab">分佈：</span>
          <span class="i-val">{{ distInfo().name }}</span>
        </div>
        <div class="i-row">
          <span class="i-lab">真實 μ：</span>
          <span class="i-val">{{ isFinite(distInfo().mean) ? distInfo().mean.toFixed(2) : '不存在！' }}</span>
        </div>
      </div>

      <div class="plot">
        <div class="p-title">樣本均值 X̄ₙ 隨 n 變化</div>
        <svg viewBox="-10 -100 420 140" class="p-svg">
          <line x1="0" y1="-50" x2="400" y2="-50" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-95" x2="0" y2="30" stroke="var(--border-strong)" stroke-width="1" />

          <!-- Reference line at mean -->
          @if (isFinite(distInfo().mean)) {
            <line x1="0" [attr.y1]="-meanToPx()" x2="400" [attr.y2]="-meanToPx()"
              stroke="#5ca878" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.8" />
            <text x="404" [attr.y]="-meanToPx() + 3" class="tk mean">μ</text>
          }

          <path [attr.d]="meanPath()" fill="none" stroke="var(--accent)" stroke-width="1.8" />

          <text x="0" y="14" class="tk" text-anchor="end">1</text>
          <text x="400" y="14" class="tk" text-anchor="end">{{ N }}</text>
          <text x="-4" y="-92" class="tk" text-anchor="end">{{ yMax().toFixed(1) }}</text>
          <text x="-4" y="3" class="tk" text-anchor="end">{{ yMin().toFixed(1) }}</text>
        </svg>
      </div>

      <div class="sim-ctrl">
        <button class="btn" (click)="simulate()">▶ 再抽 {{ N }} 個樣本</button>
        <button class="btn reset" (click)="reset()">↻ 重設</button>
        <span class="c">當前 n: {{ samples().length }}</span>
      </div>

      @if (dist() === 'cauchy') {
        <div class="warn">
          ⚠ Cauchy 分佈<strong>沒有均值</strong>（積分發散）。樣本均值<strong>不會收斂</strong>——
          它本身也服從 Cauchy，永遠會有意外極端值把它拉偏。
          這提醒我們：<strong>LLN 需要分佈有均值</strong>。
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <h4>LLN 保證的 / 不保證的</h4>
      <div class="yes-no">
        <div class="yn yes">
          <div class="yn-head">✓ 保證</div>
          <ul>
            <li>樣本均值最終收斂到真實均值</li>
            <li>Monte Carlo 估計會越來越準</li>
            <li>頻率 → 機率</li>
          </ul>
        </div>
        <div class="yn no">
          <div class="yn-head">✗ 不保證</div>
          <ul>
            <li>收斂速度（會很慢！~ 1/√n）</li>
            <li>短期偏差歸零（「賭徒謬誤」）</li>
            <li>對無均值的分佈有效</li>
            <li>給你任何「置信度」</li>
          </ul>
        </div>
      </div>

      <h4>CLT 是 LLN 的精緻化</h4>
      <p>
        LLN 說「X̄ₙ 接近 μ」但不說「多接近」。
        CLT 給出量化：<strong>X̄ₙ − μ 乘以 √n 後，分佈趨向 Normal(0, σ²)</strong>。
        這就是下一節的主題。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        LLN 把「長期平均 = 真實均值」寫成嚴格數學。
        下一節的 CLT 給出誤差的<strong>量化</strong>——那是整個統計學的基石。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .dist-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .info-box { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .i-row { display: flex; gap: 8px; padding: 3px 0; font-size: 13px; }
    .i-lab { color: var(--text-muted); min-width: 70px; }
    .i-val { color: var(--accent); font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.mean { fill: #5ca878; font-weight: 700; }

    .sim-ctrl { display: flex; gap: 6px; align-items: center; margin-top: 10px; flex-wrap: wrap; }
    .btn { font: inherit; font-size: 12px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn.reset { background: transparent; color: var(--accent); }
    .c { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-left: auto; }

    .warn { padding: 12px; background: rgba(200, 123, 94, 0.1); border-left: 3px solid #c87b5e; border-radius: 0 8px 8px 0; margin-top: 10px; font-size: 13px; color: #c87b5e; line-height: 1.6; }
    .warn strong { font-weight: 700; }

    .yes-no { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
    @media (max-width: 640px) { .yes-no { grid-template-columns: 1fr; } }
    .yn { padding: 12px; border-radius: 10px; }
    .yn.yes { background: rgba(92, 168, 120, 0.1); border: 1px solid #5ca878; }
    .yn.no { background: rgba(200, 123, 94, 0.1); border: 1px solid #c87b5e; }
    .yn-head { font-weight: 700; margin-bottom: 6px; }
    .yn.yes .yn-head { color: #5ca878; }
    .yn.no .yn-head { color: #c87b5e; }
    .yn ul { margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.7; color: var(--text-secondary); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh6LlnComponent {
  readonly N = 2000;
  readonly dists: Array<{ id: DistId; name: string; mean: number }> = [
    { id: 'coin', name: '硬幣 (μ=0.5)', mean: 0.5 },
    { id: 'dice', name: '骰子 (μ=3.5)', mean: 3.5 },
    { id: 'exp', name: 'Exp(1) (μ=1)', mean: 1 },
    { id: 'cauchy', name: 'Cauchy (無均值)', mean: NaN },
  ];

  readonly dist = signal<DistId>('coin');
  readonly samples = signal<number[]>([]);

  readonly distInfo = computed(() => this.dists.find(d => d.id === this.dist()) ?? this.dists[0]);

  isFinite(x: number) { return Number.isFinite(x); }

  readonly yMin = computed(() => {
    const d = this.dist();
    if (d === 'coin') return 0;
    if (d === 'dice') return 1;
    if (d === 'exp') return 0;
    return -4;
  });
  readonly yMax = computed(() => {
    const d = this.dist();
    if (d === 'coin') return 1;
    if (d === 'dice') return 6;
    if (d === 'exp') return 3;
    return 4;
  });

  readonly meanToPx = computed(() => {
    const mu = this.distInfo().mean;
    if (!Number.isFinite(mu)) return 0;
    const range = this.yMax() - this.yMin();
    return ((mu - this.yMin()) / range) * 90;
  });

  setDist(d: DistId) {
    this.dist.set(d);
    this.reset();
  }

  simulate() {
    const d = this.dist();
    const current = this.samples();
    const next = [...current];
    const N = this.N - next.length;
    for (let i = 0; i < N; i++) next.push(sampleDist(d));
    this.samples.set(next);
  }

  reset() { this.samples.set([]); }

  meanPath(): string {
    const arr = this.samples();
    if (arr.length === 0) return '';
    const pts: string[] = [];
    let sum = 0;
    const yMin = this.yMin();
    const range = this.yMax() - yMin;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
      const avg = sum / (i + 1);
      const px = ((i + 1) / this.N) * 400;
      const clipped = Math.max(yMin, Math.min(this.yMax(), avg));
      const py = -((clipped - yMin) / range) * 90;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
