import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-polar-coords',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="極座標換元" subtitle="§14.6">
      <p>
        圓形區域用直角座標積分很痛苦。<strong>極座標</strong> (r, θ) 是救星：
      </p>
      <p class="formula">∬_D f(x,y) dA = ∫∫ f(r cos θ, r sin θ) · r dr dθ</p>
      <p>
        關鍵：面積元素 dA = dx dy 變成 <strong>r dr dθ</strong>。
        多了一個 r 因子——因為離原點越遠，同樣的 dθ 掃過的弧長越大。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動分割數看極座標如何切割圓盤">
      <div class="ctrl-row">
        <span class="cl">Nr = {{ nr() }}</span>
        <input type="range" min="2" max="12" step="1" [value]="nr()"
               (input)="nr.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">Nθ = {{ ntheta() }}</span>
        <input type="range" min="4" max="24" step="1" [value]="ntheta()"
               (input)="ntheta.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-1.4 -1.4 2.8 2.8" class="polar-svg">
        <!-- Reference circles -->
        @for (r of refCircles; track r) {
          <circle cx="0" cy="0" [attr.r]="r" fill="none" stroke="var(--border)" stroke-width="0.008" />
        }
        @for (a of refAngles; track a) {
          <line x1="0" y1="0" [attr.x2]="1.2 * Math.cos(a)" [attr.y2]="1.2 * Math.sin(a)"
                stroke="var(--border)" stroke-width="0.008" />
        }

        <!-- Polar cells -->
        @for (cell of cells(); track cell.key) {
          <path [attr.d]="cell.path" [attr.fill]="cell.color" fill-opacity="0.3"
                stroke="var(--accent)" stroke-width="0.012" />
        }

        <!-- Highlight one cell -->
        @if (highlightCell()) {
          <path [attr.d]="highlightCell()!.path" fill="rgba(191,110,110,0.4)"
                stroke="#bf6e6e" stroke-width="0.025" />
        }
      </svg>

      <div class="info-row">
        <div class="i-card">{{ nr() }}×{{ ntheta() }} = {{ nr() * ntheta() }} 個小塊</div>
        <div class="i-card">面積元素 dA = r·Δr·Δθ</div>
        <div class="i-card accent">∫ (x²+y²) dA ≈ {{ polarIntegral().toFixed(4) }}</div>
      </div>
      <div class="exact">精確值 ∫₀¹∫₀²π r²·r dr dθ = π/2 ≈ {{ (Math.PI / 2).toFixed(4) }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        用極座標後，∫₀²π ∫₀¹ r²·r dr dθ = 2π · 1/4 = π/2。
        比直角座標簡潔太多了。下一節看一般性的<strong>換元公式</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .cl { font-size: 13px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .polar-svg { width: 100%; max-width: 380px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .info-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .i-card { flex: 1; padding: 8px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
    .exact { text-align: center; font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepPolarCoordsComponent {
  readonly Math = Math;
  readonly nr = signal(5);
  readonly ntheta = signal(12);
  readonly refCircles = [0.25, 0.5, 0.75, 1.0];
  readonly refAngles = Array.from({ length: 12 }, (_, i) => (2 * Math.PI * i) / 12);

  readonly cells = computed(() => {
    const NR = this.nr(), NT = this.ntheta();
    const dr = 1 / NR, dth = (2 * Math.PI) / NT;
    const result: { key: string; path: string; color: string }[] = [];
    for (let i = 0; i < NR; i++) {
      const r1 = i * dr, r2 = (i + 1) * dr;
      for (let j = 0; j < NT; j++) {
        const th1 = j * dth, th2 = (j + 1) * dth;
        const path = this.arcPath(r1, r2, th1, th2);
        const hue = (360 * j) / NT;
        result.push({ key: `${i}-${j}`, path, color: `hsl(${hue}, 50%, 65%)` });
      }
    }
    return result;
  });

  readonly highlightCell = computed(() => {
    const cells = this.cells();
    return cells.length > 2 ? cells[cells.length - Math.floor(cells.length / 3)] : null;
  });

  readonly polarIntegral = computed(() => {
    const NR = this.nr(), NT = this.ntheta();
    const dr = 1 / NR, dth = (2 * Math.PI) / NT;
    let sum = 0;
    for (let i = 0; i < NR; i++) {
      const rMid = (i + 0.5) * dr;
      for (let j = 0; j < NT; j++) {
        // f(x,y) = x²+y² = r²
        sum += rMid * rMid * rMid * dr * dth;
      }
    }
    return sum;
  });

  private arcPath(r1: number, r2: number, th1: number, th2: number): string {
    const ax1 = r1 * Math.cos(th1), ay1 = r1 * Math.sin(th1);
    const ax2 = r1 * Math.cos(th2), ay2 = r1 * Math.sin(th2);
    const bx1 = r2 * Math.cos(th1), by1 = r2 * Math.sin(th1);
    const bx2 = r2 * Math.cos(th2), by2 = r2 * Math.sin(th2);
    const large = th2 - th1 > Math.PI ? 1 : 0;
    if (r1 < 1e-6) {
      return `M0,0 L${bx1},${by1} A${r2},${r2} 0 ${large} 1 ${bx2},${by2} Z`;
    }
    return `M${ax1},${ay1} L${bx1},${by1} A${r2},${r2} 0 ${large} 1 ${bx2},${by2} L${ax2},${ay2} A${r1},${r1} 0 ${large} 0 ${ax1},${ay1} Z`;
  }
}
