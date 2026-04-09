import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { conjugateGradient, vecSub, vecNorm, matVec, type CGStep } from './numerical-util';

interface Preset { name: string; A: number[][]; b: number[]; sol: number[]; desc: string; }

const PRESETS: Preset[] = [
  {
    name: '近圓 κ≈2',
    A: [[2, 0], [0, 1]],
    b: [2, 2],
    sol: [1, 2],
    desc: '等高線接近圓，CG 2 步收斂',
  },
  {
    name: '中等 κ≈5',
    A: [[5, 1], [1, 1]],
    b: [7, 3],
    sol: [1, 2],
    desc: '橢圓有些扁，CG 仍快',
  },
  {
    name: '扁平 κ≈20',
    A: [[20, 3], [3, 1]],
    b: [26, 5],
    sol: [1, 2],
    desc: '很扁的橢圓，但 2×2 仍保證 2 步',
  },
];

// SVG constants
const SVG = 320;
const VIEW = { xMin: -1.5, xMax: 4, yMin: -1, yMax: 4.5 };

function sx(x: number): number { return ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * SVG; }
function sy(y: number): number { return SVG - ((y - VIEW.yMin) / (VIEW.yMax - VIEW.yMin)) * SVG; }

// Compute ellipse contour parameters from 2×2 SPD matrix A and center (sol)
function contourEllipse(A: number[][]): { angle: number; rx: number; ry: number } {
  const a = A[0][0], b = A[0][1], d = A[1][1];
  const trace = a + d;
  const det = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, trace * trace / 4 - det));
  const lam1 = trace / 2 + disc;
  const lam2 = trace / 2 - disc;
  const angle = Math.abs(b) < 1e-10 ? 0 : Math.atan2(lam1 - a, b) * (180 / Math.PI);
  return { angle, rx: 1 / Math.sqrt(Math.max(lam2, 0.01)), ry: 1 / Math.sqrt(Math.max(lam1, 0.01)) };
}

// Steepest descent for comparison
function steepestDescent(A: number[][], b: number[], x0: number[], maxIter: number): number[][] {
  const path: number[][] = [x0.slice()];
  let x = x0.slice();
  for (let k = 0; k < maxIter; k++) {
    const r = vecSub(b, matVec(A, x));
    if (vecNorm(r) < 1e-10) break;
    const Ar = matVec(A, r);
    const alpha = (r[0] * r[0] + r[1] * r[1]) / (r[0] * Ar[0] + r[1] * Ar[1]);
    x = [x[0] + alpha * r[0], x[1] + alpha * r[1]];
    path.push(x.slice());
  }
  return path;
}

