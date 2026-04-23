import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MatrixPreset {
  id: string;
  label: string;
  A: [[number, number], [number, number]];
  note: string;
}

const PRESETS: MatrixPreset[] = [
  {
    id: 'diag',
    label: '對角矩陣 (分離)',
    A: [[-1, 0], [0, -2]],
    note: '兩個分量獨立指數衰退。e^(At) 完全由對角元素決定。',
  },
  {
    id: 'shm',
    label: '簡諧振子 (無阻尼)',
    A: [[0, 1], [-1, 0]],
    note: '純虛特徵值 ±i。軌跡是圓（能量守恆）。',
  },
  {
    id: 'damped',
    label: '阻尼振盪',
    A: [[0, 1], [-4, -0.5]],
    note: '複特徵值帶負實部。軌跡螺旋收斂。',
  },
  {
    id: 'saddle',
    label: '鞍點',
    A: [[1, 1], [1, -1]],
    note: '一正一負特徵值。多數軌跡從一個方向進、另一個方向出。',
  },
];

/**
 * Compute matrix exponential e^(At) using Padé approximation via eigendecomposition for 2×2.
 * For simplicity, use the Cayley-Hamilton approach or just compute via series.
 *
 * For 2×2 matrix A = [[a, b], [c, d]], e^(At) has closed form:
 *   trace τ = a + d, determinant Δ = ad − bc
 *   disc = τ² − 4Δ
 *   if disc > 0:  two real eigenvalues λ₁, λ₂
 *     e^(At) = (λ₁ e^(λ₂t) - λ₂ e^(λ₁t))/(λ₁-λ₂) I + (e^(λ₁t) - e^(λ₂t))/(λ₁-λ₂) A
 *   ... actually: use A·e^(At) style.
 *
 * Easier: numerical via P·D·P⁻¹.
 */

interface MatExpResult {
  e00: number; e01: number;
  e10: number; e11: number;
  lambdas: { re1: number; im1: number; re2: number; im2: number };
}

function matExp(A: [[number, number], [number, number]], t: number): MatExpResult {
  const [[a, b], [c, d]] = A;
  const tau = a + d;
  const det = a * d - b * c;
  const disc = tau * tau - 4 * det;

  if (disc > 1e-9) {
    // Two distinct real eigenvalues
    const s = Math.sqrt(disc);
    const l1 = (tau - s) / 2;
    const l2 = (tau + s) / 2;
    const e1 = Math.exp(l1 * t);
    const e2 = Math.exp(l2 * t);
    // e^(At) = α(t) I + β(t) A,  where α = (l1 e2 − l2 e1)/(l1 − l2), β = (e1 − e2)/(l1 − l2)
    const alpha = (l1 * e2 - l2 * e1) / (l1 - l2);
    const beta = (e1 - e2) / (l1 - l2);
    return {
      e00: alpha + beta * a, e01: beta * b,
      e10: beta * c, e11: alpha + beta * d,
      lambdas: { re1: l1, im1: 0, re2: l2, im2: 0 },
    };
  } else if (disc < -1e-9) {
    // Complex conjugate eigenvalues
    const s = Math.sqrt(-disc);
    const re = tau / 2;
    const im = s / 2;
    const eR = Math.exp(re * t);
    const cosI = Math.cos(im * t);
    const sinI = Math.sin(im * t);
    // e^(At) = e^(re t) (cos(im t) I + sin(im t)/im · (A - re I))
    // For coefficient on A: this simplifies. Use:
    // e^(At) = eR·cos(im t)·I + (eR·sin(im t)/im)·(A − re·I)
    const alpha = eR * cosI - re * eR * sinI / im;
    const beta = eR * sinI / im;
    return {
      e00: alpha + beta * a, e01: beta * b,
      e10: beta * c, e11: alpha + beta * d,
      lambdas: { re1: re, im1: im, re2: re, im2: -im },
    };
  } else {
    // Repeated eigenvalue
    const l = tau / 2;
    const eL = Math.exp(l * t);
    // e^(At) = eL · (I + t(A − lI))
    return {
      e00: eL * (1 + t * (a - l)), e01: eL * t * b,
      e10: eL * t * c, e11: eL * (1 + t * (d - l)),
      lambdas: { re1: l, im1: 0, re2: l, im2: 0 },
    };
  }
}

function applyMatExp(A: [[number, number], [number, number]], x0: [number, number], t: number): [number, number] {
  const E = matExp(A, t);
  return [E.e00 * x0[0] + E.e01 * x0[1], E.e10 * x0[0] + E.e11 * x0[1]];
}

