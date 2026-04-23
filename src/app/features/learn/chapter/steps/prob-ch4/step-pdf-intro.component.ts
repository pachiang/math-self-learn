import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch4-pdf-intro',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="連續 RV 與機率密度函數" subtitle="§4.1">
      <p>
        連續 RV（身高、時間、溫度）在任何單一值的機率是 0。
        我們用<strong>機率密度函數 (PDF) f(x)</strong> 代替 PMF：
      </p>
      <div class="centered-eq big">
        P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx
      </div>
      <ul class="props">
        <li><strong>非負</strong>：f(x) ≥ 0（但 <strong>可以大於 1</strong>）</li>
        <li><strong>歸一</strong>：∫ f(x) dx = 1</li>
        <li><strong>面積 = 機率</strong>：f 本身不是機率，f·dx 才是</li>
      </ul>

      <h4>CDF：F(x) = P(X ≤ x)</h4>
      <div class="centered-eq">
        F(x) = ∫₋∞ˣ f(t) dt, &nbsp;&nbsp; f(x) = dF/dx
      </div>
      <p>
        PDF 和 CDF 就是微分與積分的關係。對連續 RV，CDF 是連續函數，
        PMF → PDF、和 → 積分，所有機率公式都平滑遷移。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="互動：拖動區間邊界，看面積 = 機率">
      <div class="plot">
        <div class="p-title">標準常態 PDF，陰影 = P(a ≤ X ≤ b)</div>
        <svg viewBox="-210 -90 420 160" class="p-svg">
          <line x1="-200" y1="0" x2="200" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-85" x2="0" y2="40" stroke="var(--border-strong)" stroke-width="1" />

          <!-- Filled area [a, b] -->
          <path [attr.d]="filledArea()" fill="var(--accent)" opacity="0.3" />

          <!-- PDF curve -->
          <path [attr.d]="pdfPath()" fill="none" stroke="var(--accent)" stroke-width="2" />

          <!-- a and b markers -->
          <line [attr.x1]="a() * 40" y1="0" [attr.x2]="a() * 40" [attr.y2]="-pdf(a()) * 200"
            stroke="#ba8d2a" stroke-width="1.5" stroke-dasharray="3 2" />
          <line [attr.x1]="b() * 40" y1="0" [attr.x2]="b() * 40" [attr.y2]="-pdf(b()) * 200"
            stroke="#ba8d2a" stroke-width="1.5" stroke-dasharray="3 2" />
          <text [attr.x]="a() * 40" y="14" class="tk" text-anchor="middle">a={{ a().toFixed(1) }}</text>
          <text [attr.x]="b() * 40" y="14" class="tk" text-anchor="middle">b={{ b().toFixed(1) }}</text>

          <!-- Grid marks -->
          @for (i of [-3,-2,-1,1,2,3]; track i) {
            <line [attr.x1]="i * 40" y1="-3" [attr.x2]="i * 40" y2="3" stroke="var(--border-strong)" />
          }
        </svg>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">a</span>
          <input type="range" min="-3" max="3" step="0.05" [value]="a()"
            (input)="a.set(+$any($event).target.value)" />
          <span class="sl-val">{{ a().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">b</span>
          <input type="range" min="-3" max="3" step="0.05" [value]="b()"
            (input)="b.set(+$any($event).target.value)" />
          <span class="sl-val">{{ b().toFixed(2) }}</span>
        </div>
      </div>

      <div class="result">
        <span class="r-lab">P({{ a().toFixed(2) }} ≤ X ≤ {{ b().toFixed(2) }}) = </span>
        <span class="r-val">{{ integral().toFixed(4) }}</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>PDF 的高值 ≠ 機率高</h4>
      <p>
        舉例：Uniform(0, 0.1) 的 PDF = 10（大於 1！），但 P(X = 0.05) 仍為 0。
        <strong>密度</strong>是單位區間的機率，必須乘 dx 才是機率。
      </p>

      <h4>離散 vs 連續對照表</h4>
      <table class="compare">
        <thead>
          <tr><th></th><th>離散</th><th>連續</th></tr>
        </thead>
        <tbody>
          <tr><td>機率函數</td><td>PMF p(k)</td><td>PDF f(x)</td></tr>
          <tr><td>單點機率</td><td>p(k) ≥ 0</td><td>P(X=x) = 0（！）</td></tr>
          <tr><td>歸一條件</td><td>Σ p(k) = 1</td><td>∫ f(x) dx = 1</td></tr>
          <tr><td>區間機率</td><td>Σ p(k)</td><td>∫ f(x) dx</td></tr>
          <tr><td>期望值</td><td>Σ k·p(k)</td><td>∫ x·f(x) dx</td></tr>
          <tr><td>CDF 性質</td><td>階梯函數</td><td>連續不減函數</td></tr>
        </tbody>
      </table>

      <p class="takeaway">
        <strong>take-away：</strong>
        連續 RV 用 PDF 描述。機率 = 面積。
        下四節分別介紹：Uniform（最簡單）、Exponential（等待時間）、Normal（萬能）、Gamma（偏斜）。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 18px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .props { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); }
    .props strong { color: var(--accent); }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; display: grid; gap: 6px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 14px; color: var(--accent); font-weight: 700; min-width: 24px; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }

    .result { padding: 14px; background: var(--accent-10); border: 1px solid var(--accent-30); border-radius: 10px; margin-top: 10px; text-align: center; }
    .r-lab { font-size: 13px; color: var(--text-secondary); }
    .r-val { font-size: 22px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-left: 10px; }

    .compare { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
    .compare th, .compare td { padding: 6px 8px; border: 1px solid var(--border); text-align: left; }
    .compare th { background: var(--accent-10); color: var(--accent); font-weight: 700; }
    .compare td:first-child { color: var(--text-muted); font-weight: 600; }
    .compare tr:nth-child(even) td { background: var(--bg-surface); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh4PdfIntroComponent {
  readonly a = signal(-1);
  readonly b = signal(1);

  pdf(x: number): number {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-x * x / 2);
  }

  readonly integral = computed(() => {
    // Numerical integration (Simpson) from a to b
    const a = Math.min(this.a(), this.b());
    const b = Math.max(this.a(), this.b());
    const N = 100;
    const h = (b - a) / N;
    let sum = 0;
    for (let i = 0; i <= N; i++) {
      const x = a + i * h;
      const w = i === 0 || i === N ? 1 : i % 2 === 0 ? 2 : 4;
      sum += w * this.pdf(x);
    }
    return (h / 3) * sum;
  });

  pdfPath(): string {
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = -5 + (10 * i) / N;
      const y = this.pdf(x);
      const px = x * 40;
      const py = -y * 200;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  filledArea(): string {
    const a = Math.min(this.a(), this.b());
    const b = Math.max(this.a(), this.b());
    const pts: string[] = [];
    const N = 100;
    pts.push(`M ${(a * 40).toFixed(1)} 0`);
    for (let i = 0; i <= N; i++) {
      const x = a + ((b - a) * i) / N;
      const y = this.pdf(x);
      const px = x * 40;
      const py = -y * 200;
      pts.push(`L ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    pts.push(`L ${(b * 40).toFixed(1)} 0 Z`);
    return pts.join(' ');
  }
}
