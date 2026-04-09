import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { svd, reconstructLowRank, frobenius, frobeniusError, SVDResult } from './svd-util';

// A 6×6 example matrix where the singular values decay nicely
function makeMatrix(): number[][] {
  const M: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const row: number[] = [];
    for (let j = 0; j < 6; j++) {
      // A signal + secondary structure
      row.push(
        2 * Math.cos((i * Math.PI) / 5) * Math.cos((j * Math.PI) / 5) +
        Math.cos((2 * i * Math.PI) / 5) * Math.cos((2 * j * Math.PI) / 5) +
        0.4 * Math.sin((i + j) * 0.5),
      );
    }
    M.push(row);
  }
  return M;
}

function colorFor(v: number, vmax: number): string {
  // Map [-vmax, +vmax] to a diverging blue–white–red colour scale
  const t = Math.max(-1, Math.min(1, v / vmax));
  if (t >= 0) {
    const c = Math.round(255 - t * 130);
    return `rgb(${255}, ${c}, ${c})`;
  } else {
    const c = Math.round(255 + t * 130);
    return `rgb(${c}, ${c}, 255)`;
  }
}

@Component({
  selector: 'app-step-low-rank',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u4F4E\u79E9\u8FD1\u4F3C\uFF1AEckart\u2013Young \u5B9A\u7406" subtitle="\u00A78.4">
      <p>
        SVD \u8B93\u6211\u5011\u80FD\u300C\u4F4E\u79E9\u8FD1\u4F3C\u300D\u4E00\u500B\u77E9\u9663\u3002\u5BEB\u6210\u516C\u5F0F\uFF1A
      </p>
      <p class="formula">A = \u03C3\u2081 u\u2081 v\u2081\u1D40 + \u03C3\u2082 u\u2082 v\u2082\u1D40 + ... + \u03C3\u1D63 u\u1D63 v\u1D63\u1D40</p>
      <p>
        \u4E5F\u5C31\u662F\u8AAA\uFF0CA \u662F r \u500B<strong>\u79E9\u4E00\u77E9\u9663</strong>\u7684\u52A0\u7E3D\u3002\u9019\u4E9B\u9805\u88AB\u300C\u91CD\u8981\u6027\u300D\u6392\u5E8F\uFF1A\u03C3\u2081 \u6700\u5927\uFF0C\u03C3\u1D63 \u6700\u5C0F\u3002
      </p>
      <p>
        <strong>Eckart\u2013Young \u5B9A\u7406</strong>\uFF1A\u53EA\u4FDD\u7559\u524D k \u500B\u9805\uFF0C\u4F60\u5C31\u5F97\u5230\u4E86 A \u7684\u300C\u6700\u4F73 rank-k \u8FD1\u4F3C\u300D\uFF08Frobenius \u8AA4\u5DEE\u6700\u5C0F\uFF09\u3002
      </p>
      <p class="formula">A\u2096 = \u03C3\u2081 u\u2081 v\u2081\u1D40 + ... + \u03C3\u2096 u\u2096 v\u2096\u1D40</p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 k \u6ED1\u6876\uFF0C\u770B\u4F4E\u79E9\u8FD1\u4F3C\u600E\u9EBC\u9010\u6B65\u9084\u539F\u539F\u59CB\u77E9\u9663">
      <div class="grids">
        <div class="grid-block">
          <div class="grid-title">\u539F\u59CB A</div>
          <svg viewBox="0 0 180 180" class="mat-svg">
            @for (row of original; track $index; let i = $index) {
              @for (val of row; track $index; let j = $index) {
                <rect [attr.x]="j * 30" [attr.y]="i * 30" width="29" height="29"
                  [attr.fill]="colorFor(val, vmax)" stroke="var(--bg)" stroke-width="0.5" />
                <text [attr.x]="j * 30 + 14.5" [attr.y]="i * 30 + 18" class="cell-text">{{ val.toFixed(1) }}</text>
              }
            }
          </svg>
        </div>

        <div class="grid-block">
          <div class="grid-title">A\u2096 (rank {{ k() }})</div>
          <svg viewBox="0 0 180 180" class="mat-svg">
            @for (row of approx(); track $index; let i = $index) {
              @for (val of row; track $index; let j = $index) {
                <rect [attr.x]="j * 30" [attr.y]="i * 30" width="29" height="29"
                  [attr.fill]="colorFor(val, vmax)" stroke="var(--bg)" stroke-width="0.5" />
                <text [attr.x]="j * 30 + 14.5" [attr.y]="i * 30 + 18" class="cell-text">{{ val.toFixed(1) }}</text>
              }
            }
          </svg>
        </div>
      </div>

      <div class="k-row">
        <span class="k-lab">\u4FDD\u7559\u524D k \u500B\u5947\u7570\u503C\uFF1Ak =</span>
        <input type="range" min="1" max="6" step="1" [value]="k()" (input)="k.set(+$any($event).target.value)" />
        <span class="k-val">{{ k() }}</span>
      </div>

      <div class="sigmas">
        <div class="sig-title">\u5947\u7570\u503C\uFF08\u4F60\u4FDD\u7559\u7684 = \u5BE6\u5FC3\uFF0C\u4E1F\u6389\u7684 = \u900F\u660E\uFF09</div>
        <div class="sig-bars">
          @for (s of svdResult.S; track $index; let i = $index) {
            <div class="sig-col">
              <div class="sig-bar"
                [class.kept]="i < k()"
                [style.height.px]="(s / svdResult.S[0]) * 70"></div>
              <div class="sig-num">\u03C3{{ subscriptOf(i+1) }}</div>
              <div class="sig-val">{{ s.toFixed(2) }}</div>
            </div>
          }
        </div>
      </div>

      <div class="error-row">
        <div class="er-row">
          <span class="er-l">Frobenius \u8AA4\u5DEE \u2225 A \u2212 A\u2096 \u2225</span>
          <span class="er-v">{{ error().toFixed(3) }}</span>
        </div>
        <div class="er-row">
          <span class="er-l">\u76F8\u5C0D\u8AA4\u5DEE</span>
          <span class="er-v">{{ ((error() / origNorm) * 100).toFixed(1) }}%</span>
        </div>
        <div class="er-row">
          <span class="er-l">\u5132\u5B58 (\u539F\u672C / \u4F4E\u79E9)</span>
          <span class="er-v">{{ 36 }} / {{ k() * (6 + 6 + 1) }} = {{ (36 / (k() * 13)).toFixed(2) }}\u00D7</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u770B\u770B\u8AA4\u5DEE\u900F\u8073\u591A\u5FEB \u2014 \u53EA\u8981 k=2 \u6216 3\uFF0C\u8FD1\u4F3C\u5DF2\u7D93\u5F88\u63A5\u8FD1\u539F\u59CB\u77E9\u9663\u4E86\u3002
        \u9019\u662F\u56E0\u70BA\u5947\u7570\u503C<strong>\u8870\u6E1B\u5F88\u5FEB</strong>\uFF0C\u5269\u4E0B\u7684\u9805\u8CA2\u737B\u5F88\u5C11\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7BC0\u770B\u9019\u500B\u4F4E\u79E9\u8FD1\u4F3C\u600E\u9EBC\u8B8A\u6210<strong>\u5716\u7247\u58D3\u7E2E</strong>\u7684\u73FE\u5BE6\u61C9\u7528\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .grids { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .grid-block { display: flex; flex-direction: column; align-items: center; padding: 10px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .grid-title { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 6px; }
    .mat-svg { width: 100%; max-width: 180px; }
    .cell-text { font-size: 7px; fill: var(--text); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; pointer-events: none; }

    .k-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .k-lab { font-size: 13px; color: var(--text-secondary); }
    .k-row input { flex: 1; accent-color: var(--accent); }
    .k-val { font-size: 18px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace;
      min-width: 24px; text-align: center; }

    .sigmas { padding: 12px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 12px; }
    .sig-title { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; text-align: center; }
    .sig-bars { display: flex; gap: 8px; align-items: flex-end; justify-content: center; }
    .sig-col { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 36px; }
    .sig-bar { width: 24px; background: var(--border-strong); border-radius: 3px 3px 0 0;
      transition: background 0.2s, opacity 0.2s; opacity: 0.3;
      &.kept { background: var(--accent); opacity: 1; } }
    .sig-num { font-size: 10px; color: var(--text-muted); font-family: 'Noto Sans Math', serif; }
    .sig-val { font-size: 10px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .error-row { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .er-row { display: grid; grid-template-columns: 1fr auto; padding: 8px 14px;
      border-bottom: 1px solid var(--border); font-size: 12px;
      &:last-child { border-bottom: none; } }
    .er-l { color: var(--text-muted); }
    .er-v { color: var(--accent); font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepLowRankComponent {
  readonly original = makeMatrix();
  readonly svdResult: SVDResult = svd(this.original);
  readonly origNorm = frobenius(this.original);
  readonly vmax = (() => {
    let m = 0;
    for (const row of this.original) for (const v of row) m = Math.max(m, Math.abs(v));
    return m;
  })();

  readonly k = signal(1);
  readonly approx = computed(() => reconstructLowRank(this.svdResult, this.k()));
  readonly error = computed(() => frobeniusError(this.original, this.approx()));

  colorFor = colorFor;

  subscriptOf(n: number): string {
    return ['\u2080', '\u2081', '\u2082', '\u2083', '\u2084', '\u2085', '\u2086', '\u2087', '\u2088', '\u2089'][n] || '';
  }
}