const PX_PER_T = 35;
const PX_PER_Y = 18;

@Component({
  selector: 'app-de-ch8-matrix-exp',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="矩陣指數 e^(At)" subtitle="§8.2">
      <p>
        純量 ODE <code>dx/dt = a·x</code> 的解你已經很熟：<code>x(t) = e^(at)·x₀</code>。
      </p>
      <p class="key-idea">
        <strong>神奇的事</strong>：向量版的線性 ODE <code>dx/dt = A·x</code> 的解形式<em>完全相同</em>：
      </p>
      <div class="centered-eq big">
        x(t) = e^(At) · x₀
      </div>
      <p>
        只要把純量指數換成<strong>矩陣指數</strong> e^(At)——就是一個 2×2 矩陣（當 A 是 2×2 時）。
      </p>
      <p>
        <strong>矩陣指數怎麼定義？</strong>跟純量版一樣，用 Taylor 級數：
      </p>
      <div class="centered-eq">
        e^(At) = I + (At) + (At)²/2! + (At)³/3! + ...
      </div>
      <p>
        這個級數對任何方陣都收斂。實際計算時有更快的方法：<strong>對角化</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="對角化 + 計算 e^(At)">
      <p>
        如果 A 有兩個不同特徵值 λ₁, λ₂，可以分解 <strong>A = P·D·P⁻¹</strong>，其中 D = diag(λ₁, λ₂)、P 的列是特徵向量。那麼：
      </p>
      <div class="centered-eq">
        e^(At) = P · e^(Dt) · P⁻¹ = P · diag(e^(λ₁t), e^(λ₂t)) · P⁻¹
      </div>
      <p>
        <strong>對角矩陣的指數就是每個對角元素各自的指數</strong>——這就是「對角化」的威力。
        把複雜的向量演化簡化成「分開的純量指數」。
      </p>

      <div class="three-cases">
        <div class="case" [style.--col]="'#5ca878'">
          <div class="c-label">Case 1：實特徵值 λ₁ ≠ λ₂</div>
          <div class="c-formula">x(t) = C₁·e^(λ₁t)·v₁ + C₂·e^(λ₂t)·v₂</div>
          <p>兩個指數的線性組合。v₁, v₂ 是對應的特徵向量。</p>
        </div>
        <div class="case" [style.--col]="'#c87b5e'">
          <div class="c-label">Case 2：重特徵值 λ</div>
          <div class="c-formula">x(t) = C₁·e^(λt)·v + C₂·e^(λt)·(tv + w)</div>
          <p>多出 t 因子（跟 Ch5 重根一樣）。w 是「廣義特徵向量」。</p>
        </div>
        <div class="case" [style.--col]="'#5a8aa8'">
          <div class="c-label">Case 3：複特徵值 α ± βi</div>
          <div class="c-formula">x(t) = e^(αt)·(A·cos βt + B·sin βt)</div>
          <p>實部控制衰退 / 爆炸；虛部給出振盪頻率 β。</p>
        </div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="互動：挑矩陣 A 跟初值 x₀，看 e^(At)·x₀ 如何演化">
      <div class="picker">
        @for (p of presets; track p.id) {
          <button class="pick-btn"
            [class.active]="preset().id === p.id"
            (click)="switchPreset(p)"
          >{{ p.label }}</button>
        }
      </div>

      <div class="matrix-display">
        <div class="md-row">
          <span class="md-lab">矩陣 A =</span>
          <div class="matrix">
            <div class="m-row">
              <span>{{ A()[0][0].toFixed(2) }}</span>
              <span>{{ A()[0][1].toFixed(2) }}</span>
            </div>
            <div class="m-row">
              <span>{{ A()[1][0].toFixed(2) }}</span>
              <span>{{ A()[1][1].toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="md-row">
          <span class="md-lab">特徵值：</span>
          <code class="md-val">{{ eigenvaluesDisplay() }}</code>
        </div>
      </div>

      <p class="note">{{ preset().note }}</p>

      <!-- Time series of x₁(t) and x₂(t) -->
      <div class="chart-wrap">
        <div class="chart-head">x₁(t) 與 x₂(t)</div>
        <svg viewBox="-10 -100 340 180" class="chart-svg">
          <line x1="0" y1="0" x2="320" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-90" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="1" />
          <text x="324" y="4" class="ax">t</text>

          @for (g of [-3, -2, -1, 1, 2, 3]; track g) {
            <line x1="0" [attr.y1]="-g * PX_PER_Y" x2="320" [attr.y2]="-g * PX_PER_Y"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
          }

          <path [attr.d]="x1Path()" fill="none"
            stroke="#c87b5e" stroke-width="2" />
          <path [attr.d]="x2Path()" fill="none"
            stroke="#5a8aa8" stroke-width="2" />

          <line [attr.x1]="t() * PX_PER_T" y1="-90" [attr.x2]="t() * PX_PER_T" y2="70"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.4" />
          <circle [attr.cx]="t() * PX_PER_T"
            [attr.cy]="-currentX()[0] * PX_PER_Y" r="4"
            fill="#c87b5e" stroke="white" stroke-width="1" />
          <circle [attr.cx]="t() * PX_PER_T"
            [attr.cy]="-currentX()[1] * PX_PER_Y" r="4"
            fill="#5a8aa8" stroke="white" stroke-width="1" />

          <!-- Legend -->
          <rect x="260" y="-96" width="62" height="28" fill="var(--bg-surface)"
            stroke="var(--border)" rx="3" />
          <line x1="264" y1="-88" x2="276" y2="-88"
            stroke="#c87b5e" stroke-width="2" />
          <text x="280" y="-85" class="leg">x₁(t)</text>
          <line x1="264" y1="-76" x2="276" y2="-76"
            stroke="#5a8aa8" stroke-width="2" />
          <text x="280" y="-73" class="leg">x₂(t)</text>
        </svg>
      </div>

      <!-- Phase plane (x₁, x₂) trajectory -->
      <div class="chart-wrap">
        <div class="chart-head">相平面軌跡 (x₁, x₂)</div>
        <svg viewBox="-90 -90 180 180" class="phase-svg">
          <line x1="-80" y1="0" x2="80" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-80" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="1" />
          <text x="84" y="4" class="ax">x₁</text>
          <text x="4" y="-82" class="ax">x₂</text>

          @for (g of [-3, -2, -1, 1, 2, 3]; track g) {
            <line [attr.x1]="g * 20" y1="-80" [attr.x2]="g * 20" y2="80"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            <line x1="-80" [attr.y1]="-g * 20" x2="80" [attr.y2]="-g * 20"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
          }

          <path [attr.d]="trajectoryPath()" fill="none"
            stroke="var(--accent)" stroke-width="2" />

          <!-- Initial point -->
          <circle [attr.cx]="x0()[0] * 20" [attr.cy]="-x0()[1] * 20" r="3.5"
            fill="none" stroke="var(--accent)" stroke-width="1.5" />

          <!-- Current point -->
          <circle [attr.cx]="currentX()[0] * 20" [attr.cy]="-currentX()[1] * 20" r="5"
            fill="var(--accent)" stroke="white" stroke-width="1.5" />
        </svg>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">x₁(0)</span>
          <input type="range" min="-3" max="3" step="0.05"
            [value]="x0()[0]" (input)="updateX0(+$any($event).target.value, x0()[1])" />
          <span class="sl-val">{{ x0()[0].toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">x₂(0)</span>
          <input type="range" min="-3" max="3" step="0.05"
            [value]="x0()[1]" (input)="updateX0(x0()[0], +$any($event).target.value)" />
          <span class="sl-val">{{ x0()[1].toFixed(2) }}</span>
        </div>

        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <div class="sl-inline">
            <span class="sl-lab">t</span>
            <input type="range" min="0" [max]="T_MAX" step="0.02"
              [value]="t()" (input)="t.set(+$any($event).target.value)" />
            <span class="sl-val">{{ t().toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        觀察：
      </p>
      <ul>
        <li><strong>對角矩陣</strong>：兩條時間序列完全獨立——各自指數衰退/爆炸。相軌跡貼著坐標軸走。</li>
        <li><strong>純振盪</strong>（純虛特徵值）：兩分量互換能量，相軌跡是閉合圓。</li>
        <li><strong>阻尼振盪</strong>：相軌跡螺旋收斂到原點。</li>
        <li><strong>鞍點</strong>：某些初值被推遠、某些被拉近——表現出「馬鞍」結構。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        dx/dt = A·x 的解就是 x(t) = e^(At)·x₀。矩陣指數可透過對角化計算；
        其「作用」完全由特徵值決定。接下來兩節分別看特徵向量的幾何意義與系統的六種基本行為。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 17px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 20px; padding: 16px; }

    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }

    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .three-cases {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .case {
      padding: 14px;
      border: 1.5px solid var(--col);
      border-radius: 10px;
      background: color-mix(in srgb, var(--col) 5%, var(--bg));
    }

    .c-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--col);
      margin-bottom: 4px;
    }

    .c-formula {
      padding: 8px 12px;
      background: var(--bg-surface);
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: var(--text);
      margin-bottom: 6px;
    }

    .case p {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .picker {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .pick-btn {
      font: inherit;
      font-size: 12px;
      padding: 6px 12px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
    }

    .pick-btn:hover { border-color: var(--accent); }
    .pick-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .matrix-display {
      padding: 12px 14px;
      background: var(--bg-surface);
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .md-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .md-lab {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 600;
      min-width: 80px;
    }

    .md-val {
      font-size: 13px;
      padding: 2px 8px;
    }

    .matrix {
      display: inline-block;
      padding: 6px 10px;
      border-left: 2px solid var(--accent);
      border-right: 2px solid var(--accent);
    }

    .m-row {
      display: grid;
      grid-template-columns: 60px 60px;
      gap: 10px;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
    }

    .note {
      padding: 8px 12px;
      background: var(--bg);
      border-left: 3px solid var(--accent);
      border-radius: 0 6px 6px 0;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .chart-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 10px;
    }

    .chart-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .chart-svg, .phase-svg {
      width: 100%;
      display: block;
      max-width: 420px;
      margin: 0 auto;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .leg {
      font-size: 10px;
      fill: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-top: 10px;
    }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 50px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 50px;
      text-align: right;
    }

    .row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 6px;
    }

    .play-btn, .reset-btn {
      font: inherit;
      font-size: 13px;
      padding: 6px 14px;
      border: 1.5px solid var(--accent);
      background: var(--accent);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .reset-btn { background: transparent; color: var(--accent); }

    .sl-inline {
      display: flex;
      gap: 8px;
      align-items: center;
      flex: 1;
      min-width: 160px;
    }

    .sl-inline .sl-lab {
      min-width: 20px;
    }
  `,
})
export class DeCh8MatrixExpComponent {
  readonly presets = PRESETS;
  readonly preset = signal<MatrixPreset>(PRESETS[2]);
  readonly x0 = signal<[number, number]>([2, 0]);
  readonly t = signal(0);
  readonly playing = signal(false);
  readonly T_MAX = 8;
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;

  private rafId: number | null = null;
  private lastFrame = 0;

  constructor() {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.0;
        if (newT >= this.T_MAX) {
          this.t.set(this.T_MAX);
          this.playing.set(false);
        } else {
          this.t.set(newT);
        }
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  switchPreset(p: MatrixPreset): void {
    this.preset.set(p);
    this.t.set(0);
    this.playing.set(false);
  }

  updateX0(x1: number, x2: number): void {
    this.x0.set([x1, x2]);
    this.t.set(0);
  }

  togglePlay(): void {
    if (this.t() >= this.T_MAX - 0.05) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  readonly A = computed(() => this.preset().A);

  readonly eigenvaluesDisplay = computed(() => {
    const E = matExp(this.A(), 0);
    const { re1, im1, re2, im2 } = E.lambdas;
    if (Math.abs(im1) < 0.01) {
      return `λ₁ = ${re1.toFixed(2)}, λ₂ = ${re2.toFixed(2)}`;
    }
    return `λ = ${re1.toFixed(2)} ± ${Math.abs(im1).toFixed(2)}i`;
  });

  readonly currentX = computed(() => applyMatExp(this.A(), this.x0(), this.t()));

  readonly x1Path = computed(() => this.buildComponentPath(0));
  readonly x2Path = computed(() => this.buildComponentPath(1));

  private buildComponentPath(idx: 0 | 1): string {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * this.T_MAX;
      const x = applyMatExp(this.A(), this.x0(), t);
      const val = x[idx];
      const clamp = Math.max(-5, Math.min(5, val));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-clamp * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  readonly trajectoryPath = computed(() => {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * this.T_MAX;
      const x = applyMatExp(this.A(), this.x0(), t);
      const x1 = Math.max(-4, Math.min(4, x[0]));
      const x2 = Math.max(-4, Math.min(4, x[1]));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(x1 * 20).toFixed(1)} ${(-x2 * 20).toFixed(1)}`);
    }
    return pts.join(' ');
  });
}
