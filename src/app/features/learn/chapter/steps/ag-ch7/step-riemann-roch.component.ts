import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Riemann-Roch computation for a generic curve ── */

interface RRResult {
  lD: number;
  lKD: number;
  rhs: number;
  degK: number;
  degKD: number;
}

function computeRR(degD: number, g: number): RRResult {
  const degK = 2 * g - 2;
  const degKD = degK - degD;
  const rhs = degD - g + 1;

  // Case 1: degD < 0 => l(D) = 0
  if (degD < 0) {
    return { lD: 0, lKD: Math.max(0, -rhs), rhs, degK, degKD };
  }

  // Case 2: degD > 2g-2 => l(K-D) = 0 (K-D has negative degree)
  if (degD > degK) {
    return { lD: rhs, lKD: 0, rhs, degK, degKD };
  }

  // Case 3: 0 <= degD <= 2g-2
  // For a GENERIC curve, use the symmetry of Riemann-Roch.
  // Generic curve: l(D) = max(0, degD - g + 1) when D is general position,
  // except l(0) = 1 always and l(K) = g always.
  // We use: l(K-D) via the same generic logic applied to the divisor K-D.
  if (degD === 0) {
    // l(0) = 1 always
    const lD = 1;
    const lKD = lD - rhs; // = 1 - (0 - g + 1) = g
    return { lD, lKD: Math.max(0, lKD), rhs, degK, degKD };
  }
  if (degD === degK) {
    // D has same degree as K => by Serre duality mirror of D=0 case
    // l(K) = g, l(K - K) = l(0) = 1
    const lD = g;
    const lKD = 1;
    return { lD, lKD, rhs, degK, degKD };
  }

  // Generic divisor: for 1 <= degD <= g-1, generic l(D) = 0
  // (Brill-Noether: generic curve, generic D of degree d < g => l(D) = 0 if d < g)
  // Actually for generic D: l(D) = max(1, degD - g + 1) if D effective of small degree
  // Simplification for the interactive:
  if (degD > 0 && degD < g) {
    // generic D of degree < g: l(D) = 1 for effective D on a generic curve
    // but for truly generic D with small degree, l(D) could be 1
    // We use l(D) = 1 for 0 < degD < g (generic effective divisor)
    const lD = 1;
    const lKD = lD - rhs;
    return { lD, lKD: Math.max(0, lKD), rhs, degK, degKD };
  }

  if (degD >= g && degD <= degK) {
    // degD >= g: l(D) = degD - g + 1 for generic D
    const lD = degD - g + 1;
    const lKD = lD - rhs;
    return { lD: Math.max(0, lD), lKD: Math.max(0, lKD), rhs, degK, degKD };
  }

  // fallback
  const lKD = degKD < 0 ? 0 : Math.max(0, degKD - g + 1);
  const lD = rhs + lKD;
  return { lD: Math.max(0, lD), lKD: Math.max(0, lKD), rhs, degK, degKD };
}

