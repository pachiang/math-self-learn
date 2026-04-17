import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { sampleFn, supNorm } from './analysis-ch7-util';

/* ── Main ε-tube modes ── */

interface UCMode {
  key: string;
  label: string;
  fn: (n: number, x: number) => number;
  limit: (x: number) => number;
  xRange: [number, number];
  yRange: [number, number];
  isUniform: boolean;
}

const UC_MODES: UCMode[] = [
  {
    key: 'uniform', label: '均勻收斂：sin(x)/n',
    fn: (n, x) => Math.sin(x) / n, limit: () => 0,
    xRange: [-3.14, 3.14], yRange: [-1.15, 1.15],
    isUniform: true,
  },
  {
    key: 'pointwise', label: '僅逐點：xⁿ',
    fn: (n, x) => Math.pow(x, n), limit: (x) => x < 1 ? 0 : 1,
    xRange: [0, 1], yRange: [-0.2, 1.1],
    isUniform: false,
  },
];

/* ── Domain comparison presets ── */

interface DomainPreset { label: string; xRange: [number, number]; }

const DOM_PRESETS: DomainPreset[] = [
  { label: '[0, 1]', xRange: [0, 1] },
  { label: '[0, 5]', xRange: [0, 5] },
  { label: '[0, 20]', xRange: [0, 20] },
];

