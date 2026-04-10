import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Preset { name: string; A: number[][]; desc: string; }

const PRESETS: Preset[] = [
  { name: '對稱', A: [[2, 1], [1, 3]], desc: '對稱矩陣 → T 是對角的（回到第七章的譜定理）' },
  { name: '缺陷', A: [[2, 1], [0, 2]], desc: '缺陷矩陣 → T 是上三角，超對角有 1' },
  { name: '一般', A: [[1, 2], [-1, 3]], desc: '一般矩陣 → T 是上三角，對角線上是特徵值' },
];

// Simple 2×2 Schur: A = Q T Q^T where T is upper triangular
function schur2x2(A: number[][]): { Q: number[][]; T: number[][] } {
  const a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1];
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;

  if (disc < 0) {
    // Complex eigenvalues — Schur form is a 2×2 real block
    return { Q: [[1, 0], [0, 1]], T: [[a, b], [c, d]] };
  }

  const lam1 = (tr + Math.sqrt(disc)) / 2;
  // Find eigenvector for lam1
  let vx = -(A[0][1]), vy = A[0][0] - lam1;
  if (Math.abs(vx) < 1e-12 && Math.abs(vy) < 1e-12) {
    vx = A[1][1] - lam1; vy = -(A[1][0]);
  }
  const norm = Math.sqrt(vx * vx + vy * vy);
  if (norm < 1e-12) return { Q: [[1, 0], [0, 1]], T: A };
  const q1x = vx / norm, q1y = vy / norm;
  // q2 orthogonal to q1
  const q2x = -q1y, q2y = q1x;
  const Q = [[q1x, q2x], [q1y, q2y]];
  // T = Q^T A Q
  const QT = [[q1x, q1y], [q2x, q2y]];
  const AQ = [
    [A[0][0] * Q[0][0] + A[0][1] * Q[1][0], A[0][0] * Q[0][1] + A[0][1] * Q[1][1]],
    [A[1][0] * Q[0][0] + A[1][1] * Q[1][0], A[1][0] * Q[0][1] + A[1][1] * Q[1][1]],
  ];
  const T = [
    [QT[0][0] * AQ[0][0] + QT[0][1] * AQ[1][0], QT[0][0] * AQ[0][1] + QT[0][1] * AQ[1][1]],
    [QT[1][0] * AQ[0][0] + QT[1][1] * AQ[1][0], QT[1][0] * AQ[0][1] + QT[1][1] * AQ[1][1]],
  ];
  return { Q, T };
}

@Component({
  selector: 'app-step-schur-decomposition',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Schur 分解：至少是上三角" subtitle="§17.2">
      <p>
        不能對角化，退而求其次：能不能至少變成<strong>上三角</strong>？
      </p>
      <p>
        <strong>Schur 定理</strong>：任何方陣 A 都可以寫成
      </p>
      <p class="formula">A = Q T Q*</p>
      <p>
        其中 Q 是<strong>正交</strong>（或 unitary）矩陣，T 是<strong>上三角</strong>矩陣，
        T 的對角線上就是 A 的特徵值。
      </p>
      <p>
        注意：Schur 分解<strong>永遠成立</strong>。不像對角化需要「夠多特徵向量」。
        代價是 T 不一定是對角的——上三角裡可能有非零的超對角元素。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選不同矩陣，看 Schur 分解出什麼">
      <div class="preset-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="presetIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <div class="decomp">
        <div class="mat-card">
          <div class="mc-title">A</div>
          <table class="mc-table">
            @for (row of currentA(); track $index) {
              <tr>
                @for (v of row; track $index) {
                  <td>{{ fmt(v) }}</td>
                }
              </tr>
            }
          </table>
        </div>

        <span class="eq">=</span>

        <div class="mat-card q-card">
          <div class="mc-title">Q（正交）</div>
          <table class="mc-table">
            @for (row of result().Q; track $index) {
              <tr>
                @for (v of row; track $index) {
                  <td>{{ fmt(v) }}</td>
                }
              </tr>
            }
          </table>
        </div>

        <div class="mat-card t-card">
          <div class="mc-title">T（上三角）</div>
          <table class="mc-table">
            @for (row of result().T; track $index; let i = $index) {
              <tr>
                @for (v of row; track $index; let j = $index) {
                  <td [class.diag]="i === j" [class.super]="j > i && Math.abs(v) > 1e-8"
                      [class.zero]="i > j">{{ fmt(v) }}</td>
                }
              </tr>
            }
          </table>
        </div>

        <span class="eq">×</span>

        <div class="mat-card q-card">
          <div class="mc-title">Q*</div>
        </div>
      </div>

      <div class="desc">{{ presets[presetIdx()].desc }}</div>

      <div class="comparison">
        <div class="cmp-title">三種分解的比較</div>
        <table class="cmp-table">
          <thead>
            <tr><th></th><th>對角化</th><th>Schur</th><th>Jordan（下一節）</th></tr>
          </thead>
          <tbody>
            <tr>
              <th>存在性</th><td class="warn">不一定</td><td class="ok">永遠</td><td class="ok">永遠</td>
            </tr>
            <tr>
              <th>形式</th><td>對角 D</td><td>上三角 T</td><td>區塊對角 J</td>
            </tr>
            <tr>
              <th>唯一性</th><td class="ok">是</td><td class="warn">不唯一</td><td class="ok">是</td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Schur 告訴我們：上三角<strong>一定做得到</strong>。但上三角的超對角元素太多、沒有結構。
      </p>
      <p>
        我們能進一步約束嗎？<strong>Cayley-Hamilton 定理</strong>會告訴我們矩陣有多少「自由度」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .decomp { display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
      justify-content: center; margin-bottom: 12px; }
    .eq { font-size: 18px; color: var(--text-muted); }
    .mat-card { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
      &.q-card { border-color: rgba(110, 138, 168, 0.3); }
      &.t-card { border-color: rgba(200, 152, 59, 0.3); } }
    .mc-title { font-size: 11px; font-weight: 600; color: var(--text-muted);
      text-align: center; margin-bottom: 4px; }
    .mc-table { border-collapse: collapse; margin: 0 auto; }
    .mc-table td { padding: 5px 10px; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      border: 1px solid var(--border); text-align: center;
      &.diag { background: rgba(200, 152, 59, 0.15); color: #c8983b; }
      &.super { background: rgba(160, 90, 90, 0.1); color: #a05a5a; }
      &.zero { color: var(--text-muted); opacity: 0.3; } }

    .desc { padding: 10px; font-size: 12px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border);
      margin-bottom: 12px; }

    .comparison { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); }
    .cmp-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
    .cmp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cmp-table th { padding: 6px 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 600; }
    .cmp-table td { padding: 6px 8px; border-bottom: 1px solid var(--border);
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      &.ok { color: #5a8a5a; } &.warn { color: #c8983b; } }
  `,
})
export class StepSchurDecompositionComponent {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);

  readonly currentA = computed(() => PRESETS[this.presetIdx()].A);
  readonly result = computed(() => schur2x2(this.currentA()));

  fmt(v: number): string {
    if (Math.abs(v) < 1e-8) return '0';
    return v.toFixed(3);
  }
}