@Component({
  selector: 'app-step-conjugate-gradient',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="共軛梯度法" subtitle="§15.7">
      <p>
        對<strong>對稱正定矩陣</strong>（第七章的老朋友），有一個優雅的迭代法叫
        <strong>共軛梯度法（CG）</strong>。
      </p>
      <p>
        解 Ax = b 等價於最小化<strong>二次型</strong>：
      </p>
      <p class="formula">f(x) = ½ xᵀAx − bᵀx</p>
      <p>
        CG 的每一步沿著「A-共軛」的方向走——意思是每走一步，
        <strong>保證不會在之前的方向上倒退</strong>。
        對 n 維問題，最多 n 步就到達精確解。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="等高線 = 二次型，看 CG 跟最速下降的路徑差多少">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="presetIdx.set(i)">{{ p.name }}</button>
        }
        <span class="desc-text">{{ currentPreset().desc }}</span>
      </div>

      <div class="layout">
        <div class="svg-side">
          <svg [attr.viewBox]="'0 0 ' + SVG + ' ' + SVG" class="cg-svg">
            <!-- Contour ellipses -->
            @for (level of contourLevels; track level) {
              <ellipse [attr.cx]="sx(currentPreset().sol[0])"
                       [attr.cy]="sy(currentPreset().sol[1])"
                       [attr.rx]="level * ellipse().rx * scaleX"
                       [attr.ry]="level * ellipse().ry * scaleY"
                       [attr.transform]="'rotate(' + ellipse().angle + ' ' + sx(currentPreset().sol[0]) + ' ' + sy(currentPreset().sol[1]) + ')'"
                       fill="none" stroke="var(--border)" stroke-width="0.8"
                       [attr.stroke-opacity]="0.2 + (1 - level / 5) * 0.3" />
            }

            <!-- Steepest descent path (dim) -->
            @if (showSD()) {
              @for (pt of sdPath(); track $index; let i = $index) {
                @if (i > 0) {
                  <line [attr.x1]="sx(sdPath()[i-1][0])" [attr.y1]="sy(sdPath()[i-1][1])"
                        [attr.x2]="sx(pt[0])" [attr.y2]="sy(pt[1])"
                        stroke="#a05a5a" stroke-width="1.5" stroke-opacity="0.5" stroke-dasharray="4 3" />
                }
                <circle [attr.cx]="sx(pt[0])" [attr.cy]="sy(pt[1])" r="2.5"
                        fill="#a05a5a" fill-opacity="0.5" />
              }
            }

            <!-- CG path -->
            @for (pt of cgPath(); track $index; let i = $index) {
              @if (i > 0) {
                <line [attr.x1]="sx(cgPath()[i-1][0])" [attr.y1]="sy(cgPath()[i-1][1])"
                      [attr.x2]="sx(pt[0])" [attr.y2]="sy(pt[1])"
                      stroke="var(--accent)" stroke-width="2.5" />
              }
              <circle [attr.cx]="sx(pt[0])" [attr.cy]="sy(pt[1])"
                      [attr.r]="i === cgPath().length - 1 ? 5 : 3"
                      fill="var(--accent)" stroke="white" stroke-width="1" />
            }

            <!-- Solution -->
            <circle [attr.cx]="sx(currentPreset().sol[0])"
                    [attr.cy]="sy(currentPreset().sol[1])"
                    r="5" fill="#5a8a5a" stroke="white" stroke-width="1.5" />

            <!-- Labels -->
            <text [attr.x]="sx(currentPreset().sol[0]) + 8"
                  [attr.y]="sy(currentPreset().sol[1]) - 8"
                  class="sol-label">x*</text>
          </svg>
          <div class="toggle-row">
            <label class="toggle">
              <input type="checkbox" [checked]="showSD()" (change)="showSD.set(!showSD())" />
              <span>顯示最速下降（虛線）</span>
            </label>
          </div>
        </div>

        <div class="info-side">
          <div class="method-box cg">
            <div class="mb-title">共軛梯度 (CG)</div>
            <div class="mb-steps">{{ cgSteps().length - 1 }} 步收斂</div>
            <div class="mb-res">殘差：{{ cgFinalRes().toExponential(2) }}</div>
          </div>
          @if (showSD()) {
            <div class="method-box sd">
              <div class="mb-title">最速下降</div>
              <div class="mb-steps">{{ sdPath().length - 1 }} 步</div>
              <div class="mb-res">殘差：{{ sdFinalRes().toExponential(2) }}</div>
            </div>
          }

          <div class="res-chart">
            <div class="rc-title">殘差比較（對數刻度）</div>
            <div class="rc-dual">
              <div class="rc-col">
                <div class="rc-name accent">CG</div>
                @for (s of cgSteps(); track $index) {
                  <div class="rc-bar-row">
                    <div class="rc-bar cg" [style.width.%]="resBarPct(s.resNorm)"></div>
                  </div>
                }
              </div>
              @if (showSD()) {
                <div class="rc-col">
                  <div class="rc-name red">SD</div>
                  @for (pt of sdResiduals(); track $index) {
                    <div class="rc-bar-row">
                      <div class="rc-bar sd" [style.width.%]="resBarPct(pt)"></div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block title="第十五章總結">
      <p>
        這一章你看到了「理論」跟「實際計算」之間的鴻溝：
      </p>
      <ul>
        <li><strong>浮點數</strong>只有 ~16 位精度，捨入誤差無所不在（§15.1）</li>
        <li><strong>條件數</strong> κ 決定了問題本身的敏感程度——這不是演算法的錯（§15.2）</li>
        <li><strong>LU 分解</strong>是高斯消去法的矩陣形式（§15.3）</li>
        <li><strong>樞軸選取</strong>幾乎零成本但大幅提升穩定性（§15.4）</li>
        <li><strong>QR 分解</strong>天生穩定，因為正交矩陣 κ = 1（§15.5）</li>
        <li><strong>迭代法</strong>適合大型稀疏問題（§15.6）</li>
        <li><strong>共軛梯度</strong>是正定矩陣上的最優迭代法（§15.7）</li>
      </ul>
      <p>
        數值線性代數是讓電腦<strong>真正能算</strong>的橋樑。
        沒有它，前面 14 章的公式都只是紙上談兵。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .desc-text { font-size: 11px; color: var(--text-muted); margin-left: 4px; }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .svg-side { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .cg-svg { width: 100%; max-width: 320px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .sol-label { font-size: 12px; fill: #5a8a5a; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .toggle-row { font-size: 12px; color: var(--text-muted); }
    .toggle { display: flex; align-items: center; gap: 6px; cursor: pointer;
      input { accent-color: var(--accent); } }

    .info-side { display: flex; flex-direction: column; gap: 10px; }
    .method-box { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      &.cg { background: var(--accent-10); }
      &.sd { background: rgba(160, 90, 90, 0.08); } }
    .mb-title { font-size: 13px; font-weight: 700; color: var(--text); }
    .mb-steps { font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .mb-res { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .res-chart { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); flex: 1; }
    .rc-title { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
    .rc-dual { display: flex; gap: 16px; }
    .rc-col { flex: 1; }
    .rc-name { font-size: 10px; font-weight: 700; margin-bottom: 4px;
      &.accent { color: var(--accent); }
      &.red { color: #a05a5a; } }
    .rc-bar-row { margin: 2px 0; }
    .rc-bar { height: 8px; border-radius: 3px; transition: width 0.2s; min-width: 2px;
      &.cg { background: var(--accent); }
      &.sd { background: #a05a5a; } }
  `,
})
export class StepConjugateGradientComponent {
  readonly SVG = SVG;
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly showSD = signal(true);
  readonly contourLevels = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  readonly scaleX = SVG / (VIEW.xMax - VIEW.xMin) * 0.15;
  readonly scaleY = SVG / (VIEW.yMax - VIEW.yMin) * 0.15;

  readonly currentPreset = computed(() => PRESETS[this.presetIdx()]);

  readonly ellipse = computed(() => contourEllipse(this.currentPreset().A));

  // CG from starting point
  readonly cgSteps = computed(() =>
    conjugateGradient(this.currentPreset().A, this.currentPreset().b, [-1, -0.5], 10),
  );

  readonly cgPath = computed(() => this.cgSteps().map((s) => s.x));

  readonly cgFinalRes = computed(() => {
    const steps = this.cgSteps();
    return steps[steps.length - 1]?.resNorm ?? 0;
  });

  // Steepest descent
  readonly sdPath = computed(() =>
    steepestDescent(this.currentPreset().A, this.currentPreset().b, [-1, -0.5], 20),
  );

  readonly sdResiduals = computed(() => {
    const A = this.currentPreset().A, b = this.currentPreset().b;
    return this.sdPath().map((x) => vecNorm(vecSub(b, matVec(A, x))));
  });

  readonly sdFinalRes = computed(() => {
    const res = this.sdResiduals();
    return res[res.length - 1] ?? 0;
  });

  readonly sx = sx;
  readonly sy = sy;

  resBarPct(v: number): number {
    if (v < 1e-10) return 1;
    const logV = Math.log10(v);
    // Map from -10..2 to 0..100
    return Math.max(1, Math.min(100, (logV + 10) / 12 * 100));
  }
}
