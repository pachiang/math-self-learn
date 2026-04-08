import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-diagonalization',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u5C0D\u89D2\u5316" subtitle="\u00A76.4">
      <p>
        \u7279\u5FB5\u5411\u91CF\u4E0D\u53EA\u662F\u300C\u4E0D\u88AB\u8F49\u7684\u65B9\u5411\u300D\uFF0C\u5B83\u5011\u63D0\u4F9B\u4E86\u4E00\u500B<strong>\u300C\u81EA\u7136\u300D\u7684\u5750\u6A19\u7CFB\u7D71</strong>\u3002
      </p>
      <p>
        \u5982\u679C A \u6709\u5169\u500B\u7DDA\u6027\u7368\u7ACB\u7684\u7279\u5FB5\u5411\u91CF v\u2081\u3001v\u2082\uFF0C
        \u4EE5\u5B83\u5011\u70BA\u57FA\u5E95\u4F86\u770B\u9019\u500B\u8B8A\u63DB\uFF0C\u5C31\u5C0D\u61C9\u4E00\u500B<strong>\u5C0D\u89D2\u77E9\u9663</strong>\uFF1A
      </p>
      <p class="formula">A = P D P\u207B\u00B9</p>
      <p>
        \u5176\u4E2D\uFF1A
      </p>
      <ul>
        <li><strong>P</strong> \u7684\u6B04\u5C31\u662F\u7279\u5FB5\u5411\u91CF</li>
        <li><strong>D</strong> \u662F\u5C0D\u89D2\u77E9\u9663\uFF0C\u5C0D\u89D2\u7DDA\u4E0A\u662F\u7279\u5FB5\u503C</li>
      </ul>
      <p>
        \u610F\u601D\u662F\uFF1A\u300C\u5728\u7279\u5FB5\u5411\u91CF\u57FA\u5E95\u4E0B\uFF0C\u8B8A\u63DB\u8B8A\u5F97\u7C21\u55AE \u2014 \u6BCF\u500B\u8EF8\u53EA\u662F\u88AB\u62C9\u9577\uFF0C\u4E92\u4E0D\u5F71\u97FF\u3002\u300D
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u5169\u500B\u4E16\u754C\u5C0D\u6BD4\uFF1A\u6A19\u6E96\u57FA\u5E95 vs \u7279\u5FB5\u5411\u91CF\u57FA\u5E95">
      <div class="dual-grid">
        <div class="dg-side">
          <div class="dg-title">\u6A19\u6E96\u57FA\u5E95</div>
          <svg viewBox="-130 -130 260 260" class="t-svg">
            @for (g of grid; track g) {
              <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
            <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

            <g class="grid-layer" [style.transform]="cssTransformStandard()">
              @for (g of fineGrid; track g) {
                <line [attr.x1]="g" y1="-100" [attr.x2]="g" y2="100" stroke="var(--v1)" stroke-width="0.9" opacity="0.4" />
                <line x1="-100" [attr.y1]="g" x2="100" [attr.y2]="g" stroke="var(--v0)" stroke-width="0.9" opacity="0.4" />
              }
              <line x1="0" y1="0" x2="40" y2="0" stroke="var(--v0)" stroke-width="2.5" />
              <line x1="0" y1="0" x2="0" y2="-40" stroke="var(--v1)" stroke-width="2.5" />
            </g>
          </svg>
          <div class="dg-mat">A = [[2, 1], [1, 2]]<br/><span class="muted">\u4E58\u6CD5\u8907\u96DC</span></div>
        </div>

        <div class="dg-side">
          <div class="dg-title">\u7279\u5FB5\u57FA\u5E95</div>
          <svg viewBox="-130 -130 260 260" class="t-svg">
            @for (g of grid; track g) {
              <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
            }

            <!-- Eigenvector lines (extended) -->
            <line x1="-105" y1="105" x2="105" y2="-105" stroke="#5a8a5a" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.5" />
            <line x1="-105" y1="-105" x2="105" y2="105" stroke="#5a8a5a" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.5" />

            <g class="grid-layer" [style.transform]="cssTransformDiag()">
              <!-- Eigenvector basis directions -->
              <line x1="0" y1="0" [attr.x2]="42" [attr.y2]="-42" stroke="#5a8a5a" stroke-width="2.5" />
              <line x1="0" y1="0" [attr.x2]="42" [attr.y2]="42" stroke="#5a8a5a" stroke-width="2.5" opacity="0.6" />
            </g>
          </svg>
          <div class="dg-mat">D = [[3, 0], [0, 1]]<br/><span class="muted">\u53EA\u662F\u5404\u8EF8\u62C9\u9577</span></div>
        </div>
      </div>

      <button class="play-btn" (click)="playToggle()">{{ applied() ? '\u91CD\u7F6E' : '\u25B6 \u5957\u7528\u8B8A\u63DB' }}</button>

      <div class="explain">
        \u5DE6\u908A\u6A19\u6E96\u57FA\u5E95\u4E0B A \u8981\u7B97 (2x+y, x+2y) \u2014 \u4E58\u6CD5\u96DC\u4E03\u96DC\u516B\u3002
        <br/>\u53F3\u908A\u7279\u5FB5\u57FA\u5E95\u4E0B\u53EA\u8981\u300C\u7B2C\u4E00\u8EF8 \u00D73\u3001\u7B2C\u4E8C\u8EF8 \u00D71\u300D \u2014 \u8B8A\u63DB\u88AB\u300C\u62C6\u958B\u300D\u4E86\u3002
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u5C0D\u89D2\u5316 = \u300C<strong>\u63DB\u5230\u7279\u5FB5\u5411\u91CF\u70BA\u8EF8\u7684\u5750\u6A19\u7CFB</strong>\uFF0C\u5728\u90A3\u88E1\u8B8A\u63DB\u53EA\u662F\u4E2D\u8EF8\u62C9\u4F38\u300D\u3002
        \u9019\u662F\u300C\u770B\u4E00\u500B\u8B8A\u63DB\u300D\u7684\u6700\u6E05\u695A\u65B9\u5F0F\u3002
      </p>
      <span class="hint">
        \u4E26\u975E\u6240\u6709\u77E9\u9663\u90FD\u80FD\u5C0D\u89D2\u5316 \u2014 \u6709\u4E9B\u77E9\u9663\u7684\u7279\u5FB5\u5411\u91CF\u4E0D\u8DB3 n \u500B\uFF08\u53EB\u300C\u7F3A\u9677\u300D\uFF09\u3002\u4E0B\u4E00\u7BC0\u770B\u5C0D\u89D2\u5316\u7684\u6700\u5927\u61C9\u7528\uFF1A\u8A08\u7B97\u77E9\u9663\u51AA\u6B21\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 22px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0; }

    .dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;
      @media (max-width: 500px) { grid-template-columns: 1fr; } }
    .dg-side { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .dg-title { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-align: center; margin-bottom: 6px; }
    .t-svg { width: 100%; height: auto; }
    .grid-layer { transform-origin: 0 0; transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform; }
    .dg-mat { font-size: 11px; color: var(--text); text-align: center; margin-top: 6px;
      font-family: 'JetBrains Mono', monospace; line-height: 1.5; }
    .muted { color: var(--text-muted); font-size: 10px; }

    .play-btn { display: block; margin: 0 auto 12px; padding: 8px 20px;
      border: 1px solid var(--accent-30); border-radius: 8px; background: var(--accent-10);
      color: var(--accent); font-size: 13px; font-weight: 600; cursor: pointer;
      &:hover { background: var(--accent-18); } }

    .explain { padding: 12px 16px; border-radius: 8px; background: var(--bg-surface);
      font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
  `,
})
export class StepDiagonalizationComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly fineGrid = [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100];

  readonly applied = signal(false);

  cssTransformStandard(): string {
    if (!this.applied()) return 'matrix(1, 0, 0, 1, 0, 0)';
    // A = [[2, 1], [1, 2]]; SVG: matrix(a, -c, -b, d) = matrix(2, -1, -1, 2, 0, 0)
    return 'matrix(2, -1, -1, 2, 0, 0)';
  }

  cssTransformDiag(): string {
    if (!this.applied()) return 'matrix(1, 0, 0, 1, 0, 0)';
    // In eigenvector basis: D = [[3, 0], [0, 1]]
    // Apply to the eigenvectors (which are along ±45° lines)
    // For visual purposes, just stretch by 3 along (1,-1) direction (math) which is (1,1) in SVG
    // The simplest is to transform the entire scene with a custom matrix that stretches diagonally.
    // Math: stretch by 3 along (1,1)/√2, by 1 along (1,-1)/√2
    // Equivalent matrix M = R · D · R^T where R rotates ±45°
    // After computation: M = [[2, 1], [1, 2]] (same as A!) — that's expected since it's the same transform
    return 'matrix(2, -1, -1, 2, 0, 0)';
  }

  playToggle(): void {
    this.applied.update((v) => !v);
  }
}
