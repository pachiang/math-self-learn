import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; }

@Component({
  selector: 'app-step-pca',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u4E3B\u6210\u5206\u5206\u6790\uFF08PCA\uFF09" subtitle="\u00A78.6">
      <p>
        \u73FE\u4EE3\u8CC7\u6599\u79D1\u5B78\u88E1\u6700\u5E38\u898B\u7684\u95DC\u9375\u5B57\u4E4B\u4E00\u662F<strong>PCA</strong>\uFF08\u4E3B\u6210\u5206\u5206\u6790\uFF09\u3002\u5B83\u5176\u5BE6\u5C31\u662F SVD \u7684\u53E6\u4E00\u500B\u540D\u5B57\u3002
      </p>
      <p>
        \u554F\u984C\uFF1A\u7D66\u4F60\u4E00\u5806\u8CC7\u6599\u9EDE\uFF0C\u54EA\u500B\u65B9\u5411\u300C\u8B8A\u7570\u6700\u5927\u300D\uFF1F\u9019\u5C31\u662F<strong>\u7B2C\u4E00\u4E3B\u6210\u5206</strong>\u3002
        \u4E0B\u4E00\u500B\u300C\u6B63\u4EA4\u65BC\u7B2C\u4E00\u500B\u4E14\u8B8A\u7570\u6B21\u5927\u300D\u7684\u65B9\u5411\u662F\u7B2C\u4E8C\u4E3B\u6210\u5206\u3002\u4EE5\u6B64\u985E\u63A8\u3002
      </p>
      <p>
        PCA \u8B93\u4F60\u80FD\u300C\u770B\u5230\u8CC7\u6599\u7684\u5F62\u72C0\u300D\uFF1A\u4E3B\u8EF8\u662F\u8CC7\u6599\u5728\u54EA\u500B\u65B9\u5411\u4E0A\u300C\u62C9\u5F97\u6700\u9577\u300D\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u9EDE\u6216\u9078\u4E0D\u540C\u7684\u8CC7\u6599\u5206\u4F48\uFF0C\u770B\u4E3B\u8EF8\u600E\u9EBC\u8DDF\u8457\u8B8A">
      <div class="preset-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pst" [class.active]="sel() === i" (click)="setPreset(i)">{{ p.name }}</button>
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

          <!-- Mean point -->
          <circle [attr.cx]="meanX() * 25" [attr.cy]="-meanY() * 25" r="3" fill="var(--text-muted)" />

          <!-- First principal axis: line through mean in pc1 direction -->
          <line
            [attr.x1]="(meanX() - pc1().dir[0] * 4) * 25"
            [attr.y1]="-(meanY() - pc1().dir[1] * 4) * 25"
            [attr.x2]="(meanX() + pc1().dir[0] * 4) * 25"
            [attr.y2]="-(meanY() + pc1().dir[1] * 4) * 25"
            stroke="var(--accent)" stroke-width="2.5" />

          <!-- Second principal axis -->
          <line
            [attr.x1]="(meanX() - pc2().dir[0] * 2) * 25"
            [attr.y1]="-(meanY() - pc2().dir[1] * 2) * 25"
            [attr.x2]="(meanX() + pc2().dir[0] * 2) * 25"
            [attr.y2]="-(meanY() + pc2().dir[1] * 2) * 25"
            stroke="var(--v1)" stroke-width="2" stroke-dasharray="3 3" />

          <!-- Data points -->
          @for (pt of points(); track $index; let i = $index) {
            <circle [attr.cx]="pt.x * 25" [attr.cy]="-pt.y * 25" r="3.5"
              fill="var(--v0)" stroke="white" stroke-width="1" />
          }

          <!-- PC1 label -->
          <text [attr.x]="(meanX() + pc1().dir[0] * 4.3) * 25"
            [attr.y]="-(meanY() + pc1().dir[1] * 4.3) * 25" class="axis-lab">PC1</text>
          <text [attr.x]="(meanX() + pc2().dir[0] * 2.3) * 25"
            [attr.y]="-(meanY() + pc2().dir[1] * 2.3) * 25" class="axis-lab pc2">PC2</text>
        </svg>
      </div>

      <div class="info">
        <div class="info-row pc1-color">
          <span class="il">\u7B2C\u4E00\u4E3B\u6210\u5206 PC1</span>
          <span class="iv">\u65B9\u5411 ({{ pc1().dir[0].toFixed(2) }}, {{ pc1().dir[1].toFixed(2) }})\u3001
            \u8B8A\u7570 = <strong>{{ pc1().variance.toFixed(2) }}</strong></span>
        </div>
        <div class="info-row pc2-color">
          <span class="il">\u7B2C\u4E8C\u4E3B\u6210\u5206 PC2</span>
          <span class="iv">\u65B9\u5411 ({{ pc2().dir[0].toFixed(2) }}, {{ pc2().dir[1].toFixed(2) }})\u3001
            \u8B8A\u7570 = <strong>{{ pc2().variance.toFixed(2) }}</strong></span>
        </div>
        <div class="info-row big">
          <span class="il">PC1 / \u7E3D\u8B8A\u7570</span>
          <span class="iv"><strong>{{ ((pc1().variance / (pc1().variance + pc2().variance)) * 100).toFixed(1) }}%</strong>
            \u7684\u8B8A\u7570\u90FD\u5728 PC1 \u9019\u500B\u65B9\u5411\u4E0A</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block title="PCA \u8DDF SVD \u7684\u95DC\u4FC2">
      <p>
        \u4EE4 X \u70BA\u8CC7\u6599\u77E9\u9663\uFF08\u6BCF\u884C\u662F\u4E00\u500B\u8CC7\u6599\u9EDE\uFF09\uFF0C\u4E26\u4E14\u4E2D\u5FC3\u5316\uFF08\u6BCF\u500B\u6B04\u7684\u5747\u503C = 0\uFF09\u3002\u90A3\u9EBC\uFF1A
      </p>
      <p class="formula">\u5171\u8B8A\u7570\u77E9\u9663 C = (1/n) X\u1D40 X</p>
      <p>
        C \u662F\u5C0D\u7A31\u77E9\u9663\uFF0C\u53EF\u4EE5\u9032\u884C\u8B5C\u5206\u89E3\uFF1A
      </p>
      <p class="formula">C = V \u039B V\u1D40\uFF0C\u5176\u4E2D V \u662F\u4E3B\u8EF8\uFF0C\u039B \u662F\u8B8A\u7570</p>
      <p>
        \u4F46\u65BC\u6B64\u540C\u6642\uFF0C\u5C0D X \u672C\u8EAB\u505A SVD\uFF1A
      </p>
      <p class="formula">X = U \u03A3 V\u1D40 \u2192 X\u1D40 X = V \u03A3\u00B2 V\u1D40 \u2192 \u039B = \u03A3\u00B2 / n</p>
      <p>
        \u4E5F\u5C31\u662F\u8AAA\uFF0C<strong>X \u7684\u53F3\u5947\u7570\u5411\u91CF V \u5C31\u662F\u4E3B\u6210\u5206\u8EF8</strong>\uFF0C
        \u5947\u7570\u503C\u7684\u5E73\u65B9\u5C31\u662F\u8B8A\u7570\u3002
      </p>
      <p>
        \u9019\u662F\u4E00\u500B\u6F02\u4EAE\u7684\u62B5\u9054\uFF1A\u8CC7\u6599\u79D1\u5B78\u91CC\u6700\u91CD\u8981\u7684\u6F14\u7B97\u6CD5\u4E4B\u4E00\u672C\u8CEA\u4E0A\u662F SVD\u3002
      </p>
      <span class="hint">
        PCA \u7684\u61C9\u7528\u7BC4\u570D\u8C50\u5BCC\uFF1A\u8CC7\u6599\u964D\u7DAD\u3001\u53BB\u566A\u3001\u4EBA\u81C9\u8FA8\u8B58\uFF08eigenfaces\uFF09\u3001\u751F\u7269\u8CC7\u8A0A\u3001\u91D1\u878D\u5206\u6790...
      </span>
    </app-prose-block>

    <app-prose-block title="\u672C\u7AE0\u7E3D\u7D50">
      <p>
        \u606D\u559C\u4F60\uFF0C\u4F60\u770B\u5230\u4E86\u7DDA\u6027\u4EE3\u6578\u6700\u9AD8\u7684\u5C71\u5DD4\u3002SVD \u4E0D\u53EA\u662F\u4E00\u500B\u5206\u89E3\u6CD5 \u2014 \u5B83\u662F\u4E00\u500B<strong>\u770B\u4E16\u754C\u7684\u65B9\u5F0F</strong>\uFF1A
      </p>
      <ul>
        <li>\u4EFB\u4F55\u77E9\u9663 = \u65CB\u8F49 \u00D7 \u62C9\u4F38 \u00D7 \u65CB\u8F49</li>
        <li>\u4EFB\u4F55\u77E9\u9663\u90FD\u6709\u56DB\u500B\u5B50\u7A7A\u9593\u7684\u6B63\u4EA4\u57FA\u5E95</li>
        <li>\u4EFB\u4F55\u77E9\u9663\u90FD\u53EF\u4EE5\u88AB\u300C\u91CD\u8981\u6027\u6392\u5E8F\u300D\u4E14\u4F4E\u79E9\u8FD1\u4F3C</li>
      </ul>
      <p>
        \u5F9E\u5411\u91CF\u8DDF span \u958B\u59CB\uFF0C\u5C0E\u5230\u7DDA\u6027\u8B8A\u63DB\uFF0C\u518D\u5230\u7279\u5FB5\u503C\uFF0C\u6700\u5F8C\u5230 SVD \u2014 \u9019\u5C31\u662F\u300C\u4F86\u8DD1\u4E00\u8D9F\u7DDA\u6027\u4EE3\u6578\u300D\u7684\u8DDD\u96E2\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 10px; background: var(--accent-10); border-radius: 8px; margin: 8px 0;
      font-family: 'JetBrains Mono', monospace; }

    .preset-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .pst { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .axis-lab { font-size: 11px; font-weight: 700; fill: var(--accent);
      font-family: 'JetBrains Mono', monospace; text-anchor: middle;
      &.pc2 { fill: var(--v1); } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 130px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.pc1-color { background: var(--accent-10); }
      &.pc2-color { background: rgba(141, 163, 181, 0.1); }
      &.big { background: rgba(90, 138, 90, 0.06); } }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 8px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 13px; }
  `,
})
export class StepPcaComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // Preset point clouds
  readonly presets = [
    { name: '\u659C\u5411\u62C9\u9577' },
    { name: '\u6C34\u5E73\u62C9\u9577' },
    { name: '\u5713\u5F62\u96F2' },
    { name: '\u5169\u500B\u96C6\u7FA4' },
  ];
  readonly sel = signal(0);

  readonly points = signal<Pt[]>([]);

  constructor() {
    this.setPreset(0);
  }

  setPreset(i: number): void {
    this.sel.set(i);
    const pts: Pt[] = [];
    const seed = i * 17;
    const rand = mulberry32(seed);
    switch (i) {
      case 0: // diagonal stretched
        for (let k = 0; k < 30; k++) {
          const t = (rand() - 0.5) * 6;
          const noise = (rand() - 0.5) * 1.2;
          pts.push({ x: t + noise * 0.6, y: t * 0.5 + noise });
        }
        break;
      case 1: // horizontal stretched
        for (let k = 0; k < 30; k++) {
          pts.push({ x: (rand() - 0.5) * 6, y: (rand() - 0.5) * 1.5 });
        }
        break;
      case 2: // round cloud
        for (let k = 0; k < 30; k++) {
          const r = 2.5 * Math.sqrt(rand());
          const theta = rand() * 2 * Math.PI;
          pts.push({ x: r * Math.cos(theta), y: r * Math.sin(theta) });
        }
        break;
      case 3: // two clusters
        for (let k = 0; k < 15; k++) {
          pts.push({ x: 2 + (rand() - 0.5) * 1.5, y: 1 + (rand() - 0.5) * 1.5 });
        }
        for (let k = 0; k < 15; k++) {
          pts.push({ x: -2 + (rand() - 0.5) * 1.5, y: -1 + (rand() - 0.5) * 1.5 });
        }
        break;
    }
    this.points.set(pts);
  }

  // Mean
  readonly meanX = computed(() => {
    const p = this.points();
    return p.length === 0 ? 0 : p.reduce((s, pt) => s + pt.x, 0) / p.length;
  });
  readonly meanY = computed(() => {
    const p = this.points();
    return p.length === 0 ? 0 : p.reduce((s, pt) => s + pt.y, 0) / p.length;
  });

  // Covariance matrix and eigenvalues
  readonly pcaResult = computed(() => {
    const pts = this.points();
    const mx = this.meanX();
    const my = this.meanY();
    let sxx = 0, syy = 0, sxy = 0;
    for (const p of pts) {
      const dx = p.x - mx;
      const dy = p.y - my;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }
    const n = pts.length || 1;
    sxx /= n; syy /= n; sxy /= n;

    // Eigenvalues of [[sxx, sxy], [sxy, syy]]
    const tr = sxx + syy;
    const det = sxx * syy - sxy * sxy;
    const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const lam1 = tr / 2 + disc;
    const lam2 = tr / 2 - disc;

    // Eigenvector for lam1: solve (sxx - lam1) * vx + sxy * vy = 0
    let v1: [number, number];
    if (Math.abs(sxy) > 1e-9) {
      v1 = [sxy, lam1 - sxx];
    } else {
      v1 = sxx >= syy ? [1, 0] : [0, 1];
    }
    const len1 = Math.hypot(v1[0], v1[1]) || 1;
    v1 = [v1[0] / len1, v1[1] / len1];

    // pc2 is perpendicular to pc1
    const v2: [number, number] = [-v1[1], v1[0]];

    return { pc1: { dir: v1, variance: lam1 }, pc2: { dir: v2, variance: lam2 } };
  });

  readonly pc1 = computed(() => this.pcaResult().pc1);
  readonly pc2 = computed(() => this.pcaResult().pc2);
}

// Simple seeded RNG
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
