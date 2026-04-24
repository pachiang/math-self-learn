import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type DistId = 'chisq' | 't' | 'f';

// log-gamma via Lanczos approximation
function logGamma(x: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function chiSqPdf(x: number, df: number): number {
  if (x <= 0) return 0;
  const k = df / 2;
  return Math.exp((k - 1) * Math.log(x) - x / 2 - k * Math.log(2) - logGamma(k));
}

function tPdf(x: number, df: number): number {
  const n = (df + 1) / 2;
  const log = logGamma(n) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI)
    - n * Math.log(1 + (x * x) / df);
  return Math.exp(log);
}

function fPdf(x: number, d1: number, d2: number): number {
  if (x <= 0) return 0;
  const log = 0.5 * (d1 * Math.log(d1) + d2 * Math.log(d2))
    + (d1 / 2 - 1) * Math.log(x)
    - ((d1 + d2) / 2) * Math.log(d1 * x + d2)
    + logGamma((d1 + d2) / 2) - logGamma(d1 / 2) - logGamma(d2 / 2);
  return Math.exp(log);
}

@Component({
  selector: 'app-stats-ch1-sampling-dist',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="三大抽樣分佈：χ²、t、F" subtitle="§1.3">
      <p>
        從 Normal 母體出發，樣本統計量各自服從著名的分佈。這三姐妹會貫穿整門數統。
      </p>

      <h4>χ² 分佈 (Chi-square)</h4>
      <p>
        獨立 <code>Z₁, …, Z_k ~ N(0, 1)</code>，令 <code>Q = Σ Zᵢ²</code>，則 Q ~ χ²(k)。
      </p>
      <div class="centered-eq">
        (n − 1)·S² / σ² &nbsp;~&nbsp; χ²(n − 1)
      </div>
      <p>
        這是第 2、4、5 章 <strong>變異數推論</strong>的基石——檢定 σ²、χ² 適合度檢定都用它。
      </p>

      <h4>t 分佈 (Student's t)</h4>
      <p>
        當我們要把 X̄ 標準化，但 σ 未知、只能用 S 代替：
      </p>
      <div class="centered-eq">
        T = (X̄ − μ) / (S / √n) &nbsp;~&nbsp; t(n − 1)
      </div>
      <p>
        t 分佈形狀像 Normal 但尾巴更重——因為 S 本身就帶著誤差。df 越大越像 N(0,1)；
        df = 30 時兩者幾乎無法分辨。
      </p>

      <h4>F 分佈 (F)</h4>
      <p>
        兩組獨立樣本各自的 S₁², S₂²，比例 (S₁²/σ₁²) / (S₂²/σ₂²) ~ F(n₁−1, n₂−1)。
      </p>
      <div class="centered-eq">
        F = (χ²₁ / d₁) / (χ²₂ / d₂)
      </div>
      <p>
        之後會看到 <strong>ANOVA</strong> 就是在算「組間變異 / 組內變異」——這個比例服從 F。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="切換分佈、調整自由度：觀察形狀怎麼變">
      <div class="dist-tabs">
        @for (d of dists; track d.id) {
          <button class="pill" [class.active]="dist() === d.id" (click)="dist.set(d.id)">{{ d.name }}</button>
        }
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">df{{ dist() === 'f' ? ' (d₁)' : '' }}</span>
          <input type="range" min="1" max="30" step="1" [value]="df1()"
            (input)="df1.set(+$any($event).target.value)" />
          <span class="sl-val">{{ df1() }}</span>
        </div>
        @if (dist() === 'f') {
          <div class="sl">
            <span class="sl-lab">d₂</span>
            <input type="range" min="1" max="30" step="1" [value]="df2()"
              (input)="df2.set(+$any($event).target.value)" />
            <span class="sl-val">{{ df2() }}</span>
          </div>
        }
      </div>

      <svg viewBox="-10 -100 420 140" class="p-svg">
        <line [attr.x1]="xZero()" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
        <line [attr.x1]="xZero()" y1="-90" [attr.x2]="xZero()" y2="4" stroke="var(--border-strong)" stroke-width="0.8" />
        <!-- Reference N(0,1) for t -->
        @if (dist() === 't') {
          <path [attr.d]="normalRef()" fill="none" stroke="var(--text-muted)" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.6" />
        }
        <path [attr.d]="pdfPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
        <text x="400" y="14" class="tk" text-anchor="end">{{ xMax() }}</text>
        <text [attr.x]="xZero()" y="14" class="tk" text-anchor="middle">{{ dist() === 't' ? '0' : '0' }}</text>
      </svg>

      <div class="stats">
        <div class="st">
          <div class="st-l">分佈</div>
          <div class="st-v">{{ currentName() }}</div>
        </div>
        <div class="st">
          <div class="st-l">理論均值</div>
          <div class="st-v">{{ theoMean() }}</div>
        </div>
        <div class="st">
          <div class="st-l">理論變異數</div>
          <div class="st-v">{{ theoVar() }}</div>
        </div>
      </div>

      <p class="note">
        三個分佈彼此相連：t² = F(1, df)；t 的極限就是 N(0,1)；χ²/df 的極限是點 1。
        調大 df 看看就懂——整個 Normal 世界都在 df → ∞ 的極限上。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        χ² 管變異；t 管均值（σ 未知）；F 管變異比（或 ANOVA）。
        下一章我們正式進入估計，這三姐妹之後會輪番登場。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .dist-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 30px; text-align: right; }

    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh1SamplingDistComponent {
  readonly dists: Array<{ id: DistId; name: string }> = [
    { id: 'chisq', name: 'χ²' },
    { id: 't', name: 't' },
    { id: 'f', name: 'F' },
  ];
  readonly dist = signal<DistId>('chisq');
  readonly df1 = signal(5);
  readonly df2 = signal(10);

  readonly xMax = computed(() => {
    const d = this.dist();
    if (d === 'chisq') return Math.max(15, this.df1() * 3);
    if (d === 't') return 5;
    return 5;
  });

  readonly xZero = computed(() => this.dist() === 't' ? 200 : 0);

  readonly currentName = computed(() => {
    const d = this.dist();
    if (d === 'chisq') return `χ²(${this.df1()})`;
    if (d === 't') return `t(${this.df1()})`;
    return `F(${this.df1()}, ${this.df2()})`;
  });

  readonly theoMean = computed(() => {
    const d = this.dist();
    if (d === 'chisq') return String(this.df1());
    if (d === 't') return this.df1() > 1 ? '0' : '不存在';
    const d2 = this.df2();
    return d2 > 2 ? (d2 / (d2 - 2)).toFixed(2) : '不存在';
  });

  readonly theoVar = computed(() => {
    const d = this.dist();
    if (d === 'chisq') return String(2 * this.df1());
    if (d === 't') {
      const df = this.df1();
      return df > 2 ? (df / (df - 2)).toFixed(2) : '不存在';
    }
    const d1 = this.df1(), d2 = this.df2();
    if (d2 <= 4) return '不存在';
    const v = (2 * d2 * d2 * (d1 + d2 - 2)) / (d1 * (d2 - 2) * (d2 - 2) * (d2 - 4));
    return v.toFixed(2);
  });

  pdfPath(): string {
    const d = this.dist();
    const xMax = this.xMax();
    const N = 300;
    const pts: string[] = [];
    const xMin = d === 't' ? -xMax : 0;
    const yPeak = this.peakY();
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      let y = 0;
      if (d === 'chisq') y = chiSqPdf(x, this.df1());
      else if (d === 't') y = tPdf(x, this.df1());
      else y = fPdf(x, this.df1(), this.df2());
      const px = d === 't' ? 200 + (x / xMax) * 200 : (x / xMax) * 400;
      const py = -(y / yPeak) * 85;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  normalRef(): string {
    const pts: string[] = [];
    const N = 200;
    const xMax = this.xMax();
    const peak = 1 / Math.sqrt(2 * Math.PI);
    for (let i = 0; i <= N; i++) {
      const x = -xMax + (2 * xMax * i) / N;
      const y = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
      const px = 200 + (x / xMax) * 200;
      const py = -(y / peak) * 85;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  private peakY(): number {
    const d = this.dist();
    if (d === 'chisq') {
      const df = this.df1();
      if (df <= 2) return chiSqPdf(0.5, df);
      return chiSqPdf(df - 2, df);
    }
    if (d === 't') return tPdf(0, this.df1());
    const d1 = this.df1(), d2 = this.df2();
    if (d1 <= 2) return fPdf(0.1, d1, d2);
    const mode = ((d1 - 2) * d2) / (d1 * (d2 + 2));
    return fPdf(Math.max(0.01, mode), d1, d2);
  }
}
