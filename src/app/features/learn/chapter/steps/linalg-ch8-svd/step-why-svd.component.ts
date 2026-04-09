import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface ExampleMat {
  name: string;
  A: number[][];
  symmetric: boolean;
  eigenvectors: number[][]; // each row is an eigenvector
  desc: string;
}

const EXAMPLES: ExampleMat[] = [
  {
    name: '\u5C0D\u7A31',
    A: [[3, 1], [1, 3]],
    symmetric: true,
    eigenvectors: [[1, 1], [1, -1]],
    desc: 'A = A\u1D40\uFF0C\u8B5C\u5B9A\u7406\u9069\u7528 \u2192 \u7279\u5FB5\u5411\u91CF\u4E92\u76F8\u6B63\u4EA4\u3002',
  },
  {
    name: '\u4E0D\u5C0D\u7A31\u4F46\u53EF\u5C0D\u89D2\u5316',
    A: [[3, 1], [0, 2]],
    symmetric: false,
    eigenvectors: [[1, 0], [-1, 1]],
    desc: '\u4E0A\u4E09\u89D2\u77E9\u9663\uFF0C\u6709\u5169\u500B\u7279\u5FB5\u5411\u91CF\u4F46<strong>\u4E0D\u6B63\u4EA4</strong>\u3002',
  },
  {
    name: '\u65CB\u8F49 30\u00B0',
    A: [[Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6)], [Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)]],
    symmetric: false,
    eigenvectors: [],
    desc: '\u65CB\u8F49\u77E9\u9663\u6839\u672C<strong>\u6C92\u6709\u5BE6\u6578\u7279\u5FB5\u5411\u91CF</strong>\uFF08\u7279\u5FB5\u503C\u662F\u8907\u6578\uFF09\u3002\u8B5C\u5B9A\u7406\u5B8C\u5168\u5931\u6548\u3002',
  },
];

