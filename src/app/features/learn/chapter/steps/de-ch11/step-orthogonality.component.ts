import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

// Numerical inner product ∫₀^L sin(mπx/L) sin(nπx/L) dx using Simpson
function innerProduct(m: number, n: number, L: number, N = 200): number {
  const h = L / N;
  let sum = 0;
  for (let i = 0; i <= N; i++) {
    const x = i * h;
    const v = Math.sin((m * Math.PI * x) / L) * Math.sin((n * Math.PI * x) / L);
    const w = i === 0 || i === N ? 1 : i % 2 === 0 ? 2 : 4;
    sum += w * v;
  }
  return (h / 3) * sum;
}

@Component({
  selector: 'app-de-ch11-orthogonality',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="本徵函數的正交性" subtitle="§11.3">
      <p>
        線性代數裡，對稱矩陣的特徵向量互相<strong>正交</strong>。
        對微分算子，完全類比的結果成立——只是「內積」改成積分：
      </p>
      <div class="centered-eq big">
        ⟨f, g⟩ := ∫₀<sup>L</sup> f(x)·g(x) dx
      </div>
      <p class="key-idea">
        <strong>定理：</strong> 弦 BVP 的本徵函數 <code>y_n = sin(nπx/L)</code> 在此內積下互相正交：
      </p>
      <div class="centered-eq">
        ⟨y_m, y_n⟩ = 0 當 m ≠ n,&nbsp;&nbsp;⟨y_n, y_n⟩ = L/2
      </div>
    </app-prose-block>

    <app-challenge-card prompt="選兩個階數：看積分究竟等不等於零">
      <div class="ctrl-row">
        <div class="sl">
          <span class="sl-lab">m</span>
          <input type="range" min="1" max="6" step="1" [value]="m()"
            (input)="m.set(+$any($event).target.value)" />
          <span class="sl-val">{{ m() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">n</span>
          <input type="range" min="1" max="6" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
      </div>

      <div class="plots">
        <div class="small-plot">
          <div class="sp-title">sin({{ m() }}πx/L)</div>
          <svg viewBox="-10 -60 220 120" class="sp-svg">
            <line x1="0" y1="0" x2="200" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <path [attr.d]="curvePath(m())" fill="none" stroke="var(--accent)" stroke-width="2" />
          </svg>
        </div>
        <div class="small-plot">
          <div class="sp-title">sin({{ n() }}πx/L)</div>
          <svg viewBox="-10 -60 220 120" class="sp-svg">
            <line x1="0" y1="0" x2="200" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <path [attr.d]="curvePath(n())" fill="none" stroke="#5a8aa8" stroke-width="2" />
          </svg>
        </div>
        <div class="small-plot">
          <div class="sp-title">乘積 sin(mπx/L) · sin(nπx/L)</div>
          <svg viewBox="-10 -60 220 120" class="sp-svg">
            <line x1="0" y1="0" x2="200" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <!-- Positive area -->
            <path [attr.d]="productAreaPos()" fill="var(--accent)" opacity="0.3" />
            <!-- Negative area -->
            <path [attr.d]="productAreaNeg()" fill="#5a8aa8" opacity="0.3" />
            <!-- Product curve -->
            <path [attr.d]="productPath()" fill="none" stroke="var(--text)" stroke-width="1.8" />
          </svg>
          <p class="sp-note">橘色 = 正面積、藍色 = 負面積，m ≠ n 時<strong>完全抵消</strong>。</p>
        </div>
      </div>

      <div class="integral-result">
        <span class="int-lab">⟨y_m, y_n⟩ = </span>
        <span class="int-val" [class.zero]="isZero()">{{ ip() }}</span>
        @if (m() === n()) {
          <span class="int-note">= L/2 = {{ (Math.PI / 2).toFixed(4) }}</span>
        } @else {
          <span class="int-note">（正負抵消，應為 0）</span>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>展開定理：函數當作「本徵函數的和」</h4>
      <p>
        既然正弦族 <code>y_n</code> 是「正交基底」，任意（夠好的）函數 f(x) 可以展開成：
      </p>
      <div class="centered-eq big">
        f(x) = Σ bₙ sin(nπx/L)
      </div>
      <p>
        係數由<strong>投影公式</strong>給出（跟 Fourier 一模一樣）：
      </p>
      <div class="centered-eq">
        bₙ = ⟨f, y_n⟩ / ⟨y_n, y_n⟩ = (2/L) ∫₀<sup>L</sup> f(x) sin(nπx/L) dx
      </div>
      <p>
        這完全就是 <strong>Fourier 正弦級數</strong>。
        也就是說：Fourier 級數不是硬塞進來的——它是 <code>−y″ = λy, y(0)=y(L)=0</code> 這個 BVP 的
        <strong>本徵函數展開</strong>。
      </p>

      <h4>為什麼正交？真正的理由是「算子自伴」</h4>
      <p>
        對 <code>L[y] = −y″</code>，用兩次分部積分：
      </p>
      <div class="centered-eq">
        ⟨L[y_m], y_n⟩ = [−y_m' y_n]₀<sup>L</sup> + ⟨y_m', y_n'⟩
      </div>
      <p>
        邊界條件 <code>y(0) = y(L) = 0</code> 消掉端點項，再做一次分部 → ⟨L[y_m], y_n⟩ = ⟨y_m, L[y_n]⟩。
        這就是<strong>自伴性</strong>（L = L*）。加上兩個不同特徵值，就推出正交：
      </p>
      <div class="centered-eq">
        (λ_m − λ_n)⟨y_m, y_n⟩ = 0 → 當 λ_m ≠ λ_n 時 ⟨y_m, y_n⟩ = 0
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        正交性不是碰巧——它是「自伴 + 不同特徵值」的必然產物。
        下一節把這個推廣到任意 Sturm-Liouville 問題（含權重函數）。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0;
    }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea {
      padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 15px; margin: 12px 0;
    }
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }

    .ctrl-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 8px; }
    .sl-lab { font-size: 14px; color: var(--accent); font-weight: 700; min-width: 20px; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 20px; text-align: right; }

    .plots { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; }
    .small-plot { padding: 8px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .sp-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .sp-svg { width: 100%; display: block; }
    .sp-note { font-size: 10px; color: var(--text-muted); margin: 4px 0 0; text-align: center; }

    .integral-result {
      margin-top: 10px; padding: 14px; background: var(--bg-surface);
      border: 1px solid var(--border); border-radius: 10px; text-align: center;
    }
    .int-lab { font-size: 14px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .int-val {
      font-size: 22px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; margin: 0 8px;
    }
    .int-val.zero { color: #5ca878; }
    .int-note { font-size: 12px; color: var(--text-muted); }

    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh11OrthogonalityComponent {
  readonly Math = Math;
  readonly m = signal(2);
  readonly n = signal(3);
  readonly L = Math.PI;

  readonly ip = computed(() => innerProduct(this.m(), this.n(), this.L).toFixed(4));
  readonly isZero = computed(() => this.m() !== this.n());

  curvePath(k: number): string {
    const pts: string[] = [];
    const W = 200;
    const H = 40;
    const N = 150;
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = Math.sin((k * Math.PI * x) / this.L);
      pts.push(`${i === 0 ? 'M' : 'L'} ${((x / this.L) * W).toFixed(1)} ${(-y * H).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  productPath(): string {
    const pts: string[] = [];
    const W = 200;
    const H = 38;
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = Math.sin((this.m() * Math.PI * x) / this.L) * Math.sin((this.n() * Math.PI * x) / this.L);
      pts.push(`${i === 0 ? 'M' : 'L'} ${((x / this.L) * W).toFixed(1)} ${(-y * H).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  productAreaPos(): string {
    return this.areaPath(true);
  }
  productAreaNeg(): string {
    return this.areaPath(false);
  }

  private areaPath(positive: boolean): string {
    const pts: string[] = [];
    const W = 200;
    const H = 38;
    const N = 200;
    const segments: Array<Array<[number, number]>> = [];
    let current: Array<[number, number]> = [];
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = Math.sin((this.m() * Math.PI * x) / this.L) * Math.sin((this.n() * Math.PI * x) / this.L);
      const keep = positive ? y >= 0 : y <= 0;
      const px = (x / this.L) * W;
      const py = -y * H;
      if (keep) {
        current.push([px, py]);
      } else if (current.length > 0) {
        segments.push(current);
        current = [];
      }
    }
    if (current.length > 0) segments.push(current);
    for (const seg of segments) {
      if (seg.length < 2) continue;
      pts.push(`M ${seg[0][0].toFixed(1)} 0`);
      for (const [px, py] of seg) pts.push(`L ${px.toFixed(1)} ${py.toFixed(1)}`);
      pts.push(`L ${seg[seg.length - 1][0].toFixed(1)} 0 Z`);
    }
    return pts.join(' ');
  }
}
