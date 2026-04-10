import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-covectors-physics',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="協變量與梯度" subtitle="§18.6">
      <p>
        在物理裡，<strong>梯度 ∇f</strong> 通常被畫成一個箭頭——
        指向「函數增長最快的方向」。但嚴格來說，梯度是一個<strong>協變量</strong>（covector），
        不是向量。
      </p>
      <p>
        原因：梯度的定義是 df(v) = v 方向的方向導數。
        它<strong>吃一個方向向量，吐出一個數</strong>——這就是線性泛函的定義。
      </p>
      <p>
        只有在有<strong>度量</strong>（內積）的情況下，才能把協變量「升指標」變成箭頭。
        在歐幾里德空間裡度量是恆等的，所以看不出差別。
        但在彎曲空間裡（廣義相對論），區分向量和協變量是必須的。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="一個 2D 純量場：等高線 = 協變量的幾何，箭頭 = 用度量轉換後的梯度">
      <div class="toggle-row">
        <label class="toggle">
          <input type="checkbox" [checked]="showArrow()" (change)="showArrow.set(!showArrow())" />
          <span>顯示梯度「箭頭」（需要度量）</span>
        </label>
      </div>

      <svg viewBox="-3 -3 6 6" class="field-svg">
        <!-- Contour lines of f(x,y) = x² + 0.5*y² -->
        @for (level of contourLevels; track level) {
          <ellipse cx="0" cy="0"
                   [attr.rx]="Math.sqrt(level)" [attr.ry]="Math.sqrt(level * 2)"
                   fill="none" stroke="var(--text-muted)"
                   [attr.stroke-width]="0.02"
                   [attr.stroke-opacity]="0.2 + level * 0.05" />
        }

        <!-- Probe point -->
        <circle [attr.cx]="px()" [attr.cy]="py()" r="0.1"
                fill="var(--accent)" stroke="white" stroke-width="0.03" cursor="grab" />

        <!-- Covector: show as closely-spaced local level lines at the probe point -->
        @for (offset of localOffsets; track offset) {
          <line [attr.x1]="px() + perpX() * offset - tangentX() * 0.5"
                [attr.y1]="py() + perpY() * offset - tangentY() * 0.5"
                [attr.x2]="px() + perpX() * offset + tangentX() * 0.5"
                [attr.y2]="py() + perpY() * offset + tangentY() * 0.5"
                stroke="#c8983b" stroke-width="0.03" />
        }
        <text [attr.x]="px() + 0.3" [attr.y]="py() - 0.3"
              class="v-label" fill="#c8983b">df（協變量）</text>

        <!-- Gradient arrow (only with metric) -->
        @if (showArrow()) {
          <line [attr.x1]="px()" [attr.y1]="py()"
                [attr.x2]="px() + gradX() * 0.5" [attr.y2]="py() + gradY() * 0.5"
                stroke="#5a7faa" stroke-width="0.06" />
          <circle [attr.cx]="px() + gradX() * 0.5" [attr.cy]="py() + gradY() * 0.5"
                  r="0.06" fill="#5a7faa" />
          <text [attr.x]="px() + gradX() * 0.5 + 0.2" [attr.y]="py() + gradY() * 0.5 - 0.1"
                class="v-label" fill="#5a7faa">∇f（需要度量）</text>
        }
      </svg>

      <div class="ctrl-row">
        <div class="ctrl">
          <span class="cl">探針 x =</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="px()"
                 (input)="px.set(+($any($event.target)).value)" class="sl" />
        </div>
        <div class="ctrl">
          <span class="cl">y =</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="py()"
                 (input)="py.set(+($any($event.target)).value)" class="sl" />
        </div>
      </div>

      <div class="compare-box">
        <table class="cmp">
          <tr><th></th><th>協變量 df</th><th>梯度向量 ∇f</th></tr>
          <tr>
            <th>本質</th>
            <td>線性泛函（等值線的「密度」）</td>
            <td>向量（箭頭）</td>
          </tr>
          <tr>
            <th>需要度量？</th>
            <td class="no">不需要</td>
            <td class="yes">需要</td>
          </tr>
          <tr>
            <th>座標變換</th>
            <td>協變（跟基底同方向變）</td>
            <td>反變（跟基底反方向變）</td>
          </tr>
        </table>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        下一節來看這個故事最優雅的結局：<strong>雙對偶 V**</strong> 和自然同構。
      </p>
    </app-prose-block>
  `,
  styles: `
    .toggle-row { margin-bottom: 12px; }
    .toggle { font-size: 12px; color: var(--text-muted); cursor: pointer;
      display: flex; align-items: center; gap: 6px;
      input { accent-color: var(--accent); } }

    .field-svg { width: 100%; max-width: 380px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .v-label { font-size: 0.18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
    .ctrl { display: flex; align-items: center; gap: 6px; }
    .cl { font-size: 12px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .sl { width: 100px; accent-color: var(--accent); }

    .compare-box { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .cmp { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cmp th { padding: 6px 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 600; }
    .cmp td { padding: 6px 8px; border-bottom: 1px solid var(--border);
      color: var(--text-secondary);
      &.no { color: #5a8a5a; font-weight: 600; }
      &.yes { color: #c8983b; font-weight: 600; } }
  `,
})
export class StepCovectorsPhysicsComponent {
  readonly Math = Math;
  readonly showArrow = signal(false);
  readonly px = signal(1.0);
  readonly py = signal(0.8);
  readonly contourLevels = [0.5, 1, 2, 3, 4, 5, 6, 7, 8];
  readonly localOffsets = [-0.15, -0.05, 0.05, 0.15];

  // f(x,y) = x² + 0.5y² → grad = [2x, y]
  readonly gradX = computed(() => 2 * this.px());
  readonly gradY = computed(() => this.py());

  // Normal to contour (same as grad direction in Euclidean)
  readonly gradNorm = computed(() => Math.sqrt(this.gradX() ** 2 + this.gradY() ** 2) || 1);
  readonly perpX = computed(() => this.gradX() / this.gradNorm());
  readonly perpY = computed(() => this.gradY() / this.gradNorm());
  readonly tangentX = computed(() => -this.perpY());
  readonly tangentY = computed(() => this.perpX());
}