@Component({
  selector: 'app-step-ag-riemann-roch',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Riemann-Roch 定理" subtitle="&sect;7.6">
      <p>
        Riemann-Roch 定理回答了代數曲線理論中<strong>最根本的問題</strong>：
        給定一條虧格為 <app-math e="g" /> 的光滑曲線 <app-math e="C" /> 上的因子
        <app-math e="D" />，截面空間的維度
        <app-math e="l(D) = \\dim L(D)" /> 是多少？
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        公式需要一個關鍵角色：<strong>典範因子</strong>
        <app-math e="K" />（canonical divisor）——微分形式在曲線上的因子。
        關於 <app-math e="K" /> 的核心事實：
      </p>
      <ul>
        <li><app-math e="\\deg(K) = 2g - 2" /></li>
        <li>
          在 <app-math e="\\mathbb{P}^1" />（<app-math e="g=0" />）上：
          <app-math e="\\deg(K) = -2" />
        </li>
        <li>
          在橢圓曲線（<app-math e="g=1" />）上：
          <app-math e="\\deg(K) = 0" />
        </li>
        <li>
          在虧格 2 曲線上：
          <app-math e="\\deg(K) = 2" />
        </li>
      </ul>
      <app-math block [e]="formulaCanonDeg"></app-math>
    </app-prose-block>

    <app-prose-block>
      <p><strong>Riemann-Roch 定理</strong>陳述如下：</p>
      <app-math block [e]="formulaRR"></app-math>
      <p>其中：</p>
      <ul>
        <li>
          <app-math e="l(D) = \\dim L(D)" />：因子
          <app-math e="D" /> 的截面空間維度（我們要計算的量）
        </li>
        <li>
          <app-math e="l(K - D)" />：「對偶」空間的維度（當
          <app-math e="\\deg(D)" /> 足夠大時為 0）
        </li>
        <li>
          <app-math e="\\deg(D)" />：因子的度數
        </li>
        <li>
          <app-math e="g" />：曲線的虧格
        </li>
      </ul>
    </app-prose-block>

    <app-prose-block>
      <p>
        當 <app-math e="\\deg(D) > 2g - 2" />（即
        <app-math e="\\deg(D) > \\deg(K)" />）時，對偶項
        <app-math e="l(K - D) = 0" />（因為
        <app-math e="K - D" /> 的度數為負）。此時公式簡化為：
      </p>
      <app-math block [e]="formulaEasyCase"></app-math>
      <p>
        這是「容易」的情形——但已經非常強大。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        驗證特殊情形：
      </p>
      <ul>
        <li>
          在 <app-math e="\\mathbb{P}^1" />（<app-math e="g = 0" />）上：
          <app-math e="l(D) = \\deg(D) + 1" />（對
          <app-math e="\\deg(D) \\geq 0" />），
          和 &sect;7.5 的結論一致。
        </li>
        <li>
          取 <app-math e="D = K" />：
          <app-math e="l(K) - l(0) = (2g-2) - g + 1 = g - 1" />，
          而 <app-math e="l(0) = 1" />（常數函數），
          所以 <app-math e="l(K) = g" />。
        </li>
        <li>
          取 <app-math e="D = 0" />：
          <app-math e="l(0) - l(K) = 0 - g + 1 = 1 - g" />，
          確認 <app-math e="l(0) = 1" /> 且 <app-math e="l(K) = g" />。
        </li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="Riemann-Roch 互動計算器——調整 deg(D) 和虧格 g，即時計算 l(D)">
      <!-- Sliders -->
      <div class="slider-row">
        <div class="slider-group">
          <span class="sl-label">g = {{ genus() }}</span>
          <input type="range" min="0" max="5" step="1"
                 [value]="genus()"
                 (input)="genus.set(+($any($event.target)).value)"
                 class="sl-input" />
        </div>
        <div class="slider-group">
          <span class="sl-label">deg(D) = {{ degD() }}</span>
          <input type="range" min="-3" max="10" step="1"
                 [value]="degD()"
                 (input)="degD.set(+($any($event.target)).value)"
                 class="sl-input" />
        </div>
      </div>

      <!-- Panel 1: Formula with values -->
      <div class="formula-panel">
        <div class="fp-title">Riemann-Roch 代入計算</div>
        <app-math block [e]="formulaSubstituted()"></app-math>
        <div class="fp-result">
          <app-math [e]="formulaResult()"></app-math>
        </div>
      </div>

      <!-- Panel 2: l(D) vs deg(D) chart -->
      <svg [attr.viewBox]="'0 0 ' + chartV.svgW + ' ' + chartV.svgH" class="plot-svg">
        <!-- background grid -->
        @for (tick of xTicks; track tick) {
          <line [attr.x1]="chartX(tick)" [attr.y1]="chartV.pad"
                [attr.x2]="chartX(tick)" [attr.y2]="chartV.svgH - chartV.pad"
                stroke="var(--border)" stroke-width="0.3" />
          <text [attr.x]="chartX(tick)" [attr.y]="chartV.svgH - chartV.pad + 14"
                text-anchor="middle" class="ax-label">{{ tick }}</text>
        }
        @for (tick of yTicks; track tick) {
          <line [attr.x1]="chartV.pad" [attr.y1]="chartY(tick)"
                [attr.x2]="chartV.svgW - chartV.pad" [attr.y2]="chartY(tick)"
                stroke="var(--border)" stroke-width="0.3" />
          <text [attr.x]="chartV.pad - 6" [attr.y]="chartY(tick) + 4"
                text-anchor="end" class="ax-label">{{ tick }}</text>
        }

        <!-- axes -->
        <path [attr.d]="chartAxesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- axis labels -->
        <text [attr.x]="chartV.svgW / 2" [attr.y]="chartV.svgH - 2"
              text-anchor="middle" class="ax-title">deg(D)</text>
        <text x="8" y="150" text-anchor="middle"
              class="ax-title" transform="rotate(-90, 8, 150)">l(D)</text>

        <!-- threshold markers -->
        @if (genus() > 0) {
          <!-- deg = 2g-2 marker -->
          <line [attr.x1]="chartX(rr().degK)" y1="30"
                [attr.x2]="chartX(rr().degK)" [attr.y2]="chartV.svgH - chartV.pad"
                stroke="#aa5a6a" stroke-width="1" stroke-dasharray="4 3" />
          <text [attr.x]="chartX(rr().degK)" y="24"
                text-anchor="middle" class="threshold-label" fill="#aa5a6a">
            deg K = {{ rr().degK }}
          </text>

          <!-- deg = 2g-1 marker -->
          <line [attr.x1]="chartX(2 * genus() - 1)" y1="30"
                [attr.x2]="chartX(2 * genus() - 1)" [attr.y2]="chartV.svgH - chartV.pad"
                stroke="#5a8a5a" stroke-width="1" stroke-dasharray="4 3" />
          <text [attr.x]="chartX(2 * genus() - 1) + 2" y="40"
                text-anchor="start" class="threshold-label" fill="#5a8a5a">
            {{ 2 * genus() - 1 }}
          </text>
        }

        <!-- l(D) line for current genus -->
        <path [attr.d]="ldPath()" fill="none" stroke="var(--accent)" stroke-width="2.2"
              stroke-linecap="round" stroke-linejoin="round" />

        <!-- data points -->
        @for (pt of ldPoints(); track pt.d) {
          <circle [attr.cx]="chartX(pt.d)" [attr.cy]="chartY(pt.l)" r="3"
                  fill="var(--accent)" fill-opacity="0.7" />
        }

        <!-- current position indicator -->
        <line [attr.x1]="chartX(degD())" [attr.y1]="chartV.pad"
              [attr.x2]="chartX(degD())" [attr.y2]="chartV.svgH - chartV.pad"
              stroke="var(--accent)" stroke-width="1.5" stroke-opacity="0.35" />
        <circle [attr.cx]="chartX(degD())" [attr.cy]="chartY(rr().lD)"
                r="6" fill="var(--accent)" stroke="#fff" stroke-width="2" />
        <text [attr.x]="chartX(degD()) + 10" [attr.y]="chartY(rr().lD) + 4"
              class="cur-label" fill="var(--accent)">
          l(D) = {{ rr().lD }}
        </text>
      </svg>

      <!-- Panel 3: info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">虧格</div>
          <div class="ic-body mono">g = {{ genus() }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">deg(D)</div>
          <div class="ic-body mono">{{ degD() }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">deg(K) = 2g - 2</div>
          <div class="ic-body mono">{{ rr().degK }}</div>
        </div>
        <div class="info-card highlight-card">
          <div class="ic-title">l(D)</div>
          <div class="ic-body mono ld-value">{{ rr().lD }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">l(K - D)</div>
          <div class="ic-body mono">{{ rr().lKD }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Riemann-Roch 定理是代數曲線理論的核心。它將拓撲（虧格
        <app-math e="g" />）、代數（因子 <app-math e="D" /> 的度數）和線性代數
        （截面空間的維度）統一在一個公式中。下一節看它的應用。
      </p>
    </app-prose-block>
  `,
  styles: `
    .slider-row {
      display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .slider-group {
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 160px;
    }
    .sl-label {
      font-size: 12px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 110px;
    }
    .sl-input { flex: 1; accent-color: var(--accent); }

    .formula-panel {
      padding: 14px 16px; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface);
    }
    .fp-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
    }
    .fp-result {
      margin-top: 10px; padding: 8px 12px;
      border-radius: 8px;
      background: rgba(102,170,255,0.08);
      border: 1px solid rgba(102,170,255,0.2);
      text-align: center;
    }

    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .ax-label {
      font-size: 9px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .ax-title {
      font-size: 10px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .threshold-label {
      font-size: 8px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    .cur-label {
      font-size: 11px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .info-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 80px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
    }
    .ic-body {
      font-size: 13px; font-weight: 600; color: var(--text);
    }
    .ic-body.mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .highlight-card {
      border-color: var(--accent);
      background: rgba(102,170,255,0.06);
    }
    .ld-value {
      font-size: 22px; color: var(--accent);
    }
  `,
})
export class StepAgRiemannRochComponent {
  /* ── Static formulae ── */

  readonly formulaCanonDeg = `\\deg(K) = 2g - 2`;

  readonly formulaRR =
    `\\boxed{\\;l(D) - l(K - D) = \\deg(D) - g + 1\\;}`;

  readonly formulaEasyCase =
    `\\deg(D) > 2g - 2 \\;\\Longrightarrow\\; l(D) = \\deg(D) - g + 1`;

  /* ── Interactive state ── */

  readonly genus = signal(1);
  readonly degD = signal(3);

  /* ── Riemann-Roch computation ── */

  readonly rr = computed(() => computeRR(this.degD(), this.genus()));

  /* ── Dynamic KaTeX formulae ── */

  readonly formulaSubstituted = computed(() => {
    const { lKD, rhs } = this.rr();
    const g = this.genus();
    const d = this.degD();
    return `l(D) - l(K - D) = \\deg(D) - g + 1`
      + `\\\\[4pt]`
      + `l(D) - ${lKD} = ${d} - ${g} + 1 = ${rhs}`;
  });

  readonly formulaResult = computed(() => {
    const { lD, lKD } = this.rr();
    if (lKD === 0) {
      return `l(K - D) = 0 \\;\\Longrightarrow\\; \\boxed{\\,l(D) = ${lD}\\,}`;
    }
    return `l(K - D) = ${lKD} \\;\\Longrightarrow\\; \\boxed{\\,l(D) = ${lD}\\,}`;
  });

  /* ── Chart view ── */

  readonly chartV: PlotView = {
    xRange: [-3, 10], yRange: [-0.5, 9],
    svgW: 520, svgH: 300, pad: 36,
  };
  readonly chartAxesPath = plotAxesPath(this.chartV);

  chartX = (x: number) => plotToSvgX(this.chartV, x);
  chartY = (y: number) => plotToSvgY(this.chartV, y);

  readonly xTicks = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly yTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  /* ── l(D) data points for current genus ── */

  readonly ldPoints = computed(() => {
    const g = this.genus();
    const pts: { d: number; l: number }[] = [];
    for (let d = -3; d <= 10; d++) {
      const { lD } = computeRR(d, g);
      pts.push({ d, l: lD });
    }
    return pts;
  });

  readonly ldPath = computed(() => {
    const pts = this.ldPoints();
    let d = '';
    for (let i = 0; i < pts.length; i++) {
      const sx = this.chartX(pts[i].d);
      const sy = this.chartY(pts[i].l);
      d += (i === 0 ? 'M' : 'L') + sx.toFixed(1) + ',' + sy.toFixed(1);
    }
    return d;
  });
}
