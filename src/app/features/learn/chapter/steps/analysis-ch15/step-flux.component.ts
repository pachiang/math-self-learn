import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { VECTOR_FIELDS, div2D, diskIntegral } from './analysis-ch15-util';

@Component({
  selector: 'app-step-flux',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="通量與散度定理（2D）" subtitle="§15.8">
      <p>
        <strong>通量</strong>：向量場穿過曲線的「流量」。Green 定理的<strong>散度版本</strong>：
      </p>
      <p class="formula thm">∮_C F · n ds = ∬_D div F dA</p>
      <p>
        左邊：穿過邊界的通量（n 是外法向量）。<br>
        右邊：內部散度的總和。源 → 正通量，匯 → 負通量。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選向量場，比較通量和散度的面積分">
      <div class="fn-tabs">
        @for (f of fields; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.name }}</button>
        }
      </div>

      <svg viewBox="-2 -2 4 4" class="flux-svg">
        @for (g of [-1,0,1]; track g) {
          <line [attr.x1]="g" y1="-2" [attr.x2]="g" y2="2" stroke="var(--border)" stroke-width="0.008" />
          <line x1="-2" [attr.y1]="g" x2="2" [attr.y2]="g" stroke="var(--border)" stroke-width="0.008" />
        }

        <circle cx="0" cy="0" r="1" fill="rgba(var(--accent-rgb), 0.06)" stroke="var(--accent)" stroke-width="0.03" />

        <!-- Normal vectors (outward) on boundary -->
        @for (n of normalArrows; track $index) {
          <line [attr.x1]="n.x" [attr.y1]="-n.y"
                [attr.x2]="n.x * 1.25" [attr.y2]="-n.y * 1.25"
                stroke="#bf8a5a" stroke-width="0.025" />
          <circle [attr.cx]="n.x * 1.25" [attr.cy]="-n.y * 1.25" r="0.025" fill="#bf8a5a" />
        }

        <!-- Field arrows -->
        @for (a of arrows(); track a.key) {
          <line [attr.x1]="a.x" [attr.y1]="-a.y"
                [attr.x2]="a.x + a.dx * a.scale" [attr.y2]="-(a.y + a.dy * a.scale)"
                stroke="var(--text-muted)" stroke-width="0.018" stroke-opacity="0.3" />
        }
      </svg>

      <div class="verify-box">
        <div class="v-row">
          <span class="v-label">∮ F·n ds =</span>
          <span class="v-val">{{ fluxVal().toFixed(4) }}</span>
        </div>
        <div class="v-eq">=</div>
        <div class="v-row">
          <span class="v-label">∬ div F dA =</span>
          <span class="v-val">{{ divAreaVal().toFixed(4) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        輻射場 (x,y) 的 div = 2 → 通量 = 2π（全部向外流出）。
        旋轉場 (−y,x) 的 div = 0 → 通量 = 0（只繞圈不流出）。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.thm { border: 2px solid var(--accent); } }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .flux-svg { width: 100%; max-width: 360px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .verify-box { padding: 14px; border-radius: 10px; background: var(--bg-surface); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;
      font-family: 'JetBrains Mono', monospace; }
    .v-row { text-align: center; }
    .v-label { font-size: 12px; color: var(--text-muted); display: block; }
    .v-val { font-size: 18px; font-weight: 700; color: var(--accent); }
    .v-eq { font-size: 20px; font-weight: 700; color: var(--accent); }
  `,
})
export class StepFluxComponent {
  readonly fields = VECTOR_FIELDS;
  readonly sel = signal(0);

  readonly fluxVal = computed(() => {
    const F = VECTOR_FIELDS[this.sel()].F;
    const steps = 500;
    const dt = (2 * Math.PI) / steps;
    let sum = 0;
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) * dt;
      const x = Math.cos(t), y = Math.sin(t);
      const [fx, fy] = F(x, y);
      // Outward normal on unit circle = (cos t, sin t), ds = dt
      sum += (fx * x + fy * y) * dt;
    }
    return sum;
  });

  readonly divAreaVal = computed(() => {
    const F = VECTOR_FIELDS[this.sel()].F;
    return diskIntegral((x, y) => div2D(F, x, y), 0, 0, 1, 60, 60);
  });

  readonly normalArrows = (() => {
    const result: { x: number; y: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const t = (2 * Math.PI * i) / 12;
      result.push({ x: Math.cos(t), y: Math.sin(t) });
    }
    return result;
  })();

  readonly arrows = computed(() => {
    const F = VECTOR_FIELDS[this.sel()].F;
    const result: { key: string; x: number; y: number; dx: number; dy: number; scale: number }[] = [];
    for (let x = -1.8; x <= 1.8; x += 0.5) {
      for (let y = -1.8; y <= 1.8; y += 0.5) {
        const [fx, fy] = F(x, y);
        const mag = Math.sqrt(fx * fx + fy * fy);
        const scale = mag > 0 ? Math.min(0.25, 0.25 / Math.max(1, mag)) : 0;
        result.push({ key: `${x},${y}`, x, y, dx: fx, dy: fy, scale });
      }
    }
    return result;
  });
}
