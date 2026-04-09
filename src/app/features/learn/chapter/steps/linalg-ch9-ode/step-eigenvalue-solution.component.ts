import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Eigen { lambda: number; v: [number, number]; }

@Component({
  selector: 'app-step-eigenvalue-solution',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u7528\u7279\u5FB5\u503C\u89E3 ODE" subtitle="\u00A79.3">
      <p>
        \u5982\u679C v \u662F A \u7684\u7279\u5FB5\u5411\u91CF\uFF0CAv = \u03BBv\uFF0C\u8A66\u8A66\u770B<strong>\u5C07 v \u4F5C\u70BA\u521D\u59CB\u72C0\u614B</strong>\uFF1A
      </p>
      <p>x(t) = e^(\u03BBt) v</p>
      <p>\u9A57\u8B49\u6703\u4E0D\u6703\u6EFF\u8DB3 dx/dt = Ax\uFF1F</p>
      <p>
        dx/dt = \u03BB \u00B7 e^(\u03BBt) v\uFF08\u5DE6\u908A\u8A08\u7B97\uFF0C\u4E58\u51FA \u03BB\uFF09
      </p>
      <p>
        Ax = A \u00B7 e^(\u03BBt) v = e^(\u03BBt) \u00B7 Av = e^(\u03BBt) \u00B7 \u03BBv = \u03BB \u00B7 e^(\u03BBt) v\uFF08\u53F3\u908A\uFF09
      </p>
      <p>
        \u5169\u908A\u76F8\u7B49 \u2713\u3002\u6240\u4EE5\u300C<strong>\u6CBF\u8457\u7279\u5FB5\u5411\u91CF\u65B9\u5411\u542F\u52D5\u300D\u6642\uFF0C\u89E3\u5C31\u662F\u7C21\u55AE\u7684\u6307\u6578</strong>\u3002
      </p>
      <p>
        \u4E00\u822C\u521D\u59CB\u72C0\u614B x\u2080 \u600E\u9EBC\u8FA6\uFF1F\u5C07 x\u2080 \u62C6\u6210\u7279\u5FB5\u5411\u91CF\u7684\u7DDA\u6027\u7D44\u5408\u3002\u8A2D\u5169\u500B\u7279\u5FB5\u5411\u91CF v\u2081, v\u2082\u3001\u7279\u5FB5\u503C \u03BB\u2081, \u03BB\u2082\uFF1A
      </p>
      <p class="formula">x\u2080 = c\u2081 v\u2081 + c\u2082 v\u2082</p>
      <p>
        \u90A3\u9EBC\u89E3\u5C31\u662F\uFF1A
      </p>
      <p class="formula big">x(t) = c\u2081 e<sup>\u03BB\u2081 t</sup> v\u2081 + c\u2082 e<sup>\u03BB\u2082 t</sup> v\u2082</p>
      <p>
        \u9019\u662F\u7DDA\u6027 ODE \u7684<strong>\u4E00\u822C\u89E3\u516C\u5F0F</strong>\u3002\u4E0B\u9762\u770B\u5B83\u600E\u9EBC\u5DE5\u4F5C\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 t \u770B\u8ECC\u8DE1\u968E\u8457\u8868\u9054\u3002\u6CE8\u610F\u7279\u5FB5\u5411\u91CF\u65B9\u5411\u4E0A\u662F\u7D14\u6307\u6578">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Eigenvector lines (extended through origin) -->
          @for (e of eigens; track $index; let i = $index) {
            <line
              [attr.x1]="-e.v[0] * 130" [attr.y1]="e.v[1] * 130"
              [attr.x2]="e.v[0] * 130" [attr.y2]="-e.v[1] * 130"
              [attr.stroke]="i === 0 ? 'var(--v0)' : 'var(--v1)'"
              stroke-width="1.2" stroke-dasharray="4 3" opacity="0.55" />
          }

          <!-- Trajectory traced so far -->
          <path [attr.d]="trajPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

          <!-- Initial state x_0 (faded) -->
          <circle [attr.cx]="x0[0] * 25" [attr.cy]="-x0[1] * 25" r="4"
            fill="var(--text-muted)" stroke="white" stroke-width="1.5" />
          <text [attr.x]="x0[0] * 25 + 8" [attr.y]="-x0[1] * 25 - 6" class="lab" style="fill: var(--text-muted)">x\u2080</text>

          <!-- c1 e^(λ1 t) v1 component (along eigenvector 1) -->
          <line x1="0" y1="0"
            [attr.x2]="c1Comp()[0] * 25" [attr.y2]="-c1Comp()[1] * 25"
            stroke="var(--v0)" stroke-width="2" opacity="0.7" marker-end="url(#tip-c1)" />

          <!-- c2 e^(λ2 t) v2 component, drawn from end of c1 component -->
          <line [attr.x1]="c1Comp()[0] * 25" [attr.y1]="-c1Comp()[1] * 25"
            [attr.x2]="(c1Comp()[0] + c2Comp()[0]) * 25" [attr.y2]="-(c1Comp()[1] + c2Comp()[1]) * 25"
            stroke="var(--v1)" stroke-width="2" opacity="0.7" marker-end="url(#tip-c2)" />

          <!-- Current state -->
          <circle [attr.cx]="currentX()[0] * 25" [attr.cy]="-currentX()[1] * 25" r="6"
            fill="var(--accent)" stroke="white" stroke-width="2" />

          <!-- Eigenvector labels -->
          @for (e of eigens; track $index; let i = $index) {
            <text [attr.x]="e.v[0] * 110" [attr.y]="-e.v[1] * 110 + 14" class="lab"
              [attr.fill]="i === 0 ? 'var(--v0)' : 'var(--v1)'">v{{ subscriptOf(i+1) }}, \u03BB={{ e.lambda }}</text>
          }

          <defs>
            <marker id="tip-c1" markerWidth="5" markerHeight="3" refX="4" refY="1.5" orient="auto">
              <polygon points="0 0,5 1.5,0 3" fill="var(--v0)" />
            </marker>
            <marker id="tip-c2" markerWidth="5" markerHeight="3" refX="4" refY="1.5" orient="auto">
              <polygon points="0 0,5 1.5,0 3" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="t-row">
        <span class="t-lab">t =</span>
        <input type="range" min="0" max="3" step="0.05" [value]="t()" (input)="t.set(+$any($event).target.value)" />
        <span class="t-val">{{ t().toFixed(2) }}</span>
        <button class="play-btn" (click)="play()">{{ playing() ? '\u23F8' : '\u25B7' }}</button>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">A</span>
          <span class="iv">[[1, 1], [2, 0]]</span>
        </div>
        <div class="info-row">
          <span class="il">x\u2080</span>
          <span class="iv">({{ x0[0] }}, {{ x0[1] }})</span>
        </div>
        <div class="info-row">
          <span class="il">c\u2081, c\u2082</span>
          <span class="iv">{{ c1.toFixed(2) }}, {{ c2.toFixed(2) }}</span>
        </div>
        <div class="info-row big">
          <span class="il">x(t)</span>
          <span class="iv">
            <span class="t1">{{ c1.toFixed(2) }}</span>e<sup>{{ eigens[0].lambda }}t</sup>v\u2081
            +
            <span class="t2">{{ c2.toFixed(2) }}</span>e<sup>{{ eigens[1].lambda }}t</sup>v\u2082
            = (<strong>{{ currentX()[0].toFixed(2) }}</strong>, <strong>{{ currentX()[1].toFixed(2) }}</strong>)
          </span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u770B\u51FA\u4F86\u4E86\u55CE\uFF1F\u5169\u500B\u8589\u9999\u8272\u7BAD\u982D\u8868\u793A\u300C\u6BCF\u500B\u7279\u5FB5\u5411\u91CF\u65B9\u5411\u4E0A\u7684\u8CA2\u737B\u300D\uFF0C\u4E14\u662F\u5F37\u8A02\u7684\u6307\u6578\u589E\u9577\u3002\u4E0D\u540C\u7684\u7279\u5FB5\u503C\u4EE3\u8868\uFF1A
      </p>
      <ul>
        <li>\u03BB > 0 \u2192 \u9019\u500B\u65B9\u5411\u4E0A\u8DDD\u96E2\u539F\u9EDE\u8D8A\u4F86\u8D8A\u9060</li>
        <li>\u03BB < 0 \u2192 \u9019\u500B\u65B9\u5411\u4E0A\u88AB\u62C9\u56DE\u539F\u9EDE</li>
        <li>\u9577\u671F\u4E0B\uFF1A<strong>\u6700\u5927\u7684 \u03BB \u4E3B\u5C0E</strong>\uFF08e^(\u03BB\u2081 t) \u5728 \u03BB\u2081 > \u03BB\u2082 \u6642\u589E\u9577\u66F4\u5FEB\uFF09</li>
      </ul>
      <p>
        \u9019\u500B\u516C\u5F0F\u9069\u7528\u65BC\u4EFB\u4F55\u53EF\u5C0D\u89D2\u5316\u7684 A\u3002\u4F46\u53C8\u5E9F\u53C8\u5BB9\u6613\u7279\u5FB5\u5411\u91CF\u8DDF\u7279\u5FB5\u503C\u96E3\u4EE5\u5BEB\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7BC0\u770B\u4E00\u500B\u7D71\u4E00\u7684\u5BEB\u6CD5\uFF1A<strong>\u77E9\u9663\u6307\u6578 e^(At)</strong>\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.big { font-size: 22px; padding: 18px; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 360px; }
    .lab { font-size: 11px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .t-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .t-lab { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .t-row input { flex: 1; accent-color: var(--accent); }
    .t-val { font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      min-width: 44px; text-align: right; }
    .play-btn { padding: 4px 12px; border: 1px solid var(--accent-30); border-radius: 6px;
      background: var(--accent-10); color: var(--accent); font-size: 14px; cursor: pointer;
      &:hover { background: var(--accent-18); } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 70px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; line-height: 1.7; }
    .iv strong { color: var(--accent); font-size: 13px; }
    .t1 { color: var(--v0); font-weight: 700; }
    .t2 { color: var(--v1); font-weight: 700; }
  `,
})
export class StepEigenvalueSolutionComponent {
  // A = [[1, 1], [2, 0]]
  // det(A - λI) = (1-λ)(-λ) - 2 = λ² - λ - 2 = (λ - 2)(λ + 1)
  // Eigenvalues: λ₁ = 2, λ₂ = -1
  // For λ₁ = 2: (A - 2I)v = 0: -v_x + v_y = 0, 2v_x - 2v_y = 0 → v_y = v_x → v₁ = (1, 1)
  // For λ₂ = -1: (A + I)v = 0: 2v_x + v_y = 0 → v_y = -2v_x → v₂ = (1, -2)
  readonly eigens: Eigen[] = [
    { lambda: 2, v: [1 / Math.sqrt(2), 1 / Math.sqrt(2)] },
    { lambda: -1, v: [1 / Math.sqrt(5), -2 / Math.sqrt(5)] },
  ];

  // x_0 = (2, -0.5). Decompose into c1 v1 + c2 v2
  // 2 = c1 / √2 + c2 / √5
  // -0.5 = c1 / √2 - 2 c2 / √5
  // Subtract: 2.5 = 3 c2 / √5 → c2 = 2.5 √5 / 3 ≈ 1.863
  // Then c1 = (2 - c2/√5) √2 = (2 - 5/6) √2 ≈ 7/6 · √2 ≈ 1.650
  readonly x0: [number, number] = [2, -0.5];
  readonly c1 = (7 / 6) * Math.sqrt(2);
  readonly c2 = (2.5 * Math.sqrt(5)) / 3;

  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly t = signal(0);
  readonly playing = signal(false);
  private playTimer: number | null = null;

  // c1 e^(λ1 t) v1 component
  readonly c1Comp = computed<[number, number]>(() => {
    const f = this.c1 * Math.exp(this.eigens[0].lambda * this.t());
    return [f * this.eigens[0].v[0], f * this.eigens[0].v[1]];
  });
  // c2 e^(λ2 t) v2 component
  readonly c2Comp = computed<[number, number]>(() => {
    const f = this.c2 * Math.exp(this.eigens[1].lambda * this.t());
    return [f * this.eigens[1].v[0], f * this.eigens[1].v[1]];
  });

  readonly currentX = computed<[number, number]>(() => {
    const a = this.c1Comp();
    const b = this.c2Comp();
    return [a[0] + b[0], a[1] + b[1]];
  });

  // Trajectory: precompute path from t=0 to current t
  readonly trajPath = computed(() => {
    const points: string[] = [];
    const tMax = this.t();
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tMax;
      const fx = this.c1 * Math.exp(this.eigens[0].lambda * t) * this.eigens[0].v[0]
              + this.c2 * Math.exp(this.eigens[1].lambda * t) * this.eigens[1].v[0];
      const fy = this.c1 * Math.exp(this.eigens[0].lambda * t) * this.eigens[0].v[1]
              + this.c2 * Math.exp(this.eigens[1].lambda * t) * this.eigens[1].v[1];
      const sx = Math.max(-130, Math.min(130, fx * 25));
      const sy = Math.max(-130, Math.min(130, -fy * 25));
      points.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return 'M ' + points.join(' L ');
  });

  play(): void {
    if (this.playing()) {
      this.playing.set(false);
      if (this.playTimer !== null) {
        clearInterval(this.playTimer);
        this.playTimer = null;
      }
      return;
    }
    this.playing.set(true);
    if (this.t() >= 3) this.t.set(0);
    this.playTimer = window.setInterval(() => {
      const next = this.t() + 0.03;
      if (next >= 3) {
        this.t.set(3);
        this.playing.set(false);
        if (this.playTimer !== null) {
          clearInterval(this.playTimer);
          this.playTimer = null;
        }
      } else {
        this.t.set(next);
      }
    }, 30);
  }

  subscriptOf(n: number): string {
    return ['\u2080', '\u2081', '\u2082', '\u2083'][n] || '';
  }
}