@Component({
  selector: 'app-step-uniform-convergence',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="均勻收斂" subtitle="§7.2">
      <p>
        <strong>均勻收斂</strong>把 ε 的要求從「每個 x 一個 N」提升到「一個 N 管所有 x」：
      </p>
      <app-math block [e]="formula"></app-math>
      <p>
        等價於：<strong>sup|fₙ(x) − f(x)| → 0</strong>（sup 範數趨向 0）。
      </p>
      <p>
        幾何意義：fₙ 最終完全落在 f 的 <strong>ε-管子</strong> 裡面。
        不是每個點各自落入，而是<strong>整條曲線</strong>都在管子裡。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="ε-管子視覺化：均勻收斂 = 整條曲線鑽進管子">
      <div class="ctrl-row">
        @for (m of modes; track m.key; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ m.label }}</button>
        }
        <div class="n-ctrl">
          <span class="nl">n = {{ nVal() }}</span>
          <input type="range" min="1" max="30" step="1" [value]="nVal()"
                 (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="0 0 520 240" class="uc-svg">
        <line x1="40" y1="220" x2="500" y2="220" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="220" stroke="var(--border)" stroke-width="0.8" />

        <!-- Zero reference line -->
        <line x1="40" [attr.y1]="fy(0)" x2="500" [attr.y2]="fy(0)"
              stroke="var(--text-muted)" stroke-width="0.5" stroke-dasharray="4 3" />

        <!-- ε-tube (shaded area + edges) -->
        <path [attr.d]="tubeAreaPath()" fill="var(--accent)" fill-opacity="0.06" />
        <path [attr.d]="tubeEdgePath(1)" fill="none" stroke="var(--accent)" stroke-width="0.8" stroke-opacity="0.3" />
        <path [attr.d]="tubeEdgePath(-1)" fill="none" stroke="var(--accent)" stroke-width="0.8" stroke-opacity="0.3" />

        <!-- Limit function (dashed green) -->
        <path [attr.d]="limitPath()" fill="none" stroke="#5a8a5a" stroke-width="2" stroke-dasharray="5 3" />

        <!-- Current fₙ -->
        <path [attr.d]="fnPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">‖fₙ − f‖_sup = {{ supNormVal().toFixed(4) }}</div>
        <div class="r-card" [class.ok]="inTube()" [class.bad]="!inTube()">
          {{ inTube() ? '在 ε-管子裡 ✓' : '超出管子 ✗' }}
        </div>
        <div class="r-card">ε = {{ eps }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        sin(x)/n 的 sup 範數 = 1/n → 0：因為 |sin x| ≤ 1 是<strong>有界函數</strong>，
        除以 n 後整條曲線同步被壓入管子——這就是均勻收斂。
      </p>
      <p>
        xⁿ 的 sup 範數 = 1（永遠不趨向 0）：在 x = 1 附近，
        曲線永遠「伸出」管子外——只是逐點收斂。
      </p>
    </app-prose-block>

    <!-- ── Supplementary: Domain comparison ── -->

    <app-prose-block title="補充：定義域的角色" subtitle="同一個 x/n，定義域如何影響均勻收斂？">
      <p>
        x/n 逐點收斂到 0。在 [0, 1] 上，sup|x/n| = 1/n → 0，是均勻收斂。
        但如果把定義域放大，sup 隨之增大——定義域越大，
        需要越大的 n 才能讓整條曲線鑽進 ε-管子。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="切換定義域，觀察同一個 x/n 需要多大的 n 才能進管子">
      <div class="ctrl-row">
        @for (d of domPresets; track d.label; let i = $index) {
          <button class="pre-btn" [class.active]="domIdx() === i" (click)="domIdx.set(i)">x/n on {{ d.label }}</button>
        }
        <div class="n-ctrl">
          <span class="nl">n = {{ domN() }}</span>
          <input type="range" min="1" max="50" step="1" [value]="domN()"
                 (input)="domN.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="0 0 520 240" class="uc-svg">
        <line x1="40" y1="220" x2="500" y2="220" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="220" stroke="var(--border)" stroke-width="0.8" />

        <!-- ε-tube (rectangle) -->
        <rect [attr.x]="40" [attr.y]="domFy(eps)" [attr.width]="460"
              [attr.height]="domFy(-eps) - domFy(eps)"
              fill="var(--accent)" fill-opacity="0.06" />
        <line x1="40" [attr.y1]="domFy(eps)" x2="500" [attr.y2]="domFy(eps)"
              stroke="var(--accent)" stroke-width="0.8" stroke-opacity="0.3" />
        <line x1="40" [attr.y1]="domFy(-eps)" x2="500" [attr.y2]="domFy(-eps)"
              stroke="var(--accent)" stroke-width="0.8" stroke-opacity="0.3" />

        <!-- Limit f(x) = 0 (dashed green) -->
        <line x1="40" [attr.y1]="domFy(0)" x2="500" [attr.y2]="domFy(0)"
              stroke="#5a8a5a" stroke-width="2" stroke-dasharray="5 3" />

        <!-- f_n(x) = x/n -->
        <path [attr.d]="domFnPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">sup = {{ curDom().xRange[1] }}/{{ domN() }} = {{ domSupStr() }}</div>
        <div class="r-card" [class.ok]="domInTube()" [class.bad]="!domInTube()">
          {{ domInTube() ? '在管子裡 ✓' : '超出管子 ✗' }}
        </div>
        <div class="r-card">需 n ≥ {{ nNeeded() }}</div>
      </div>

      <div class="dom-note">
        定義域越大，需要越大的 n 才能讓整條曲線進入管子。
        若定義域為 ℝ，則 sup|x/n| = ∞ 對所有 n——<strong>永遠無法均勻收斂</strong>。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看怎麼<strong>判定</strong>均勻收斂——<strong>Weierstrass M-test</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { width: 120px; accent-color: var(--accent); }
    .uc-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .r-card { flex: 1; min-width: 80px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
    .dom-note { font-size: 12px; color: var(--text-secondary); padding: 10px 12px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border);
      margin-top: 8px; strong { color: #a05a5a; } }
  `,
})
export class StepUniformConvergenceComponent {
  readonly formula = String.raw`f_n \to f \;\text{均勻收斂} \;\Longleftrightarrow\; \forall\varepsilon>0,\;\exists N,\;\forall n>N,\; {\color{#c06060}\forall x}:\;|f_n(x)-f(x)|<\varepsilon`;
  readonly modes = UC_MODES;
  readonly selIdx = signal(0);
  readonly nVal = signal(5);
  readonly eps = 0.15;
  readonly cur = computed(() => UC_MODES[this.selIdx()]);

  /* ── Main chart computeds ── */

  readonly supNormVal = computed(() => {
    const c = this.cur();
    const n = this.nVal();
    return supNorm((x) => c.fn(n, x), (x) => c.limit(x), c.xRange[0], c.xRange[1]);
  });

  readonly inTube = computed(() => this.supNormVal() < this.eps);

  /* ── Main chart coordinates ── */

  private fx(x: number): number {
    const [lo, hi] = this.cur().xRange;
    return 40 + ((x - lo) / (hi - lo)) * 460;
  }

  fy(y: number): number {
    const [lo, hi] = this.cur().yRange;
    return 220 - ((y - lo) / (hi - lo)) * 210;
  }

  /* ── Main chart paths ── */

  fnPath(): string {
    const c = this.cur();
    const n = this.nVal();
    const pts = sampleFn((x) => c.fn(n, x), c.xRange[0], c.xRange[1], 300);
    return 'M' + pts.map(p => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  limitPath(): string {
    const c = this.cur();
    if (c.isUniform) {
      return `M${this.fx(c.xRange[0])},${this.fy(0)}L${this.fx(c.xRange[1])},${this.fy(0)}`;
    }
    return `M${this.fx(0)},${this.fy(0)}L${this.fx(0.99)},${this.fy(0)}M${this.fx(1)},${this.fy(1)}`;
  }

  tubeAreaPath(): string {
    const c = this.cur();
    const xEnd = c.isUniform ? c.xRange[1] : 0.99;
    const upper = sampleFn((x) => c.limit(x) + this.eps, c.xRange[0], xEnd, 100);
    const lower = sampleFn((x) => c.limit(x) - this.eps, c.xRange[0], xEnd, 100);
    const u = upper.map(p => `${this.fx(p.x)},${this.fy(p.y)}`);
    const l = [...lower].reverse().map(p => `${this.fx(p.x)},${this.fy(p.y)}`);
    return `M${u.join('L')}L${l.join('L')}Z`;
  }

  tubeEdgePath(sign: number): string {
    const c = this.cur();
    const xEnd = c.isUniform ? c.xRange[1] : 0.99;
    const pts = sampleFn((x) => c.limit(x) + sign * this.eps, c.xRange[0], xEnd, 100);
    return 'M' + pts.map(p => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  /* ══════════════════════════════════════════════
     Domain comparison (supplementary section)
     ══════════════════════════════════════════════ */

  readonly domPresets = DOM_PRESETS;
  readonly domIdx = signal(0);
  readonly domN = signal(5);
  readonly curDom = computed(() => DOM_PRESETS[this.domIdx()]);

  private readonly domYRange: [number, number] = [-0.3, 1.5];

  readonly domSupNorm = computed(() => this.curDom().xRange[1] / this.domN());
  readonly domInTube = computed(() => this.domSupNorm() < this.eps);
  readonly nNeeded = computed(() => Math.ceil(this.curDom().xRange[1] / this.eps));

  /* ── Domain chart coordinates ── */

  private domFx(x: number): number {
    const [lo, hi] = this.curDom().xRange;
    return 40 + ((x - lo) / (hi - lo)) * 460;
  }

  domFy(y: number): number {
    const [lo, hi] = this.domYRange;
    return 220 - ((y - lo) / (hi - lo)) * 210;
  }

  /* ── Domain chart paths ── */

  domFnPath(): string {
    const dom = this.curDom();
    const n = this.domN();
    const yCeil = this.domYRange[1];
    const pts = sampleFn((x) => x / n, dom.xRange[0], dom.xRange[1], 300);
    const coords: string[] = [];
    for (const p of pts) {
      coords.push(`${this.domFx(p.x)},${this.domFy(p.y)}`);
      if (p.y > yCeil) break;
    }
    return 'M' + coords.join('L');
  }

  domSupStr(): string {
    const v = this.domSupNorm();
    if (v >= 10) return v.toFixed(1);
    if (v >= 1) return v.toFixed(2);
    return v.toFixed(4);
  }
}
