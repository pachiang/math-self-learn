import { Component, computed, signal } from '@angular/core';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { Vec2, dot2, projectOntoDirection2 } from './lstsq-util';

const DIRECTION: Vec2 = [2, 1];

@Component({
  selector: 'app-step-column-space-projection',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="投影到 Column Space" subtitle="§16.2">
      <p>
        least squares 的幾何核心只有一句話：
        <strong>找 AxHat，使它成為 b 在 C(A) 上的投影</strong>。
      </p>
      <p>
        如果 A 的 column space 只是一條線，那最佳近似點就是 b 落到那條線上的垂足；
        剩下來的殘差 r = b - AxHat 必須和那條線垂直。
      </p>
      <p class="formula">b = p + r，且 p 在 C(A) 中，r 與 C(A) 正交</p>
    </app-prose-block>

    <app-challenge-card prompt="拖動向量 b，觀察投影點 p 和殘差 r">
      <div class="plot-wrap">
        <svg viewBox="-150 -130 300 260" class="plot">
          @for (g of grid; track g) {
            <line x1="-130" [attr.y1]="g" x2="130" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" y1="-110" [attr.x2]="g" y2="110" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-140" y1="0" x2="140" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-120" x2="0" y2="120" stroke="var(--border-strong)" stroke-width="0.8" />

          <line
            [attr.x1]="-direction[0] * 55"
            [attr.y1]="direction[1] * 55"
            [attr.x2]="direction[0] * 55"
            [attr.y2]="-direction[1] * 55"
            stroke="var(--accent)"
            stroke-width="5.5"
            opacity="0.22"
          />

          <line x1="0" y1="0" [attr.x2]="svgBx()" [attr.y2]="svgBy()" stroke="var(--v1)" stroke-width="3" marker-end="url(#tip-b)" />
          <line x1="0" y1="0" [attr.x2]="svgPx()" [attr.y2]="svgPy()" stroke="#5a8a5a" stroke-width="3" marker-end="url(#tip-p)" />
          <line [attr.x1]="svgPx()" [attr.y1]="svgPy()" [attr.x2]="svgBx()" [attr.y2]="svgBy()" stroke="#a05a5a" stroke-width="2.2" marker-end="url(#tip-r)" />

          <circle [attr.cx]="svgBx()" [attr.cy]="svgBy()" r="5.5" fill="var(--v1)" stroke="white" stroke-width="1.4" />
          <circle [attr.cx]="svgPx()" [attr.cy]="svgPy()" r="5.2" fill="#5a8a5a" stroke="white" stroke-width="1.4" />

          <text [attr.x]="svgBx() + 8" [attr.y]="svgBy() - 8" class="lab" fill="var(--v1)">b</text>
          <text [attr.x]="svgPx() + 8" [attr.y]="svgPy() - 8" class="lab" fill="#5a8a5a">p</text>
          <text [attr.x]="svgBx() - 18" [attr.y]="svgBy() + 18" class="lab" fill="#a05a5a">r</text>

          <defs>
            <marker id="tip-b" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="var(--v1)" />
            </marker>
            <marker id="tip-p" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="#5a8a5a" />
            </marker>
            <marker id="tip-r" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="#a05a5a" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="slider-box">
        <div class="row">
          <span class="lab">b1</span>
          <input type="range" min="-4" max="4" step="0.1" [value]="bx()" (input)="bx.set(+$any($event).target.value)" />
          <span class="val">{{ bx().toFixed(1) }}</span>
        </div>
        <div class="row">
          <span class="lab">b2</span>
          <input type="range" min="-4" max="4" step="0.1" [value]="by()" (input)="by.set(+$any($event).target.value)" />
          <span class="val">{{ by().toFixed(1) }}</span>
        </div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">方向</span>
          <span class="iv">a = (2, 1)</span>
        </div>
        <div class="info-row">
          <span class="il">投影</span>
          <span class="iv">p = ({{ projection()[0].toFixed(2) }}, {{ projection()[1].toFixed(2) }})</span>
        </div>
        <div class="info-row">
          <span class="il">殘差</span>
          <span class="iv">r = ({{ residual()[0].toFixed(2) }}, {{ residual()[1].toFixed(2) }})</span>
        </div>
        <div class="info-row big">
          <span class="il">正交檢查</span>
          <span class="iv">a · r = {{ orthogonality().toFixed(4) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        對一般矩陣來說，C(A) 不一定是一條線，也可能是平面或更高維子空間。
        但原理完全一樣：AxHat 是投影，r = b - AxHat 與整個 column space 正交。
      </p>
      <span class="hint">
        下一節把這句幾何話翻成代數式，就會得到 normal equations。
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 12px; background: var(--accent-10);
      border-radius: 8px; margin: 10px 0; }
    .plot-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .plot { width: 100%; max-width: 360px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .lab { font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .slider-box { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .row { display: grid; grid-template-columns: 28px 1fr 48px; gap: 10px; align-items: center; }
    .val { text-align: right; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .lab { color: var(--accent); }
    input { accent-color: var(--accent); }
    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 88px 1fr; border-bottom: 1px solid var(--border); }
    .info-row:last-child { border-bottom: none; }
    .info-row.big { background: var(--accent-10); }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface); border-right: 1px solid var(--border); }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepColumnSpaceProjectionComponent {
  readonly direction = DIRECTION;
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly bx = signal(3.2);
  readonly by = signal(2.4);
  readonly target = computed<Vec2>(() => [this.bx(), this.by()]);
  readonly projData = computed(() =>
    projectOntoDirection2(this.target(), this.direction),
  );
  readonly projection = computed(() => this.projData().projection);
  readonly residual = computed(() => this.projData().residual);
  readonly orthogonality = computed(() => dot2(this.direction, this.residual()));

  svgBx = computed(() => this.bx() * 25);
  svgBy = computed(() => -this.by() * 25);
  svgPx = computed(() => this.projection()[0] * 25);
  svgPy = computed(() => -this.projection()[1] * 25);
}