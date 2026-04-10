import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Preset { name: string; A: number[][]; desc: string; diag: boolean; }

const PRESETS: Preset[] = [
  { name: '可對角化（相異）', A: [[3, 1], [0, 1]], desc: '兩個相異特徵值 → 兩個獨立特徵向量 → 可對角化', diag: true },
  { name: '可對角化（重複）', A: [[2, 0], [0, 2]], desc: 'λ=2 重複兩次，但特徵空間是整個 R²（2 維）→ 可對角化', diag: true },
  { name: '缺陷矩陣', A: [[2, 1], [0, 2]], desc: 'λ=2 重複兩次，但特徵空間只有 1 維 → 無法對角化！', diag: false },
  { name: '缺陷（可調）', A: [[2, 1], [0, 2]], desc: '拖動 ε 看特徵值從相異變重複', diag: false },
];

// Apply A to a grid of points
function transformGrid(A: number[][], pts: [number, number][]): [number, number][] {
  return pts.map(([x, y]) => [
    A[0][0] * x + A[0][1] * y,
    A[1][0] * x + A[1][1] * y,
  ]);
}

@Component({
  selector: 'app-step-defective-matrix',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="對角化失敗了" subtitle="§17.1">
      <p>
        第六章你學過：如果 A 有 n 個線性獨立的特徵向量，就能寫成 A = PDP⁻¹。
        但如果特徵值<strong>重複</strong>而且特徵向量<strong>不夠多</strong>呢？
      </p>
      <p>
        最經典的例子：
      </p>
      <p class="formula">
        A = [2, 1; 0, 2]
      </p>
      <p>
        特徵值 λ = 2（重數 2），但只有一個特徵向量方向 [1, 0]。
        <strong>一個方向不足以構成 R² 的基底</strong>——對角化不可能。
      </p>
      <p>
        這種矩陣叫做<strong>缺陷矩陣</strong>（defective matrix）。
        第九章的 ODE 裡，它對應的是「重根」的情形——我們當時跳過了。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選不同矩陣，看哪些能對角化、哪些不能">
      <div class="preset-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="loadPreset(i)">{{ p.name }}</button>
        }
      </div>

      @if (presetIdx() === 3) {
        <div class="eps-row">
          <span class="eps-label">ε = {{ eps().toFixed(3) }}</span>
          <input type="range" min="-1" max="1" step="0.01" [value]="eps()"
                 (input)="onEps($event)" class="eps-slider" />
        </div>
      }

      <div class="layout">
        <div class="svg-panel">
          <svg viewBox="-4 -4 8 8" class="grid-svg">
            <!-- Grid lines (original) -->
            @for (line of gridLines; track line.key) {
              <line [attr.x1]="line.x1" [attr.y1]="line.y1" [attr.x2]="line.x2" [attr.y2]="line.y2"
                    stroke="var(--border)" stroke-width="0.02" stroke-opacity="0.3" />
            }
            <!-- Transformed grid -->
            @for (line of transformedLines(); track line.key) {
              <line [attr.x1]="line.x1" [attr.y1]="line.y1" [attr.x2]="line.x2" [attr.y2]="line.y2"
                    stroke="var(--accent)" stroke-width="0.03" stroke-opacity="0.5" />
            }
            <!-- Eigenvector directions -->
            @for (ev of eigenvectors(); track $index) {
              <line [attr.x1]="-ev[0] * 4" [attr.y1]="-ev[1] * 4"
                    [attr.x2]="ev[0] * 4" [attr.y2]="ev[1] * 4"
                    stroke="#c8983b" stroke-width="0.06" stroke-dasharray="0.15 0.1" />
            }
          </svg>
        </div>

        <div class="info-panel">
          <div class="mat-display">
            <div class="md-title">A =</div>
            <table class="md-table">
              @for (row of currentA(); track $index) {
                <tr>
                  @for (v of row; track $index) {
                    <td>{{ v.toFixed(2) }}</td>
                  }
                </tr>
              }
            </table>
          </div>

          <div class="eigen-info">
            <div class="ei-title">特徵值</div>
            <div class="ei-vals">
              @for (ev of eigenvalues(); track $index) {
                <span class="ev-chip">λ = {{ ev.toFixed(3) }}</span>
              }
            </div>
          </div>

          <div class="eigen-info">
            <div class="ei-title">獨立特徵向量</div>
            <div class="ei-vals">
              <span class="ev-count" [class.ok]="eigenvectors().length >= 2"
                    [class.bad]="eigenvectors().length < 2">
                {{ eigenvectors().length }} 個
                @if (eigenvectors().length < 2) {
                  （不足！）
                }
              </span>
            </div>
          </div>

          <div class="verdict" [class.ok]="canDiag()" [class.bad]="!canDiag()">
            @if (canDiag()) {
              ✓ 可以對角化
            } @else {
              ✗ 無法對角化 — 缺陷矩陣
            }
          </div>

          <div class="desc">{{ presets[presetIdx()].desc }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        如果你選「可調」模式然後把 ε 從正慢慢拉到 0：兩個不同的特徵值<strong>合併</strong>了，
        但特徵向量數量從 2 變成 1。這就是缺陷發生的瞬間。
      </p>
      <p>
        那怎麼辦？如果不能對角化，有沒有<strong>退而求其次</strong>的簡單形式？
        下一節先看一個「至少能做到上三角」的分解——<strong>Schur 分解</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .eps-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
      padding: 8px 12px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border); }
    .eps-label { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 110px; }
    .eps-slider { flex: 1; accent-color: var(--accent); }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .svg-panel { display: flex; justify-content: center; }
    .grid-svg { width: 100%; max-width: 300px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }

    .info-panel { display: flex; flex-direction: column; gap: 10px; }
    .mat-display { display: flex; align-items: center; gap: 10px; padding: 10px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .md-title { font-size: 14px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .md-table { border-collapse: collapse; }
    .md-table td { padding: 6px 12px; font-size: 14px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      border: 1px solid var(--border); text-align: center; }

    .eigen-info { padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); }
    .ei-title { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
    .ev-chip { padding: 3px 8px; border-radius: 4px; font-size: 12px;
      font-family: 'JetBrains Mono', monospace; background: var(--accent-10); color: var(--accent);
      margin-right: 6px; }
    .ev-count { font-size: 13px; font-weight: 700;
      &.ok { color: #5a8a5a; } &.bad { color: #a05a5a; } }

    .verdict { padding: 10px; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 700;
      &.ok { background: rgba(90, 138, 90, 0.1); color: #5a8a5a; }
      &.bad { background: rgba(160, 90, 90, 0.1); color: #a05a5a; } }

    .desc { font-size: 12px; color: var(--text-secondary); padding: 8px 12px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepDefectiveMatrixComponent {
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly eps = signal(0.5);

  readonly currentA = computed<number[][]>(() => {
    if (this.presetIdx() === 3) {
      return [[2, 1], [0, 2 + this.eps()]];
    }
    return PRESETS[this.presetIdx()].A;
  });

  readonly eigenvalues = computed(() => {
    const A = this.currentA();
    const tr = A[0][0] + A[1][1];
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    const disc = tr * tr - 4 * det;
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      const e1 = (tr + sq) / 2, e2 = (tr - sq) / 2;
      return Math.abs(e1 - e2) < 1e-8 ? [e1] : [e1, e2];
    }
    return [(tr) / 2]; // complex — show real part
  });

  readonly eigenvectors = computed(() => {
    const A = this.currentA();
    const evs: number[][] = [];
    const seen = new Set<string>();
    for (const lam of this.eigenvalues()) {
      // (A - λI)v = 0
      const a = A[0][0] - lam, b = A[0][1];
      const c = A[1][0], d = A[1][1] - lam;
      let v: number[];
      if (Math.abs(a) > 1e-8 || Math.abs(b) > 1e-8) {
        v = [-b, a];
      } else if (Math.abs(c) > 1e-8 || Math.abs(d) > 1e-8) {
        v = [-d, c];
      } else {
        // Entire space is eigenspace (scalar matrix)
        evs.push([1, 0], [0, 1]);
        return evs;
      }
      const norm = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
      if (norm > 1e-10) {
        const nv = [v[0] / norm, v[1] / norm];
        const key = `${Math.abs(nv[0]).toFixed(4)},${Math.abs(nv[1]).toFixed(4)}`;
        if (!seen.has(key)) { seen.add(key); evs.push(nv); }
      }
    }
    return evs;
  });

  readonly canDiag = computed(() => this.eigenvectors().length >= 2);

  // Grid lines for visualization
  readonly gridLines = (() => {
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = -3; i <= 3; i++) {
      lines.push({ key: `h${i}`, x1: -4, y1: i, x2: 4, y2: i });
      lines.push({ key: `v${i}`, x1: i, y1: -4, x2: i, y2: 4 });
    }
    return lines;
  })();

  readonly transformedLines = computed(() => {
    const A = this.currentA();
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = -3; i <= 3; i++) {
      // Horizontal line y=i: transform endpoints
      const [hx1, hy1] = [A[0][0] * (-4) + A[0][1] * i, A[1][0] * (-4) + A[1][1] * i];
      const [hx2, hy2] = [A[0][0] * 4 + A[0][1] * i, A[1][0] * 4 + A[1][1] * i];
      lines.push({ key: `th${i}`, x1: hx1, y1: hy1, x2: hx2, y2: hy2 });
      // Vertical line x=i
      const [vx1, vy1] = [A[0][0] * i + A[0][1] * (-4), A[1][0] * i + A[1][1] * (-4)];
      const [vx2, vy2] = [A[0][0] * i + A[0][1] * 4, A[1][0] * i + A[1][1] * 4];
      lines.push({ key: `tv${i}`, x1: vx1, y1: vy1, x2: vx2, y2: vy2 });
    }
    return lines;
  });

  loadPreset(i: number): void {
    this.presetIdx.set(i);
    if (i === 3) this.eps.set(0.5);
  }

  onEps(ev: Event): void {
    this.eps.set(+(ev.target as HTMLInputElement).value);
  }
}
