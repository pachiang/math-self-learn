import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { VECTOR_FIELDS, CURVES, lineIntegral, VectorField2D, Curve2D } from './analysis-ch15-util';

@Component({
  selector: 'app-step-line-integral-vector',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="向量線積分（做功）" subtitle="§15.3">
      <p>
        <strong>向量線積分</strong>：力場 F 沿路徑 C 做的功。
      </p>
      <p class="formula">W = ∫_C F · dr = ∫ₐᵇ F(r(t)) · r'(t) dt</p>
      <p>
        F 和 dr 的<strong>點積</strong>——只有 F 沿路徑方向的分量才做功。垂直於路徑的力不做功。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選向量場和路徑，看做功的結果">
      <div class="ctrl-grid">
        <div class="ctrl-col">
          <div class="ctrl-label">向量場</div>
          @for (f of fields; track f.name; let i = $index) {
            <button class="ft" [class.active]="fieldSel() === i" (click)="fieldSel.set(i)">{{ f.name }}</button>
          }
        </div>
        <div class="ctrl-col">
          <div class="ctrl-label">路徑</div>
          @for (c of curves; track c.name; let i = $index) {
            <button class="ft" [class.active]="curveSel() === i" (click)="curveSel.set(i)">{{ c.name }}</button>
          }
        </div>
      </div>

      <svg viewBox="-2.2 -2.2 4.4 4.4" class="work-svg">
        @for (g of [-2,-1,0,1,2]; track g) {
          <line [attr.x1]="g" y1="-2.2" [attr.x2]="g" y2="2.2" stroke="var(--border)" stroke-width="0.008" />
          <line x1="-2.2" [attr.y1]="g" x2="2.2" [attr.y2]="g" stroke="var(--border)" stroke-width="0.008" />
        }

        <!-- Vector field arrows -->
        @for (a of arrows(); track a.key) {
          <line [attr.x1]="a.x" [attr.y1]="-a.y"
                [attr.x2]="a.x + a.dx * a.scale" [attr.y2]="-(a.y + a.dy * a.scale)"
                stroke="var(--text-muted)" stroke-width="0.02" stroke-opacity="0.3" />
        }

        <!-- Curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="0.04" />

        <!-- Direction arrows on curve -->
        @for (d of dirArrows(); track d.key) {
          <line [attr.x1]="d.x" [attr.y1]="-d.y"
                [attr.x2]="d.x + d.dx * 0.15" [attr.y2]="-(d.y + d.dy * 0.15)"
                stroke="#bf6e6e" stroke-width="0.03" />
          <circle [attr.cx]="d.x + d.dx * 0.15" [attr.cy]="-(d.y + d.dy * 0.15)"
                  r="0.03" fill="#bf6e6e" />
        }
      </svg>

      <div class="info-row">
        <div class="i-card">{{ currentField().formula }}</div>
        <div class="i-card">{{ currentCurve().name }}</div>
        <div class="i-card accent">W = ∫F·dr = {{ work().toFixed(4) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        試試旋轉場 + 單位圓：做功 = 2π（繞一圈累積正功）。
        但輻射場 + 單位圓：做功 = 0（F 始終垂直於圓）。
        下一節看<strong>保守場</strong>的特殊性質。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-grid { display: flex; gap: 14px; margin-bottom: 12px; }
    .ctrl-col { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .ctrl-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 2px; }
    .ft { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer; text-align: left;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .work-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .info-row { display: flex; gap: 8px; }
    .i-card { flex: 1; padding: 8px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
  `,
})
export class StepLineIntegralVectorComponent {
  readonly fields = VECTOR_FIELDS;
  readonly curves = CURVES;
  readonly fieldSel = signal(0);
  readonly curveSel = signal(0);
  readonly currentField = computed(() => VECTOR_FIELDS[this.fieldSel()]);
  readonly currentCurve = computed(() => CURVES[this.curveSel()]);
  readonly work = computed(() => lineIntegral(this.currentField().F, this.currentCurve()));

  readonly arrows = computed(() => {
    const F = this.currentField().F;
    const result: { key: string; x: number; y: number; dx: number; dy: number; scale: number }[] = [];
    for (let x = -2; x <= 2; x += 0.6) {
      for (let y = -2; y <= 2; y += 0.6) {
        const [fx, fy] = F(x, y);
        const mag = Math.sqrt(fx * fx + fy * fy);
        const scale = mag > 0 ? Math.min(0.25, 0.25 / Math.max(1, mag)) : 0;
        result.push({ key: `${x},${y}`, x, y, dx: fx, dy: fy, scale });
      }
    }
    return result;
  });

  readonly dirArrows = computed(() => {
    const c = this.currentCurve();
    const [t0, t1] = c.tRange;
    const result: { key: string; x: number; y: number; dx: number; dy: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const t = t0 + (t1 - t0) * (i + 0.5) / 8;
      const [x, y] = c.r(t);
      const [dx, dy] = c.dr(t);
      const mag = Math.sqrt(dx * dx + dy * dy);
      if (mag > 0) {
        result.push({ key: `d${i}`, x, y, dx: dx / mag, dy: dy / mag });
      }
    }
    return result;
  });

  curvePath(): string {
    const c = this.currentCurve();
    const [t0, t1] = c.tRange;
    let path = '';
    for (let i = 0; i <= 200; i++) {
      const t = t0 + (t1 - t0) * i / 200;
      const [x, y] = c.r(t);
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${(-y).toFixed(4)}`;
    }
    return path;
  }
}
