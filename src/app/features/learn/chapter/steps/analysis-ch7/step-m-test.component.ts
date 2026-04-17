import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { sampleFn } from './analysis-ch7-util';

interface MTestPreset {
  name: string;
  term: (n: number, x: number) => number;
  bound: (n: number) => number;
  xRange: [number, number];
  yRange: [number, number];
  boundLabel: string;
  desc: string;
}

const MT_PRESETS: MTestPreset[] = [
  {
    name: 'Σ sin(nx)/n²',
    term: (n, x) => Math.sin(n * x) / (n * n),
    bound: (n) => 1 / (n * n),
    xRange: [-3.14, 3.14], yRange: [-1.8, 1.8],
    boundLabel: '1/n²',
    desc: '|sin(nx)/n²| ≤ 1/n² = Mₙ。Σ1/n² = π²/6 收斂，故級數均勻且絕對收斂。',
  },
  {
    name: 'Σ cos(nx)/2ⁿ',
    term: (n, x) => Math.cos(n * x) / Math.pow(2, n),
    bound: (n) => 1 / Math.pow(2, n),
    xRange: [-3.14, 3.14], yRange: [-1.2, 1.2],
    boundLabel: '1/2ⁿ',
    desc: '|cos(nx)/2ⁿ| ≤ 1/2ⁿ = Mₙ。Σ1/2ⁿ = 1 收斂，幾何級數壓制使收斂極快。',
  },
];

