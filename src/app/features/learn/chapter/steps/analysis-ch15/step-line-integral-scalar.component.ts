import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { CURVES } from './analysis-ch15-util';

@Component({
  selector: 'app-step-line-integral-scalar',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="標量線積分" subtitle="§15.2">
      <p>
        <strong>標量線積分</strong>：沿曲線 C 積分一個純量函數 f：
      </p>
      <p class="formula">∫_C f ds = ∫ₐᵇ f(r(t)) |r'(t)| dt</p>
      <p>
        ds = |r'(t)|dt 是<strong>弧長微元</strong>。
        如果 f = 1，就是曲線的<strong>長度</strong>。如果 f 代表密度，就是<strong>質量</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 t 沿曲線走，看弧長如何累積">
      <div class="fn-tabs">
        @for (c of curves; track c.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ c.name }}</button>
        }
      </div>

      <div class="ctrl-row">
        <span class="cl">t = {{ tVal().toFixed(2) }}</span>
        <input type="range" [min]="currentCurve().tRange[0]" [max]="currentCurve().tRange[1]"
               step="0.01" [value]="tVal()"
               (input)="tVal.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-2 -2 4 4" class="curve-svg">
        <line x1="-2" y1="0" x2="2" y2="0" stroke="var(--border)" stroke-width="0.01" />
        <line x1="0" y1="-2" x2="0" y2="2" stroke="var(--border)" stroke-width="0.01" />

        <!-- Full curve (faded) -->
        <path [attr.d]="fullPath()" fill="none" stroke="var(--text-muted)" stroke-width="0.02" stroke-dasharray="0.04 0.03" />

        <!-- Traced portion -->
        <path [attr.d]="tracedPath()" fill="none" stroke="var(--accent)" stroke-width="0.04" />

        <!-- Current point -->
        <circle [attr.cx]="currentPoint()[0]" [attr.cy]="-currentPoint()[1]" r="0.06"
                fill="var(--accent)" stroke="white" stroke-width="0.02" />
      </svg>

      <div class="info-row">
        <div class="i-card">位置 ({{ currentPoint()[0].toFixed(2) }}, {{ currentPoint()[1].toFixed(2) }})</div>
        <div class="i-card accent">弧長 = {{ arcLength().toFixed(4) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        標量線積分不在乎方向——正向走和反向走的長度一樣。
        下一節看<strong>向量線積分</strong>——方向很重要！
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 13px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 70px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .curve-svg { width: 100%; max-width: 380px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .info-row { display: flex; gap: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
  `,
})
export class StepLineIntegralScalarComponent {
  readonly curves = CURVES;
  readonly sel = signal(0);
  readonly tVal = signal(Math.PI);
  readonly currentCurve = computed(() => CURVES[this.sel()]);
  readonly currentPoint = computed(() => this.currentCurve().r(this.tVal()));

  readonly arcLength = computed(() => {
    const c = this.currentCurve();
    const t0 = c.tRange[0];
    const t1 = Math.min(this.tVal(), c.tRange[1]);
    const steps = 300;
    const dt = (t1 - t0) / steps;
    let len = 0;
    for (let i = 0; i < steps; i++) {
      const t = t0 + (i + 0.5) * dt;
      const [dx, dy] = c.dr(t);
      len += Math.sqrt(dx * dx + dy * dy) * dt;
    }
    return len;
  });

  fullPath(): string {
    const c = this.currentCurve();
    const [t0, t1] = c.tRange;
    const steps = 200;
    let path = '';
    for (let i = 0; i <= steps; i++) {
      const t = t0 + (t1 - t0) * i / steps;
      const [x, y] = c.r(t);
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${(-y).toFixed(4)}`;
    }
    return path;
  }

  tracedPath(): string {
    const c = this.currentCurve();
    const t0 = c.tRange[0];
    const t1 = Math.min(this.tVal(), c.tRange[1]);
    const steps = 200;
    let path = '';
    for (let i = 0; i <= steps; i++) {
      const t = t0 + (t1 - t0) * i / steps;
      const [x, y] = c.r(t);
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${(-y).toFixed(4)}`;
    }
    return path;
  }
}
