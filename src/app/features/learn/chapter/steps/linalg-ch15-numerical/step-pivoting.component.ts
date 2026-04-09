import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { luDecompose, luSolve, roundSig, matVec, vecSub, vecNorm } from './numerical-util';

interface Example { name: string; A: number[][]; b: number[]; trueX: number[]; }

const EXAMPLES: Example[] = [
  {
    name: '經典病態',
    A: [[0.0001, 1], [1, 1]],
    b: [1, 2],
    trueX: [1.00010001, 0.99989999],
  },
  {
    name: '小樞軸',
    A: [[1e-8, 1, 1], [1, 1, 2], [1, 2, 1]],
    b: [2, 4, 4],
    trueX: [2, 1, 1],
  },
];

function solveWithPrecision(A: number[][], b: number[], pivot: boolean, precision: number): {
  x: number[];
  error: number;
  steps: string[];
} {
  // Round the matrix to limited precision
  const n = A.length;
  const Ar = A.map((r) => r.map((v) => roundSig(v, precision)));
  const br = b.map((v) => roundSig(v, precision));

  const { L, U, steps } = luDecompose(Ar, pivot);
  const x = luSolve(L, U, br).map((v) => roundSig(v, precision));
  const residual = vecSub(matVec(A, x), b);
  return {
    x,
    error: vecNorm(residual),
    steps: steps.map((s) => s.desc),
  };
}

@Component({
  selector: 'app-step-pivoting',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="樞軸選取與穩定性" subtitle="§15.4">
      <p>
        LU 分解有個致命弱點：如果要除以的「樞軸」很小（接近 0），
        捨入誤差會被<strong>放大到不可收拾</strong>。
      </p>
      <p>
        解法很簡單：<strong>部分樞軸選取</strong>——每次消去前，先把下面「最大的」那一列
        交換上來當樞軸。
      </p>
      <p class="formula">PA = LU</p>
      <p>
        多了一個置換矩陣 P（記錄列交換），但穩定性大幅提升。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看同一個矩陣，有沒有樞軸選取差多少">
      <div class="ctrl-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="exIdx() === i" (click)="exIdx.set(i)">{{ ex.name }}</button>
        }
        <div class="prec-ctrl">
          <span class="prec-label">模擬精度 p = {{ precision() }}</span>
          <input type="range" min="3" max="15" step="1" [value]="precision()"
                 (input)="onPrec($event)" class="prec-slider" />
        </div>
      </div>

      <div class="compare">
        <div class="col">
          <div class="col-title bad">❌ 無樞軸選取</div>
          <div class="result-block">
            <div class="r-label">計算的 x：</div>
            <div class="r-vals">
              @for (v of noPivot().x; track $index) {
                <span class="r-v">{{ v.toFixed(6) }}</span>
              }
            </div>
            <div class="r-label">殘差 |Ax−b|：</div>
            <div class="r-err" [class.bad]="noPivot().error > 0.01">{{ noPivot().error.toExponential(2) }}</div>
          </div>
        </div>

        <div class="col">
          <div class="col-title good">✓ 有樞軸選取</div>
          <div class="result-block">
            <div class="r-label">計算的 x：</div>
            <div class="r-vals">
              @for (v of withPivot().x; track $index) {
                <span class="r-v">{{ v.toFixed(6) }}</span>
              }
            </div>
            <div class="r-label">殘差 |Ax−b|：</div>
            <div class="r-err good">{{ withPivot().error.toExponential(2) }}</div>
          </div>
        </div>
      </div>

      <div class="true-x">
        真正的解 x = [{{ currentEx().trueX.join(', ') }}]
      </div>

      <div class="bar-compare">
        <div class="bar-label">殘差比較</div>
        <div class="bars">
          <div class="bar-row">
            <span class="bar-name">無樞軸</span>
            <div class="bar-bg"><div class="bar bad" [style.width.%]="noPivotBarPct()"></div></div>
          </div>
          <div class="bar-row">
            <span class="bar-name">有樞軸</span>
            <div class="bar-bg"><div class="bar good" [style.width.%]="pivotBarPct()"></div></div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        現代的數值程式庫（LAPACK、numpy）做 LU 時<strong>永遠</strong>帶樞軸選取。
        這是一個「幾乎零成本」但「巨大穩定性增益」的技巧。
      </p>
      <p>
        下一節看另一種分解——<strong>QR</strong>——他天生就比 LU 更穩定。
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
    .prec-ctrl { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .prec-label { font-size: 12px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 120px; }
    .prec-slider { width: 100px; accent-color: var(--accent); }

    .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    @media (max-width: 600px) { .compare { grid-template-columns: 1fr; } }
    .col { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .col-title { padding: 8px 12px; font-size: 12px; font-weight: 700; text-align: center;
      &.bad { background: rgba(160, 90, 90, 0.12); color: #a05a5a; }
      &.good { background: rgba(90, 138, 90, 0.12); color: #5a8a5a; } }
    .result-block { padding: 10px 12px; }
    .r-label { font-size: 11px; color: var(--text-muted); margin-top: 6px; }
    .r-vals { display: flex; gap: 8px; flex-wrap: wrap; margin: 4px 0; }
    .r-v { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; padding: 3px 8px; background: var(--bg-surface);
      border-radius: 4px; }
    .r-err { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      margin: 4px 0; color: var(--text);
      &.bad { color: #a05a5a; }
      &.good { color: #5a8a5a; } }

    .true-x { text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 12px;
      font-family: 'JetBrains Mono', monospace; }

    .bar-compare { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .bar-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
    .bar-row { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
    .bar-name { font-size: 11px; color: var(--text-muted); min-width: 55px;
      font-family: 'JetBrains Mono', monospace; }
    .bar-bg { flex: 1; height: 14px; background: var(--bg); border-radius: 4px;
      border: 1px solid var(--border); overflow: hidden; }
    .bar { height: 100%; border-radius: 3px; min-width: 2px; transition: width 0.3s;
      &.bad { background: #a05a5a; }
      &.good { background: #5a8a5a; } }
  `,
})
export class StepPivotingComponent {
  readonly examples = EXAMPLES;
  readonly exIdx = signal(0);
  readonly precision = signal(6);

  readonly currentEx = computed(() => EXAMPLES[this.exIdx()]);

  readonly noPivot = computed(() =>
    solveWithPrecision(this.currentEx().A, this.currentEx().b, false, this.precision()),
  );

  readonly withPivot = computed(() =>
    solveWithPrecision(this.currentEx().A, this.currentEx().b, true, this.precision()),
  );

  readonly noPivotBarPct = computed(() => {
    const maxErr = Math.max(this.noPivot().error, this.withPivot().error, 1e-15);
    return Math.min(100, (this.noPivot().error / maxErr) * 100);
  });

  readonly pivotBarPct = computed(() => {
    const maxErr = Math.max(this.noPivot().error, this.withPivot().error, 1e-15);
    return Math.min(100, (this.withPivot().error / maxErr) * 100);
  });

  onPrec(ev: Event): void {
    this.precision.set(+(ev.target as HTMLInputElement).value);
  }
}
