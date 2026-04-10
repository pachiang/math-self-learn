import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-dual-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="對偶空間 V*" subtitle="§18.2">
      <p>
        V 上所有線性泛函的集合叫做 <strong>V*</strong>（V 的對偶空間）。
      </p>
      <p>
        V* 本身也是一個向量空間：
      </p>
      <ul>
        <li>加法：(φ₁ + φ₂)(v) = φ₁(v) + φ₂(v)</li>
        <li>純量乘法：(cφ)(v) = c · φ(v)</li>
      </ul>
      <p>
        而且 <strong>dim(V*) = dim(V)</strong>。R² 的對偶空間也是 2 維的。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="V 和 V* 的比較">
      <div class="compare-table">
        <table class="cmp">
          <thead>
            <tr><th></th><th>V（向量空間）</th><th>V*（對偶空間）</th></tr>
          </thead>
          <tbody>
            <tr>
              <th>元素</th>
              <td>行向量 v = [x, y]ᵀ</td>
              <td>列向量 φ = [a, b]</td>
            </tr>
            <tr>
              <th>幾何</th>
              <td>一個<strong>箭頭</strong>（方向 + 長度）</td>
              <td>一族<strong>平行線</strong>（等值線）</td>
            </tr>
            <tr>
              <th>維度</th>
              <td>n</td>
              <td>n（一樣！）</td>
            </tr>
            <tr>
              <th>自然同構？</th>
              <td colspan="2" class="center">
                V ≅ V* <strong>不自然</strong>（需要選基底或內積）
              </td>
            </tr>
            <tr>
              <th>有內積時</th>
              <td colspan="2" class="center">
                Riesz 表示定理：φ(v) = ⟨w, v⟩，w 是唯一的 →
                <strong>有了內積才能「把列向量當箭頭畫」</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="key-insight">
        <div class="ki-title">為什麼區分 V 和 V* 很重要？</div>
        <div class="ki-body">
          <p>
            在歐幾里德空間裡（有標準內積），V 和 V* 看起來「一模一樣」——
            因為內積提供了自然對應。所以很多教科書不特別區分。
          </p>
          <p>
            但在<strong>沒有內積</strong>的情形（抽象向量空間、廣義相對論、微分幾何）裡，
            V 和 V* 是完全不同的東西。搞混它們會導致物理公式出錯。
          </p>
          <p>
            即使在歐幾里德空間裡，理解 V* 也能讓你看懂<strong>轉置的真正意義</strong>——
            這是第四節的主題。
          </p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        V 和 V* 大小一樣但不一樣。那選一組 V 的基底之後，
        V* 裡有沒有一組<strong>自然配對</strong>的基底？有——叫<strong>對偶基底</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .compare-table { margin-bottom: 14px; overflow-x: auto; }
    .cmp { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cmp th { padding: 8px 10px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); background: var(--bg-surface); font-weight: 600; }
    .cmp td { padding: 8px 10px; border-bottom: 1px solid var(--border);
      color: var(--text-secondary); line-height: 1.6;
      strong { color: var(--text); }
      &.center { text-align: center; } }

    .key-insight { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); }
    .ki-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .ki-body { font-size: 12px; color: var(--text-secondary); line-height: 1.7;
      p { margin: 6px 0; }
      strong { color: var(--text); } }
  `,
})
export class StepDualSpaceComponent {}
