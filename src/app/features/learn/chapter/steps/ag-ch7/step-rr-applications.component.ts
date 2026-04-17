import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Curve presets by degree ── */

interface CurvePreset {
  degree: number;
  genus: number;
  label: string;
  f: (x: number, y: number) => number;
}

const CURVE_PRESETS: CurvePreset[] = [
  {
    degree: 1, genus: 0, label: '直線',
    f: (x, y) => y - x,
  },
  {
    degree: 2, genus: 0, label: '圓錐曲線',
    f: (x, y) => x * x + y * y - 1,
  },
  {
    degree: 3, genus: 1, label: '橢圓曲線',
    f: (x, y) => y * y - (x * x * x - x + 0.5),
  },
  {
    degree: 4, genus: 3, label: '四次曲線',
    f: (x, y) => x * x * x * x + y * y * y * y - 1,
  },
  {
    degree: 5, genus: 6, label: 'Fermat 五次',
    f: (x, y) => Math.pow(x, 5) + Math.pow(y, 5) - 1,
  },
  {
    degree: 6, genus: 10, label: 'Fermat 六次',
    f: (x, y) => Math.pow(x, 6) + Math.pow(y, 6) - 1,
  },
];

/* ── Classification table data ── */

interface ClassRow {
  g: number;
  name: string;
  example: string;
  rationalPoints: string;
  embedding: string;
  color: string;
}

const CLASS_TABLE: ClassRow[] = [
  { g: 0, name: '有理曲線', example: 'P^1, 圓錐曲線', rationalPoints: '無窮多（或零）', embedding: 'P^1', color: '#5a9fd4' },
  { g: 1, name: '橢圓曲線', example: 'y^2=x^3+ax+b', rationalPoints: '有限生成 (Mordell-Weil)', embedding: 'P^2 (平面三次)', color: '#6ab04c' },
  { g: 2, name: '超橢圓', example: 'y^2 = f_6(x)', rationalPoints: '有限 (Faltings)', embedding: 'P^4', color: '#e17055' },
  { g: 3, name: '平面四次', example: 'degree 4 smooth', rationalPoints: '有限 (Faltings)', embedding: 'P^3 (canonical)', color: '#a29bfe' },
  { g: 4, name: 'degree 5 ...', example: 'Intersection of quadrics', rationalPoints: '有限 (Faltings)', embedding: 'P^4', color: '#fd79a8' },
];

