import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAdd, cMul, cExp, cDiv, cLog, cAbs, cSub,
  PlaneView, toSvg, axesPath,
} from '../complex-ch1/complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 2, svgW: 520, svgH: 420, pad: 30 };
const TWO_PI = 2 * Math.PI;
const TEST_R = 0.7;

/* ── Taylor presets ── */

interface TaylorPreset {
  label: string;
  tex: string;
  /** The exact function f(z) */
  fn: (z: C) => C;
  /** Taylor coefficient a_n (at z0=0) */
  coeff: (n: number) => number;
  /** Convergence radius */
  R: number;
  /** Singularity location(s) to mark, or empty */
  singularities: C[];
}

function factorial(n: number): number {
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

const PRESETS: TaylorPreset[] = [
  {
    label: 'e^z',
    tex: 'e^z',
    fn: (z: C): C => cExp(z),
    coeff: (n: number) => 1 / factorial(n),
    R: Infinity,
    singularities: [],
  },
  {
    label: '1/(1-z)',
    tex: '\\frac{1}{1-z}',
    fn: (z: C): C => cDiv([1, 0], cSub([1, 0], z)),
    coeff: (_n: number) => 1,
    R: 1,
    singularities: [[1, 0]],
  },
  {
    label: 'log(1+z)',
    tex: '\\log(1+z)',
    fn: (z: C): C => cLog(cAdd([1, 0], z)),
    coeff: (n: number) => (n === 0 ? 0 : Math.pow(-1, n + 1) / n),
    R: 1,
    singularities: [[-1, 0]],
  },
];

/** Evaluate partial sum S_N(z) = sum_{n=0}^{N} a_n z^n */
function partialSum(coeffFn: (n: number) => number, z: C, N: number): C {
  let result: C = [0, 0];
  let zPow: C = [1, 0]; // z^0
  for (let n = 0; n <= N; n++) {
    const a = coeffFn(n);
    result = cAdd(result, [zPow[0] * a, zPow[1] * a]);
    zPow = cMul(zPow, z);
  }
  return result;
}

@Component({
  selector: 'app-step-taylor-complex',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Taylor 級數" subtitle="&sect;4.1">
      <p>
        每個解析函數都有 Taylor 級數，在某個圓盤內收斂。收斂半徑恰好延伸到最近的奇異點。
        這正是複數解析性的威力——實數 Taylor 級數的收斂半徑有時看似神秘，
        但在複數平面上，原因永遠是奇異點。
      </p>
      <app-math block [e]="taylorFormula" />
      <p>
        收斂半徑
        <app-math [e]="'R'" /> 等於
        <app-math [e]="'z_0'" /> 到最近奇異點的距離。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="增加項數 N，觀察 Taylor 部分和如何逼近原函數">
      <!-- Preset selection -->
      <div class="control-group">
        <div class="control-label">函數選擇</div>
        <div class="preset-row">
          @for (p of presets; track p.label) {
            <button class="preset-btn"
                    [class.active]="presetIdx() === $index"
                    (click)="presetIdx.set($index)">
              {{ p.label }}
            </button>
          }
        </div>
      </div>

      <!-- N slider -->
      <div class="control-group">
        <div class="control-label">項數 N = {{ N() }}</div>
        <input type="range" class="slider" min="1" max="20" step="1"
               [value]="N()"
               (input)="N.set(+$any($event.target).value)" />
      </div>

      <!-- SVG -->
      <svg [attr.viewBox]="'0 0 ' + view.svgW + ' ' + view.svgH"
           class="plane-svg">
        <!-- Axes -->
        <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="1" fill="none" />

        <!-- Axis labels -->
        <text [attr.x]="view.svgW - view.pad + 8" [attr.y]="originSvg[1] + 4"
              class="axis-lbl">Re</text>
        <text [attr.x]="originSvg[0] + 8" [attr.y]="view.pad - 8"
              class="axis-lbl">Im</text>

        <!-- Tick labels -->
        @for (t of tickLabels; track t.key) {
          <text [attr.x]="t.x" [attr.y]="t.y" class="tick-label">{{ t.label }}</text>
        }

        <!-- Convergence disk (dashed circle) -->
        @if (activePreset().R < 100) {
          <circle [attr.cx]="convergeDiskSvg()[0]"
                  [attr.cy]="convergeDiskSvg()[1]"
                  [attr.r]="convergeDiskSvg()[2]"
                  fill="var(--accent-10)" stroke="var(--accent)"
                  stroke-width="1" stroke-dasharray="4,4" opacity="0.5" />
        }

        <!-- Singularities -->
        @for (s of singularitySvgs(); track $index) {
          <line [attr.x1]="s[0] - 6" [attr.y1]="s[1] - 6"
                [attr.x2]="s[0] + 6" [attr.y2]="s[1] + 6"
                stroke="#c05050" stroke-width="2" />
          <line [attr.x1]="s[0] + 6" [attr.y1]="s[1] - 6"
                [attr.x2]="s[0] - 6" [attr.y2]="s[1] + 6"
                stroke="#c05050" stroke-width="2" />
        }

        <!-- Test circle |z|=0.7 in domain (thin gray) -->
        <circle [attr.cx]="originSvg[0]"
                [attr.cy]="originSvg[1]"
                [attr.r]="testCircleRadius"
                fill="none" stroke="var(--text-muted)"
                stroke-width="0.7" stroke-dasharray="3,3" opacity="0.5" />

        <!-- Image of test circle under f (green dashed) -->
        <path [attr.d]="fCurvePath()" fill="none"
              stroke="#3a7a3a" stroke-width="2"
              stroke-dasharray="6,4" stroke-linecap="round" />

        <!-- Image of test circle under S_N (accent solid) -->
        <path [attr.d]="snCurvePath()" fill="none"
              stroke="var(--accent)" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />

        <!-- Legend -->
        <line [attr.x1]="view.pad + 8" [attr.y1]="view.svgH - view.pad - 24"
              [attr.x2]="view.pad + 28" [attr.y2]="view.svgH - view.pad - 24"
              stroke="#3a7a3a" stroke-width="2" stroke-dasharray="6,4" />
        <text [attr.x]="view.pad + 34" [attr.y]="view.svgH - view.pad - 20"
              class="legend-label">f(z)</text>

        <line [attr.x1]="view.pad + 8" [attr.y1]="view.svgH - view.pad - 8"
              [attr.x2]="view.pad + 28" [attr.y2]="view.svgH - view.pad - 8"
              stroke="var(--accent)" stroke-width="2" />
        <text [attr.x]="view.pad + 34" [attr.y]="view.svgH - view.pad - 4"
              class="legend-label">S_N(z)</text>
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="info-label">N</div>
          <div class="info-value">{{ N() }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">收斂半徑 R</div>
          <div class="info-value">{{ radiusLabel() }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">max |f - S_N| on |z|=0.7</div>
          <div class="info-value">{{ maxError() }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Taylor 級數的收斂半徑總是延伸到最近的奇異點。在實數線上看起來神秘的收斂半徑
        （如
        <app-math [e]="'1/(1+x^2)'" /> 的
        <app-math [e]="'R=1'" />），在複數平面中一目瞭然——因為
        <app-math [e]="'\\\\pm i'" /> 處有奇異點。下一節看如何在奇異點附近展開。
      </p>
    </app-prose-block>
  `,
  styles: `
    .control-group { margin-bottom: 10px; }
    .control-label {
      font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
    }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .preset-btn {
      padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active {
        background: var(--accent-18); border-color: var(--accent);
        color: var(--text); font-weight: 600;
      }
    }

    .slider {
      width: 100%; accent-color: var(--accent); cursor: pointer;
    }

    .plane-svg {
      width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 12px;
    }
    .axis-lbl {
      font-size: 11px; fill: var(--text-muted); font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    .tick-label {
      font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }
    .legend-label {
      font-size: 10px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .info-row {
      display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;
    }
    .info-card {
      flex: 1; min-width: 110px; padding: 10px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface); text-align: center;
    }
    .info-label {
      font-size: 11px; color: var(--text-muted); margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .info-value {
      font-size: 16px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class StepTaylorComplexComponent {
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);
  readonly presets = PRESETS;

  readonly taylorFormula = String.raw`f(z) = \sum_{n=0}^{\infty} \frac{f^{(n)}(z_0)}{n!}(z - z_0)^n`;

  readonly presetIdx = signal(0);
  readonly N = signal(5);

  readonly activePreset = computed(() => PRESETS[this.presetIdx()]);

  /* ── Tick labels ── */
  readonly tickLabels: { key: string; x: number; y: number; label: string }[] = (() => {
    const labels: { key: string; x: number; y: number; label: string }[] = [];
    const [ox, oy] = toSvg(VIEW, [0, 0]);
    for (let k = -2; k <= 2; k++) {
      if (k === 0) continue;
      const [tx] = toSvg(VIEW, [k, 0]);
      labels.push({ key: `tx${k}`, x: tx, y: oy + 16, label: `${k}` });
      const [, ty] = toSvg(VIEW, [0, k]);
      labels.push({ key: `ty${k}`, x: ox - 14, y: ty + 4, label: `${k}i` });
    }
    return labels;
  })();

  /* ── Test circle radius in SVG coords ── */
  readonly testCircleRadius = (() => {
    const scale = (VIEW.svgW - 2 * VIEW.pad) / (2 * VIEW.radius);
    return TEST_R * scale;
  })();

  /* ── Convergence disk SVG ── */
  readonly convergeDiskSvg = computed((): [number, number, number] => {
    const p = this.activePreset();
    const [cx, cy] = toSvg(VIEW, [0, 0]);
    const scale = (VIEW.svgW - 2 * VIEW.pad) / (2 * VIEW.radius);
    return [cx, cy, p.R * scale];
  });

  /* ── Singularity markers ── */
  readonly singularitySvgs = computed((): [number, number][] =>
    this.activePreset().singularities.map(s => toSvg(VIEW, s))
  );

  /* ── Curve path helper ── */
  private curvePath(func: (z: C) => C, r: number): string {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * TWO_PI;
      const z: C = [r * Math.cos(t), r * Math.sin(t)];
      const w = func(z);
      if (cAbs(w) > 10) continue;
      const [sx, sy] = toSvg(this.view, w);
      pts.push((pts.length === 0 ? 'M' : 'L') + `${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return pts.join('');
  }

  /* ── f(z) image of test circle ── */
  readonly fCurvePath = computed(() => {
    const p = this.activePreset();
    return this.curvePath(p.fn, TEST_R);
  });

  /* ── S_N(z) image of test circle ── */
  readonly snCurvePath = computed(() => {
    const p = this.activePreset();
    const n = this.N();
    return this.curvePath(
      (z: C) => partialSum(p.coeff, z, n),
      TEST_R,
    );
  });

  readonly radiusLabel = computed(() => {
    const R = this.activePreset().R;
    return R === Infinity ? '∞' : String(R);
  });

  /* ── Maximum error on test circle ── */
  readonly maxError = computed(() => {
    const p = this.activePreset();
    const n = this.N();
    let maxErr = 0;
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * TWO_PI;
      const z: C = [TEST_R * Math.cos(t), TEST_R * Math.sin(t)];
      const fz = p.fn(z);
      const snz = partialSum(p.coeff, z, n);
      const err = cAbs(cSub(fz, snz));
      if (err > maxErr) maxErr = err;
    }
    return maxErr < 0.0005 ? '< 0.001' : maxErr.toFixed(4);
  });
}
