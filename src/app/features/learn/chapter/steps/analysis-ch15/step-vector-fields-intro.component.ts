import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { VECTOR_FIELDS, VectorField2D } from './analysis-ch15-util';

@Component({
  selector: 'app-step-vector-fields-intro',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="向量場" subtitle="§15.1">
      <p>
        <strong>向量場</strong> F：R² → R²，每個點 (x,y) 指定一個向量 F(x,y)。
      </p>
      <p>
        風速場、重力場、電場都是向量場。曲線積分就是沿著一條路徑「累加」向量場的效果。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選不同的向量場，看箭頭如何佈滿平面">
      <div class="fn-tabs">
        @for (f of fields; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.name }}</button>
        }
      </div>

      <svg viewBox="-2.5 -2.5 5 5" class="vf-svg">
        <!-- Grid -->
        @for (g of [-2,-1,0,1,2]; track g) {
          <line [attr.x1]="g" y1="-2.5" [attr.x2]="g" y2="2.5" stroke="var(--border)" stroke-width="0.01" />
          <line x1="-2.5" [attr.y1]="g" x2="2.5" [attr.y2]="g" stroke="var(--border)" stroke-width="0.01" />
        }

        <!-- Arrows -->
        @for (arrow of arrows(); track arrow.key) {
          <line [attr.x1]="arrow.x" [attr.y1]="-arrow.y"
                [attr.x2]="arrow.x + arrow.dx * arrow.scale" [attr.y2]="-(arrow.y + arrow.dy * arrow.scale)"
                stroke="var(--accent)" [attr.stroke-width]="0.03" stroke-opacity="0.7" />
          <circle [attr.cx]="arrow.x + arrow.dx * arrow.scale" [attr.cy]="-(arrow.y + arrow.dy * arrow.scale)"
                  r="0.04" fill="var(--accent)" fill-opacity="0.7" />
        }
      </svg>

      <div class="info-row">
        <div class="i-card">{{ currentField().formula }}</div>
        <div class="i-card" [class.conservative]="currentField().conservative"
             [class.nonconservative]="!currentField().conservative">
          {{ currentField().conservative ? '保守場 ✓' : '非保守場 ✗' }}
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意旋轉場的箭頭繞原點轉——它有<strong>旋度</strong>（curl）。
        輻射場的箭頭從原點向外——它是<strong>梯度場</strong>（保守場）。
        這兩種場在積分時的行為截然不同。
      </p>
    </app-prose-block>
  `,
  styles: `
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .vf-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .info-row { display: flex; gap: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.conservative { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.nonconservative { background: rgba(160,90,90,0.08); color: #a05a5a; } }
  `,
})
export class StepVectorFieldsIntroComponent {
  readonly fields = VECTOR_FIELDS;
  readonly sel = signal(0);
  readonly currentField = computed(() => VECTOR_FIELDS[this.sel()]);

  readonly arrows = computed(() => {
    const F = this.currentField().F;
    const result: { key: string; x: number; y: number; dx: number; dy: number; scale: number }[] = [];
    const step = 0.5;
    for (let x = -2; x <= 2; x += step) {
      for (let y = -2; y <= 2; y += step) {
        const [fx, fy] = F(x, y);
        const mag = Math.sqrt(fx * fx + fy * fy);
        const scale = mag > 0 ? Math.min(0.35, 0.35 / Math.max(1, mag)) : 0;
        result.push({ key: `${x},${y}`, x, y, dx: fx, dy: fy, scale });
      }
    }
    return result;
  });
}
