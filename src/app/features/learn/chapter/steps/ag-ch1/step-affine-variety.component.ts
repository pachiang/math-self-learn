import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from './ag-util';

/* ── Curve pair presets ── */

interface CurvePair {
  key: string;
  label: string;
  f: (x: number, y: number) => number;
  g: (x: number, y: number) => number;
  fTex: string;
  gTex: string;
}

const PAIRS: CurvePair[] = [
  {
    key: 'line-circle',
    label: '直線 + 圓',
    f: (x, y) => y - x,
    g: (x, y) => x * x + y * y - 2,
    fTex: 'y - x = 0',
    gTex: 'x^2 + y^2 - 2 = 0',
  },
  {
    key: 'circle-circle',
    label: '圓 + 圓',
    f: (x, y) => x * x + y * y - 1,
    g: (x, y) => (x - 1) * (x - 1) + y * y - 1,
    fTex: 'x^2 + y^2 - 1 = 0',
    gTex: '(x-1)^2 + y^2 - 1 = 0',
  },
  {
    key: 'parabola-line',
    label: '拋物線 + 直線',
    f: (x, y) => y - x * x,
    g: (x, y) => y - 1,
    fTex: 'y - x^2 = 0',
    gTex: 'y - 1 = 0',
  },
  {
    key: 'cubic-line',
    label: '三次 + 直線',
    f: (x, y) => y * y - x * x * x + x,
    g: (x, y) => y - 0.5,
    fTex: 'y^2 - x^3 + x = 0',
    gTex: 'y - 0.5 = 0',
  },
];

/* ── Find approximate intersection points ── */
function findIntersections(
  f: (x: number, y: number) => number,
  g: (x: number, y: number) => number,
  xRange: [number, number],
  yRange: [number, number],
): [number, number][] {
  const N = 200;
  const [x0, x1] = xRange;
  const [y0, y1] = yRange;
  const dx = (x1 - x0) / N;
  const dy = (y1 - y0) / N;
  const threshold = 0.08;
  const raw: [number, number][] = [];

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const cx = x0 + (i + 0.5) * dx;
      const cy = y0 + (j + 0.5) * dy;
      const fv = Math.abs(f(cx, cy));
      const gv = Math.abs(g(cx, cy));
      if (fv + gv < threshold) {
        raw.push([cx, cy]);
      }
    }
  }

  // Cluster nearby points
  const merged: [number, number][] = [];
  const used = new Set<number>();
  for (let i = 0; i < raw.length; i++) {
    if (used.has(i)) continue;
    let sx = raw[i][0], sy = raw[i][1], cnt = 1;
    for (let j = i + 1; j < raw.length; j++) {
      if (used.has(j)) continue;
      if (Math.abs(raw[j][0] - raw[i][0]) < 0.3 && Math.abs(raw[j][1] - raw[i][1]) < 0.3) {
        sx += raw[j][0]; sy += raw[j][1]; cnt++;
        used.add(j);
      }
    }
    merged.push([sx / cnt, sy / cnt]);
    used.add(i);
  }

  return merged;
}