@Component({
  selector: 'app-step-why-svd',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u70BA\u4EC0\u9EBC\u9700\u8981 SVD" subtitle="\u00A78.1">
      <p>
        \u4E0A\u4E00\u7AE0\u6211\u5011\u770B\u5230\u5C0D\u7A31\u77E9\u9663\u7684<strong>\u8B5C\u5B9A\u7406</strong>\uFF1A
      </p>
      <p class="formula">A = Q \u039B Q\u1D40\uFF08\u7576 A \u662F\u5C0D\u7A31\u77E9\u9663\uFF09</p>
      <p>
        Q \u662F\u6B63\u4EA4\u77E9\u9663\uFF08\u6B04\u662F\u7279\u5FB5\u5411\u91CF\uFF09\uFF0C\u039B \u662F\u5C0D\u89D2\u77E9\u9663\uFF08\u7279\u5FB5\u503C\uFF09\u3002\u9019\u662F\u4E00\u500B\u8B93\u4EBA\u9A5A\u8C54\u7684\u7D50\u679C\u3002
      </p>
      <p>
        \u4F46\u662F\u2014 \u9019\u500B\u5B9A\u7406<strong>\u53EA\u9069\u7528\u65BC\u5C0D\u7A31\u77E9\u9663</strong>\u3002\u4E00\u822C\u7684\u77E9\u9663\u600E\u9EBC\u8FA6\uFF1F\u9019\u5C31\u662F SVD \u8981\u56DE\u7B54\u7684\u554F\u984C\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u770B\u5169\u500B\u4F8B\u5B50\uFF1A\u53EA\u6709\u5C0D\u7A31\u77E9\u9663\u6709\u300C\u6B63\u4EA4\u300D\u7684\u7279\u5FB5\u5411\u91CF">
      <div class="ex-tabs">
        @for (e of examples; track e.name; let i = $index) {
          <button class="et" [class.active]="sel() === i" (click)="sel.set(i)"
            [class.sym]="e.symmetric"
            [class.nosym]="!e.symmetric">{{ e.name }}</button>
        }
      </div>

      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Eigenvectors -->
          @for (v of current().eigenvectors; track $index; let i = $index) {
            <line x1="0" y1="0"
              [attr.x2]="vNorm(v)[0] * 80"
              [attr.y2]="-vNorm(v)[1] * 80"
              [attr.stroke]="i === 0 ? 'var(--v0)' : 'var(--v1)'"
              stroke-width="3"
              [attr.marker-end]="'url(#tip-eig' + i + ')'" />
          }

          <!-- Right-angle indicator if perpendicular -->
          @if (current().eigenvectors.length === 2 && isPerp()) {
            <rect [attr.x]="-2" [attr.y]="-12"
              width="12" height="12" fill="none" stroke="#5a8a5a" stroke-width="1.5"
              [attr.transform]="'rotate(' + perpAngle() + ')'" />
            <text x="20" y="-20" class="ortho-label">90\u00B0</text>
          }

          <defs>
            <marker id="tip-eig0" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-eig1" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="info" [class.bad]="!current().symmetric">
        <div class="info-row">
          <span class="il">\u77E9\u9663 A</span>
          <span class="iv">[[{{ current().A[0][0].toFixed(2) }}, {{ current().A[0][1].toFixed(2) }}],
            [{{ current().A[1][0].toFixed(2) }}, {{ current().A[1][1].toFixed(2) }}]]</span>
        </div>
        <div class="info-row">
          <span class="il">\u662F\u5426\u5C0D\u7A31</span>
          <span class="iv">{{ current().symmetric ? '\u662F (A = A\u1D40)' : '\u5426' }}</span>
        </div>
        @if (current().eigenvectors.length === 2) {
          <div class="info-row">
            <span class="il">\u7279\u5FB5\u5411\u91CF\u9EDE\u7A4D</span>
            <span class="iv">v\u2081 \u00B7 v\u2082 = <strong [class.zero]="isPerp()">{{ dotProduct().toFixed(2) }}</strong>
              {{ isPerp() ? '\u2192 \u6B63\u4EA4 \u2713' : '\u2192 \u4E0D\u6B63\u4EA4 \u2717' }}</span>
          </div>
        } @else {
          <div class="info-row">
            <span class="il">\u7279\u5FB5\u5411\u91CF</span>
            <span class="iv"><strong>\u4E0D\u5B58\u5728\u5BE6\u6578\u7279\u5FB5\u5411\u91CF</strong></span>
          </div>
        }
      </div>

      <div class="explain">{{ current().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>\u6240\u4EE5\uFF0C\u5C0D\u4E00\u822C\u7684\u77E9\u9663\uFF1A</p>
      <ul>
        <li>\u7279\u5FB5\u5411\u91CF\u53EF\u80FD<strong>\u4E0D\u6B63\u4EA4</strong></li>
        <li>\u751A\u81F3\u53EF\u80FD<strong>\u4E0D\u5B58\u5728\u5BE6\u6578\u7279\u5FB5\u5411\u91CF</strong>\uFF08\u5982\u65CB\u8F49\u77E9\u9663\uFF09</li>
        <li>\u8B5C\u5B9A\u7406\u5B8C\u5168\u5931\u6548</li>
      </ul>
      <p>
        SVD \u662F\u4E00\u500B<strong>\u66F4\u5F37\u7684\u5B9A\u7406</strong>\uFF0C\u5C0D\u4EFB\u4F55\u77E9\u9663\u90FD\u6709\u6548\uFF1A
      </p>
      <p class="big-formula">A = U \u03A3 V\u1D40</p>
      <p>
        \u5176\u4E2D U \u8DDF V \u90FD\u662F<strong>\u6B63\u4EA4\u77E9\u9663</strong>\uFF0C\u03A3 \u662F\u5C0D\u89D2\u77E9\u9663\uFF08\u4F46\u4E0D\u4E00\u5B9A\u662F\u65B9\u5F62\u7684\uFF09\u3002
      </p>
      <p>
        \u9700\u8981\u9047\u80B2\u5B9C\u6CE8\u610F\u7684\u5730\u65B9\uFF1AU \u8DDF V \u662F<strong>\u5169\u500B\u4E0D\u540C\u7684</strong>\u6B63\u4EA4\u77E9\u9663\uFF0C
        \u4E0D\u50CF\u8B5C\u5B9A\u7406\u91CC\u53EA\u6709\u4E00\u500B Q\u3002\u9019\u662F SVD \u80FD\u8655\u7406\u4EFB\u4F55\u77E9\u9663\u7684\u95DC\u9375\u3002
      </p>
      <span class="hint">
        \u4E0B\u4E00\u7BC0\u6211\u5011\u4F86\u770B SVD \u7684<strong>\u5E7E\u4F55\u610F\u7FA9</strong>\uFF1A
        \u4EFB\u4F55\u7DDA\u6027\u8B8A\u63DB = \u65CB\u8F49 \u00D7 \u7E2E\u653E \u00D7 \u65CB\u8F49\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 17px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px; }
    .big-formula { text-align: center; font-size: 24px; font-weight: 700; color: var(--accent);
      padding: 16px; background: var(--accent-10); border-radius: 8px; margin: 12px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ex-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .et { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active.sym { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; }
      &.active.nosym { background: rgba(160,90,90,0.15); border-color: #a05a5a; color: var(--text); font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .ortho-label { font-size: 11px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px;
      &.bad { border-color: rgba(160, 90, 90, 0.4); } }
    .info-row { display: grid; grid-template-columns: 110px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--text); &.zero { color: #5a8a5a; } }

    .explain { padding: 10px 14px; border-radius: 8px; background: var(--bg-surface);
      font-size: 12px; color: var(--text-secondary); line-height: 1.6; strong { color: var(--text); } }
  `,
})
export class StepWhySvdComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly current = computed(() => this.examples[this.sel()]);

  vNorm(v: number[]): number[] {
    const len = Math.hypot(v[0], v[1]);
    return [v[0] / len, v[1] / len];
  }

  readonly dotProduct = computed(() => {
    const evs = this.current().eigenvectors;
    if (evs.length < 2) return 0;
    const a = this.vNorm(evs[0]);
    const b = this.vNorm(evs[1]);
    return a[0] * b[0] + a[1] * b[1];
  });

  readonly isPerp = computed(() => Math.abs(this.dotProduct()) < 0.01);

  readonly perpAngle = computed(() => {
    const evs = this.current().eigenvectors;
    if (evs.length < 1) return 0;
    return -Math.atan2(evs[0][1], evs[0][0]) * (180 / Math.PI);
  });
}
