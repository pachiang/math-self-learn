import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch2-conditional',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="條件機率：把世界縮到一塊" subtitle="§2.1">
      <p>
        「已知某事發生，另一件事的機率是多少？」 這就是條件機率。
      </p>
      <div class="centered-eq big">
        P(B | A) = P(A ∩ B) / P(A), &nbsp; P(A) &gt; 0
      </div>
      <p class="key-idea">
        幾何上：把樣本空間「縮」到 A 裡，
        再在這個縮小的空間問 B 的比例。
        P(B|A) 其實就是<strong>「在 A 中的 B 比例」</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="互動：移動格子，看條件機率如何變化">
      <div class="grid-wrap">
        <svg viewBox="-10 -10 320 320" class="g-svg">
          <rect x="0" y="0" width="300" height="300" fill="var(--bg)" stroke="var(--border-strong)" stroke-width="1.5" />
          <!-- Event A rectangle -->
          <rect [attr.x]="0" [attr.y]="0" [attr.width]="aWidth() * 300" height="300"
            fill="rgba(90, 138, 168, 0.2)" stroke="#5a8aa8" stroke-width="1.5" />
          <!-- Event B rectangle -->
          <rect [attr.x]="0" [attr.y]="0" width="300" [attr.height]="bHeight() * 300"
            fill="rgba(200, 123, 94, 0.2)" stroke="#c87b5e" stroke-width="1.5" />
          <!-- Intersection emphasized -->
          <rect [attr.x]="0" [attr.y]="0" [attr.width]="aWidth() * 300" [attr.height]="bHeight() * 300"
            fill="rgba(244, 200, 102, 0.4)" stroke="#ba8d2a" stroke-width="2" />

          <text x="150" y="-4" class="l" text-anchor="middle">樣本空間 Ω (面積=1)</text>
          <text [attr.x]="(aWidth() * 300) / 2" [attr.y]="bHeight() * 300 / 2 + 3" class="ll" text-anchor="middle">A ∩ B</text>
        </svg>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">P(A)</span>
          <input type="range" min="0.05" max="0.95" step="0.01" [value]="aWidth()"
            (input)="aWidth.set(+$any($event).target.value)" />
          <span class="sl-val">{{ aWidth().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">P(B)</span>
          <input type="range" min="0.05" max="0.95" step="0.01" [value]="bHeight()"
            (input)="bHeight.set(+$any($event).target.value)" />
          <span class="sl-val">{{ bHeight().toFixed(2) }}</span>
        </div>
      </div>

      <div class="calc-box">
        <div class="calc-row"><span>P(A)</span><span class="cv">{{ aWidth().toFixed(3) }}</span></div>
        <div class="calc-row"><span>P(B)</span><span class="cv">{{ bHeight().toFixed(3) }}</span></div>
        <div class="calc-row"><span>P(A∩B) = P(A)·P(B)</span><span class="cv">{{ (aWidth() * bHeight()).toFixed(3) }}</span></div>
        <div class="calc-row big"><span>P(B | A) = P(A∩B) / P(A)</span><span class="cv">{{ bHeight().toFixed(3) }}</span></div>
        <div class="calc-note">
          當 A 與 B 獨立時，P(B|A) = P(B)——「已知 A」不改變對 B 的信念。
          這裡的矩形版本 A、B 永遠獨立（因為軸向平行）。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>獨立的正式定義</h4>
      <div class="centered-eq">
        A, B 獨立 ⟺ P(A∩B) = P(A)·P(B) ⟺ P(B|A) = P(B)
      </div>
      <p>
        三個等價條件。中間那個最基本、不要求 P(A) &gt; 0。
      </p>

      <h4>獨立是個強假設</h4>
      <p>
        「沒理由相關」就算獨立？<strong>不！</strong> 獨立要公式嚴格成立。
        例：從一副牌抽一張，「紅色」 vs 「人頭」——獨立嗎？
      </p>
      <ul class="check">
        <li>P(紅) = 26/52 = 1/2</li>
        <li>P(人頭) = 12/52 = 3/13</li>
        <li>P(紅∩人頭) = 6/52 = 3/26</li>
        <li>P(紅)·P(人頭) = 1/2 × 3/13 = 3/26 ✓</li>
      </ul>
      <p>剛好相等 → <strong>獨立</strong>。但這需要驗證，不能用直覺。</p>

      <h4>乘法規則：從條件推聯合</h4>
      <div class="centered-eq big">
        P(A ∩ B) = P(A) · P(B | A) = P(B) · P(A | B)
      </div>
      <p>
        鏈式推廣：P(A₁∩A₂∩⋯∩Aₙ) = P(A₁)·P(A₂|A₁)·P(A₃|A₁∩A₂)·⋯
        這是所有「序列決策」類問題的骨架。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        條件機率 = 把世界縮到某事件內部重新計算比例。
        乘法規則讓我們把聯合機率拆成條件機率的鏈。
        下一節引入 Bayes 定理，把條件<strong>反過來</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .grid-wrap { text-align: center; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .g-svg { width: 360px; max-width: 100%; }
    .l { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .ll { font-size: 11px; fill: #ba8d2a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; display: grid; gap: 6px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 46px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .calc-box { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .calc-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .calc-row.big { border-top: 1px solid var(--border); margin-top: 6px; padding-top: 8px; font-weight: 700; color: var(--accent); }
    .cv { color: var(--accent); font-weight: 700; }
    .calc-note { margin-top: 8px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .calc-note strong { color: var(--accent); }

    .check { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .check strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh2ConditionalComponent {
  readonly aWidth = signal(0.4);
  readonly bHeight = signal(0.3);
}
