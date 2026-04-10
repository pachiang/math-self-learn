import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { charPoly2x2, charPoly3x3, polyEvalMatrix, identity, matScale } from './jordan-util';

interface Preset { name: string; A: number[][]; }

const PRESETS: Preset[] = [
  { name: '2×2 一般', A: [[1, 2], [3, 4]] },
  { name: '2×2 缺陷', A: [[2, 1], [0, 2]] },
  { name: '3×3', A: [[2, 1, 0], [0, 2, 1], [0, 0, 3]] },
];

@Component({
  selector: 'app-step-cayley-hamilton',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Cayley-Hamilton 定理" subtitle="§17.3">
      <p>
        一個驚人的事實：
      </p>
      <p class="formula">每個矩陣都滿足自己的特徵方程</p>
      <p>
        如果 p(λ) = det(A − λI) 是 A 的特徵多項式，那麼把 λ 換成 A 代入——
      </p>
      <p class="formula">p(A) = 0（零矩陣）</p>
      <p>
        這叫 <strong>Cayley-Hamilton 定理</strong>。
        換句話說：A 的任何高次冪都能用低次冪的<strong>線性組合</strong>表示。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選矩陣，看 p(A) 怎麼一步步變成零矩陣">
      <div class="preset-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="presetIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <div class="poly-display">
        <div class="pd-title">特徵多項式 p(λ)</div>
        <div class="pd-formula">{{ polyStr() }}</div>
      </div>

      <div class="step-display">
        <div class="sd-title">計算 p(A)：逐項求和</div>
        @for (term of terms(); track $index; let i = $index) {
          <div class="term-row">
            <div class="term-coeff">{{ term.label }}</div>
            <div class="term-matrix">
              <table class="tm-table">
                @for (row of term.mat; track $index) {
                  <tr>
                    @for (v of row; track $index) {
                      <td [class.nonzero]="Math.abs(v) > 0.001">{{ fmt(v) }}</td>
                    }
                  </tr>
                }
              </table>
            </div>
          </div>
        }

        <div class="sum-row">
          <div class="sum-label">Σ = p(A)</div>
          <div class="sum-matrix">
            <table class="tm-table result">
              @for (row of pA(); track $index) {
                <tr>
                  @for (v of row; track $index) {
                    <td [class.zero]="Math.abs(v) < 0.001">{{ fmt(v) }}</td>
                  }
                </tr>
              }
            </table>
          </div>
          <div class="check">= 0 ✓</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Cayley-Hamilton 的一個重要推論：<strong>最小多項式</strong>。
      </p>
      <p>
        如果有一個更低次的多項式 m(λ) 使得 m(A) = 0，它叫 A 的最小多項式。
        最小多項式整除特徵多項式，而且它的根就是 A 的全部特徵值。
      </p>
      <p>
        對缺陷矩陣，最小多項式裡 (λ − λᵢ) 的冪次<strong>大於</strong>幾何重數——
        這正是「需要廣義特徵向量」的信號。下一節來看。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .poly-display { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); margin-bottom: 12px; text-align: center; }
    .pd-title { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
    .pd-formula { font-size: 15px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; }

    .step-display { border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); overflow: hidden; }
    .sd-title { padding: 10px 12px; font-size: 12px; font-weight: 600;
      color: var(--text-muted); border-bottom: 1px solid var(--border); }

    .term-row { display: flex; align-items: center; gap: 12px; padding: 8px 12px;
      border-bottom: 1px solid var(--border); }
    .term-coeff { font-size: 12px; font-weight: 700; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .term-matrix { flex: 1; }

    .tm-table { border-collapse: collapse; }
    .tm-table td { padding: 4px 8px; font-size: 12px; font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted); border: 1px solid var(--border); text-align: center;
      &.nonzero { color: var(--text); font-weight: 600; } }
    .tm-table.result td { font-weight: 700;
      &.zero { color: #5a8a5a; background: rgba(90, 138, 90, 0.08); } }

    .sum-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px;
      background: var(--accent-10); }
    .sum-label { font-size: 13px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .sum-matrix { flex: 1; }
    .check { font-size: 16px; font-weight: 700; color: #5a8a5a; }
  `,
})
export class StepCayleyHamiltonComponent {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);

  readonly currentA = computed(() => PRESETS[this.presetIdx()].A);

  readonly coeffs = computed(() => {
    const A = this.currentA();
    return A.length === 2 ? charPoly2x2(A) : charPoly3x3(A);
  });

  readonly polyStr = computed(() => {
    const c = this.coeffs();
    const parts: string[] = [];
    for (let i = 0; i < c.length; i++) {
      const v = c[i];
      if (Math.abs(v) < 1e-10) continue;
      const sign = v > 0 && parts.length > 0 ? '+' : '';
      const coeff = Math.abs(v - Math.round(v)) < 1e-8 ? String(Math.round(v)) : v.toFixed(2);
      const power = i === 0 ? '' : i === 1 ? 'λ' : `λ${superscript(i)}`;
      parts.push(`${sign}${coeff}${power}`);
    }
    return parts.join(' ') || '0';
  });

  readonly terms = computed(() => {
    const A = this.currentA();
    const c = this.coeffs();
    const n = A.length;
    const result: { label: string; mat: number[][] }[] = [];
    let power = identity(n);
    for (let i = 0; i < c.length; i++) {
      const scaled = matScale(power, c[i]);
      const pStr = i === 0 ? 'I' : i === 1 ? 'A' : `A${superscript(i)}`;
      const cStr = Math.abs(c[i] - Math.round(c[i])) < 1e-8 ? String(Math.round(c[i])) : c[i].toFixed(2);
      result.push({ label: `${cStr} · ${pStr}`, mat: scaled });
      if (i < c.length - 1) {
        power = matMul2(power, A);
      }
    }
    return result;
  });

  readonly pA = computed(() => polyEvalMatrix(this.coeffs(), this.currentA()));

  fmt(v: number): string {
    if (Math.abs(v) < 1e-8) return '0';
    if (Math.abs(v - Math.round(v)) < 1e-6) return String(Math.round(v));
    return v.toFixed(2);
  }
}

function superscript(n: number): string {
  const map: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵' };
  return String(n).split('').map((c) => map[c] ?? c).join('');
}

function matMul2(A: number[][], B: number[][]): number[][] {
  const m = A.length, k = B.length, n = B[0].length;
  const C: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let l = 0; l < k; l++) C[i][j] += A[i][l] * B[l][j];
  return C;
}