@Component({
  selector: 'app-step-m-test',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="均勻收斂的判定" subtitle="§7.3">
      <p>
        <strong>Weierstrass M-test</strong>：如果 |fₙ(x)| ≤ Mₙ <strong>對所有 x</strong>，
        而且 ΣMₙ 收斂，那 Σfₙ(x) <strong>均勻且絕對收斂</strong>。
      </p>
      <app-math block [e]="formulaMT"></app-math>
      <p>
        直覺：用一列<strong>跟 x 無關</strong>的常數 Mₙ 來「壓住」fₙ。
        如果常數級數 ΣMₙ 收斂，原級數一定均勻收斂。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 N 觀察：藍色誤差帶隨 N 增大而均勻收窄——這就是 M-test 的威力">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
        <div class="n-ctrl">
          <span class="nl">N = {{ nVal() }}</span>
          <input type="range" min="1" max="30" step="1" [value]="nVal()"
                 (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="0 0 520 240" class="mt-svg">
        <line x1="40" y1="220" x2="500" y2="220" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="220" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" [attr.y1]="fy(0)" x2="500" [attr.y2]="fy(0)"
              stroke="var(--text-muted)" stroke-width="0.5" stroke-dasharray="4 3" />

        <!-- Error band (filled polygon) -->
        <path [attr.d]="bandPath()" fill="var(--accent)" fill-opacity="0.12" stroke="none" />

        <!-- Previous partial sum (faded) -->
        @if (nVal() > 1) {
          <path [attr.d]="prevSumPath()" fill="none" stroke="var(--text-muted)" stroke-width="1" stroke-opacity="0.3" />
        }

        <!-- Current partial sum S_N(x) -->
        <path [attr.d]="curSumPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="bounds-section">
        <div class="bounds-label">常數上界 Mₙ = {{ cur().boundLabel }}（高度隨 n 遞減 → ΣMₙ 收斂）</div>
        <div class="bars-row">
          @for (b of bars(); track $index) {
            <div class="bar" [style.height.px]="b"></div>
          }
        </div>
      </div>

      <div class="info-row">
        <div class="i-card">Mₙ = {{ cur().boundLabel }} = {{ fmtNum(curBoundVal()) }}</div>
        <div class="i-card ok">尾端誤差 ≤ {{ fmtNum(tailVal()) }}</div>
      </div>
      <div class="desc">{{ cur().desc }}</div>
    </app-challenge-card>

    <app-challenge-card prompt="其他例子與 M-test 的限制">
      <div class="examples">
        <div class="ex-card ok">
          <div class="ex-title">✓ 冪級數在收斂半徑內</div>
          <div class="ex-formula">Σ xⁿ/n! on [−R, R]</div>
          <div class="ex-bound">|xⁿ/n!| ≤ Rⁿ/n! = Mₙ，Σ Rⁿ/n! = eᴿ &lt; ∞</div>
        </div>
        <div class="ex-card bad">
          <div class="ex-title">✗ M-test 不適用</div>
          <div class="ex-formula">Σ xⁿ on (−1, 1)</div>
          <div class="ex-bound">sup|xⁿ| = 1（不趨向 0）</div>
          <div class="ex-note">
            在 [−r, r]（r &lt; 1）上均勻收斂，
            但在整個 (−1,1) 上<strong>不</strong>均勻收斂。
          </div>
        </div>
      </div>
      <div class="insight">
        M-test 是最常用的均勻收斂判定法。記住：找到<strong>跟 x 無關的上界 Mₙ</strong>，
        然後檢查 ΣMₙ。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看均勻收斂最重要的應用：<strong>保持連續性</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { width: 120px; accent-color: var(--accent); }
    .mt-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .bounds-section { margin-bottom: 10px; }
    .bounds-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace; }
    .bars-row { display: flex; align-items: flex-end; gap: 2px; height: 40px;
      padding: 4px 8px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .bar { flex: 1; min-width: 3px; background: var(--accent); opacity: 0.6; border-radius: 2px 2px 0 0; }
    .info-row { display: flex; gap: 8px; margin-bottom: 6px; }
    .i-card { flex: 1; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border); background: var(--bg-surface);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
    .desc { font-size: 12px; color: var(--text-secondary); padding: 8px 12px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); margin-bottom: 10px; }
    .examples { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
    .ex-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      &.ok { background: rgba(90,138,90,0.04); border-color: rgba(90,138,90,0.3); }
      &.bad { background: rgba(160,90,90,0.04); border-color: rgba(160,90,90,0.3); } }
    .ex-title { font-size: 13px; font-weight: 700; margin-bottom: 6px;
      .ok & { color: #5a8a5a; } .bad & { color: #a05a5a; } }
    .ex-formula { font-size: 14px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .ex-bound { font-size: 12px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; padding: 4px 10px;
      background: var(--bg); border-radius: 4px; margin: 4px 0; }
    .ex-note { font-size: 12px; color: #a05a5a; margin-top: 4px; strong { font-weight: 700; } }
    .insight { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      strong { color: var(--accent); } }
  `,
})
export class StepMTestComponent {
  readonly formulaMT = String.raw`|f_n(x)| \le M_n \;\forall x, \quad \sum M_n < \infty \;\Longrightarrow\; \sum f_n \;\text{均勻收斂}`;
  readonly presets = MT_PRESETS;
  readonly selIdx = signal(0);
  readonly nVal = signal(5);
  readonly cur = computed(() => MT_PRESETS[this.selIdx()]);

  /* ── cached computeds ── */

  private readonly curPts = computed(() => this.ptsForN(this.nVal()));

  readonly tailVal = computed(() => {
    const c = this.cur();
    const N = this.nVal();
    let s = 0;
    for (let n = N + 1; n <= N + 500; n++) {
      const b = c.bound(n);
      if (b < 1e-15) break;
      s += b;
    }
    return s;
  });

  readonly curBoundVal = computed(() => this.cur().bound(this.nVal()));

  readonly bars = computed(() => {
    const c = this.cur();
    const N = this.nVal();
    const m1 = c.bound(1);
    return Array.from({ length: N }, (_, i) =>
      Math.max(2, Math.pow(c.bound(i + 1) / m1, 0.3) * 36)
    );
  });

  /* ── coordinate helpers ── */

  private fx(x: number): number {
    const [lo, hi] = this.cur().xRange;
    return 40 + ((x - lo) / (hi - lo)) * 460;
  }

  fy(y: number): number {
    const [lo, hi] = this.cur().yRange;
    return 220 - ((y - lo) / (hi - lo)) * 210;
  }

  /* ── path builders ── */

  private ptsForN(N: number): { x: number; y: number }[] {
    const c = this.cur();
    return sampleFn((x) => {
      let s = 0;
      for (let n = 1; n <= N; n++) s += c.term(n, x);
      return s;
    }, c.xRange[0], c.xRange[1], 300);
  }

  curSumPath(): string { return this.buildPath(this.curPts()); }

  prevSumPath(): string { return this.buildPath(this.ptsForN(this.nVal() - 1)); }

  bandPath(): string {
    const pts = this.curPts();
    const t = this.tailVal();
    const [yMin, yMax] = this.cur().yRange;
    const clamp = (y: number) => Math.max(yMin, Math.min(yMax, y));
    const upper = pts.map(p => `${this.fx(p.x)},${this.fy(clamp(p.y + t))}`);
    const lower = [...pts].reverse().map(p => `${this.fx(p.x)},${this.fy(clamp(p.y - t))}`);
    return `M${upper.join('L')}L${lower.join('L')}Z`;
  }

  private buildPath(pts: { x: number; y: number }[]): string {
    return 'M' + pts.map(p => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  /* ── formatting ── */

  fmtNum(v: number): string {
    if (v >= 1) return v.toFixed(2);
    if (v >= 0.001) return v.toFixed(4);
    if (v >= 1e-10) return v.toExponential(2);
    return '≈ 0';
  }
}
