import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; }

function trueFunction(x: number): number {
  return 0.4 * Math.sin(1.5 * x) - 0.2 * x;
}

function makeDataPoints(seed: number, n: number = 8): Pt[] {
  let s = seed | 0;
  const rand = (): number => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 0xffffffff) - 0.5;
  };
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const x = -3 + (i + 0.5 + rand() * 0.4) * 6 / n;
    pts.push({ x, y: trueFunction(x) + rand() * 0.5 });
  }
  return pts;
}

/** Solve (Aᵀ A + λI) x = Aᵀ b. */
function solveRidge(A: number[][], b: number[], lambda: number): number[] {
  const n = A[0].length;
  const m = A.length;
  const ATA: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const ATb: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let k = 0; k < m; k++) s += A[k][i] * A[k][j];
      ATA[i][j] = s + (i === j ? lambda : 0);
    }
    let s = 0;
    for (let k = 0; k < m; k++) s += A[k][i] * b[k];
    ATb[i] = s;
  }
  return gauss(ATA, ATb);
}

function gauss(M: number[][], b: number[]): number[] {
  const n = M.length;
  const A = M.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    if (Math.abs(A[i][i]) < 1e-12) continue;
    for (let k = i + 1; k < n; k++) {
      const f = A[k][i] / A[i][i];
      for (let j = i; j <= n; j++) A[k][j] -= f * A[i][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = A[i][n];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = Math.abs(A[i][i]) < 1e-12 ? 0 : s / A[i][i];
  }
  return x;
}

@Component({
  selector: 'app-step-ridge',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Ridge \u6B63\u5247\u5316" subtitle="\u00A713.3">
      <p>
        \u8981\u907F\u514D\u904E\u64EC\u5408\uFF0C\u6700\u7C21\u55AE\u7684\u624B\u6CD5\u53EB\u300CRidge \u6B63\u5247\u5316\u300D\uFF08\u6709\u6642\u5019\u53EB\u5409\u6CDB\u8FF4\u6B78\uFF09\u3002
      </p>
      <p>
        \u539F\u672C\u7684\u6700\u5C0F\u5E73\u65B9\u7A2E\u8B93\u4F60\u6700\u5C0F\u5316\uFF1A
      </p>
      <p class="formula">L(x) = \u2225Ax \u2212 b\u2225\u00B2</p>
      <p>
        Ridge \u52A0\u4E0A\u4E00\u500B<strong>\u5C0D\u4FC2\u6578\u5927\u5C0F\u7684\u8655\u7F70\u9805</strong>\uFF1A
      </p>
      <p class="formula big">L(x) = \u2225Ax \u2212 b\u2225\u00B2 + \u03BB \u2225x\u2225\u00B2</p>
      <p>
        \u3008\u3009\u52F5\u300C\u4FC2\u6578\u8B8A\u5C0F\u300D\u3002\u03BB \u8D8A\u5927\u5C31\u8D8A\u9F13\u52F5\u3002
      </p>
      <p>
        \u9019\u500B\u6539\u8B8A\u4E00\u500B\u4E8B\uFF1A\u6A5F\u985E\u898F\u65B9\u7A0B\u8B8A\u6210
      </p>
      <p class="formula big">(Aᵀ A + \u03BB I) x = Aᵀ b</p>
      <p>
        \u8DDF\u539F\u672C\u53EA\u5DEE\u4E00\u500B \u03BB I \u9805\u3002\u9019\u500B\u9805\u8B93 Aᵀ A \u8B8A\u5F97<strong>\u66F4\u53EF\u9006</strong>\uFF08\u4FDD\u8B49\u53EF\u4EE5\u89E3\uFF09\uFF0C
        \u4E26\u4E14\u300C\u62C9\u3008\u3009\u3008\u3009\u3008\u3009\u300D\u4FC2\u6578\u671D\u96F6\u9760\u8FD1\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 \u03BB \u770B\u300C\u904E\u64EC\u5408\u300D\u600E\u9EBC\u88AB\u300C\u5343\u900F\u300D">
      <div class="grid-wrap">
        <svg viewBox="-150 -130 300 260" class="reg-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-120" [attr.y1]="g" [attr.x2]="120" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-130" y1="0" x2="130" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- True function -->
          <path [attr.d]="truePath" fill="none" stroke="var(--text-muted)" stroke-width="1.5"
            stroke-dasharray="3 3" opacity="0.6" />

          <!-- Fit -->
          <path [attr.d]="fitPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

          <!-- Data -->
          @for (p of points; track $index) {
            <circle [attr.cx]="p.x * 25" [attr.cy]="-p.y * 25" r="5"
              fill="var(--v1)" stroke="white" stroke-width="2" />
          }
        </svg>
      </div>

      <div class="d-row">
        <span class="d-lab">\u968E\u6578 d =</span>
        <input type="range" min="1" max="12" step="1" [value]="degree()"
          (input)="degree.set(+$any($event).target.value)" />
        <span class="d-val">{{ degree() }}</span>
      </div>
      <div class="d-row">
        <span class="d-lab">\u03BB =</span>
        <input type="range" min="-6" max="2" step="0.1" [value]="logLambda()"
          (input)="logLambda.set(+$any($event).target.value)" />
        <span class="d-val">{{ lambda().toFixed(4) }}</span>
      </div>

      <div class="presets">
        <button class="pst" (click)="setLambda(0)">\u03BB = 0\uFF08\u7121\u6B63\u5247\u5316\uFF09</button>
        <button class="pst" (click)="setLambda(0.001)">\u03BB = 0.001</button>
        <button class="pst" (click)="setLambda(0.1)">\u03BB = 0.1</button>
        <button class="pst" (click)="setLambda(10)">\u03BB = 10</button>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">\u8A13\u7DF4\u8AA4\u5DEE</span>
          <span class="iv">{{ trainErr().toFixed(4) }}</span>
        </div>
        <div class="info-row">
          <span class="il">\u4FC2\u6578\u9577\u5EA6</span>
          <span class="iv">\u2225x\u2225 = <strong>{{ coeffNorm().toFixed(3) }}</strong></span>
        </div>
        <div class="info-row big">
          <span class="il">\u72C0\u614B</span>
          <span class="iv plain">
            @if (lambda() < 0.001 && degree() >= 8) { \u904E\u64EC\u5408\uFF1A\u4FC2\u6578\u8B8A\u5F97\u8D85\u5927\uFF0C\u66F2\u7DDA\u72C2\u9837 }
            @else if (lambda() > 1) { \u6B20\u64EC\u5408\uFF1A\u6B63\u5247\u5316\u592A\u5F37\uFF0C\u8B8A\u6210\u63A5\u8FD1\u76F4\u7DDA }
            @else { \u9069\u5408 }
          </span>
        </div>
      </div>

      <div class="key-insight">
        \u5C0D\u6BD4\u8A66\u8A66\uFF1A\u8B93 d = 12\uFF0C\u7136\u5F8C\u5728 \u03BB = 0 \u8DDF \u03BB = 0.1 \u4E4B\u9593\u5207\u63DB\u3002
        \u4F60\u770B\u5230\u300C\u540C\u6A23\u7684 12 \u968E\u591A\u9805\u5F0F\u300D\u53EF\u4EE5\u662F\u6D41\u91D1\u9F8D\u7684\u904E\u64EC\u5408\u6216\u6E29\u5BB6\u7684\u9069\u5408 \u2014 \u95DC\u9375\u5728\u6B63\u5247\u5316\u3002
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u500B\u300C\u52A0 \u03BB I\u300D\u9019\u9EBC\u7C21\u55AE\u7684\u52D5\u4F5C\u80CC\u5F8C\u6709\u5F88\u591A\u8AAA\u6CD5\uFF1A
      </p>
      <ul>
        <li><strong>\u4EE3\u6578\u4E0A</strong>\uFF1A\u4FDD\u8B49 ATA + \u03BB I \u53EF\u9006\uFF0C\u5373\u4F7F A \u672C\u8EAB\u4E0D\u662F\u6EFF\u79E9</li>
        <li><strong>\u5E7E\u4F55\u4E0A</strong>\uFF1A\u8B93\u89E3\u671D\u539F\u9EDE\u9760\u8FD1 \u2014 \u5728\u300C\u8AA4\u5DEE\u300D\u8DDF\u300C\u4FC2\u6578\u5927\u5C0F\u300D\u4E4B\u9593\u53D6\u5E73\u8861</li>
        <li><strong>\u8CDD\u8AAA\u4E0A</strong>\uFF1A\u8DDF\u300C\u9AD8\u65AF\u5148\u9A57\u300D\u7684\u8CA0\u5C0D\u6578\u4F3C\u7136\u3001\u6700\u5927\u5F8C\u9A57\u4F30\u8A08\u540C\u4E00\u4EF6\u4E8B</li>
      </ul>
      <p>
        Ridge \u662F\u6700\u7C21\u55AE\u7684\u6B63\u5247\u5316\uFF0C\u4F46\u4ED6\u4E5F\u662F\u4E4D\u4ECA\u6700\u8AB0\u53EF\u4EFB\u7684\u3002\u4E0D\u7BA1\u4F60\u662F\u5728\u5BEB\u4F60\u7684\u7B2C\u4E00\u500B\u7DDA\u6027\u56DE\u6B78\u9084\u662F\u8A13\u7DF4\u4E00\u500B\u5341\u5104\u53C3\u6578\u7684\u8A9E\u8A00\u6A21\u578B\uFF0C\u9019\u500B\u539F\u5247\u90FD\u9069\u7528\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7Bc0\u770B\u53E6\u4E00\u500B\u91CD\u8981\u7684 ML \u539F\u578B\uFF1A<strong>\u908F\u8F2F\u56DE\u6B78</strong>\u3002\u9019\u662F\u7B2C\u4E00\u500B\u300C\u5206\u985E\u300D\u6A21\u578B\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.big { font-size: 18px; padding: 16px; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .reg-svg { width: 100%; max-width: 380px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }

    .d-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 8px; }
    .d-lab { font-size: 13px; font-weight: 700; color: var(--accent); min-width: 60px;
      font-family: 'Noto Sans Math', serif; }
    .d-row input { flex: 1; accent-color: var(--accent); }
    .d-val { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace;
      min-width: 64px; text-align: right; }

    .presets { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .pst { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .info-row { display: grid; grid-template-columns: 100px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      &.plain { font-family: inherit; } }
    .iv strong { color: var(--accent); }

    .key-insight { padding: 12px 16px; border-radius: 8px;
      background: var(--accent-10); border: 1px dashed var(--accent-30);
      font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
  `,
})
export class StepRidgeComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly points = makeDataPoints(7, 8);

  readonly degree = signal(10);
  readonly logLambda = signal(-3);
  readonly lambda = computed(() => Math.pow(10, this.logLambda()));

  setLambda(v: number): void {
    if (v <= 0) this.logLambda.set(-6);
    else this.logLambda.set(Math.log10(v));
  }

  readonly truePath = (() => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = -4 + (i / 100) * 8;
      const y = trueFunction(x);
      pts.push(`${(x * 25).toFixed(1)},${(-y * 25).toFixed(1)}`);
    }
    return 'M ' + pts.join(' L ');
  })();

  readonly coeffs = computed(() => {
    const d = this.degree();
    const A: number[][] = [];
    const b: number[] = [];
    for (const p of this.points) {
      const row: number[] = [];
      for (let k = 0; k <= d; k++) row.push(Math.pow(p.x, k));
      A.push(row);
      b.push(p.y);
    }
    return solveRidge(A, b, this.lambda());
  });

  readonly fitPath = computed(() => {
    const c = this.coeffs();
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = -4 + (i / 200) * 8;
      let y = 0;
      let xk = 1;
      for (const ci of c) {
        y += ci * xk;
        xk *= x;
      }
      pts.push(`${(x * 25).toFixed(1)},${(-Math.max(-130, Math.min(130, y * 25))).toFixed(1)}`);
    }
    return 'M ' + pts.join(' L ');
  });

  readonly trainErr = computed(() => {
    const c = this.coeffs();
    let s = 0;
    for (const p of this.points) {
      let yhat = 0;
      let xk = 1;
      for (const ci of c) {
        yhat += ci * xk;
        xk *= p.x;
      }
      s += (p.y - yhat) ** 2;
    }
    return s;
  });

  readonly coeffNorm = computed(() => {
    const c = this.coeffs();
    return Math.sqrt(c.reduce((s, v) => s + v * v, 0));
  });
}
