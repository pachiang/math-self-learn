import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-what-is-symmetric',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼是對稱矩陣" subtitle="§7.1">
      <p>
        一個矩陣 <strong>A</strong> 如果滿足 <strong>A = Aᵀ</strong>，就叫做
        <strong>對稱矩陣</strong>。意思很直白：
        <strong>沿著主對角線對折之後，兩邊要完全一樣</strong>。
      </p>
      <p>
        對 2×2 矩陣來說，
      </p>
      <p class="formula">A = [[a, b], [c, d]]，對稱 ⇔ b = c</p>
      <p>
        所以對稱 2×2 矩陣其實只有三個自由度：
      </p>
      <p class="formula">A = [[a, b], [b, d]]</p>
      <p>
        這不是形式上的小限制而已。從這一章開始你會看到：
        <strong>二次型、橢圓、主軸、正定矩陣</strong>，都跟這種鏡像結構直接相關。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動右上和左下兩格，觀察什麼時候 A 真的等於 Aᵀ">
      <div class="matrix-compare">
        <div class="matrix-panel">
          <div class="mp-title">A</div>
          <div class="cell-grid">
            <div class="cell diag">{{ a().toFixed(1) }}</div>
            <div class="cell off" [class.match]="isSymmetric()">{{ upper().toFixed(1) }}</div>
            <div class="cell off" [class.match]="isSymmetric()">{{ lower().toFixed(1) }}</div>
            <div class="cell diag">{{ d().toFixed(1) }}</div>
          </div>
        </div>

        <div class="equals">⇄</div>

        <div class="matrix-panel">
          <div class="mp-title">Aᵀ</div>
          <div class="cell-grid">
            <div class="cell diag">{{ a().toFixed(1) }}</div>
            <div class="cell off" [class.match]="isSymmetric()">{{ lower().toFixed(1) }}</div>
            <div class="cell off" [class.match]="isSymmetric()">{{ upper().toFixed(1) }}</div>
            <div class="cell diag">{{ d().toFixed(1) }}</div>
          </div>
        </div>
      </div>

      <div class="status" [class.good]="isSymmetric()">
        @if (isSymmetric()) {
          <strong>現在是對稱矩陣。</strong> 對角線兩側完全鏡像。
        } @else {
          <strong>還不是對稱矩陣。</strong>
          右上和左下差了 {{ gap().toFixed(1) }}。
        }
      </div>

      <div class="controls">
        <div class="ctrl">
          <span class="lab">對角線 a</span>
          <input type="range" min="-3" max="3" step="0.1" [value]="a()" (input)="a.set(+$any($event).target.value)" />
          <span class="val">{{ a().toFixed(1) }}</span>
        </div>
        <div class="ctrl">
          <span class="lab">右上 b</span>
          <input type="range" min="-3" max="3" step="0.1" [value]="upper()" (input)="upper.set(+$any($event).target.value)" />
          <span class="val">{{ upper().toFixed(1) }}</span>
        </div>
        <div class="ctrl">
          <span class="lab">左下 c</span>
          <input type="range" min="-3" max="3" step="0.1" [value]="lower()" (input)="lower.set(+$any($event).target.value)" />
          <span class="val">{{ lower().toFixed(1) }}</span>
        </div>
        <div class="ctrl">
          <span class="lab">對角線 d</span>
          <input type="range" min="-3" max="3" step="0.1" [value]="d()" (input)="d.set(+$any($event).target.value)" />
          <span class="val">{{ d().toFixed(1) }}</span>
        </div>
      </div>

      <div class="actions">
        <button class="action-btn" (click)="copyUpperToLower()">設成對稱</button>
        <button class="action-btn" (click)="setMismatch()">故意打破對稱</button>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">判斷</span>
          <span class="iv">A = Aᵀ ⇔ a₁₂ = a₂₁</span>
        </div>
        <div class="info-row big">
          <span class="il">2×2 形式</span>
          <span class="iv">[[{{ a().toFixed(1) }}, b], [b, {{ d().toFixed(1) }}]]</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        對稱矩陣最重要的地方，不是「看起來整齊」而已，而是它很自然地會產生一個數：
      </p>
      <p class="formula">xᵀAx</p>
      <p>
        這個數可以被解讀成高度、能量、曲率或距離的代價。下一節我們就把
        <strong>矩陣變成一個會輸出數值的幾何機器</strong>。
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

    .matrix-compare {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 14px;
      align-items: center;
      margin-bottom: 14px;
    }

    .matrix-panel {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .mp-title {
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      color: var(--text-secondary);
      margin-bottom: 10px;
      font-family: 'JetBrains Mono', monospace;
    }

    .cell-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .cell {
      padding: 14px 10px;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      background: var(--bg-surface);
      border: 1px solid var(--border);
    }

    .cell.diag {
      background: rgba(191, 158, 147, 0.08);
    }

    .cell.off {
      background: rgba(110, 138, 168, 0.08);
    }

    .cell.off.match {
      background: rgba(90, 138, 90, 0.12);
      border-color: rgba(90, 138, 90, 0.28);
      color: #4e7b4e;
    }

    .equals {
      font-size: 24px;
      font-weight: 700;
      color: var(--accent);
    }

    .status {
      padding: 12px 16px;
      border-radius: 8px;
      background: rgba(160, 90, 90, 0.06);
      border: 1px dashed rgba(160, 90, 90, 0.25);
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 14px;
    }

    .status.good {
      background: rgba(90, 138, 90, 0.08);
      border-style: solid;
      border-color: rgba(90, 138, 90, 0.28);
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .ctrl {
      display: grid;
      grid-template-columns: 88px 1fr 44px;
      gap: 10px;
      align-items: center;
    }

    .lab {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary);
    }

    .ctrl input {
      accent-color: var(--accent);
    }

    .val {
      font-size: 12px;
      text-align: right;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 7px;
      background: transparent;
      color: var(--text-secondary);
      font-size: 12px;
      cursor: pointer;

      &:hover {
        background: var(--accent-10);
        color: var(--accent);
        border-color: var(--accent-30);
      }
    }

    .info {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .info-row {
      display: grid;
      grid-template-columns: 88px 1fr;
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
export class StepWhatIsSymmetricComponent {
  readonly a = signal(2);
  readonly upper = signal(1);
  readonly lower = signal(1);
  readonly d = signal(1);

  readonly gap = computed(() => Math.abs(this.upper() - this.lower()));
  readonly isSymmetric = computed(() => this.gap() < 0.001);

  copyUpperToLower(): void {
    this.lower.set(this.upper());
  }

  setMismatch(): void {
    this.lower.set(this.upper() + 1.2);
  }
}