@Component({
  selector: 'app-step-affine-variety',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="零點集與仿射簇" subtitle="§1.2">
      <p>
        上一節看到單個多項式 f(x,y) = 0 定義一條曲線。
        現在考慮<strong>多個多項式的公共零點</strong>：
      </p>
      <app-math block [e]="formulaVariety"></app-math>
      <p>
        這些公共零點集叫做<strong>仿射代數簇</strong>（affine algebraic variety）。
        兩條曲線的交集和聯集有漂亮的代數描述：
      </p>
      <app-math block [e]="formulaOps"></app-math>
      <p>
        交集對應方程組的公共解，聯集對應乘積的零點——代數和幾何完美對應。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="觀察兩條曲線的交點——多項式方程組的公共零點">
      <!-- Mode buttons -->
      <div class="mode-row">
        <button class="mode-btn" [class.active]="mode() === 'intersect'"
                (click)="mode.set('intersect')">
          交集 V(f) &#8745; V(g)
        </button>
        <button class="mode-btn" [class.active]="mode() === 'union'"
                (click)="mode.set('union')">
          聯集 V(f&#183;g)
        </button>
      </div>

      <!-- Pair presets -->
      <div class="preset-row">
        @for (p of pairs; track p.key; let i = $index) {
          <button class="pre-btn" [class.active]="pairIdx() === i"
                  (click)="pairIdx.set(i)">{{ p.label }}</button>
        }
      </div>

      <!-- SVG -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        @if (mode() === 'intersect') {
          <!-- f = 0 in accent -->
          <path [attr.d]="fPath()" fill="none" stroke="var(--accent)" stroke-width="2"
                stroke-linecap="round" />
          <!-- g = 0 in green -->
          <path [attr.d]="gPath()" fill="none" stroke="#5a8a5a" stroke-width="2"
                stroke-linecap="round" />

          <!-- Intersection points -->
          @for (pt of intersections(); track $index) {
            <circle [attr.cx]="toSvgX(pt[0])" [attr.cy]="toSvgY(pt[1])" r="5"
                    fill="#cc4444" stroke="#fff" stroke-width="1.2" />
          }
        } @else {
          <!-- Union: V(f*g) drawn as single curve -->
          <path [attr.d]="unionPath()" fill="none" stroke="var(--accent)" stroke-width="2"
                stroke-linecap="round" />
        }
      </svg>

      <!-- Info -->
      <div class="info-row">
        <div class="info-eq">
          <div class="eq-line">
            <span class="eq-dot f-dot"></span>
            <app-math [e]="'V(f): ' + curPair().fTex"></app-math>
          </div>
          <div class="eq-line">
            <span class="eq-dot g-dot"></span>
            <app-math [e]="'V(g): ' + curPair().gTex"></app-math>
          </div>
        </div>
        <div class="info-count">
          @if (mode() === 'intersect') {
            <span class="count-badge">{{ intersections().length }} 個交點</span>
          } @else {
            <span class="count-badge union-badge">V(f&#183;g) = V(f) &#8746; V(g)</span>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        交集和聯集在代數上的表達如此優雅：交集對應方程組的公共解，聯集對應乘積的零點。
        代數和幾何完美地手牽手。
      </p>
    </app-prose-block>
  `,
  styles: `
    .mode-row {
      display: flex; gap: 8px; margin-bottom: 8px;
    }
    .mode-btn {
      padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }
    .preset-row {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    }
    .pre-btn {
      padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 11px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .info-row {
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
    }
    .info-eq {
      flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
    }
    .eq-line {
      display: flex; align-items: center; gap: 8px; margin: 3px 0; font-size: 13px;
    }
    .eq-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
    .f-dot { background: var(--accent); }
    .g-dot { background: #5a8a5a; }
    .info-count { text-align: center; }
    .count-badge {
      display: inline-block; padding: 6px 14px; border-radius: 8px;
      background: rgba(204, 68, 68, 0.1); border: 1px solid rgba(204, 68, 68, 0.3);
      color: #cc4444; font-size: 13px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .union-badge {
      background: var(--accent-10); border-color: var(--accent);
      color: var(--accent);
    }
  `,
})
export class StepAffineVarietyComponent {
  readonly pairs = PAIRS;

  readonly formulaVariety = `V(f_1, \\ldots, f_k) = \\{(x,y) : f_1(x,y) = 0, \\ldots, f_k(x,y) = 0\\}`;
  readonly formulaOps = `V(f) \\cap V(g) = V(f, g), \\qquad V(f) \\cup V(g) = V(f \\cdot g)`;

  readonly v: PlotView = { xRange: [-3, 3], yRange: [-3, 3], svgW: 520, svgH: 420, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  readonly pairIdx = signal(0);
  readonly mode = signal<'intersect' | 'union'>('intersect');

  readonly curPair = computed(() => PAIRS[this.pairIdx()]);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  readonly fPath = computed(() =>
    implicitCurve(this.curPair().f, this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 120),
  );

  readonly gPath = computed(() =>
    implicitCurve(this.curPair().g, this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 120),
  );

  readonly unionPath = computed(() => {
    const pair = this.curPair();
    return implicitCurve(
      (x, y) => pair.f(x, y) * pair.g(x, y),
      this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 160,
    );
  });

  readonly intersections = computed(() =>
    findIntersections(this.curPair().f, this.curPair().g, this.v.xRange, this.v.yRange),
  );
}