@Component({
  selector: 'app-step-rr-applications',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Riemann-Roch 的應用" subtitle="&sect;7.7">
      <p>
        <strong>應用 1：嵌入。</strong>
        Riemann-Roch 告訴我們曲線何時能嵌入射影空間。若
        <app-math e="l(D) = n + 1" /> 且
        <app-math e="D" /> 是「非常充足」(very ample) 的，則
        <app-math e="D" /> 給出嵌入
        <app-math e="C \\hookrightarrow \\mathbb{P}^n" />。
      </p>
      <p>
        具體地：任何 <app-math e="\\deg(D) \\geq 2g + 1" /> 的因子都是
        very ample，因此 <app-math e="C" /> 嵌入到
        <app-math e="\\mathbb{P}^{\\deg(D) - g}" /> 中。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        <strong>應用 2：虧格公式。</strong>
        對於一條 <app-math e="\\mathbb{P}^2" /> 中次數為
        <app-math e="d" /> 的光滑平面曲線：
      </p>
      <app-math block [e]="formulaGenus"></app-math>
      <ul>
        <li><app-math e="d = 1" />（直線）：<app-math e="g = 0" /></li>
        <li><app-math e="d = 2" />（圓錐曲線）：<app-math e="g = 0" /></li>
        <li><app-math e="d = 3" />（三次曲線）：<app-math e="g = 1" />（橢圓曲線！）</li>
        <li><app-math e="d = 4" />（四次曲線）：<app-math e="g = 3" /></li>
      </ul>
    </app-prose-block>

    <app-prose-block>
      <p>
        <strong>應用 3：曲線按虧格分類。</strong>
      </p>
      <ul>
        <li>
          <app-math e="g = 0" />：曲線同構於
          <app-math e="\\mathbb{P}^1" />（有理曲線）。所有圓錐曲線都是有理的。
        </li>
        <li>
          <app-math e="g = 1" />：橢圓曲線——第三章的主題！它們有豐富的算術結構。
        </li>
        <li>
          <app-math e="g \\geq 2" />：「一般型」曲線。
          <strong>Faltings 定理</strong>（1983，Fields 獎）：
          有理點只有<strong>有限</strong>多個！
        </li>
      </ul>
    </app-prose-block>

    <app-prose-block>
      <p>
        <strong>應用 4：Riemann-Hurwitz 公式。</strong>
        對於曲線之間的映射 <app-math e="f: C \\to D" />：
      </p>
      <app-math block [e]="formulaRH"></app-math>
      <p>
        其中 <app-math e="R" /> 是總分歧度。這個公式約束了哪些映射可以存在。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="探索虧格如何決定曲線的性質——從有理曲線到 Faltings 定理">
      <!-- Classification table -->
      <div class="class-table-wrap">
        <table class="class-table">
          <thead>
            <tr>
              <th>g</th>
              <th>名稱</th>
              <th>例子</th>
              <th>有理點</th>
              <th>嵌入</th>
            </tr>
          </thead>
          <tbody>
            @for (row of classTable; track row.g) {
              <tr [style.border-left]="'3px solid ' + row.color">
                <td class="g-cell" [style.color]="row.color">{{ row.g }}</td>
                <td class="name-cell">{{ row.name }}</td>
                <td class="example-cell">{{ row.example }}</td>
                <td class="rp-cell">{{ row.rationalPoints }}</td>
                <td class="embed-cell">{{ row.embedding }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Genus formula interactive -->
      <div class="genus-section">
        <div class="slider-row">
          <div class="slider-group">
            <span class="sl-label">次數 d = {{ curDegree() }}</span>
            <input type="range" min="1" max="6" step="1"
                   [value]="curDegree()"
                   (input)="curDegree.set(+($any($event.target)).value)"
                   class="sl-input" />
          </div>
        </div>

        <!-- Info cards -->
        <div class="info-row">
          <div class="info-card">
            <div class="ic-title">次數</div>
            <div class="ic-body mono">d = {{ curDegree() }}</div>
          </div>
          <div class="info-card">
            <div class="ic-title">虧格公式</div>
            <app-math [e]="genusCalcTex()"></app-math>
          </div>
          <div class="info-card highlight-card">
            <div class="ic-title">虧格</div>
            <div class="ic-body mono g-value">{{ curGenus() }}</div>
          </div>
          <div class="info-card">
            <div class="ic-title">曲線類型</div>
            <div class="ic-body">{{ curPreset().label }}</div>
          </div>
        </div>

        <!-- Curve SVG -->
        <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
          <!-- axes -->
          <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

          <!-- implicit curve -->
          <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.2"
                stroke-linecap="round" />

          <!-- degree label in top-left -->
          <text x="40" y="24" class="curve-info" fill="var(--text-secondary)">
            d = {{ curDegree() }}, g = {{ curGenus() }}
          </text>
          <text x="40" y="40" class="curve-name" fill="var(--accent)">
            {{ curPreset().label }}
          </text>
        </svg>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Riemann-Roch 定理是一條金線，貫穿代數幾何的整個課程：
      </p>
      <ul>
        <li><strong>第一章</strong>的簇是它的舞台</li>
        <li><strong>第二章</strong>的理想是它的語言</li>
        <li><strong>第三章</strong>的橢圓曲線是 g=1 的特殊情形</li>
        <li><strong>第五章</strong>的曲面有更高維的推廣（Hirzebruch-Riemann-Roch）</li>
        <li><strong>第六章</strong>的 blowup 改變了 K 和 g 的計算</li>
      </ul>
      <p>
        從 Riemann（1857）到 Grothendieck（1957），這個定理經歷了一百年的推廣，
        從曲線到曲面再到任意維度的簇。它是代數幾何統一性的最佳證明。
      </p>
    </app-prose-block>
  `,
  styles: `
    /* ── Classification table ── */
    .class-table-wrap {
      overflow-x: auto; margin-bottom: 14px;
    }
    .class-table {
      width: 100%; border-collapse: collapse; font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
    }
    .class-table th {
      padding: 8px 10px; text-align: left;
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 2px solid var(--border);
      background: var(--bg-surface);
    }
    .class-table td {
      padding: 8px 10px; border-bottom: 1px solid var(--border);
      color: var(--text-secondary); font-size: 11px;
    }
    .class-table tr:hover td {
      background: rgba(102,170,255,0.04);
    }
    .g-cell {
      font-size: 16px; font-weight: 800; text-align: center; width: 36px;
    }
    .name-cell { font-weight: 600; color: var(--text); }
    .example-cell { font-style: italic; }
    .rp-cell { font-size: 10px; }
    .embed-cell { font-size: 10px; }

    /* ── Genus interactive ── */
    .genus-section {
      margin-top: 10px;
    }
    .slider-row {
      display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .slider-group {
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 160px;
    }
    .sl-label {
      font-size: 12px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 90px;
    }
    .sl-input { flex: 1; accent-color: var(--accent); }

    .info-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 90px; padding: 10px 12px;
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
    .g-value {
      font-size: 22px; color: var(--accent);
    }

    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .curve-info {
      font-size: 10px; font-family: 'JetBrains Mono', monospace;
    }
    .curve-name {
      font-size: 11px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class StepRRApplicationsComponent {
  /* ── Static formulae ── */

  readonly formulaGenus = `g = \\frac{(d-1)(d-2)}{2}`;

  readonly formulaRH = `2g_C - 2 = \\deg(f) \\cdot (2g_D - 2) + R`;

  /* ── Classification data ── */

  readonly classTable = CLASS_TABLE;

  /* ── Genus formula interactive ── */

  readonly curDegree = signal(3);

  readonly curGenus = computed(() => {
    const d = this.curDegree();
    return ((d - 1) * (d - 2)) / 2;
  });

  readonly curPreset = computed(() => {
    const d = this.curDegree();
    return CURVE_PRESETS[d - 1];
  });

  readonly genusCalcTex = computed(() => {
    const d = this.curDegree();
    const g = this.curGenus();
    return `g = \\frac{(${d}-1)(${d}-2)}{2} = \\frac{${d - 1} \\cdot ${d - 2}}{2} = ${g}`;
  });

  /* ── Plot view ── */

  readonly v: PlotView = {
    xRange: [-2, 2], yRange: [-2, 2],
    svgW: 520, svgH: 300, pad: 30,
  };
  readonly axesPath = plotAxesPath(this.v);

  readonly toSvgX = (x: number) => plotToSvgX(this.v, x);
  readonly toSvgY = (y: number) => plotToSvgY(this.v, y);

  /* ── Curve path recomputed on degree change ── */

  readonly curvePath = computed(() => {
    const preset = this.curPreset();
    return implicitCurve(
      preset.f,
      this.v.xRange, this.v.yRange,
      this.toSvgX, this.toSvgY,
      120,
    );
  });
}
