import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-explore-fourier-approx',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="深入探索 A：Fourier 級數逼近" subtitle="§4.8 附錄">
      <p>
        §4.8 說 sup 範數量的是兩個函數的「最壞情況距離」。
        這裡用<strong>Fourier 級數</strong>親手感受——
        Sₙ（部分和）離原函數 f 有多「遠」？
      </p>
    </app-prose-block>

    <app-prose-block subtitle="什麼是 Fourier 逼近？">
      <p>
        任何「合理」的周期函數都可以拆成正弦波的疊加（Ch17 會詳細講）。
        <strong>部分和 Sₙ</strong> 只取前 N 個正弦波——項數越多越接近原函數。
      </p>
      <p>
        問題是：「接近」有不同的含義——
      </p>
      <ul>
        <li><strong>sup 範數</strong>（Ch4.8）：最大偏差。方波的 Gibbs 現象讓 sup 距離<strong>永遠 ≈ 9%</strong>！</li>
        <li><strong>L² 範數</strong>（Ch11）：平方平均。L² 距離確實趨向 0。</li>
      </ul>
      <p>
        <strong>同一個逼近，用不同的「距離」衡量，得出不同結論。</strong>
        這就是 §4.8 說「函數空間上的距離選擇很重要」的意思。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="方波的 Fourier 部分和：拖 N 看 sup 距離 vs L² 距離">
      <div class="ctrl-row">
        <span class="cl">N = {{ N() }}</span>
        <input type="range" min="1" max="40" step="1" [value]="N()"
               (input)="N.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 520 250" class="four-svg">
        <line x1="50" y1="200" x2="490" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="270" y1="20" x2="270" y2="200" stroke="var(--border)" stroke-width="0.3" />

        <!-- Square wave (dashed) -->
        <path [attr.d]="squarePath()" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="5 3" />

        <!-- Fourier partial sum -->
        <path [attr.d]="fourierPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Max gap line -->
        <line [attr.x1]="fxAt(gapX())" [attr.y1]="fy4(squareWave(gapX()))"
              [attr.x2]="fxAt(gapX())" [attr.y2]="fy4(fourierSum(gapX()))"
              stroke="#a05a5a" stroke-width="2" />
      </svg>

      <div class="result-row">
        <div class="r-card sup-bg">
          <span class="r-label">||f − Sₙ||∞ (sup)</span>
          <span class="r-val">{{ supDist().toFixed(4) }}</span>
          <span class="r-note">{{ N() > 20 ? '≈ 0.09（Gibbs 天花板！）' : '在下降...' }}</span>
        </div>
        <div class="r-card l2-bg">
          <span class="r-label">||f − Sₙ||₂ (L²)</span>
          <span class="r-val">{{ l2Dist().toFixed(4) }}</span>
          <span class="r-note">→ 0 ✓</span>
        </div>
      </div>

      <div class="insight">
        <strong>同一個逼近，兩種距離，兩個結論：</strong><br>
        L² 距離 → 0（能量意義上越來越好），
        但 sup 距離卡在 ≈ 0.09（不連續點的「尖角」永遠消不掉）。<br>
        這就是為什麼「選哪種範數」不是小事。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        想深入？Ch17 完整展開 Fourier 分析，包括 Gibbs 現象、Parseval 等式、收斂定理。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 15px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .sl { flex: 1; accent-color: var(--accent); height: 22px; }
    .four-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 10px; margin-bottom: 10px; }
    .r-card { flex: 1; padding: 12px; border-radius: 8px; text-align: center;
      border: 1px solid var(--border); background: var(--bg-surface);
      &.sup-bg { background: rgba(160,90,90,0.05); border-color: rgba(160,90,90,0.2); }
      &.l2-bg { background: rgba(90,138,90,0.05); border-color: rgba(90,138,90,0.2); } }
    .r-label { font-size: 11px; color: var(--text-muted); display: block; font-family: 'JetBrains Mono', monospace; }
    .r-val { font-size: 18px; font-weight: 700; color: var(--accent); display: block;
      font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .r-note { font-size: 10px; color: var(--text-muted); }
    .insight { padding: 12px; border-radius: 8px; background: var(--accent-10); border: 1px solid var(--accent);
      font-size: 12px; color: var(--text-muted); text-align: center; line-height: 1.8; }
    .insight strong { color: var(--accent); }
  `,
})
export class StepExploreFourierApproxComponent {
  readonly N = signal(5);

  squareWave(x: number): number {
    const xn = ((x % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    return xn >= 0 ? 1 : -1;
  }

  fourierSum(x: number): number {
    let sum = 0;
    for (let k = 0; k < this.N(); k++) {
      const n = 2 * k + 1; // odd harmonics only
      sum += (4 / (Math.PI * n)) * Math.sin(n * x);
    }
    return sum;
  }

  fxAt(x: number): number { return 50 + ((x + Math.PI) / (2 * Math.PI)) * 440; }
  fy4(y: number): number { return 200 - ((y + 1.3) / 2.6) * 180; }

  squarePath(): string {
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 400;
      const y = this.squareWave(x);
      const jump = i > 0 && Math.abs(y - this.squareWave(-Math.PI + (2 * Math.PI * (i - 1)) / 400)) > 1;
      path += (i === 0 || jump ? 'M' : 'L') + `${this.fxAt(x).toFixed(1)},${this.fy4(y).toFixed(1)}`;
    }
    return path;
  }

  fourierPath(): string {
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 400;
      path += (i === 0 ? 'M' : 'L') + `${this.fxAt(x).toFixed(1)},${this.fy4(this.fourierSum(x)).toFixed(1)}`;
    }
    return path;
  }

  readonly gapX = computed(() => {
    let mx = 0, mxX = 0;
    for (let i = 1; i < 400; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 400;
      const gap = Math.abs(this.squareWave(x) - this.fourierSum(x));
      if (gap > mx) { mx = gap; mxX = x; }
    }
    return mxX;
  });

  readonly supDist = computed(() => {
    let mx = 0;
    for (let i = 0; i <= 500; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 500;
      mx = Math.max(mx, Math.abs(this.squareWave(x) - this.fourierSum(x)));
    }
    return mx;
  });

  readonly l2Dist = computed(() => {
    let sum = 0;
    const steps = 500;
    const dx = (2 * Math.PI) / steps;
    for (let i = 0; i < steps; i++) {
      const x = -Math.PI + (i + 0.5) * dx;
      const d = this.squareWave(x) - this.fourierSum(x);
      sum += d * d * dx;
    }
    return Math.sqrt(sum / (2 * Math.PI));
  });
}
