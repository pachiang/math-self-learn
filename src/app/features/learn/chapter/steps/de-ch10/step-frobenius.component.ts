import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/** Bessel J_n(x) via series for small |x|, asymptotic for large x */
function besselJ(n: number, x: number): number {
  // Series: J_n(x) = sum_{k>=0} (-1)^k / (k! (k+n)!) (x/2)^(2k+n)
  if (Math.abs(x) > 20) {
    // Asymptotic
    const phase = x - (n * Math.PI) / 2 - Math.PI / 4;
    return Math.sqrt(2 / (Math.PI * x)) * Math.cos(phase);
  }
  let sum = 0;
  const half = x / 2;
  let term = Math.pow(half, n);
  for (let k = 1; k <= n; k++) term /= k;
  sum = term;
  let sign = -1;
  for (let k = 1; k < 40; k++) {
    term *= (half * half) / (k * (k + n));
    sum += sign * term;
    sign = -sign;
  }
  return sum;
}

@Component({
  selector: 'app-de-ch10-frobenius',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Frobenius 方法：應付正則奇點" subtitle="§10.3">
      <p>
        Bessel 方程 <code>x²y'' + xy' + (x² − n²)y = 0</code> 在 <code>x=0</code> 有麻煩：
        除以 x² 之後係數變成 <code>1/x</code> 和 <code>1 − n²/x²</code>，兩者都在 0 處爆炸。
        這叫做<strong>奇異點</strong>。
      </p>
      <p class="key-idea">
        純冪級數 <code>Σ aₙ xⁿ</code> 在這裡失敗——但若奇異點「夠溫柔」（<strong>正則奇點</strong>），
        可以試更廣泛的 <strong>Frobenius 級數</strong>：
      </p>
      <div class="centered-eq big">
        y = x<sup>r</sup> · Σ aₙ xⁿ = a₀ x<sup>r</sup> + a₁ x<sup>r+1</sup> + a₂ x<sup>r+2</sup> + ⋯
      </div>
      <p>
        多加的 <code>x^r</code> 讓解在 x=0 附近可以是分數次方、甚至含 <code>log x</code>。
      </p>

      <h4>怎麼找 r？指標方程 (Indicial equation)</h4>
      <p>
        把 <code>y = Σ aₙ x^(n+r)</code> 代入 ODE，看最低次項係數（<code>x^r</code>）必須為零：
      </p>
      <div class="centered-eq">[r(r−1) + p₀·r + q₀] · a₀ = 0</div>
      <p>
        其中 <code>p₀ = lim x·P(x)</code>, <code>q₀ = lim x²·Q(x)</code>。
        令 a₀ ≠ 0 後，<strong>r 必須滿足指標方程</strong>。解出 r₁, r₂ 就有兩個候選級數。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Bessel 方程的指標方程互動">
      <div class="indicial">
        <div class="indicial-eq">
          <code>x²y'' + xy' + (x² − n²)y = 0</code>
        </div>
        <div class="indicial-row">
          <span>除以 x²：</span>
          <code>y'' + (1/x)y' + (1 − n²/x²)y = 0</code>
        </div>
        <div class="indicial-row">
          <span>看 x 倍率：</span>
          <code>p₀ = 1,&nbsp;&nbsp;q₀ = −n²</code>
        </div>
        <div class="indicial-row">
          <span>指標方程：</span>
          <code>r(r−1) + r − n² = r² − n² = 0</code>
        </div>
        <div class="indicial-row result">
          <span>解：</span>
          <code>r = ±n</code>
        </div>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">n（階數）</span>
          <input type="range" min="0" max="4" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
      </div>

      <div class="plot">
        <div class="plot-title">Bessel 函數 J_{{ n() }}(x)——Frobenius 級數（r = +n）的解</div>
        <svg viewBox="-20 -90 440 170" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-85" x2="0" y2="75" stroke="var(--border-strong)" stroke-width="1" />
          <text x="405" y="4" class="ax">x</text>
          <text x="4" y="-88" class="ax">J_n</text>
          @for (i of [5,10,15,20,25]; track i) {
            <line [attr.x1]="i * 16" y1="-4" [attr.x2]="i * 16" y2="4" stroke="var(--border-strong)" />
            <text [attr.x]="i * 16" y="14" class="tick">{{ i }}</text>
          }
          <path [attr.d]="besselPath()" fill="none" stroke="var(--accent)" stroke-width="2.2" />
          <!-- x=0 highlight -->
          <line x1="0" y1="-85" x2="0" y2="75" stroke="#ba8d2a" stroke-width="0.8" opacity="0.7" />
          <text x="3" y="-72" class="note">奇異點</text>
        </svg>
      </div>

      <div class="behavior" [attr.data-n]="n()">
        @if (n() === 0) {
          <strong>n = 0：</strong> J₀(0) = 1（從 1 出發），隨 x 增大振盪衰減。
        } @else {
          <strong>n = {{ n() }}：</strong> J_n(0) = 0，然後 x^{{ n() }} 緩慢上升，進入振盪。
          「起始表現」由 <code>x^r = x^{{ n() }}</code> 主宰。
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>三種 Frobenius 情況</h4>
      <div class="cases">
        <div class="case">
          <div class="case-name">情況 1：r₁ − r₂ 不是整數</div>
          <p>兩個 r 各給出獨立級數解，直接相加得通解。</p>
        </div>
        <div class="case">
          <div class="case-name">情況 2：r₁ = r₂（重根）</div>
          <p>第二個解必須含 <code>log(x)</code> 項：y₂ = y₁·log(x) + Σ bₙ x^(n+r)。</p>
        </div>
        <div class="case">
          <div class="case-name">情況 3：r₁ − r₂ = 正整數</div>
          <p>第二解可能含也可能不含 <code>log</code> 項，得仔細驗算係數。</p>
        </div>
      </div>

      <div class="examples">
        <div class="ex">
          <div class="ex-name">Bessel J₀</div>
          <code class="ex-eq">r = 0 重根 → 第二解 Y₀ 有 log x</code>
        </div>
        <div class="ex">
          <div class="ex-name">Bessel J_n (n ≥ 1)</div>
          <code class="ex-eq">r = ±n，r₁ − r₂ = 2n 整數 → 情況 3</code>
        </div>
        <div class="ex">
          <div class="ex-name">Legendre (x₀=±1)</div>
          <code class="ex-eq">r = 0 重根 → 第二解含 log</code>
        </div>
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        正則奇點 → Frobenius 級數 <code>x^r · Σ aₙ xⁿ</code>。
        指標方程決定 r，三種根關係決定第二解是否含 log。
        這讓我們能解決所有「物理等級」的變係數 ODE。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 15px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }
    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }
    .indicial {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }
    .indicial-eq { text-align: center; font-size: 16px; padding: 8px; margin-bottom: 10px; background: var(--accent-10); border-radius: 6px; }
    .indicial-row { display: flex; gap: 10px; font-size: 14px; padding: 4px 0; color: var(--text-secondary); align-items: center; }
    .indicial-row span { min-width: 110px; color: var(--text-muted); font-size: 13px; }
    .indicial-row.result { border-top: 1px solid var(--border); margin-top: 6px; padding-top: 8px; }
    .indicial-row.result code { background: var(--accent); color: white; font-size: 15px; padding: 3px 10px; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 84px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 24px; text-align: right; }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); margin-top: 10px; }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; }
    .plot-svg { width: 100%; display: block; }
    .ax { font-size: 11px; fill: var(--text-muted); font-style: italic; }
    .tick { font-size: 9px; fill: var(--text-muted); text-anchor: middle; font-family: 'JetBrains Mono', monospace; }
    .note { font-size: 10px; fill: var(--text-muted); }

    .behavior {
      margin-top: 10px;
      padding: 10px 14px;
      border-radius: 8px;
      background: var(--accent-10);
      font-size: 13px;
      color: var(--text);
    }
    .behavior strong { color: var(--accent); }

    .cases { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 10px 0; }
    .case { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .case-name { font-weight: 700; color: var(--accent); margin-bottom: 4px; font-size: 13px; }
    .case p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

    .examples { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 12px 0; }
    .ex { padding: 10px 12px; border: 1px dashed var(--border); border-radius: 10px; background: var(--bg); }
    .ex-name { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
    .ex-eq { display: block; font-size: 12px; color: var(--text-secondary); }
  `,
})
export class DeCh10FrobeniusComponent {
  readonly n = signal(0);

  readonly besselPath = computed(() => {
    const pts: string[] = [];
    const SCALE_X = 16;
    const SCALE_Y = 70;
    const n = this.n();
    for (let i = 0; i <= 400; i++) {
      const x = (25 * i) / 400;
      const y = besselJ(n, x);
      const yc = Math.max(-1, Math.min(1.1, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(x * SCALE_X).toFixed(1)} ${(-yc * SCALE_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });
}
