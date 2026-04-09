import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { svd } from '../linalg-ch8-svd/svd-util';

interface Preset { name: string; A: number[][]; b: number[]; desc: string; }

const PRESETS: Preset[] = [
  {
    name: '良條件',
    A: [[2, 0.5], [0.5, 2]],
    b: [3, 3],
    desc: '兩條線接近垂直交叉，κ ≈ 1.7',
  },
  {
    name: '中等',
    A: [[10, 7], [7, 5]],
    b: [1, 0.7],
    desc: '有點歪但還行，κ ≈ 30',
  },
  {
    name: '病態',
    A: [[1, 1], [1, 1.0001]],
    b: [2, 2.0001],
    desc: '兩條幾乎平行的線，κ ≈ 40000',
  },
];

function solve2x2(A: number[][], b: number[]): number[] {
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  if (Math.abs(det) < 1e-15) return [0, 0];
  return [
    (A[1][1] * b[0] - A[0][1] * b[1]) / det,
    (A[0][0] * b[1] - A[1][0] * b[0]) / det,
  ];
}

@Component({
  selector: 'app-step-condition-number',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="條件數" subtitle="§15.2">
      <p>
        即使沒有捨入誤差，有些方程組<strong>本身就不穩定</strong>：
        右邊 b 稍微動一下，解 x 就跑掉很遠。
      </p>
      <p>
        <strong>條件數</strong> κ(A) 量化這個現象：
      </p>
      <p class="formula">κ(A) = σ_max / σ_min</p>
      <p>
        σ_max 和 σ_min 是第八章學過的<strong>奇異值</strong>。κ 越大 → 系統越敏感。
      </p>
      <p>
        幾何上：A 把單位圓變成橢圓。κ = 橢圓長軸 / 短軸。橢圓越扁 → 越病態。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選不同條件的矩陣，拖動擾動看解怎麼跑">
      <div class="preset-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="presetIdx.set(i)">{{ p.name }}</button>
        }
        <span class="preset-desc">{{ current().desc }}</span>
      </div>

      <div class="layout">
        <div class="svg-panel">
          <svg viewBox="-1 -1 12 12" class="cond-svg"
               (pointermove)="onPointerMove($event)"
               (pointerdown)="dragging.set(true)"
               (pointerup)="dragging.set(false)"
               (pointerleave)="dragging.set(false)">
            <!-- Grid -->
            @for (g of gridLines; track g) {
              <line [attr.x1]="g" y1="-1" [attr.x2]="g" y2="12" stroke="var(--border)" stroke-width="0.03" />
              <line x1="-1" [attr.y1]="g" x2="12" [attr.y2]="g" stroke="var(--border)" stroke-width="0.03" />
            }

            <!-- Lines for the two equations -->
            <line [attr.x1]="line1().x1" [attr.y1]="line1().y1" [attr.x2]="line1().x2" [attr.y2]="line1().y2"
                  stroke="#5a7faa" stroke-width="0.08" stroke-opacity="0.6" />
            <line [attr.x1]="line2().x1" [attr.y1]="line2().y1" [attr.x2]="line2().x2" [attr.y2]="line2().y2"
                  stroke="#aa5a6a" stroke-width="0.08" stroke-opacity="0.6" />

            <!-- Perturbed lines -->
            <line [attr.x1]="line1p().x1" [attr.y1]="line1p().y1" [attr.x2]="line1p().x2" [attr.y2]="line1p().y2"
                  stroke="#5a7faa" stroke-width="0.05" stroke-dasharray="0.2 0.15" />
            <line [attr.x1]="line2p().x1" [attr.y1]="line2p().y1" [attr.x2]="line2p().x2" [attr.y2]="line2p().y2"
                  stroke="#aa5a6a" stroke-width="0.05" stroke-dasharray="0.2 0.15" />

            <!-- Original solution -->
            <circle [attr.cx]="sol()[0]" [attr.cy]="sol()[1]" r="0.18"
                    fill="#5a8a5a" stroke="white" stroke-width="0.04" />
            <!-- Perturbed solution -->
            <circle [attr.cx]="solP()[0]" [attr.cy]="solP()[1]" r="0.15"
                    fill="#c8983b" stroke="white" stroke-width="0.04" />
            <!-- Arrow between them -->
            <line [attr.x1]="sol()[0]" [attr.y1]="sol()[1]"
                  [attr.x2]="solP()[0]" [attr.y2]="solP()[1]"
                  stroke="#c8983b" stroke-width="0.06" />
          </svg>
          <div class="legend">
            <span><span class="dot green"></span> 原始解 x</span>
            <span><span class="dot orange"></span> 擾動解 x'</span>
          </div>
        </div>

        <div class="info-panel">
          <div class="kappa-box">
            <div class="k-title">條件數 κ(A)</div>
            <div class="k-val">{{ kappa().toFixed(1) }}</div>
          </div>

          <div class="sv-block">
            <div class="sv-title">奇異值</div>
            <div class="sv-bars">
              <div class="sv-row">
                <span class="sv-label">σ₁</span>
                <div class="sv-bar-bg"><div class="sv-bar" [style.width.%]="s1Pct()"></div></div>
                <span class="sv-num">{{ sigmas()[0].toFixed(3) }}</span>
              </div>
              <div class="sv-row">
                <span class="sv-label">σ₂</span>
                <div class="sv-bar-bg"><div class="sv-bar s2" [style.width.%]="s2Pct()"></div></div>
                <span class="sv-num">{{ sigmas()[1].toFixed(3) }}</span>
              </div>
            </div>
          </div>

          <div class="delta-block">
            <div class="d-row"><span class="d-label">|δb| / |b|</span><span class="d-val">{{ relDb().toFixed(4) }}</span></div>
            <div class="d-row"><span class="d-label">|δx| / |x|</span><span class="d-val" [class.bad]="amplification() > 10">{{ relDx().toFixed(4) }}</span></div>
            <div class="d-row"><span class="d-label">放大倍率</span><span class="d-val" [class.bad]="amplification() > 10">{{ amplification().toFixed(1) }}×</span></div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        「病態」的矩陣——兩條幾乎平行的線——即使 b 只偏了 0.01%，x 可以跑掉 400%。
        <strong>κ 就是這個放大倍率的上界</strong>。
      </p>
      <p>
        下一節看怎麼「穩定地」解方程：LU 分解。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .preset-desc { font-size: 11px; color: var(--text-muted); margin-left: 8px; }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .svg-panel { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .cond-svg { width: 100%; max-width: 300px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); cursor: crosshair; touch-action: none; }
    .legend { font-size: 11px; color: var(--text-muted); display: flex; gap: 14px; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 3px;
      &.green { background: #5a8a5a; } &.orange { background: #c8983b; } }

    .info-panel { display: flex; flex-direction: column; gap: 10px; }
    .kappa-box { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--accent-10); text-align: center; }
    .k-title { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    .k-val { font-size: 24px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; }

    .sv-block { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .sv-title { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .sv-row { display: flex; align-items: center; gap: 6px; margin: 3px 0; }
    .sv-label { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
      min-width: 20px; }
    .sv-bar-bg { flex: 1; height: 10px; background: var(--bg); border-radius: 4px;
      border: 1px solid var(--border); overflow: hidden; }
    .sv-bar { height: 100%; background: var(--accent); border-radius: 3px;
      &.s2 { background: var(--text-muted); } }
    .sv-num { font-size: 11px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace;
      min-width: 50px; text-align: right; }

    .delta-block { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .d-row { display: flex; justify-content: space-between; margin: 3px 0; }
    .d-label { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .d-val { font-size: 12px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      &.bad { color: #a05a5a; } }
  `,
})
export class StepConditionNumberComponent {
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly perturbation = signal<[number, number]>([0.1, -0.1]);
  readonly dragging = signal(false);
  readonly gridLines = [0, 2, 4, 6, 8, 10];

  readonly current = computed(() => PRESETS[this.presetIdx()]);

  readonly sol = computed(() => solve2x2(this.current().A, this.current().b));

  readonly bPerturbed = computed(() => {
    const b = this.current().b;
    const d = this.perturbation();
    return [b[0] + d[0], b[1] + d[1]];
  });

  readonly solP = computed(() => solve2x2(this.current().A, this.bPerturbed()));

  readonly sigmas = computed(() => {
    const { S } = svd(this.current().A);
    return [S[0] ?? 1, S[1] ?? 0.001];
  });

  readonly kappa = computed(() => {
    const s = this.sigmas();
    return s[0] / Math.max(s[1], 1e-12);
  });

  readonly s1Pct = computed(() => 100);
  readonly s2Pct = computed(() => (this.sigmas()[1] / Math.max(this.sigmas()[0], 1e-12)) * 100);

  readonly relDb = computed(() => {
    const d = this.perturbation();
    const b = this.current().b;
    return Math.sqrt(d[0] * d[0] + d[1] * d[1]) / Math.sqrt(b[0] * b[0] + b[1] * b[1]);
  });

  readonly relDx = computed(() => {
    const x = this.sol(), xp = this.solP();
    const dx = [xp[0] - x[0], xp[1] - x[1]];
    return Math.sqrt(dx[0] * dx[0] + dx[1] * dx[1]) / Math.sqrt(x[0] * x[0] + x[1] * x[1]);
  });

  readonly amplification = computed(() => {
    const rd = this.relDb();
    return rd > 1e-10 ? this.relDx() / rd : 0;
  });

  // Line rendering helpers (for 2 equations: A[0]·x = b[0], A[1]·x = b[1])
  private lineFromEq(a0: number, a1: number, b: number): { x1: number; y1: number; x2: number; y2: number } {
    // a0 * x + a1 * y = b → y = (b - a0*x) / a1  or  x = (b - a1*y) / a0
    if (Math.abs(a1) > Math.abs(a0)) {
      const y0 = (b - a0 * (-1)) / a1;
      const y1 = (b - a0 * 11) / a1;
      return { x1: -1, y1: y0, x2: 11, y2: y1 };
    } else {
      const x0 = (b - a1 * (-1)) / a0;
      const x1 = (b - a1 * 11) / a0;
      return { x1: x0, y1: -1, x2: x1, y2: 11 };
    }
  }

  readonly line1 = computed(() => {
    const A = this.current().A, b = this.current().b;
    return this.lineFromEq(A[0][0], A[0][1], b[0]);
  });
  readonly line2 = computed(() => {
    const A = this.current().A, b = this.current().b;
    return this.lineFromEq(A[1][0], A[1][1], b[1]);
  });
  readonly line1p = computed(() => {
    const A = this.current().A, bp = this.bPerturbed();
    return this.lineFromEq(A[0][0], A[0][1], bp[0]);
  });
  readonly line2p = computed(() => {
    const A = this.current().A, bp = this.bPerturbed();
    return this.lineFromEq(A[1][0], A[1][1], bp[1]);
  });

  onPointerMove(ev: PointerEvent): void {
    if (!this.dragging()) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = ((ev.clientX - rect.left) / rect.width) * 12 - 1;
    const sy = ((ev.clientY - rect.top) / rect.height) * 12 - 1;
    // Use pointer position relative to the solution as perturbation
    const x = this.sol();
    const scale = 0.3;
    this.perturbation.set([(sx - x[0]) * scale, (sy - x[1]) * scale]);
  }
}
