import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAdd, cMul, cSub, cExp, cAbs,
  PlaneView, toSvg, axesPath,
} from '../complex-ch1/complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 2.5, svgW: 520, svgH: 420, pad: 30 };
const TWO_PI = 2 * Math.PI;

/* ── Laurent presets ── */

interface LaurentPreset {
  label: string;
  tex: string;
  /** The exact function f(z) */
  fn: (z: C) => C;
  /** Laurent coefficients: coeff(n) gives a_n for integer n (positive and negative) */
  coeff: (n: number) => number;
  /** Residue a_{-1} */
  residue: number;
  /** Description of the singularity type */
  singType: string;
  /** Convergence annulus description */
  annulus: string;
  /** Number of principal part terms (negative-power terms that are nonzero) */
  principalTerms: number;
  /** Singularity locations to mark */
  singularities: C[];
}

function factorial(n: number): number {
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

const PRESETS: LaurentPreset[] = [
  {
    label: '1/z',
    tex: '\\frac{1}{z}',
    fn: (z: C): C => {
      const d = z[0] * z[0] + z[1] * z[1];
      if (d < 1e-12) return [1e6, 0];
      return [z[0] / d, -z[1] / d];
    },
    coeff: (n: number) => (n === -1 ? 1 : 0),
    residue: 1,
    singType: '一階極點',
    annulus: '0 < |z| < ∞',
    principalTerms: 1,
    singularities: [[0, 0]],
  },
  {
    label: '1/z\u00B2',
    tex: '\\frac{1}{z^2}',
    fn: (z: C): C => {
      const z2 = cMul(z, z);
      const d = z2[0] * z2[0] + z2[1] * z2[1];
      if (d < 1e-12) return [1e6, 0];
      return [z2[0] / d, -z2[1] / d];
    },
    coeff: (n: number) => (n === -2 ? 1 : 0),
    residue: 0,
    singType: '二階極點',
    annulus: '0 < |z| < ∞',
    principalTerms: 1,
    singularities: [[0, 0]],
  },
  {
    label: 'e^(1/z)',
    tex: 'e^{1/z}',
    fn: (z: C): C => {
      const d = z[0] * z[0] + z[1] * z[1];
      if (d < 1e-12) return [1e6, 0];
      const invZ: C = [z[0] / d, -z[1] / d];
      return cExp(invZ);
    },
    // e^(1/z) = sum_{n=0}^{infty} 1/(n! z^n) = sum_{k=-infty}^{0} z^k / ((-k)!)
    // a_{-n} = 1/n! for n >= 0, i.e. a_k = 1/((-k)!) for k <= 0, a_k = 0 for k > 0
    coeff: (n: number) => {
      if (n > 0) return 0;
      return 1 / factorial(-n);
    },
    residue: 1,
    singType: '本性奇異點',
    annulus: '0 < |z| < ∞',
    principalTerms: Infinity,
    singularities: [[0, 0]],
  },
  {
    label: '(z\u00B2-1)\u207B\u00B9',
    tex: '\\frac{1}{z^2 - 1}',
    fn: (z: C): C => {
      const z2m1 = cSub(cMul(z, z), [1, 0]);
      const d = z2m1[0] * z2m1[0] + z2m1[1] * z2m1[1];
      if (d < 1e-12) return [1e6, 0];
      return [z2m1[0] / d, -z2m1[1] / d];
    },
    // 1/(z^2-1) = -1/(1-z^2) = -sum z^{2n} for |z|<1 (about z0=0)
    // Laurent coefficients about z0=0: a_{2n} = -1 for n >= 0, others 0
    // This is actually a Taylor series (no negative powers about 0), poles at +/-1
    coeff: (n: number) => {
      if (n < 0) return 0;
      if (n % 2 !== 0) return 0;
      return -1; // a_{2n} = -1
    },
    residue: 0,
    singType: '極點 (z = +/-1)',
    annulus: '0 < |z| < 1',
    principalTerms: 0,
    singularities: [[1, 0], [-1, 0]],
  },
];

/**
 * Evaluate Laurent partial sum S_N(z) = sum_{n=-N}^{N} a_n z^n.
 * Splits into analytic part (n >= 0) and principal part (n < 0).
 */
function laurentPartialSum(coeffFn: (n: number) => number, z: C, N: number): C {
  let result: C = [0, 0];

  // Positive powers: n = 0..N, compute z^n iteratively
  let zPow: C = [1, 0];
  for (let n = 0; n <= N; n++) {
    const a = coeffFn(n);
    if (a !== 0) {
      result = cAdd(result, [zPow[0] * a, zPow[1] * a]);
    }
    zPow = cMul(zPow, z);
  }

  // Negative powers: n = -1..-N, compute z^{-n} = (1/z)^n iteratively
  const d = z[0] * z[0] + z[1] * z[1];
  if (d < 1e-20) return result;
  const invZ: C = [z[0] / d, -z[1] / d];
  let invPow: C = [invZ[0], invZ[1]]; // (1/z)^1
  for (let n = 1; n <= N; n++) {
    const a = coeffFn(-n);
    if (a !== 0) {
      result = cAdd(result, [invPow[0] * a, invPow[1] * a]);
    }
    invPow = cMul(invPow, invZ);
  }

  return result;
}

@Component({
  selector: 'app-step-laurent',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Laurent 級數" subtitle="&sect;4.2">
      <p>
        在奇異點附近，Taylor 級數無法展開。但我們可以使用包含
        <app-math [e]="'(z - z_0)'" /> 的負冪次的 <strong>Laurent 級數</strong>，
        它在環形區域
        <app-math [e]="'r < |z - z_0| < R'" /> 內收斂。
      </p>
      <app-math block [e]="laurentFormula" />
      <p>
        負冪次部分稱為<strong>主部</strong>（principal part），
        它完全描述了奇異點的行為。其中最關鍵的係數
        <app-math [e]="'a_{-1}'" /> 就是<strong>留數</strong>（residue）——
        它在積分理論中扮演核心角色。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="觀察 Laurent 級數如何在環形區域內收斂，主部描述奇異點附近的行為">
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
        <div class="control-label">Laurent 項數 N = {{ N() }}  (從 z⁻ᴺ 到 zᴺ)</div>
        <input type="range" class="slider" min="1" max="15" step="1"
               [value]="N()"
               (input)="N.set(+$any($event.target).value)" />
      </div>

      <!-- Test radius slider -->
      <div class="control-group">
        <div class="control-label">測試圓半徑 r = {{ testR().toFixed(2) }}</div>
        <input type="range" class="slider" min="0.3" max="2" step="0.05"
               [value]="testR()"
               (input)="testR.set(+$any($event.target).value)" />
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

        <!-- Annulus visualization: small puncture circle around origin -->
        @if (hasOriginSing()) {
          <circle [attr.cx]="originSvg[0]"
                  [attr.cy]="originSvg[1]"
                  [attr.r]="punctureRadius"
                  fill="none" stroke="var(--text-muted)"
                  stroke-width="1" stroke-dasharray="3,3" opacity="0.4" />
        }

        <!-- Singularity markers -->
        @for (s of singularitySvgs(); track $index) {
          <line [attr.x1]="s[0] - 7" [attr.y1]="s[1] - 7"
                [attr.x2]="s[0] + 7" [attr.y2]="s[1] + 7"
                stroke="#c05050" stroke-width="2.5" />
          <line [attr.x1]="s[0] + 7" [attr.y1]="s[1] - 7"
                [attr.x2]="s[0] - 7" [attr.y2]="s[1] + 7"
                stroke="#c05050" stroke-width="2.5" />
        }

        <!-- Test circle in domain (thin gray) -->
        <circle [attr.cx]="originSvg[0]"
                [attr.cy]="originSvg[1]"
                [attr.r]="testCircleSvgR()"
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
          <div class="info-label">主部項數</div>
          <div class="info-value">{{ principalDesc() }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">留數 a₋₁</div>
          <div class="info-value">{{ activePreset().residue }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">收斂環域</div>
          <div class="info-value annulus-text">{{ activePreset().annulus }}</div>
        </div>
      </div>

      <!-- Singularity type badge -->
      <div class="type-badge">
        <span class="type-label">奇異點類型：</span>
        <span class="type-value">{{ activePreset().singType }}</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Laurent 級數的主部完全決定了奇異點的性質：
        有限項主部代表<strong>極點</strong>（pole），
        無窮項主部代表<strong>本性奇異點</strong>（essential singularity）。
        而留數
        <app-math [e]="'a_{-1}'" /> 是計算圍道積分的關鍵。下一節我們來分類奇異點。
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
    .annulus-text {
      font-size: 13px;
    }

    .type-badge {
      margin-top: 10px; padding: 10px 16px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface);
      font-family: 'JetBrains Mono', monospace;
      display: flex; align-items: center; gap: 8px;
    }
    .type-label {
      font-size: 12px; color: var(--text-muted); font-weight: 600;
    }
    .type-value {
      font-size: 14px; color: var(--accent); font-weight: 700;
    }
  `,
})
export class StepLaurentComponent {
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);
  readonly presets = PRESETS;

  readonly laurentFormula = String.raw`f(z) = \sum_{n=-\infty}^{\infty} a_n (z - z_0)^n = \underbrace{\sum_{n=0}^{\infty} a_n (z-z_0)^n}_{\text{解析部分}} + \underbrace{\sum_{n=1}^{\infty} \frac{a_{-n}}{(z-z_0)^n}}_{\text{主部}}`;

  readonly presetIdx = signal(0);
  readonly N = signal(5);
  readonly testR = signal(0.7);

  readonly activePreset = computed(() => PRESETS[this.presetIdx()]);

  /* ── Tick labels ── */
  readonly tickLabels: { key: string; x: number; y: number; label: string }[] = (() => {
    const labels: { key: string; x: number; y: number; label: string }[] = [];
    const [ox, oy] = toSvg(VIEW, [0, 0]);
    const step = 1;
    for (let k = -2; k <= 2; k += step) {
      if (k === 0) continue;
      const [tx] = toSvg(VIEW, [k, 0]);
      labels.push({ key: `tx${k}`, x: tx, y: oy + 16, label: `${k}` });
      const [, ty] = toSvg(VIEW, [0, k]);
      labels.push({ key: `ty${k}`, x: ox - 14, y: ty + 4, label: `${k}i` });
    }
    return labels;
  })();

  /* ── Small puncture circle around origin ── */
  readonly punctureRadius = (() => {
    const scale = (VIEW.svgW - 2 * VIEW.pad) / (2 * VIEW.radius);
    return 0.08 * scale;
  })();

  /* ── Whether singularity is at origin ── */
  readonly hasOriginSing = computed(() =>
    this.activePreset().singularities.some(s => Math.abs(s[0]) < 0.01 && Math.abs(s[1]) < 0.01)
  );

  /* ── Singularity markers ── */
  readonly singularitySvgs = computed((): [number, number][] =>
    this.activePreset().singularities.map(s => toSvg(VIEW, s))
  );

  /* ── Test circle SVG radius ── */
  readonly testCircleSvgR = computed(() => {
    const scale = (VIEW.svgW - 2 * VIEW.pad) / (2 * VIEW.radius);
    return this.testR() * scale;
  });

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
    return this.curvePath(p.fn, this.testR());
  });

  /* ── S_N(z) image of test circle ── */
  readonly snCurvePath = computed(() => {
    const p = this.activePreset();
    const n = this.N();
    const r = this.testR();
    return this.curvePath(
      (z: C) => laurentPartialSum(p.coeff, z, n),
      r,
    );
  });

  /* ── Principal part description ── */
  readonly principalDesc = computed(() => {
    const p = this.activePreset();
    if (p.principalTerms === Infinity) return '∞ (本性)';
    return `${p.principalTerms}`;
  });
}
