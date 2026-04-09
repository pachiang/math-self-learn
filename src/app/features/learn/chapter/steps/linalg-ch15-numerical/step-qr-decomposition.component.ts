import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { qrGramSchmidt, type QRStep } from './numerical-util';

interface Preset { name: string; A: number[][]; }

const PRESETS: Preset[] = [
  { name: '2×2', A: [[3, 1], [4, 1]] },
  { name: '3×2', A: [[1, 1], [0, 1], [1, 0]] },
  { name: '3×3', A: [[1, 1, 0], [1, 0, 1], [0, 1, 1]] },
];

@Component({
  selector: 'app-step-qr-decomposition',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="QR 分解" subtitle="§15.5">
      <p>
        另一種矩陣分解：
      </p>
      <p class="formula">A = Q × R</p>
      <p>
        <strong>Q</strong>：正交矩陣（列向量互相垂直、長度 1）<br />
        <strong>R</strong>：上三角矩陣
      </p>
      <p>
        怎麼做？用第三章學過的 <strong>Gram-Schmidt</strong>！
        把 A 的行向量一個一個正交化，過程中記錄的「投影係數」就是 R。
      </p>
      <p>
        QR 比 LU 更穩定：因為正交矩陣的條件數 = 1，不會放大誤差。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="一步步看 Gram-Schmidt 怎麼建出 Q 和 R">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="loadPreset(i)">{{ p.name }}</button>
        }
        <div class="step-ctrl">
          <button class="nav-btn" [disabled]="stepIdx() === 0" (click)="stepIdx.update(v => v - 1)">‹</button>
          <span class="step-num">步 {{ stepIdx() + 1 }} / {{ steps().length }}</span>
          <button class="nav-btn" [disabled]="stepIdx() === steps().length - 1" (click)="stepIdx.update(v => v + 1)">›</button>
        </div>
      </div>

      <div class="step-desc">{{ currentStep().desc }}</div>

      <div class="main-area">
        <div class="svg-panel">
          <svg viewBox="-2.5 -2.5 5 5" class="vec-svg">
            <!-- Grid -->
            <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="var(--border)" stroke-width="0.02" />
            <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="var(--border)" stroke-width="0.02" />

            <!-- Original columns (dim) -->
            @for (col of originalCols(); track $index; let j = $index) {
              <line x1="0" y1="0" [attr.x2]="col[0]" [attr.y2]="col[1]"
                    stroke="var(--text-muted)" stroke-width="0.04" stroke-opacity="0.3" />
              <text [attr.x]="col[0] + 0.12" [attr.y]="col[1] + 0.12" class="vec-label dim">a{{ j + 1 }}</text>
            }

            <!-- Q vectors built so far -->
            @for (q of currentQVecs(); track $index; let j = $index) {
              <line x1="0" y1="0" [attr.x2]="q[0]" [attr.y2]="q[1]"
                    [attr.stroke]="qColors[j]" stroke-width="0.06" />
              <circle [attr.cx]="q[0]" [attr.cy]="q[1]" r="0.08"
                      [attr.fill]="qColors[j]" />
              <text [attr.x]="q[0] + 0.15" [attr.y]="q[1] - 0.1" class="vec-label bold"
                    [attr.fill]="qColors[j]">q{{ j + 1 }}</text>
            }

            <!-- Unit circle (reference) -->
            <circle cx="0" cy="0" r="1" fill="none" stroke="var(--border)" stroke-width="0.015"
                    stroke-dasharray="0.1 0.06" />
          </svg>
        </div>

        <div class="matrix-panel">
          <div class="mat-block">
            <div class="mat-title">Q（正交）</div>
            <table class="mat-table">
              @for (row of qMatrix(); track $index) {
                <tr>
                  @for (v of row; track $index) {
                    <td class="cell" [class.active]="v !== 0">{{ fmtCell(v) }}</td>
                  }
                </tr>
              }
            </table>
          </div>

          <div class="mat-block">
            <div class="mat-title">R（上三角）</div>
            <table class="mat-table">
              @for (row of currentStep().R; track $index; let i = $index) {
                <tr>
                  @for (v of row; track $index; let j = $index) {
                    <td class="cell" [class.upper]="i <= j && Math.abs(v) > 1e-10"
                        [class.zero]="Math.abs(v) < 1e-10">{{ fmtCell(v) }}</td>
                  }
                </tr>
              }
            </table>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        觀察 SVG 裡的向量：
      </p>
      <ul>
        <li>q₁, q₂, … 都在<strong>單位圓上</strong>（長度 = 1）</li>
        <li>它們互相<strong>垂直</strong>（90° 角）</li>
        <li>原始的 a₁, a₂ 是 q 向量的<strong>線性組合</strong>，係數就是 R 的欄</li>
      </ul>
      <p>
        下一節換一個完全不同的思路：不直接分解，而是<strong>迭代逼近</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.7; }

    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .step-ctrl { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .nav-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:disabled { opacity: 0.3; } &:hover:not(:disabled) { background: var(--accent-10); } }
    .step-num { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .step-desc { padding: 8px 12px; background: var(--bg-surface); border-radius: 6px;
      border: 1px solid var(--border); font-size: 12px; color: var(--text-secondary);
      margin-bottom: 12px; }

    .main-area { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 700px) { .main-area { grid-template-columns: 1fr; } }

    .svg-panel { display: flex; justify-content: center; }
    .vec-svg { width: 100%; max-width: 280px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .vec-label { font-size: 0.22px; font-family: 'JetBrains Mono', monospace; font-weight: 600;
      &.dim { fill: var(--text-muted); opacity: 0.5; }
      &.bold { font-weight: 700; } }

    .matrix-panel { display: flex; flex-direction: column; gap: 10px; }
    .mat-block { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .mat-title { font-size: 12px; font-weight: 600; color: var(--text-muted);
      margin-bottom: 6px; text-align: center; }
    .mat-table { border-collapse: collapse; margin: 0 auto; }
    .cell { min-width: 48px; height: 28px; text-align: center; font-size: 11px;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      color: var(--text-muted); padding: 3px 5px;
      &.active { color: var(--text); font-weight: 600; }
      &.upper { background: rgba(90, 138, 90, 0.1); color: #5a8a5a; font-weight: 600; }
      &.zero { opacity: 0.3; } }
  `,
})
export class StepQrDecompositionComponent {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly stepIdx = signal(0);
  readonly qColors = ['#5a7faa', '#aa5a6a', '#5a8a5a'];

  readonly steps = computed(() => qrGramSchmidt(PRESETS[this.presetIdx()].A).steps);
  readonly currentStep = computed(() => this.steps()[this.stepIdx()]);

  readonly originalCols = computed(() => {
    const A = PRESETS[this.presetIdx()].A;
    const m = A.length;
    const n = A[0].length;
    const cols: number[][] = [];
    for (let j = 0; j < n; j++) {
      // Take first 2 rows for 2D viz
      cols.push([A[0]?.[j] ?? 0, A[1]?.[j] ?? 0]);
    }
    return cols;
  });

  readonly currentQVecs = computed(() => {
    const vecs = this.currentStep().qVecs;
    // Show first 2 components for 2D
    return vecs.map((v) => [v[0] ?? 0, v[1] ?? 0]);
  });

  readonly qMatrix = computed(() => {
    const step = this.currentStep();
    const m = PRESETS[this.presetIdx()].A.length;
    const n = step.qVecs.length;
    const Q: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < m; i++) {
        Q[i][j] = step.qVecs[j]?.[i] ?? 0;
      }
    }
    return Q;
  });

  loadPreset(i: number): void {
    this.presetIdx.set(i);
    this.stepIdx.set(0);
  }

  fmtCell(v: number): string {
    if (Math.abs(v) < 1e-10) return '0';
    return v.toFixed(3);
  }
}
