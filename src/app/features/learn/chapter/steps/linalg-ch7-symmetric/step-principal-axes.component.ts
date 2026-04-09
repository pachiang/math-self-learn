import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const A: [[number, number], [number, number]] = [
  [3, 1.2],
  [1.2, 2],
];

@Component({
  selector: 'app-step-principal-axes',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="主軸定理" subtitle="§7.5">
      <p>
        二次型如果有交叉項，例如
      </p>
      <p class="formula">q(x, y) = 3x² + 2.4xy + 2y²</p>
      <p>
        代表現在的 x、y 軸還不是最自然的方向。對稱矩陣的神奇之處在於：
        <strong>你總能轉一個角度，讓交叉項消失</strong>。
      </p>
      <p>
        這就叫做<strong>主軸定理</strong>。在新的座標軸裡，橢圓會被轉正，矩陣也會變成對角形。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動角度，試著把試探座標軸轉到剛好貼齊橢圓主方向">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="grid-svg">
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.9" />

          <path [attr.d]="ellipsePath" fill="rgba(110,138,168,0.10)" stroke="var(--accent)" stroke-width="2.2" />

          <line [attr.x1]="-axis1X()" [attr.y1]="axis1Y()" [attr.x2]="axis1X()" [attr.y2]="-axis1Y()"
            stroke="#5a8a5a" stroke-width="2.2" [attr.opacity]="aligned() ? 1 : 0.75" />
          <line [attr.x1]="-axis2X()" [attr.y1]="axis2Y()" [attr.x2]="axis2X()" [attr.y2]="-axis2Y()"
            stroke="#8a6b5a" stroke-width="2.2" [attr.opacity]="aligned() ? 1 : 0.75" />

          <text [attr.x]="axis1X() + 8" [attr.y]="-axis1Y() - 8" class="lab" fill="#5a8a5a">x′</text>
          <text [attr.x]="axis2X() + 8" [attr.y]="-axis2Y() - 8" class="lab" fill="#8a6b5a">y′</text>
        </svg>
      </div>

      <div class="angle-row">
        <span class="angle-lab">旋轉角度 θ</span>
        <input type="range" min="0" max="180" step="1" [value]="thetaDeg()" (input)="thetaDeg.set(+$any($event).target.value)" />
        <span class="angle-val">{{ thetaDeg() }}°</span>
      </div>

      <div class="status" [class.good]="aligned()">
        @if (aligned()) {
          <strong>找到了主軸。</strong> 交叉項幾乎消失，橢圓被轉正了。
        } @else {
          <strong>還沒對齊。</strong> 試探座標軸和真正主軸之間還有一些偏差。
        }
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">RᵀAR</span>
          <span class="iv">[[{{ b11().toFixed(2) }}, {{ b12().toFixed(2) }}], [{{ b12().toFixed(2) }}, {{ b22().toFixed(2) }}]]</span>
        </div>
        <div class="info-row big">
          <span class="il">交叉項</span>
          <span class="iv">2·{{ b12().toFixed(2) }}·x′y′</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        一旦交叉項消失，二次型就會變成
      </p>
      <p class="formula">λ₁x′² + λ₂y′²</p>
      <p>
        這就是「轉到特徵向量基底」的幾何版本。從這裡再往前一步，就會得到正定矩陣與橢圓度量。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula {
      text-align: center;
      font-size: 17px;
      font-weight: 700;
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      padding: 10px 12px;
      background: var(--accent-10);
      border-radius: 8px;
      margin: 10px 0;
    }

    .grid-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
    }

    .grid-svg {
      width: 100%;
      max-width: 330px;
    }

    .lab {
      font-size: 12px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .angle-row {
      display: grid;
      grid-template-columns: 88px 1fr 44px;
      gap: 10px;
      align-items: center;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      margin-bottom: 12px;
    }

    .angle-lab {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
    }

    .angle-row input {
      accent-color: var(--accent);
    }

    .angle-val {
      font-size: 12px;
      text-align: right;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .status {
      padding: 12px 16px;
      border-radius: 8px;
      background: rgba(191, 158, 147, 0.08);
      border: 1px dashed rgba(191, 158, 147, 0.28);
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .status.good {
      background: rgba(90, 138, 90, 0.08);
      border-style: solid;
      border-color: rgba(90, 138, 90, 0.28);
    }

    .info {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .info-row {
      display: grid;
      grid-template-columns: 72px 1fr;
      border-bottom: 1px solid var(--border);

      &:last-child {
        border-bottom: none;
      }

      &.big {
        background: var(--accent-10);
      }
    }

    .il {
      padding: 8px 12px;
      font-size: 12px;
      color: var(--text-muted);
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
    }

    .iv {
      padding: 8px 12px;
      font-size: 13px;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class StepPrincipalAxesComponent {
  readonly thetaDeg = signal(0);

  readonly thetaRad = computed(() => (this.thetaDeg() * Math.PI) / 180);

  readonly axis1X = computed(() => Math.cos(this.thetaRad()) * 92);
  readonly axis1Y = computed(() => Math.sin(this.thetaRad()) * 92);
  readonly axis2X = computed(() => -Math.sin(this.thetaRad()) * 92);
  readonly axis2Y = computed(() => Math.cos(this.thetaRad()) * 92);

  readonly rotated = computed(() => {
    const c = Math.cos(this.thetaRad());
    const s = Math.sin(this.thetaRad());
    const r: [[number, number], [number, number]] = [
      [c, -s],
      [s, c],
    ];
    const rt: [[number, number], [number, number]] = [
      [c, s],
      [-s, c],
    ];
    const ra = [
      [
        rt[0][0] * A[0][0] + rt[0][1] * A[1][0],
        rt[0][0] * A[0][1] + rt[0][1] * A[1][1],
      ],
      [
        rt[1][0] * A[0][0] + rt[1][1] * A[1][0],
        rt[1][0] * A[0][1] + rt[1][1] * A[1][1],
      ],
    ] as [[number, number], [number, number]];

    return [
      [
        ra[0][0] * r[0][0] + ra[0][1] * r[1][0],
        ra[0][0] * r[0][1] + ra[0][1] * r[1][1],
      ],
      [
        ra[1][0] * r[0][0] + ra[1][1] * r[1][0],
        ra[1][0] * r[0][1] + ra[1][1] * r[1][1],
      ],
    ] as [[number, number], [number, number]];
  });

  readonly b11 = computed(() => this.rotated()[0][0]);
  readonly b12 = computed(() => this.rotated()[0][1]);
  readonly b22 = computed(() => this.rotated()[1][1]);
  readonly aligned = computed(() => Math.abs(this.b12()) < 0.05);

  readonly ellipsePath = (() => {
    const pts: string[] = [];
    for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.05) {
      const ux = Math.cos(t);
      const uy = Math.sin(t);
      const denom =
        A[0][0] * ux * ux + 2 * A[0][1] * ux * uy + A[1][1] * uy * uy;
      const r = 78 / Math.sqrt(denom);
      const x = ux * r;
      const y = -uy * r;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return 'M ' + pts.join(' L ');
  })();
}
