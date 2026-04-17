import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { VECTOR_FIELDS, CURVES, lineIntegral, curl2D, diskIntegral } from './analysis-ch15-util';

@Component({
  selector: 'app-step-green-theorem',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Green 定理" subtitle="§15.6">
      <p>平面上最重要的定理——把<strong>線積分</strong>轉成<strong>面積分</strong>：</p>
      <p class="formula thm">∮_C (P dx + Q dy) = ∬_D (∂Q/∂x − ∂P/∂y) dA</p>
      <p>
        左邊：沿邊界 C 的<strong>環流量</strong>（逆時針）。<br>
        右邊：區域 D 內部 <strong>curl F</strong> 的面積分。<br>
        邊界上的環流 = 內部的旋度總和。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="驗證 Green 定理：線積分 = 面積分">
      <div class="fn-tabs">
        @for (f of fields; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.name }}</button>
        }
      </div>

      <svg viewBox="-2 -2 4 4" class="green-svg">
        @for (g of [-1,0,1]; track g) {
          <line [attr.x1]="g" y1="-2" [attr.x2]="g" y2="2" stroke="var(--border)" stroke-width="0.008" />
          <line x1="-2" [attr.y1]="g" x2="2" [attr.y2]="g" stroke="var(--border)" stroke-width="0.008" />
        }

        <!-- Filled disk -->
        <circle cx="0" cy="0" r="1" fill="rgba(var(--accent-rgb), 0.08)" stroke="none" />

        <!-- Vector field -->
        @for (a of arrows(); track a.key) {
          <line [attr.x1]="a.x" [attr.y1]="-a.y"
                [attr.x2]="a.x + a.dx * a.scale" [attr.y2]="-(a.y + a.dy * a.scale)"
                stroke="var(--text-muted)" stroke-width="0.018" stroke-opacity="0.3" />
        }

        <!-- Boundary circle -->
        <circle cx="0" cy="0" r="1" fill="none" stroke="var(--accent)" stroke-width="0.04" />

        <!-- Direction arrows on boundary -->
        @for (a of boundaryArrows; track $index) {
          <circle [attr.cx]="a.x + a.dx * 0.12" [attr.cy]="-(a.y + a.dy * 0.12)"
                  r="0.025" fill="var(--accent)" />
        }

        <text x="0" y="0.05" text-anchor="middle" fill="var(--text-muted)" font-size="0.12">D</text>
        <text x="1.15" y="-0.1" fill="var(--accent)" font-size="0.1">C</text>
      </svg>

      <div class="verify-box">
        <div class="v-row">
          <span class="v-label">∮_C F · dr =</span>
          <span class="v-val">{{ lineVal().toFixed(4) }}</span>
        </div>
        <div class="v-eq">=</div>
        <div class="v-row">
          <span class="v-label">∬_D curl F dA =</span>
          <span class="v-val">{{ areaVal().toFixed(4) }}</span>
        </div>
        <div class="v-check" [class.ok]="Math.abs(lineVal() - areaVal()) < 0.05">
          {{ Math.abs(lineVal() - areaVal()) < 0.05 ? 'Green 定理 ✓' : '數值誤差' }}
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        試旋轉場 (−y, x)：curl = 2，面積 = π → ∬ curl dA = 2π = ∮ F·dr。完美吻合！
        輻射場 (x, y)：curl = 0 → ∮ = 0。保守場的閉路積分為零正是 Green 定理的推論。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.thm { border: 2px solid var(--accent); } }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .green-svg { width: 100%; max-width: 380px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .verify-box { padding: 14px; border-radius: 10px; background: var(--bg-surface); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;
      font-family: 'JetBrains Mono', monospace; }
    .v-row { text-align: center; }
    .v-label { font-size: 12px; color: var(--text-muted); display: block; }
    .v-val { font-size: 18px; font-weight: 700; color: var(--accent); }
    .v-eq { font-size: 20px; font-weight: 700; color: var(--accent); }
    .v-check { padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;
      &.ok { background: rgba(90,138,90,0.1); color: #5a8a5a; } }
  `,
})
export class StepGreenTheoremComponent {
  readonly Math = Math;
  readonly fields = VECTOR_FIELDS;
  readonly sel = signal(0);

  readonly lineVal = computed(() => lineIntegral(VECTOR_FIELDS[this.sel()].F, CURVES[0]));
  readonly areaVal = computed(() => {
    const F = VECTOR_FIELDS[this.sel()].F;
    return diskIntegral((x, y) => curl2D(F, x, y), 0, 0, 1, 60, 60);
  });

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

  readonly boundaryArrows = (() => {
    const result: { x: number; y: number; dx: number; dy: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const t = (2 * Math.PI * i) / 12;
      result.push({ x: Math.cos(t), y: Math.sin(t), dx: -Math.sin(t), dy: Math.cos(t) });
    }
    return result;
  })();
}
