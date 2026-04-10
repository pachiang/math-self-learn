import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-multivariable-limits',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="多變數函數的極限與連續" subtitle="§13.2">
      <p>
        一變數：x → c 只有左和右兩個方向。
        多變數：(x,y) → (a,b) 可以從<strong>任何方向</strong>逼近——
        而且「沿每條路徑都收斂」不保證極限存在！
      </p>
      <p class="formula">
        lim f(x,y) = L ⟺ ∀ε > 0, ∃δ > 0:<br />
        ||(x,y) − (a,b)|| &lt; δ ⟹ |f(x,y) − L| &lt; ε
      </p>
    </app-prose-block>

    <app-challenge-card prompt="經典反例：沿不同路徑逼近 (0,0) 得到不同極限">
      <div class="example-card bad">
        <div class="ec-title">f(x,y) = xy/(x² + y²)，(x,y) → (0,0)</div>
        <div class="ec-paths">
          <div class="path-row">
            <span class="path-name">沿 y = 0：</span>
            <span class="path-val">f(x, 0) = 0 → 0</span>
          </div>
          <div class="path-row">
            <span class="path-name">沿 y = x：</span>
            <span class="path-val">f(x, x) = x²/(2x²) = 1/2 → 1/2</span>
          </div>
          <div class="path-row">
            <span class="path-name">沿 y = 2x：</span>
            <span class="path-val">f(x, 2x) = 2x²/(5x²) = 2/5 → 2/5</span>
          </div>
        </div>
        <div class="ec-verdict">
          沿不同路徑得到不同值 → <strong>極限不存在</strong>
        </div>
      </div>

      <div class="example-card ok">
        <div class="ec-title">f(x,y) = (x² y)/(x⁴ + y²)，(x,y) → (0,0)</div>
        <div class="ec-paths">
          <div class="path-row">
            <span class="path-name">沿任何直線 y = mx：</span>
            <span class="path-val">→ 0（全部！）</span>
          </div>
          <div class="path-row">
            <span class="path-name">沿拋物線 y = x²：</span>
            <span class="path-val">f(x, x²) = x⁴/(2x⁴) = 1/2 → 1/2</span>
          </div>
        </div>
        <div class="ec-verdict bad">
          直線全部給 0，但拋物線給 1/2 → <strong>極限還是不存在</strong>！
          沿所有直線收斂<strong>不夠</strong>。
        </div>
      </div>

      <div class="lesson">
        多變數的極限比一變數<strong>困難得多</strong>。
        要證明極限存在，必須用 ε-δ（對所有方向同時成立），不能只檢查特定路徑。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看多變數函數的<strong>偏導數</strong>——一次只對一個變數微分。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8; }
    .example-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      margin-bottom: 10px;
      &.ok { background: rgba(90,138,90,0.03); }
      &.bad { background: rgba(160,90,90,0.03); } }
    .ec-title { font-size: 14px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; }
    .ec-paths { margin-bottom: 8px; }
    .path-row { display: flex; gap: 10px; padding: 4px 0; font-size: 13px; }
    .path-name { color: var(--text-muted); min-width: 100px; }
    .path-val { color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .ec-verdict { font-size: 13px; font-weight: 600; padding: 8px 12px; border-radius: 6px;
      &.bad, .bad & { color: #a05a5a; background: rgba(160,90,90,0.06); }
      strong { color: #a05a5a; } }
    .example-card.ok .ec-verdict { color: #a05a5a; background: rgba(160,90,90,0.06); }
    .lesson { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--accent-10); border-radius: 8px; margin-top: 10px;
      strong { color: var(--accent); } }
  `,
})
export class StepMultivariableLimitsComponent {}
