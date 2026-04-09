import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const INV_SQRT2 = 1 / Math.sqrt(2);
const V1: [number, number] = [INV_SQRT2, INV_SQRT2];
const V2: [number, number] = [INV_SQRT2, -INV_SQRT2];

@Component({
  selector: 'app-step-orthogonal-eigenvectors',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="正交的特徵方向" subtitle="§7.4">
      <p>
        第六章我們已經看過特徵向量：它們是「不會被轉走的方向」。
      </p>
      <p>
        對一般矩陣來說，特徵向量不一定互相垂直；但對<strong>對稱矩陣</strong>來說，
        來自不同特徵值的特徵向量會自然變成<strong>正交</strong>。
      </p>
      <p>
        這是整章的核心 miracle。因為一旦主方向互相垂直，你就真的得到一組乾淨的座標軸。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖兩個係數，觀察 A 只會沿兩條互相垂直的特徵方向各自縮放">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="grid-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.45" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.45" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.9" />

          <line x1="-95" y1="95" x2="95" y2="-95" stroke="#5a8a5a" stroke-dasharray="4 4" stroke-width="1" />
          <line x1="-95" y1="-95" x2="95" y2="95" stroke="#bf9e93" stroke-dasharray="4 4" stroke-width="1" />

          <line x1="0" y1="0" [attr.x2]="comp1X()" [attr.y2]="comp1Y()" stroke="#5a8a5a" stroke-width="2.3" />
          <line [attr.x1]="comp1X()" [attr.y1]="comp1Y()" [attr.x2]="xPx()" [attr.y2]="xPy()" stroke="#bf9e93" stroke-width="2.3" />

          <line x1="0" y1="0" [attr.x2]="xPx()" [attr.y2]="xPy()" stroke="var(--text-muted)" stroke-width="3" />
          <line x1="0" y1="0" [attr.x2]="axPx()" [attr.y2]="axPy()" stroke="var(--accent)" stroke-width="3.5" marker-end="url(#tip-oe)" />

          <text [attr.x]="comp1X() + 8" [attr.y]="comp1Y() - 6" class="lab" style="fill:#5a8a5a">c₁v₁</text>
          <text [attr.x]="xPx() + 8" [attr.y]="xPy() - 6" class="lab" fill="var(--text-muted)">x</text>
          <text [attr.x]="axPx() + 8" [attr.y]="axPy() - 6" class="lab" fill="var(--accent)">Ax</text>

          <defs>
            <marker id="tip-oe" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="sliders">
        <div class="sl">
          <span class="sl-lab eig1">c₁（沿 v₁）</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="c1()" (input)="c1.set(+$any($event).target.value)" />
          <span class="sl-val">{{ c1().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab eig2">c₂（沿 v₂）</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="c2()" (input)="c2.set(+$any($event).target.value)" />
          <span class="sl-val">{{ c2().toFixed(1) }}</span>
        </div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">矩陣</span>
          <span class="iv">A = [[2, 1], [1, 2]]</span>
        </div>
        <div class="info-row">
          <span class="il">特徵值</span>
          <span class="iv">λ₁ = 3，λ₂ = 1</span>
        </div>
        <div class="info-row">
          <span class="il">正交</span>
          <span class="iv">v₁·v₂ = {{ dot().toFixed(1) }}</span>
        </div>
        <div class="info-row big">
          <span class="il">分解</span>
          <span class="iv">x = {{ c1().toFixed(1) }}v₁ + {{ c2().toFixed(1) }}v₂，Ax = {{ (3 * c1()).toFixed(1) }}v₁ + {{ c2().toFixed(1) }}v₂</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意看：A 不會把兩條主方向混在一起。它只是把 v₁ 方向乘上 3，把 v₂ 方向乘上 1。
      </p>
      <p>
        這就暗示了一件事：如果我們乾脆把座標軸直接轉成這兩條特徵方向，
        那整個矩陣就會看起來非常簡單。
      </p>
    </app-prose-block>
  `,
  styles: `
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
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .sliders {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      margin-bottom: 12px;
    }

    .sl {
      display: grid;
      grid-template-columns: 96px 1fr 44px;
      gap: 10px;
      align-items: center;
    }

    .sl-lab {
      font-size: 12px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .eig1 {
      color: #5a8a5a;
      background: rgba(90, 138, 90, 0.12);
    }

    .eig2 {
      color: #8a6b5a;
      background: rgba(191, 158, 147, 0.12);
    }

    .sl input {
      accent-color: var(--accent);
    }

    .sl-val {
      font-size: 12px;
      text-align: right;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
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
export class StepOrthogonalEigenvectorsComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly c1 = signal(1.2);
  readonly c2 = signal(0.7);

  readonly dot = computed(() => V1[0] * V2[0] + V1[1] * V2[1]);

  readonly xVec = computed(() => [
    this.c1() * V1[0] + this.c2() * V2[0],
    this.c1() * V1[1] + this.c2() * V2[1],
  ]);

  readonly axVec = computed(() => [
    3 * this.c1() * V1[0] + this.c2() * V2[0],
    3 * this.c1() * V1[1] + this.c2() * V2[1],
  ]);

  readonly comp1X = computed(() => this.c1() * V1[0] * 42);
  readonly comp1Y = computed(() => -this.c1() * V1[1] * 42);
  readonly xPx = computed(() => this.xVec()[0] * 42);
  readonly xPy = computed(() => -this.xVec()[1] * 42);
  readonly axPx = computed(() => this.axVec()[0] * 42);
  readonly axPy = computed(() => -this.axVec()[1] * 42);
}
